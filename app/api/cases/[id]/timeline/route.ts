import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json({
      success: true,
      timelineEvents,
    });
  } catch (error) {
    console.error("GET TIMELINE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch timeline events" },
      { status: 500 }
    );
  }
}
