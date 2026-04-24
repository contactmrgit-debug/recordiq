import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { DocumentStatus, RecordType } from "@prisma/client";
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

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^\w.\-]/g, "_");
}

function isPdfUpload(file: File): boolean {
  const name = file.name.toLowerCase();
  const mime = (file.type || "").toLowerCase();

  return (
    mime === "application/pdf" ||
    mime === "application/x-pdf" ||
    name.endsWith(".pdf")
  );
}

function parseRecordType(value: FormDataEntryValue | null): RecordType | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toUpperCase();
  if (!normalized) return null;

  return VALID_RECORD_TYPES.has(normalized as RecordType)
    ? (normalized as RecordType)
    : null;
}

function normalizeText(value?: string | null): string | null {
  const trimmed = (value || "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isValidDateString(value?: string | null): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function logStage(
  stage: string,
  details: Record<string, unknown> = {}
): void {
  console.info("[documents/upload]", stage, details);
}

async function markDocumentFailed(documentId: string, reason: string) {
  try {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: DocumentStatus.FAILED },
    });
  } catch (updateError) {
    console.error("[documents/upload] failed to mark document failed", {
      documentId,
      reason,
      updateError,
    });
  }
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
  let documentId: string | null = null;

  try {
    const { id: routeCaseId } = await context.params;
    logStage("request-start", { routeCaseId });

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

    logStage("validating-case", { caseId, fileName: file.name });
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

    const sanitizedFileName = sanitizeFileName(file.name || "document.pdf");
    const mimeType = file.type || "application/pdf";

    logStage("creating-document", {
      caseId,
      fileName: sanitizedFileName,
      mimeType,
      recordTypeProvided: Boolean(providedRecordType),
    });

    const document = await prisma.document.create({
      data: {
        caseId,
        fileName: sanitizedFileName,
        fileUrl: `/uploads/${Date.now()}-${randomUUID()}-${sanitizedFileName}`,
        mimeType,
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
      logStage("reading-file-buffer", {
        documentId,
        fileName: document.fileName,
      });
      const buffer = Buffer.from(await file.arrayBuffer());

      logStage("saving-file", {
        documentId,
        fileName: document.fileName,
      });
      const savedFile = await saveUploadToPublicFolder(
        buffer,
        sanitizedFileName
      );

      await prisma.document.update({
        where: { id: documentId },
        data: {
          fileUrl: savedFile.fileUrl,
        },
      });

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
      console.error("[documents/upload] processing failed", {
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
      error instanceof Error ? error.message : "Upload processing failed";

    console.error("[documents/upload] request failed", {
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
