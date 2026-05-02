import { NextRequest, NextResponse } from "next/server";
import { repairPersistedTimelineEvents } from "@/lib/document-processing";
import { loadRepairPageTextsForDocuments } from "@/lib/document-processing";
import { prisma } from "@/lib/prisma";
import { generateTimelineSummary } from "@/lib/timeline-summary";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const includeHidden = req.nextUrl.searchParams.get("includeHidden") === "1";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing case id", timelineEvents: [] },
        { status: 400 }
      );
    }

    const timelineEvents = await prisma.timelineEvent.findMany({
      where: {
        caseId: id,
        ...(includeHidden ? {} : { isHidden: false }),
      },
      orderBy: {
        eventDate: "asc",
      },
      select: {
        id: true,
        caseId: true,
        documentId: true,
        eventDate: true,
        title: true,
        description: true,
        eventType: true,
        sourcePage: true,
        reviewStatus: true,
        isHidden: true,
        physicianName: true,
        medicalFacility: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const pageTextsByDocument = await loadRepairPageTextsForDocuments(
      timelineEvents
        .map((event) => event.documentId)
        .filter((documentId): documentId is string => Boolean(documentId))
    );

    const documentContexts = await prisma.document.findMany({
      where: {
        id: {
          in: timelineEvents
            .map((event) => event.documentId)
            .filter((documentId): documentId is string => Boolean(documentId)),
        },
      },
      select: {
        id: true,
        fileName: true,
        recordType: true,
      },
    });
    const documentContextById = new Map(
      documentContexts.map((document) => [document.id, document])
    );

    const rawEventsByDocument = new Map<
      string,
      {
        index: number;
        event: {
          date: string;
          title: string;
          description: string;
          eventType: string;
          sourcePage: number | null;
          documentName: string | null;
          reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
          isHidden: boolean;
          physicianName: string | null;
          medicalFacility: string | null;
          sourceExcerpt: string;
        };
      }[]
    >();

    const timelineEventsResponse = timelineEvents.map((event, index) => {
      const documentId = event.documentId || "";
      if (documentId) {
        const list = rawEventsByDocument.get(documentId) ?? [];
        list.push({
          index,
          event: {
            date:
              event.eventDate instanceof Date
                ? event.eventDate.toISOString().split("T")[0]
                : "UNKNOWN",
            title: event.title || "",
            description: event.description || "",
            eventType: event.eventType || "other",
            sourcePage: event.sourcePage ?? null,
            reviewStatus: event.reviewStatus || "PENDING",
            isHidden: event.isHidden ?? false,
            physicianName: event.physicianName || null,
            medicalFacility: event.medicalFacility || null,
            documentName: documentContextById.get(documentId)?.fileName || null,
            sourceExcerpt: event.description || "",
          },
        });
        rawEventsByDocument.set(documentId, list);
      }

      return {
        id: event.id,
        date:
          event.eventDate instanceof Date
            ? event.eventDate.toISOString().split("T")[0]
            : "UNKNOWN",
        title: event.title || "",
        description: event.description || "",
        eventType: event.eventType || "other",
        sourcePage: event.sourcePage ?? null,
        reviewStatus: event.reviewStatus || "PENDING",
        isHidden: event.isHidden ?? false,
        documentId: event.documentId || null,
        documentName: documentContextById.get(event.documentId || "")?.fileName || null,
        physicianName: event.physicianName || null,
        medicalFacility: event.medicalFacility || null,
      };
    }) as Array<
      | {
          id: string;
          date: string;
          title: string;
          description: string;
          eventType: string;
          sourcePage: number | null;
          documentName: string | null;
          reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
          isHidden: boolean;
          documentId: string | null;
          physicianName: string | null;
          medicalFacility: string | null;
        }
      | null
    >;

    for (const [documentId, items] of rawEventsByDocument.entries()) {
      const pageTexts = pageTextsByDocument.get(documentId) ?? [];
      const context = documentContextById.get(documentId) ?? undefined;
      if (!pageTexts.length) continue;

      const repairedGroup = repairPersistedTimelineEvents(
        items.map((item) => item.event),
        pageTexts,
        context
      );

      for (let i = 0; i < items.length; i++) {
        const { index } = items[i];
        const repaired = repairedGroup[i];
        const current = timelineEventsResponse[index];
        if (
          !repaired ||
          (!repaired.title.trim() && !(repaired.description || "").trim())
        ) {
          timelineEventsResponse[index] = null;
          continue;
        }

        if (!current) {
          continue;
        }

        timelineEventsResponse[index] = {
          ...current,
          date: repaired.date,
          title: repaired.title || "",
          description: repaired.description || "",
          eventType: repaired.eventType || "other",
          sourcePage: repaired.sourcePage ?? null,
          documentName: current.documentName,
          reviewStatus: timelineEvents[index].reviewStatus || "PENDING",
          isHidden: repaired.isHidden ?? false,
          physicianName: repaired.physicianName || null,
          medicalFacility: repaired.medicalFacility || current.medicalFacility || null,
        };
      }
    }

    const finalTimelineEvents = timelineEventsResponse.filter(
      (event): event is NonNullable<(typeof timelineEventsResponse)[number]> =>
        Boolean(event)
    );

    const summary = generateTimelineSummary(finalTimelineEvents);

    const responseTimelineEvents = timelineEvents
      .map((event, index) => {
        const repaired = timelineEventsResponse[index];
        if (!repaired) {
          return null;
        }

        return {
          ...event,
          eventDate: event.eventDate,
          title: repaired.title,
          description: repaired.description,
          eventType: repaired.eventType,
          sourcePage: repaired.sourcePage,
          documentName: repaired.documentName || null,
          reviewStatus: repaired.reviewStatus,
          isHidden: repaired.isHidden,
          physicianName: repaired.physicianName,
          medicalFacility: repaired.medicalFacility,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      timelineEvents: responseTimelineEvents,
      summary,
    });
  } catch (error) {
    console.error("GET /api/cases/[id]/timeline-events error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load timeline events",
        timelineEvents: [],
      },
      { status: 500 }
    );
  }
}
