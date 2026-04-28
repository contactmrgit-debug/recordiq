import { NextRequest, NextResponse } from "next/server";
import {
  parseRecordType,
  processQueuedDocumentJobById,
  queueDocumentProcessing,
  sanitizeProcessingFileName,
} from "@/lib/document-processing";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type ProcessS3Payload = {
  caseId?: unknown;
  fileName?: unknown;
  mimeType?: unknown;
  recordType?: unknown;
  s3Key?: unknown;
  s3Bucket?: unknown;
  s3Region?: unknown;
  fileUrl?: unknown;
};

function isPdfUpload(fileName: string, mimeType: string): boolean {
  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  return (
    lowerMime === "application/pdf" ||
    lowerMime === "application/x-pdf" ||
    lowerName.endsWith(".pdf")
  );
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: routeCaseId } = await context.params;
    const body = (await req.json()) as ProcessS3Payload;

    const caseId =
      typeof body.caseId === "string" && body.caseId.trim()
        ? body.caseId.trim()
        : null;
    const fileName =
      typeof body.fileName === "string" && body.fileName.trim()
        ? body.fileName.trim()
        : null;
    const mimeType =
      typeof body.mimeType === "string" && body.mimeType.trim()
        ? body.mimeType.trim()
        : "application/pdf";
    const fileUrl =
      typeof body.fileUrl === "string" && body.fileUrl.trim()
        ? body.fileUrl.trim()
        : null;
    const s3Key =
      typeof body.s3Key === "string" && body.s3Key.trim()
        ? body.s3Key.trim()
        : null;
    const s3Bucket =
      typeof body.s3Bucket === "string" && body.s3Bucket.trim()
        ? body.s3Bucket.trim()
        : null;
    const s3Region =
      typeof body.s3Region === "string" && body.s3Region.trim()
        ? body.s3Region.trim()
        : null;

    if (!caseId) {
      return NextResponse.json(
        { success: false, error: "Missing caseId" },
        { status: 400 }
      );
    }

    if (caseId !== routeCaseId) {
      return NextResponse.json(
        { success: false, error: "caseId does not match route id" },
        { status: 400 }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "Missing fileName" },
        { status: 400 }
      );
    }

    if (!isPdfUpload(fileName, mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Please upload a PDF document.",
        },
        { status: 400 }
      );
    }

    const queuedFileUrl =
      fileUrl ||
      (s3Bucket && s3Key && s3Region
        ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${s3Key}`
        : null);

    if (!queuedFileUrl) {
      return NextResponse.json(
        { success: false, error: "Missing fileUrl" },
        { status: 400 }
      );
    }

    const providedRecordType = parseRecordType(body.recordType);
    if (
      typeof body.recordType === "string" &&
      body.recordType.trim() &&
      !providedRecordType
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid recordType" },
        { status: 400 }
      );
    }

    const queuedJob = await queueDocumentProcessing({
      caseId,
      fileName: sanitizeProcessingFileName(fileName),
      fileUrl: queuedFileUrl,
      mimeType,
      recordType: providedRecordType,
    });

    const processingOutcome = await processQueuedDocumentJobById(queuedJob.jobId);

    return NextResponse.json({
      success: true,
      documentId: queuedJob.documentId,
      jobId: queuedJob.jobId,
      queuedStatus: queuedJob.status,
      processing: processingOutcome,
    });
  } catch (error: unknown) {
    console.error("[documents/process-s3] request failed", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "S3 upload processing failed",
      },
      { status: 500 }
    );
  }
}
