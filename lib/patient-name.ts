const PATIENT_NAME_SEARCH_LIMIT = 12000;

const NAME_BODY = "([A-Za-z][A-Za-z'.-]*(?:\\s+[A-Za-z][A-Za-z'.-]*){1,5})";

type PatientNamePattern = {
  pattern: RegExp;
  priority: number;
};

const PATIENT_NAME_PATTERNS: PatientNamePattern[] = [
  {
    pattern: new RegExp(
      String.raw`(?:^|[\s\(\[\{>])(?:patient name)\s*:\s*${NAME_BODY}`,
      "i"
    ),
    priority: 4,
  },
  {
    pattern: new RegExp(
      String.raw`(?:^|[\s\(\[\{>])(?:patient name)\s*-\s*${NAME_BODY}`,
      "i"
    ),
    priority: 4,
  },
  {
    pattern: new RegExp(
      String.raw`(?:^|[\s\(\[\{>])(?:patient)\s*:\s*${NAME_BODY}`,
      "i"
    ),
    priority: 3,
  },
  {
    pattern: new RegExp(
      String.raw`(?:^|[\s\(\[\{>])(?:patient)\s*-\s*${NAME_BODY}`,
      "i"
    ),
    priority: 3,
  },
  {
    pattern: new RegExp(
      String.raw`(?:^|[\s\(\[\{>])(?:name)\s*:\s*${NAME_BODY}`,
      "i"
    ),
    priority: 2,
  },
  {
    pattern: new RegExp(
      String.raw`(?:^|[\s\(\[\{>])(?:name)\s*-\s*${NAME_BODY}`,
      "i"
    ),
    priority: 2,
  },
  {
    pattern: new RegExp(
      String.raw`(?:^|[\s\(\[\{>])${NAME_BODY}\s*(?:,)?\s*(?:dob|date of birth)\b`,
      "i"
    ),
    priority: 5,
  },
  {
    pattern: new RegExp(
      String.raw`(?:^|[\s\(\[\{>])(?:re)\s*:\s*${NAME_BODY}`,
      "i"
    ),
    priority: 1,
  },
  {
    pattern: new RegExp(
      String.raw`(?:^|[\s\(\[\{>])(?:re)\s*-\s*${NAME_BODY}`,
      "i"
    ),
    priority: 1,
  },
  {
    pattern: new RegExp(
      String.raw`(?:^|[\s\(\[\{>])(?:regarding)\s*:\s*${NAME_BODY}`,
      "i"
    ),
    priority: 0,
  },
  {
    pattern: new RegExp(
      String.raw`(?:^|[\s\(\[\{>])(?:regarding)\s*-\s*${NAME_BODY}`,
      "i"
    ),
    priority: 0,
  },
];

const PATIENT_NAME_STOP_PATTERNS = [
  /\bdate of birth\b/i,
  /\bdob\b/i,
  /\bmrn\b/i,
  /\bmedical record number\b/i,
  /\baccount\b/i,
  /\bacct\b/i,
  /\bclaim\b/i,
  /\bphone\b/i,
  /\btel\b/i,
  /\bfax\b/i,
  /\bssn\b/i,
  /\bmember\b/i,
  /\bid\b/i,
];

const PLACEHOLDER_PATIENT_NAMES = new Set([
  "unnamed patient",
  "unnamed case",
  "our client",
  "the client",
  "client",
  "unknown patient",
  "patient",
  "the patient",
  "new patient",
  "claimant",
  "the claimant",
  "member",
  "insured",
  "subscriber",
  "your patient",
  "your client",
  "not specified",
  "unknown",
  "n/a",
  "na",
  "none",
]);

const DISALLOWED_PATIENT_NAME_PHRASES = [
  "our client",
  "the client",
  "client",
  "patient",
  "the patient",
  "claimant",
  "the claimant",
  "member",
  "insured",
  "subscriber",
  "your patient",
  "your client",
  "medical records",
  "discharge summary",
  "patient information",
  "date of birth",
  "dob",
  "account",
  "claim",
  "unknown",
  "n/a",
];

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function removeTrailingNoise(value: string): string {
  return value.replace(/[\s,;|\-]+$/g, "").trim();
}

function stripDemographicFragments(value: string): string {
  let candidate = value;

  for (const pattern of PATIENT_NAME_STOP_PATTERNS) {
    const match = candidate.match(pattern);
    if (match?.index === undefined) continue;
    candidate = candidate.slice(0, match.index).trim();
  }

  return candidate;
}

function toTitleCaseSimple(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) =>
      word
        .split("-")
        .map((part) => {
          if (!part) return part;
          if (/^[A-Z]{2,}$/.test(part)) {
            return part.charAt(0) + part.slice(1).toLowerCase();
          }

          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("-")
    )
    .join(" ");
}

function normalizeCandidateName(value: string): string | null {
  let candidate = normalizeWhitespace(value);

  if (!candidate) return null;

  candidate = stripDemographicFragments(candidate);
  candidate = removeTrailingNoise(candidate);
  candidate = candidate.replace(/\s{2,}/g, " ").trim();

  if (!candidate) return null;

  const lowerCandidate = candidate.toLowerCase();
  if (
    DISALLOWED_PATIENT_NAME_PHRASES.some(
      (phrase) => lowerCandidate === phrase || lowerCandidate.includes(phrase)
    )
  ) {
    return null;
  }

  if (/[\d@#]/.test(candidate)) {
    return null;
  }

  if (candidate.length > 80) {
    return null;
  }

  const normalized =
    candidate === candidate.toUpperCase() ? toTitleCaseSimple(candidate) : candidate;

  return normalizeWhitespace(normalized);
}

type MatchedPatientCandidate = {
  priority: number;
  index: number;
  candidate: string;
};

function collectPatientNameCandidates(text: string): MatchedPatientCandidate[] {
  const candidates: MatchedPatientCandidate[] = [];

  for (const { pattern, priority } of PATIENT_NAME_PATTERNS) {
    const globalPattern = new RegExp(pattern.source, `${pattern.flags}g`);
    for (const match of text.matchAll(globalPattern)) {
      const rawCandidate = match[1];
      if (!rawCandidate) continue;

      const normalized = normalizeCandidateName(rawCandidate);
      if (!normalized) continue;

      candidates.push({
        priority,
        index: match.index ?? 0,
        candidate: normalized,
      });
    }
  }

  return candidates;
}

export function detectPatientNameFromText(text: string): string | null {
  const sample = text.slice(0, PATIENT_NAME_SEARCH_LIMIT).replace(/\r\n?/g, "\n");
  if (!sample) return null;

  const candidates = collectPatientNameCandidates(sample);
  if (!candidates.length) return null;

  candidates.sort((left, right) => {
    if (right.priority !== left.priority) {
      return right.priority - left.priority;
    }

    return left.index - right.index;
  });

  for (const candidate of candidates) {
    if (candidate.candidate) {
      return candidate.candidate;
    }
  }

  return null;
}

export function isPlaceholderPatientName(value?: string | null): boolean {
  const normalized = normalizeWhitespace(value || "").toLowerCase();
  if (!normalized) return true;

  return PLACEHOLDER_PATIENT_NAMES.has(normalized);
}

export function shouldReplaceSubjectName(
  currentSubjectName?: string | null
): boolean {
  return isPlaceholderPatientName(currentSubjectName);
}

export function shouldStoreDetectedPatientName(
  currentPatientName?: string | null,
  detectedPatientName?: string | null
): boolean {
  return Boolean(detectedPatientName) && shouldReplaceSubjectName(currentPatientName);
}
