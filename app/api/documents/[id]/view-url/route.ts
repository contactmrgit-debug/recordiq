import { NextResponse } from "next/server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type S3Location = {
  bucket: string;
  key: string;
  region?: string;
};

function parseS3Location(fileUrl: string): S3Location | null {
  if (fileUrl.startsWith("s3://")) {
    const remainder = fileUrl.slice("s3://".length);
    const slashIndex = remainder.indexOf("/");

    if (slashIndex <= 0) {
      return null;
    }

    return {
      bucket: remainder.slice(0, slashIndex),
      key: remainder.slice(slashIndex + 1),
    };
  }

  try {
    const url = new URL(fileUrl);
    const host = url.hostname;
    const path = url.pathname.replace(/^\/+/, "");

    const virtualHostedMatch = host.match(
      /^([^./]+)\.s3[.-]([a-z0-9-]+)\.amazonaws\.com$/i
    );
    if (virtualHostedMatch) {
      return {
        bucket: virtualHostedMatch[1],
        region: virtualHostedMatch[2],
        key: path,
      };
    }

    const pathStyleMatch = host.match(/^s3[.-]([a-z0-9-]+)\.amazonaws\.com$/i);
    if (pathStyleMatch) {
      const [bucket, ...keyParts] = path.split("/");
      if (!bucket || keyParts.length === 0) {
        return null;
      }

      return {
        bucket,
        region: pathStyleMatch[1],
        key: keyParts.join("/"),
      };
    }
  } catch {
    return null;
  }

  return null;
}

async function signS3Url(fileUrl: string): Promise<string> {
  const region =
    process.env.AWS_REGION ||
    process.env.AWS_S3_REGION ||
    process.env.AWS_DEFAULT_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing AWS credentials. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
    );
  }

  if (!region && !parseS3Location(fileUrl)?.region) {
    throw new Error("Missing AWS region for S3 signing");
  }

  const location = parseS3Location(fileUrl);
  if (!location?.bucket || !location.key) {
    throw new Error("Invalid S3 fileUrl");
  }

  const client = new S3Client({
    region: location.region || region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

  const command = new GetObjectCommand({
    Bucket: location.bucket,
    Key: location.key,
  });

  return getSignedUrl(client, command, { expiresIn: 60 * 5 });
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing document id" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id },
      select: { fileUrl: true },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const fileUrl = (document.fileUrl || "").trim();
    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "Invalid fileUrl" },
        { status: 400 }
      );
    }

    if (fileUrl.startsWith("/uploads/")) {
      return NextResponse.json({
        success: true,
        url: fileUrl,
      });
    }

    if (fileUrl.startsWith("s3://") || fileUrl.includes(".s3.")) {
      const url = await signS3Url(fileUrl);

      return NextResponse.json({
        success: true,
        url,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid fileUrl" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[documents/view-url] request failed", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate view URL",
      },
      { status: 500 }
    );
  }
}
