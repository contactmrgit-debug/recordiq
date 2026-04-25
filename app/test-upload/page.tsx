"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiResponse = {
  success?: boolean;
  error?: string;
  case?: {
    id?: string;
  };
  documents?: unknown[];
  timelineEvents?: unknown[];
  document?: {
    id?: string;
    fileUrl?: string;
    status?: string;
    pageCount?: number | null;
    recordType?: string | null;
  };
  documentId?: string;
  jobId?: string;
  status?: string;
  timelineEventsCreated?: number;
  uploadUrl?: string;
  key?: string;
  bucket?: string;
  region?: string;
  expiresInSeconds?: number;
};

type UploadMode = "LOCAL" | "S3";

async function safeJson(
  res: Response,
  label: string
): Promise<ApiResponse | null> {
  const text = await res.text();
  console.log(`${label.toUpperCase()} RAW RESPONSE:`, text);

  if (!text.trim()) {
    console.error(`${label.toUpperCase()} EMPTY RESPONSE BODY`);
    return null;
  }

  try {
    return JSON.parse(text) as ApiResponse;
  } catch (error) {
    console.error(`${label.toUpperCase()} JSON PARSE ERROR:`, error);
    console.error(`${label.toUpperCase()} NON-JSON BODY:`, text);
    return null;
  }
}

function getResponseError(
  res: Response,
  data: ApiResponse | null,
  fallback: string
): string {
  return data?.error?.trim() || `${fallback} (HTTP ${res.status})`;
}

type UploadDebugResult = {
  caseId: string | null;
  documentId: string | null;
  jobId: string | null;
  fileUrl: string | null;
  recordType: string | null;
  status: string | null;
  jobStatus: string | null;
  pageCount: number | null;
  timelineEventsCreated: number | null;
  warnings: string[];
};

export default function TestUploadPage() {
  const router = useRouter();

  const [caseId, setCaseId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState("MEDICAL_RECORD");
  const [uploadMode, setUploadMode] = useState<UploadMode>("S3");
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [result, setResult] = useState<UploadDebugResult | null>(null);

  async function handleCreateCase() {
    try {
      setWarning(null);
      setStatus("Creating case...");

      const res = await fetch("/api/create-case", {
        method: "POST",
      });

      const data = await safeJson(res, "Create case");

      if (!res.ok || !data?.success || !data?.case?.id) {
        throw new Error(getResponseError(res, data, "Failed to create case"));
      }

      setCaseId(data.case.id);
      setStatus("Case created");
    } catch (err) {
      console.error(err);
      setStatus(
        `Error creating case: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  async function finishUpload(
    selectedCaseId: string,
    data: ApiResponse,
    fallbackRecordType: string
  ) {
    const documentId = data.documentId || data.document?.id || null;
    const jobId = data.jobId || null;
    const fileUrl = data.document?.fileUrl || null;
    const savedRecordType = data.document?.recordType || fallbackRecordType || null;
    const savedStatus = data.status || data.document?.status || null;
    const pageCount =
      typeof data.document?.pageCount === "number"
        ? data.document.pageCount
        : null;
    const timelineEventsCreated =
      typeof data.timelineEventsCreated === "number"
        ? data.timelineEventsCreated
        : null;

    setStatus(
      jobId
        ? `Upload queued (${jobId})`
        : documentId
          ? `Upload saved (${documentId})`
          : "Upload saved"
    );

    const [docsRes, timelineRes] = await Promise.all([
      fetch(`/api/cases/${caseId}/documents`, { cache: "no-store" }),
      fetch(`/api/cases/${caseId}/timeline-events`, { cache: "no-store" }),
    ]);

    const [docsJson, timelineJson] = await Promise.all([
      safeJson(docsRes, "Documents"),
      safeJson(timelineRes, "Timeline"),
    ]);

    const warnings: string[] = [];

    if (!docsRes.ok || !docsJson?.success) {
      warnings.push(docsJson?.error || "Documents endpoint returned an error");
    }

    if (!timelineRes.ok || !timelineJson?.success) {
      warnings.push(timelineJson?.error || "Timeline endpoint returned an error");
    }

    setResult({
      caseId: selectedCaseId,
      documentId,
      jobId,
      fileUrl,
      recordType: savedRecordType,
      status: savedStatus,
      jobStatus: data.status || null,
      pageCount,
      timelineEventsCreated,
      warnings,
    });

    if (warnings.length) {
      const message = warnings.join(" â€¢ ");
      setWarning(message);
      setStatus(`Upload complete with warnings: ${message}`);
    } else {
      setStatus("Complete");
    }

    setTimeout(() => {
      router.push(`/cases/${selectedCaseId}`);
    }, 1500);
  }

  async function handleLocalUpload(selectedCaseId: string) {
    if (!file) {
      throw new Error("Missing file");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caseId", selectedCaseId);
    formData.append("recordType", recordType);

    const saveRes = await fetch(`/api/cases/${selectedCaseId}/documents/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await safeJson(saveRes, "Upload");

    if (!saveRes.ok || !data?.success) {
      throw new Error(getResponseError(saveRes, data, "Upload save failed"));
    }

    await finishUpload(selectedCaseId, data, recordType);
  }

  async function handleS3Upload(selectedCaseId: string) {
    if (!file) {
      throw new Error("Missing file");
    }

    const presignRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        caseId: selectedCaseId,
        fileName: file.name,
        contentType: file.type || "application/pdf",
      }),
    });

    const presignData = await safeJson(presignRes, "Presign");

    if (!presignRes.ok || !presignData?.success) {
      throw new Error(getResponseError(presignRes, presignData, "Presign failed"));
    }

    if (
      !presignData.uploadUrl ||
      !presignData.key ||
      !presignData.bucket ||
      !presignData.region
    ) {
      throw new Error("Presign response missing required S3 fields");
    }

    const uploadRes = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/pdf",
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error(`S3 upload failed (HTTP ${uploadRes.status})`);
    }

    const fileUrl = `https://${presignData.bucket}.s3.${presignData.region}.amazonaws.com/${presignData.key}`;

    const processRes = await fetch(
      `/api/cases/${selectedCaseId}/documents/process-s3`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId: selectedCaseId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/pdf",
          recordType,
          s3Key: presignData.key,
          s3Bucket: presignData.bucket,
          s3Region: presignData.region,
          fileUrl,
        }),
      }
    );

    const processData = await safeJson(processRes, "Process S3");

    if (!processRes.ok || !processData?.success) {
      throw new Error(
        getResponseError(processRes, processData, "S3 processing failed")
      );
    }

    await finishUpload(selectedCaseId, processData, recordType);
  }

  async function handleUpload() {
    const selectedCaseId = caseId.trim();

    if (!selectedCaseId || !file) {
      alert("Need caseId and file");
      return;
    }

    try {
      setWarning(null);
      setResult(null);
      setLoading(true);

      setStatus(
        uploadMode === "LOCAL"
          ? "Uploading PDF and extracting timeline..."
          : "Uploading via S3 and extracting timeline..."
      );

      if (uploadMode === "LOCAL") {
        await handleLocalUpload(selectedCaseId);
      } else {
        await handleS3Upload(selectedCaseId);
      }
    } catch (err) {
      console.error(err);
      setWarning(null);
      setResult(null);
      setStatus(
        `Error during upload: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4 p-6">
      <h1 className="text-xl font-bold">Test Upload</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Current caseId
          </label>
          <input
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            placeholder="Enter an existing caseId or create a new one"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCreateCase}
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Create new test case
          </button>

          <button
            onClick={() => {
              const selectedCaseId = caseId.trim();
              if (!selectedCaseId) {
                setStatus("Enter an existing caseId first.");
                return;
              }
              setStatus(`Using existing case ${selectedCaseId}`);
            }}
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Use existing case
          </button>
        </div>

        <div className="text-sm text-slate-600">
          Selected case: <span className="font-mono">{caseId || "None"}</span>
        </div>
      </div>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <select
        value={recordType}
        onChange={(e) => setRecordType(e.target.value)}
        className="border p-2"
      >
        <option value="MEDICAL_RECORD">MEDICAL_RECORD</option>
        <option value="LAB_RESULT">LAB_RESULT</option>
        <option value="IMAGING">IMAGING</option>
        <option value="LEGAL_DOCUMENT">LEGAL_DOCUMENT</option>
        <option value="OTHER">OTHER</option>
      </select>

      <select
        value={uploadMode}
        onChange={(e) => setUploadMode(e.target.value as UploadMode)}
        className="border p-2"
      >
        <option value="LOCAL">LOCAL</option>
        <option value="S3">S3</option>
      </select>

      <div className="text-xs text-slate-500">
        S3 is production-style. LOCAL is fallback/dev only.
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="rounded border px-3 py-2"
      >
        Upload
      </button>

      <div className="text-sm">
        Status: <span className="font-medium">{status}</span>
      </div>

      {warning ? (
        <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {warning}
        </div>
      ) : null}

      {result ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm shadow-sm">
          <div className="mb-3 text-sm font-semibold text-slate-900">
            Upload Result
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Case ID
              </div>
              <div className="break-all font-mono text-slate-900">
                {result.caseId || "N/A"}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Document ID
              </div>
              <div className="break-all font-mono text-slate-900">
                {result.documentId || "N/A"}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Job ID
              </div>
              <div className="break-all font-mono text-slate-900">
                {result.jobId || "N/A"}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Job Status
              </div>
              <div className="font-mono text-slate-900">
                {result.jobStatus || "N/A"}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                File URL
              </div>
              {result.fileUrl ? (
                <div className="break-all font-mono text-slate-900">
                  {result.fileUrl}
                </div>
              ) : (
                <div className="font-mono text-slate-900">N/A</div>
              )}
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Document Status
              </div>
              <div className="font-mono text-slate-900">
                {result.status || "N/A"}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Record Type
              </div>
              <div className="font-mono text-slate-900">
                {result.recordType || "N/A"}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Page Count
              </div>
              <div className="font-mono text-slate-900">
                {result.pageCount ?? "N/A"}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Timeline Events
              </div>
              <div className="font-mono text-slate-900">
                {result.timelineEventsCreated ?? "N/A"}
              </div>
            </div>
          </div>

          {result.caseId ? (
            <div className="mt-4">
              <a
                href={`/cases/${result.caseId}`}
                className="text-sm font-medium text-blue-700 underline"
              >
                Open case
              </a>
            </div>
          ) : null}

          {result.warnings.length ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide">
                Warnings
              </div>
              <ul className="list-inside list-disc space-y-1">
                {result.warnings.map((item, index) => (
                  <li key={`${index}-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
