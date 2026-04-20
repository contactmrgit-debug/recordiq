/*
  Warnings:

  - The `status` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- DropIndex
DROP INDEX "TimelineEvent_eventDate_idx";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "status",
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED';
