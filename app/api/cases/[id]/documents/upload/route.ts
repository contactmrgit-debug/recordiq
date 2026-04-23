import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^\w.\-]/g, "_");
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await context.params;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    const fileName = sanitizeFileName(file.name);
    const mimeType = file.type || "application/octet-stream";

    const document = await prisma.document.create({
      data: {
        caseId,
        fileName,
        fileUrl: "",
        mimeType,
        status: "UPLOADED",
      },
    });

    return NextResponse.json({
      success: true,
      documentId: document.id,
    });

  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Upload failed",
      },
      { status: 500 }
    );
  }
}