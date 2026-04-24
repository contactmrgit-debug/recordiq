import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing case id", timelineEvents: [] },
        { status: 400 }
      );
    }

    const timelineEvents = await prisma.timelineEvent.findMany({
      where: { caseId: id },
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
        timelineEvents: [],
      },
      { status: 500 }
    );
  }
}
