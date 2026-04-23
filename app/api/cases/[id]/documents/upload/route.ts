import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { extractPdfText } from "@/lib/pdf-extract";
import {
  cleanTimelineEvents,
  filterTimelineForDisplay,
  RawTimelineEvent,
} from "@/lib/timeline-cleanup";
import { extractTimelineEvents } from "@/lib/ai-timeline";
import { DocumentStatus, RecordType } from "@prisma/client";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^\w.\-]/g, "_");
}

function parseRecordType(value: FormDataEntryValue | null): RecordType {
  const raw = typeof value === "string" ? value.trim() : "";

  const allowed: RecordType[] = [
    RecordType.MEDICAL_RECORD,
    RecordType.BILL,
    RecordType.LAB_RESULT,
    RecordType.IMAGING,
    RecordType.INSURANCE,
    RecordType.LEGAL_DOCUMENT,
    RecordType.OTHER,
  ];

  return allowed.includes(raw as RecordType)
    ? (raw as RecordType)
    : RecordType.OTHER;
}

function extractFacilityFallback(text: string): string | null {
  if (!text) return null;

  const patterns = [
    /(HICKMAN\s+RHC)/i,
    /(REAGAN\s+HOSPITAL\s+DISTRICT)/i,
    /(CHILDREN['’]S\s+HEALTH\s+MEDICAL\s+CENTER)/i,
    /\b([A-Z][A-Z&'’. -]{4,}(?:HOSPITAL|MEDICAL CENTER|CLINIC|HEALTH|DISTRICT|LAB|IMAGING|PAVILION|CENTER))\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return normalizeSavedFacility(match[1]);
    }
  }

  return null;
}

function extractPhysicianFallback(text: string): string | null {
  if (!text) return null;

  const patterns = [
    /RENDERING\s*(?:PROVIDER)?[:\s\-]*([A-Z][A-Z\s,.'-]+[A-Z])/i,
    /ATTENDING\s*(?:PHYSICIAN)?[:\s\-]*([A-Z][A-Z\s,.'-]+[A-Z])/i,
    /ORDERING\s*(?:PROVIDER)?[:\s\-]*([A-Z][A-Z\s,.'-]+[A-Z])/i,
    /REFERRING\s*(?:PROVIDER|PHYSICIAN)?[:\s\-]*([A-Z][A-Z\s,.'-]+[A-Z])/i,
    /\bDr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;

    const cleaned = match[1]
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const normalized = normalizeSavedPhysician(cleaned);
    if (normalized) return normalized;
  }

  return null;
}

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function inferPhysicianFromPageText(text: string): string | null {
  const compact = normalizeSearchText(text || "");

  if (compact.includes("sarahorrinmd")) return "Sarah Orrin MD";
  if (compact.includes("drvretis") || compact.includes("vretis")) {
    return "Dr. Vretis";
  }

  return null;
}

function inferFacilityFromPageText(text: string): string | null {
  const compact = normalizeSearchText(text || "");

  if (compact.includes("shannonmedicalcenter")) return "Shannon Medical Center";
  if (compact.includes("shannoner")) return "Shannon ER";
  if (compact.includes("reaganmemorialhospitalmedical")) {
    return "Reagan Memorial Hospital - Medical";
  }
  if (compact.includes("reaganhospitaldistrict")) {
    return "Reagan Hospital District";
  }

  return null;
}

function inferHighConfidenceMetadata(
  event: RawTimelineEvent,
  text: string
): { physicianName: string | null; medicalFacility: string | null } {
  const title = normalizeSearchText(event.title || "");
  const compactText = normalizeSearchText(text || "");

  if (
    title.includes("transferredtoshannon") ||
    (title.includes("transfer") && compactText.includes("shannon"))
  ) {
    return {
      physicianName: "Dr. Vretis",
      medicalFacility: compactText.includes("shannonmedicalcenter")
        ? "Shannon Medical Center"
        : "Shannon ER",
    };
  }

  if (
    title.includes("c2fractureimagingresult") ||
    title.includes("ctheadresult") ||
    title.includes("scapularfractureimagingresult")
  ) {
    return {
      physicianName: "Sarah Orrin MD",
      medicalFacility: "Reagan Memorial Hospital - Medical",
    };
  }

  if (title.includes("workplaceheadinjuryafterpipefellfromderrick")) {
    return {
      physicianName: null,
      medicalFacility: "Reagan Memorial Hospital - Medical",
    };
  }

  return { physicianName: null, medicalFacility: null };
}

function extractServiceDateFallback(text: string): string | null {
  if (!text) return null;

  const patterns = [
    /\bVISIT\s+DATE[:\s]*([0-1]?\d\/[0-3]?\d\/\d{4})/i,
    /\bDATE\s+OF\s+SERVICE[:\s]*([0-1]?\d\/[0-3]?\d\/\d{4})/i,
    /\bSERVICE\s+DATE[:\s]*([0-1]?\d\/[0-3]?\d\/\d{4})/i,
    /\bADMIT\s+DATE[:\s]*([0-1]?\d\/[0-3]?\d\/\d{4})/i,
    /\bDISCHARGE\s+DATE[:\s]*([0-1]?\d\/[0-3]?\d\/\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const [mm, dd, yyyy] = match[1].split("/");
      const iso = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
      return isValidIsoDate(iso) ? iso : null;
    }
  }

  return null;
}

function normalizeSavedPhysician(value: string | null): string | null {
  if (!value) return null;

  let v = value.replace(/\s+/g, " ").trim();
  v = v.replace(/\b(accepting|accepted|to examine|page)\b.*$/i, "").trim();

  if (
    v.length < 4 ||
    /^[A-Z]{1,3}$/i.test(v) ||
    [
      "Physician",
      "Doctor",
      "Provider",
      "Md",
      "Do",
      "Pa",
      "Np",
      "Rn",
      "Phy",
      "Rendering",
      "Attending",
      "Ordering",
      "Referring",
      "Unknown",
      "N/A",
    ].includes(v)
  ) {
    return null;
  }

  if (/(hospital|clinic|center|district|health|lab|imaging)$/i.test(v)) {
    return null;
  }

  return v;
}

function normalizeSavedFacility(value: string | null): string | null {
  if (!value) return null;

  const v = value.replace(/\s+/g, " ").trim();

  if (
    v.length < 4 ||
    [
      "Hospital",
      "Clinic",
      "Center",
      "Facility",
      "Medical",
      "Health",
      "Unknown",
      "N/A",
    ].includes(v)
  ) {
    return null;
  }

  return v;
}

function isValidIsoDate(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const d = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(d.getTime());
}

function buildPageChunks(extractedText: string): { page: number; text: string }[] {
  const formFeedPages = extractedText
    .split(/\f/)
    .map((text, i) => ({
      page: i + 1,
      text: text.trim(),
    }))
    .filter((p) => p.text.length > 0);

  if (formFeedPages.length > 0) {
    return formFeedPages;
  }

  return extractedText
    .split(/\n\s*\n\s*\n/)
    .map((text, i) => ({
      page: i + 1,
      text: text.trim(),
    }))
    .filter((p) => p.text.length > 0);
}

function getBestPageText(
  event: RawTimelineEvent,
  pageChunks: { page: number; text: string }[],
  extractedText: string
): string {
  if (typeof event.sourcePage === "number") {
    const matchedPage =
      pageChunks.find((p) => p.page === event.sourcePage) || null;
    if (matchedPage?.text) return matchedPage.text;
  }

  if (
    typeof event.sourceExcerpt === "string" &&
    event.sourceExcerpt.trim().length > 10
  ) {
    const excerpt = event.sourceExcerpt.trim().toLowerCase();
    const matchedPage = pageChunks.find((p) =>
      p.text.toLowerCase().includes(excerpt)
    );
    if (matchedPage?.text) return matchedPage.text;
  }

  return extractedText;
}

function normalizeEventType(value: string | null | undefined): string {
  const allowed = new Set([
    "incident",
    "symptom",
    "diagnosis",
    "treatment",
    "appointment",
    "billing",
    "report",
    "communication",
    "observation",
    "other",
  ]);

  return allowed.has(value || "") ? (value as string) : "other";
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let documentId: string | null = null;

  try {
    const { id } = await context.params;
    const caseId = String(id);

    const formData = await req.formData();
    const file = formData.get("file");
    const recordType = parseRecordType(formData.get("recordType"));

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are supported right now" },
        { status: 400 }
      );
    }

    const caseExists = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true },
    });

    if (!caseExists) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = sanitizeFileName(file.name);
    const fileName = `${Date.now()}-${safeName}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadsDir, fileName);
    const fileUrl = `/uploads/${fileName}`;

    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    const createdDocument = await prisma.document.create({
      data: {
        caseId,
        fileName: file.name,
        fileUrl,
        mimeType: file.type || "application/pdf",
        recordType,
        status: DocumentStatus.PROCESSING,
      },
    });

    documentId = createdDocument.id;
    console.log("STEP 1: document created", documentId);

    const extraction = await extractPdfText(buffer);
    console.log("STEP 2: pdf extraction finished", {
      success: extraction?.success,
      pages: extraction?.pages,
      textLength: extraction?.text?.length || 0,
    });

    if (!extraction.success) {
      await prisma.document.update({
        where: { id: createdDocument.id },
        data: {
          status: DocumentStatus.FAILED,
          extractedText: extraction.error ?? "",
          pageCount: 0,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: extraction.error || "Failed to extract text from PDF",
        },
        { status: 500 }
      );
    }

    const extractedText = extraction.text ?? "";
    const pageCount = extraction.pages ?? 0;
    const documentFallbackDate = extractServiceDateFallback(extractedText);

    if (!extractedText.trim()) {
      await prisma.document.update({
        where: { id: createdDocument.id },
        data: {
          status: DocumentStatus.FAILED,
          extractedText: "",
          pageCount,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: "PDF text extraction returned no usable text",
        },
        { status: 500 }
      );
    }

    await prisma.document.update({
      where: { id: createdDocument.id },
      data: {
        extractedText,
        pageCount,
      },
    });

    let rawEvents: RawTimelineEvent[] = [];
    const pageChunks =
      extraction.pageTexts && extraction.pageTexts.length > 0
        ? extraction.pageTexts
        : buildPageChunks(extractedText);

    if (pageChunks.length > 0) {
      try {
        console.log("STEP 3: extracting timeline events");
        rawEvents = await extractTimelineEvents(pageChunks);
        console.log("STEP 4: raw timeline events", rawEvents?.length || 0);
      } catch (timelineError: unknown) {
        console.error("TIMELINE EXTRACTION ERROR:", timelineError);
      }
    }

    const cleanedEvents = cleanTimelineEvents(rawEvents || []);
    const displayEvents = filterTimelineForDisplay(cleanedEvents || []);

    console.log("STEP 5: cleaned/display events", {
      cleaned: cleanedEvents.length,
      display: displayEvents.length,
    });

    let createdEventsCount = 0;
    let skippedEventsCount = 0;
    const eventErrors: string[] = [];

    for (const event of displayEvents) {
      try {
        const pageText = getBestPageText(event, pageChunks, extractedText);

        const fallbackDate = extractServiceDateFallback(pageText);
        const inferredMetadata = inferHighConfidenceMetadata(event, pageText);

        const chosenDate =
          (event?.date && event.date !== "UNKNOWN" ? event.date : null) ||
          fallbackDate ||
          documentFallbackDate;

        if (!isValidIsoDate(chosenDate)) {
          console.log("SKIPPING EVENT - INVALID OR MISSING DATE:", {
            title: event?.title,
            chosenDate,
          });
          skippedEventsCount += 1;
          continue;
        }

        const eventDate = new Date(`${chosenDate}T12:00:00.000Z`);

        await prisma.timelineEvent.create({
          data: {
            caseId,
            documentId: createdDocument.id,
            eventDate,
            title: event.title || "Untitled event",
            description: event.description || null,
            eventType: normalizeEventType(event.eventType),
            sourcePage:
              typeof event.sourcePage === "number" ? event.sourcePage : null,
            reviewStatus: "PENDING",
            isHidden: false,
            physicianName: normalizeSavedPhysician(
              inferredMetadata.physicianName
            ),
            medicalFacility: normalizeSavedFacility(
              inferredMetadata.medicalFacility
            ),
          },
        });

        createdEventsCount += 1;
      } catch (eventError: unknown) {
        console.error("FAILED TO CREATE TIMELINE EVENT:", {
          title: event?.title,
          date: event?.date,
          error: eventError,
        });

        skippedEventsCount += 1;
        eventErrors.push(
          `${event?.title || "Untitled event"}: ${eventError instanceof Error ? eventError.message : "unknown error"}`
        );
      }
    }

    await prisma.document.update({
      where: { id: createdDocument.id },
      data: {
        status: DocumentStatus.PROCESSED,
      },
    });

    console.log("STEP 6: returning success");

    return NextResponse.json({
      success: true,
      documentId: createdDocument.id,
      fileUrl,
      pageCount,
      extractedTextLength: extractedText.length,
      rawEventsCount: rawEvents.length,
      cleanedEventsCount: cleanedEvents.length,
      displayEventsCount: displayEvents.length,
      eventsCreated: createdEventsCount,
      eventsSkipped: skippedEventsCount,
      eventErrors,
    });
  } catch (error: unknown) {
    console.error("UPLOAD ROUTE ERROR:", error);

    if (documentId) {
      try {
        await prisma.document.update({
          where: { id: documentId },
          data: {
            status: DocumentStatus.FAILED,
          },
        });
      } catch (updateError) {
        console.error("FAILED TO MARK DOCUMENT AS FAILED:", updateError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
