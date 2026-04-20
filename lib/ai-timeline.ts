import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type TimelineEventResult = {
  date: string;
  dateType?: string;
  title: string;
  description?: string;
  eventType?: string;
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

function buildPrimaryPrompt(text: string): string {
  const safeText = text.replace(/`/g, "'").trim();

  return `
You are an expert medical and legal document analyst.

Your task is to extract a HIGH-SIGNAL, CLINICALLY MEANINGFUL chronological timeline.

========================
CORE OBJECTIVE
========================
Produce a clean, professional timeline focused ONLY on events that change the medical story.

TARGET: 8–15 total events.

========================
STRICT EXTRACTION RULES
========================

ONLY INCLUDE EVENTS THAT:
- represent injuries, diagnoses, or key findings
- change treatment or clinical decision-making
- impact disposition (admit, transfer, surgery)
- reflect major imaging or lab findings (NOT the act of performing them)

EXCLUDE ALL LOW-VALUE EVENTS:
- "performed", "completed", "resulted", "ordered", "signed"
- IV placement, oxygen, monitoring, routine nursing care
- EMS procedural details unless critical
- administrative text (workflow, specimen collected, report finalized)
- duplicate symptoms or repeated findings
- social history, past history (unless directly relevant)
- generic status statements like "stable", "resting", "awaiting", "transported", "returned from x-ray"

If the event does NOT change the medical story → DO NOT INCLUDE IT.

========================
DEDUPLICATION RULES
========================

- If multiple entries describe the same condition → keep ONE best version
- Prefer diagnostic conclusions over procedural descriptions
- Merge related findings from the SAME study/panel/medication administration into one event
- Do not split one imaging impression into multiple micro-events when it is one study
- Do not split one lab panel into many one-line events unless findings are legally distinct and cannot be cleanly combined

GOOD:
"C2 fracture with vascular injury concern"

BAD:
"CT cervical spine completed"

========================
PHYSICIAN ASSIGNMENT RULES
========================

Only assign physicianName IF:
- the clinician is explicitly tied to THAT event
- the supporting text for that event itself identifies the clinician

DO NOT assign:
- "Phy", "Physician", abbreviations, placeholders
- ordering providers for labs/imaging
- nurses (RN, FNP, PA)
- EMS personnel
- a clinician mentioned elsewhere on the page but not clearly tied to the event

Radiology:
- Only assign physician if explicitly:
  "Electronically signed by [NAME]"

Transfer:
- Assign accepting physician ONLY for transfer event

If uncertain → physicianName = null

FACILITY ASSIGNMENT RULES
========================

Only assign medicalFacility if the facility is explicitly supported by the event text or clearly labeled on the same source page for that event.

If uncertain → medicalFacility = null

========================
NAME QUALITY RULES
========================

- Do NOT guess or normalize unclear names
- Ignore OCR noise or partial names
- Prefer omission over incorrect attribution

========================
EVENT PRIORITIZATION
========================

PRIORITIZE:
- injuries
- diagnoses
- imaging findings
- clinical impressions
- major treatments
- transfer decisions
- ED arrival / emergency evaluation
- legally significant physical exam findings

PRESERVE THESE WHEN PRESENT:
- bilateral C2 fractures
- vertebral foramen extension
- vascular injury concern
- nondisplaced left scapular fracture
- scalp laceration
- left eye bruising or swelling
- left periorbital or orbital bruising or swelling
- transfer to higher level care

DE-PRIORITIZE:
- procedures without findings
- workflow steps
- repetitive documentation

========================
OUTPUT REQUIREMENTS
========================

Return ONLY a valid JSON array.
No markdown.
No explanations.
No wrapping object.

Each item must follow:

{
  "date": "YYYY-MM-DD or UNKNOWN",
  "dateType": "service_date | admit_date | discharge_date | note_entry | lab_date | order_date | unknown",
  "title": "short, clinically meaningful event",
  "description": "clear factual summary grounded in the document",
  "eventType": "incident|symptom|diagnosis|treatment|appointment|billing|report|communication|observation|other",
  "confidence": 0.0,
  "sourcePage": 1,
  "sourceExcerpt": "exact supporting text",
  "physicianName": "name or null",
  "physicianRole": "attending | ordering | rendering | author | unknown",
  "medicalFacility": "facility name or null",
  "facilityType": "hospital | clinic | lab | imaging | pharmacy | unknown"
}

========================
FINAL INSTRUCTION
========================

Produce a CLEAN, NON-REDUNDANT, HIGH-SIGNAL timeline.

Fewer events is better than noisy output.
- Use concise event titles suitable for a professional chronology.
- Use descriptions to preserve clinically significant supporting detail, not boilerplate.
- Do not invent dates, names, facilities, diagnoses, or laterality.

========================
DOCUMENT TEXT:
${safeText}
`;
}

function buildSecondaryPrompt(text: string): string {
  const safeText = text.replace(/`/g, "'").trim();

  return `
Extract ADDITIONAL timeline events that may have been missed.

Focus especially on:
- symptoms
- diagnosis statements
- treatments
- medications started/stopped/changed
- lab or imaging results
- admissions
- discharges
- care plans
- referrals
- follow-up instructions
- physician assessments
- communication events
- procedures
- observations that materially affect the case

Return ONLY a valid JSON array.
Do not include markdown.
Do not include explanations.

Each item must follow this structure:
{
  "date": "YYYY-MM-DD or UNKNOWN",
  "dateType": "service_date | admit_date | discharge_date | note_entry | lab_date | order_date | unknown",
  "title": "short literal event title",
  "description": "clear factual summary grounded in the document",
  "eventType": "incident|symptom|diagnosis|treatment|appointment|billing|report|communication|observation|other",
  "confidence": 0.0,
  "sourcePage": 1,
  "sourceExcerpt": "exact supporting sentence or phrase from the document",
 "physicianName": "doctor/provider name or null",
"physicianRole": "ordering | rendering | attending | referring | null",
"medicalFacility": "facility name or null",
"facilityType": "hospital | clinic | lab | imaging | pharmacy | null"
}

Rules:
- Avoid duplicates when possible.
- Merge same-study imaging findings into one event when appropriate.
- Merge same-panel lab findings into one event when appropriate.
- Keep major chronology milestones separate: incident, ED arrival, imaging result, diagnosis/impression, treatment, transfer/disposition.
- Include secondary but still meaningful events.
- If date is unclear, use "UNKNOWN".
- If page is unclear, use null for sourcePage.
- Do not invent information.
- Only assign physicianName or medicalFacility when the event's supporting text explicitly supports it.
- Do not propagate names or facilities from a page header to unrelated events.
- Preserve legally significant trauma findings and transfer decisions.
DOCUMENT TEXT:
${safeText}
`;
}

function cleanRawModelText(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function tryParseJsonArray(raw: string): unknown[] {
  const cleaned = cleanRawModelText(raw);

  if (!cleaned) return [];

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // continue to fallback parsing below
  }

  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // ignore
    }
  }

  return [];
}

async function runExtraction(prompt: string, label: string): Promise<unknown[]> {
  try {
    const response = await openai.responses.create({
      model: "gpt-5.4",
      input: prompt,
    });

    const raw = response.output_text || "";

    console.log(`===== ${label} RAW MODEL OUTPUT START =====`);
    console.log(raw || "[empty]");
    console.log(`===== ${label} RAW MODEL OUTPUT END =====`);

    if (!raw.trim()) {
      return [];
    }

    const parsed = tryParseJsonArray(raw);

    console.log(`${label} PARSED EVENT COUNT:`, parsed.length);

    return parsed;
  } catch (error) {
    console.error(`${label} model call failed:`, error);
    return [];
  }
}

function normalizeEventType(
  eventType: string,
  title: string
): TimelineEventResult["eventType"] {
  const validTypes = new Set([
    "incident",
    "symptom",
    "diagnosis",
    "treatment",
    "appointment",
    "billing",
    "report",
    "communication",
    "observation",
    "other",
  ]);

  if (validTypes.has(eventType)) {
    if (eventType === "other") {
      const t = title.toLowerCase();

      if (
        t.includes("feeding") ||
        t.includes("formula") ||
        t.includes("iv fluids") ||
        t.includes("hydration") ||
        t.includes("medication") ||
        t.includes("therapy") ||
        t.includes("treatment") ||
        t.includes("procedure")
      ) {
        return "treatment";
      }

      if (
        t.includes("diagnosed") ||
        t.includes("diagnosis") ||
        t.includes("impression")
      ) {
        return "diagnosis";
      }

      if (
        t.includes("follow-up") ||
        t.includes("visit") ||
        t.includes("appointment")
      ) {
        return "appointment";
      }
    }

    return eventType;
  }

  return "other";
}

function normalizeEvents(items: unknown[]): TimelineEventResult[] {
  return items
    .filter((item): item is Record<string, unknown> => {
      return !!item && typeof item === "object";
    })
    .map((item) => {
      const title =
        typeof item.title === "string" && item.title.trim()
          ? item.title.trim()
          : "Untitled event";

      const description =
        typeof item.description === "string" && item.description.trim()
          ? item.description.trim()
          : undefined;

      const rawEventType =
        typeof item.eventType === "string" && item.eventType.trim()
          ? item.eventType.trim().toLowerCase()
          : "other";

      const eventType = normalizeEventType(rawEventType, title);

      const confidence =
        typeof item.confidence === "number"
          ? Math.max(0, Math.min(1, item.confidence))
          : 0.75;

      const date =
        typeof item.date === "string" && item.date.trim()
          ? item.date.trim()
          : "UNKNOWN";

      const dateType =
        typeof item.dateType === "string" && item.dateType.trim()
          ? item.dateType.trim()
          : undefined;

      const sourcePage =
        typeof item.sourcePage === "number" &&
        Number.isInteger(item.sourcePage) &&
        item.sourcePage > 0
          ? item.sourcePage
          : undefined;

      const sourceExcerpt =
        typeof item.sourceExcerpt === "string" && item.sourceExcerpt.trim()
          ? item.sourceExcerpt.trim()
          : undefined;

      const physicianName =
        typeof item.physicianName === "string" && item.physicianName.trim()
          ? item.physicianName.trim()
          : undefined;

      const physicianRole =
        typeof item.physicianRole === "string" && item.physicianRole.trim()
          ? item.physicianRole.trim()
          : undefined;

      const medicalFacility =
        typeof item.medicalFacility === "string" && item.medicalFacility.trim()
          ? item.medicalFacility.trim()
          : undefined;

      const facilityType =
        typeof item.facilityType === "string" && item.facilityType.trim()
          ? item.facilityType.trim()
          : undefined;

      return {
        date,
        dateType,
        title,
        description,
        eventType,
        confidence,
        sourcePage,
        sourceExcerpt,
        physicianName,
        physicianRole,
        medicalFacility,
        facilityType,
      };
    })
    .filter((event) => {
      if (!event.title.trim()) return false;
      if (event.title.toLowerCase() === "untitled event") return false;
      return true;
    });
}
function cleanTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isJunkPhysician(name?: string): boolean {
  if (!name) return true;

  const n = name.toLowerCase().trim();

  return (
    n.length < 4 ||
    ["physician", "doctor", "provider", "md", "do", "pa", "np", "rn"].includes(n) ||
    /^[a-z]{1,3}$/.test(n)
  );
}

function isJunkFacility(name?: string): boolean {
  if (!name) return true;

  const n = name.toLowerCase();

  return (
    n.length < 4 ||
    ["hospital", "clinic", "center", "facility"].includes(n)
  );
}

function isHardLowValueEvent(event: TimelineEventResult): boolean {
  const text = `${event.title} ${event.description || ""}`.toLowerCase();

  const hardBlock = [
    "performed",
    "completed",
    "resulted",
    "ordered",
    "specimen collected",
    "lab collected",
    "electronically signed",
    "dictated",
    "reviewed and signed",
    "normal exam",
    "no acute distress",
    "vital signs",
    "monitoring",
    "follow up in",
  ];

  return hardBlock.some((p) => text.includes(p));
}

function enforceDataQuality(
  events: TimelineEventResult[]
): TimelineEventResult[] {
  return events.map((e) => ({
    ...e,
    physicianName: isJunkPhysician(e.physicianName)
      ? undefined
      : e.physicianName,
    medicalFacility: isJunkFacility(e.medicalFacility)
      ? undefined
      : e.medicalFacility,
  }));
}

function isValidDate(date: string): boolean {
  if (date === "UNKNOWN") return true;

  const d = new Date(date);
  return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(date);
}
function dedupeEvents(events: TimelineEventResult[]): TimelineEventResult[] {
  const map = new Map<string, TimelineEventResult>();

  for (const event of events) {
    const title = cleanTitle(event.title);
    const key = `${event.date}|${title}`;

    if (!map.has(key)) {
      map.set(key, event);
      continue;
    }

    const existing = map.get(key)!;

    const better =
      (event.confidence ?? 0) > (existing.confidence ?? 0) ||
      (event.description?.length ?? 0) > (existing.description?.length ?? 0);

    if (better) {
      map.set(key, event);
    }
  }

  return Array.from(map.values());
}

function sortEvents(events: TimelineEventResult[]): TimelineEventResult[] {
  return [...events].sort((a, b) => {
    if (a.date === "UNKNOWN" && b.date === "UNKNOWN") return 0;
    if (a.date === "UNKNOWN") return 1;
    if (b.date === "UNKNOWN") return -1;

    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();

    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;

    return aTime - bTime;
  });
}

function isLowValueEvent(event: TimelineEventResult): boolean {
  if ((event.confidence ?? 0) < 0.6) return true;

  if (isHardLowValueEvent(event)) return true;

  const text = `${event.title} ${event.description || ""}`.toLowerCase();

  const softBlock = [
    "noted",
    "reviewed",
    "measured",
    "appears well",
    "stable",
  ];

  return softBlock.some((p) => text.includes(p));
}

function chunkPages(
  pages: PageText[],
  maxPagesPerChunk = 8,
  maxCharsPerChunk = 14000
): PageText[][] {
  const chunks: PageText[][] = [];
  let currentChunk: PageText[] = [];
  let currentChars = 0;

  for (const page of pages) {
    const pageText = page.text || "";
    const pageChars = pageText.length;

    const wouldOverflowPages = currentChunk.length >= maxPagesPerChunk;
    const wouldOverflowChars =
      currentChunk.length > 0 && currentChars + pageChars > maxCharsPerChunk;

    if (wouldOverflowPages || wouldOverflowChars) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentChars = 0;
    }

    currentChunk.push(page);
    currentChars += pageChars;
  }

  if (currentChunk.length) {
    chunks.push(currentChunk);
  }

  return chunks;
} // <-- this brace must be here
function buildChunkText(pages: PageText[]): string {
  return pages
    .map((p) => `--- PAGE ${p.page} ---\n${(p.text || "").trim()}`)
    .join("\n\n");
}
export async function extractTimelineEvents(
  pageTexts: { page: number; text: string }[]
): Promise<TimelineEventResult[]> {
  if (!Array.isArray(pageTexts) || !pageTexts.length) return [];

  const usablePages = pageTexts.filter(
    (p) =>
      p &&
      typeof p.page === "number" &&
      typeof p.text === "string" &&
      p.text.trim()
  );

  if (!usablePages.length) {
    console.log("Timeline extraction skipped: no usable page text.");
    return [];
  }

  const chunks = chunkPages(usablePages);

  console.log("====================================");
  console.log("AI TIMELINE FUNCTION HIT");
  console.log("PAGES RECEIVED:", usablePages.length);
  console.log("CHUNKS CREATED:", chunks.length);
  console.log(
    "CHUNK PAGE RANGES:",
    chunks.map((chunk) => ({
      startPage: chunk[0]?.page,
      endPage: chunk[chunk.length - 1]?.page,
      pages: chunk.length,
    }))
  );

  try {
    const allPrimaryEvents: TimelineEventResult[] = [];
    const allSecondaryEvents: TimelineEventResult[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkText = buildChunkText(chunk);

      console.log(
        `PROCESSING CHUNK ${i + 1}/${chunks.length} (${chunk[0]?.page}-${chunk[chunk.length - 1]?.page})`
      );
      console.log("CHUNK TEXT LENGTH:", chunkText.length);

      const primaryPrompt = buildPrimaryPrompt(chunkText);
      const secondaryPrompt = buildSecondaryPrompt(chunkText);

      const primaryRaw = await runExtraction(
        primaryPrompt,
        `PRIMARY CHUNK ${i + 1}`
      );
      const secondaryRaw = await runExtraction(
        secondaryPrompt,
        `SECONDARY CHUNK ${i + 1}`
      );

      const primaryEvents = normalizeEvents(primaryRaw);
      const secondaryEvents = normalizeEvents(secondaryRaw);

      console.log(`PRIMARY CHUNK ${i + 1} NORMALIZED:`, primaryEvents.length);
      console.log(`SECONDARY CHUNK ${i + 1} NORMALIZED:`, secondaryEvents.length);

      allPrimaryEvents.push(...primaryEvents);
      allSecondaryEvents.push(...secondaryEvents);
    }

    const combined = [...allPrimaryEvents, ...allSecondaryEvents];
    const deduped = dedupeEvents(combined);
    const qualityCleaned = enforceDataQuality(deduped);
    const dateCleaned = qualityCleaned.filter((e) => isValidDate(e.date));
    const filtered = dateCleaned.filter((event) => !isLowValueEvent(event));
    const sorted = sortEvents(filtered);

    const prioritized = [...sorted].sort((a, b) => {
      const aTime =
        a.date === "UNKNOWN"
          ? Number.MAX_SAFE_INTEGER
          : new Date(a.date).getTime();
      const bTime =
        b.date === "UNKNOWN"
          ? Number.MAX_SAFE_INTEGER
          : new Date(b.date).getTime();

      if (aTime !== bTime) return aTime - bTime;

      const priority = (e: TimelineEventResult) => {
        if (e.eventType === "treatment") return 5;
        if (e.eventType === "diagnosis") return 4;
        if (e.eventType === "appointment") return 3;
        if (e.eventType === "report") return 2;
        if (e.eventType === "symptom") return 1;
        return 0;
      };

      return priority(b) - priority(a);
    });

    const finalEvents = prioritized.slice(0, 25);

    console.log("🧠 Timeline Events Extracted:");
    console.log("Primary Events:", allPrimaryEvents.length);
    console.log("Secondary Events:", allSecondaryEvents.length);
    console.log("Combined:", combined.length);
    console.log("After Dedupe:", deduped.length);
    console.log("After Quality Clean:", qualityCleaned.length);
    console.log("After Date Clean:", dateCleaned.length);
    console.log("After Filter:", filtered.length);
    console.log("Final (prioritized + capped):", finalEvents.length);
    console.log(JSON.stringify(finalEvents, null, 2));
    console.log("====================================");

    return finalEvents;
  } catch (error) {
    console.error("Timeline extraction failed:", error);
    return [];
  }
}
