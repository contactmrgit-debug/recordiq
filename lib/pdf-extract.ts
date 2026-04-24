import fs from "fs/promises";
import os from "os";
import path from "path";
import pdfParse from "pdf-parse";
import vision from "@google-cloud/vision";
import { fromPath } from "pdf2pic";

type PageText = {
  page: number;
  text: string;
};

export type PdfExtractResult = {
  success: boolean;
  text: string;
  pages: number;
  usedOcr: boolean;
  pageTexts: PageText[];
  error?: string;
};
const visionClient = new vision.ImageAnnotatorClient();

function cleanText(input: string) {
  return (input || "")
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function looksScannedOrBad(text: string) {
  const cleaned = cleanText(text || "");
  if (!cleaned) return true;
  if (cleaned.length < 500) return true;

  const alphaNum = (cleaned.match(/[a-z0-9]/gi) || []).length;
  const ratio = alphaNum / Math.max(cleaned.length, 1);

  return ratio < 0.45;
}

async function ocrImage(filePath: string) {
  const [result] = await visionClient.documentTextDetection(filePath);
  const fullText = result.fullTextAnnotation?.text || "";
  return cleanText(fullText);
}

async function convertPdfToImages(pdfPath: string, totalPages: number) {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), "recordiq-ocr-"));

  const converter = fromPath(pdfPath, {
    density: 200,
    saveFilename: "page",
    savePath: outputDir,
    format: "png",
    width: 1700,
    height: 2200,
  });

  const imagePaths: string[] = [];

  for (let page = 1; page <= totalPages; page++) {
    const result = await converter(page, { responseType: "image" });
    if (result.path) {
      imagePaths.push(result.path);
    }
  }

  return { outputDir, imagePaths };
}

async function runVisionOcrOnPdf(pdfBuffer: Buffer, pageCountGuess: number) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "recordiq-pdf-"));
  const pdfPath = path.join(tempDir, "upload.pdf");

  try {
    await fs.writeFile(pdfPath, pdfBuffer);

    const { imagePaths } = await convertPdfToImages(pdfPath, pageCountGuess);

    const pageTexts: PageText[] = [];

    for (let i = 0; i < imagePaths.length; i++) {
      const text = await ocrImage(imagePaths[i]);
      pageTexts.push({
        page: i + 1,
        text,
      });
    }

    const mergedText = pageTexts
      .map((p) => `--- PAGE ${p.page} ---\n${p.text}`)
      .join("\n\n");

    return {
      text: cleanText(mergedText),
      pageTexts,
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function extractPerPageTextWithPdfParse(
  buffer: Buffer
): Promise<{ text: string; pages: number; pageTexts: PageText[] }> {
  const pageTexts: PageText[] = [];

  const options = {
    pagerender: async (pageData: {
      getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
      pageIndex?: number;
    }) => {
      const textContent = await pageData.getTextContent();
      const items = textContent?.items || [];
      const pageText = cleanText(
        items.map((item) => item.str || "").join(" ")
      );

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
  };

  const data = await pdfParse(buffer, options);

  const text = cleanText(data.text || "");
  const pages = data.numpages || pageTexts.length || 1;

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
    text,
    pages,
    pageTexts,
  };
}

export async function extractPdfText(
  buffer: Buffer
): Promise<PdfExtractResult> {
  try {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("Invalid PDF buffer");
    }

    let parsedText = "";
    let pageCount = 1;
    let pageTexts: PageText[] = [];

    try {
      const parsed = await extractPerPageTextWithPdfParse(buffer);
      parsedText = parsed.text;
      pageCount = parsed.pages;
      pageTexts = parsed.pageTexts;

      console.log("PDF PARSE PAGE TEXT COUNT:", pageTexts.length);
      console.log("PDF PARSE PAGE TEXT SAMPLE 1:", pageTexts[0]);
      console.log("PDF PARSE PAGE TEXT SAMPLE 2:", pageTexts[1]);
    } catch (err) {
      console.warn("pdf-parse failed, falling back to OCR:", err);
    }

    const hasUsablePageText = pageTexts.some(
      (p) => typeof p.text === "string" && p.text.trim().length > 0
    );

    if (!looksScannedOrBad(parsedText) && hasUsablePageText) {
     return {
  success: true,
  text: parsedText,
  pages: pageCount,
  usedOcr: false,
  pageTexts,
};
    }

    console.log("PDF text looks scanned/bad or page text empty. Falling back to OCR.");

    const ocr = await runVisionOcrOnPdf(buffer, pageCount);

   return {
  success: true,
  text: ocr.text,
  pages: pageCount,
  usedOcr: true,
  pageTexts: ocr.pageTexts,
};
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "PDF extraction failed";
    console.error("PDF extraction error:", err);

  return {
  success: false,
  text: "",
  pages: 0,
  usedOcr: false,
  pageTexts: [],
  error: message,
};
  }
}
