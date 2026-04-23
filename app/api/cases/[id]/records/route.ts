import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await context.params;

    const records = await prisma.document.findMany({
      where: {
        caseId,
      },
     orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("GET RECORDS ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
