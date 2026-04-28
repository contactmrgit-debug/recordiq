type ExportCaseData = {
  title?: string | null;
  caseType?: string | null;
  subjectName?: string | null;
};

type ExportEvent = {
  id?: string;
  date?: string | null;
  title?: string | null;
  description?: string | null;
  eventType?: string | null;
  sourcePage?: number | null;
  reviewStatus?: string | null;
  documentId?: string | null;
};

type ExportEventGroup = {
  date: string;
  items: ExportEvent[];
};

type ExportSummary = {
  caseSummary: string;
  keyFindings: string[];
  mode: "short" | "grouped" | "highlights";
};

type ExportHtmlArgs = {
  caseData: ExportCaseData | null;
  groupedEvents: ExportEventGroup[];
  summary: ExportSummary;
  getAttributionLine: (event: ExportEvent) => string;
  getDocumentName: (documentId?: string | null) => string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderSummary(summary: ExportSummary): string {
  const findings = summary.keyFindings
    .map((finding) => `<li>${escapeHtml(finding)}</li>`)
    .join("");

  return `
    <div class="summary-card">
      <div class="summary-title">Case Summary</div>
      <p class="summary-paragraph">${escapeHtml(summary.caseSummary)}</p>
      ${
        summary.keyFindings.length
          ? `
            <div class="summary-subtitle">Key Findings</div>
            <ul class="summary-list">
              ${findings}
            </ul>
          `
          : ""
      }
    </div>
  `;
}

export function buildCaseExportHtml({
  caseData,
  groupedEvents,
  summary,
  getAttributionLine,
  getDocumentName,
}: ExportHtmlArgs): string {
  return `
    <html>
      <head>
        <title>${escapeHtml(caseData?.title || "Case Chronology")}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h1 { margin-bottom: 8px; }
          .meta { color: #555; margin-bottom: 24px; font-size: 14px; }
          .summary-card { border: 1px solid #e9d5a6; background: #fffbeb; border-radius: 18px; padding: 16px; margin-bottom: 20px; break-inside: avoid; }
          .summary-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #92400e; margin: 0 0 10px 0; }
          .summary-paragraph { margin: 0; font-size: 14px; line-height: 1.6; color: #1f2937; }
          .summary-subtitle { margin: 14px 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #b45309; }
          .summary-list { margin: 0; padding-left: 18px; color: #1f2937; }
          .summary-list li { margin-bottom: 6px; line-height: 1.5; }
          .timeline-heading { margin-top: 16px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #111827; }
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
        ${renderSummary(summary)}
        <div class="timeline-heading">Timeline</div>
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
}
