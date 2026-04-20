"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";


type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type DisplayMode = "TIMELINE" | "OUTLINE" | "DOCUMENTS";

type CaseData = {
  id: string;
  title: string;
  description?: string | null;
  caseType?: string | null;
  subjectName?: string | null;
};

export type DocumentItem = {
  id: string;
  fileName: string;
  fileUrl?: string | null;
  mimeType?: string | null;
  pageCount?: number | null;
  recordType?: string | null;
  documentType?: string | null;
  provider?: string | null;
  facility?: string | null;
  extractedEventsCount?: number | null;
  status?: string | null;
  createdAt?: string | null;
};

type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  description?: string | null;
  eventType?: string | null;
  sourcePage?: number | null;
  reviewStatus?: ReviewStatus;
  isHidden?: boolean;
  documentId?: string | null;
  documentType?: string | null;
  documentName?: string | null;
  pageNumber?: number | null;
  provider?: string | null;
  facility?: string | null;

  providerName?: string | null;
  providerRole?: string | null;
  eventActorType?: string | null;

  physicianName?: string | null;
  physicianRole?: string | null;
  medicalFacility?: string | null;
};
export type TimelineEventItem = TimelineEvent;

type ExtractedCode = {
  code: string;
  type: "CPT" | "ICD";
  label: string;
  detail: string;
};

async function safeJson(res: Response, label: string) {
  const text = await res.text();

  if (!text) {
    throw new Error(`${label} returned empty response`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} returned invalid JSON`);
  }
}

function formatDate(date?: string) {
  if (!date || date === "UNKNOWN") return "Unknown";

  // DO NOT use new Date() — it causes timezone shift
  const parts = date.split("-");
  if (parts.length !== 3) return date;

  const [year, month, day] = parts;

  return `${month}/${day}/${year}`;
}
function eventSortTime(event: TimelineEvent) {
  if (!event.date || event.date === "UNKNOWN") {
    return Number.MAX_SAFE_INTEGER;
  }

  return Number(event.date.replaceAll("-", ""));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function downloadBlob(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function statusPillClasses(status?: ReviewStatus) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "REJECTED":
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
}

function typePillClasses(type?: string | null) {
  switch ((type || "").toLowerCase()) {
    case "diagnosis":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    case "treatment":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
    case "report":
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
    case "appointment":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    case "billing":
      return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
    case "observation":
      return "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200";
    case "communication":
      return "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200";
    case "symptom":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "incident":
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    default:
      return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
  }
}

function extractMedicalCodes(text: string): ExtractedCode[] {
  const found = new Map<string, ExtractedCode>();

  const icdMatches =
    text.match(/\b[A-TV-Z][0-9][0-9A-Z](?:\.[0-9A-Z]{1,4})?\b/g) || [];
  const cptMatches = text.match(/\b\d{5}\b/g) || [];

  const codeHints: Record<string, { label: string; detail: string }> = {
    "97112": {
      label: "CPT 97112",
      detail:
        "Neuromuscular reeducation. Commonly used for movement, balance, posture, and coordination training.",
    },
    "98940": {
      label: "CPT 98940",
      detail:
        "Chiropractic manipulative treatment involving 1 to 2 spinal regions.",
    },
    "99213": {
      label: "CPT 99213",
      detail:
        "Established patient office or outpatient visit, typically low to moderate complexity.",
    },
    "99214": {
      label: "CPT 99214",
      detail:
        "Established patient office or outpatient visit, moderate complexity.",
    },
    "M54.5": {
      label: "ICD M54.5",
      detail:
        "Low back pain. Some coding variants may differ based on payer or coding updates.",
    },
    "R10.9": {
      label: "ICD R10.9",
      detail: "Unspecified abdominal pain.",
    },
    "M99.05": {
      label: "ICD M99.05",
      detail: "Segmental and somatic dysfunction of pelvic region.",
    },
  };

  for (const code of icdMatches) {
    const hint = codeHints[code];
    found.set(`ICD-${code}`, {
      code,
      type: "ICD",
      label: hint?.label || `ICD ${code}`,
      detail:
        hint?.detail ||
        "Detected ICD diagnosis code in the event text. Connect structured coding data later for exact definitions.",
    });
  }

  for (const code of cptMatches) {
    const hint = codeHints[code];
    found.set(`CPT-${code}`, {
      code,
      type: "CPT",
      label: hint?.label || `CPT ${code}`,
      detail:
        hint?.detail ||
        "Detected CPT procedure code in the event text. Connect structured coding data later for exact definitions.",
    });
  }

  return Array.from(found.values()).slice(0, 6);
}

function buildExportRows(
  events: TimelineEvent[],
  caseData: CaseData | null,
  getDocumentName: (documentId?: string | null) => string,
  getProviderName: (event: TimelineEvent) => string,
  getProviderRole: (event: TimelineEvent) => string | null
) {
  return events.map((event) => ({
    caseTitle: caseData?.title || "",
    caseType: caseData?.caseType || "",
    subjectName: caseData?.subjectName || "",
    date: event.date || "",
    provider: getProviderName(event) || "",
    providerRole: getProviderRole(event) || "",
    title: event.title || "",
    description: event.description || "",
    eventType: event.eventType || "",
    sourcePage: event.sourcePage ?? "",
    reviewStatus: event.reviewStatus || "PENDING",
    document: getDocumentName(event.documentId),
  }));
}
function rowsToCsv(rows: Record<string, string | number>[]) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const escapeValue = (value: string | number) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;

  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeValue(row[h] ?? "")).join(",")),
  ];

  return lines.join("\n");
}

function fileIsPdf(documentItem?: DocumentItem | null) {
  if (!documentItem) return false;

  const mimeType = (documentItem.mimeType || "").toLowerCase();
  const fileName = (documentItem.fileName || "").toLowerCase();
  const fileUrl = (documentItem.fileUrl || "").toLowerCase();

  return (
    mimeType.includes("pdf") ||
    fileName.endsWith(".pdf") ||
    fileUrl.endsWith(".pdf")
  );
}

export default function CasePage() {
  const params = useParams();
  const caseId = typeof params?.id === "string" ? params.id : "";

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
const rightPanelRef = useRef<HTMLDivElement | null>(null);
const previewRef = useRef<HTMLDivElement | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
const [activeSourcePage, setActiveSourcePage] = useState<number | null>(1);
const [showHidden, setShowHidden] = useState(false);
const [searchQuery, setSearchQuery] = useState("");

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [bulkVerifying, setBulkVerifying] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const downloadRef = useRef<HTMLDivElement | null>(null);

  function getDocumentName(documentId?: string | null) {
    return documents.find((doc) => doc.id === documentId)?.fileName || "Unknown";
  }

  function getDocumentUrl(documentId?: string | null) {
    return documents.find((doc) => doc.id === documentId)?.fileUrl || null;
  }

function getProviderName(event: TimelineEvent) {
  return event.providerName?.trim() || event.physicianName?.trim() || null;
}

function getProviderRole(event: TimelineEvent) {
  return event.providerRole?.trim() || event.physicianRole?.trim() || null;
}

function getMedicalFacility(event: TimelineEvent) {
  return event.medicalFacility?.trim() || null;
}

function getAttributionLine(event: TimelineEvent) {
  const providerName = getProviderName(event);
  const providerRole = getProviderRole(event);
  const facility = getMedicalFacility(event);

  return [providerName, providerRole, facility].filter(Boolean).join(" • ");
}

function handleSelectEvent(event: TimelineEvent) {
  setSelectedEventId(event.id);
}

function handleSourceClick(
  e: React.MouseEvent,
  eventId: string,
  documentId?: string | null,
  sourcePage?: number | null
) {
  e.stopPropagation();

  if (!documentId) return;

  setSelectedEventId(eventId);
  setSelectedDocumentId(documentId);
  setActiveSourcePage(
    typeof sourcePage === "number" && sourcePage > 0 ? sourcePage : null
  );

  const viewer = document.getElementById("source-document-viewer");
  if (viewer) {
    viewer.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function loadCase() {
    if (!caseId) return;

    try {
      setLoading(true);
      setError(null);

      const [caseRes, docsRes, eventsRes] = await Promise.all([
        fetch(`/api/cases/${caseId}`, { cache: "no-store" }),
        fetch(`/api/cases/${caseId}/documents`, { cache: "no-store" }),
        fetch(`/api/cases/${caseId}/timeline-events`, { cache: "no-store" }),
      ]);

      const [caseJson, docsJson, eventsJson] = await Promise.all([
        safeJson(caseRes, "Case"),
        safeJson(docsRes, "Documents"),
        safeJson(eventsRes, "Timeline"),
      ]);

      if (!caseRes.ok || !caseJson?.success) {
        throw new Error(caseJson?.error || "Failed to load case");
      }

      if (!docsRes.ok || !docsJson?.success) {
        throw new Error(docsJson?.error || "Failed to load documents");
      }

      if (!eventsRes.ok || !eventsJson?.success) {
        throw new Error(eventsJson?.error || "Failed to load timeline events");
      }

      const nextCase = caseJson.case ?? null;
      const nextDocs = Array.isArray(docsJson.documents) ? docsJson.documents : [];
      const nextEvents = Array.isArray(eventsJson.timelineEvents)
        ? eventsJson.timelineEvents
        : [];

      setCaseData(nextCase);
      setDocuments(nextDocs);
      setEvents(nextEvents);

      const resolvedSelectedEventId =
  selectedEventId && nextEvents.some((event: TimelineEvent) => event.id === selectedEventId)
    ? selectedEventId
    : nextEvents[0]?.id || null;

setSelectedEventId(resolvedSelectedEventId);

const resolvedSelectedEvent =
  nextEvents.find((event: TimelineEvent) => event.id === resolvedSelectedEventId) || null;

setSelectedDocumentId(resolvedSelectedEvent?.documentId ?? null);
    } catch (err) {
      console.error("Load case error:", err);
      setError(err instanceof Error ? err.message : "Failed to load case");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!downloadRef.current) return;
      if (!downloadRef.current.contains(event.target as Node)) {
        setDownloadOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function updateEvent(
  eventId: string,
  updates: {
    reviewStatus?: ReviewStatus;
    isHidden?: boolean;
    title?: string;
    description?: string | null;
  }
) {
  try {
    setUpdatingEventId(eventId);

    const res = await fetch(`/api/timeline-events/${eventId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const data = await safeJson(res, "Update event");

    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "Failed to update event");
    }

    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      )
    );
  } catch (err) {
    console.error("Update event error:", err);
    alert(err instanceof Error ? err.message : "Failed to update event");
  } finally {
    setUpdatingEventId(null);
  }
}

  const visibleEvents = useMemo(() => {
    return [...events]
      .filter((event) => (showHidden ? true : !event.isHidden))
      .sort((a, b) => eventSortTime(a) - eventSortTime(b));
  }, [events, showHidden]);

const filteredEvents = useMemo(() => {
  const q = searchQuery.trim().toLowerCase();

  if (!q) return visibleEvents;

  return visibleEvents.filter((event) => {
  const docName = getDocumentName(event.documentId).toLowerCase();
  const providerName = (getProviderName(event) || "").toLowerCase();
  const providerRole = (getProviderRole(event) || "").toLowerCase();
  const medicalFacility = (getMedicalFacility(event) || "").toLowerCase();
  const codes = extractMedicalCodes(
    `${event.title || ""}\n${event.description || ""}`
  );

  const codeText = codes
    .map((code) => `${code.code} ${code.label} ${code.detail || ""}`.toLowerCase())
    .join(" ");

  return (
    (event.title || "").toLowerCase().includes(q) ||
    (event.description || "").toLowerCase().includes(q) ||
    docName.includes(q) ||
    providerName.includes(q) ||
    providerRole.includes(q) ||
    medicalFacility.includes(q) ||
    codeText.includes(q)
  );
});
}, [visibleEvents, searchQuery, documents]);

  async function verifyAllVisible() {
    const pendingVisible = filteredEvents.filter(
      (event) => (event.reviewStatus || "PENDING") !== "APPROVED"
    );

    if (!pendingVisible.length) return;

    try {
      setBulkVerifying(true);

      for (const event of pendingVisible) {
        const res = await fetch(`/api/timeline-events/${event.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviewStatus: "APPROVED" }),
        });

        const data = await safeJson(res, "Verify all");
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || `Failed on event ${event.id}`);
        }
      }

      await loadCase();
    } catch (err) {
      console.error("Verify all error:", err);
      alert(err instanceof Error ? err.message : "Failed to verify all visible events");
    } finally {
      setBulkVerifying(false);
    }
  }

  function startEditing(event: TimelineEvent) {
    setEditingEventId(event.id);
    setEditTitle(event.title || "");
    setEditDescription(event.description || "");
  }

  function cancelEditing() {
    setEditingEventId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function saveEdit(eventId: string) {
    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();

    if (!trimmedTitle) {
      alert("Title cannot be empty.");
      return;
    }

    await updateEvent(eventId, {
      title: trimmedTitle,
      description: trimmedDescription || null,
    });

    setEditingEventId(null);
    setEditTitle("");
    setEditDescription("");
  }

  const groupedEvents = useMemo(() => {
    const groups: { date: string; items: TimelineEvent[] }[] = [];

    for (const event of filteredEvents) {
      const key = event.date || "UNKNOWN";
      const last = groups[groups.length - 1];

      if (!last || last.date !== key) {
        groups.push({ date: key, items: [event] });
      } else {
        last.items.push(event);
      }
    }

    return groups;
  }, [filteredEvents]);

const selectedEvent =
  filteredEvents.find((event) => event.id === selectedEventId) ||
  visibleEvents.find((event) => event.id === selectedEventId) ||
  events.find((event) => event.id === selectedEventId) ||
  null;

const activeDocument = useMemo(() => {
  if (selectedDocumentId) {
    return documents.find((doc) => doc.id === selectedDocumentId) || null;
  }

  if (selectedEvent?.documentId) {
    return (
      documents.find((doc) => doc.id === selectedEvent.documentId) || null
    );
  }

  return null;
}, [selectedDocumentId, selectedEvent, documents]);
  const selectedCodes = useMemo(() => {
    if (!selectedEvent) return [];
    return extractMedicalCodes(
      `${selectedEvent.title || ""}\n${selectedEvent.description || ""}`
    );
  }, [selectedEvent]);

  const stats = useMemo(() => {
    const pending = events.filter(
      (event) => !event.isHidden && (event.reviewStatus || "PENDING") === "PENDING"
    ).length;
    const approved = events.filter(
      (event) => !event.isHidden && event.reviewStatus === "APPROVED"
    ).length;
    const hidden = events.filter((event) => event.isHidden).length;

    return { pending, approved, hidden };
  }, [events]);

  function handleExport(format: "pdf" | "word" | "excel" | "zip") {
    setDownloadOpen(false);

 const rows = buildExportRows(
  filteredEvents,
  caseData,
  getDocumentName,
  (event) => getProviderName(event) || "",
  getProviderRole
);

    const safeTitle = (caseData?.title || "recordiq-case")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (format === "excel") {
      const csv = rowsToCsv(rows);
      downloadBlob(csv, `${safeTitle}-chronology.csv`, "text/csv;charset=utf-8;");
      return;
    }

    if (format === "word") {
      const content = rows
        .map(
          (row) =>
            `${row.date}
Provider: ${row.provider}
Role: ${row.providerRole}
${row.title}
${row.description}
Type: ${row.eventType}
Page: ${row.sourcePage}
Document: ${row.document}
Status: ${row.reviewStatus}
`
        )
        .join("\n-------------------------\n\n");

      downloadBlob(
        content,
        `${safeTitle}-chronology.doc`,
        "application/msword;charset=utf-8;"
      );
      return;
    }

    if (format === "zip") {
      const payload = JSON.stringify(
        {
          case: caseData,
          documents,
          chronology: rows,
        },
        null,
        2
      );

      downloadBlob(
        payload,
        `${safeTitle}-chronology-bundle.json`,
        "application/json;charset=utf-8;"
      );
      return;
    }

    const html = `
      <html>
        <head>
          <title>${escapeHtml(caseData?.title || "Case Chronology")}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 8px; }
            .meta { color: #555; margin-bottom: 24px; font-size: 14px; }
            .date { margin-top: 24px; font-size: 18px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
            .item { padding: 12px 0; border-bottom: 1px solid #eee; }
            .title { font-weight: bold; margin-bottom: 4px; }
            .details { color: #666; font-size: 13px; margin-top: 6px; }
            .provider { color: #222; font-size: 14px; font-weight: bold; margin-bottom: 6px; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(caseData?.title || "Case Chronology")}</h1>
          <div class="meta">
            ${escapeHtml(caseData?.caseType || "")}
            ${caseData?.subjectName ? ` • ${escapeHtml(caseData.subjectName)}` : ""}
          </div>
          ${groupedEvents
            .map(
              (group) => `
                <div class="date">${escapeHtml(group.date || "Unknown")}</div>
                ${group.items
                  .map(
                    (event) => `
                      <div class="item">
                        ${
                          getAttributionLine(event)
                            ? `<div class="provider">${escapeHtml(getAttributionLine(event))}</div>`
                            : ""
                        }
                        <div class="title">${escapeHtml(event.title || "")}</div>
                        <div>${escapeHtml(event.description || "")}</div>
                        <div class="details">
                          ${escapeHtml(event.eventType || "other")} •
                          Page ${escapeHtml(String(event.sourcePage ?? "-"))} •
                          ${escapeHtml(getDocumentName(event.documentId))} •
                          ${escapeHtml(event.reviewStatus || "PENDING")}
                        </div>
                      </div>
                    `
                  )
                  .join("")}
              `
            )
            .join("")}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) {
      alert("Pop-up blocked. Please allow pop-ups to export PDF/print.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-[1600px] rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="text-lg font-semibold text-slate-900">Loading chronology...</div>
          <div className="mt-2 text-sm text-slate-500">Building the review workspace.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-[1600px] rounded-3xl border border-red-300 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="mx-auto max-w-[1700px] px-4 pb-6 pt-4 sm:px-6 lg:px-8">
      <div className="mb-4 rounded-[28px] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
  <div className="p-5">
    <div className="grid grid-cols-[260px_1fr_360px] items-center gap-6">
      <div className="flex justify-start">
        <Image
          src="/recordiq_logo_transparent.png"
          alt="RecordIQ logo"
          width={220}
          height={220}
          priority
          className="h-24 w-auto object-contain sm:h-28 xl:h-32"
        />
      </div>

      <div className="flex min-w-0 flex-col items-center justify-center text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl xl:text-5xl">
            {caseData?.title || "Untitled Case"}
          </h1>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {caseData?.caseType || "CASE"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-500">
          {caseData?.subjectName ? <span>{caseData.subjectName}</span> : null}
          <span>• {documents.length} documents</span>
          <span>• {events.length} events</span>
          <span>• {stats.pending} pending</span>
          <span>• {stats.approved} approved</span>
          <span>• {stats.hidden} hidden</span>
        </div>

        {caseData?.description ? (
          <p className="mt-3 max-w-3xl text-center text-sm leading-6 text-slate-600">
            {caseData.description}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setShowHidden((prev) => !prev)}
         className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {showHidden ? "Hide hidden" : "Show hidden"}
        </button>

        <button
          type="button"
          onClick={verifyAllVisible}
          disabled={bulkVerifying || !filteredEvents.length}
          className="rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bulkVerifying ? "Verifying..." : "Verify all"}
        </button>

        <div className="relative z-40" ref={downloadRef}>
          <button
            type="button"
            onClick={() => setDownloadOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            Export
            <span className="text-xs">▾</span>
          </button>

          {downloadOpen ? (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                PDF
              </button>
              <button
                type="button"
                onClick={() => handleExport("word")}
                className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                Word
              </button>
              <button
                type="button"
                onClick={() => handleExport("excel")}
                className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                Excel / CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport("zip")}
                className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                Bundle JSON
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </div>
</div>
               <div className="grid min-h-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(360px,38%)_minmax(0,62%)]">
  <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-5 py-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Chronological summaries
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Scroll the story on the left. Evidence lives on the right.
        </p>
      </div>
    </div>

    <div className="h-[calc(100vh-245px)] overflow-y-auto px-4 py-4">
      {groupedEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          {searchQuery.trim()
            ? `No events matched "${searchQuery}".`
            : "No events found for this view."}
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-0 h-full w-px bg-slate-200" />

          {groupedEvents.map((group) => (
            <div key={group.date} className="mb-8">
              <div className="mb-4 pl-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {formatDate(group.date)}
              </div>

              <div className="space-y-3">
              {group.items.map((event) => {
  const isSelected = event.id === selectedEventId;
  const isEditing = event.id === editingEventId;
  const isUpdating = event.id === updatingEventId;
  const isSourceActive = event.documentId === selectedDocumentId;
  const codes = extractMedicalCodes(
    `${event.title || ""}\n${event.description || ""}`
  );

                  return (
<div
  key={event.id}
  role="button"
  tabIndex={0}
  onClick={() => handleSelectEvent(event)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelectEvent(event);
    }
  }}
  className={`relative rounded-3xl border p-5 transition cursor-pointer ${
    isSelected
      ? "border-blue-400 bg-blue-100 shadow-sm"
      : isSourceActive
      ? "border-slate-400 bg-slate-50"
      : !isSelected && event.reviewStatus === "APPROVED"
      ? "border-emerald-300 bg-emerald-50"
      : !isSelected && event.reviewStatus === "REJECTED"
      ? "border-red-300 bg-red-50"
      : "border-slate-200 bg-white hover:border-slate-300"
  }`}
>
                      <div
                        className={`absolute -left-[18px] top-7 h-3.5 w-3.5 rounded-full border-2 ${
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300 bg-white"
                        }`}
                      />

                      <div className="flex flex-col gap-3">
                        <div className="w-full min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                              {formatDate(event.date)}
                            </span>

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPillClasses(
                                event.reviewStatus || "PENDING"
                              )}`}
                            >
                              {event.reviewStatus || "PENDING"}
                            </span>

                            

{event.documentId ? (
<button
  type="button"
  onClick={(e) => {
  handleSourceClick(e, event.id, event.documentId, event.sourcePage);
}}
  className={`rounded-full px-3 py-1 text-xs font-medium ${
    event.documentId === selectedDocumentId
      ? "border border-blue-500 bg-blue-600 text-white"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
  }`}
>
  Source
</button>
) : (
  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
    No Source
  </span>
)}

                            {event.isHidden ? (
                              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                Hidden
                              </span>
                            ) : null}
                          </div>

                          {isEditing ? (
                            <div
                              className="space-y-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                                placeholder="Event title"
                              />
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="min-h-[120px] w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                                placeholder="Event description"
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => saveEdit(event.id)}
                                  disabled={isUpdating}
                                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  {isUpdating ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  disabled={isUpdating}
                                 className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-base font-semibold leading-6 text-slate-950">
                                {event.title}
                              </div>

                              {false ? (<div className="mt-1 text-sm font-medium text-slate-700">
  {getProviderName(event)}
  {getProviderRole(event) ? (
    <>
      <span className="mx-2 text-slate-300">•</span>
      <span>{getProviderRole(event)}</span>
    </>
  ) : null}
  <span className="mx-2 text-slate-300">•</span>
  {getMedicalFacility(event)}
</div>) : getAttributionLine(event) ? (<div className="mt-1 text-sm font-medium text-slate-700">{getAttributionLine(event)}</div>) : null}

                              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                                {event.description || "No description"}
                              </p>

                              {codes.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {codes.map((code) => (
                                    <span
                                      key={`${code.type}-${code.code}`}
                                      title={code.detail}
                                      className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700"
                                    >
                                      {code.label}
                                    </span>
                                  ))}
                                </div>
                              ) : null}

                              <div className="mt-4 flex flex-wrap gap-2">
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      startEditing(event);
    }}
    disabled={isUpdating}
    className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
  >
    Edit
  </button>

  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      updateEvent(event.id, { reviewStatus: "APPROVED" });
    }}
    disabled={isUpdating}
   className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
  >
    Approve
  </button>

  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      updateEvent(event.id, { reviewStatus: "REJECTED" });
    }}
    disabled={isUpdating}
    className="rounded-xl bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
  >
    Decline
  </button>

  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      updateEvent(event.id, {
        reviewStatus: "PENDING",
        isHidden: false,
      });
    }}
    disabled={isUpdating}
    className="rounded-xl bg-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-300"
  >
    Reset
  </button>

  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      updateEvent(event.id, {
        isHidden: !event.isHidden,
      });
    }}
    disabled={isUpdating}
    className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
  >
    {event.isHidden ? "Unhide" : "Hide"}
  </button>
</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>

  <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-5 py-4">
      <div className="flex justify-end">
        <div className="w-[420px] shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>

    <div className="h-[calc(100vh-245px)] overflow-y-auto">
      {selectedEvent ? (
        <div className="space-y-5 p-5">
          <div
            className={`rounded-3xl border p-5 transition ${
              selectedEvent.id === selectedEventId
                ? "border-blue-300 bg-blue-50 shadow-sm"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                {formatDate(selectedEvent.date)}
              </span>

              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPillClasses(
                  selectedEvent.reviewStatus || "PENDING"
                )}`}
              >
                {selectedEvent.reviewStatus || "PENDING"}
              </span>

              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${typePillClasses(
                  selectedEvent.eventType
                )}`}
              >
                {selectedEvent.eventType || "other"}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-slate-950">
              {selectedEvent.title}
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
  Provider
</div>
<div className="mt-1 text-sm font-medium text-slate-900">
  {getProviderName(selectedEvent) || "Not identified in source text"}
</div>
{getProviderRole(selectedEvent) ? (
  <div className="mt-1 text-xs text-slate-500">
    {getProviderRole(selectedEvent)}
  </div>
) : null}
              </div>

              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Facility
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {getMedicalFacility(selectedEvent) || "Not identified in source text"}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Source page
                </div>
                <div className="mt-1 text-sm font-medium text-blue-600">
  Viewing: {activeDocument?.fileName || "No source document"}
</div>
              </div>

             <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
    Document
  </div>
  <div className="mt-1 break-words text-sm font-medium text-slate-900">
    {activeDocument?.fileName || "No source document"}
  </div>

  {activeDocument?.fileUrl ? (
    <a
      href={activeDocument.fileUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-block text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
    >
      Open source document
    </a>
  ) : null}
</div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {selectedEvent.description || "No description"}
              </p>
            </div>

            {selectedCodes.length ? (
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Detected codes
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCodes.map((code) => (
                    <span
                      key={`${code.type}-${code.code}`}
                      title={code.detail}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {code.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div
  id="source-document-viewer"
  className="overflow-hidden rounded-3xl border border-slate-200"
>
            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <div className="text-sm font-semibold text-slate-900">
                Source document preview
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {activeDocument?.fileName || "No source document"}
              </div>
            </div>

           <div className="bg-slate-100 p-3">
  {activeDocument ? (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {activeDocument.fileName}
          </p>
          <p className="text-xs text-slate-500">
            Page {activeSourcePage || 1}
          </p>
        </div>
      </div>

      {activeDocument.fileUrl ? (
  fileIsPdf(activeDocument) ? (
    <iframe
      key={`${activeDocument.fileUrl}-${activeSourcePage ?? "nopage"}-${selectedEventId ?? "noevent"}`}
      src={
        activeSourcePage
          ? `${activeDocument.fileUrl}?sourcePage=${activeSourcePage}&t=${selectedEventId ?? Date.now()}#page=${activeSourcePage}&zoom=page-fit`
          : `${activeDocument.fileUrl}`
      }
      title={activeDocument.fileName || "Source document"}
      className="h-[760px] w-full bg-white"
    />
  ) : (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
      <a
        href={activeDocument.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Open document
      </a>
    </div>
  )
) : (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
    No preview available for this event.
  </div>
)}
    </div>
  ) : (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
      Select an event or click Source to open its document.
    </div>
  )}
</div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-sm text-slate-500">
          Select an event to view details and source preview.
        </div>
      )}
  </div>
</section>
      </div>
    </div>
  </div>
);
}
