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
    const file = formData.get("file") as File | null;
    const recordTypeValue = formData.get("recordType");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const fileName = sanitizeFileName(file.name);
    const mimeType = file.type || "application/octet-stream";
    const buffer = Buffer.from(await file.arrayBuffer());

    // Temporary placeholder:
    // You should replace this with Supabase Storage or S3 upload.
    // For now, we only save the DB row so the route stays lightweight.
    void buffer;

    const document = await prisma.document.create({
      data: {
        caseId,
        fileName,
        fileUrl: "",
        mimeType,
        status: "UPLOADED",
        ...(typeof recordTypeValue === "string" && recordTypeValue.trim()
          ? { recordType: recordTypeValue.trim() as any }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      documentId: document.id,
      message: "File uploaded successfully. Processing will be handled separately.",
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