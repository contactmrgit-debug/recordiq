import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

function getFileExtension(fileName: string): string {
  const match = fileName.match(/\.[a-zA-Z0-9]+$/);
  return match ? match[0].toLowerCase() : ".pdf";
}

export async function POST(req: NextRequest) {
  try {
    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing AWS environment variables. Check AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();

    const caseId =
      typeof body.caseId === "string" && body.caseId.trim()
        ? body.caseId.trim()
        : null;

    const fileName =
      typeof body.fileName === "string" && body.fileName.trim()
        ? body.fileName.trim()
        : null;

    const contentType =
      typeof body.contentType === "string" && body.contentType.trim()
        ? body.contentType.trim()
        : "application/pdf";

    if (!caseId) {
      return NextResponse.json(
        { success: false, error: "Missing caseId" },
        { status: 400 }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "Missing fileName" },
        { status: 400 }
      );
    }

    if (contentType !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF uploads are allowed" },
        { status: 400 }
      );
    }

    const safeFileName = sanitizeFileName(fileName);
    const extension = getFileExtension(safeFileName);
    const objectId = crypto.randomUUID();

    const key = `cases/${caseId}/documents/${objectId}${extension}`;

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      Metadata: {
        originalFileName: safeFileName,
        caseId,
      },
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 10,
    });

    return NextResponse.json({
      success: true,
      uploadUrl,
      key,
      bucket,
      region,
      expiresInSeconds: 600,
    });
  } catch (error: any) {
    console.error("S3 PRESIGN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create S3 upload URL",
      },
      { status: 500 }
    );
  }
}