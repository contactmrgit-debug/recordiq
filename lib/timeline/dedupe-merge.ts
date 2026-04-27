export type TimelineEventInput = {
  date: string; // YYYY-MM-DD or "UNKNOWN"
  title: string;
  description?: string;
  eventType?: string;
  confidence?: number;
  sourcePage?: number;
  physicianName?: string;
  medicalFacility?: string;
};

function normalizeText(value: string): string {
  return (value || "")
    .toLowerCase()
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\w\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(title: string): string {
  return normalizeText(title)
    .replace(/\b(patient|pt)\b/g, "")
    .replace(/\bwas|is|noted|reported\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildEventKey(event: TimelineEventInput): string {
  const date = event.date || "UNKNOWN";
  const title = normalizeTitle(event.title);
  return `${date}|${title}`;
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const aWords = new Set(a.split(" ").filter(Boolean));
  const bWords = new Set(b.split(" ").filter(Boolean));

  const intersection = [...aWords].filter((word) => bWords.has(word)).length;
  const union = new Set([...aWords, ...bWords]).size;

  return union === 0 ? 0 : intersection / union;
}

function shouldMerge(a: TimelineEventInput, b: TimelineEventInput): boolean {
  if ((a.date || "UNKNOWN") !== (b.date || "UNKNOWN")) return false;

  const t1 = normalizeTitle(a.title);
  const t2 = normalizeTitle(b.title);

  if (!t1 || !t2) return false;
  if (t1 === t2) return true;

  const sim = similarity(t1, t2);
  if (sim >= 0.8) return true;

  const keyA = buildEventKey(a);
  const keyB = buildEventKey(b);
  return keyA === keyB;
}

function mergeDescriptions(a?: string, b?: string): string {
  const parts = [a, b]
    .filter((v): v is string => Boolean(v && v.trim()))
    .map((v) => v.trim());

  const seen = new Set<string>();
  const unique: string[] = [];

  for (const part of parts) {
    const normalized = normalizeText(part);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(part);
  }

  return unique.join(" | ");
}

function resolveEventType(a?: string, b?: string): string {
  if (!a && !b) return "other";
  if (!a) return b || "other";
  if (!b) return a;

  if (a === "other") return b;
  if (b === "other") return a;

  return a;
}
function pickBetterString(a?: string, b?: string): string | undefined {
  if (a && b) {
    return b.length > a.length ? b : a;
  }
  return a || b || undefined;
}

function mergeEvents(
  a: TimelineEventInput,
  b: TimelineEventInput
): TimelineEventInput {
  const aScore = (a.title?.length || 0) + (a.description?.length || 0);
  const bScore = (b.title?.length || 0) + (b.description?.length || 0);

  return {
    ...a,
    title: bScore > aScore ? b.title : a.title,
    description: mergeDescriptions(a.description, b.description),
    confidence: Math.max(a.confidence ?? 0, b.confidence ?? 0),
    sourcePage: a.sourcePage ?? b.sourcePage,
    physicianName: pickBetterString(a.physicianName, b.physicianName),
    medicalFacility: pickBetterString(a.medicalFacility, b.medicalFacility),
    eventType: resolveEventType(a.eventType, b.eventType),
  };
}

export function dedupeAndMergeEvents(
  events: TimelineEventInput[]
): TimelineEventInput[] {
  const result: TimelineEventInput[] = [];

  for (const event of events) {
    let merged = false;

    for (let i = 0; i < result.length; i++) {
      if (shouldMerge(result[i], event)) {
        result[i] = mergeEvents(result[i], event);
        merged = true;
        break;
      }
    }

    if (!merged) {
      result.push(event);
    }
  }

  return result;
}
