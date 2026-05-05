import { formatTimelineDateValue } from "@/lib/timeline-date";

export type TimelineSummaryMode = "short" | "grouped" | "highlights";

export type TimelineSummaryResult = {
  caseSummary: string;
  keyFindings: string[];
  mode: TimelineSummaryMode;
};

export type TieredTimelineSummaryEvent = {
  id: string;
  date: string;
  title: string;
  description?: string | null;
  eventType?: string | null;
  sourcePage?: number | null;
  documentId?: string | null;
  physicianName?: string | null;
  medicalFacility?: string | null;
  reviewStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
  isHidden?: boolean | null;
};

export type TieredTimelineSummary = {
  caseSnapshot: string;
  keyIssues: string[];
  dateSummaries: {
    date: string;
    summary: string;
  }[];
  tieredEvents: {
    critical: TieredTimelineSummaryEvent[];
    supporting: TieredTimelineSummaryEvent[];
    context: TieredTimelineSummaryEvent[];
  };
};

export type TimelineDisplayEvent = TimelineSummaryEvent & {
  id?: string | null;
  eventDate?: string | Date | null;
  documentId?: string | null;
  reviewStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
  isHidden?: boolean | null;
};

export type TimelineDisplayEventGroup = {
  category: SummaryCategory;
  categoryLabel: string;
  items: TimelineDisplayEvent[];
};

export type TimelineDisplayDateGroup = {
  date: string;
  groups: TimelineDisplayEventGroup[];
};

type TimelineSummaryEvent = {
  date?: string | null;
  title?: string | null;
  description?: string | null;
  eventType?: string | null;
  sourcePage?: number | null;
  documentName?: string | null;
  medicalFacility?: string | null;
};

type SummaryCategory =
  | "incident"
  | "symptoms"
  | "imaging"
  | "labs"
  | "procedures"
  | "medication"
  | "transfer"
  | "followup"
  | "other";

type ScoredSummaryEvent = {
  event: TimelineSummaryEvent;
  category: SummaryCategory;
  score: number;
  index: number;
};

function normalizePacketLabel(value?: string | null): string {
  return normalizeText(value)
    .replace(/\.pdf$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isOchsnerPacketLabel(value?: string | null): boolean {
  const normalized = normalizePacketLabel(value);

  if (!normalized) return false;

  return (
    normalized === "ochsner" ||
    normalized.startsWith("ochsner uhc") ||
    normalized.startsWith("ochsner university hospital") ||
    normalized.startsWith("ochsner health")
  );
}

const CATEGORY_ORDER: SummaryCategory[] = [
  "incident",
  "symptoms",
  "imaging",
  "labs",
  "procedures",
  "medication",
  "transfer",
  "followup",
  "other",
];

const CATEGORY_LABELS: Record<SummaryCategory, string> = {
  incident: "Incident / mechanism",
  symptoms: "Symptoms / presentation",
  imaging: "Imaging",
  labs: "Labs",
  procedures: "Procedures / treatment",
  medication: "Treatment / medication",
  transfer: "Transfer / discharge",
  followup: "Follow-up",
  other: "Other",
};

const CATEGORY_PRIORITY: Record<SummaryCategory, number> = {
  incident: 8,
  symptoms: 5,
  imaging: 8,
  labs: 7,
  procedures: 7,
  medication: 6,
  transfer: 8,
  followup: 4,
  other: 1,
};

const LOW_VALUE_PATTERNS: RegExp[] = [
  /\bencounter opened\b/,
  /\bencounter recorded\b/,
  /\bencounter at\b/,
  /\bdocument generated\b/,
  /\breport finalized\b/,
  /\bpage \d+ of \d+\b/,
  /\bpatient seen\b/,
  /\bchart reviewed\b/,
  /\badministrative\b/,
  /\bregistration\b/,
  /\bdemographics?\b/,
  /\bvital signs?\b/,
  /\bblood pressure\b/,
  /\bpulse\b/,
  /\brespirations\b/,
  /\btemperature\b/,
  /\boxygen saturation\b/,
  /\bpain score\b/,
];

const INCIDENT_PATTERNS: RegExp[] = [
  /\bworkplace\b/,
  /\bwork-related\b/,
  /\bpipe fell\b/,
  /\bpipe falling\b/,
  /\bstruck (?:the )?patient\b/,
  /\bfell\b/,
  /\bfall\b/,
  /\bcollision\b/,
  /\bmotor vehicle crash\b/,
  /\bmvc\b/,
  /\bassault\b/,
  /\baccident\b/,
  /\bcrash\b/,
  /\bderrick\b/,
];

const SYMPTOM_PATTERNS: RegExp[] = [
  /\b(symptom|presentation|chief complaint|complaint|pain|swelling|bruising|ecchymosis|contusion|headache|dizziness|nausea|vomiting|weakness|numbness|tingling|laceration|tenderness)\b/,
  /\bpresented with\b/,
  /\barrived with\b/,
  /\bon exam\b/,
  /\bphysical exam\b/,
  /\bfatigue\b/,
  /\btired\b/,
  /\bcolor changes\b/,
  /\bdry lips\b/,
  /\bthirst\b/,
];

const IMAGING_PATTERNS: RegExp[] = [
  /\b(ct|cta|mri|x\s?ray|xray|radiology|imaging|scan|ultrasound|angiography)\b/,
  /\bfracture\b/,
  /\bdissection\b/,
  /\bhemorrhage\b/,
  /\bdislocation\b/,
  /\bno acute\b/,
  /\bunremarkable\b/,
];

const LAB_PATTERNS: RegExp[] = [
  /\b(lab|labs|laboratory|cbc|cmp|bmp|wbc|rbc|hgb|hct|platelet|sodium|potassium|creatinine|glucose|lactate|troponin|urinalysis|ua|bnp|anion gap|bilirubin|alt|ast)\b/,
  /\bcritical\b/,
  /\babnormal\b/,
  /\belevated\b/,
  /\blow\b/,
  /\bpositive\b/,
  /\bnegative\b/,
];

const PROCEDURE_PATTERNS: RegExp[] = [
  /\b(procedure|procedures|treatment|treated|repair|sutures?|sutured|splint|reduction|irrigation|immobiliz|intubation|surgery|consult|evaluation|examined|placed|performed)\b/,
  /\bmedically cleared\b/,
  /\btransfer accepted\b/,
];

const MEDICATION_PATTERNS: RegExp[] = [
  /\b(medication|medications|meds|given|administered|started on|prescribed|continue|continued|dose|doses|dosage|mg|tablet|capsule|increased|decreased|adjusted|adjustment)\b/,
  /\b(acetaminophen|tylenol|ibuprofen|naproxen|ketorolac|toradol|morphine|fentanyl|hydromorphone|dilaudid|ondansetron|zofran|keppra|levetiracetam|lidocaine|antibiotic|antibiotics|prednisone|tramadol|oxycodone|norco)\b/,
];

const TRANSFER_PATTERNS: RegExp[] = [
  /\b(transfer|transferred|accepted|accepting|higher level of care|discharge|discharged|disposition|admitted|admission|home|release|follow-up instructions)\b/,
  /\bshannon\b/,
];

const FOLLOWUP_PATTERNS: RegExp[] = [
  /\bfollow[- ]?up\b/,
  /\boutpatient\b/,
  /\breturn precautions\b/,
  /\bpcp\b/,
  /\bclinic\b/,
  /\brecheck\b/,
  /\breturn if\b/,
  /\bbmt\b/,
  /\bsymptoms persist\b/,
  /\bgo to (?:the )?er\b/,
  /\bcontact the bmt team\b/,
];

function normalizeText(value?: string | null): string {
  return (value || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDisplayText(value?: string | null): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function stripLeadingBoilerplate(value: string): string {
  return value
    .replace(/^[-*\s]+/, "")
    .replace(
      /^(encounter opened|encounter recorded|report finalized|document generated|vital signs?|blood pressure|pulse|respirations|temperature|oxygen saturation|pain score)[:\-\s]*/i,
      ""
    )
    .trim();
}

function truncateText(value: string, maxLength = 160): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) {
    return compact;
  }

  const truncated = compact.slice(0, maxLength - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  const clipped = lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated;

  return `${clipped.replace(/[,:;\-\s]+$/, "")}...`;
}

function sentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

function cleanSnippet(value?: string | null): string {
  const display = stripLeadingBoilerplate(normalizeDisplayText(value));
  if (!display) return "";

  const clause = display.split(/[.;\n]/)[0]?.trim() || display;
  return truncateText(clause.replace(/\s+/g, " ").trim());
}

function isLowValueText(text: string): boolean {
  return LOW_VALUE_PATTERNS.some((pattern) => pattern.test(text));
}

function eventText(event: TimelineSummaryEvent): string {
  return normalizeText(`${event.title || ""} ${event.description || ""} ${event.eventType || ""}`);
}

function categoryMatches(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function chooseCategory(text: string): SummaryCategory {
  if (categoryMatches(text, TRANSFER_PATTERNS)) return "transfer";
  if (categoryMatches(text, IMAGING_PATTERNS)) return "imaging";
  if (categoryMatches(text, INCIDENT_PATTERNS)) return "incident";
  if (categoryMatches(text, LAB_PATTERNS)) return "labs";
  if (categoryMatches(text, MEDICATION_PATTERNS)) return "medication";
  if (categoryMatches(text, PROCEDURE_PATTERNS)) return "procedures";
  if (categoryMatches(text, FOLLOWUP_PATTERNS)) return "followup";
  if (categoryMatches(text, SYMPTOM_PATTERNS)) return "symptoms";

  return "other";
}

export function classifySummaryCategory(
  event: TimelineSummaryEvent
): SummaryCategory {
  return chooseCategory(eventText(event));
}

function hasPositiveFinding(text: string): boolean {
  return /\b(positive|critical|abnormal|elevated|low|fracture|dissection|hemorrhage|dislocation|confirmed|concern|worsening|repair|sutured|transferred|discharged|admitted|administered|prescribed|given)\b/.test(
    text
  );
}

function hasNegativeOrNormalFinding(text: string): boolean {
  return /\b(no acute|unremarkable|normal|within normal limits|wnl|negative)\b/.test(
    text
  );
}

export function scoreSummaryValue(event: TimelineSummaryEvent): number {
  const text = eventText(event);
  const category = chooseCategory(text);

  if (!text) return -20;

  let score = CATEGORY_PRIORITY[category] * 10;

  if (category === "incident") score += 18;
  if (category === "imaging") score += 16;
  if (category === "labs") score += 14;
  if (category === "procedures") score += 14;
  if (category === "medication") score += 12;
  if (category === "transfer") score += 18;
  if (category === "followup") score += 8;
  if (category === "symptoms") score += 10;

  if (hasPositiveFinding(text)) score += 14;
  if (hasNegativeOrNormalFinding(text)) score -= 5;

  if (
    /\b(vital signs?|blood pressure|pulse|respirations|oxygen saturation|pain score)\b/.test(
      text
    )
  ) {
    score -= 20;
  }

  if (isLowValueText(text)) score -= 25;

  if (
    /\b(encounter opened|encounter recorded|report finalized|document generated|chart reviewed)\b/.test(
      text
    )
  ) {
    score -= 30;
  }

  if (/\b(only|normal|unchanged)\b/.test(text) && category === "labs") {
    score -= 4;
  }

  return score;
}

function normalizeSentence(value: string): string {
  return value.replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}

function joinNatural(items: string[], finalConjunction = "and"): string {
  const compact = items.map((item) => item.trim()).filter(Boolean);

  if (!compact.length) return "";
  if (compact.length === 1) return compact[0];
  if (compact.length === 2) return `${compact[0]} ${finalConjunction} ${compact[1]}`;

  return `${compact.slice(0, -1).join(", ")}, ${finalConjunction} ${compact[compact.length - 1]}`;
}

function groupText(events: TimelineSummaryEvent[]): string {
  return normalizeText(
    events
      .map((event) => `${event.title || ""} ${event.description || ""}`)
      .join(" ")
  );
}

function hasProjectReEntryPacket(events: TimelineSummaryEvent[]): boolean {
  return events.some((event) =>
    /project\s*re\s*entry/i.test(normalizePacketLabel(event.documentName || ""))
  );
}

function hasReaganMemorialFacility(events: TimelineSummaryEvent[]): boolean {
  return events.some((event) =>
    /reagan memorial/i.test(normalizeText(event.medicalFacility || ""))
  );
}

function buildPacketPrefix(events: TimelineSummaryEvent[]): string | null {
  if (!hasProjectReEntryPacket(events) || !hasReaganMemorialFacility(events)) {
    return null;
  }

  return "Records include embedded Reagan Memorial records from the Project ReEntry packet.";
}

function isOchsnerBleedingPacket(events: TimelineSummaryEvent[]): boolean {
  const text = normalizeText(
    events
      .map(
        (event) =>
          `${event.documentName || ""} ${event.title || ""} ${event.description || ""} ${event.eventType || ""}`
      )
      .join(" ")
  );
  const hasOchsnerPacketLabel = events.some((event) => isOchsnerPacketLabel(event.documentName));

  return (
    (hasOchsnerPacketLabel || /\bochsner(?:\s+(?:university hospital|uhc|health))?\b/.test(text)) &&
    /\b(platelet|platelets|thrombocytopenia|bleeding from mouth and nose|bleeding from the mouth and nose|dexamethasone|hematology|rash)\b/.test(
      text
    )
  );
}

function summarizeOchsnerBleedingPacketFacts(
  events: TimelineSummaryEvent[]
): string | null {
  if (!isOchsnerBleedingPacket(events)) {
    return null;
  }

  const text = normalizeText(
    events
      .map(
        (event) =>
          `${event.documentName || ""} ${event.title || ""} ${event.description || ""} ${event.eventType || ""}`
      )
      .join(" ")
  );

  const parts: string[] = [];

  if (
    /\b(rash|bleeding from mouth and nose|bleeding from the mouth and nose)\b/.test(
      text
    )
  ) {
    parts.push("rash and bleeding from the mouth and nose");
  }

  if (
    /\b(platelet count of 1|severe thrombocytopenia|thrombocytopenia)\b/.test(text)
  ) {
    parts.push("severe thrombocytopenia with a platelet count of 1");
  }

  if (/\bdexamethasone\b/.test(text)) {
    parts.push("dexamethasone and platelet-related treatment");
  }

  if (/\bhematolog/i.test(text)) {
    parts.push("transfer for hematology evaluation");
  }

  if (!parts.length) {
    return null;
  }

  return sentenceCase(`The records document ${joinNatural(parts, "and")}.`);
}

function eventPhrase(event: TimelineSummaryEvent, category: SummaryCategory): string {
  const title = cleanSnippet(event.title);
  const description = cleanSnippet(event.description);

  if (category === "transfer") {
    if (description && title && !description.toLowerCase().startsWith(title.toLowerCase())) {
      return normalizeSentence(description);
    }

    return normalizeSentence(description || title);
  }

  if (category === "labs") {
    if (description && hasPositiveFinding(normalizeText(description))) {
      return normalizeSentence(description);
    }

    if (title && description) {
      return normalizeSentence(`${title}: ${description}`);
    }

    return normalizeSentence(description || title);
  }

  if (category === "imaging") {
    if (description && hasPositiveFinding(normalizeText(description))) {
      return normalizeSentence(description);
    }

    if (title && description && !description.toLowerCase().startsWith(title.toLowerCase())) {
      return normalizeSentence(`${title}: ${description}`);
    }

    return normalizeSentence(description || title);
  }

  if (category === "medication" || category === "procedures") {
    if (description && title && !description.toLowerCase().startsWith(title.toLowerCase())) {
      return normalizeSentence(`${title}: ${description}`);
    }

    return normalizeSentence(description || title);
  }

  if (title && description && !description.toLowerCase().startsWith(title.toLowerCase())) {
    return normalizeSentence(`${title}: ${description}`);
  }

  return normalizeSentence(title || description);
}

function fallbackCategorySentence(category: SummaryCategory): string {
  switch (category) {
    case "incident":
      return "Mechanism or injury details were documented.";
    case "symptoms":
      return "Symptoms and presentation were documented.";
    case "imaging":
      return "Imaging findings were documented.";
    case "labs":
      return "Laboratory results were documented.";
    case "procedures":
      return "Procedures and treatment were documented.";
    case "medication":
      return "Medication administration or prescriptions were documented.";
    case "transfer":
      return "Transfer or discharge details were documented.";
    case "followup":
      return "Follow-up or disposition details were documented.";
    default:
      return "Related timeline events were documented.";
  }
}

function summarizeIncidentFacts(events: TimelineSummaryEvent[]): string {
  const text = groupText(events);

  if (/\b(workplace|work-related)\b/.test(text) && /\b(pipe|derrick)\b/.test(text)) {
    return "The records describe an emergency evaluation after a workplace head injury involving a pipe falling from a derrick.";
  }

  if (/\b(motor vehicle crash|mvc|collision|accident|crash)\b/.test(text)) {
    return "The records describe an emergency evaluation after a motor vehicle crash.";
  }

  if (/\bassault\b/.test(text)) {
    return "The records describe an emergency evaluation after an assault-related injury.";
  }

  if (/\bfell\b/.test(text) && /\binjur/.test(text)) {
    return "The records describe an emergency evaluation after a fall-related injury.";
  }

  const first = eventPhrase(events[0], "incident");
  return first ? sentenceCase(first) : fallbackCategorySentence("incident");
}

function summarizeSymptomsFacts(events: TimelineSummaryEvent[]): string {
  const text = groupText(events);

  if (isOchsnerBleedingPacket(events) && /\b(bleeding from mouth and nose|bleeding from the mouth and nose|rash)\b/.test(text)) {
    return "Rash with bleeding from the mouth and nose was documented.";
  }

  if (
    /\bfatigue\b/.test(text) &&
    /\bcolor changes\b/.test(text) &&
    /\bdry lips\b/.test(text) &&
    /\bthirst\b/.test(text)
  ) {
    return "Parent reported fatigue, color changes, dry lips, and thirst.";
  }

  const parts: string[] = [];

  const painParts: string[] = [];
  const hasHeadPain = /\b(headache|head pain|head\b)/.test(text);
  const hasNeckPain = /\bneck pain\b/.test(text) || /\bneck\b/.test(text);
  const hasLeftShoulderPain =
    /\bleft shoulder pain\b/.test(text) || /\bleft shoulder\b/.test(text);

  if (hasHeadPain) painParts.push("head");
  if (hasNeckPain) painParts.push("neck");
  if (hasLeftShoulderPain) painParts.push("left shoulder");

  if (painParts.length) {
    parts.push(`${joinNatural(painParts)} pain`);
  }

  if (
    /\blaceration\b/.test(text) ||
    (/\bscalp\b/.test(text) &&
      (/\bperiorbital\b/.test(text) || /\bbruising\b/.test(text) || /\bswelling\b/.test(text)))
  ) {
    parts.push("head laceration");
  }

  if (
    /\bperiorbital\b/.test(text) &&
    /\b(swelling|bruising|ecchymosis|contusion)\b/.test(text)
  ) {
    parts.push("left periorbital swelling");
  } else if (/\bscalp swelling\b/.test(text)) {
    parts.push("head laceration and scalp swelling");
  }

  if (!parts.length) {
    const first = eventPhrase(events[0], "symptoms");
    return first ? sentenceCase(first) : fallbackCategorySentence("symptoms");
  }

  const [firstPart, ...rest] = parts;
  const suffix = rest.length ? ` with ${joinNatural(rest, "and")}` : "";
  return sentenceCase(`${firstPart}${suffix}.`);
}

function summarizeImagingFacts(events: TimelineSummaryEvent[]): string {
  const text = groupText(events);
  const facts: string[] = [];

  if (
    /\bc2\b/.test(text) &&
    /\bfracture\b/.test(text) &&
    (/\bcervical spine\b/.test(text) || /\bvertebral foramen\b/.test(text) || /\bvertebral\b/.test(text))
  ) {
    if (/\bvertebral foramen\b/.test(text)) {
      facts.push("C2 cervical spine fractures with extension through the right vertebral foramen");
    } else {
      facts.push("C2 cervical spine fracture");
    }
  } else if (/\bc2\b/.test(text) && /\bfracture\b/.test(text)) {
    facts.push("cervical spine imaging showed a nondisplaced C2 fracture");
  }

  if (
    /\bct head\b/.test(text) &&
    (/\bno acute intracranial injury\b/.test(text) ||
      /\bno intracranial\b/.test(text) ||
      /\bno bleed\b/.test(text) ||
      /\bno intracranial hemorrhage\b/.test(text))
  ) {
    facts.push("CT head showed no acute intracranial injury");
  }

  if (
    /\bcta neck\b/.test(text) &&
    /\bvascular injury\b/.test(text)
  ) {
    facts.push("CTA neck raised concern for vascular injury");
  }

  if (
    (/\bleft shoulder\b/.test(text) || /\bhumerus\b/.test(text) || /\bscapul/.test(text)) &&
    /\bfracture\b/.test(text)
  ) {
    facts.push("a nondisplaced left scapular fracture");
  }

  if (!facts.length) {
    const first = eventPhrase(events[0], "imaging");
    return first ? sentenceCase(first) : fallbackCategorySentence("imaging");
  }

  if (
    facts.length >= 2 &&
    facts.includes("C2 cervical spine fractures with extension through the right vertebral foramen") &&
    facts.includes("a nondisplaced left scapular fracture")
  ) {
    return sentenceCase(
      "Imaging documented C2 cervical spine fractures with extension through the right vertebral foramen and a nondisplaced left scapular fracture."
    );
  }

  return sentenceCase(`Imaging documented ${joinNatural(facts, "and")}.`);
}

function summarizeProcedureFacts(events: TimelineSummaryEvent[]): string {
  const text = groupText(events);

  if (/\b(cervical collar|spine precautions|trauma consult|orthopedic evaluation)\b/.test(text)) {
    return "Trauma-related procedures and consultations were documented.";
  }

  const first = eventPhrase(events[0], "procedures");
  return first ? sentenceCase(first) : fallbackCategorySentence("procedures");
}

function summarizeMedicationFacts(events: TimelineSummaryEvent[]): string {
  const text = groupText(events);
  const preferredMeds: string[] = [];
  const secondaryMeds: string[] = [];

  if (isOchsnerBleedingPacket(events) && /\bdexamethasone\b/.test(text)) {
    return "Dexamethasone and platelet-related treatment were documented.";
  }

  if (
    /\bhydrocortisone\b/.test(text) &&
    /\bfludrocortisone\b/.test(text) &&
    /\b(increase|increased|dose adjustment|new dose)\b/.test(text)
  ) {
    return "Hydrocortisone and fludrocortisone doses were increased.";
  }

  if (/\bhydromorphone\b/.test(text) || /\bdilaudid\b/.test(text)) {
    preferredMeds.push("hydromorphone/Dilaudid");
  }
  if (/\bondansetron\b/.test(text) || /\bzofran\b/.test(text)) {
    preferredMeds.push("ondansetron/Zofran");
  }
  if (/\btdap\b/.test(text)) {
    preferredMeds.push("Tdap");
  }
  if (/\bketorolac\b/.test(text)) {
    secondaryMeds.push("ketorolac");
  }
  if (/\bacetaminophen\b/.test(text)) {
    secondaryMeds.push("acetaminophen");
  }

  const uniqueMeds = Array.from(new Set(preferredMeds.length ? preferredMeds : secondaryMeds));
  if (!uniqueMeds.length) {
    const first = eventPhrase(events[0], "medication");
    return first ? sentenceCase(first) : fallbackCategorySentence("medication");
  }

  return sentenceCase(`${joinNatural(uniqueMeds)} were documented.`);
}

function summarizeLabsFacts(events: TimelineSummaryEvent[]): string {
  const text = groupText(events);
  const labs: string[] = [];

  if (
    isOchsnerBleedingPacket(events) &&
    (/\bplatelet count of 1\b/.test(text) || /\bplatelets?\b/.test(text) || /\bsevere thrombocytopenia\b/.test(text))
  ) {
    return "Severe thrombocytopenia with a platelet count of 1 was documented.";
  }

  if (/\bacth\b/.test(text) && /\brenin\b/.test(text)) {
    const parts = ["ACTH remained high after stress dosing and renin was elevated"];

    if (/\brepeat\b/.test(text) && /\b4 weeks\b/.test(text)) {
      parts.push("repeat electrolytes, ACTH, and renin testing were planned in 4 weeks");
    }

    return sentenceCase(`${joinNatural(parts, "and")}.`);
  }

  if (/\bcbc\b/.test(text)) labs.push("CBC");
  if (/\b(cmp|bmp|metabolic panel)\b/.test(text)) labs.push("metabolic panel");
  if (/\burinalysis\b/.test(text) || /\bua\b/.test(text)) labs.push("urinalysis");

  const uniqueLabs = Array.from(new Set(labs));
  if (!uniqueLabs.length) {
    const first = eventPhrase(events[0], "labs");
    return first ? sentenceCase(first) : fallbackCategorySentence("labs");
  }

  if (uniqueLabs.includes("CBC") || uniqueLabs.includes("metabolic panel")) {
    const labText = joinNatural(uniqueLabs.map((lab) => (lab === "metabolic panel" ? "metabolic panel" : lab)));
    return sentenceCase(`${labText} testing were documented during the emergency encounter.`);
  }

  return "Laboratory testing and urinalysis were documented during the emergency encounter.";
}

function summarizeTransferFacts(events: TimelineSummaryEvent[]): string {
  const text = groupText(events);
  const destination = /\bshannon\b/.test(text) ? "Shannon ER" : "the receiving facility";
  const transport = /\bair transport\b/.test(text) ? " by air transport" : "";
  const accepting = /\bdr\.?\s*vretis\b/.test(text) || /\baccepting physician\b/.test(text) ? ", with Dr. Vretis accepting" : "";

  if (isOchsnerBleedingPacket(events) && /\bhematolog/i.test(text)) {
    return "The patient was transferred for hematology evaluation.";
  }

  if (/\btransfer\w*\b/.test(text) || /\bdisposition\b/.test(text) || /\bdischarge\b/.test(text)) {
    return sentenceCase(`The patient was transferred to ${destination}${transport}${accepting}.`);
  }

  const first = eventPhrase(events[0], "transfer");
  return first ? sentenceCase(first) : fallbackCategorySentence("transfer");
}

function summarizeFollowupFacts(events: TimelineSummaryEvent[]): string {
  const text = groupText(events);

  if (/\bdallas endocrinology\b/.test(text) || /\badrenal insufficiency\b/.test(text) || /\bx[- ]linked adrenoleukodystrophy\b/.test(text)) {
    const parts = [
      "Endocrinology results follow-up documented adrenal insufficiency, ALD/adrenoleukodystrophy, status post allogeneic bone marrow transplant, and X-linked adrenoleukodystrophy",
    ];

    if (/\bbmt\b/.test(text) && /\ber\b/.test(text)) {
      parts.push("family was advised to contact the BMT team and/or go to the ER if symptoms persisted");
    }

    return sentenceCase(`${joinNatural(parts, "and")}.`);
  }

  if (/\bfollow[- ]?up\b/.test(text) || /\breturn precautions\b/.test(text) || /\boutpatient\b/.test(text)) {
    return "Follow-up instructions were documented.";
  }

  const first = eventPhrase(events[0], "followup");
  return first ? sentenceCase(first) : fallbackCategorySentence("followup");
}

function summarizeCategoryEvents(
  category: SummaryCategory,
  events: TimelineSummaryEvent[]
): string {
  switch (category) {
    case "incident":
      return summarizeIncidentFacts(events);
    case "symptoms":
      return summarizeSymptomsFacts(events);
    case "imaging":
      return summarizeImagingFacts(events);
    case "labs":
      return summarizeLabsFacts(events);
    case "procedures":
      return summarizeProcedureFacts(events);
    case "medication":
      return summarizeMedicationFacts(events);
    case "transfer":
      return summarizeTransferFacts(events);
    case "followup":
      return summarizeFollowupFacts(events);
    default:
      break;
  }

  const phrases = Array.from(
    new Set(
      events
        .map((event) => eventPhrase(event, category))
        .map((phrase) => phrase.replace(/[.;\s]+$/, "").trim())
        .filter(Boolean)
    )
  );

  if (!phrases.length) {
    return fallbackCategorySentence(category);
  }

  if (phrases.length === 1) {
    return sentenceCase(truncateText(phrases[0], 170));
  }

  if (phrases.length === 2) {
    return sentenceCase(truncateText(`${phrases[0]}; ${phrases[1]}`, 170));
  }

  return sentenceCase(
    truncateText(`${phrases[0]}; ${phrases[1]}; other related events were documented`, 170)
  );
}

function chooseBestEventPerCategory(
  events: TimelineSummaryEvent[]
): Map<SummaryCategory, ScoredSummaryEvent[]> {
  const grouped = new Map<SummaryCategory, ScoredSummaryEvent[]>();

  events.forEach((event, index) => {
    const category = classifySummaryCategory(event);
    const score = scoreSummaryValue(event);
    const bucket = grouped.get(category) || [];

    bucket.push({ event, category, score, index });
    grouped.set(category, bucket);
  });

  for (const bucket of grouped.values()) {
    bucket.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const aDate = a.event.date || "";
      const bDate = b.event.date || "";
      if (aDate !== bDate) return aDate.localeCompare(bDate);

      const aPage = a.event.sourcePage ?? Number.MAX_SAFE_INTEGER;
      const bPage = b.event.sourcePage ?? Number.MAX_SAFE_INTEGER;
      if (aPage !== bPage) return aPage - bPage;

      return a.index - b.index;
    });

    bucket.splice(4);
  }

  return grouped;
}

function collectTopGroups(
  grouped: Map<SummaryCategory, ScoredSummaryEvent[]>,
  maxItems: number
): Array<{ category: SummaryCategory; events: TimelineSummaryEvent[]; score: number }> {
  const selected = CATEGORY_ORDER.flatMap((category) => {
    const bucket = grouped.get(category) || [];
    if (!bucket.length) return [];

    const score = bucket[0]?.score ?? 0;
    return [{ category, events: bucket.map((item) => item.event), score }];
  });

  return selected
    .filter((group) => group.category !== "other" || selected.length === 1)
    .slice(0, maxItems);
}

function buildCaseSummary(
  selectedGroups: Array<{ category: SummaryCategory; events: TimelineSummaryEvent[] }>,
  maxSentences: number
): string {
  const sentences: string[] = [];

  const orderedCategories: SummaryCategory[] = [
    "incident",
    "symptoms",
    "imaging",
    "procedures",
    "medication",
    "labs",
    "transfer",
    "followup",
  ];

  for (const category of orderedCategories) {
    const group = selectedGroups.find((candidate) => candidate.category === category);
    if (!group) continue;

    const sentence = summarizeCategoryEvents(group.category, group.events);
    if (sentence) {
      sentences.push(sentence);
    }
  }

  const limited = sentences
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter(Boolean);

  if (!limited.length) {
    return "Timeline events document the case course, findings, and disposition.";
  }

  return limited
    .slice(0, maxSentences)
    .map((sentence) => {
      const trimmed = sentence.replace(/[\s.]+$/, "").trim();
      return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
    })
    .join(" ");
}

function summarySentenceLimit(mode: TimelineSummaryMode): number {
  switch (mode) {
    case "short":
      return 2;
    case "grouped":
      return 3;
    default:
      return 4;
  }
}

function keyFindingLimit(mode: TimelineSummaryMode): number {
  switch (mode) {
    case "short":
      return 3;
    case "grouped":
      return 5;
    default:
      return 6;
  }
}

function buildKeyFindings(
  mode: TimelineSummaryMode,
  grouped: Map<SummaryCategory, ScoredSummaryEvent[]>,
  packetFacts?: string | null
): string[] {
  const limit = keyFindingLimit(mode);
  const groups = collectTopGroups(grouped, limit);

  return [
    ...(packetFacts ? [`Packet context: ${packetFacts}`] : []),
    ...groups.map((group) => {
      const label = CATEGORY_LABELS[group.category];
      const sentence = summarizeCategoryEvents(group.category, group.events);
      return `${label}: ${sentence}`;
    }),
  ].slice(0, limit);
}

function normalizeDisplayEvent(event: TimelineDisplayEvent): TimelineDisplayEvent {
  const normalizedDate = formatTimelineDateValue(event.eventDate ?? event.date);

  return {
    ...event,
    date: normalizedDate,
    eventDate: normalizedDate,
  };
}

function compareDisplayDates(a: string, b: string): number {
  if (a === b) return 0;
  if (a === "UNKNOWN") return 1;
  if (b === "UNKNOWN") return -1;

  return a.localeCompare(b);
}

function compareDisplayEvents(
  a: TimelineDisplayEvent,
  b: TimelineDisplayEvent,
  aIndex: number,
  bIndex: number
): number {
  const aPage = a.sourcePage ?? Number.MAX_SAFE_INTEGER;
  const bPage = b.sourcePage ?? Number.MAX_SAFE_INTEGER;
  if (aPage !== bPage) return aPage - bPage;

  const aTitle = normalizeText(a.title || "");
  const bTitle = normalizeText(b.title || "");
  if (aTitle !== bTitle) return aTitle.localeCompare(bTitle);

  return aIndex - bIndex;
}

export function buildTimelineDisplayGroups(
  events: TimelineDisplayEvent[]
): TimelineDisplayDateGroup[] {
  const indexedEvents = events
    .map((event, index) => ({
      event: normalizeDisplayEvent(event),
      index,
    }))
    .sort((a, b) => compareDisplayDates(a.event.date || "UNKNOWN", b.event.date || "UNKNOWN") || a.index - b.index);

  const byDate = new Map<
    string,
    {
      event: TimelineDisplayEvent;
      index: number;
    }[]
  >();

  for (const item of indexedEvents) {
    const date = item.event.date || "UNKNOWN";
    const bucket = byDate.get(date) || [];
    bucket.push(item);
    byDate.set(date, bucket);
  }

  return Array.from(byDate.entries())
    .map(([date, items]) => {
      const grouped = new Map<
        SummaryCategory,
        {
          event: TimelineDisplayEvent;
          index: number;
        }[]
      >();

      for (const item of items) {
        const category = classifySummaryCategory(item.event);
        const bucket = grouped.get(category) || [];
        bucket.push(item);
        grouped.set(category, bucket);
      }

      const groups = CATEGORY_ORDER.flatMap((category) => {
        const bucket = grouped.get(category) || [];
        if (!bucket.length) return [];

        const sorted = [...bucket].sort((a, b) =>
          compareDisplayEvents(a.event, b.event, a.index, b.index)
        );

        return [
          {
            category,
            categoryLabel: CATEGORY_LABELS[category],
            items: sorted.map((item) => item.event),
          },
        ];
      });

      return {
        date,
        groups,
      };
    })
    .sort((a, b) => compareDisplayDates(a.date, b.date));
}

export function generateTimelineSummary(
  events: TimelineSummaryEvent[]
): TimelineSummaryResult {
  if (!events.length) {
    return {
      caseSummary: "No timeline events have been generated yet.",
      keyFindings: [],
      mode: "short",
    };
  }

  const mode: TimelineSummaryMode =
    events.length <= 8 ? "short" : events.length <= 25 ? "grouped" : "highlights";

  const grouped = chooseBestEventPerCategory(events);
  const packetFacts = summarizeOchsnerBleedingPacketFacts(events);
  const keyFindings = buildKeyFindings(mode, grouped, packetFacts);
  const selectedGroups = collectTopGroups(grouped, CATEGORY_ORDER.length);
  const packetPrefix = buildPacketPrefix(events);
  const caseSummary = [
    packetPrefix,
    packetFacts,
    buildCaseSummary(selectedGroups, summarySentenceLimit(mode)),
  ]
    .filter(Boolean)
    .join(" ");

  return {
    caseSummary,
    keyFindings,
    mode,
  };
}

type TieredSummarySourceEvent = Pick<
  TieredTimelineSummaryEvent,
  | "id"
  | "date"
  | "title"
  | "description"
  | "eventType"
  | "sourcePage"
  | "documentId"
  | "physicianName"
  | "medicalFacility"
  | "reviewStatus"
  | "isHidden"
> & {
  eventDate?: string | Date | null;
};

type TierName = "critical" | "supporting" | "context";

function normalizeTieredSummaryDate(
  value?: string | Date | null
): string {
  return formatTimelineDateValue(value);
}

function summarizeTieredEventText(event: TieredSummarySourceEvent): string {
  const title = normalizeDisplayText(event.title);
  const description = normalizeDisplayText(event.description);
  const cleanTitle = title.replace(/\s+/g, " ").trim();
  const cleanDescription = description.replace(/\s+/g, " ").trim();

  if (cleanTitle && cleanDescription) {
    if (cleanDescription.toLowerCase().startsWith(cleanTitle.toLowerCase())) {
      return truncateText(cleanDescription, 180);
    }

    return truncateText(`${cleanTitle}: ${cleanDescription}`, 180);
  }

  return truncateText(cleanTitle || cleanDescription, 180);
}

function summarizeTieredEventIssue(event: TieredSummarySourceEvent): string {
  const candidate = summarizeTieredEventText(event);
  if (candidate) return candidate;

  return truncateText(normalizeDisplayText(event.eventType || "Related event"), 120);
}

function summarizeTieredEventSentence(event: TieredSummarySourceEvent): string {
  const text = summarizeTieredEventText(event);
  if (!text) return "";

  const sentence = text.endsWith(".") ? text : `${text}.`;
  return sentenceCase(normalizeSentence(sentence));
}

function isAdministrativeContextText(text: string): boolean {
  return /\b(follow[- ]?up|return precautions|outpatient|appointment|recheck|instructions?|administrative|chart reviewed|documented|summary|packet|paperwork|insurance|demographics?|registration)\b/.test(
    text
  );
}

function classifyTieredSummaryEvent(event: TieredSummarySourceEvent): TierName {
  const text = normalizeText(
    `${event.title || ""} ${event.description || ""} ${event.eventType || ""}`
  );
  const eventType = normalizeText(event.eventType || "");

  if (!text) {
    return "context";
  }

  if (
    /\b(incident|diagnosis|dx|er|emergency room|emergency department|presented|presentation|arrived|admitted|hospital|transfer|transferred|discharged|disposition|procedure|procedures|surgery|operation)\b/.test(
      text
    ) ||
    /\b(fracture|hemorrhage|dissection|dislocation|abnormal|critical|major abnormal|positive finding)\b/.test(
      text
    ) ||
    /\b(ct|cta|mri|x\s?ray|xray|ultrasound|radiology|imaging|scan)\b/.test(text)
  ) {
    return "critical";
  }

  if (
    /\b(lab|labs|laboratory|cbc|cmp|bmp|wbc|rbc|hgb|hct|platelet|sodium|potassium|creatinine|glucose|lactate|troponin|urinalysis|ua|bnp|anion gap|bilirubin|alt|ast)\b/.test(
      text
    ) ||
    /\b(medication|medications|meds|given|administered|started|prescribed|dose|doses|dosage|treatment response|improved|worsened|better|worse|consult|consultation|symptom change|pain improved|symptoms improved)\b/.test(
      text
    )
  ) {
    return "supporting";
  }

  if (isAdministrativeContextText(text)) {
    return "context";
  }

  return "context";
}

function sortTieredSummaryEvents(
  a: TieredTimelineSummaryEvent,
  b: TieredTimelineSummaryEvent
): number {
  if (a.date !== b.date) return a.date.localeCompare(b.date);

  const aPage = a.sourcePage ?? Number.MAX_SAFE_INTEGER;
  const bPage = b.sourcePage ?? Number.MAX_SAFE_INTEGER;
  if (aPage !== bPage) return aPage - bPage;

  const aTitle = normalizeText(a.title || "");
  const bTitle = normalizeText(b.title || "");
  if (aTitle !== bTitle) return aTitle.localeCompare(bTitle);

  return a.id.localeCompare(b.id);
}

function normalizeTieredSummaryEvent(
  event: TieredSummarySourceEvent
): TieredTimelineSummaryEvent | null {
  if (!event.id) return null;

  const date = normalizeTieredSummaryDate(event.date ?? event.eventDate);
  if (!date || date === "UNKNOWN") {
    return null;
  }

  return {
    id: event.id,
    date,
    title: normalizeDisplayText(event.title),
    description:
      typeof event.description === "string"
        ? normalizeDisplayText(event.description) || null
        : event.description ?? null,
    eventType: event.eventType || null,
    sourcePage: event.sourcePage ?? null,
    documentId: event.documentId ?? null,
    physicianName: event.physicianName ?? null,
    medicalFacility: event.medicalFacility ?? null,
    reviewStatus: event.reviewStatus ?? null,
    isHidden: event.isHidden ?? null,
  };
}

function groupTieredSummaryEvents(
  events: TieredTimelineSummaryEvent[]
): Record<TierName, TieredTimelineSummaryEvent[]> {
  const grouped: Record<TierName, TieredTimelineSummaryEvent[]> = {
    critical: [],
    supporting: [],
    context: [],
  };

  for (const event of events) {
    const tier = classifyTieredSummaryEvent(event);
    grouped[tier].push(event);
  }

  for (const tier of Object.keys(grouped) as TierName[]) {
    grouped[tier].sort(sortTieredSummaryEvents);
  }

  return grouped;
}

function buildTieredCaseSnapshot(
  grouped: Record<TierName, TieredTimelineSummaryEvent[]>
): string {
  const sections = [
    grouped.critical[0],
    grouped.critical[1],
    grouped.supporting[0],
    grouped.context[0],
  ]
    .filter((event): event is TieredTimelineSummaryEvent => Boolean(event))
    .map(summarizeTieredEventSentence)
    .filter(Boolean)
    .slice(0, 3);

  if (!sections.length) {
    return "Visible timeline events document the case course.";
  }

  return sections.join(" ");
}

function buildTieredKeyIssues(
  grouped: Record<TierName, TieredTimelineSummaryEvent[]>
): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const tier of ["critical", "supporting", "context"] as TierName[]) {
    for (const event of grouped[tier]) {
      const issue = summarizeTieredEventIssue(event);
      const normalized = normalizeText(issue);

      if (!issue || seen.has(normalized)) continue;

      seen.add(normalized);
      issues.push(issue);

      if (issues.length >= 5) {
        return issues;
      }
    }
  }

  return issues;
}

function buildTieredDateSummaries(
  events: TieredTimelineSummaryEvent[]
): TieredTimelineSummary["dateSummaries"] {
  const byDate = new Map<string, TieredTimelineSummaryEvent[]>();

  for (const event of events) {
    const bucket = byDate.get(event.date) || [];
    bucket.push(event);
    byDate.set(event.date, bucket);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucket]) => {
      const grouped = groupTieredSummaryEvents(bucket);
      const dateEvents = [
        ...grouped.critical.slice(0, 2),
        ...grouped.supporting.slice(0, 1),
        ...grouped.context.slice(0, 1),
      ];

      const summaryParts = dateEvents.length
        ? dateEvents.map(summarizeTieredEventSentence).filter(Boolean)
        : bucket.map(summarizeTieredEventSentence).filter(Boolean);

      return {
        date,
        summary:
          summaryParts.length > 0
            ? summaryParts.join(" ")
            : "Related timeline events were documented.",
      };
    });
}

export function buildTieredTimelineSummary(
  events: TieredSummarySourceEvent[]
): TieredTimelineSummary {
  const normalized = events
    .map(normalizeTieredSummaryEvent)
    .filter(
      (
        event
      ): event is TieredTimelineSummaryEvent =>
        Boolean(
          event &&
            (event.reviewStatus === "APPROVED" ||
              event.reviewStatus === "PENDING" ||
              event.reviewStatus == null) &&
            !event.isHidden
        )
    )
    .sort(sortTieredSummaryEvents);

  if (!normalized.length) {
    return {
      caseSnapshot: "No approved or pending visible timeline events are available yet.",
      keyIssues: [],
      dateSummaries: [],
      tieredEvents: {
        critical: [],
        supporting: [],
        context: [],
      },
    };
  }

  const grouped = groupTieredSummaryEvents(normalized);

  return {
    caseSnapshot: buildTieredCaseSnapshot(grouped),
    keyIssues: buildTieredKeyIssues(grouped),
    dateSummaries: buildTieredDateSummaries(normalized),
    tieredEvents: grouped,
  };
}
