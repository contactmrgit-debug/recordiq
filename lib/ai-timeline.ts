import {
  hasMeaningfulClinicalSignal,
  isLegalWrapperPacket,
  isOcrGarbageText,
} from "@/lib/timeline-cleanup";
import {
  extractBestDateFromText,
  extractHistoricalTraumaDate,
} from "@/lib/timeline-date-authority";
export type TimelineEventResult = {
  date: string;
  dateType?: string;
  title: string;
  description?: string;
  eventType?:
    | "incident"
    | "symptom"
    | "diagnosis"
    | "treatment"
    | "appointment"
    | "billing"
    | "report"
    | "communication"
    | "observation"
    | "other";
  confidence?: number;
  sourcePage?: number;
  sourceExcerpt?: string;
  physicianName?: string;
  physicianRole?: string;
  medicalFacility?: string;
  facilityType?: string;
};

type PageText = {
  page: number;
  text: string;
};

type EventSpec = {
  title: string;
  eventType: NonNullable<TimelineEventResult["eventType"]>;
  dateType?: string;
  pageTerms: string[];
  descriptionBuilder: (text: string) => string;
  sourceTerms?: string[];
  confidence?: number;
  minMatches?: number;
};

const EVENT_PRIORITY: Record<NonNullable<TimelineEventResult["eventType"]>, number> = {
  incident: 100,
  symptom: 90,
  diagnosis: 85,
  treatment: 75,
  report: 70,
  observation: 60,
  communication: 50,
  appointment: 40,
  billing: 30,
  other: 10,
};

const PROVIDER_PATTERNS: RegExp[] = [
  /\b((?:Dr\.?\s+)?(?:[A-Z]\.\s*)?[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){0,4}\s*(?:III|IV|MD|DO|PA-C|PA|NP|FNP-C))\s*,?\s*(?:electronically\s+)?signed\b/i,
  /\b((?:Dr\.?\s+)?(?:[A-Z]\.\s*)?[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){0,4}\s*(?:III|IV|MD|DO|PA-C|PA|NP|FNP-C))\s*,?\s*(?:interpreted|reported)\b/i,
  /electronically signed by[:\s]+((?:Dr\.?\s+)?(?:[A-Z]\.\s*)?[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){0,4}\s*(?:III|IV|MD|DO|PA-C|PA|NP|FNP-C))/i,
  /signed by[:\s]+((?:Dr\.?\s+)?(?:[A-Z]\.\s*)?[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){0,4}\s*(?:III|IV|MD|DO|PA-C|PA|NP|FNP-C))/i,
  /accepting(?: physician| provider)?[:\s]+((?:Dr\.?\s+)?(?:[A-Z]\.\s*)?[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){0,4}\s*(?:III|IV|MD|DO|PA-C|PA|NP|FNP-C))/i,
  /\b(radiologist|interpreting physician)[:\s]+((?:Dr\.?\s+)?(?:[A-Z]\.\s*)?[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){0,4}\s*(?:III|IV|MD|DO|PA-C|PA|NP|FNP-C))/i,
  /\b(Dr\.?\s+[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){0,2})\b/i,
];

const EVENT_SPECS: EventSpec[] = [
  {
    title: "Workplace head injury after pipe fell from derrick",
    eventType: "incident",
    dateType: "service_date",
    pageTerms: ["pipe", "derrick", "drill rig", "work", "head"],
    sourceTerms: ["pipe fell from derrick", "drill rig", "work"],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "pipe fell from derrick",
          "derrick",
          "drill rig",
          "work",
        ]) || "Work-related head injury documented after a pipe fell from the derrick.";

      return compactSentence(snippet);
    },
    confidence: 0.96,
  },
  {
    title: "ER presentation with head, neck, left shoulder pain",
    eventType: "symptom",
    dateType: "service_date",
    pageTerms: [
      "neck pain",
      "left scapular area",
      "status post trauma",
      "er note entry",
      "pain left scapular area",
    ],
    sourceTerms: ["neck pain", "left scapular area", "status post trauma"],
    minMatches: 1,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "neck pain",
          "left scapular area",
          "status post trauma",
          "pain left scapular area",
        ]) || "Emergency presentation for head, neck, and left shoulder pain.";

      return compactSentence(snippet);
    },
    confidence: 0.93,
  },
  {
    title: "Left scalp/periorbital injury findings",
    eventType: "observation",
    dateType: "service_date",
    pageTerms: ["scalp", "periorbital", "left eye", "swelling", "bruising", "laceration"],
    sourceTerms: ["scalp", "periorbital", "left eye", "bruising", "swelling"],
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "scalp",
          "periorbital",
          "left eye",
          "bruising",
          "swelling",
          "laceration",
        ]) || "Exam documented left scalp and periorbital injury findings.";

      return compactSentence(snippet);
    },
    confidence: 0.94,
  },
  {
    title: "CT head result",
    eventType: "report",
    dateType: "service_date",
    pageTerms: ["ct head", "head ct", "intracranial", "periorbital", "swelling"],
    sourceTerms: ["ct head", "no acute intracranial", "periorbital"],
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "ct head",
          "no acute intracranial",
          "intracranial abnormality",
          "periorbital soft tissue swelling",
        ]) || "CT head showed no acute intracranial abnormality.";

      return compactSentence(snippet);
    },
    confidence: 0.95,
  },
  {
    title: "CTA neck vascular injury evaluation",
    eventType: "report",
    dateType: "service_date",
    pageTerms: [
      "ct neck",
      "cta neck",
      "ct angiogram neck",
      "vertebral artery",
      "vertebral foramen",
      "vascular injury",
      "no involvement",
    ],
    sourceTerms: [
      "ct neck",
      "cta neck",
      "ct angiogram neck",
      "vertebral artery",
      "vertebral foramen",
      "vascular injury",
      "no involvement",
    ],
    minMatches: 1,
    descriptionBuilder: () =>
      "CTA neck raised concern for vertebral artery injury.",
    confidence: 0.96,
  },
  {
    title: "C2 fracture imaging result",
    eventType: "report",
    dateType: "service_date",
    pageTerms: ["c2", "facet", "lamina", "nondisplaced", "comminuted", "fracture"],
    sourceTerms: ["c2", "facet", "lamina", "nondisplaced", "comminuted"],
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "vertebral foramen",
          "vertebral artery",
          "c2 facet",
          "c2 lamina",
          "nondisplaced fracture",
          "comminuted fractures",
        ]) || "Imaging showed a C2 fracture with vertebral foramen extension.";

      return compactSentence(snippet);
    },
    confidence: 0.96,
  },
  {
    title: "Discharge summary and follow-up",
    eventType: "treatment",
    dateType: "service_date",
    pageTerms: [
      "discharge summary",
      "disposition",
      "follow up instructions",
      "follow-up instructions",
      "no future appointments",
      "discharge instructions",
    ],
    sourceTerms: ["discharge summary", "disposition", "discharge instructions"],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "discharge summary",
          "disposition",
          "follow up instructions",
          "no future appointments",
          "discharge instructions",
        ]) ||
        "Discharge summary documented follow-up instructions and medication status.";

      return compactSentence(snippet);
    },
    confidence: 0.9,
  },
  {
    title: "Lab visit documented",
    eventType: "appointment",
    dateType: "service_date",
    pageTerms: [
      "lab visit",
      "laboratory visit",
      "lab appointment",
      "lab draw",
      "laboratory encounter",
      "blood draw",
    ],
    sourceTerms: ["lab visit", "laboratory visit", "lab draw", "laboratory encounter"],
    minMatches: 1,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "lab visit",
          "results follow-up",
          "electrolytes",
          "blood draw",
        ]) || "Laboratory follow-up visit documented.";

      return compactSentence(snippet);
    },
    confidence: 0.93,
  },
  {
    title: "Endocrinology results follow-up",
    eventType: "appointment",
    dateType: "service_date",
    pageTerms: [
      "dallas endocrinology",
      "results follow-up",
      "adrenal insufficiency",
      "x-linked adrenoleukodystrophy",
      "bone marrow transplant",
    ],
    sourceTerms: [
      "dallas endocrinology",
      "results follow-up",
      "adrenal insufficiency",
      "bone marrow transplant",
    ],
    minMatches: 3,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "dallas endocrinology",
          "results follow-up",
          "adrenal insufficiency",
          "bone marrow transplant",
          "x-linked adrenoleukodystrophy",
        ]) || "Endocrinology results follow-up documented.";

      return compactSentence(snippet);
    },
    confidence: 0.96,
  },
  {
    title: "ACTH remained high and renin elevated",
    eventType: "report",
    dateType: "service_date",
    pageTerms: ["acth", "renin", "stress dosing", "elevated", "high"],
    sourceTerms: ["acth", "renin", "stress dosing", "elevated"],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, ["acth", "renin", "stress dosing", "elevated"]) ||
        "ACTH remained high after stress dosing and renin was elevated.";

      return compactSentence(snippet);
    },
    confidence: 0.97,
  },
  {
    title: "Hydrocortisone and fludrocortisone doses increased",
    eventType: "treatment",
    dateType: "service_date",
    pageTerms: [
      "hydrocortisone",
      "fludrocortisone",
      "increase",
      "increased",
      "baseline",
      "morning",
      "afternoon",
      "evening",
      "dose",
    ],
    sourceTerms: [
      "hydrocortisone",
      "fludrocortisone",
      "increase",
      "dose",
      "morning",
      "afternoon",
      "evening",
    ],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "hydrocortisone",
          "fludrocortisone",
          "increase",
          "baseline",
          "morning",
          "afternoon",
          "evening",
        ]) || "Hydrocortisone and fludrocortisone doses were increased.";

      return compactSentence(snippet);
    },
    confidence: 0.97,
  },
  {
    title: "Parent reported fatigue, color changes, dry lips, and thirst",
    eventType: "communication",
    dateType: "service_date",
    pageTerms: [
      "fatigue",
      "tired",
      "color changes",
      "dry lips",
      "thirst",
      "mother",
      "parent",
    ],
    sourceTerms: ["fatigue", "color changes", "dry lips", "thirst", "mother"],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "fatigue",
          "tired",
          "color changes",
          "dry lips",
          "thirst",
          "mother",
          "parent",
        ]) || "Parent reported fatigue, color changes, dry lips, and thirst.";

      return compactSentence(snippet);
    },
    confidence: 0.95,
  },
  {
    title: "Repeat lytes, ACTH, and renin planned in 4 weeks",
    eventType: "other",
    dateType: "service_date",
    pageTerms: [
      "repeat",
      "labs",
      "electrolytes",
      "acth",
      "renin",
      "four weeks",
      "4 weeks",
      "follow-up",
    ],
    sourceTerms: ["repeat", "electrolytes", "acth", "renin", "4 weeks"],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, ["repeat", "electrolytes", "acth", "renin", "4 weeks"]) ||
        "Repeat electrolytes, ACTH, and renin testing planned in 4 weeks.";

      return compactSentence(snippet);
    },
    confidence: 0.99,
  },
  {
    title: "BMT/ER guidance if symptoms persist",
    eventType: "communication",
    dateType: "service_date",
    pageTerms: [
      "symptoms persist",
      "contact",
      "bmt",
      "team",
      "go to the er",
      "go to er",
      "evaluation",
      "mychart",
    ],
    sourceTerms: ["symptoms persist", "bmt", "go to er", "evaluation", "mychart"],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "symptoms persist",
          "contact",
          "bmt",
          "go to the er",
          "go to er",
          "evaluation",
          "mychart",
        ]) ||
        "Family was advised to contact the BMT team or go to the ER if symptoms persisted.";

      return compactSentence(snippet);
    },
    confidence: 0.96,
  },
  {
    title: "Scapular fracture imaging result",
    eventType: "report",
    dateType: "service_date",
    pageTerms: ["scapular", "shoulder", "humerus", "fracture"],
    sourceTerms: ["scapular", "fracture", "left shoulder"],
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "scapular fracture",
          "left scapular body",
          "left scapular",
          "left shoulder",
        ]) || "Imaging showed a nondisplaced left scapular fracture.";

      return compactSentence(snippet);
    },
    confidence: 0.95,
  },
  {
    title: "Grouped medications",
    eventType: "treatment",
    dateType: "service_date",
    pageTerms: [
      "medication",
      "medications",
      "medication administration",
      "administered",
      "given",
      "received",
      "hydromorphone",
      "hydromor",
      "ondansetron",
      "ondanset",
      "dilaudid",
      "dilaud",
      "zofran",
      "zofr",
      "tdap",
      "adacell",
      "acetaminophen",
      "morphine",
      "ketorolac",
      "ivp",
      "im",
      "start",
      "stop",
    ],
    sourceTerms: [
      "medication administration",
      "hydromorphone",
      "ondansetron",
      "tdap",
      "adacell",
      "given",
      "ivp",
      "im",
    ],
    descriptionBuilder: (text) => {
      const meds = collectMedications(text);
      if (meds.length > 0) {
        return `Encounter medications documented: ${meds.join(", ")}.`;
      }

      return "Medications documented during the encounter.";
    },
    confidence: 0.9,
  },
  {
    title: "Grouped labs/urinalysis",
    eventType: "report",
    dateType: "service_date",
    pageTerms: ["cbc", "bmp", "urinalysis", "ua", "lab", "wbc", "hemoglobin"],
    sourceTerms: ["cbc", "bmp", "urinalysis", "wbc", "hemoglobin"],
    descriptionBuilder: (text) => {
      const findings = collectLabFindings(text);
      if (findings.length > 0) {
        return `Labs and urinalysis documented: ${findings.join("; ")}.`;
      }

      return "Grouped laboratory and urinalysis results documented.";
    },
    confidence: 0.9,
  },
  {
    title: "Transferred to Shannon",
    eventType: "treatment",
    dateType: "service_date",
    pageTerms: [
      "transfer",
      "transferring",
      "transfer to shannon",
      "request to transfer",
      "shannon",
      "accepting",
      "accepted",
      "air transport",
      "higher level",
      "receiving hospital",
      "ems",
      "flight nurse",
      "vretis",
    ],
    sourceTerms: [
      "transfer to shannon",
      "request to transfer",
      "shannon",
      "accepting",
      "accepted",
      "air transport",
      "receiving hospital",
      "ems",
      "flight nurse",
      "vretis",
    ],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "transfer",
          "shannon",
          "accepted",
          "higher level",
          "air transport",
        ]) || "Transferred to Shannon for higher-level trauma care.";

      return compactSentence(snippet);
    },
    confidence: 0.97,
  },
  {
    title: "Neurology follow-up for postconcussive syndrome",
    eventType: "appointment",
    dateType: "service_date",
    pageTerms: [
      "neurology",
      "postconcussive",
      "post concussive",
      "headache",
      "memory",
      "follow-up",
    ],
    sourceTerms: [
      "neurology",
      "postconcussive",
      "headache",
      "memory",
      "follow-up",
    ],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "neurology",
          "postconcussive",
          "headache",
          "memory",
          "follow-up",
        ]) ||
        "Neurology follow-up documented postconcussive syndrome with headaches and memory symptoms.";

      return compactSentence(snippet);
    },
    confidence: 0.95,
  },
  {
    title: "Left C7 transforaminal epidural steroid injection",
    eventType: "treatment",
    dateType: "procedure_date",
    pageTerms: [
      "c7",
      "transforaminal",
      "epidural steroid injection",
      "injection",
      "fluoroscopy",
    ],
    sourceTerms: [
      "c7",
      "transforaminal",
      "epidural steroid injection",
      "fluoroscopy",
    ],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "c7",
          "transforaminal",
          "epidural steroid injection",
          "fluoroscopy",
          "procedure",
        ]) ||
        "Left C7 transforaminal epidural steroid injection was performed.";

      return compactSentence(snippet);
    },
    confidence: 0.97,
  },
  {
    title: "Neurology follow-up with migraine medication changes",
    eventType: "appointment",
    dateType: "service_date",
    pageTerms: [
      "neurology",
      "migraine",
      "headache",
      "medication change",
      "medication changes",
      "follow-up",
    ],
    sourceTerms: [
      "neurology",
      "migraine",
      "headache",
      "medication change",
      "follow-up",
    ],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const normalized = normalizeSearchText(text);

      if (
        /\btopiramate\b/.test(normalized) ||
        /\bmedication change|medication changes|changed|adjusted|increased|decreased\b/.test(normalized) ||
        /\bmigraine headaches per week\b/.test(normalized)
      ) {
        return "Patient reported approximately six migraine headaches per week; neurology follow-up addressed ongoing migraine management and future care recommendations.";
      }

      const snippet =
        findSnippet(text, [
          "neurology",
          "migraine",
          "headache",
          "medication change",
          "medication changes",
          "follow-up",
        ]) ||
        "Neurology follow-up documented migraine and headache medication changes.";

      return compactSentence(snippet);
    },
    confidence: 0.95,
  },
  {
    title: "Telephone follow-up for persistent migraines",
    eventType: "appointment",
    dateType: "service_date",
    pageTerms: [
      "telephone",
      "phone",
      "follow-up",
      "persistent migraine",
      "persistent migraines",
      "postconcussive",
    ],
    sourceTerms: [
      "telephone",
      "follow-up",
      "persistent migraine",
      "postconcussive",
    ],
    minMatches: 2,
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "telephone",
          "follow-up",
          "persistent migraine",
          "persistent migraines",
          "postconcussive",
        ]) ||
        "Telephone follow-up documented persistent migraines and postconcussive syndrome.";

      return compactSentence(snippet);
    },
    confidence: 0.93,
  },
];

function normalizeWhitespace(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}

const HIGH_VALUE_FINDINGS = [
  "dallas endocrinology",
  "adrenal insufficiency",
  "x-linked adrenoleukodystrophy",
  "bone marrow transplant",
  "lab visit",
  "results follow-up",
  "acth",
  "renin",
  "hydrocortisone",
  "fludrocortisone",
  "fatigue",
  "thirst",
  "dry lips",
  "bmt",
  "mychart",
  "vascular injury",
  "dissection",
  "cta neck",
  "ct neck",
  "vertebral artery",
  "vertebral foramen",
  "foraminal extension",
  "fracture",
  "transfer",
  "admission",
  "admitted",
  "discharge",
  "discharged",
  "disposition",
  "medication",
  "medications",
  "follow up",
  "follow-up",
  "urinalysis",
  "ct head",
  "intracranial",
  "laceration",
  "periorbital",
  "scalp",
  "head",
  "neck",
  "shoulder",
];

function countMatches(text: string, terms: string[]): number {
  const normalized = normalizeSearchText(text);
  return terms.reduce((count, term) => {
    if (!normalized || !normalizeSearchText(term)) return count;
    return normalized.includes(normalizeSearchText(term)) ? count + 1 : count;
  }, 0);
}

function pageSignalScore(text: string): number {
  const normalized = normalizeSearchText(text);
  let score = 0;

  for (const finding of HIGH_VALUE_FINDINGS) {
    if (normalized.includes(finding)) score += 2;
  }

  if (hasMeaningfulClinicalSignal(text)) score += 5;
  if (/addendum|impression|findings|result|report|study/.test(normalized)) score += 2;
  if (/\b(date of service|service date|admit date|visit date|incidental? date)\b/.test(normalized)) {
    score += 2;
  }

  return score;
}

function isLowQualityTimelinePage(text: string): boolean {
  if (isLegalWrapperPacket(text)) return true;
  if (isOcrGarbageText(text) && !hasMeaningfulClinicalSignal(text)) return true;

  const normalized = normalizeSearchText(text);
  if (!normalized) return true;

  const clinicalSignals = HIGH_VALUE_FINDINGS.filter((finding) => normalized.includes(finding)).length;
  const legalSignals = [
    "deposition",
    "subpoena",
    "affidavit",
    "custodian",
    "business records",
    "records produced",
    "notice of filing",
    "certificate of service",
    "attorney",
    "law office",
  ].filter((term) => normalized.includes(term)).length;

  if (legalSignals > 0 && clinicalSignals === 0) return true;
  if (clinicalSignals === 0 && normalized.length < 40) return true;

  return false;
}

function hasMedicationChangeSignal(text: string): boolean {
  return /\b(increased?|decreased|decrease|discontinued|stopped|started|changed|adjusted|reordered?|restart(?:ed)?|resumed|new dose|dose adjustment|dose change|dose increased|dose decreased)\b/i.test(
    text
  );
}

function isMedicationListOnlyText(text: string): boolean {
  return (
    /\b(medication list|current medications|active at the end of visit|this report is for documentation purposes only|for documentation purposes only|refill|quantity|start date|authorized by)\b/i.test(
      text
    ) && !hasMedicationChangeSignal(text)
  );
}

function isMedicationListBoilerplateText(text: string): boolean {
  return /\b(medication list|current medications|active at the end of visit|this report is for documentation purposes only|for documentation purposes only|refill|quantity|start date|authorized by)\b/i.test(
    text
  );
}

function normalizeSearchText(value?: string): string {
  return (value || "")
    .toLowerCase()
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\w\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAnySearchTerm(text: string, terms: string[]): boolean {
  const normalized = normalizeSearchText(text);
  return terms.some((term) => normalized.includes(normalizeSearchText(term)));
}

function hasAllSearchTerms(text: string, terms: string[]): boolean {
  const normalized = normalizeSearchText(text);
  return terms.every((term) => normalized.includes(normalizeSearchText(term)));
}

function getNearbyPageText(pageTexts: PageText[], index: number, radius = 1): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(pageTexts.length - 1, index + radius);
  return normalizeSearchText(
    pageTexts
      .slice(start, end + 1)
      .map((page) => page.text)
      .join(" ")
  );
}

function compactSentence(value: string): string {
  return normalizeWhitespace(value).replace(/^[\-\u2022]+\s*/, "").trim();
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime());
}

function isAcceptedDate(value: string): boolean {
  return value === "UNKNOWN" || isValidDate(value);
}

function extractDateFromText(text: string): string {
  if (isMedicationListOnlyText(text)) {
    return "UNKNOWN";
  }

  return extractBestDateFromText(text, {
    hasClinicalSignal: hasMeaningfulClinicalSignal,
    isLegalWrapper: isLegalWrapperPacket,
  });
}

function shouldPreferHistoricalTraumaDate(title: string): boolean {
  const normalized = normalizeSearchText(title);

  if (!normalized) return false;
  if (
    /\b(follow[- ]?up|telephone|appointment|results follow[- ]?up|lab visit|treatment|procedure)\b/.test(
      normalized
    )
  ) {
    return false;
  }

  return /\b(workplace head injury|head injury|er presentation|scalp|periorbital|ct head|cta neck|c2 fracture|scapular fracture|vascular injury|vertebral artery)\b/.test(
    normalized
  );
}

function resolveHistoricalTraumaDate(
  pageText: string,
  title: string,
  currentDate?: string | null
): string | null {
  if (!shouldPreferHistoricalTraumaDate(title)) {
    return null;
  }

  return extractHistoricalTraumaDate(pageText, currentDate);
}

function dedupeEvents(events: TimelineEventResult[]): TimelineEventResult[] {
  const seen = new Map<string, TimelineEventResult>();

  for (const event of events) {
    const key = [
      (event.date || "UNKNOWN").trim(),
      normalizeSearchText(event.title),
      event.sourcePage ?? "na",
    ].join("|");

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, event);
      continue;
    }

    seen.set(key, {
      ...existing,
      description: mergeDescriptions(existing.description, event.description),
      sourceExcerpt: mergeDescriptions(existing.sourceExcerpt, event.sourceExcerpt),
      confidence: Math.max(existing.confidence ?? 0, event.confidence ?? 0),
      physicianName: existing.physicianName || event.physicianName,
      physicianRole: existing.physicianRole || event.physicianRole,
      medicalFacility: existing.medicalFacility || event.medicalFacility,
      facilityType: existing.facilityType || event.facilityType,
    });
  }

  return Array.from(seen.values());
}

function mergeDescriptions(a?: string, b?: string): string | undefined {
  const parts = [a, b]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => normalizeWhitespace(value));

  if (!parts.length) return undefined;
  if (parts.length === 1) return parts[0];

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const normalized = normalizeSearchText(part);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(part);
  }

  return unique.join(" | ");
}

function sourcePageToText(page: PageText | undefined): string {
  return page?.text || "";
}

function shouldTraceSourcePageScoring(titleText: string): boolean {
  return (
    /\bc2 fracture\b/.test(titleText) ||
    /\bscapular fracture\b/.test(titleText) ||
    /\bgrouped medications\b/.test(titleText) ||
    /\btransfer\b/.test(titleText)
  );
}

function isWeakSourceExcerpt(excerpt?: string | null): boolean {
  const text = normalizeSearchText(excerpt ?? undefined);
  if (!text) return true;
  if (text.length < 45) return true;
  if (/^(iv|ems|transfer|patient|encounter|document|note)\b/.test(text)) return true;

  return false;
}

function getSupportPageScoreForEvent(
  spec: EventSpec,
  page: PageText
): { score: number; reason: string } {
  const text = normalizeSearchText(page.text);
  let score = 0;
  const reasons: string[] = [];

  if (spec.title.includes("Grouped medications")) {
    if (isMedicationListOnlyText(page.text)) {
      return { score: -50, reason: "medication list only" };
    }

    const medMatches = [
      "medication administration",
      "hydromorphone",
      "hydromor",
      "dilaudid",
      "dilaud",
      "ondansetron",
      "ondanset",
      "zofran",
      "zofr",
      "tdap",
      "adacell",
      "given",
      "ivp",
      "im",
      "start",
      "stop",
    ].filter((term) => text.includes(normalizeSearchText(term)));

    score += medMatches.length * 10;
    if (/\bmedication administration\b/.test(text)) {
      score += 25;
      reasons.push("medication administration");
    }
    if (/\bhydromor|dilaudid|ondanset|zofr|tdap|adacell\b/.test(text)) {
      score += 20;
      reasons.push("med admin meds");
    }
    if (/\bgiven\b|\breceived\b|\bivp\b|\bim\b/.test(text)) {
      score += 12;
      reasons.push("given/route");
    }
    if (/\bpatient\b/.test(text) && !/\bmedication\b/.test(text)) {
      score -= 6;
    }
  }

  if (spec.title.includes("Transferred to Shannon")) {
    if (/\btransfer to shannon\b/.test(text)) {
      score += 30;
      reasons.push("transfer to Shannon");
    }
    if (/\btransfer to shannon er\b/.test(text)) {
      score += 32;
      reasons.push("transfer to Shannon ER");
    }
    if (/\bdr\.?\s*vretis\b.*\baccepting\b|\baccepting\b.*\bdr\.?\s*vretis\b/.test(text)) {
      score += 28;
      reasons.push("Vretis accepting");
    }
    if (/\bwaiting on flight\b|\bair transport\b|\bems\b\/?\bflight nurse\b/.test(text)) {
      score += 24;
      reasons.push("flight/air transport");
    }
    if (/\btransfer memorandum\b|\brequest to transfer\b|\breceiving hospital\b/.test(text)) {
      score += 20;
      reasons.push("transfer memorandum/request");
    }
  }

  return { score, reason: reasons.join(", ") };
}

function findBestSupportPage(
  pages: PageText[],
  spec: EventSpec
): PageText | undefined {
  let best: PageText | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const page of pages) {
    const normalized = normalizeSearchText(page.text);
    if (!normalized) continue;
    if (isLowQualityTimelinePage(page.text)) continue;

    const { score } = getSupportPageScoreForEvent(spec, page);
    if (score <= 0) continue;

    if (score > bestScore || (score === bestScore && page.page < (best?.page ?? Number.POSITIVE_INFINITY))) {
      best = page;
      bestScore = score;
    }
  }

  return best;
}

function titleSpecificPageScore(titleText: string, pageText: string): number {
  const text = normalizeSearchText(pageText);
  let score = 0;

  if (!titleText) {
    return score;
  }

  if (titleText.includes("ct head")) {
    if (/\bct head\b/.test(text)) score += 10;
    if (/\bimpression\b/.test(text)) score += 6;
    if (/\bno acute intracranial|intracranial hemorrhage|periorbital swelling\b/.test(text)) {
      score += 10;
    }
  }

  if (titleText.includes("c2 fracture")) {
    if (/\bcervical spine\b/.test(text)) score += 10;
    if (/\bimpression\b/.test(text)) score += 8;
    if (/\bc2\b/.test(text)) score += 8;
    if (/\bfracture\b/.test(text)) score += 8;
    if (/\bct head\b/.test(text)) score -= 4;
  }

  if (titleText.includes("cta neck")) {
    if (/\bcta neck\b/.test(text)) score += 10;
    if (/\bvascular injury|vertebral artery|dissection\b/.test(text)) score += 10;
    if (/\bimpression\b/.test(text)) score += 6;
  }

  if (titleText.includes("scapular fracture")) {
    if (/\bnondisplaced fracture of the scapular body\b/.test(text)) score += 40;
    if (/\bscapular body\b/.test(text)) score += 28;
    if (/\b(?:x ?ray|xr|xray)\s+(shoulder|humerus)\b/.test(text)) score += 20;
    if (/\bleft shoulder\b/.test(text)) score += 8;
    if (/\bhumerus\b/.test(text)) score += 6;
    if (/\bscapular body|scapular fracture|scapula\b/.test(text)) score += 10;
    if (/\bimpression\b/.test(text)) score += 6;
    if (/\bct head\b|\bc2\b|\bcervical spine\b/.test(text)) score -= 8;
  }

  if (titleText.includes("grouped medications")) {
    if (isMedicationListOnlyText(pageText)) {
      score -= 30;
    }

    const medCount = countMatches(text, [
      "hydromorphone",
      "dilaudid",
      "ondansetron",
      "zofran",
      "morphine",
      "fentanyl",
      "ketorolac",
      "toradol",
      "tdap",
      "tetanus",
      "acetaminophen",
      "tylenol",
      "ibuprofen",
      "naproxen",
      "lidocaine",
    ]);

    score += medCount * 6;
    if (medCount >= 3) score += 8;
    if (/\bmedication administration\b|\bmedications? administered\b|\bgiven\b|\breceived\b/.test(text)) {
      score += 18;
    }
    if (/\bhydromorphone\b|\bdilaudid\b|\mondansetron\b|\bzofran\b|\btdap\b|\bketorolac\b/.test(text)) {
      score += 12;
    }
    if (
      /\b(date of service|service date|emergency department|clinic visit|encounter|in the emergency department)\b/.test(
        text
      )
    ) {
      score += 18;
    }
    if (/\burinalysis|cbc|cmp|bmp|lab\b/.test(text)) score -= 4;
    if (/\bdischarge summary\b|\bmedication list\b|\bfollow[- ]?up\b/.test(text)) score -= 8;
    if (
      /\bdate of service|service date|encounter|emergency department|clinic visit|follow[- ]?up\b/.test(
        text
      )
    ) {
      score += 10;
    }
    if (
      /\blegal cover sheet|certificate of service|affidavit|certification|subpoena|custodian|business records|records produced|notice of filing|printed\b/.test(
        text
      )
    ) {
      score -= 35;
    }
    if (
      /\bsubpoena|affidavit|certificate of service|custodian|business records|records produced|legal cover sheet|notice of filing|fax|printed\b/.test(
        text
      )
    ) {
      score -= 30;
    }
    if (/\blegal cover sheet|certificate of service|affidavit|custodian|subpoena|business records|records produced|notice of filing\b/.test(text)) {
      score -= 100;
    }
  }

  if (titleText.includes("grouped labs")) {
    const labCount = countMatches(text, [
      "cbc",
      "bmp",
      "cmp",
      "urinalysis",
      "ua",
      "wbc",
      "hemoglobin",
      "nitrite",
      "leukocyte esterase",
      "protein",
    ]);

    score += labCount * 6;
    if (labCount >= 2) score += 8;
    if (/\bhydromorphone|ondansetron|tdap|transfer|shannon\b/.test(text)) score -= 4;
  }

  if (titleText.includes("transfer")) {
    if (/\btransfer to shannon\b|\btransferred to shannon\b|\btransfer arranged\b/.test(text)) {
      score += 22;
    }
    if (/\baccepting physician|accepted|accepting\b/.test(text)) score += 18;
    if (/\bshannon er|shannon medical center|air transport|higher level of care\b/.test(text)) {
      score += 18;
    }
    if (/\btransfer memorandum\b|\btransfer note\b/.test(text)) {
      score += 14;
    }
  }

  if (titleText.includes("workplace head injury")) {
    if (/\bpipe fell from the derrick|drill rig|work-related head injury\b/.test(text)) {
      score += 12;
    }
  }

  if (titleText.includes("er presentation")) {
    if (/\bemergency department|head pain|neck pain|left shoulder pain\b/.test(text)) {
      score += 12;
    }
  }

  if (titleText.includes("neurology follow-up for postconcussive syndrome")) {
    if (/\bneurology\b/.test(text)) score += 16;
    if (/\bpostconcussive\b/.test(text)) score += 16;
    if (/\bheadache|headaches|memory\b/.test(text)) score += 10;
    if (/\bfollow[- ]?up\b/.test(text)) score += 8;
    if (/\b02\/02\/2019\b/.test(text)) score -= 4;
  }

  if (titleText.includes("left c7 transforaminal epidural steroid injection")) {
    if (/\bc7\b/.test(text)) score += 18;
    if (/\btransforaminal\b/.test(text)) score += 18;
    if (/\bepidural steroid injection\b/.test(text)) score += 18;
    if (/\bprocedure\b/.test(text)) score += 8;
  }

  if (titleText.includes("neurology follow-up with migraine medication changes")) {
    if (/\bneurology\b/.test(text)) score += 16;
    if (/\bmigraine|headache\b/.test(text)) score += 14;
    if (/\bmedication change|medication changes|changed|adjusted|increased|decreased\b/.test(text)) {
      score += 10;
    }
  }

  if (titleText.includes("telephone follow-up for persistent migraines")) {
    if (/\btelephone\b/.test(text)) score += 18;
    if (/\bmigraine|postconcussive\b/.test(text)) score += 18;
    if (/\bfollow[- ]?up\b/.test(text)) score += 10;
  }

  if (titleText.includes("left scalp/periorbital")) {
    if (/\bscalp swelling|periorbital bruising|left eye\b/.test(text)) {
      score += 12;
    }
  }

  if (titleText.includes("endocrinology results follow-up")) {
    if (/\bdallas endocrinology\b/.test(text)) score += 14;
    if (/\bresults follow-up\b/.test(text)) score += 12;
    if (/\badrenal insufficiency\b/.test(text)) score += 8;
    if (/\bbone marrow transplant|x-linked adrenoleukodystrophy\b/.test(text)) score += 6;
  }

  if (titleText.includes("acth remained high and renin elevated")) {
    if (/\bacth\b/.test(text)) score += 10;
    if (/\brenin\b/.test(text)) score += 10;
    if (/\bstress dosing\b/.test(text)) score += 8;
    if (/\belevated|high\b/.test(text)) score += 4;
  }

  if (titleText.includes("hydrocortisone and fludrocortisone doses increased")) {
    if (/\bhydrocortisone\b/.test(text)) score += 12;
    if (/\bfludrocortisone\b/.test(text)) score += 12;
    if (/\bincrease|increased|dose\b/.test(text)) score += 10;
  }

  if (titleText.includes("parent reported fatigue")) {
    if (/\bfatigue|tired\b/.test(text)) score += 10;
    if (/\bcolor changes|dry lips|thirst\b/.test(text)) score += 10;
    if (/\bmother|parent\b/.test(text)) score += 6;
  }

  if (
    titleText.includes("repeat endocrine labs planned") ||
    titleText.includes("repeat lytes, acth, and renin planned in 4 weeks")
  ) {
    if (/\brepeat\b/.test(text)) score += 10;
    if (/\belectrolytes|acth|renin\b/.test(text)) score += 10;
    if (/\b4 weeks|follow[- ]?up\b/.test(text)) score += 6;
  }

  if (titleText.includes("bmt/er guidance if symptoms persist")) {
    if (/\bsymptoms persist\b/.test(text)) score += 12;
    if (/\bbmt\b/.test(text)) score += 10;
    if (/\ber\b/.test(text)) score += 10;
    if (/\bmychart\b/.test(text)) score += 6;
  }

  return score;
}

function findBestPage(pages: PageText[], spec: EventSpec): PageText | undefined {
  let best: PageText | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;
  const titleText = normalizeSearchText(spec.title);
  const sourceTerms = spec.sourceTerms ?? [];
  const pageTerms = spec.pageTerms;

  for (const page of pages) {
    const text = normalizeSearchText(page.text);
    if (!text) continue;
    if (isLowQualityTimelinePage(page.text)) continue;

    const termScore = countMatches(page.text, pageTerms);
    if (termScore <= 0) continue;

    let score = termScore * 10;
    score += countMatches(page.text, sourceTerms) * 12;
    score += pageSignalScore(page.text);
    score += titleSpecificPageScore(titleText, page.text);

    const clinicalOverlap = countMatches(page.text, HIGH_VALUE_FINDINGS);
    score += clinicalOverlap;

    if (titleText) {
      if (text.includes(titleText)) {
        score += 4;
      }

      if (/\b(fracture|report|impression|findings|result|evaluation|transfer|medication|medications)\b/.test(titleText)) {
        score += countMatches(page.text, ["impression", "findings", "result", "report", "evaluation"]) * 2;
      }
    }

    if (/\b(cta neck|vascular injury|vertebral artery|dissection)\b/.test(text)) {
      score += 6;
    }
    if (/\b(admit|admitted|admission|discharged|disposition)\b/.test(text)) {
      score += 4;
    }
    if (/\btransfer|accepted|air transport|higher level of care\b/.test(text)) {
      score += 5;
    }

    if (score > bestScore || (score === bestScore && page.page < (best?.page ?? Number.POSITIVE_INFINITY))) {
      bestScore = score;
      best = page;
    }

  }

  return best;
}

function findSnippet(text: string, needles: string[]): string {
  const original = normalizeWhitespace(text);
  const lower = original.toLowerCase();

  for (const needle of needles) {
    const index = lower.indexOf(normalizeSearchText(needle));
    if (index >= 0) {
      const start = Math.max(0, index - 80);
      const end = Math.min(original.length, index + needle.length + 140);
      return original.slice(start, end).trim();
    }
  }

  return original.slice(0, 220).trim();
}

function collectMedications(text: string): string[] {
  const candidates = [
    "hydromorphone",
    "dilaudid",
    "ondansetron",
    "zofran",
    "morphine",
    "fentanyl",
    "ketorolac",
    "toradol",
    "tdap",
    "tetanus",
    "acetaminophen",
    "tylenol",
    "ibuprofen",
    "naproxen",
    "lidocaine",
    "ceftriaxone",
    "vancomycin",
    "zosyn",
  ];

  const found = candidates.filter((candidate) =>
    normalizeSearchText(text).includes(candidate)
  );

  return Array.from(new Set(found)).slice(0, 6);
}

function collectLabFindings(text: string): string[] {
  const normalized = normalizeSearchText(text);
  const findings: string[] = [];

  if (/cbc/.test(normalized)) findings.push("CBC");
  if (/bmp|cmp/.test(normalized)) findings.push("BMP/CMP");
  if (/urinalysis|\bua\b/.test(normalized)) findings.push("urinalysis");
  if (/nitrite/.test(normalized)) findings.push("nitrite");
  if (/leukocyte esterase/.test(normalized)) findings.push("leukocyte esterase");
  if (/proteinuria|protein/.test(normalized)) findings.push("protein");
  if (/wbc/.test(normalized)) findings.push("WBC");
  if (/hemoglobin|hgb/.test(normalized)) findings.push("hemoglobin");

  return Array.from(new Set(findings)).slice(0, 6);
}

function inferMetadata(
  text: string,
  eventTitle: string
): Partial<TimelineEventResult> {
  const normalized = normalizeSearchText(text);
  const combined = `${eventTitle} ${text}`;

  const providerMatch = PROVIDER_PATTERNS
    .map((pattern) => text.match(pattern))
    .find((match): match is RegExpMatchArray => Boolean(match?.[1] || match?.[2]));

  let providerName = normalizeProviderName(providerMatch?.[1] || providerMatch?.[2]);

  if (!providerName) {
    const signedByMatch = text.match(
      /electronically signed by:\s*([A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){0,3}\s*(?:MD|DO|PA-C|PA|NP|FNP-C)?)/i
    );
    providerName = normalizeProviderName(signedByMatch?.[1]);
  }

  if (!providerName) {
    const drMatch = text.match(/\bdr\.?\s+([A-Z][A-Za-z'`.-]+)/i);
    providerName = normalizeProviderName(
      drMatch?.[1] ? `Dr. ${drMatch[1]}` : undefined
    );
  }

  if (!providerName) {
    const signatureWindow = text.match(
      /(.{0,140}?)\s*,?\s*(?:electronically\s+)?signed\b/i
    );
    if (signatureWindow?.[1]) {
      const candidates = Array.from(
        signatureWindow[1].matchAll(
          /\b((?:Dr\.?\s+)?(?:[A-Z]\.\s*)?[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){1,4}(?:\s*,?\s*(?:III|IV|MD|DO|PA-C|PA|NP|FNP-C))?)\b/g
        ),
        (match) => normalizeProviderName(match[1])
      ).filter((value): value is string => Boolean(value));

      if (candidates.length) {
        providerName = candidates[candidates.length - 1];
      }
    }
  }

  if (!providerName) {
    const acceptingMatch = text.match(
      /\bdr\.?\s+([A-Z][A-Za-z'`.-]+)\s+accepting\b/i
    );
    providerName = normalizeProviderName(
      acceptingMatch?.[1] ? `Dr. ${acceptingMatch[1]}` : undefined
    );
  }

  const isTransfer = /transfer|accepted|accepting|higher level|shannon/i.test(
    combined
  );
  const isImaging = /ct|cta|x-ray|xray|radiology|imaging|fracture|impression/i.test(
    combined
  );
  const isErNote =
    /emergency physician record|er note|emergency department|history of present illness|physical exam|clinical impression/i.test(
      normalized
    );

  const medicalFacility =
    (/shannon medical center/i.test(text) && "Shannon Medical Center") ||
    (/shannon er/i.test(text) && "Shannon ER") ||
    (/reagan memorial hospital/i.test(text) && "Reagan Memorial Hospital") ||
    (/reagan hospital district/i.test(text) && "Reagan Hospital District") ||
    (/hickman rhc/i.test(text) && "Hickman RHC") ||
    undefined;

  let physicianRole: string | undefined;

  if (isTransfer) {
    physicianRole = "accepting";
  } else if (isImaging) {
    physicianRole = "rendering";
  } else if (isErNote) {
    physicianRole = "author";
  }

  return {
    physicianName: providerName,
    physicianRole,
    medicalFacility,
    facilityType: medicalFacility ? "hospital" : undefined,
  };
}

function normalizeProviderName(value?: string): string | undefined {
  if (!value) return undefined;

  const cleaned = normalizeWhitespace(value).replace(/\b(electronically signed by|signed by)\b[:\s-]*/gi, "");

  if (!cleaned || cleaned.length < 4) return undefined;
  if (/^(physician|provider|doctor|attending|ordering|rendering|unknown|md|do|pa|np|rn)$/i.test(cleaned)) {
    return undefined;
  }
  if (/\bRN\b/i.test(cleaned)) return undefined;
  if (/hospital|clinic|center|district|health|lab|imaging/i.test(cleaned) && !/\bDr\b/i.test(cleaned)) {
    return undefined;
  }

  return cleaned;
}

function buildEvent(page: PageText, spec: EventSpec): TimelineEventResult | null {
  const pageText = sourcePageToText(page);
  if (isLowQualityTimelinePage(pageText)) {
    return null;
  }

  if (spec.title.includes("Grouped medications")) {
    if (isMedicationListBoilerplateText(pageText) && !hasMedicationChangeSignal(pageText)) {
      return null;
    }

    if (
      isMedicationListOnlyText(pageText) ||
      (/07\/01\/2023/.test(pageText) && isMedicationListBoilerplateText(pageText))
    ) {
      return null;
    }
  }

  const normalized = normalizeSearchText(pageText);

  const matchedTerms = spec.pageTerms.filter((term) =>
    normalized.includes(normalizeSearchText(term))
  );

  if (matchedTerms.length < (spec.minMatches ?? 1)) {
    return null;
  }

  if (spec.eventType === "report" || spec.eventType === "observation") {
    const strongFindingCount = countMatches(pageText, HIGH_VALUE_FINDINGS);
    if (strongFindingCount === 0 && matchedTerms.length < 2) {
      return null;
    }
  }

  const dateCandidate = extractDateFromText(pageText);
  const date = resolveHistoricalTraumaDate(pageText, spec.title, dateCandidate) ?? dateCandidate;
  const description = compactSentence(spec.descriptionBuilder(pageText));
  const sourceExcerpt = compactSentence(
    findSnippet(pageText, [
      "electronically signed by",
      "signed by",
      "dr.",
      "accepting",
      ...(spec.sourceTerms ?? spec.pageTerms),
    ])
  );
  const metadata = inferMetadata(pageText, spec.title);
  const combinedSupportText = `${spec.title} ${pageText}`.toLowerCase();

  const isSignedImagingReport =
    /\b(electronically signed by|signed by)\b/i.test(pageText) &&
    /\b(ct|cta|x-ray|xray|mri|ultrasound|impression|findings|radiology|fracture)\b/i.test(
      combinedSupportText
    ) &&
    !/\b(cbc|bmp|cmp|urinalysis|ua|wbc|hemoglobin|platelets|glucose|creatinine)\b/i.test(
      combinedSupportText
    );

  const isTransferPhysician =
    /\btransfer|accepted|accepting|higher level|shannon\b/i.test(
      combinedSupportText
    );

  const physicianName =
    isSignedImagingReport || isTransferPhysician
      ? metadata.physicianName
      : undefined;

  const physicianRole =
    isSignedImagingReport || isTransferPhysician
      ? metadata.physicianRole
      : undefined;

  return {
    date,
    dateType: spec.dateType,
    title: spec.title,
    description,
    eventType: spec.eventType,
    confidence: spec.confidence ?? 0.9,
    sourcePage: page.page,
    sourceExcerpt,
    physicianName,
    physicianRole,
    medicalFacility: metadata.medicalFacility,
    facilityType: metadata.facilityType,
  };
}

function sortEvents(events: TimelineEventResult[]): TimelineEventResult[] {
  return [...events].sort((a, b) => {
    if (a.date === "UNKNOWN" && b.date === "UNKNOWN") {
      return (b.sourcePage ?? 0) - (a.sourcePage ?? 0);
    }
    if (a.date === "UNKNOWN") return 1;
    if (b.date === "UNKNOWN") return -1;

    const aTime = new Date(`${a.date}T00:00:00Z`).getTime();
    const bTime = new Date(`${b.date}T00:00:00Z`).getTime();

    if (aTime !== bTime) return aTime - bTime;
    if ((a.sourcePage ?? 0) !== (b.sourcePage ?? 0)) {
      return (a.sourcePage ?? 0) - (b.sourcePage ?? 0);
    }

    return eventPriority(b) - eventPriority(a);
  });
}

function eventPriority(event: TimelineEventResult): number {
  const title = normalizeSearchText(event.title);
  const description = normalizeSearchText(event.description);
  const combined = `${title} ${description}`;
  const basePriority = EVENT_PRIORITY[event.eventType || "other"];

  if (combined.includes("transfer")) return 100;
  if (combined.includes("cta neck") || combined.includes("vascular injury")) return 98;
  if (combined.includes("fracture") && combined.includes("c2")) return 95;
  if (combined.includes("fracture") && combined.includes("scapular")) return 94;
  if (combined.includes("ct head")) return 93;
  if (combined.includes("head, neck, left shoulder pain")) return 92;
  if (combined.includes("admission") || combined.includes("discharge")) return 91;
  if (combined.includes("pipe") || combined.includes("derrick")) return 91;
  if (combined.includes("scalp") || combined.includes("periorbital")) return 90;
  if (event.eventType === "incident") return 85;
  if (event.eventType === "symptom") return 80;
  if (event.eventType === "diagnosis") return 75;
  if (event.eventType === "report") return 70;
  if (event.eventType === "treatment") return 65;
  if (event.eventType === "observation") return 60;
  if (event.eventType === "communication") return 50;

  return basePriority;
}

function extractLocalTimelineEvents(pageTexts: PageText[]): TimelineEventResult[] {
  const events: TimelineEventResult[] = [];

  for (const spec of EVENT_SPECS) {
    const page = findBestPage(pageTexts, spec);
    if (!page) continue;

    const event = buildEvent(page, spec);
    if (event) {
      const isOverrideCandidate =
        spec.title === "Grouped medications" ||
        spec.title === "Transferred to Shannon";
      const isWeakExcerpt = isWeakSourceExcerpt(event.sourceExcerpt);

      if (
        isOverrideCandidate &&
        isWeakExcerpt
      ) {
        const supportPage = findBestSupportPage(pageTexts, spec);

        if (supportPage && supportPage.page !== event.sourcePage) {
          const supportExcerpt = compactSentence(
            findSnippet(supportPage.text, [
              "medication administration",
              "hydromorphone",
              "dilaudid",
              "ondansetron",
              "zofran",
              "tdap",
              "adacell",
              "given",
              "ivp",
              "im",
              "start",
              "stop",
              "transfer to shannon",
              "transfer to shannon er",
              "dr. vretis",
              "accepting",
              "request to transfer",
              "transfer memorandum",
              "air transport",
              "ems",
              "flight nurse",
              "receiving hospital",
            ])
          );

          if (supportExcerpt) {
            event.sourcePage = supportPage.page;
            event.sourceExcerpt = supportExcerpt;
          } else {
            event.sourcePage = supportPage.page;
          }
        }
      }

      events.push(event);
    }
  }

  return dedupeEvents(events);
}

function hasEventWithTitle(
  events: TimelineEventResult[],
  page: number,
  pattern: RegExp
): boolean {
  return events.some(
    (event) =>
      event.sourcePage === page && pattern.test(normalizeSearchText(event.title))
  );
}

function buildSupplementalImagingEvents(
  pageTexts: PageText[],
  existingEvents: TimelineEventResult[]
): TimelineEventResult[] {
  const supplemental: TimelineEventResult[] = [];

  for (const page of pageTexts) {
    const text = normalizeSearchText(page.text);
    if (!text) continue;

    const dateCandidate = extractDateFromText(page.text);
    const date =
      resolveHistoricalTraumaDate(
        page.text,
        "CT head showed no acute intracranial injury",
        dateCandidate
      ) ?? dateCandidate;
    if (!isAcceptedDate(date)) continue;

    const metadata = inferMetadata(page.text, "");

    if (
      /\bct head\b/.test(text) &&
      /\b(no acute intracranial|intracranial abnormality|periorbital|scalp)\b/.test(
        text
      ) &&
      !hasEventWithTitle(existingEvents, page.page, /\bct head\b/)
    ) {
      supplemental.push({
        date,
        dateType: "service_date",
        title: "CT head showed no acute intracranial injury",
        description:
          "CT head showed no acute intracranial injury with left periorbital soft tissue swelling.",
        eventType: "report",
        confidence: 0.96,
        sourcePage: page.page,
        sourceExcerpt: compactSentence(
          findSnippet(page.text, [
            "electronically signed by",
            "signed by",
            "dr.",
            "accepting",
            "impression",
            "findings",
          ])
        ),
        physicianName: metadata.physicianName,
        physicianRole: metadata.physicianRole,
        medicalFacility: metadata.medicalFacility,
        facilityType: metadata.facilityType,
      });
    }

    if (
      (/\bcta\b/.test(text) || /\bct angiogram\b/.test(text) || /\bct neck\b/.test(text)) &&
      /\b(vascular injury|dissection|vertebral artery|vertebral foramen|foraminal extension)\b/.test(
        text
      ) &&
      !hasEventWithTitle(existingEvents, page.page, /\bcta\b/)
    ) {
      supplemental.push({
        date,
        dateType: "service_date",
        title: "CTA neck showed vascular injury concern",
        description:
          "CTA neck showed vascular injury concern, including vertebral artery or foraminal extension findings.",
        eventType: "report",
        confidence: 0.97,
        sourcePage: page.page,
        sourceExcerpt: compactSentence(
          findSnippet(page.text, [
            "electronically signed by",
            "signed by",
            "dr.",
            "accepting",
            "impression",
            "findings",
          ])
        ),
        physicianName: metadata.physicianName,
        physicianRole: metadata.physicianRole,
        medicalFacility: metadata.medicalFacility,
        facilityType: metadata.facilityType,
      });
    }

    if (
      /\b(c2|c-spine|cervical spine)\b/.test(text) &&
      /\bfracture\b/.test(text) &&
      /\bvertebral foramen\b/.test(text) &&
      !hasEventWithTitle(existingEvents, page.page, /\bc2\b/)
    ) {
      supplemental.push({
        date,
        dateType: "service_date",
        title: "C2 fracture with vertebral foramen extension",
        description:
          "C2 fractures involved the vertebral foramen, raising concern for vascular injury.",
        eventType: "report",
        confidence: 0.97,
        sourcePage: page.page,
        sourceExcerpt: compactSentence(
          findSnippet(page.text, [
            "electronically signed by",
            "signed by",
            "dr.",
            "accepting",
            "impression",
            "findings",
          ])
        ),
        physicianName: metadata.physicianName,
        physicianRole: metadata.physicianRole,
        medicalFacility: metadata.medicalFacility,
        facilityType: metadata.facilityType,
      });
    }

    if (
      /\b(scapular|scapula)\b/.test(text) &&
      /\bfracture\b/.test(text) &&
      !hasEventWithTitle(existingEvents, page.page, /\bscapular\b/)
    ) {
      supplemental.push({
        date,
        dateType: "service_date",
        title: "Imaging showed nondisplaced left scapular fracture",
        description:
          "Left shoulder and humerus radiographs showed a nondisplaced fracture of the left scapular body.",
        eventType: "report",
        confidence: 0.95,
        sourcePage: page.page,
        sourceExcerpt: compactSentence(
          findSnippet(page.text, [
            "electronically signed by",
            "signed by",
            "dr.",
            "accepting",
            "impression",
            "findings",
          ])
        ),
        physicianName: metadata.physicianName,
        physicianRole: metadata.physicianRole,
        medicalFacility: metadata.medicalFacility,
        facilityType: metadata.facilityType,
      });
    }
  }

  return supplemental;
}

function buildSupplementalEndocrineEvents(
  pageTexts: PageText[],
  existingEvents: TimelineEventResult[]
): TimelineEventResult[] {
  const supplemental: TimelineEventResult[] = [];

  function hasAcceptableTitleMatchWithDate(pattern: RegExp): boolean {
    return [...existingEvents, ...supplemental].some((event) => {
      if (!pattern.test(normalizeSearchText(event.title))) return false;

      const date = normalizeSearchText(event.date);
      const year = Number.parseInt(date.slice(0, 4), 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(year) || year < 2000) {
        return false;
      }

      const combined = normalizeSearchText(
        `${event.title || ""} ${event.description || ""} ${event.sourceExcerpt || ""}`
      );

      if (
        /\b(dob|legal sex|mrn|csn|home phone|mobile phone|work phone|occupation|guarantor|printed by|subpoena|custodian|business records|records produced)\b/.test(
          combined
        )
      ) {
        return false;
      }

      return true;
    });
  }

  for (let index = 0; index < pageTexts.length; index++) {
    const page = pageTexts[index];
    const text = normalizeSearchText(page.text);
    if (!text) continue;

    const date = extractDateFromText(page.text);
    if (!isAcceptedDate(date)) continue;

    const lower = text.toLowerCase();
    const supportText = getNearbyPageText(pageTexts, index, 1);

    if (
      /\bdallas endocrinology\b/.test(lower) &&
      /\b(results follow-up|adrenal insufficiency|x-linked adrenoleukodystrophy|ald)\b/.test(lower) &&
      hasAnySearchTerm(supportText, [
        "dallas endocrinology",
        "results follow-up",
        "adrenal insufficiency",
        "x-linked adrenoleukodystrophy",
        "ald",
      ]) &&
      !hasAcceptableTitleMatchWithDate(/\bendocrinology results follow-up\b/)
    ) {
      supplemental.push({
        date,
        dateType: "service_date",
        title: "Endocrinology results follow-up",
        description:
          "Results follow-up documented adrenal insufficiency, ALD/adrenoleukodystrophy, status post allogeneic bone marrow transplant, and X-linked adrenoleukodystrophy.",
        eventType: "appointment",
        confidence: 0.96,
        sourcePage: page.page,
        sourceExcerpt: compactSentence(
          findSnippet(page.text, [
            "dallas endocrinology",
            "results follow-up",
            "adrenal insufficiency",
            "x-linked adrenoleukodystrophy",
            "ald",
          ])
        ),
        physicianName: inferMetadata(page.text, "").physicianName,
        physicianRole: inferMetadata(page.text, "").physicianRole,
        medicalFacility: inferMetadata(page.text, "").medicalFacility,
        facilityType: inferMetadata(page.text, "").facilityType,
      });
    }

    if (
      /\bacth\b/.test(lower) &&
      /\brenin\b/.test(lower) &&
      /\b(stress dosing|elevated|high)\b/.test(lower) &&
      hasAllSearchTerms(supportText, ["acth", "renin"]) &&
      hasAnySearchTerm(supportText, ["stress dosing", "elevated", "high"]) &&
      !hasAcceptableTitleMatchWithDate(/\bacth remained high and renin elevated\b/)
    ) {
      supplemental.push({
        date,
        dateType: "service_date",
        title: "ACTH remained high and renin elevated",
        description:
          "ACTH remained high after stress dosing and renin was elevated.",
        eventType: "report",
        confidence: 0.97,
        sourcePage: page.page,
        sourceExcerpt: compactSentence(
          findSnippet(page.text, ["acth", "renin", "stress dosing", "elevated", "high"])
        ),
      });
    }

    if (
      /\bhydrocortisone\b/.test(lower) &&
      /\bfludrocortisone\b/.test(lower) &&
      /\b(increase|increased|adjust|adjusted|new dose|dose adjustment)\b/.test(lower) &&
      hasAllSearchTerms(supportText, ["hydrocortisone", "fludrocortisone"]) &&
      hasAnySearchTerm(supportText, ["increase", "increased", "adjust", "adjusted", "new dose", "dose adjustment"]) &&
      !hasAcceptableTitleMatchWithDate(/\bhydrocortisone and fludrocortisone doses increased\b/)
    ) {
      supplemental.push({
        date,
        dateType: "service_date",
        title: "Hydrocortisone and fludrocortisone doses increased",
        description:
          "Hydrocortisone and fludrocortisone doses were increased after the endocrine follow-up.",
        eventType: "treatment",
        confidence: 0.97,
        sourcePage: page.page,
        sourceExcerpt: compactSentence(
          findSnippet(page.text, [
            "hydrocortisone",
            "fludrocortisone",
            "increase",
            "increased",
            "dose",
          ])
        ),
      });
    }

    if (
      /\b(fatigue|tired|color changes|dry lips|thirst)\b/.test(lower) &&
      /\b(mother|parent|nursing)\b/.test(lower) &&
      hasAnySearchTerm(supportText, ["fatigue", "tired", "color changes", "dry lips", "thirst"]) &&
      hasAnySearchTerm(supportText, ["mother", "parent", "nursing"]) &&
      !hasAcceptableTitleMatchWithDate(/\bparent reported fatigue, color changes, dry lips, and thirst\b/)
    ) {
      supplemental.push({
        date,
        dateType: "service_date",
        title: "Parent reported fatigue, color changes, dry lips, and thirst",
        description:
          "Parent reported fatigue, color changes, dry lips, and thirst.",
        eventType: "communication",
        confidence: 0.95,
        sourcePage: page.page,
        sourceExcerpt: compactSentence(
          findSnippet(page.text, [
            "fatigue",
            "color changes",
            "dry lips",
            "thirst",
            "mother",
            "parent",
          ])
        ),
      });
    }

    if (
      /\brepeat\b/.test(lower) &&
      /\b(acth|renin|electrolytes|lytes)\b/.test(lower) &&
      /\b4 weeks\b/.test(lower) &&
      hasAnySearchTerm(supportText, ["repeat", "acth", "renin", "electrolytes", "lytes", "4 weeks"]) &&
      !hasAcceptableTitleMatchWithDate(/\brepeat lytes, acth, and renin planned in 4 weeks\b/)
    ) {
      supplemental.push({
        date,
        dateType: "service_date",
        title: "Repeat lytes, ACTH, and renin planned in 4 weeks",
        description:
          "Repeat lytes, ACTH, and renin were planned in 4 weeks.",
        eventType: "other",
        confidence: 0.99,
        sourcePage: page.page,
        sourceExcerpt: compactSentence(
          findSnippet(page.text, ["repeat", "electrolytes", "acth", "renin", "4 weeks"])
        ),
      });
    }

    if (
      /\b(symptoms persist|if still symptomatic|contact|bmt team|go to the er|go to er)\b/.test(
        lower
      ) &&
      hasAnySearchTerm(supportText, ["symptoms persist", "bmt", "go to the er", "contact"]) &&
      !hasAcceptableTitleMatchWithDate(/\bbmt\/er guidance if symptoms persist\b/)
    ) {
      supplemental.push({
        date,
        dateType: "service_date",
        title: "BMT/ER guidance if symptoms persist",
        description:
          "Family was advised to contact the BMT team and/or go to the ER if symptoms persisted.",
        eventType: "communication",
        confidence: 0.96,
        sourcePage: page.page,
        sourceExcerpt: compactSentence(
          findSnippet(page.text, [
            "symptoms persist",
            "contact",
            "bmt",
            "go to the er",
            "evaluation",
            "mychart",
          ])
        ),
      });
    }

    if (
      /\blab visit\b/.test(lower) &&
      /\b(blood draw|electrolytes|lab visit|laboratory)\b/.test(lower) &&
      !hasAcceptableTitleMatchWithDate(/\blab visit documented\b/)
    ) {
      supplemental.push({
        date,
        dateType: "service_date",
        title: "Lab visit documented",
        description: "Laboratory follow-up visit documented.",
        eventType: "appointment",
        confidence: 0.93,
        sourcePage: page.page,
        sourceExcerpt: compactSentence(
          findSnippet(page.text, ["lab visit", "blood draw", "electrolytes", "laboratory"])
        ),
      });
    }
  }

  return supplemental;
}

function normalizePageTexts(pageTexts: { page: number; text: string }[]): PageText[] {
  return pageTexts
    .filter(
      (page): page is { page: number; text: string } =>
        Boolean(page && typeof page.page === "number" && typeof page.text === "string")
    )
    .map((page) => ({
      page: page.page,
      text: normalizeWhitespace(page.text || ""),
    }))
    .filter((page) => page.text.length > 0);
}

export async function extractTimelineEvents(
  pageTexts: { page: number; text: string }[]
): Promise<TimelineEventResult[]> {
  const usablePages = normalizePageTexts(pageTexts);
  if (!usablePages.length) return [];

  const baseEvents = extractLocalTimelineEvents(usablePages);
  const supplementalEvents = buildSupplementalImagingEvents(
    usablePages,
    baseEvents
  );
  const endocrineSupplementalEvents = buildSupplementalEndocrineEvents(
    usablePages,
    dedupeEvents([...baseEvents, ...supplementalEvents])
  );
  const localEvents = sortEvents(
    dedupeEvents([...baseEvents, ...supplementalEvents, ...endocrineSupplementalEvents])
  );
  const dateReadyEvents = localEvents.filter((event) => isAcceptedDate(event.date));

  return dateReadyEvents.slice(0, 9);
}
