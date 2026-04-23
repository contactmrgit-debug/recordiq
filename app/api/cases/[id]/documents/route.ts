import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await context.params;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert file to buffer (for storage upload if needed)
    const buffer = Buffer.from(await file.arrayBuffer());

    // TODO: Replace this with real storage (S3 / Supabase Storage)
    // For now, just store filename as placeholder
    const fileName = file.name;

    const document = await prisma.document.create({
      data: {
        caseId,
        fileName,
        fileUrl: "", // will be replaced after storage integration
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