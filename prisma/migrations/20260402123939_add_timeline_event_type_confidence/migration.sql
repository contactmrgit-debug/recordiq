-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "eventType" TEXT;

-- CreateIndex
CREATE INDEX "TimelineEvent_caseId_eventDate_idx" ON "TimelineEvent"("caseId", "eventDate");

-- CreateIndex
CREATE INDEX "TimelineEvent_documentId_idx" ON "TimelineEvent"("documentId");
