"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  buildTimelineDisplayGroups,
  generateTimelineSummary,
  type TimelineDisplayDateGroup,
} from "@/lib/timeline-summary";
import { buildCaseExportHtml } from "@/lib/case-export-html";
import { formatTimelineDateValue } from "@/lib/timeline-date";


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
  eventDate?: string | null;
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

type TimelineSummary = {
  caseSummary: string;
  keyFindings: string[];
  mode: "short" | "grouped" | "highlights";
};

type ExtractedCode = {
  code: string;
  type: "CPT" | "ICD";
  label: string;
  detail: string;
};

function normalizeTimelineEventDate(event: {
  date?: string | null;
  eventDate?: string | Date | null;
}) {
  return formatTimelineDateValue(event.date ?? event.eventDate);
}

function normalizeTimelineEvent(event: TimelineEvent): TimelineEvent {
  return {
    ...event,
    date: normalizeTimelineEventDate(event),
  };
}

async function safeJson(res: Response, label: string) {
  const text = await res.text();
  console.log(`${label.toUpperCase()} RAW RESPONSE:`, text);

  if (!text) {
    throw new Error(`${label} returned empty response`);
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(`${label.toUpperCase()} JSON PARSE ERROR:`, error);
    console.error(`${label.toUpperCase()} NON-JSON BODY:`, text);
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
  const date = normalizeTimelineEventDate(event);

  if (!date || date === "UNKNOWN") {
    return Number.MAX_SAFE_INTEGER;
  }

  return Number(date.replaceAll("-", ""));
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
    date: normalizeTimelineEventDate(event),
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

  return lines.join(" | ");
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

function isTimelineSummary(value: unknown): value is TimelineSummary {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<TimelineSummary>;

  return (
    typeof candidate.caseSummary === "string" &&
    Array.isArray(candidate.keyFindings) &&
    candidate.keyFindings.every((item) => typeof item === "string") &&
    (candidate.mode === "short" ||
      candidate.mode === "grouped" ||
      candidate.mode === "highlights")
  );
}


export default function CasePage() {
  const params = useParams();
  const caseId = typeof params?.id === "string" ? params.id : "";

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [timelineSummary, setTimelineSummary] = useState<TimelineSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadWarning, setLoadWarning] = useState<string | null>(null);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [activeSourcePage, setActiveSourcePage] = useState<number | null>(null);
  const [sourceDocumentViewUrl, setSourceDocumentViewUrl] = useState<string | null>(null);
  const [sourceDocumentIframeSrc, setSourceDocumentIframeSrc] = useState<string | null>(null);
  const [sourcePreviewStatus, setSourcePreviewStatus] = useState<
    "idle" | "loading" | "ready" | "error" | "no-document" | "no-page"
  >("idle");
  const [showHidden, setShowHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [bulkVerifying, setBulkVerifying] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [copiedCaseId, setCopiedCaseId] = useState(false);

  const downloadRef = useRef<HTMLDivElement | null>(null);
  const selectedEventIdRef = useRef<string | null>(null);
  const setSelectedSourceDocument = setSelectedDocumentId;

  async function copyCaseId() {
    const value = caseData?.id || caseId;
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedCaseId(true);
      window.setTimeout(() => setCopiedCaseId(false), 1500);
    } catch (error) {
      console.error("Copy case ID failed:", error);
    }
  }

  function handleSelectEvent(event: TimelineEvent) {
    setSelectedEventId(event.id);
    setSelectedSourceDocument(event.documentId ?? null);
    setActiveSourcePage(getSourcePage(event));
    setSourceDocumentViewUrl(null);
    setSourceDocumentIframeSrc(null);
    if (!event.documentId) {
      setSourcePreviewStatus("no-document");
    } else if (!getSourcePage(event)) {
      setSourcePreviewStatus("no-page");
    } else {
      setSourcePreviewStatus("idle");
    }
  }

  function prepareSourceSelection(event: TimelineEvent) {
    const sourcePage = getSourcePage(event);

    setSelectedEventId(event.id);
    setSelectedSourceDocument(event.documentId ?? null);
    setActiveSourcePage(sourcePage);
    setSourceDocumentViewUrl(null);
    setSourceDocumentIframeSrc(null);

    return sourcePage;
  }

  async function openSourceDocument(event: TimelineEvent) {
    const sourcePage = prepareSourceSelection(event);

    if (!event.documentId) {
      setSourcePreviewStatus("no-document");
      return;
    }

    setSourcePreviewStatus("loading");

    try {
      const response = await fetch(`/api/documents/${event.documentId}/view-url`, {
        cache: "no-store",
      });
      const text = await response.text();

      let json: { success?: boolean; url?: string; error?: string } | null = null;
      if (text.trim()) {
        try {
          json = JSON.parse(text);
        } catch (parseError) {
          console.error("Document view URL parse error:", parseError);
        }
      }

      if (!response.ok || !json?.success || !json.url) {
        throw new Error(json?.error || "Failed to load document view URL");
      }

      const iframeSrc = sourcePage ? `${json.url}#page=${sourcePage}` : json.url;
      setSourceDocumentViewUrl(json.url);
      setSourceDocumentIframeSrc(iframeSrc);
      setSourcePreviewStatus(sourcePage ? "ready" : "no-page");
    } catch (error) {
      setSourceDocumentIframeSrc(null);
      setSourcePreviewStatus("error");
      console.error("Document view URL error:", error);
    }

    const viewer = document.getElementById("source-document-viewer");
    if (viewer) {
      viewer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const getDocumentName = useCallback(
    (documentId?: string | null) =>
      documents.find((doc) => doc.id === documentId)?.fileName || "Unknown",
    [documents]
  );

function getProviderName(event: TimelineEvent) {
  const value = event.providerName?.trim() || event.physicianName?.trim() || null;
  if (!value) return null;

  const normalized = value.toLowerCase();
  if (
    /patient care paragraph text|paragraph text|zoll cloud|signature graphic|signature|cloud|graphic/.test(
      normalized
    )
  ) {
    return null;
  }

  return value;
}

function getProviderRole(event: TimelineEvent) {
  return event.providerRole?.trim() || event.physicianRole?.trim() || null;
}

function getMedicalFacility(event: TimelineEvent) {
  return event.medicalFacility?.trim() || null;
}

function getNormalizedSourcePacketName(event: TimelineEvent) {
  const sourcePacket = getSourcePacketName(event);
  if (!sourcePacket) return "";

  return sourcePacket
    .replace(/[_-]+/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getEmsAgencyName(event: TimelineEvent) {
  const packet = getNormalizedSourcePacketName(event);
  const text = `${event.title || ""} ${event.description || ""}`.toLowerCase();

  if (/\breagan county fire(?: and)? ems\b/.test(packet) || /\breagan county fire\b/.test(text)) {
    return "Reagan County Fire & EMS";
  }

  return null;
}

function normalizeAttributionValue(value?: string | null) {
  return (value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function isEmsAttributionEvent(event: TimelineEvent) {
  const packet = getNormalizedSourcePacketName(event);
  const role = (getProviderRole(event) || "").toLowerCase();
  const text = `${event.title || ""} ${event.description || ""} ${event.providerName || ""} ${event.physicianName || ""}`.toLowerCase();

  return (
    /\breagan county fire(?: and)? ems\b/.test(packet) ||
    /\breagan county fire\b/.test(text) ||
    role.includes("ems") ||
    /\b(ems|ambulance|transport destination|crew member|primary patient caregiver)\b/.test(text)
  );
}

function getTransportDestination(event: TimelineEvent) {
  const text = `${event.title || ""} ${event.description || ""}`.toLowerCase();
  const destinationMatch = text.match(
    /\b(?:transport(?:ed)?(?: destination)?|destined for|to)\s+(reagan memorial hospital|shannon er|shannon medical center)\b/
  );

  if (destinationMatch?.[1]) {
    const mapped = destinationMatch[1];
    if (mapped.includes("reagan memorial")) return "Reagan Memorial Hospital";
    if (mapped.includes("shannon er")) return "Shannon ER";
    if (mapped.includes("shannon medical center")) return "Shannon Medical Center";
  }

  if (/\breagan memorial hospital\b/.test(text)) {
    return "Reagan Memorial Hospital";
  }

  if (/\bshannon er\b/.test(text)) {
    return "Shannon ER";
  }

  const facility = getMedicalFacility(event);
  const emsAgency = getEmsAgencyName(event);
  if (
    isEmsAttributionEvent(event) &&
    facility &&
    normalizeAttributionValue(facility) !== normalizeAttributionValue(emsAgency)
  ) {
    return facility;
  }

  return null;
}

function getSourcePacketName(event: TimelineEvent) {
  const sourceName = event.documentName?.trim() || null;

  if (!sourceName) {
    return null;
  }

  return sourceName.replace(/\.[a-z0-9]+$/i, "").replace(/\s+/g, " ").trim();
}

function getAttributionLine(event: TimelineEvent) {
  const sourcePacket = getSourcePacketName(event);
  const providerName = getProviderName(event);
  const facility = getMedicalFacility(event);
  const emsAgency = getEmsAgencyName(event);
  const transportDestination = getTransportDestination(event);

  if (isEmsAttributionEvent(event)) {
    return [
      sourcePacket ? `Source packet: ${sourcePacket}` : null,
      emsAgency ? `EMS agency: ${emsAgency}` : null,
      providerName ? `Provider: ${providerName}` : null,
      transportDestination ? `Transport destination: ${transportDestination}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
  }

  return [
    sourcePacket ? `Source packet: ${sourcePacket}` : null,
    facility ? `Medical facility: ${facility}` : null,
    providerName ? `Provider: ${providerName}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

function getSourcePage(event?: TimelineEvent | null) {
  return typeof event?.sourcePage === "number" && event.sourcePage > 0
    ? event.sourcePage
    : null;
}

  const loadCase = useCallback(async () => {
    if (!caseId) return;

    try {
      setLoading(true);
      setError(null);
      setTimelineSummary(null);

      const fetchJson = async (url: string, label: string) => {
        try {
          const res = await fetch(url, { cache: "no-store" });
          const text = await res.text();
          console.log(`${label.toUpperCase()} RAW RESPONSE:`, text);

          if (!text.trim()) {
            return {
              ok: res.ok,
              data: null,
              error: `${label} returned empty response`,
            };
          }

          try {
            return {
              ok: res.ok,
              data: JSON.parse(text),
              error: null as string | null,
            };
          } catch (parseError) {
            console.error(`${label.toUpperCase()} JSON PARSE ERROR:`, parseError);
            return {
              ok: false,
              data: null,
              error: `${label} returned invalid JSON`,
            };
          }
        } catch (fetchError) {
          console.error(`${label.toUpperCase()} FETCH ERROR:`, fetchError);
          return {
            ok: false,
            data: null,
            error:
              fetchError instanceof Error
                ? fetchError.message
                : `${label} request failed`,
          };
        }
      };

      const [caseResult, docsResult, eventsResult] = await Promise.all([
        fetchJson(`/api/cases/${caseId}`, "Case"),
        fetchJson(`/api/cases/${caseId}/documents`, "Documents"),
        fetchJson(`/api/cases/${caseId}/timeline-events?includeHidden=1`, "Timeline"),
      ]);

      if (!caseResult.ok || !caseResult.data?.success) {
        throw new Error(caseResult.data?.error || caseResult.error || "Failed to load case");
      }

      const warnings: string[] = [];
      const nextCase = caseResult.data.case ?? null;

      const nextDocs = Array.isArray(docsResult.data?.documents)
        ? docsResult.data.documents
        : [];
      if (!docsResult.ok || !docsResult.data?.success) {
        const message = docsResult.data?.error || docsResult.error || "Failed to load documents";
        warnings.push(message);
        console.error("Documents load warning:", message);
      }

      const nextEvents = Array.isArray(eventsResult.data?.timelineEvents)
        ? eventsResult.data.timelineEvents.map((event: TimelineEvent) =>
            normalizeTimelineEvent(event)
          )
        : [];
      const nextSummary = isTimelineSummary(eventsResult.data?.summary)
        ? eventsResult.data.summary
        : null;
      if (!eventsResult.ok || !eventsResult.data?.success) {
        const message = eventsResult.data?.error || eventsResult.error || "Failed to load timeline events";
        warnings.push(message);
        console.error("Timeline load warning:", message);
      }

      setCaseData(nextCase);
      setDocuments(nextDocs);
      setEvents(nextEvents);
      setTimelineSummary(nextSummary);
      setLoadWarning(warnings.length ? warnings.join(" | ") : null);

      const currentSelectedEventId = selectedEventIdRef.current;
      const resolvedSelectedEventId =
        currentSelectedEventId &&
        nextEvents.some((event: TimelineEvent) => event.id === currentSelectedEventId)
          ? currentSelectedEventId
          : nextEvents[0]?.id || null;

      setSelectedEventId(resolvedSelectedEventId);

      const resolvedSelectedEvent =
        nextEvents.find((event: TimelineEvent) => event.id === resolvedSelectedEventId) || null;

      setSelectedDocumentId(resolvedSelectedEvent?.documentId ?? null);
    } catch (err) {
      console.error("Load case error:", err);
      setError(err instanceof Error ? err.message : "Failed to load case");
      setLoadWarning(null);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  useEffect(() => {
    selectedEventIdRef.current = selectedEventId;
  }, [selectedEventId]);

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
    .join(" | ");

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
}, [visibleEvents, searchQuery, getDocumentName]);

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

  const groupedEvents = useMemo<TimelineDisplayDateGroup[]>(
    () => buildTimelineDisplayGroups(filteredEvents),
    [filteredEvents]
  );

  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedEventId) ||
    visibleEvents.find((event) => event.id === selectedEventId) ||
    events.find((event) => event.id === selectedEventId) ||
    null;

  const currentSourcePage = getSourcePage(selectedEvent) ?? activeSourcePage;

  useEffect(() => {
    setSelectedSourceDocument(selectedEvent?.documentId ?? null);
    setActiveSourcePage(getSourcePage(selectedEvent));
  }, [selectedEvent]);

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

    const safeTitle = (caseData?.title || "verachron-case")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (format === "excel") {
      const csv = rowsToCsv(rows);
      downloadBlob(csv, `${safeTitle}-chronology.csv`, "text/csv;charset=utf-8;");
      return;
    }

    if (format === "word") {
      const content = groupedEvents
        .map(
          (group) => `
${formatDate(group.date)}
${group.groups
  .map(
    (section) => `
${section.categoryLabel}
${section.items
  .map(
    (event) => `${event.title}
${getAttributionLine(event as TimelineEvent) ? `Attribution: ${getAttributionLine(event as TimelineEvent)}\n` : ""}${event.description || "No description"}
Type: ${event.eventType || "other"}
Page: ${event.sourcePage ?? ""}
Document: ${getDocumentName(event.documentId)}
Status: ${event.reviewStatus || "PENDING"}
`
  )
  .join("\n")}
`
  )
  .join("\n")}
`
        )
        .join(" | ");

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

    const exportSummary = timelineSummary ?? generateTimelineSummary(filteredEvents);
    const summary = exportSummary;
    const html = buildCaseExportHtml({
      caseData,
      groupedEvents,
      summary: exportSummary,
      getAttributionLine: (event) => getAttributionLine(event as TimelineEvent),
      getDocumentName,
    });
    console.log("EXPORT SUMMARY CHECK", {
      hasSummary: Boolean(summary),
      mode: summary?.mode,
      keyFindingsCount: summary?.keyFindings?.length,
    });
    console.log("EXPORT HTML HAS CASE SUMMARY", html.includes("Case Summary"));

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
        <div className="mx-auto max-w-[1600px] space-y-4">
          <div className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-700 shadow-sm">
            {error}
          </div>
          {loadWarning ? (
            <div className="rounded-3xl border border-amber-300 bg-amber-50 p-4 text-amber-800 shadow-sm">
              {loadWarning}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="mx-auto max-w-[1700px] px-4 pb-6 pt-4 sm:px-6 lg:px-8">
      {loadWarning ? (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          {loadWarning}
        </div>
      ) : null}
      <div className="mb-4 rounded-[28px] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
  <div className="p-5">
    <div className="grid grid-cols-[260px_1fr_360px] items-center gap-6">
      <div className="flex justify-start">
        <Image
          src="/recordiq_logo_transparent.png"
          alt="VeraChron logo"
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
          <div className="w-full text-center">
            <div>Subject: {caseData?.subjectName || "Not specified"}</div>
            <div className="mt-1 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span>Case ID: {caseData?.id || caseId}</span>
              <button
                type="button"
                onClick={copyCaseId}
                className="rounded-full border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                {copiedCaseId ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <span>| {documents.length} documents</span>
          <span>| {events.length} events</span>
          <span>| {stats.pending} pending</span>
          <span>| {stats.approved} approved</span>
          <span>| {stats.hidden} hidden</span>
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
            <span className="text-xs">?</span>
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
      {timelineSummary ? (
        <div className="mb-4 overflow-hidden rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white px-5 py-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Summary Layer
              </div>
              <h3 className="mt-1 text-base font-semibold text-amber-950">
                Case Summary
              </h3>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
              {timelineSummary.mode}
            </span>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-950">
            {timelineSummary.caseSummary}
          </p>

          {timelineSummary.keyFindings.length ? (
            <div className="mt-5 border-t border-amber-200/70 pt-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                Key Findings
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-950">
                {timelineSummary.keyFindings.map((finding) => (
                  <li key={finding} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

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
              <div className="mb-4 flex items-center gap-3 pl-2">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  {formatDate(group.date)}
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                  {group.groups.reduce((total, section) => total + section.items.length, 0)} events
                </span>
              </div>

              <div className="space-y-4">
                {group.groups.map((section) => (
                  <div
                    key={`${group.date}-${section.category}`}
                    className="rounded-[24px] border border-slate-200 bg-white/90 p-3 shadow-sm"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <span>{section.categoryLabel}</span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                        {section.items.length} events
                      </span>
                    </div>

                    <div className="space-y-3">
                      {section.items.map((event) => {
                        const eventId = event.id || "";
                        const timelineEvent = event as TimelineEvent;
                        const isSelected = eventId === selectedEventId;
                        const isEditing = eventId === editingEventId;
                        const isUpdating = eventId === updatingEventId;
                        const isSourceActive =
                          isSelected && timelineEvent.documentId === selectedDocumentId;
                        const codes = extractMedicalCodes(
                          `${timelineEvent.title || ""}\n${timelineEvent.description || ""}`
                        );

                  return (
<div
  key={eventId}
  role="button"
  tabIndex={0}
  onClick={() => handleSelectEvent(timelineEvent)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelectEvent(timelineEvent);
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
                              {formatDate(timelineEvent.date)}
                            </span>

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPillClasses(
                                timelineEvent.reviewStatus || "PENDING"
                              )}`}
                            >
                              {timelineEvent.reviewStatus || "PENDING"}
                            </span>

                            {timelineEvent.documentId ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void openSourceDocument(timelineEvent);
                                }}
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  isSourceActive
                                    ? "border border-blue-500 bg-blue-600 text-white"
                                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                Source
                              </button>
                            ) : (
                              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                No source available
                              </span>
                            )}

                            {timelineEvent.isHidden ? (
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
                                      onClick={() => saveEdit(eventId)}
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

                              {getAttributionLine(timelineEvent) ? (<div className="mt-1 text-sm font-medium text-slate-700">{getAttributionLine(timelineEvent)}</div>) : null}

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
      startEditing(timelineEvent);
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
                                    updateEvent(eventId, { reviewStatus: "APPROVED" });
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
                                    updateEvent(eventId, { reviewStatus: "REJECTED" });
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
                                    updateEvent(eventId, {
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
                                    updateEvent(eventId, {
                                      isHidden: !timelineEvent.isHidden,
                                    });
                                  }}
    disabled={isUpdating}
    className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
  >
    {timelineEvent.isHidden ? "Unhide" : "Hide"}
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
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {currentSourcePage ?? "Page not specified"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {activeDocument?.fileName || "No source document"}
                </div>
              </div>

             <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
    Document
  </div>
  <div className="mt-1 break-words text-sm font-medium text-slate-900">
    {activeDocument?.fileName || "No source document"}
  </div>

  {sourceDocumentViewUrl ? (
    <a
      href={sourceDocumentViewUrl}
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
           <div className="bg-slate-100 p-3">
  <div className="mx-auto max-w-4xl">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <div className="text-sm font-semibold text-slate-900">
          Source Document Viewer
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {activeDocument?.fileName
            ? `${activeDocument.fileName} | ${
                currentSourcePage !== null
                  ? `Page ${currentSourcePage}`
                  : "Page not specified"
              }`
            : "Click Source on a timeline event to preview the supporting document page."}
        </div>
      </div>

      {sourcePreviewStatus === "no-page" ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Page not specified. Showing the source document without a page anchor.
        </div>
      ) : null}

      {sourceDocumentIframeSrc ? (
        <iframe
          key={`${sourceDocumentIframeSrc}-${currentSourcePage ?? "nopage"}-${selectedEventId ?? "noevent"}`}
          src={sourceDocumentIframeSrc}
          title={activeDocument?.fileName || "Source document"}
          className="h-[850px] w-full rounded-xl border border-slate-200 bg-white shadow-sm"
        />
      ) : sourcePreviewStatus === "error" ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-500">
          Unable to load the source document preview. Please try again.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-500">
          Click Source on a timeline event to preview the supporting document page.
        </div>
      )}
    </div>
  </div>
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


