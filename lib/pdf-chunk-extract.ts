import pdfParse from "pdf-parse/lib/pdf-parse.js";

export type PdfChunkPageText = {
  page: number;
  text: string;
};

type PdfChunkResult = {
  success: boolean;
  text: string;
  startPage: number;
  endPage: number;
  totalPages: number;
  pageTexts: PdfChunkPageText[];
  error?: string;
};

function ensurePdfBuffer(buffer: Buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid PDF buffer");
  }
}

async function parsePdf(buffer: Buffer) {
  ensurePdfBuffer(buffer);

  return pdfParse(buffer, {
    max: 0,
  });
}

function cleanText(input: string) {
  return (input || "")
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function getPdfPageCount(buffer: Buffer): Promise<number> {
  const parsed = await parsePdf(buffer);
  return parsed.numpages || 1;
}

async function extractPerPageTextWithPdfParse(
  buffer: Buffer
): Promise<{ text: string; pages: number; pageTexts: PdfChunkPageText[] }> {
  const pageTexts: PdfChunkPageText[] = [];

  const parsed = await pdfParse(buffer, {
    max: 0,
    pagerender: async (pageData: {
      getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
      pageIndex?: number;
    }) => {
      const textContent = await pageData.getTextContent();
      const items = textContent?.items || [];
      const pageText = cleanText(items.map((item) => item.str || "").join(" "));

      const pageNumber =
        typeof pageData.pageIndex === "number"
          ? pageData.pageIndex + 1
          : pageTexts.length + 1;

      pageTexts.push({
        page: pageNumber,
        text: pageText,
      });

      return pageText;
    },
  });

  const pages = parsed.numpages || pageTexts.length || 1;
  pageTexts.sort((a, b) => a.page - b.page);

  if (pageTexts.length < pages) {
    const existingPages = new Set(pageTexts.map((p) => p.page));
    for (let i = 1; i <= pages; i++) {
      if (!existingPages.has(i)) {
        pageTexts.push({ page: i, text: "" });
      }
    }
    pageTexts.sort((a, b) => a.page - b.page);
  }

  return {
    text: cleanText(parsed.text || ""),
    pages,
    pageTexts,
  };
}

function slicePageTexts(
  pageTexts: PdfChunkPageText[],
  startPage: number,
  endPage: number
): PdfChunkPageText[] {
  return pageTexts.filter((page) => page.page >= startPage && page.page <= endPage);
}

export async function extractPdfChunkText(
  buffer: Buffer,
  startPage: number,
  endPage: number
): Promise<PdfChunkResult> {
  try {
    const parsed = await extractPerPageTextWithPdfParse(buffer);
    const totalPages = parsed.pages;

    const safeStart = Math.max(1, startPage);
    const safeEnd = Math.min(endPage, totalPages);

    if (safeStart > safeEnd) {
      throw new Error(`Invalid page range: ${startPage}-${endPage}`);
    }

    const pageTextEntries = slicePageTexts(parsed.pageTexts, safeStart, safeEnd);

    const text = pageTextEntries
      .map((page) => page.text)
      .filter(Boolean)
      .join("\n\n");

    return {
      success: true,
      text,
      startPage: safeStart,
      endPage: safeEnd,
      totalPages,
      pageTexts: pageTextEntries,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "PDF chunk extraction failed";

    console.error("PDF chunk extraction error:", err);

    return {
      success: false,
      text: "",
      startPage,
      endPage,
      totalPages: 0,
      pageTexts: [],
      error: message,
    };
  }
}
