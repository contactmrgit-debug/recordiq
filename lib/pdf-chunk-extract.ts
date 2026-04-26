import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

type PdfTextItem = {
  str?: string;
};

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

function toPdfData(buffer: Buffer): Uint8Array {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid PDF buffer");
  }

  return new Uint8Array(buffer);
}

async function loadPdfDocument(buffer: Buffer) {
  const uint8Array = toPdfData(buffer);

  return pdfjsLib.getDocument({
    data: uint8Array,

    // Critical for Vercel/Node:
    // prevents PDF.js from trying to import pdf.worker.mjs at runtime.
    disableWorker: true,

    // Keeps PDF.js from relying on worker-side fetch behavior.
    useWorkerFetch: false,

    // Safer for serverless execution.
    isEvalSupported: false,
  } as Parameters<typeof pdfjsLib.getDocument>[0]).promise;
}

export async function getPdfPageCount(buffer: Buffer): Promise<number> {
  const pdf = await loadPdfDocument(buffer);
  return pdf.numPages;
}

export async function extractPdfChunkText(
  buffer: Buffer,
  startPage: number,
  endPage: number
): Promise<PdfChunkResult> {
  try {
    const pdf = await loadPdfDocument(buffer);
    const totalPages = pdf.numPages;

    const safeStart = Math.max(1, startPage);
    const safeEnd = Math.min(endPage, totalPages);

    if (safeStart > safeEnd) {
      throw new Error(`Invalid page range: ${startPage}-${endPage}`);
    }

    const pageTexts: string[] = [];
    const pageTextEntries: PdfChunkPageText[] = [];

    for (let pageNum = safeStart; pageNum <= safeEnd; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = textContent.items as PdfTextItem[];

      const pageText = items
        .map((item) => item.str || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      pageTexts.push(pageText);
      pageTextEntries.push({
        page: pageNum,
        text: pageText,
      });
    }

    return {
      success: true,
      text: pageTexts.join("\n\n"),
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