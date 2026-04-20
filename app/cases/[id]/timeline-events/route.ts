import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const timelineEvents = await prisma.timelineEvent.findMany({
      where: { caseId: id },
      orderBy: [
        { eventDate: "asc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
    timelineEvents: timelineEvents.map((event) => ({
  id: event.id,
  date: event.eventDate
    ? event.eventDate.toISOString().split("T")[0]
    : "",
  title: event.title,
  description: event.description,
  eventType: event.eventType,

  // ❌ REMOVE THIS (you said you don't want it)
  // confidence: event.confidence,

  sourcePage: event.sourcePage,
  reviewStatus: event.reviewStatus,
  isHidden: event.isHidden,

  // ✅ ADD THESE (even if null for now)
  physicianName: (event as any).physicianName ?? null,
  doctorName: (event as any).doctorName ?? null,
  providerName: (event as any).providerName ?? null,
  physicians: (event as any).physicians ?? null,
}))
    });
  } catch (error) {
    console.error("GET timeline events error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load timeline events" },
      { status: 500 }
    );
  }
}