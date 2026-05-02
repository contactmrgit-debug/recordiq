import { NextRequest, NextResponse } from "next/server";
import { repairPersistedTimelineEvents } from "@/lib/document-processing";
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
        physicianName: event.physicianName || null,
        medicalFacility: event.medicalFacility || null,
      };
    });

    for (const [documentId, items] of rawEventsByDocument.entries()) {
      const repairedGroup = repairPersistedTimelineEvents(
        items.map((item) => item.event),
        pageTextsByDocument.get(documentId) ?? []
      );

      for (let i = 0; i < items.length; i++) {
        const { index } = items[i];
        const repaired = repairedGroup[i];
        timelineEventsResponse[index] = {
          ...timelineEventsResponse[index],
          date: repaired.date,
          title: repaired.title || "",
          description: repaired.description || "",
          eventType: repaired.eventType || "other",
          sourcePage: repaired.sourcePage ?? null,
          reviewStatus: timelineEvents[index].reviewStatus || "PENDING",
          isHidden: repaired.isHidden ?? false,
          physicianName: repaired.physicianName || null,
          medicalFacility: repaired.medicalFacility || null,
        };
      }
    }

    const summary = generateTimelineSummary(timelineEventsResponse);

    return NextResponse.json({
      success: true,
      timelineEvents: timelineEventsResponse,
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
