import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const timelineEvents = await prisma.timelineEvent.findMany({
      where: { caseId: id },
      orderBy: {
        eventDate: "asc",
      },
    });

    console.log("######## TIMELINE RAW ########");
    console.log(
      timelineEvents.map((event) => ({
        id: event.id,
        title: event.title,
        sourcePage: event.sourcePage,
        documentId: event.documentId,
        physicianName: event.physicianName,
        medicalFacility: event.medicalFacility,
      }))
    );
    console.log("######## END TIMELINE RAW ########");

    return NextResponse.json({
      success: true,
      timelineEvents: timelineEvents.map((event) => ({
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
      })),
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
      },
      { status: 500 }
    );
  }
}
