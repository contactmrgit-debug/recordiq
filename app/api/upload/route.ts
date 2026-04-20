import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTimelineEvents } from "@/lib/ai-timeline";
import { cleanTimelineEvents } from "@/lib/timeline-cleanup";
import { extractPdfText } from "@/lib/pdf-extract";
const CHUNK_SIZE = 25;

export async function POST(req: NextRequest) {
  let documentId: string | null = null;

  try {
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

    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    const ALLOWED_TYPES = [
      "MEDICAL_RECORD",
      "BILL",
      "LAB_RESULT",
      "IMAGING",
      "INSURANCE",
      "LEGAL_DOCUMENT",
      "OTHER",
    ] as const;

    type AllowedRecordType = (typeof ALLOWED_TYPES)[number];

    const recordType: AllowedRecordType =
      typeof recordTypeRaw === "string" &&
      ALLOWED_TYPES.includes(recordTypeRaw as AllowedRecordType)
        ? (recordTypeRaw as AllowedRecordType)
        : "OTHER";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fakeUrl = `/uploads/${Date.now()}-${file.name}`;

    const document = await prisma.document.create({
      data: {
        caseId,
        fileName: file.name,
        fileUrl: fakeUrl,
        mimeType: file.type || null,
        recordType,
        pageCount: null,
        status: "PROCESSING",
      },
    });

    documentId = document.id;

    const pdfMeta = await extractPdfText(buffer);

    if (!pdfMeta.success) {
      await prisma.document.update({
        where: { id: document.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        {
          success: false,
          error: pdfMeta.error || "PDF extraction failed",
        },
        { status: 500 }
      );
    }

    const totalPages = pdfMeta.pages ?? 0;

    if (!totalPages || totalPages < 1) {
      await prisma.document.update({
        where: { id: document.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        {
          success: false,
          error: "Could not determine PDF page count",
        },
        { status: 500 }
      );
    }
    const extractedText = pdfMeta.text ?? "";
    const chunkDefinitions: Array<{
      chunkIndex: number;
      startPage: number;
      endPage: number;
    }> = [];

    let chunkIndex = 0;
    for (let startPage = 1; startPage <= totalPages; startPage += CHUNK_SIZE) {
      const endPage = Math.min(startPage + CHUNK_SIZE - 1, totalPages);

      chunkDefinitions.push({
        chunkIndex,
        startPage,
        endPage,
      });

      chunkIndex++;
    }

    await prisma.documentChunk.createMany({
      data: chunkDefinitions.map((chunk) => ({
        documentId: document.id,
        chunkIndex: chunk.chunkIndex,
        startPage: chunk.startPage,
        endPage: chunk.endPage,
        status: "PENDING",
      })),
    });

    let fullExtractedText = "";
    let timelineEventsCreated = 0;
    let timelineEventsExtracted = 0;
    let processedChunks = 0;
    let failedChunks = 0;

    for (const chunk of chunkDefinitions) {
      const chunkRecord = await prisma.documentChunk.findUnique({
        where: {
          documentId_chunkIndex: {
            documentId: document.id,
            chunkIndex: chunk.chunkIndex,
          },
        },
      });

      if (!chunkRecord) continue;

      await prisma.documentChunk.update({
        where: { id: chunkRecord.id },
        data: { status: "PROCESSING", error: null },
      });

      const chunkPages = extractedText
        .split(/\f/)
        .slice(chunk.startPage - 1, chunk.endPage)
        .join("\n\n")
        .trim();

      const cleanedText = chunkPages
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/[ ]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      if (!cleanedText) {
        failedChunks++;

        await prisma.documentChunk.update({
          where: { id: chunkRecord.id },
          data: {
            status: "FAILED",
            error: "Chunk extraction failed",
          },
        });

        continue;
      }

      await prisma.documentChunk.update({
        where: { id: chunkRecord.id },
        data: {
          status: "PROCESSED",
          extractedText: cleanedText,
        },
      });

      processedChunks++;

      if (cleanedText.length > 0) {
        fullExtractedText +=
          `\n\n[Pages ${chunk.startPage}-${chunk.endPage}]\n${cleanedText}`;
      }

      const rawEvents = await extractTimelineEvents([
        { page: chunk.startPage, text: cleanedText }
      ]);
      const timelineEvents = cleanTimelineEvents(rawEvents);

      timelineEventsExtracted += timelineEvents.length;

      for (const event of timelineEvents) {
        if (!event.title?.trim()) continue;
        if (!event.date || event.date === "UNKNOWN") continue;

        const parsedDate = new Date(event.date);
        if (isNaN(parsedDate.getTime())) continue;

        await prisma.timelineEvent.create({
          data: {
            caseId,
            documentId: document.id,
            eventDate: parsedDate,
            title: event.title.trim(),
            description: event.description?.trim() || null,
            eventType: event.eventType ?? "other",
            sourcePage: event.sourcePage ?? null,
            reviewStatus: "PENDING",
            isHidden: false,
            physicianName: event.physicianName?.trim() || null,
            medicalFacility: event.medicalFacility?.trim() || null,
          },
        });

        timelineEventsCreated++;
      }
    }

    const finalStatus =
      processedChunks > 0 && failedChunks === 0
        ? "PROCESSED"
        : processedChunks > 0
        ? "PROCESSED"
        : "FAILED";

    await prisma.document.update({
      where: { id: document.id },
      data: {
        pageCount: totalPages,
        extractedText: fullExtractedText.trim() || null,
        status: finalStatus,
      },
    });

    if (fullExtractedText.trim().length > 0) {
      await prisma.documentPage.create({
        data: {
          documentId: document.id,
          pageNumber: 1,
          text: fullExtractedText.trim(),
        },
      });
    }

    const updatedDocument = await prisma.document.findUnique({
      where: { id: document.id },
      include: {
        chunks: {
          orderBy: { chunkIndex: "asc" },
        },
      },
    });

    const savedTimelineEvents = await prisma.timelineEvent.findMany({
      where: { documentId: document.id },
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
      },
    });

    const chunkDetails = await prisma.documentChunk.findMany({
      where: { documentId: document.id },
      orderBy: { chunkIndex: "asc" },
      select: {
        chunkIndex: true,
        startPage: true,
        endPage: true,
        status: true,
        error: true,
      },
    });

    console.log(
      "SAVED TIMELINE EVENTS:",
      savedTimelineEvents.map((e) => ({
        id: e.id,
        title: e.title,
        reviewStatus: e.reviewStatus,
        isHidden: e.isHidden,
      }))
    );

    return NextResponse.json({
      success: true,
      document: {
        id: updatedDocument?.id ?? document.id,
        fileName: updatedDocument?.fileName ?? document.fileName,
        fileUrl: updatedDocument?.fileUrl ?? document.fileUrl,
        mimeType: updatedDocument?.mimeType ?? document.mimeType,
        pageCount: updatedDocument?.pageCount ?? totalPages,
        extractedTextLength: fullExtractedText.length,
        status: updatedDocument?.status ?? finalStatus,
      },
      extracted: {
        pageCount: totalPages,
        textLength: fullExtractedText.length,
      },
      chunks: {
        total: chunkDefinitions.length,
        processed: processedChunks,
        failed: failedChunks,
        chunkSize: CHUNK_SIZE,
        details: chunkDetails,
      },
      timelineEventsCreated: savedTimelineEvents.length,
      timelineEventsExtracted,
      timelineEvents: savedTimelineEvents.map((event) => ({
        id: event.id,
        date: event.eventDate.toISOString().split("T")[0],
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        sourcePage: event.sourcePage,
        reviewStatus: event.reviewStatus,
        isHidden: event.isHidden,
      })),
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    if (documentId) {
      try {
        await prisma.document.update({
          where: { id: documentId },
          data: { status: "FAILED" },
        });
      } catch (updateErr) {
        console.error("FAILED TO MARK DOCUMENT AS FAILED:", updateErr);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
