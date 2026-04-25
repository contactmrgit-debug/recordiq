import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type ProcessingJobStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "PARTIAL";

type LatestProcessingJobRow = {
  id: string;
  status: ProcessingJobStatus;
  totalPages: number | null;
  processedPages: number;
  currentStep: string | null;
  errorMessage: string | null;
  attempts: number;
  maxAttempts: number;
  startedAt: Date | null;
  completedAt: Date | null;
};

export async function GET(
  _req: NextRequest,
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
      select: {
        id: true,
        status: true,
        pageCount: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const [latestJob] = await prisma.$queryRaw<LatestProcessingJobRow[]>`
      SELECT
        "id",
        "status",
        "totalPages",
        "processedPages",
        "currentStep",
        "errorMessage",
        "attempts",
        "maxAttempts",
        "startedAt",
        "completedAt"
      FROM "ProcessingJob"
      WHERE "documentId" = ${id}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    const totalPages = latestJob?.totalPages ?? document.pageCount ?? null;
    const processedPages = latestJob?.processedPages ?? 0;
    const progressPercent =
      typeof totalPages === "number" && totalPages > 0
        ? Math.min(100, Math.round((processedPages / totalPages) * 100))
        : 0;

    return NextResponse.json({
      success: true,
      documentId: id,
      documentStatus: document.status,
      latestJobStatus: latestJob?.status ?? null,
      jobId: latestJob?.id ?? null,
      totalPages,
      processedPages,
      progressPercent,
      currentStep: latestJob?.currentStep ?? null,
      errorMessage: latestJob?.errorMessage ?? null,
      attempts: latestJob?.attempts ?? null,
      maxAttempts: latestJob?.maxAttempts ?? null,
      startedAt: latestJob?.startedAt ?? null,
      completedAt: latestJob?.completedAt ?? null,
    });
  } catch (error: unknown) {
    console.error("[documents/processing-status] request failed", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load processing status",
      },
      { status: 500 }
    );
  }
}
