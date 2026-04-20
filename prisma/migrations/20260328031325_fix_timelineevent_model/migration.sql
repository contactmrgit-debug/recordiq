/*
  Warnings:

  - You are about to drop the column `confidence` on the `TimelineEvent` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `TimelineEvent` table. All the data in the column will be lost.
  - You are about to drop the column `facility` on the `TimelineEvent` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `TimelineEvent` table. All the data in the column will be lost.
  - Made the column `eventDate` on table `TimelineEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "TimelineEvent_caseId_idx";

-- DropIndex
DROP INDEX "TimelineEvent_documentId_idx";

-- DropIndex
DROP INDEX "TimelineEvent_recordId_idx";

-- AlterTable
ALTER TABLE "TimelineEvent" DROP COLUMN "confidence",
DROP COLUMN "eventType",
DROP COLUMN "facility",
DROP COLUMN "provider",
ALTER COLUMN "eventDate" SET NOT NULL;

-- CreateIndex
CREATE INDEX "TimelineEvent_caseId_eventDate_idx" ON "TimelineEvent"("caseId", "eventDate");
