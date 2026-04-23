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
    const recordTypeRaw = formData.get("recordType");

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
    const buffer = Buffer.from(await file.arrayBuffer());

    // Placeholder until storage is wired up
    void buffer;

    const recordType =
      typeof recordTypeRaw === "string" && recordTypeRaw.trim()
        ? recordTypeRaw.trim()
        : null;

    const document = await prisma.document.create({
      data: {
        caseId,
        fileName,
        fileUrl: "",
        mimeType,
        status: "UPLOADED",
        ...(recordType ? { recordType: recordType as any } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      documentId: document.id,
      message: "Upload saved. Processing will run separately.",
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