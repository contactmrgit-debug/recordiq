import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  parseRecordType,
  queueDocumentProcessing,
  processQueuedDocumentJobById,
  sanitizeProcessingFileName,
} from "@/lib/document-processing";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function isPdfUpload(file: File): boolean {
  const name = file.name.toLowerCase();
  const mime = (file.type || "").toLowerCase();

  return (
    mime === "application/pdf" ||
    mime === "application/x-pdf" ||
    name.endsWith(".pdf")
  );
}

async function saveUploadToPublicFolder(buffer: Buffer, fileName: string) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const storageFileName = `${Date.now()}-${randomUUID()}-${fileName}`;
  const storagePath = path.join(uploadsDir, storageFileName);

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(storagePath, buffer);

  return {
    storageFileName,
    fileUrl: `/uploads/${storageFileName}`,
  };
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: routeCaseId } = await context.params;
    const formData = await req.formData();
    const file = formData.get("file");
    const caseIdRaw = formData.get("caseId");
    const recordTypeRaw = formData.get("recordType");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (typeof caseIdRaw !== "string" || !caseIdRaw.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing caseId" },
        { status: 400 }
      );
    }

    const caseId = caseIdRaw.trim();
    if (caseId !== routeCaseId) {
      return NextResponse.json(
        { success: false, error: "caseId does not match route id" },
        { status: 400 }
      );
    }

    if (!isPdfUpload(file)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Please upload a PDF document.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { success: false, error: "Uploaded file is empty" },
        { status: 400 }
      );
    }

    const providedRecordType = parseRecordType(recordTypeRaw);
    if (
      typeof recordTypeRaw === "string" &&
      recordTypeRaw.trim() &&
      !providedRecordType
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid recordType" },
        { status: 400 }
      );
    }

    const sanitizedFileName = sanitizeProcessingFileName(file.name || "document.pdf");
    const mimeType = file.type || "application/pdf";
    const buffer = Buffer.from(await file.arrayBuffer());
    const savedFile = await saveUploadToPublicFolder(buffer, sanitizedFileName);

    const queuedJob = await queueDocumentProcessing({
      caseId,
      fileName: sanitizedFileName,
      fileUrl: savedFile.fileUrl,
      mimeType,
      recordType: providedRecordType,
    });

    const processingOutcome = await processQueuedDocumentJobById(queuedJob.jobId);

    return NextResponse.json({
      success: true,
      documentId: queuedJob.documentId,
      jobId: queuedJob.jobId,
      status: processingOutcome?.success ? "PROCESSED" : processingOutcome?.finalStatus ?? queuedJob.status,
      jobStatus: processingOutcome?.job.status ?? queuedJob.status,
      processing: processingOutcome,
    });
  } catch (error: unknown) {
    console.error("[documents/upload] request failed", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
