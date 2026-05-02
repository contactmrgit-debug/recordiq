import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { applyFinalTimelineInsertGuardrails } from "../lib/document-processing";

type PageText = {
  page: number;
  text: string;
};

type InsertRowLike = {
  caseId: string;
  documentId: string;
  eventDate: Date;
  title: string;
  description: string | null;
  eventType: string;
  sourcePage: number | null;
  reviewStatus: "PENDING";
  isHidden: boolean;
  physicianName: string | null;
  medicalFacility: string | null;
};

const rootDir = process.cwd();
const fixturePath = path.join(
  rootDir,
  "test-regression",
  "fixtures",
  "fontana-trauma-no-endo-cross-talk.raw.json"
);

const pageTexts = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as PageText[];

const finalEvents: InsertRowLike[] = [
  {
    caseId: "fontana-case",
    documentId: "fontana-doc",
    eventDate: new Date("2009-08-25T00:00:00.000Z"),
    title: "BMT/ER guidance if symptoms persist",
    description: "Family was advised to contact the BMT team and/or go to the ER if symptoms persisted.",
    eventType: "communication",
    sourcePage: 8,
    reviewStatus: "PENDING",
    isHidden: false,
    physicianName: null,
    medicalFacility: null,
  },
  {
    caseId: "fontana-case",
    documentId: "fontana-doc",
    eventDate: new Date("2009-08-25T00:00:00.000Z"),
    title: "Hydrocortisone and fludrocortisone doses increased",
    description: "Hydrocortisone and fludrocortisone doses were increased after the endocrine follow-up.",
    eventType: "treatment",
    sourcePage: 8,
    reviewStatus: "PENDING",
    isHidden: false,
    physicianName: null,
    medicalFacility: null,
  },
  {
    caseId: "fontana-case",
    documentId: "fontana-doc",
    eventDate: new Date("2009-08-25T00:00:00.000Z"),
    title: "Repeat lytes, ACTH, and renin planned in 4 weeks",
    description: "Repeat lytes, ACTH, and renin were planned in 4 weeks.",
    eventType: "other",
    sourcePage: 8,
    reviewStatus: "PENDING",
    isHidden: false,
    physicianName: null,
    medicalFacility: null,
  },
  {
    caseId: "fontana-case",
    documentId: "fontana-doc",
    eventDate: new Date("2019-07-18T00:00:00.000Z"),
    title: "Workplace head injury after pipe fell from derrick",
    description: "Pipe fell from derrick and struck the patient at work.",
    eventType: "incident",
    sourcePage: 2,
    reviewStatus: "PENDING",
    isHidden: false,
    physicianName: null,
    medicalFacility: null,
  },
];

const filteredEvents = applyFinalTimelineInsertGuardrails(
  finalEvents as any,
  pageTexts as any,
  "The Fontana Center- Medical MR - 210505 Joshua James Bergeron_(1).pdf"
);

assert.equal(filteredEvents.length, 1);
assert.equal(filteredEvents[0]?.title, "Workplace head injury after pipe fell from derrick");

for (const forbiddenTitle of [
  "BMT/ER guidance if symptoms persist",
  "Hydrocortisone and fludrocortisone doses increased",
  "Repeat lytes, ACTH, and renin planned in 4 weeks",
]) {
  assert(
    !filteredEvents.some((event) => event.title === forbiddenTitle),
    `Forbidden endocrine event survived final insert guardrail: ${forbiddenTitle}`
  );
}

console.log("final-insert-guardrail test passed");
