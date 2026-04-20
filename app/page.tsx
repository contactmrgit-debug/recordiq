"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Case = {
  id: string;
  title: string;
  caseType: "MEDICAL" | "LEGAL";
  createdAt: string;
  documentCount?: number;
};

export default function PortalDashboard() {
  const router = useRouter();

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      setLoading(true);

      const res = await fetch("/api/cases");
      const data = await res.json();

      if (data?.success) {
        setCases(data.cases || []);
      }
    } catch (err) {
      console.error("Failed to load cases", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCase() {
    try {
      setCreating(true);

      const res = await fetch("/api/create-case", {
        method: "POST",
      });

      const data = await res.json();

      if (data?.success && data.case?.id) {
        router.push(`/portal/cases/${data.case.id}`);
      }
    } catch (err) {
      console.error("Create case failed", err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-6 bg-white border-b">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Hello 👋
          </h1>
          <p className="text-sm text-gray-500">
            Welcome back to RecordIQ
          </p>
        </div>

        <button
          onClick={handleCreateCase}
          disabled={creating}
          className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
        >
          {creating ? "Creating..." : "+ New Case"}
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-8">
        {loading ? (
          <p className="text-gray-500">Loading cases...</p>
        ) : cases.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border text-center">
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              No cases yet
            </h2>
            <p className="text-gray-500 mb-4">
              Create your first case to start uploading records.
            </p>

            <button
              onClick={handleCreateCase}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Create First Case
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border p-5 hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/portal/cases/${c.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {c.caseType}
                  </span>

                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {c.title || "Untitled Case"}
                </h3>

                <p className="text-sm text-gray-500">
                  {c.documentCount || 0} documents
                </p>

                <div className="mt-4 text-sm text-teal-600 font-medium">
                  Open Case →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}