-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN     "documentId" TEXT;

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "pageCount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPage" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "rawText" TEXT,
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_caseId_idx" ON "Document"("caseId");

-- CreateIndex
CREATE INDEX "DocumentPage_documentId_idx" ON "DocumentPage"("documentId");

-- CreateIndex
CREATE INDEX "TimelineEvent_documentId_idx" ON "TimelineEvent"("documentId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPage" ADD CONSTRAINT "DocumentPage_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
