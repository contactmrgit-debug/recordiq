import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing case id", documents: [] },
        { status: 400 }
      );
    }

    const documents = await prisma.document.findMany({
      where: { caseId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        recordType: true,
        status: true,
        pageCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error: any) {
    console.error("GET DOCUMENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to load documents",
        documents: [],
      },
      { status: 500 }
    );
  }
}
