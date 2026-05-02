import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  applyFinalTimelineInsertGuardrails,
  repairPersistedTimelineEvent,
  repairPersistedTimelineEvents,
} from "../lib/document-processing";

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

const repairedTimelinePageTexts = [
  {
    page: 2,
    text: "DAVID WEIR / BERGERON legal cover sheet. Certificate of service. Printed 12/04/2021.",
  },
  {
    page: 3,
    text: "DATE OF SERVICE: 02/02/2019. In the emergency department, hydromorphone, ondansetron, ketorolac, and tdap were administered.",
  },
];

const repairedGroupedMedications = repairPersistedTimelineEvent(
  {
    date: "2019-02-02",
    title: "Grouped medications",
    description: "Encounter medications documented included hydromorphone, ondansetron, ketorolac, and tdap.",
    eventType: "treatment",
    sourcePage: 2,
    sourceExcerpt: "DAVID WEIR / BERGERON legal cover sheet. Certificate of service.",
  },
  repairedTimelinePageTexts as any
);

assert.equal(repairedGroupedMedications.sourcePage, 3);

const repairedBatch = repairPersistedTimelineEvents(
  [
    {
      date: "2019-02-02",
      title: "Workplace head injury after pipe fell from derrick",
      description: "At work on a drill rig, a pipe fell from the derrick and struck the patient on the head.",
      eventType: "incident",
      sourcePage: 2,
    },
    {
      date: "2021-07-20",
      title: "CT head showed no acute intracranial injury",
      description: "CT head showed no acute intracranial injury with left periorbital soft tissue swelling.",
      eventType: "report",
      sourcePage: 2,
    },
    {
      date: "2022-03-08",
      title: "Neurology follow-up with migraine medication changes",
      description:
        "3/08/2022, at which time he reported that he was experiencing approximately six migraine headaches per week You recommended that Mr. Bergeron see you, (neurologist) twice per year for 10 years at which time his care needs would",
      eventType: "appointment",
      sourcePage: 8,
    },
  ],
  repairedTimelinePageTexts as any
);

const repairedTrauma = repairedBatch.find(
  (event) => event.title === "CT head showed no acute intracranial injury"
);

const repairedNeurology = repairedBatch.find(
  (event) => event.title === "Neurology follow-up with migraine medication changes"
);

assert.equal(repairedTrauma?.date, "2019-02-02");
assert.ok(
  /approximately six migraine headaches per week/i.test(repairedNeurology?.description || "")
);
assert.ok(/ongoing migraine management/i.test(repairedNeurology?.description || ""));

console.log("final-insert-guardrail test passed");
