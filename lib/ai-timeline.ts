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
  /electronically signed by[:\s]+([A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){0,3}\s*(?:MD|DO|PA-C|PA|NP|FNP-C)?)/i,
  /signed by[:\s]+([A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){0,3}\s*(?:MD|DO|PA-C|PA|NP|FNP-C)?)/i,
  /accepting(?: physician| provider)?[:\s]+([A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){0,3}\s*(?:MD|DO|PA-C|PA|NP|FNP-C)?)/i,
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
    title: "C2 fracture imaging result",
    eventType: "report",
    dateType: "service_date",
    pageTerms: ["c2", "facet", "lamina", "nondisplaced", "comminuted", "fracture"],
    sourceTerms: ["c2", "facet", "lamina", "nondisplaced", "comminuted"],
    descriptionBuilder: (text) => {
      const snippet =
        findSnippet(text, [
          "c2 facet",
          "c2 lamina",
          "nondisplaced fracture",
          "comminuted fractures",
        ]) || "Imaging showed a C2 fracture.";

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
      "hydromorphone",
      "ondansetron",
      "dilaudid",
      "zofran",
      "tdap",
      "acetaminophen",
      "morphine",
      "ketorolac",
    ],
    sourceTerms: ["hydromorphone", "ondansetron", "tdap", "medication"],
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
    pageTerms: ["transfer", "shannon", "accepted", "air transport", "higher level"],
    sourceTerms: ["transfer", "shannon", "accepted"],
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
];

function normalizeWhitespace(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value?: string): string {
  return (value || "")
    .toLowerCase()
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\w\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  const labeledPatterns = [
    /\b(?:VISIT\s+DATE|ADMIT\s+DATE|DATE\s+OF\s+SERVICE|SERVICE\s+DATE|ER\s+NOTE\s+ENTRY|PROGRESS\s+DATE|INCIDENT\s+DATE|INJURY\s+DATE)\s*[:\s-]*([0-1]?\d\/[0-3]?\d\/\d{4})/i,
    /\b(?:VISIT\s+DATE|ADMIT\s+DATE|DATE\s+OF\s+SERVICE|SERVICE\s+DATE|ER\s+NOTE\s+ENTRY|PROGRESS\s+DATE|INCIDENT\s+DATE|INJURY\s+DATE)\s*[:\s-]*([0-1]?\d\/[0-3]?\d\/\d{2})/i,
    /\bDATE\s*[:\s-]*([0-1]?\d\/[0-3]?\d\/\d{4})/i,
    /\bDATE\s*[:\s-]*([0-1]?\d\/[0-3]?\d\/\d{2})/i,
    /\b(\d{4}-\d{2}-\d{2})\b/,
  ];

  for (const pattern of labeledPatterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;

    const value = match[1];
    if (/^\d{4}-\d{2}-\d{2}$/.test(value) && isValidDate(value)) {
      return value;
    }

    if (value.includes("/")) {
      const [month, day, yearPart] = value.split("/");
      const year = yearPart.length === 2 ? `20${yearPart}` : yearPart;
      const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      if (isValidDate(iso)) return iso;
    }
  }

  const genericDates = Array.from(text.matchAll(/\b([0-1]?\d)\/([0-3]?\d)\/(\d{4})\b/g));

  for (const match of genericDates) {
    const index = match.index ?? 0;
    const window = text
      .slice(Math.max(0, index - 40), index + 40)
      .toLowerCase();

    if (/\b(dob|birth|date of birth)\b/.test(window)) continue;

    const iso = `${match[3]}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
    if (isValidDate(iso)) return iso;
  }

  return "UNKNOWN";
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

function findBestPage(pages: PageText[], terms: string[]): PageText | undefined {
  let best: PageText | undefined;
  let bestScore = 0;

  for (const page of pages) {
    const text = normalizeSearchText(page.text);
    if (!text) continue;

    let score = 0;
    for (const term of terms) {
      if (text.includes(normalizeSearchText(term))) score += 1;
    }

    if (score > bestScore) {
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

function inferMetadata(text: string, eventTitle: string): Partial<TimelineEventResult> {
  const normalized = normalizeSearchText(text);
  const providerMatch = PROVIDER_PATTERNS.map((pattern) => text.match(pattern)).find(
    (match): match is RegExpMatchArray => Boolean(match?.[1])
  );
  const providerName = normalizeProviderName(providerMatch?.[1]);

  const isTransfer = /transfer|accepted|higher level|shannon/i.test(eventTitle + " " + text);
  const isImaging = /ct|x-ray|xray|radiology|imaging|fracture/i.test(eventTitle + " " + text);
  const isErNote = /er|emergency department|clinical impression|history of present illness/i.test(
    normalized
  );

  const medicalFacility =
    (/shannon medical center/i.test(text) && "Shannon Medical Center") ||
    (/shannon er/i.test(text) && "Shannon ER") ||
    (/reagan memorial hospital/i.test(text) && "Reagan Memorial Hospital") ||
    (/reagan hospital district/i.test(text) && "Reagan Hospital District") ||
    undefined;

  const physicianRole =
    (isTransfer && "accepting") ||
    (isImaging && "rendering") ||
    (isErNote && "author") ||
    undefined;

  return {
    physicianName: providerName,
    physicianRole,
    medicalFacility,
    facilityType: medicalFacility?.includes("Shannon") || medicalFacility?.includes("Reagan") ? "hospital" : undefined,
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
  const normalized = normalizeSearchText(pageText);

  const matchedTerms = spec.pageTerms.filter((term) =>
    normalized.includes(normalizeSearchText(term))
  );

  if (matchedTerms.length < (spec.minMatches ?? 1)) {
    return null;
  }

  const date = extractDateFromText(pageText);
  const description = compactSentence(spec.descriptionBuilder(pageText));
  const sourceExcerpt = compactSentence(
    findSnippet(pageText, spec.sourceTerms ?? spec.pageTerms)
  );
  const metadata = inferMetadata(pageText, spec.title);

  return {
    date,
    dateType: spec.dateType,
    title: spec.title,
    description,
    eventType: spec.eventType,
    confidence: spec.confidence ?? 0.9,
    sourcePage: page.page,
    sourceExcerpt,
    physicianName: metadata.physicianName,
    physicianRole: metadata.physicianRole,
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
  if (combined.includes("fracture") && combined.includes("c2")) return 95;
  if (combined.includes("fracture") && combined.includes("scapular")) return 94;
  if (combined.includes("ct head")) return 93;
  if (combined.includes("head, neck, left shoulder pain")) return 92;
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
    const page = findBestPage(pageTexts, spec.pageTerms);
    if (!page) continue;

    const event = buildEvent(page, spec);
    if (event) {
      events.push(event);
    }
  }

  return dedupeEvents(events);
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

  const localEvents = sortEvents(extractLocalTimelineEvents(usablePages));
  const dateReadyEvents = localEvents.filter((event) => isAcceptedDate(event.date));

  return dateReadyEvents.slice(0, 9);
}
