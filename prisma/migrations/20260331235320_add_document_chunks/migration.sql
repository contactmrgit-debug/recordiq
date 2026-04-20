-- CreateEnum
CREATE TYPE "ChunkStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- DropIndex
DROP INDEX "TimelineEvent_caseId_eventDate_idx";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "startPage" INTEGER NOT NULL,
    "endPage" INTEGER NOT NULL,
    "status" "ChunkStatus" NOT NULL DEFAULT 'PENDING',
    "rawText" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_chunkIndex_idx" ON "DocumentChunk"("documentId", "chunkIndex");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentChunk_documentId_chunkIndex_key" ON "DocumentChunk"("documentId", "chunkIndex");

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
