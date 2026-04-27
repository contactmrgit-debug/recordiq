type TraceEventLike = {
  title?: string | null;
  date?: string | null;
  eventType?: string | null;
  sourcePage?: number | null;
  description?: string | null;
  sourceExcerpt?: string | null;
  physicianName?: string | null;
  providerName?: string | null;
  medicalFacility?: string | null;
};

type PageTextLike = {
  page: number;
  text: string;
};

type TraceTarget = {
  label: string;
  eventMatcher: (title: string) => boolean;
  pageAnchors: string[];
};

const TRACE_ENABLED = process.env.TIMELINE_SOURCE_PAGE_TRACE === "1";

const TRACE_TARGETS: TraceTarget[] = [
  {
    label: "C2 fracture with vertebral foramen extension",
    eventMatcher: (title) =>
      /c2 fracture with vertebral foramen extension/i.test(title) ||
      (/c2/.test(title) && /vertebral foramen/.test(title)) ||
      (/c2/.test(title) && /fracture/.test(title) && /vertebral/.test(title)),
    pageAnchors: ["c2", "facet", "lamina", "vertebral", "foramen", "fracture"],
  },
  {
    label: "Nondisplaced left scapular fracture",
    eventMatcher: (title) =>
      /nondisplaced left scapular fracture/i.test(title) ||
      (/scapular/.test(title) && /fracture/.test(title)) ||
      (/left/.test(title) && /scapula/.test(title)),
    pageAnchors: ["scapular", "scapula", "humerus", "fracture", "left shoulder"],
  },
  {
    label: "Grouped medications",
    eventMatcher: (title) => /grouped medications/i.test(title),
    pageAnchors: [
      "hydromorphone",
      "ondansetron",
      "ketorolac",
      "acetaminophen",
      "tdap",
      "medication",
    ],
  },
  {
    label: "Transferred to Shannon by air transport",
    eventMatcher: (title) =>
      /transferred to shannon by air transport/i.test(title) ||
      (/transfer/.test(title) && /shannon/.test(title)) ||
      (/air/.test(title) && /transport/.test(title) && /shannon/.test(title)),
    pageAnchors: ["transfer", "shannon", "accepted", "accepting", "higher level", "air"],
  },
];

function normalizeText(value?: string | null): string {
  return (value || "")
    .toLowerCase()
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\w\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function snippet(text: string, anchor: string): string {
  const normalized = normalizeText(text);
  const index = normalized.indexOf(anchor);

  if (index < 0) {
    return text.slice(0, 180);
  }

  const start = Math.max(0, index - 80);
  const end = Math.min(text.length, index + anchor.length + 120);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function traceTargetEvent(stage: string, target: TraceTarget, event: TraceEventLike) {
  const normalizedTitle = normalizeText(event.title);
  if (!target.eventMatcher(normalizedTitle)) return;

  console.info("[SOURCE_PAGE_TRACE]", {
    stage,
    title: event.title,
    date: event.date ?? null,
    eventType: event.eventType ?? null,
    sourcePage: event.sourcePage ?? null,
    physicianName: event.physicianName ?? null,
    providerName: event.providerName ?? null,
    medicalFacility: event.medicalFacility ?? null,
    description: event.description ?? null,
    sourceExcerpt: event.sourceExcerpt ?? null,
  });
}

export function traceSourcePageEvents(stage: string, events: TraceEventLike[]): void {
  if (!TRACE_ENABLED) return;

  for (const target of TRACE_TARGETS) {
    for (const event of events) {
      traceTargetEvent(stage, target, event);
    }
  }
}

export function traceSourcePagePageTexts(
  stage: string,
  pageTexts: PageTextLike[]
): void {
  if (!TRACE_ENABLED) return;

  for (const target of TRACE_TARGETS) {
    const matches = pageTexts
      .map((pageText) => {
        const normalized = normalizeText(pageText.text);
        let score = 0;
        let firstAnchor = "";

        for (const anchor of target.pageAnchors) {
          if (normalized.includes(anchor)) {
            score += 1;
            if (!firstAnchor) firstAnchor = anchor;
          }
        }

        if (!score) return null;

        return {
          page: pageText.page,
          score,
          snippet: snippet(pageText.text, firstAnchor || target.pageAnchors[0]),
        };
      })
      .filter((value): value is { page: number; score: number; snippet: string } => Boolean(value))
      .sort((a, b) => b.score - a.score || a.page - b.page)
      .slice(0, 6);

    if (matches.length === 0) continue;

    console.info("[SOURCE_PAGE_TRACE]", {
      stage,
      title: target.label,
      pageMatches: matches,
    });
  }
}
