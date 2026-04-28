import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTimelineSummary } from "@/lib/timeline-summary";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const timelineEvents = await prisma.timelineEvent.findMany({
      where: { caseId: id },
      orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
    });

    const timelineEventsResponse = timelineEvents.map((event) => ({
      id: event.id,
      date: event.eventDate ? event.eventDate.toISOString().split("T")[0] : "",
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      sourcePage: event.sourcePage,
      reviewStatus: event.reviewStatus,
      isHidden: event.isHidden,
      physicianName: event.physicianName,
      medicalFacility: event.medicalFacility,
    }));

    const summary = generateTimelineSummary(timelineEventsResponse);

    return NextResponse.json({
      success: true,
      timelineEvents: timelineEventsResponse,
      summary,
    });
  } catch (error) {
    console.error("GET timeline events error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load timeline events" },
      { status: 500 }
    );
  }
}
