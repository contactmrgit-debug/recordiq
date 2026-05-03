import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateTimelineSummary } from "@/lib/timeline-summary";
import {
  loadRepairPageTextsForDocuments,
  repairPersistedTimelineEvents,
} from "@/lib/document-processing";
import { formatTimelineDateValue } from "@/lib/timeline-date";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const caseId = id;

    const timelineEvents = await prisma.timelineEvent.findMany({
      where: {
        caseId,
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
          providerName: string | null;
          providerRole: string | null;
          physicianName: string | null;
          physicianRole: string | null;
          medicalFacility: string | null;
          sourceExcerpt: string;
        };
      }[]
    >();

    const repairedTimelineEvents = timelineEvents.map((event, index) => {
      const mappedDate = formatTimelineDateValue(event.eventDate);
      const documentId = event.documentId || "";
      if (documentId) {
        const list = rawEventsByDocument.get(documentId) ?? [];
        list.push({
          index,
          event: {
            date: mappedDate,
            title: event.title || "",
            description: event.description || "",
            eventType: event.eventType || "other",
            sourcePage: event.sourcePage ?? null,
            reviewStatus: event.reviewStatus || "PENDING",
            isHidden: event.isHidden ?? false,
            providerName: null,
            providerRole: null,
            physicianName: event.physicianName || null,
            physicianRole: null,
            medicalFacility: event.medicalFacility || null,
            documentName: documentContextById.get(documentId)?.fileName || null,
            sourceExcerpt: event.description || "",
          },
        });
        rawEventsByDocument.set(documentId, list);
      }

      return {
        date: mappedDate,
        eventDate: mappedDate,
        title: event.title || "",
        description: event.description || "",
        eventType: event.eventType || "other",
        sourcePage: event.sourcePage ?? null,
        documentName: documentContextById.get(event.documentId || "")?.fileName || null,
        medicalFacility: event.medicalFacility || null,
        providerName: null,
        providerRole: null,
        physicianName: event.physicianName || null,
        physicianRole: null,
      };
    }) as Array<{
      date: string;
      eventDate: string;
      title: string;
      description: string;
      eventType: string;
      sourcePage: number | null;
      documentName: string | null;
      medicalFacility: string | null;
      providerName: string | null;
      providerRole: string | null;
      physicianName: string | null;
      physicianRole: string | null;
    } | null>;

    const repairedForSummary = [...repairedTimelineEvents];
    for (const [documentId, items] of rawEventsByDocument.entries()) {
      const pageTexts = pageTextsByDocument.get(documentId) ?? [];
      const context = documentContextById.get(documentId) ?? undefined;
      const sourcePacketName = context?.fileName || null;
      if (!pageTexts.length) continue;

      const repairedGroup = repairPersistedTimelineEvents(
        items.map((item) => item.event),
        pageTexts,
        context
      );

      for (let i = 0; i < items.length; i++) {
        const { index } = items[i];
        const repaired = repairedGroup[i];
        if (
          !repaired ||
          (!repaired.title.trim() && !(repaired.description || "").trim())
        ) {
          repairedForSummary[index] = null;
          continue;
        }

        repairedForSummary[index] = {
          date: repaired.date,
          eventDate: repaired.date,
          title: repaired.title || "",
          description: repaired.description || "",
          eventType: repaired.eventType || "other",
          sourcePage: repaired.sourcePage ?? null,
          documentName: sourcePacketName,
          providerName: repaired.providerName || null,
          providerRole: repaired.providerRole || null,
          physicianName: repaired.physicianName || null,
          physicianRole: repaired.physicianRole || null,
          medicalFacility: repaired.medicalFacility || timelineEvents[index].medicalFacility || null,
        };
      }
    }

    const filteredSummaryEvents = repairedForSummary.filter(
      (event): event is NonNullable<(typeof repairedForSummary)[number]> =>
        Boolean(event)
    );

    const summary = generateTimelineSummary(
      filteredSummaryEvents.map((event) => ({
        date: event.date,
        title: event.title || "",
        description: event.description || "",
        eventType: event.eventType || "other",
        sourcePage: event.sourcePage ?? null,
        documentName: event.documentName || null,
        medicalFacility: event.medicalFacility || null,
        providerName: event.providerName || null,
        providerRole: event.providerRole || null,
        physicianName: event.physicianName || null,
        physicianRole: event.physicianRole || null,
      }))
    );

    const responseTimelineEvents = timelineEvents
      .map((event, index) => {
        const repaired = repairedForSummary[index];
        if (!repaired) {
          return null;
        }

        return {
          ...event,
          date: formatTimelineDateValue(event.eventDate),
          eventDate: formatTimelineDateValue(event.eventDate),
          title: repaired.title,
          description: repaired.description,
          eventType: repaired.eventType,
          sourcePage: repaired.sourcePage,
          documentName: repaired.documentName || null,
          reviewStatus: event.reviewStatus,
          isHidden: event.isHidden,
          providerName: repaired.providerName || null,
          providerRole: repaired.providerRole || null,
          physicianName: event.physicianName,
          physicianRole: repaired.physicianRole || null,
          medicalFacility: event.medicalFacility,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      timelineEvents: responseTimelineEvents,
      summary,
    });
  } catch (error) {
    console.error("GET TIMELINE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch timeline events" },
      { status: 500 }
    );
  }
}
