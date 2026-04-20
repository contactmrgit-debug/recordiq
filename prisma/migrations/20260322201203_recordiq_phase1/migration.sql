-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('MEDICAL', 'LEGAL');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('MEDICAL_RECORD', 'BILL', 'LAB_RESULT', 'IMAGING', 'INSURANCE', 'LEGAL_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "caseType" "CaseType" NOT NULL,
    "subjectName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "incidentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalUrl" TEXT,
    "storagePath" TEXT,
    "fileType" TEXT,
    "recordType" "RecordType" NOT NULL DEFAULT 'OTHER',
    "status" "RecordStatus" NOT NULL DEFAULT 'UPLOADED',
    "sourceDate" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "extractedText" TEXT,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "recordId" TEXT,
    "eventDate" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "provider" TEXT,
    "facility" TEXT,
    "eventType" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Case_ownerId_idx" ON "Case"("ownerId");

-- CreateIndex
CREATE INDEX "Case_caseType_idx" ON "Case"("caseType");

-- CreateIndex
CREATE INDEX "Record_caseId_idx" ON "Record"("caseId");

-- CreateIndex
CREATE INDEX "Record_recordType_idx" ON "Record"("recordType");

-- CreateIndex
CREATE INDEX "Record_status_idx" ON "Record"("status");

-- CreateIndex
CREATE INDEX "TimelineEvent_caseId_idx" ON "TimelineEvent"("caseId");

-- CreateIndex
CREATE INDEX "TimelineEvent_recordId_idx" ON "TimelineEvent"("recordId");

-- CreateIndex
CREATE INDEX "TimelineEvent_eventDate_idx" ON "TimelineEvent"("eventDate");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
