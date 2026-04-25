import dotenv from "dotenv";
import { processQueuedDocumentJobs } from "@/lib/document-processing";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  console.info("AWS env check:", {
    hasRegion: Boolean(process.env.AWS_REGION || process.env.S3_REGION),
    hasBucket: Boolean(
      process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME
    ),
    hasAccessKey: Boolean(
      process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID
    ),
    hasSecretKey: Boolean(
      process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY
    ),
  });

  const result = await processQueuedDocumentJobs();
  console.info("PROCESS JOB WORKER SUMMARY", result);
}

main().catch((error) => {
  console.error("PROCESS JOB WORKER FAILED", error);
  process.exitCode = 1;
});
