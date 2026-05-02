import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  applyFinalTimelineInsertGuardrails,
  repairPersistedTimelineEvent,
  repairPersistedTimelineEvents,
} from "../lib/document-processing";
import { cleanTimelineEvents } from "../lib/timeline-cleanup";
import { generateTimelineSummary } from "../lib/timeline-summary";

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

const envisionFileName =
  "Envision Imaging of Acadiana- Medical MR - 210618 Joshua James Bergeron.pdf";
const envisionPageTexts = [
  {
    page: 23,
    text:
      "ENVISION IMAGING OF ACADIANA. MRI Cervical Spine WO. C2 marrow edema corresponding to prior fracture. Central disc protrusion at C3-C4 and C4-C5. Mild central canal stenosis at C5-C6 and C6-C7.",
  },
  {
    page: 24,
    text:
      "ENVISION IMAGING OF ACADIANA. F. Michael Hindelang III, MD electronically signed the cervical spine report. Impression: cervical spine findings above.",
  },
  {
    page: 25,
    text:
      "ENVISION IMAGING OF ACADIANA. CT left shoulder WO contrast. Findings: subacute nondisplaced scapular fracture involving the upper body/spine. Sarah Orrin MD electronically signed the shoulder report.",
  },
];

const envisionInsertRows = applyFinalTimelineInsertGuardrails(
  [
    {
      caseId: "envision-case",
      documentId: "envision-doc",
      eventDate: new Date("2019-02-21T00:00:00.000Z"),
      title: "Workplace head injury after pipe fell from derrick",
      description: "Pipe fell from derrick and struck the patient at work.",
      eventType: "incident",
      sourcePage: 1,
      reviewStatus: "PENDING",
      isHidden: false,
      physicianName: null,
      medicalFacility: "Reagan Memorial Hospital",
    },
    {
      caseId: "envision-case",
      documentId: "envision-doc",
      eventDate: new Date("2019-02-21T00:00:00.000Z"),
      title: "CT head showed no acute intracranial injury",
      description: "CT head showed no acute intracranial injury.",
      eventType: "report",
      sourcePage: 1,
      reviewStatus: "PENDING",
      isHidden: false,
      physicianName: null,
      medicalFacility: "Reagan Memorial Hospital",
    },
    {
      caseId: "envision-case",
      documentId: "envision-doc",
      eventDate: new Date("2019-02-21T00:00:00.000Z"),
      title: "Grouped medications",
      description:
        "Encounter medications documented included hydromorphone, ondansetron, ketorolac, and Tdap.",
      eventType: "treatment",
      sourcePage: 1,
      reviewStatus: "PENDING",
      isHidden: false,
      physicianName: null,
      medicalFacility: "Reagan Memorial Hospital",
    },
    {
      caseId: "envision-case",
      documentId: "envision-doc",
      eventDate: new Date("2019-02-21T00:00:00.000Z"),
      title: "MRI Cervical Spine WO",
      description:
        "C2 marrow edema corresponding to prior fracture. Central disc protrusion at C3-C4 and C4-C5.",
      eventType: "imaging",
      sourcePage: 23,
      reviewStatus: "PENDING",
      isHidden: false,
      physicianName: null,
      medicalFacility: null,
    },
    {
      caseId: "envision-case",
      documentId: "envision-doc",
      eventDate: new Date("2019-02-21T00:00:00.000Z"),
      title: "CT left shoulder WO contrast",
      description:
        "Subacute nondisplaced scapular fracture involving the upper body/spine.",
      eventType: "imaging",
      sourcePage: 25,
      reviewStatus: "PENDING",
      isHidden: false,
      physicianName: null,
      medicalFacility: null,
    },
  ] as any,
  envisionPageTexts as any,
  envisionFileName
);

assert(
  !envisionInsertRows.some((event) =>
    /workplace head injury|ct head showed no acute intracranial injury|grouped medications/i.test(
      event.title
    )
  ),
  "Envision packet should not keep Reagan Memorial trauma rows"
);
assert(
  envisionInsertRows.some((event) => /MRI Cervical Spine WO/i.test(event.title)),
  "Envision packet should retain the cervical MRI"
);
assert(
  envisionInsertRows.some((event) => /CT left shoulder WO contrast/i.test(event.title)),
  "Envision packet should retain the shoulder CT"
);

const repairedEnvisionPersisted = repairPersistedTimelineEvents(
  [
    {
      date: "2019-02-21",
      title: "Workplace head injury after pipe fell from derrick",
      description: "Pipe fell from derrick and struck the patient at work.",
      eventType: "incident",
      sourcePage: 23,
    },
    {
      date: "2019-02-21",
      title: "CT head showed no acute intracranial injury",
      description: "CT head showed no acute intracranial injury.",
      eventType: "report",
      sourcePage: 23,
    },
    {
      date: "2019-02-21",
      title: "MRI Cervical Spine WO",
      description:
        "C2 marrow edema corresponding to prior fracture. Central disc protrusion at C3-C4 and C4-C5.",
      eventType: "imaging",
      sourcePage: 23,
    },
    {
      date: "2019-02-21",
      title: "CT left shoulder WO contrast",
      description:
        "Subacute nondisplaced scapular fracture involving the upper body/spine.",
      eventType: "imaging",
      sourcePage: 25,
    },
  ],
  envisionPageTexts as any,
  {
    fileName: envisionFileName,
    recordType: "IMAGING" as any,
  }
);

const retainedEnvisionPersisted = repairedEnvisionPersisted.filter((event) =>
  Boolean(event.title.trim() || (event.description || "").trim())
);
const envisionSummary = generateTimelineSummary(
  retainedEnvisionPersisted.map((event) => ({
    date: event.date,
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    sourcePage: event.sourcePage,
  }))
);

assert(
  !retainedEnvisionPersisted.some((event) =>
    /workplace head injury|ct head showed no acute intracranial injury/i.test(event.title)
  ),
  "Envision persisted repair should drop Reagan Memorial trauma rows"
);
assert(
  retainedEnvisionPersisted.some((event) => /MRI Cervical Spine WO/i.test(event.title)),
  "Envision persisted repair should retain the cervical MRI"
);
assert(
  retainedEnvisionPersisted.some((event) => /CT left shoulder WO contrast/i.test(event.title)),
  "Envision persisted repair should retain the shoulder CT"
);
assert(
  envisionSummary.keyFindings.length > 0,
  "Envision summary should include at least one imaging-related finding"
);
assert(
  !/reagan memorial hospital|workplace head injury|grouped medications/i.test(
    `${envisionSummary.caseSummary} ${envisionSummary.keyFindings.join(" ")}`
  ),
  "Envision summary should not include Reagan Memorial trauma contamination"
);
assert(
  repairedEnvisionPersisted.some(
    (event) =>
      /mri cervical spine wo/i.test(event.title) &&
      /f\. michael hindelang iii, md/i.test(event.physicianName || "")
  ),
  "Envision MRI event should prefer the cervical report signer"
);
assert(
  repairedEnvisionPersisted.some(
    (event) =>
      /ct left shoulder wo contrast/i.test(event.title) &&
      /sarah orrin md/i.test(event.physicianName || "")
  ),
  "Envision shoulder event should use the shoulder report signer"
);

const reaganCountyEmsEvents = cleanTimelineEvents([
  {
    date: "2022-08-29",
    title: "Reagan County Fire & EMS transport to Reagan Memorial Hospital",
    description:
      "Crew Member: Lou Carson. Primary Patient Caregiver: Lou Carson. Transport destination: Reagan Memorial Hospital.",
    eventType: "treatment",
    sourcePage: 1,
    providerName: "Patient Care Paragraph Text",
    providerRole: "Paragraph Text",
    physicianName: "ZOLL Cloud",
    physicianRole: "Signature Graphic",
    medicalFacility: "Reagan County Fire & EMS",
    sourceExcerpt:
      "Patient Care Paragraph Text. Crew Member: Lou Carson. EMS Primary Care Provider: Lou Carson.",
  } as any,
]);

const reaganCountyEmsEvent = reaganCountyEmsEvents.find((event) =>
  /reagan county fire & ems transport/i.test(event.title)
);

assert.equal(reaganCountyEmsEvent?.providerName, "Lou Carson");
assert.equal(reaganCountyEmsEvent?.medicalFacility, "Reagan County Fire & EMS");
assert.equal(reaganCountyEmsEvent?.physicianName, null);

const reaganCountyEmsSignedRow = repairPersistedTimelineEvent(
  {
    date: "2022-08-29",
    title: "Reagan County Fire & EMS transport to Reagan Memorial Hospital",
    description:
      "Patient transported to Reagan Memorial Hospital after EMS response.",
    eventType: "treatment",
    sourcePage: 23,
    providerName: null,
    providerRole: null,
    physicianName: null,
    physicianRole: null,
    medicalFacility: "Reagan County Fire & EMS",
    sourceExcerpt:
      "Patient transported to Reagan Memorial Hospital after EMS response.",
  } as any,
  [
    {
      page: 23,
      text:
        "Reagan County Fire & EMS transport to Reagan Memorial Hospital. Patient transported after EMS response.",
    },
    {
      page: 24,
      text:
        "Crew Member: Lou Carson. Primary Patient Caregiver: Lou Carson. EMS Primary Care Provider: Lou Carson. Electronically signed by Lou Carson.",
    },
  ] as any,
  null,
  { fileName: "Reagan_County_Fire_and_EMS_220829.pdf" } as any
);

assert.equal(reaganCountyEmsSignedRow.providerName, "Lou Carson");
assert.equal(reaganCountyEmsSignedRow.physicianName, null);
assert.equal(reaganCountyEmsSignedRow.medicalFacility, "Reagan County Fire & EMS");

type EmsAttributionShape = {
  documentName?: string | null;
  title?: string | null;
  description?: string | null;
  providerName?: string | null;
  physicianName?: string | null;
  medicalFacility?: string | null;
};

function normalizePacketLabel(value?: string | null) {
  return (value || "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function formatEmsAttributionLine(event: EmsAttributionShape) {
  const sourcePacket = (event.documentName || "").replace(/\.[a-z0-9]+$/i, "").trim();
  const packet = normalizePacketLabel(event.documentName);
  const text = `${event.title || ""} ${event.description || ""} ${event.providerName || ""} ${event.physicianName || ""}`.toLowerCase();
  const providerName =
    event.providerName?.trim() ||
    event.physicianName?.trim() ||
    null;
  const emsAgency =
    /\breagan county fire(?: and)? ems\b/.test(packet) ||
    /\breagan county fire\b/.test(text)
      ? "Reagan County Fire & EMS"
      : null;
  const transportDestination =
    /\b(?:transport(?:ed)?(?: destination)?|destined for|to)\s+(reagan memorial hospital|shannon er|shannon medical center)\b/.test(
      text
    )
      ? "Reagan Memorial Hospital"
      : event.medicalFacility?.trim() || null;

  return [
    sourcePacket ? `Source packet: ${sourcePacket}` : null,
    emsAgency ? `EMS agency: ${emsAgency}` : null,
    providerName ? `Provider: ${providerName}` : null,
    transportDestination ? `Transport destination: ${transportDestination}` : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

const reaganCountyEmsRouteEvent = {
  documentName: "Reagan_County_Fire_and_EMS_220829.pdf",
  title: "Reagan County Fire & EMS transport to Reagan Memorial Hospital",
  description:
    "Crew Member: Lou Carson. Primary Patient Caregiver: Lou Carson. Transport destination: Reagan Memorial Hospital.",
  providerName: "Lou Carson",
  physicianName: null,
  medicalFacility: "Reagan Memorial Hospital",
} as const;

assert.equal(
  formatEmsAttributionLine(reaganCountyEmsRouteEvent),
  "Source packet: Reagan_County_Fire_and_EMS_220829 • EMS agency: Reagan County Fire & EMS • Provider: Lou Carson • Transport destination: Reagan Memorial Hospital"
);

const ochsnerOcrFixturePath = path.join(
  rootDir,
  "test-regression",
  "fixtures",
  "ochsner-uhc-2023-contamination.raw.json"
);
const ochsnerRawEvents = JSON.parse(
  fs.readFileSync(ochsnerOcrFixturePath, "utf8")
) as Parameters<typeof cleanTimelineEvents>[0];
const ochsnerCleanedEvents = cleanTimelineEvents(ochsnerRawEvents as any);
const ochsnerSummary = generateTimelineSummary(ochsnerCleanedEvents);

assert.equal(ochsnerCleanedEvents.length, 4);
assert.match(
  ochsnerSummary.caseSummary,
  /severe thrombocytopenia with a platelet count of 1/i
);
assert.match(ochsnerSummary.caseSummary, /bleeding from the mouth and nose/i);
assert.match(ochsnerSummary.caseSummary, /dexamethasone and platelet-related treatment/i);
assert.match(ochsnerSummary.caseSummary, /transfer for hematology evaluation/i);
assert.ok(
  !/reagan memorial|workplace head injury|hydromorphone|ondansetron|tdap|shannon/i.test(
    `${ochsnerSummary.caseSummary} ${ochsnerSummary.keyFindings.join(" ")}`
  ),
  "Ochsner summary should not include Reagan trauma contamination"
);

console.log("final-insert-guardrail test passed");
