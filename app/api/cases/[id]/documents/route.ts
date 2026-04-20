import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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
  } catch (error) {
    console.error("GET documents error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load documents" },
      { status: 500 }
    );
  }
}