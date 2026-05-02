import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const RESET_CONFIRMATION_TOKEN = "RESET_CASE_TIMELINE";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (process.env.NODE_ENV === "production") {
      console.warn("CASE_TIMELINE_RESET_BLOCKED", {
        reason: "production",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Case timeline reset is disabled in production",
        },
        { status: 403 }
      );
    }

    const confirmation = req.headers
      .get("x-dev-reset-confirm")
      ?.trim()
      .toUpperCase();

    if (confirmation !== RESET_CONFIRMATION_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing reset confirmation header. Send x-dev-reset-confirm: RESET_CASE_TIMELINE",
        },
        { status: 400 }
      );
    }

    const { id: caseId } = await context.params;

    if (!caseId?.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing case id" },
        { status: 400 }
      );
    }

    const caseRow = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        title: true,
        subjectName: true,
      },
    });

    if (!caseRow) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    const beforeCount = await prisma.timelineEvent.count({
      where: { caseId },
    });

    console.info("CASE_TIMELINE_RESET_START", {
      caseId,
      caseTitle: caseRow.title,
      subjectName: caseRow.subjectName,
      beforeCount,
    });

    const deleted = await prisma.timelineEvent.deleteMany({
      where: { caseId },
    });

    console.info("CASE_TIMELINE_RESET_DONE", {
      caseId,
      deletedCount: deleted.count,
    });

    return NextResponse.json({
      success: true,
      caseId,
      caseTitle: caseRow.title,
      subjectName: caseRow.subjectName,
      beforeCount,
      deletedCount: deleted.count,
    });
  } catch (error) {
    console.error("DELETE /api/cases/[id]/timeline-events/reset error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reset case timeline",
      },
      { status: 500 }
    );
  }
}
