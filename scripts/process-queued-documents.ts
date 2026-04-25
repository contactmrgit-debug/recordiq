import { processQueuedDocumentJobs } from "@/lib/document-processing";

async function main() {
  const result = await processQueuedDocumentJobs();
  console.info("PROCESS JOB WORKER SUMMARY", result);
}

main().catch((error) => {
  console.error("PROCESS JOB WORKER FAILED", error);
  process.exitCode = 1;
});
