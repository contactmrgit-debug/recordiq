import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateTimelineSummary } from "@/lib/timeline-summary";

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

    const summary = generateTimelineSummary(
      timelineEvents.map((event) => ({
        date: event.eventDate instanceof Date ? event.eventDate.toISOString().split("T")[0] : "UNKNOWN",
        title: event.title || "",
        description: event.description || "",
        eventType: event.eventType || "other",
        sourcePage: event.sourcePage ?? null,
      }))
    );

    return NextResponse.json({
      success: true,
      timelineEvents,
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
