import assert from "node:assert/strict";
import { buildCaseExportHtml } from "../lib/case-export-html.ts";

type ExportRow = {
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

function makeRow(
  title: string,
  description: string,
  overrides: Partial<ExportRow> = {}
): ExportRow {
  return {
    date: "2019-02-02",
    title,
    description,
    eventType: "other",
    sourcePage: 1,
    reviewStatus: "PENDING",
    documentName: "Source.pdf",
    ...overrides,
  };
}

function run() {
  const html = buildCaseExportHtml({
    caseData: {
      title: "Untitled Case",
      caseType: "MEDICAL",
      patientName: "HussainKhail, Imran Ahmad",
      subjectName: "",
      subjectDob: "1980-01-01",
    },
    chronologyRows: [
      makeRow("Discharge instructions", "Discharge instructions mention follow-up with orthopedics.", {
        eventType: "followup",
        sourcePage: 17,
        reviewStatus: "PENDING",
        documentName: "source-17.pdf",
      }),
      makeRow("Workplace injury", "Pipe struck the head at work.", {
        eventType: "incident",
        sourcePage: 2,
        reviewStatus: "APPROVED",
        attribution: "Dr. Example | ER",
        medicalFacility: "Reagan Memorial Hospital",
      }),
      makeRow("CT head", "CT head showed soft tissue swelling.", {
        eventType: "imaging",
        sourcePageStart: 17,
        sourcePage: 17,
        sourcePageEnd: 19,
        reviewStatus: "PENDING",
        attribution: "Radiology",
        medicalFacility: "Reagan Memorial Hospital",
      }),
    ],
    hiddenRows: [
      makeRow("Duplicate CT head", "Duplicate hidden imaging row.", {
        eventType: "imaging",
        sourcePage: 4,
        sourcePageEnd: 6,
        reviewStatus: "PENDING",
        documentName: "duplicate-source.pdf",
        isHidden: true,
      }),
    ],
    summary: {
      caseSnapshot:
        "Workplace injury with head trauma. Emergency evaluation documented headache, scalp swelling, and bruising.",
      keyIssues: [
        "Workplace injury after a pipe struck the patient at work.",
        "Transfer to Shannon for higher-level care.",
      ],
      dateSummaries: [
        {
          date: "2019-02-02",
          summary: "Workplace injury, emergency evaluation, and transfer were documented.",
        },
      ],
      tieredEvents: {
        critical: [],
        supporting: [],
        context: [],
      },
    },
  });

  assert.ok(html.includes("DOB: 01/01/1980"));
  assert.ok(html.includes("Potential Missing Records / Treatment Gaps"));
  assert.ok(html.includes("Every-Visit Chronology"));
  assert.ok(html.includes("Appendix: Hidden / Duplicate Rows"));
  assert.ok(html.includes("Page 17"));
  assert.ok(html.includes("Pages 17-19"));
  assert.ok(html.includes("Approved"));
  assert.ok(html.includes("Pending"));
  assert.ok(html.includes("Workplace injury"));
  assert.ok(html.includes("CT head"));
  assert.ok(html.includes("Duplicate CT head"));
  assert.ok(html.indexOf("Duplicate CT head") > html.indexOf("Appendix: Hidden / Duplicate Rows"));
  assert.ok(html.includes("No obvious missing-record or treatment-gap indicators were detected") || html.includes("Issue"));
  assert.ok(!html.includes("Untitled Case"));
  assert.ok(html.includes("HussainKhail, Imran Ahmad"));

  const htmlWithoutHidden = buildCaseExportHtml({
    caseData: {
      title: "Untitled Case",
      caseType: "MEDICAL",
      patientName: "HussainKhail, Imran Ahmad",
      subjectName: "",
      subjectDob: "1980-01-01",
    },
    chronologyRows: [
      makeRow("Workplace injury", "Pipe struck the head at work.", {
        eventType: "incident",
        sourcePage: 2,
        reviewStatus: "APPROVED",
      }),
    ],
    summary: {
      caseSnapshot: "Case summary unavailable.",
      keyIssues: [],
      dateSummaries: [],
      tieredEvents: {
        critical: [],
        supporting: [],
        context: [],
      },
    },
  });

  assert.ok(!htmlWithoutHidden.includes("Appendix: Hidden / Duplicate Rows"));

  console.log("case-export-html tests passed");
}

run();
