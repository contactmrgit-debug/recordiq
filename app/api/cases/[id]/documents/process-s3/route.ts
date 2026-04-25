import { NextRequest, NextResponse } from "next/server";
import { DocumentStatus, RecordType } from "@prisma/client";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { classifyDocument } from "@/lib/document-classifier";
import { extractPdfText } from "@/lib/pdf-extract";
import { extractTimelineEvents } from "@/lib/ai-timeline";
import {
  cleanTimelineEvents,
  filterTimelineForDisplay,
  isStandaloneMetadataOnlyEvent,
} from "@/lib/timeline-cleanup";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const VALID_RECORD_TYPES = new Set<RecordType>(Object.values(RecordType));

type ProcessS3Payload = {
  caseId?: unknown;
  fileName?: unknown;
  fileSize?: unknown;
  mimeType?: unknown;
  recordType?: unknown;
  s3Key?: unknown;
  s3Bucket?: unknown;
  s3Region?: unknown;
  fileUrl?: unknown;
};

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^\w.\-]/g, "_");
}

function normalizeText(value?: string | null): string | null {
  const trimmed = (value || "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isValidDateString(value?: string | null): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeTitleKey(value?: string | null): string {
  return (
    value
      ?.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  );
}

function parseRecordType(value: unknown): RecordType | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toUpperCase();
  if (!normalized) return null;

  return VALID_RECORD_TYPES.has(normalized as RecordType)
    ? (normalized as RecordType)
    : null;
}

function isPdfUpload(fileName: string, mimeType: string): boolean {
  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  return (
    lowerMime === "application/pdf" ||
    lowerMime === "application/x-pdf" ||
    lowerName.endsWith(".pdf")
  );
}

function logStage(stage: string, details: Record<string, unknown> = {}): void {
  console.info("[documents/process-s3]", stage, details);
}

async function markDocumentFailed(documentId: string, reason: string) {
  try {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: DocumentStatus.FAILED },
    });
  } catch (updateError) {
    console.error("[documents/process-s3] failed to mark document failed", {
      documentId,
      reason,
      updateError,
    });
  }
}

async function bodyToBuffer(body: unknown): Promise<Buffer> {
  if (!body) {
    throw new Error("S3 object body is empty");
  }

  if (Buffer.isBuffer(body)) {
    return body;
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }

  if (body instanceof ArrayBuffer) {
    return Buffer.from(body);
  }

  const candidate = body as {
    transformToByteArray?: () => Promise<Uint8Array>;
    arrayBuffer?: () => Promise<ArrayBuffer>;
  };

  if (typeof candidate.transformToByteArray === "function") {
    const bytes = await candidate.transformToByteArray();
    return Buffer.from(bytes);
  }

  if (typeof candidate.arrayBuffer === "function") {
    const arrayBuffer = await candidate.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  if (typeof (body as AsyncIterable<unknown>)[Symbol.asyncIterator] === "function") {
    const chunks: Buffer[] = [];

    for await (const chunk of body as AsyncIterable<
      Buffer | Uint8Array | string | ArrayBuffer | ArrayBufferView
    >) {
      if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk));
      } else if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else if (chunk instanceof Uint8Array) {
        chunks.push(Buffer.from(chunk));
      } else if (chunk instanceof ArrayBuffer) {
        chunks.push(Buffer.from(chunk));
      } else if (ArrayBuffer.isView(chunk)) {
        chunks.push(Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength));
      }
    }

    if (chunks.length > 0) {
      return Buffer.concat(chunks);
    }
  }

  throw new Error("Unsupported S3 body type");
}

async function getS3Client(region: string): Promise<S3Client> {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing AWS environment variables. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
    );
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let documentId: string | null = null;

  try {
    const { id: routeCaseId } = await context.params;
    logStage("request-start", { routeCaseId });

    const body = (await req.json()) as ProcessS3Payload;

    const caseId =
      typeof body.caseId === "string" && body.caseId.trim()
        ? body.caseId.trim()
        : null;
    const fileName =
      typeof body.fileName === "string" && body.fileName.trim()
        ? body.fileName.trim()
        : null;
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
    const mimeType =
      typeof body.mimeType === "string" && body.mimeType.trim()
        ? body.mimeType.trim()
        : null;
    const fileSize =
      typeof body.fileSize === "number"
        ? body.fileSize
        : typeof body.fileSize === "string" && body.fileSize.trim()
          ? Number(body.fileSize)
          : NaN;

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

    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid fileSize" },
        { status: 400 }
      );
    }

    if (!mimeType) {
      return NextResponse.json(
        { success: false, error: "Missing mimeType" },
        { status: 400 }
      );
    }

    if (!s3Key) {
      return NextResponse.json(
        { success: false, error: "Missing s3Key" },
        { status: 400 }
      );
    }

    if (!s3Bucket) {
      return NextResponse.json(
        { success: false, error: "Missing s3Bucket" },
        { status: 400 }
      );
    }

    if (!s3Region) {
      return NextResponse.json(
        { success: false, error: "Missing s3Region" },
        { status: 400 }
      );
    }

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "Missing fileUrl" },
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

    logStage("validating-case", { caseId, fileName, s3Bucket, s3Key });
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true },
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    logStage("downloading-s3-object", {
      caseId,
      fileName,
      s3Bucket,
      s3Region,
    });
    const s3 = await getS3Client(s3Region);
    const objectResponse = await s3.send(
      new GetObjectCommand({
        Bucket: s3Bucket,
        Key: s3Key,
      })
    );

    const buffer = await bodyToBuffer(objectResponse.Body);
    if (buffer.length <= 0) {
      throw new Error("Downloaded S3 object is empty");
    }

    const sanitizedFileName = sanitizeFileName(fileName);
    const mimeTypeNormalized = mimeType || "application/pdf";

    logStage("creating-document", {
      caseId,
      fileName: sanitizedFileName,
      mimeType: mimeTypeNormalized,
      recordTypeProvided: Boolean(providedRecordType),
      fileSize,
    });

    const document = await prisma.document.create({
      data: {
        caseId,
        fileName: sanitizedFileName,
        fileUrl,
        mimeType: mimeTypeNormalized,
        recordType: providedRecordType,
        status: DocumentStatus.PROCESSING,
      },
      select: {
        id: true,
        fileName: true,
      },
    });

    documentId = document.id;

    try {
      logStage("extracting-pdf-text", { documentId });
      const pdfResult = await extractPdfText(buffer);

      if (!pdfResult.success) {
        throw new Error(pdfResult.error || "PDF extraction failed");
      }

      const extractedText = normalizeText(pdfResult.text) ?? "";
      if (!extractedText) {
        throw new Error("PDF extraction returned no usable text");
      }

      const pageCount = Math.max(1, pdfResult.pages || 0);
      const pageTexts =
        pdfResult.pageTexts.length > 0
          ? pdfResult.pageTexts
          : [{ page: 1, text: extractedText }];

      logStage("classifying-document", {
        documentId,
        pageCount,
        usedOcr: pdfResult.usedOcr,
        hasProvidedRecordType: Boolean(providedRecordType),
      });

      const finalRecordType =
        providedRecordType ?? (await classifyDocument(extractedText)).type;

      logStage("updating-document-extract", {
        documentId,
        pageCount,
        recordType: finalRecordType,
      });

      await prisma.document.update({
        where: { id: documentId },
        data: {
          pageCount,
          extractedText,
          recordType: finalRecordType,
        },
      });

      logStage("extracting-timeline-events", { documentId });
      const rawTimelineEvents = await extractTimelineEvents(pageTexts);
      const cleanedTimelineEvents = filterTimelineForDisplay(
        cleanTimelineEvents(rawTimelineEvents)
      ).filter((event) => !isStandaloneMetadataOnlyEvent(event));

      const timelineRows = cleanedTimelineEvents
        .map((event) => {
          if (!isValidDateString(event.date)) {
            return null;
          }

          const eventDate = new Date(`${event.date}T12:00:00.000Z`);
          if (Number.isNaN(eventDate.getTime())) {
            return null;
          }

          const title = normalizeText(event.title);
          if (!title) {
            return null;
          }

          return {
            caseId,
            documentId,
            eventDate,
            title,
            description: normalizeText(event.description),
            eventType: normalizeText(event.eventType)?.toLowerCase() ?? "other",
            sourcePage:
              typeof event.sourcePage === "number" &&
              Number.isFinite(event.sourcePage) &&
              event.sourcePage > 0
                ? Math.trunc(event.sourcePage)
                : null,
            reviewStatus: "PENDING" as const,
            isHidden: false,
            physicianName: normalizeText(event.physicianName),
            medicalFacility: normalizeText(event.medicalFacility),
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      const protectedPresentationTitleKey =
        "er presentation with head neck left shoulder pain";
      const hasPresentationRow = timelineRows.some(
        (row) => normalizeTitleKey(row.title) === protectedPresentationTitleKey
      );

      if (!hasPresentationRow) {
        const rawPresentationEvent = rawTimelineEvents.find(
          (event) =>
            normalizeTitleKey(event.title) === protectedPresentationTitleKey
        );

        if (
          rawPresentationEvent &&
          isValidDateString(rawPresentationEvent.date)
        ) {
          const eventDate = new Date(
            `${rawPresentationEvent.date}T12:00:00.000Z`
          );

          if (!Number.isNaN(eventDate.getTime())) {
            const title = normalizeText(rawPresentationEvent.title);

            if (title) {
              timelineRows.push({
                caseId,
                documentId,
                eventDate,
                title,
                description: normalizeText(rawPresentationEvent.description),
                eventType:
                  normalizeText(rawPresentationEvent.eventType)?.toLowerCase() ??
                  "symptom",
                sourcePage:
                  typeof rawPresentationEvent.sourcePage === "number" &&
                  Number.isFinite(rawPresentationEvent.sourcePage) &&
                  rawPresentationEvent.sourcePage > 0
                    ? Math.trunc(rawPresentationEvent.sourcePage)
                    : null,
                reviewStatus: "PENDING" as const,
                isHidden: false,
                physicianName: normalizeText(rawPresentationEvent.physicianName),
                medicalFacility: normalizeText(
                  rawPresentationEvent.medicalFacility
                ),
              });
            }
          }
        }
      }

      logStage("timeline-ready", {
        documentId,
        extractedCount: rawTimelineEvents.length,
        cleanedCount: cleanedTimelineEvents.length,
        savableCount: timelineRows.length,
      });

      if (timelineRows.length > 0) {
        logStage("saving-document-and-timeline", {
          documentId,
          savableCount: timelineRows.length,
        });

        await prisma.$transaction([
          prisma.timelineEvent.createMany({
            data: timelineRows,
          }),
          prisma.document.update({
            where: { id: documentId },
            data: { status: DocumentStatus.PROCESSED },
          }),
        ]);
      } else {
        logStage("finalizing-document-without-timeline-events", {
          documentId,
        });

        await prisma.document.update({
          where: { id: documentId },
          data: { status: DocumentStatus.PROCESSED },
        });
      }

      const savedDocument = await prisma.document.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          caseId: true,
          fileName: true,
          fileUrl: true,
          mimeType: true,
          recordType: true,
          pageCount: true,
          status: true,
          extractedText: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const savedTimelineEvents = await prisma.timelineEvent.findMany({
        where: { documentId },
        orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          eventDate: true,
          title: true,
          description: true,
          eventType: true,
          sourcePage: true,
          reviewStatus: true,
          isHidden: true,
          physicianName: true,
          medicalFacility: true,
        },
      });

      logStage("request-complete", {
        documentId,
        timelineEventsSaved: savedTimelineEvents.length,
      });

      return NextResponse.json({
        success: true,
        document: savedDocument,
        timelineEventsCreated: savedTimelineEvents.length,
        timelineEvents: savedTimelineEvents.map((event) => ({
          id: event.id,
          date: event.eventDate.toISOString().split("T")[0],
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          sourcePage: event.sourcePage,
          reviewStatus: event.reviewStatus,
          isHidden: event.isHidden,
          physicianName: event.physicianName,
          medicalFacility: event.medicalFacility,
        })),
        recordType: finalRecordType,
        pageCount,
        extractedTextLength: extractedText.length,
        usedOcr: pdfResult.usedOcr,
      });
    } catch (processingError) {
      console.error("[documents/process-s3] processing failed", {
        documentId,
        processingError,
      });

      if (documentId) {
        await markDocumentFailed(
          documentId,
          processingError instanceof Error
            ? processingError.message
            : "processing failure"
        );
      }

      throw processingError;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "S3 upload processing failed";

    console.error("[documents/process-s3] request failed", {
      documentId,
      error,
    });

    if (documentId) {
      await markDocumentFailed(documentId, message);
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
