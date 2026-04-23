import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updates: {
      reviewStatus?: ReviewStatus;
      isHidden?: boolean;
      title?: string;
      description?: string | null;
    } = {};

    if (
      body.reviewStatus &&
      ["PENDING", "APPROVED", "REJECTED"].includes(body.reviewStatus)
    ) {
      updates.reviewStatus = body.reviewStatus;
    }

    if (typeof body.isHidden === "boolean") {
      updates.isHidden = body.isHidden;
    }

    if (typeof body.title === "string") {
      updates.title = body.title.trim();
    }

    if ("description" in body) {
      updates.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.timelineEvent.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      timelineEvent: updatedEvent,
    });
  } catch (error) {
    console.error("PATCH /api/timeline-events/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update timeline event",
      },
      { status: 500 }
    );
  }
}
