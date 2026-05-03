import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateTimelineSummary } from "@/lib/timeline-summary";
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
    const responseTimelineEvents = timelineEvents.map((event) => ({
      id: event.id,
      caseId: event.caseId,
      documentId: event.documentId || null,
      documentName:
        documentContextById.get(event.documentId || "")?.fileName || null,
      date: formatTimelineDateValue(event.eventDate),
      eventDate: formatTimelineDateValue(event.eventDate),
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
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    const summary = generateTimelineSummary(responseTimelineEvents);

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
