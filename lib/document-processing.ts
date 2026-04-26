import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Prisma, RecordType } from "@prisma/client";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { extractTimelineEvents } from "@/lib/ai-timeline";
import {
  cleanTimelineEvents,
  hasMeaningfulClinicalSignal,
  RawTimelineEvent,
} from "@/lib/timeline-cleanup";
import {
  extractPdfChunkText,
  getPdfPageCount,
  PdfChunkPageText,
} from "@/lib/pdf-chunk-extract";
import { prisma } from "@/lib/prisma";

export type ProcessingJobStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "PARTIAL";

export type QueueDocumentProcessingInput = {
  caseId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  recordType?: RecordType | null;
};

type ProcessingJobRow = {
  id: string;
  documentId: string;
  caseId: string;
  status: ProcessingJobStatus;
  totalPages: number | null;
  processedPages: number;
  currentStep: string | null;
  errorMessage: string | null;
  attempts: number;
  maxAttempts: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type DocumentArtifactStatus = {
  jobId: string;
  documentId: string;
  caseId: string;
  status: ProcessingJobStatus;
};

type ProcessingOutcome =
  | {
      success: true;
      job: ProcessingJobRow;
      documentId: string;
      totalPages: number;
      processedPages: number;
      savedEvents: number;
    }
  | {
      success: false;
      job: ProcessingJobRow;
      documentId: string;
      totalPages: number;
      processedPages: number;
      errorMessage: string;
      finalStatus: Exclude<ProcessingJobStatus, "QUEUED">;
    };

const PDF_CHUNK_SIZE = 10;

function normalizeFileName(fileName: string): string {
  return fileName.replace(/[^\w.\-]/g, "_").replace(/_+/g, "_");
}

function isPdfUpload(fileName: string, mimeType: string): boolean {
  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  return (
    lowerMime === "application/pdf" ||
    lowerMime === "application/x-pdf" ||
    lowerName.endsWith(".pdf")
  );
}

function normalizeWhitespace(value?: string | null): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function parseDateToUtc(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeReviewStatus(
  value?: string | null
): "PENDING" | "APPROVED" | "REJECTED" {
  const normalized = (value || "").trim().toUpperCase();

  if (normalized === "APPROVED") return "APPROVED";
  if (normalized === "REJECTED") return "REJECTED";

  return "PENDING";
}

function parseS3Location(fileUrl: string): {
  bucket: string;
  key: string;
  region?: string;
} | null {
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
    const pathName = url.pathname.replace(/^\/+/, "");

    const virtualHostedMatch = host.match(
      /^([^./]+)\.s3[.-]([a-z0-9-]+)\.amazonaws\.com$/i
    );
    if (virtualHostedMatch) {
      return {
        bucket: virtualHostedMatch[1],
        region: virtualHostedMatch[2],
        key: pathName,
      };
    }

    const pathStyleMatch = host.match(/^s3[.-]([a-z0-9-]+)\.amazonaws\.com$/i);
    if (pathStyleMatch) {
      const [bucket, ...keyParts] = pathName.split("/");
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

async function bodyToBuffer(body: unknown): Promise<Buffer> {
  if (!body) {
    throw new Error("Empty S3 response body");
  }

  const maybeBody = body as {
    transformToByteArray?: () => Promise<Uint8Array>;
    arrayBuffer?: () => Promise<ArrayBuffer>;
  };

  if (typeof maybeBody.transformToByteArray === "function") {
    const bytes = await maybeBody.transformToByteArray();
    return Buffer.from(bytes);
  }

  if (typeof maybeBody.arrayBuffer === "function") {
    const arrayBuffer = await maybeBody.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<unknown>) {
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
    } else if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk));
    } else {
      chunks.push(Buffer.from(chunk as ArrayBufferLike));
    }
  }

  return Buffer.concat(chunks);
}

async function downloadPdfBuffer(fileUrl: string): Promise<Buffer> {
  if (fileUrl.startsWith("/uploads/")) {
    const absolutePath = path.join(
      process.cwd(),
      "public",
      fileUrl.replace(/^\/+/, "")
    );

    return fs.readFile(absolutePath);
  }

  const location = parseS3Location(fileUrl);
  if (!location?.bucket || !location.key) {
    throw new Error("Unsupported document fileUrl");
  }

  const region =
    location.region ||
    process.env.AWS_REGION ||
    process.env.AWS_S3_REGION ||
    process.env.AWS_DEFAULT_REGION;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region) {
    throw new Error("Missing AWS region for PDF download");
  }

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Missing AWS credentials for PDF download");
  }

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

  const response = await client.send(
    new GetObjectCommand({
      Bucket: location.bucket,
      Key: location.key,
    })
  );

  return bodyToBuffer(response.Body);
}

async function insertProcessingJob(
  db: typeof prisma,
  input: {
    jobId: string;
    documentId: string;
    caseId: string;
  }
): Promise<ProcessingJobRow> {
  const [job] = await db.$queryRaw<ProcessingJobRow[]>(Prisma.sql`
    INSERT INTO "ProcessingJob" (
      "id",
      "documentId",
      "caseId",
      "status",
      "totalPages",
      "processedPages",
      "currentStep",
      "errorMessage",
      "attempts",
      "maxAttempts",
      "startedAt",
      "completedAt",
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${input.jobId},
      ${input.documentId},
      ${input.caseId},
      ${"QUEUED"}::"ProcessingJobStatus",
      ${null},
      ${0},
      ${"queued"},
      ${null},
      ${0},
      ${3},
      ${null},
      ${null},
      NOW(),
      NOW()
    )
    RETURNING
      "id",
      "documentId",
      "caseId",
      "status",
      "totalPages",
      "processedPages",
      "currentStep",
      "errorMessage",
      "attempts",
      "maxAttempts",
      "startedAt",
      "completedAt",
      "createdAt",
      "updatedAt"
  `);

  if (!job) {
    throw new Error("Failed to create processing job");
  }

  return job;
}

async function updateProcessingJob(
  jobId: string,
  changes: {
    status?: ProcessingJobStatus;
    totalPages?: number | null;
    processedPages?: number;
    currentStep?: string | null;
    errorMessage?: string | null;
    attempts?: number;
    maxAttempts?: number;
    startedAt?: Date | null;
    completedAt?: Date | null;
  }
): Promise<ProcessingJobRow> {
  const assignments: Prisma.Sql[] = [];

  if (changes.status !== undefined) {
    assignments.push(
      Prisma.sql`"status" = ${changes.status}::"ProcessingJobStatus"`
    );
  }
  if (changes.totalPages !== undefined) {
    assignments.push(Prisma.sql`"totalPages" = ${changes.totalPages}`);
  }
  if (changes.processedPages !== undefined) {
    assignments.push(Prisma.sql`"processedPages" = ${changes.processedPages}`);
  }
  if (changes.currentStep !== undefined) {
    assignments.push(Prisma.sql`"currentStep" = ${changes.currentStep}`);
  }
  if (changes.errorMessage !== undefined) {
    assignments.push(Prisma.sql`"errorMessage" = ${changes.errorMessage}`);
  }
  if (changes.attempts !== undefined) {
    assignments.push(Prisma.sql`"attempts" = ${changes.attempts}`);
  }
  if (changes.maxAttempts !== undefined) {
    assignments.push(Prisma.sql`"maxAttempts" = ${changes.maxAttempts}`);
  }
  if (changes.startedAt !== undefined) {
    assignments.push(Prisma.sql`"startedAt" = ${changes.startedAt}`);
  }
  if (changes.completedAt !== undefined) {
    assignments.push(Prisma.sql`"completedAt" = ${changes.completedAt}`);
  }

  assignments.push(Prisma.sql`"updatedAt" = NOW()`);

  const [job] = await prisma.$queryRaw<ProcessingJobRow[]>(Prisma.sql`
    UPDATE "ProcessingJob"
    SET ${Prisma.join(assignments, ", ")}
    WHERE "id" = ${jobId}
    RETURNING
      "id",
      "documentId",
      "caseId",
      "status",
      "totalPages",
      "processedPages",
      "currentStep",
      "errorMessage",
      "attempts",
      "maxAttempts",
      "startedAt",
      "completedAt",
      "createdAt",
      "updatedAt"
  `);

  if (!job) {
    throw new Error(`Processing job not found: ${jobId}`);
  }

  return job;
}

async function claimNextQueuedProcessingJob(): Promise<ProcessingJobRow | null> {
  const [job] = await prisma.$queryRaw<ProcessingJobRow[]>(Prisma.sql`
    WITH next_job AS (
      SELECT "id"
      FROM "ProcessingJob"
      WHERE "status" = ${"QUEUED"}::"ProcessingJobStatus"
      ORDER BY "createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE "ProcessingJob" AS job
    SET
      "status" = ${"PROCESSING"}::"ProcessingJobStatus",
      "startedAt" = COALESCE("startedAt", NOW()),
      "currentStep" = ${"claiming queued job"},
      "updatedAt" = NOW()
    FROM next_job
    WHERE job."id" = next_job."id"
    RETURNING
      job."id",
      job."documentId",
      job."caseId",
      job."status",
      job."totalPages",
      job."processedPages",
      job."currentStep",
      job."errorMessage",
      job."attempts",
      job."maxAttempts",
      job."startedAt",
      job."completedAt",
      job."createdAt",
      job."updatedAt"
  `);

  return job ?? null;
}

async function loadDocumentForProcessing(documentId: string) {
  return prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      caseId: true,
      fileName: true,
      fileUrl: true,
      mimeType: true,
      recordType: true,
      status: true,
      pageCount: true,
    },
  });
}

async function resetGeneratedDocumentArtifacts(documentId: string) {
  await prisma.$transaction([
    prisma.documentPage.deleteMany({ where: { documentId } }),
    prisma.documentChunk.deleteMany({ where: { documentId } }),
    prisma.timelineEvent.deleteMany({ where: { documentId } }),
  ]);
}

async function saveChunkArtifacts(input: {
  documentId: string;
  chunkIndex: number;
  chunkResult: {
    text: string;
    startPage: number;
    endPage: number;
    pageTexts: PdfChunkPageText[];
  };
}) {
  if (input.chunkResult.pageTexts.length > 0) {
    const pageRows = input.chunkResult.pageTexts.map((page) => ({
      id: randomUUID(),
      documentId: input.documentId,
      pageNumber: page.page,
      rawText: page.text || null,
      method: "pdfjs",
    }));

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "DocumentPage" (
        "id",
        "documentId",
        "pageNumber",
        "rawText",
        "method",
        "createdAt"
      )
      VALUES ${Prisma.join(
        pageRows.map(
          (page) => Prisma.sql`(
            ${page.id},
            ${page.documentId},
            ${page.pageNumber},
            ${page.rawText},
            ${page.method},
            NOW()
          )`
        ),
        ", "
      )}
    `);
  }

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "DocumentChunk" (
      "id",
      "documentId",
      "chunkIndex",
      "startPage",
      "endPage",
      "status",
      "rawText",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${randomUUID()},
      ${input.documentId},
      ${input.chunkIndex},
      ${input.chunkResult.startPage},
      ${input.chunkResult.endPage},
      ${"PROCESSED"}::"ChunkStatus",
      ${input.chunkResult.text || null},
      NOW(),
      NOW()
    )
  `);
}

type TimelineEventInsertRow = {
  caseId: string;
  documentId: string;
  eventDate: Date;
  title: string;
  description: string | null;
  eventType: string;
  sourcePage: number | null;
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
  isHidden: boolean;
  physicianName: string | null;
  medicalFacility: string | null;
};

function hasStrongClinicalContext(text: string): boolean {
  return (
    hasMeaningfulClinicalSignal(text) ||
    /\b(ct|cta|x ray|xray|imaging|trauma|injury|fracture|laceration|swelling|periorbital|scalp|transfer|admit|admission|discharge|impression|findings|lab|cbc|cmp|urinalysis|medication|treatment|procedure|consult|exam|evaluation|diagnosis|hospital|emergency department)\b/.test(
      text
    )
  );
}

function shouldDropLikelyDobEvent(event: RawTimelineEvent): boolean {
  const combined = normalizeWhitespace(
    `${event.title || ""} ${event.description || ""} ${event.sourceExcerpt || ""}`
  );
  const normalized = combined.toLowerCase();
  const hasDobCue = /\b(dob|date of birth|birth date|born|born on|birthday)\b/.test(
    normalized
  );
  const isDatedClinicalRecord =
    /^\d{4}-\d{2}-\d{2}$/.test(event.date) &&
    Number.parseInt(event.date.slice(0, 4), 10) <= 1995;

  if (!hasDobCue && !isDatedClinicalRecord) {
    return false;
  }

  return !hasStrongClinicalContext(normalized);
}

function toTimelineEventInsertRows(
  input: {
    caseId: string;
    documentId: string;
  },
  events: RawTimelineEvent[]
): TimelineEventInsertRow[] {
  return events
    .filter((event) => !shouldDropLikelyDobEvent(event))
    .map((event) => {
      const eventDate = parseDateToUtc(event.date);
      const title = normalizeWhitespace(event.title);

      if (!eventDate || !title) {
        return null;
      }

      return {
        caseId: input.caseId,
        documentId: input.documentId,
        eventDate,
        title,
        description: normalizeWhitespace(event.description) || null,
        eventType: normalizeWhitespace(event.eventType) || "other",
        sourcePage:
          typeof event.sourcePage === "number" ? event.sourcePage : null,
        reviewStatus: normalizeReviewStatus(event.reviewStatus),
        isHidden: event.isHidden ?? false,
        physicianName: normalizeWhitespace(event.physicianName) || null,
        medicalFacility: normalizeWhitespace(event.medicalFacility) || null,
      };
    })
    .filter(
      (event): event is TimelineEventInsertRow =>
        event !== null
    );
}

async function replaceDocumentTimelineEvents(
  documentId: string,
  timelineEvents: TimelineEventInsertRow[]
) {
  await prisma.$transaction(async (tx) => {
    await tx.timelineEvent.deleteMany({
      where: { documentId },
    });

    if (timelineEvents.length > 0) {
      await tx.timelineEvent.createMany({
        data: timelineEvents,
      });
    }
  });
}

async function finalizeJobSuccess(
  job: ProcessingJobRow,
  totalPages: number,
  processedPages: number
): Promise<ProcessingJobRow> {
  return updateProcessingJob(job.id, {
    status: "COMPLETED",
    totalPages,
    processedPages,
    currentStep: "completed",
    errorMessage: null,
    completedAt: new Date(),
  });
}

async function finalizeJobFailure(input: {
  job: ProcessingJobRow;
  errorMessage: string;
  totalPages: number;
  processedPages: number;
}): Promise<ProcessingJobRow> {
  const attempts = input.job.attempts + 1;
  const maxAttempts = input.job.maxAttempts;
  const finalStatus: Exclude<ProcessingJobStatus, "QUEUED"> =
    attempts >= maxAttempts ? "FAILED" : "PARTIAL";

  return updateProcessingJob(input.job.id, {
    status: finalStatus,
    totalPages: input.totalPages,
    processedPages: input.processedPages,
    currentStep: finalStatus === "FAILED" ? "failed" : "partial",
    errorMessage: input.errorMessage,
    attempts,
    maxAttempts,
    completedAt: finalStatus === "FAILED" ? new Date() : null,
  });
}

function ensurePdfDocument(fileName: string, mimeType: string) {
  if (!isPdfUpload(fileName, mimeType)) {
    throw new Error("Invalid file type. Please upload a PDF document.");
  }
}

function sanitizeProcessingFileName(fileName: string): string {
  return normalizeFileName(fileName || "document.pdf");
}

export function parseRecordType(value: unknown): RecordType | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();

  switch (normalized) {
    case "MEDICAL_RECORD":
      return "MEDICAL_RECORD";
    case "BILL":
      return "BILL";
    case "LAB_RESULT":
      return "LAB_RESULT";
    case "IMAGING":
      return "IMAGING";
    case "INSURANCE":
      return "INSURANCE";
    case "LEGAL_DOCUMENT":
      return "LEGAL_DOCUMENT";
    case "OTHER":
      return "OTHER";
    default:
      return null;
  }
}

export { sanitizeProcessingFileName };

export async function queueDocumentProcessing(
  input: QueueDocumentProcessingInput
): Promise<DocumentArtifactStatus> {
  ensurePdfDocument(input.fileName, input.mimeType);

  const existingCase = await prisma.case.findUnique({
    where: { id: input.caseId },
    select: { id: true },
  });

  if (!existingCase) {
    throw new Error("Case not found");
  }

  const sanitizedFileName = sanitizeProcessingFileName(input.fileName);
  const jobId = randomUUID();

  return prisma.$transaction(async (tx) => {
    const db = tx as typeof prisma;

    const document = await db.document.create({
      data: {
        caseId: input.caseId,
        fileName: sanitizedFileName,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType,
        recordType: input.recordType ?? null,
        status: "UPLOADED",
      },
      select: {
        id: true,
        caseId: true,
      },
    });

    const job = await insertProcessingJob(db, {
      jobId,
      documentId: document.id,
      caseId: document.caseId,
    });

    return {
      jobId: job.id,
      documentId: document.id,
      caseId: document.caseId,
      status: job.status,
    };
  });
}

async function processClaimedJob(job: ProcessingJobRow): Promise<ProcessingOutcome> {
  const document = await loadDocumentForProcessing(job.documentId);
  if (!document) {
    throw new Error(`Document not found for processing job ${job.id}`);
  }

  if (!document.fileUrl) {
    throw new Error(`Missing fileUrl for document ${document.id}`);
  }

  await prisma.document.update({
    where: { id: document.id },
    data: {
      status: "PROCESSING",
    },
  });

  await resetGeneratedDocumentArtifacts(document.id);

  console.info("PROCESS JOB STARTED", {
    jobId: job.id,
    documentId: document.id,
    caseId: document.caseId,
  });

  const pdfBuffer = await downloadPdfBuffer(document.fileUrl);
  const totalPages = await getPdfPageCount(pdfBuffer);

  console.info("PROCESS JOB PAGE COUNT", {
    jobId: job.id,
    documentId: document.id,
    totalPages,
  });

  const initialJob = await updateProcessingJob(job.id, {
    status: "PROCESSING",
    totalPages,
    processedPages: 0,
    currentStep: "processing pages",
    errorMessage: null,
    startedAt: job.startedAt ?? new Date(),
  });

  let processedPages = 0;
  let chunkIndex = 0;
  const allRawChunkEvents: RawTimelineEvent[] = [];
  const allCleanedChunkEvents: RawTimelineEvent[] = [];

  for (let startPage = 1; startPage <= totalPages; startPage += PDF_CHUNK_SIZE) {
    const endPage = Math.min(startPage + PDF_CHUNK_SIZE - 1, totalPages);

    console.info("PROCESS JOB CHUNK START", {
      jobId: job.id,
      documentId: document.id,
      chunkIndex,
      startPage,
      endPage,
    });

    const chunkResult = await extractPdfChunkText(pdfBuffer, startPage, endPage);

    if (!chunkResult.success) {
      throw new Error(chunkResult.error || "Chunk extraction failed");
    }

    const extractedEvents = await extractTimelineEvents(chunkResult.pageTexts);
    const cleanedEvents = cleanTimelineEvents(extractedEvents);
    allRawChunkEvents.push(...extractedEvents);
    allCleanedChunkEvents.push(...cleanedEvents);

    await saveChunkArtifacts({
      documentId: document.id,
      chunkIndex,
      chunkResult: {
        text: chunkResult.text,
        startPage: chunkResult.startPage,
        endPage: chunkResult.endPage,
        pageTexts: chunkResult.pageTexts,
      },
    });

    processedPages = endPage;
    chunkIndex += 1;

    await updateProcessingJob(job.id, {
      totalPages,
      processedPages,
      currentStep: `processed pages ${startPage}-${endPage}`,
      errorMessage: null,
    });

    console.info("PROCESS JOB CHUNK SAVED", {
      jobId: job.id,
      documentId: document.id,
      chunkIndex,
      processedPages,
    });
  }

  const finalCandidateEvents = cleanTimelineEvents([
    ...allRawChunkEvents,
    ...allCleanedChunkEvents,
  ]);
  const finalTimelineEvents = toTimelineEventInsertRows(
    {
      caseId: document.caseId,
      documentId: document.id,
    },
    finalCandidateEvents
  );

  await replaceDocumentTimelineEvents(document.id, finalTimelineEvents);

  const completedJob = await finalizeJobSuccess(
    initialJob,
    totalPages,
    processedPages
  );

  await prisma.document.update({
    where: { id: document.id },
    data: {
      status: "PROCESSED",
      pageCount: totalPages,
    },
  });

  console.info("PROCESS JOB COMPLETED", {
    jobId: job.id,
    documentId: document.id,
    caseId: document.caseId,
    totalPages,
    processedPages,
    savedEvents: finalTimelineEvents.length,
  });

  return {
    success: true,
    job: completedJob,
    documentId: document.id,
    totalPages,
    processedPages,
    savedEvents: finalTimelineEvents.length,
  };
}

async function processQueuedJobOnce(): Promise<ProcessingOutcome | null> {
  const job = await claimNextQueuedProcessingJob();
  if (!job) {
    return null;
  }

  try {
    return await processClaimedJob(job);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Document processing failed";
    const document = await loadDocumentForProcessing(job.documentId);
    const totalPages = job.totalPages ?? document?.pageCount ?? 0;
    const processedPages = job.processedPages;
    const failedJob = await finalizeJobFailure({
      job,
      errorMessage,
      totalPages,
      processedPages,
    });

    if (failedJob.status === "FAILED") {
      await prisma.document.update({
        where: { id: job.documentId },
        data: {
          status: "FAILED",
        },
      });
    } else {
      await prisma.document.update({
        where: { id: job.documentId },
        data: {
          status: "PROCESSING",
        },
      });
    }

    console.error("PROCESS JOB FAILED", {
      jobId: job.id,
      documentId: job.documentId,
      caseId: job.caseId,
      attempts: failedJob.attempts,
      maxAttempts: failedJob.maxAttempts,
      status: failedJob.status,
      errorMessage,
    });

    return {
      success: false,
      job: failedJob,
      documentId: job.documentId,
      totalPages,
      processedPages,
      errorMessage,
      finalStatus: failedJob.status as Exclude<ProcessingJobStatus, "QUEUED">,
    };
  }
}

export async function processNextQueuedDocumentJob(): Promise<ProcessingOutcome | null> {
  return processQueuedJobOnce();
}

export async function processQueuedDocumentJobs(): Promise<{
  queuedJobsProcessed: number;
  completedJobs: number;
  partialJobs: number;
  failedJobs: number;
}> {
  let queuedJobsProcessed = 0;
  let completedJobs = 0;
  let partialJobs = 0;
  let failedJobs = 0;

  while (true) {
    const outcome = await processQueuedJobOnce();

    if (!outcome) {
      break;
    }

    queuedJobsProcessed += 1;
    if (outcome.success) {
      completedJobs += 1;
    } else if (outcome.finalStatus === "PARTIAL") {
      partialJobs += 1;
    } else {
      failedJobs += 1;
    }
  }

  return {
    queuedJobsProcessed,
    completedJobs,
    partialJobs,
    failedJobs,
  };
}
