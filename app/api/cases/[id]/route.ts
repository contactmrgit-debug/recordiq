import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({
      success: true,
      case: {
        ...caseData,
        patientName: caseData.subjectName ?? "",
        subjectName: caseData.subjectName ?? "",
      },
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

    return NextResponse.json({
      success: true,
      case: {
        ...updatedCase,
        patientName: updatedCase.subjectName ?? "",
        subjectName: updatedCase.subjectName ?? "",
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
