import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildTieredTimelineSummary } from "@/lib/timeline-summary";
import { formatTimelineDateValue } from "@/lib/timeline-date";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const caseData = await prisma.case.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        caseType: true,
        subjectName: true,
        createdAt: true,
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    const subjectName = caseData.subjectName ?? "";

    const timelineEvents = await prisma.timelineEvent.findMany({
      where: {
        caseId: id,
        isHidden: false,
        OR: [
          { reviewStatus: "APPROVED" },
          { reviewStatus: "PENDING" },
          { reviewStatus: null },
        ],
      },
      orderBy: {
        eventDate: "asc",
      },
      select: {
        id: true,
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
      },
    });

    const responseTimelineEvents = timelineEvents.map((event) => ({
      id: event.id,
      date: formatTimelineDateValue(event.eventDate),
      eventDate: formatTimelineDateValue(event.eventDate),
      title: event.title || "",
      description: event.description || "",
      eventType: event.eventType || "other",
      sourcePage: event.sourcePage ?? null,
      documentId: event.documentId ?? null,
      physicianName: event.physicianName ?? null,
      medicalFacility: event.medicalFacility ?? null,
      reviewStatus: event.reviewStatus || "PENDING",
      isHidden: event.isHidden ?? false,
    }));

    const summary = buildTieredTimelineSummary(responseTimelineEvents);

    return NextResponse.json({
      success: true,
      case: {
        ...caseData,
        patientName: subjectName,
        subjectName,
      },
      summary,
    });
  } catch (error) {
    console.error("GET case error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load case" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const updates: { title?: string; subjectName?: string | null } = {};

    if (typeof body?.title === "string") {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json(
          { success: false, error: "Case title cannot be empty" },
          { status: 400 }
        );
      }
      updates.title = title;
    }

    if ("subjectName" in body) {
      if (typeof body.subjectName === "string") {
        const subjectName = body.subjectName.trim();
        updates.subjectName = subjectName || null;
      } else if (body.subjectName === null) {
        updates.subjectName = null;
      } else {
        return NextResponse.json(
          { success: false, error: "Patient name must be a string or null" },
          { status: 400 }
        );
      }
    } else if ("patientName" in body) {
      if (typeof body.patientName === "string") {
        const patientName = body.patientName.trim();
        updates.subjectName = patientName || null;
      } else if (body.patientName === null) {
        updates.subjectName = null;
      } else {
        return NextResponse.json(
          { success: false, error: "Patient name must be a string or null" },
          { status: 400 }
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const updatedCase = await prisma.case.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        title: true,
        description: true,
        caseType: true,
        subjectName: true,
        createdAt: true,
      },
    });

    const subjectName = updatedCase.subjectName ?? "";

    return NextResponse.json({
      success: true,
      case: {
        ...updatedCase,
        patientName: subjectName,
        subjectName,
      },
    });
  } catch (error) {
    console.error("PATCH case error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update case title",
      },
      { status: 500 }
    );
  }
}
