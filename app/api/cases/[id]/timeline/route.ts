import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateTimelineSummary } from "@/lib/timeline-summary";
import { repairPersistedTimelineEvents } from "@/lib/document-processing";

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

    const documentIds = Array.from(
      new Set(timelineEvents.map((event) => event.documentId).filter(Boolean) as string[])
    );
    const pageRows = documentIds.length
      ? await prisma.documentPage.findMany({
          where: { documentId: { in: documentIds } },
          select: {
            documentId: true,
            pageNumber: true,
            text: true,
          },
          orderBy: [{ documentId: "asc" }, { pageNumber: "asc" }],
        })
      : [];

    const pageTextsByDocument = new Map<string, { page: number; text: string }[]>();
    for (const row of pageRows) {
      const list = pageTextsByDocument.get(row.documentId) ?? [];
      list.push({
        page: row.pageNumber,
        text: row.text || "",
      });
      pageTextsByDocument.set(row.documentId, list);
    }

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
          reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
          isHidden: boolean;
          physicianName: string | null;
          medicalFacility: string | null;
          sourceExcerpt: string;
        };
      }[]
    >();

    const repairedTimelineEvents = timelineEvents.map((event, index) => {
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
            sourceExcerpt: event.description || "",
          },
        });
        rawEventsByDocument.set(documentId, list);
      }

      return {
        date:
          event.eventDate instanceof Date
            ? event.eventDate.toISOString().split("T")[0]
            : "UNKNOWN",
        title: event.title || "",
        description: event.description || "",
        eventType: event.eventType || "other",
        sourcePage: event.sourcePage ?? null,
      };
    });

    const repairedForSummary = [...repairedTimelineEvents];
    for (const [documentId, items] of rawEventsByDocument.entries()) {
      const repairedGroup = repairPersistedTimelineEvents(
        items.map((item) => item.event),
        pageTextsByDocument.get(documentId) ?? []
      );

      for (let i = 0; i < items.length; i++) {
        const { index } = items[i];
        const repaired = repairedGroup[i];
        repairedForSummary[index] = {
          date: repaired.date,
          title: repaired.title || "",
          description: repaired.description || "",
          eventType: repaired.eventType || "other",
          sourcePage: repaired.sourcePage ?? null,
        };
      }
    }

    const summary = generateTimelineSummary(
      repairedForSummary.map((event) => ({
        date: event.date,
        title: event.title || "",
        description: event.description || "",
        eventType: event.eventType || "other",
        sourcePage: event.sourcePage ?? null,
      }))
    );

    return NextResponse.json({
      success: true,
      timelineEvents: repairedForSummary.map((event, index) => ({
        ...timelineEvents[index],
        eventDate: timelineEvents[index].eventDate,
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        sourcePage: event.sourcePage,
        reviewStatus: timelineEvents[index].reviewStatus,
        isHidden: timelineEvents[index].isHidden,
        physicianName: timelineEvents[index].physicianName,
        medicalFacility: timelineEvents[index].medicalFacility,
      })),
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
