import { NextResponse } from "next/server";
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
      case: caseData,
    });
  } catch (error) {
    console.error("GET case error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load case" },
      { status: 500 }
    );
  }
}
