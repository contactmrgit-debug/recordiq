declare module "pdf-parse";

declare module "pdf2pic";

declare module "pdf-parse/lib/pdf-parse.js" {
  type PdfParseResult = {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    text: string;
    version: string;
  };

  type PdfParseOptions = {
    max?: number;
    pagerender?: unknown;
    version?: string;
  };

  function pdfParse(
    dataBuffer: Buffer,
    options?: PdfParseOptions
  ): Promise<PdfParseResult>;

  export default pdfParse;
}