import { NextRequest, NextResponse } from "next/server";
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

    const timelineEventsResponse = timelineEvents.map((event) => ({
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
      }));

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
