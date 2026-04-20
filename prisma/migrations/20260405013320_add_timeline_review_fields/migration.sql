/*
  Warnings:

  - You are about to drop the column `recordId` on the `TimelineEvent` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TimelineEvent" DROP CONSTRAINT "TimelineEvent_recordId_fkey";

-- AlterTable
ALTER TABLE "TimelineEvent" DROP COLUMN "recordId",
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalDescription" TEXT,
ADD COLUMN     "originalTitle" TEXT;

-- CreateIndex
CREATE INDEX "TimelineEvent_caseId_idx" ON "TimelineEvent"("caseId");

-- CreateIndex
CREATE INDEX "TimelineEvent_isHidden_idx" ON "TimelineEvent"("isHidden");
