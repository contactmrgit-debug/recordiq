import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

type PdfTextItem = {
  str?: string;
};

type PdfChunkResult = {
  success: boolean;
  text: string;
  startPage: number;
  endPage: number;
  totalPages: number;
  error?: string;
};

export async function extractPdfChunkText(
  buffer: Buffer,
  startPage: number,
  endPage: number
): Promise<PdfChunkResult> {
  try {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("Invalid PDF buffer");
    }

    const uint8Array = new Uint8Array(buffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    const totalPages = pdf.numPages;

    const safeStart = Math.max(1, startPage);
    const safeEnd = Math.min(endPage, totalPages);

    if (safeStart > safeEnd) {
      throw new Error(`Invalid page range: ${startPage}-${endPage}`);
    }

    const pageTexts: string[] = [];

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
    }

    return {
      success: true,
      text: pageTexts.join("\n\n"),
      startPage: safeStart,
      endPage: safeEnd,
      totalPages,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "PDF chunk extraction failed";
    console.error("PDF chunk extraction error:", err);

    return {
      success: false,
      text: "",
      startPage,
      endPage,
      totalPages: 0,
      error: message,
    };
  }
}
