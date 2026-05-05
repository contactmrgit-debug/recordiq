import assert from "node:assert/strict";
import { buildCaseExportHtml } from "../lib/case-export-html.ts";

type ExportEvent = {
  date?: string | null;
  title?: string | null;
  description?: string | null;
  eventType?: string | null;
  sourcePage?: number | null;
  reviewStatus?: string | null;
  documentId?: string | null;
  medicalFacility?: string | null;
};

function makeEvent(
  title: string,
  description: string,
  overrides: Partial<ExportEvent> = {}
): ExportEvent {
  return {
    date: "2019-02-02",
    title,
    description,
    eventType: "other",
    sourcePage: 1,
    reviewStatus: "PENDING",
    documentId: "doc-1",
    ...overrides,
  };
}

function run() {
  const htmlWithBullets = buildCaseExportHtml({
    caseData: {
      title: "Untitled Case",
      caseType: "MEDICAL",
      patientName: "HussainKhail, Imran Ahmad",
      subjectName: "",
    },
    groupedEvents: [
      {
        date: "2019-02-02",
        groups: [
          {
            category: "incident",
            categoryLabel: "Incident / mechanism",
            items: [
              {
                ...makeEvent("Workplace injury", "Pipe struck the head at work."),
                medicalFacility: "Reagan Memorial Hospital",
              },
            ],
          },
        ],
      },
    ],
    summary: {
      caseSummary: "Workplace injury with head trauma and transfer.",
      keyFindings: [
        "Incident / mechanism: Pipe struck the patient at work.",
        "Transfer / discharge: Accepted to Shannon for higher-level care.",
      ],
      mode: "short",
    },
    getAttributionLine: () => "Dr. Example • ER",
    getDocumentName: () => "Source.pdf",
  });

  const htmlWithoutBullets = buildCaseExportHtml({
    caseData: {
      title: "Untitled Case",
      caseType: "MEDICAL",
      patientName: "HussainKhail, Imran Ahmad",
      subjectName: "",
    },
    groupedEvents: [
      {
        date: "2019-02-02",
        groups: [
          {
            category: "incident",
            categoryLabel: "Incident / mechanism",
            items: [makeEvent("Workplace injury", "Pipe struck the head at work.")],
          },
        ],
      },
    ],
    summary: {
      caseSummary: "Brief case summary only.",
      keyFindings: [],
      mode: "short",
    },
    getAttributionLine: () => "",
    getDocumentName: () => "Source.pdf",
  });

  const summaryIndex = htmlWithBullets.indexOf("Case Summary");
  const keyFindingsIndex = htmlWithBullets.indexOf("Key Findings");
  const timelineIndex = htmlWithBullets.indexOf("Timeline");
  const dateIndex = htmlWithBullets.indexOf("2019-02-02");

  assert.ok(summaryIndex !== -1);
  assert.ok(keyFindingsIndex !== -1);
  assert.ok(timelineIndex !== -1);
  assert.ok(dateIndex !== -1);
  assert.ok(summaryIndex < timelineIndex);
  assert.ok(timelineIndex < dateIndex);
  assert.ok(keyFindingsIndex > summaryIndex);
  assert.ok(!htmlWithBullets.includes("Untitled Case"));
  assert.ok(htmlWithBullets.includes("HussainKhail, Imran Ahmad"));
  assert.ok(!htmlWithBullets.includes("Reagan Memorial Hospital"));

  assert.ok(htmlWithoutBullets.includes("Case Summary"));
  assert.ok(!htmlWithoutBullets.includes("Key Findings"));
  assert.ok(htmlWithoutBullets.includes("Timeline"));

  console.log("case-export-html tests passed");
}

run();
