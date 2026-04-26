import pdfParse from "pdf-parse";

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

export async function getPdfPageCount(buffer: Buffer): Promise<number> {
  const parsed = await parsePdf(buffer);
  return parsed.numpages || 1;
}

function splitTextIntoPageBuckets(text: string, totalPages: number): PdfChunkPageText[] {
  const cleanText = (text || "").replace(/\s+/g, " ").trim();

  if (!cleanText) {
    return Array.from({ length: totalPages }, (_, index) => ({
      page: index + 1,
      text: "",
    }));
  }

  const safeTotalPages = Math.max(1, totalPages);
  const approxCharsPerPage = Math.ceil(cleanText.length / safeTotalPages);

  return Array.from({ length: safeTotalPages }, (_, index) => {
    const start = index * approxCharsPerPage;
    const end = start + approxCharsPerPage;

    return {
      page: index + 1,
      text: cleanText.slice(start, end).trim(),
    };
  });
}

export async function extractPdfChunkText(
  buffer: Buffer,
  startPage: number,
  endPage: number
): Promise<PdfChunkResult> {
  try {
    const parsed = await parsePdf(buffer);
    const totalPages = parsed.numpages || 1;

    const safeStart = Math.max(1, startPage);
    const safeEnd = Math.min(endPage, totalPages);

    if (safeStart > safeEnd) {
      throw new Error(`Invalid page range: ${startPage}-${endPage}`);
    }

    const allPageTexts = splitTextIntoPageBuckets(parsed.text || "", totalPages);
    const pageTextEntries = allPageTexts.filter(
      (page) => page.page >= safeStart && page.page <= safeEnd
    );

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