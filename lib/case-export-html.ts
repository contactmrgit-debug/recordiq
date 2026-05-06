function isPlaceholderPatientName(value?: string | null): boolean {
  const normalized = (value || "").replace(/\s+/g, " ").trim().toLowerCase();
  return (
    !normalized ||
    normalized === "unnamed patient" ||
    normalized === "unnamed case" ||
    normalized === "payer-returned name" ||
    normalized === "payer returned name" ||
    normalized === "subscriber name" ||
    normalized === "guarantor information" ||
    normalized === "patient contacts" ||
    normalized === "provider information" ||
    normalized === "our client" ||
    normalized === "the client" ||
    normalized === "client" ||
    normalized === "unknown patient" ||
    normalized === "patient" ||
    normalized === "the patient" ||
    normalized === "new patient" ||
    normalized === "claimant" ||
    normalized === "the claimant" ||
    normalized === "member" ||
    normalized === "insured" ||
    normalized === "subscriber" ||
    normalized === "your patient" ||
    normalized === "your client" ||
    normalized === "not specified" ||
    normalized === "unknown" ||
    normalized === "n/a" ||
    normalized === "na" ||
    normalized === "none"
  );
}

type ExportCaseData = {
  title?: string | null;
  caseType?: string | null;
  patientName?: string | null;
  subjectName?: string | null;
  patientDob?: string | null;
  subjectDob?: string | null;
};

export type CaseExportRow = {
  date: string;
  title: string;
  description?: string | null;
  eventType?: string | null;
  sourcePageStart?: number | null;
  sourcePage?: number | null;
  sourcePageEnd?: number | null;
  pageRange?: string | null;
  reviewStatus?: string | null;
  documentName?: string | null;
  attribution?: string | null;
  medicalFacility?: string | null;
  isHidden?: boolean | null;
};

type ExportSummary = {
  caseSummary?: string;
  keyFindings?: string[];
  mode?: "short" | "grouped" | "highlights";
  caseSnapshot?: string;
  keyIssues?: string[];
  dateSummaries?: {
    date: string;
    summary: string;
  }[];
};

type ExportHtmlArgs = {
  caseData: ExportCaseData | null;
  chronologyRows: CaseExportRow[];
  hiddenRows?: CaseExportRow[];
  summary: ExportSummary | null;
};

type MissingRecordIndicator = {
  issue: string;
  whyItMayMatter: string;
  sourceDate: string;
  sourcePage: string;
  status: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isPlaceholderCaseTitle(value?: string | null): boolean {
  const normalized = (value || "").replace(/\s+/g, " ").trim().toLowerCase();
  return (
    !normalized ||
    normalized === "untitled case" ||
    normalized === "untitled" ||
    normalized === "case chronology" ||
    normalized === "unknown case" ||
    normalized === "unnamed case"
  );
}

function formatDisplayDate(value?: string | null): string {
  const normalized = (value || "").trim();
  if (!normalized || normalized === "UNKNOWN") {
    return "Unknown";
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) {
    return normalized;
  }

  return `${match[2]}/${match[3]}/${match[1]}`;
}

function normalizeDisplayText(value?: string | null): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizeComparisonText(value?: string | null): string {
  return normalizeDisplayText(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPageNumberLabel(page: number): string {
  return `Page ${page}`;
}

function formatPageRangeLabel(start: number, end: number): string {
  return start === end ? formatPageNumberLabel(start) : `Pages ${start}-${end}`;
}

function formatPageReference(
  row: Pick<CaseExportRow, "sourcePageStart" | "sourcePage" | "sourcePageEnd" | "pageRange">
): string {
  if (typeof row.pageRange === "string") {
    const normalized = normalizeDisplayText(row.pageRange);
    if (normalized) {
      const rangeMatch = /^pages?\s*(\d+)\s*[-–]\s*(\d+)$/i.exec(normalized);
      if (rangeMatch) {
        const start = Number(rangeMatch[1]);
        const end = Number(rangeMatch[2]);
        if (start > 0 && end > 0) {
          return formatPageRangeLabel(start, end);
        }
      }

      const singleMatch = /^pages?\s*(\d+)$/i.exec(normalized);
      if (singleMatch) {
        const page = Number(singleMatch[1]);
        if (page > 0) {
          return formatPageNumberLabel(page);
        }
      }

      const numericRangeMatch = /^(\d+)\s*[-–]\s*(\d+)$/.exec(normalized);
      if (numericRangeMatch) {
        const start = Number(numericRangeMatch[1]);
        const end = Number(numericRangeMatch[2]);
        if (start > 0 && end > 0) {
          return formatPageRangeLabel(start, end);
        }
      }

      const numericSingleMatch = /^(\d+)$/.exec(normalized);
      if (numericSingleMatch) {
        const page = Number(numericSingleMatch[1]);
        if (page > 0) {
          return formatPageNumberLabel(page);
        }
      }

      return normalized;
    }
  }

  const start =
    typeof row.sourcePageStart === "number" && Number.isFinite(row.sourcePageStart)
      ? row.sourcePageStart
      : typeof row.sourcePage === "number" && Number.isFinite(row.sourcePage)
        ? row.sourcePage
        : null;
  const end =
    typeof row.sourcePageEnd === "number" && Number.isFinite(row.sourcePageEnd)
      ? row.sourcePageEnd
      : null;

  if (typeof start !== "number" || start <= 0) {
    return "Not available";
  }

  if (typeof end === "number" && end > start) {
    return formatPageRangeLabel(start, end);
  }

  return formatPageNumberLabel(start);
}

function formatReviewStatusLabel(status?: string | null): string {
  switch ((status || "PENDING").toUpperCase()) {
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "PENDING":
      return "Pending";
    default:
      return status || "Pending";
  }
}

function normalizeExportDate(value?: string | null): string | null {
  const normalized = (value || "").trim();
  if (!normalized || normalized === "UNKNOWN") {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  return null;
}

function parseExportDate(value: string): number | null {
  const normalized = normalizeExportDate(value);
  if (!normalized) {
    return null;
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function groupChronologyRows(rows: CaseExportRow[]): { date: string; rows: CaseExportRow[] }[] {
  const indexedRows = rows
    .map((row, index) => ({
      row,
      index,
      date: normalizeExportDate(row.date) || "UNKNOWN",
      time: parseExportDate(row.date),
    }))
    .sort((a, b) => {
      const aTime = a.time ?? Number.MAX_SAFE_INTEGER;
      const bTime = b.time ?? Number.MAX_SAFE_INTEGER;
      if (aTime !== bTime) return aTime - bTime;

      if (a.date !== b.date) {
        if (a.date === "UNKNOWN") return 1;
        if (b.date === "UNKNOWN") return -1;
        return a.date.localeCompare(b.date);
      }

      return a.index - b.index;
    });

  const grouped = new Map<string, CaseExportRow[]>();

  for (const item of indexedRows) {
    const bucket = grouped.get(item.date) || [];
    bucket.push(item.row);
    grouped.set(item.date, bucket);
  }

  return Array.from(grouped.entries()).map(([date, groupedRows]) => ({
    date,
    rows: groupedRows,
  }));
}

function normalizeRowSummary(row: CaseExportRow): string {
  const title = normalizeDisplayText(row.title);
  const description = normalizeDisplayText(row.description);

  if (title && description) {
    const normalizedTitle = normalizeComparisonText(title);
    const normalizedDescription = normalizeComparisonText(description);

    if (normalizedDescription.startsWith(normalizedTitle)) {
      return description;
    }

    if (normalizedTitle.startsWith(normalizedDescription)) {
      return title;
    }

    if (description.length >= title.length + 18) {
      return description;
    }

    if (title.length >= description.length + 18) {
      return title;
    }

    return `${title}; ${description}`;
  }

  return title || description || "Related event";
}

function isFollowupTouchpoint(row: CaseExportRow): boolean {
  const text = normalizeComparisonText(
    `${row.title || ""} ${row.description || ""} ${row.eventType || ""}`
  );

  if (!text) return false;

  return /\b(follow[- ]?up|followup|recheck|re-evaluat|clinic|outpatient|appointment|return precautions|pcp|wound check|specialist visit)\b/.test(
    text
  );
}

function isDischargeFollowupSignal(row: CaseExportRow): boolean {
  const text = normalizeComparisonText(`${row.title || ""} ${row.description || ""}`);

  return (
    /\b(discharge|discharged|discharge instructions?|return precautions)\b/.test(text) &&
    /\bfollow[- ]?up\b/.test(text)
  );
}

function isClinicalTouchpoint(row: CaseExportRow): boolean {
  const text = normalizeComparisonText(
    `${row.title || ""} ${row.description || ""} ${row.eventType || ""}`
  );

  if (!text) return false;

  return (
    /\b(incident|symptom|imaging|lab|procedure|treatment|medication|transfer|follow[- ]?up|appointment|visit|consult|discharge)\b/.test(
      text
    ) || /\b(ed|emergency department|clinic|office|provider|physician|patient seen)\b/.test(text)
  );
}

function isProviderVisitSignal(row: CaseExportRow): boolean {
  const text = normalizeComparisonText(
    `${row.title || ""} ${row.description || ""} ${row.eventType || ""}`
  );

  return /\b(follow[- ]?up|followup|appointment|clinic|office visit|recheck|re-evaluation|provider visit|specialist visit)\b/.test(
    text
  );
}

function hasLaterFollowupTouchpoint(
  chronologyRows: CaseExportRow[],
  rowIndex: number
): boolean {
  const currentTime = parseExportDate(chronologyRows[rowIndex]?.date || "");
  if (currentTime == null) return false;

  return chronologyRows.slice(rowIndex + 1).some((candidate) => {
    const candidateTime = parseExportDate(candidate.date);
    if (candidateTime == null || candidateTime <= currentTime) {
      return false;
    }

    return isFollowupTouchpoint(candidate) || isProviderVisitSignal(candidate);
  });
}

function buildMissingRecordIndicators(
  chronologyRows: CaseExportRow[],
  summary: ExportSummary | null
): MissingRecordIndicator[] {
  const indicators: MissingRecordIndicator[] = [];
  const seen = new Set<string>();
  const groupedRows = groupChronologyRows(chronologyRows);

  for (const [index, row] of chronologyRows.entries()) {
    if (!isFollowupTouchpoint(row) && !isDischargeFollowupSignal(row)) {
      continue;
    }

    if (hasLaterFollowupTouchpoint(chronologyRows, index)) {
      continue;
    }

    const issue = isDischargeFollowupSignal(row)
      ? "Discharge instructions mention follow-up, but no later provider visit is visible in the current chronology."
      : "Follow-up was documented, but no later follow-up visit is visible in the current chronology.";
    const normalizedIssue = normalizeComparisonText(issue);
    if (seen.has(normalizedIssue)) continue;
    seen.add(normalizedIssue);

    indicators.push({
      issue,
      whyItMayMatter:
        "The care plan may continue in records that were not included in the current packet, so the chronology should be checked for missing follow-up documentation.",
      sourceDate: formatDisplayDate(row.date),
      sourcePage: formatPageReference(row),
      status: "Needs review",
    });
  }

  for (let i = 1; i < groupedRows.length; i++) {
    const previous = groupedRows[i - 1];
    const current = groupedRows[i];
    const previousTime = parseExportDate(previous.date);
    const currentTime = parseExportDate(current.date);

    if (previousTime == null || currentTime == null) continue;

    const dayGap = Math.round((currentTime - previousTime) / (1000 * 60 * 60 * 24));
    if (dayGap < 30) continue;

    const priorClinical = previous.rows.some(isClinicalTouchpoint);
    const currentClinical = current.rows.some(isClinicalTouchpoint);
    if (!priorClinical || !currentClinical) continue;

    const issue = `Treatment gap of about ${dayGap} days between ${formatDisplayDate(previous.date)} and ${formatDisplayDate(current.date)}.`;
    const normalizedIssue = normalizeComparisonText(issue);
    if (seen.has(normalizedIssue)) continue;
    seen.add(normalizedIssue);

    indicators.push({
      issue,
      whyItMayMatter:
        "A clinically meaningful gap can indicate missing interim records, delayed treatment, or care documented in a separate packet.",
      sourceDate: formatDisplayDate(previous.date),
      sourcePage: formatPageReference((previous.rows[0] || {}) as CaseExportRow),
      status: "Needs review",
    });
  }

  const snapshot = normalizeComparisonText(summary?.caseSnapshot || "");
  const summaryMentionsRecords = Boolean(
    snapshot &&
    /\b(records?|record)\b/.test(snapshot) &&
    /\b(missing|outside|prior|unavailable|not available|not found|referenced)\b/.test(snapshot)
  );

  if (summaryMentionsRecords) {
    const issue =
      "Summary text references outside or missing records that are not represented as timeline rows.";
    const normalizedIssue = normalizeComparisonText(issue);
    if (!seen.has(normalizedIssue)) {
      indicators.push({
        issue,
        whyItMayMatter:
          "Referenced documents may exist outside the exported chronology and should be checked against the source packet.",
        sourceDate: "Summary",
        sourcePage: "Not available",
        status: "Needs review",
      });
    }
  }

  return indicators.slice(0, 6);
}

function hasTieredSummaryShape(
  summary: ExportSummary | null
): summary is ExportSummary & {
  caseSnapshot: string;
  keyIssues: string[];
  dateSummaries: { date: string; summary: string }[];
} {
  return Boolean(summary && summary.caseSnapshot && Array.isArray(summary.keyIssues));
}

function renderSummary(summary: ExportSummary | null): string {
  if (!summary) {
    return `
      <div class="summary-card">
        <div class="summary-title">Case Summary</div>
        <p class="summary-paragraph">Case summary unavailable.</p>
      </div>
    `;
  }

  const caseSnapshot = summary.caseSnapshot || summary.caseSummary || "Case summary unavailable.";
  const keyIssues = summary.keyIssues || summary.keyFindings || [];
  const dateSummaries = summary.dateSummaries || [];

  const findings = keyIssues
    .map((finding) => `<li>${escapeHtml(finding)}</li>`)
    .join("");
  const dateSummaryItems = dateSummaries
    .map(
      (item) => `
        <li><strong>${escapeHtml(formatDisplayDate(item.date))}:</strong> ${escapeHtml(item.summary)}</li>
      `
    )
    .join("");

  return `
    <div class="summary-card">
      <div class="summary-title">Case Summary</div>
      <p class="summary-paragraph">${escapeHtml(caseSnapshot)}</p>
      ${
        keyIssues.length
          ? `
            <div class="summary-subtitle">Key Issues</div>
            <ul class="summary-list">
              ${findings}
            </ul>
          `
          : ""
      }
      ${
        dateSummaryItems
          ? `
            <div class="summary-subtitle">Date Summaries</div>
            <ul class="summary-list">
              ${dateSummaryItems}
            </ul>
          `
          : ""
      }
    </div>
  `;
}

function renderMissingRecordsSection(
  chronologyRows: CaseExportRow[],
  summary: ExportSummary | null
): string {
  const missingRecords = buildMissingRecordIndicators(chronologyRows, summary);

  return `
    <section class="section-block gap-block">
      <div class="section-heading">Potential Missing Records / Treatment Gaps</div>
      ${
        missingRecords.length
          ? `
            <table class="gap-table">
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Why it may matter</th>
                  <th>Source date</th>
                  <th>Source page</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${missingRecords
                  .map(
                    (item) => `
                      <tr>
                        <td>${escapeHtml(item.issue)}</td>
                        <td>${escapeHtml(item.whyItMayMatter)}</td>
                        <td>${escapeHtml(item.sourceDate)}</td>
                        <td>${escapeHtml(item.sourcePage)}</td>
                        <td>${escapeHtml(item.status)}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          `
          : `
            <div class="empty-note">
              No obvious missing-record or treatment-gap indicators were detected from the current chronology.
            </div>
          `
      }
    </section>
  `;
}

function renderChronologyTable(
  title: string,
  rows: CaseExportRow[],
  emptyMessage: string
): string {
  const groupedRows = groupChronologyRows(rows);

  return `
    <section class="section-block">
      <div class="section-heading">${escapeHtml(title)}</div>
      ${
        rows.length
          ? `
            <table class="chronology-table">
              <thead>
                <tr>
                  <th class="col-date">Date</th>
                  <th class="col-type">Type</th>
                  <th>Event / Summary</th>
                  <th>Facility</th>
                  <th>Provider</th>
                  <th>Source packet</th>
                  <th class="col-pages">Page / Page range</th>
                  <th class="col-status">Review status</th>
                </tr>
              </thead>
              <tbody>
                ${groupedRows
                  .map(
                    (group) => `
                      ${group.rows
                        .map(
                          (row, rowIndex) => `
                            <tr class="${row.isHidden ? "hidden-row" : ""}">
                              ${
                                rowIndex === 0
                                  ? `<td class="col-date" rowspan="${group.rows.length}">${escapeHtml(
                                      formatDisplayDate(group.date)
                                    )}</td>`
                                  : ""
                              }
                              <td class="col-type">${escapeHtml(row.eventType || "other")}</td>
                              <td>
                                <div class="row-title">${escapeHtml(normalizeRowSummary(row))}</div>
                                ${
                                  row.description &&
                                  normalizeComparisonText(row.description) !== normalizeComparisonText(row.title)
                                    ? `<div class="row-description">${escapeHtml(
                                        normalizeDisplayText(row.description)
                                      )}</div>`
                                    : ""
                                }
                              </td>
                              <td>${escapeHtml(row.medicalFacility || "Not available")}</td>
                              <td>${escapeHtml(row.attribution || "Not available")}</td>
                              <td>
                                <div class="row-source">${escapeHtml(
                                  row.documentName || "Unknown packet"
                                )}</div>
                              </td>
                              <td class="col-pages">${escapeHtml(formatPageReference(row))}</td>
                              <td class="col-status">${escapeHtml(
                                formatReviewStatusLabel(row.reviewStatus)
                              )}</td>
                            </tr>
                          `
                        )
                        .join("")}
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          `
          : `<div class="empty-note">${escapeHtml(emptyMessage)}</div>`
      }
    </section>
  `;
}

export function buildCaseExportHtml({
  caseData,
  chronologyRows,
  hiddenRows = [],
  summary,
}: ExportHtmlArgs): string {
  const tieredSummary = hasTieredSummaryShape(summary) ? summary : null;
  const displayPatientName =
    (!isPlaceholderPatientName(caseData?.patientName)
      ? caseData?.patientName?.trim()
      : null) ||
    (!isPlaceholderPatientName(caseData?.subjectName)
      ? caseData?.subjectName?.trim()
      : null) ||
    "";
  const displayPatientDob =
    caseData?.patientDob?.trim() ||
    caseData?.subjectDob?.trim() ||
    "";
  const displayTitle = isPlaceholderCaseTitle(caseData?.title)
    ? displayPatientName || "Case Chronology"
    : caseData?.title?.trim() || displayPatientName || "Case Chronology";

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(displayTitle)}</title>
        <style>
          @page { margin: 0.7in; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            padding: 24px;
            color: #111827;
            background: #ffffff;
          }
          h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            line-height: 1.15;
          }
          .meta {
            color: #4b5563;
            margin-bottom: 12px;
            font-size: 14px;
            line-height: 1.55;
          }
          .summary-card,
          .section-block {
            border: 1px solid #dbe1ea;
            background: #ffffff;
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 18px;
            break-inside: avoid;
          }
          .summary-card {
            background: #fefaf2;
            border-color: #ead8a4;
          }
          .summary-title,
          .section-heading {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: #7c3c11;
            margin: 0 0 10px 0;
          }
          .summary-paragraph {
            margin: 0;
            font-size: 14px;
            line-height: 1.6;
            color: #1f2937;
          }
          .summary-subtitle {
            margin: 14px 0 8px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .04em;
            color: #9a3412;
          }
          .summary-list {
            margin: 0;
            padding-left: 18px;
            color: #1f2937;
          }
          .summary-list li {
            margin-bottom: 6px;
            line-height: 1.5;
          }
          .chronology-table,
          .gap-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
          }
          .chronology-table {
            table-layout: fixed;
          }
          .chronology-table th,
          .chronology-table td,
          .gap-table th,
          .gap-table td {
            border: 1px solid #cfd8e3;
            padding: 10px 9px;
            vertical-align: top;
            text-align: left;
          }
          .chronology-table th,
          .gap-table th {
            background: #f3f6fa;
            font-size: 11px;
            letter-spacing: .04em;
            text-transform: uppercase;
            color: #334155;
          }
          .col-date { width: 92px; }
          .col-type { width: 92px; }
          .col-pages { width: 118px; }
          .col-status { width: 96px; }
          .row-title {
            font-weight: 700;
            color: #111827;
            margin-bottom: 4px;
          }
          .row-description {
            color: #1f2937;
            line-height: 1.5;
            margin-bottom: 5px;
          }
          .row-source,
          .row-source-detail {
            color: #475569;
            font-size: 11.5px;
            line-height: 1.45;
          }
          .row-source {
            font-weight: 700;
            color: #334155;
          }
          .gap-table th:nth-child(1),
          .gap-table td:nth-child(1) {
            width: 28%;
          }
          .gap-table th:nth-child(2),
          .gap-table td:nth-child(2) {
            width: 36%;
          }
          .gap-table th:nth-child(3),
          .gap-table td:nth-child(3),
          .gap-table th:nth-child(4),
          .gap-table td:nth-child(4),
          .gap-table th:nth-child(5),
          .gap-table td:nth-child(5) {
            white-space: nowrap;
          }
          .hidden-row td {
            background: #f8fafc;
          }
          .hidden-note {
            margin-top: 8px;
            font-size: 12px;
            color: #475569;
          }
          .empty-note {
            color: #475569;
            font-size: 13px;
            line-height: 1.55;
            background: #f8fafc;
            border: 1px dashed #d1d5db;
            border-radius: 12px;
            padding: 12px;
          }
          .gap-block {
            margin-top: 0;
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(displayTitle)}</h1>
        <div class="meta">
          ${escapeHtml(caseData?.caseType || "")}
          ${displayPatientName ? ` | Patient: ${escapeHtml(displayPatientName)}` : ""}
          ${displayPatientDob ? ` | DOB: ${escapeHtml(formatDisplayDate(displayPatientDob))}` : ""}
        </div>
        ${renderSummary(tieredSummary || summary)}
        ${renderMissingRecordsSection(chronologyRows, tieredSummary || summary)}
        ${renderChronologyTable(
          "Every-Visit Chronology",
          chronologyRows,
          "No chronology rows are available for export."
        )}
        ${
          hiddenRows.length
            ? `
              <section class="section-block">
                <div class="section-heading">Appendix: Hidden / Duplicate Rows</div>
                <div class="hidden-note">
                  These rows were excluded from the main chronology because they are hidden in the case timeline.
                </div>
                ${renderChronologyTable(
                  "Hidden duplicate rows",
                  hiddenRows,
                  "No hidden duplicate events are available."
                )}
              </section>
            `
            : ""
        }
      </body>
    </html>
  `;
}
