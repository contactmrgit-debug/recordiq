-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EDITED');

-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN     "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "sourcePage" INTEGER;

-- CreateIndex
CREATE INDEX "TimelineEvent_reviewStatus_idx" ON "TimelineEvent"("reviewStatus");
