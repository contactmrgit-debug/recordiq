"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestUploadPage() {
  const router = useRouter();

  const [caseId, setCaseId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState("MEDICAL_RECORD");

  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);

  async function handleCreateCase() {
    try {
      setStatus("Creating case...");

      const res = await fetch("/api/create-case", {
        method: "POST",
      });

      const text = await res.text();
      console.log("CREATE CASE RAW RESPONSE:", text);

      const data = text ? JSON.parse(text) : null;

      if (!res.ok || !data?.success || !data?.case?.id) {
        throw new Error(data?.error || "Failed to create case");
      }

      setCaseId(data.case.id);
      setStatus("Case created");
    } catch (err) {
      console.error(err);
      setStatus("Error creating case");
    }
  }

  async function handleUpload() {
    if (!caseId || !file) {
      alert("Need caseId and file");
      return;
    }

    try {
      setLoading(true);

      setStatus("Uploading file...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("recordType", recordType);

      await new Promise((r) => setTimeout(r, 300));

      setStatus("Extracting text...");

      await new Promise((r) => setTimeout(r, 300));

      setStatus("Building timeline...");

      const res = await fetch(`/api/cases/${caseId}/documents/upload`, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      console.log("UPLOAD RAW RESPONSE:", text);

      const data = text ? JSON.parse(text) : null;

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Upload failed");
      }

      setStatus("Saving results...");

      await new Promise((r) => setTimeout(r, 300));

      setStatus("Complete");

      setTimeout(() => {
        router.push(`/cases/${caseId}`);
      }, 500);
    } catch (err) {
      console.error(err);
      setStatus("Error during upload");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-xl">
      <h1 className="text-xl font-bold">Test Upload</h1>

      <button
        onClick={handleCreateCase}
        className="border px-3 py-2 rounded"
      >
        Create Case
      </button>

      <div className="text-sm">Case ID: {caseId || "None"}</div>

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

      <button
        onClick={handleUpload}
        disabled={loading}
        className="border px-3 py-2 rounded"
      >
        Upload
      </button>

      <div className="text-sm">
        Status: <span className="font-medium">{status}</span>
      </div>
    </div>
  );
}