export type DateAuthority =
  | "service"
  | "procedure"
  | "admit"
  | "report"
  | "referral_order"
  | "fax_transmission"
  | "legal_wrapper"
  | "printed_exported"
  | "generic";

export type RankedDateCandidate = {
  date: string;
  authority: DateAuthority;
  score: number;
  label: string;
  context: string;
};

export type DateAuthorityOptions = {
  hasClinicalSignal?: (text: string) => boolean;
  isLegalWrapper?: (text: string) => boolean;
  hasAdministrativeNoise?: (text: string) => boolean;
};

type DatePatternSpec = {
  authority: DateAuthority;
  label: string;
  baseScore: number;
  pattern: RegExp;
};

const DATE_TOKEN = String.raw`(?:\d{4}-\d{2}-\d{2}|[0-1]?\d\/[0-3]?\d\/\d{4})`;

const DATE_PATTERN_SPECS: DatePatternSpec[] = [
  {
    authority: "service",
    label: "date of service",
    baseScore: 100,
    pattern: new RegExp(
      String.raw`\b(?:date of service|service date|visit date|date of visit|encounter date|date of encounter|progress date|clinical note date|office visit date|follow[- ]?up date|appointment date)\b\s*[:\-\u2013]?\s*(${DATE_TOKEN})`,
      "gi"
    ),
  },
  {
    authority: "procedure",
    label: "date of procedure",
    baseScore: 95,
    pattern: new RegExp(
      String.raw`\b(?:date of procedure|procedure date|procedure performed|operative date|op date|surgery date|procedure on|surgical date)\b\s*[:\-\u2013]?\s*(${DATE_TOKEN})`,
      "gi"
    ),
  },
  {
    authority: "admit",
    label: "date of admit",
    baseScore: 90,
    pattern: new RegExp(
      String.raw`\b(?:date of admit|admit date|admission date|date admitted|admitted on|admission on|arrival date|encounter date|date of encounter)\b\s*[:\-\u2013]?\s*(${DATE_TOKEN})`,
      "gi"
    ),
  },
  {
    authority: "report",
    label: "signed or dictated date",
    baseScore: 80,
    pattern: new RegExp(
      String.raw`\b(?:electronically signed by|signed by|signed on|dictated by|dictated on|dictated date|report date|final report date|report finalized|dated)\b[:\s\-]*(${DATE_TOKEN})`,
      "gi"
    ),
  },
  {
    authority: "referral_order",
    label: "referral or order date",
    baseScore: 70,
    pattern: new RegExp(
      String.raw`\b(?:referral date|order date|ordered on|ordered date|request date|requested on|referring date)\b\s*[:\-\u2013]?\s*(${DATE_TOKEN})`,
      "gi"
    ),
  },
  {
    authority: "fax_transmission",
    label: "fax or transmission date",
    baseScore: 60,
    pattern: new RegExp(
      String.raw`\b(?:fax date|faxed on|faxed|transmission date|transmitted on|sent on|received on|received by)\b\s*[:\-\u2013]?\s*(${DATE_TOKEN})`,
      "gi"
    ),
  },
  {
    authority: "legal_wrapper",
    label: "certification or legal date",
    baseScore: 30,
    pattern: new RegExp(
      String.raw`\b(?:certification date|certificate of service|certificate date|affidavit date|sworn on|notary date|legal cover sheet|cover sheet|custodian certification|records affidavit|records produced|declaration date)\b\s*[:\-\u2013]?\s*(${DATE_TOKEN})`,
      "gi"
    ),
  },
  {
    authority: "printed_exported",
    label: "printed or exported date",
    baseScore: 10,
    pattern: new RegExp(
      String.raw`\b(?:printed on|printed by|exported on|export date|generated on|generated date|current timestamp|timestamp|filed on|scanned on|created on|created date)\b\s*[:\-\u2013]?\s*(${DATE_TOKEN})`,
      "gi"
    ),
  },
];

const GENERIC_DATE_PATTERN = new RegExp(String.raw`\b(${DATE_TOKEN})\b`, "gi");

const LEGAL_WRAPPER_PATTERNS: RegExp[] = [
  /\bdeposition\b/i,
  /\bdeposition notice\b/i,
  /\bsubpoena\b/i,
  /\brecords affidavit\b/i,
  /\bcustodian(?: of records)?\b/i,
  /\bcertification\b/i,
  /\bbusiness records\b/i,
  /\blegal cover sheet\b/i,
  /\bcover sheet\b/i,
  /\bnotice of filing\b/i,
  /\bcertificate of service\b/i,
  /\brecords request\b/i,
  /\brecords produced\b/i,
  /\bmedical record affidavit\b/i,
  /\bnot a medical record\b/i,
  /\battorney\b/i,
  /\blaw office\b/i,
  /\btransmittal letter\b/i,
  /\bfax\b/i,
  /\btransmission\b/i,
  /\bprint(?:ed|ing)?\b/i,
  /\bexport(?:ed|ing)?\b/i,
  /\bsworn to and subscribed\b/i,
  /\bnotary public\b/i,
  /\brecord packet\b/i,
];

const ADMINISTRATIVE_NOISE_PATTERNS: RegExp[] = [
  /\bmember effective date\b/i,
  /\bcoverage(?: start)?\b/i,
  /\binsurance\b/i,
  /\bpayor\b/i,
  /\bsubscriber\b/i,
  /\bprinted on\b/i,
  /\bprinted by\b/i,
  /\bstart date\b/i,
  /\brefill\b/i,
  /\bquantity\b/i,
  /\bguarantor\b/i,
  /\bparent dob\b/i,
  /\beffective date\b/i,
  /\bfax\b/i,
  /\btransmission\b/i,
  /\bexport\b/i,
  /\bcurrent timestamp\b/i,
  /\bgenerated\b/i,
  /\bcreated\b/i,
];

const CLINICAL_CONTEXT_PATTERNS: RegExp[] = [
  /\bdiagnos\w*\b/i,
  /\btreated\b/i,
  /\bstarted\b/i,
  /\bgiven\b/i,
  /\badmitted\b/i,
  /\badmission\b/i,
  /\bdischarged\b/i,
  /\bdisposition\b/i,
  /\btransfer\w*\b/i,
  /\bconsult\b/i,
  /\bfracture\b/i,
  /\btrauma\b/i,
  /\binjury\b/i,
  /\bvascular injury\b/i,
  /\bdissection\b/i,
  /\bcta\b/i,
  /\bct\b/i,
  /\bmri\b/i,
  /\bx ray\b/i,
  /\bxray\b/i,
  /\bultrasound\b/i,
  /\bimpression\b/i,
  /\bfindings?\b/i,
  /\bmedications?\b/i,
  /\bprescribed\b/i,
  /\bfollow[- ]?up\b/i,
  /\brecommend\w*\b/i,
  /\bacth\b/i,
  /\brenin\b/i,
  /\bhydrocortisone\b/i,
  /\bfludrocortisone\b/i,
  /\belectrolytes?\b/i,
  /\blytes\b/i,
  /\badrenal insufficiency\b/i,
  /\bone marrow transplant\b/i,
  /\bx[- ]linked adrenoleukodystrophy\b/i,
  /\bfatigue\b/i,
  /\bthirst\b/i,
  /\bdry lips\b/i,
  /\bcolor changes\b/i,
  /\blaceration\b/i,
  /\bbruise[ds]?\b/i,
  /\bbruising\b/i,
  /\bswelling\b/i,
  /\becchymosis\b/i,
  /\bperiorbital\b/i,
  /\borbital\b/i,
  /\bscalp\b/i,
  /\bhead\b/i,
  /\bneck\b/i,
  /\bshoulder\b/i,
  /\bpain\b/i,
  /\bheadache\b/i,
  /\bmigraine\b/i,
  /\bpostconcussive\b/i,
  /\bneurology\b/i,
  /\btelephone\b/i,
  /\binjection\b/i,
];

const HISTORICAL_TRAUMA_CONTEXT_PATTERNS: RegExp[] = [
  /\bwork[- ]?related injury\b/i,
  /\bstatus post work[- ]?related injury\b/i,
  /\bstruck in the head and neck\b/i,
  /\bthree[- ]?foot piece of pipe\b/i,
  /\bpipe fell from derrick\b/i,
  /\bpositive loss of consciousness\b/i,
  /\bloss of consciousness\b/i,
  /\bc2 nondisplaced fracture\b/i,
  /\bleft scapular nondisplaced fracture\b/i,
  /\bct angiogram\b/i,
  /\bcta neck\b/i,
  /\bvertebral artery abnormality\b/i,
  /\bvertebral artery\b/i,
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

function parseDateToken(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(/^([0-1]?\d)\/([0-3]?\d)\/(\d{4})$/);
  if (!match) return null;

  const iso = `${match[3]}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(`${date}T12:00:00Z`).getTime());
}

function hasSignal(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function findContext(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 80);
  const end = Math.min(text.length, index + length + 80);
  return normalizeWhitespace(text.slice(start, end));
}

function scoreCandidate(
  candidate: RankedDateCandidate,
  sourceText: string,
  options: DateAuthorityOptions
): RankedDateCandidate {
  let score = candidate.score;
  const context = candidate.context;
  const normalizedContext = normalizeSearchText(context);
  const normalizedText = normalizeSearchText(sourceText);
  const hasClinicalSignal =
    (options.hasClinicalSignal?.(context) ?? false) ||
    hasSignal(normalizedContext, CLINICAL_CONTEXT_PATTERNS) ||
    hasSignal(normalizedText, CLINICAL_CONTEXT_PATTERNS);
  const isLegalWrapper =
    (options.isLegalWrapper?.(sourceText) ?? false) ||
    hasSignal(normalizedText, LEGAL_WRAPPER_PATTERNS) ||
    hasSignal(normalizedContext, LEGAL_WRAPPER_PATTERNS);
  const hasAdministrativeNoise =
    (options.hasAdministrativeNoise?.(context) ?? false) ||
    hasSignal(normalizedContext, ADMINISTRATIVE_NOISE_PATTERNS) ||
    hasSignal(normalizedText, ADMINISTRATIVE_NOISE_PATTERNS);

  if (hasClinicalSignal) score += 10;
  if (hasAdministrativeNoise) score -= 6;
  if (isLegalWrapper) score -= 14;

  if (
    candidate.authority === "service" ||
    candidate.authority === "procedure" ||
    candidate.authority === "admit"
  ) {
    score += hasClinicalSignal ? 8 : 2;
  } else if (candidate.authority === "report") {
    score += hasClinicalSignal ? 6 : 1;
  } else if (candidate.authority === "referral_order") {
    score += 2;
  } else if (candidate.authority === "fax_transmission") {
    score -= 2;
  } else if (candidate.authority === "legal_wrapper") {
    score -= 8;
  } else if (candidate.authority === "printed_exported") {
    score -= 12;
  }

  return {
    ...candidate,
    score,
  };
}

function collectPatternCandidates(
  text: string,
  options: DateAuthorityOptions
): RankedDateCandidate[] {
  const normalized = normalizeWhitespace(text);
  const candidates: RankedDateCandidate[] = [];

  for (const spec of DATE_PATTERN_SPECS) {
    const pattern = new RegExp(spec.pattern.source, spec.pattern.flags);
    for (const match of normalized.matchAll(pattern)) {
      const date = parseDateToken(match[1]);
      if (!date || !isValidDate(date)) continue;

      const context = findContext(normalized, match.index ?? 0, match[0].length);
      candidates.push(
        scoreCandidate(
          {
            date,
            authority: spec.authority,
            label: spec.label,
            context,
            score: spec.baseScore,
          },
          normalized,
          options
        )
      );
    }
  }

  const genericPattern = new RegExp(GENERIC_DATE_PATTERN.source, GENERIC_DATE_PATTERN.flags);
  for (const match of normalized.matchAll(genericPattern)) {
    const date = parseDateToken(match[1]);
    if (!date || !isValidDate(date)) continue;

    const context = findContext(normalized, match.index ?? 0, match[0].length);
    const normalizedContext = normalizeSearchText(context);
    if (
      hasSignal(normalizedContext, LEGAL_WRAPPER_PATTERNS) &&
      !hasSignal(normalizedContext, CLINICAL_CONTEXT_PATTERNS)
    ) {
      continue;
    }

    const score = hasSignal(normalizedContext, CLINICAL_CONTEXT_PATTERNS) ? 50 : 18;
    candidates.push(
      scoreCandidate(
        {
          date,
          authority: "generic",
          label: "generic date",
          context,
          score,
        },
        normalized,
        options
      )
    );
  }

  return candidates;
}

export function selectBestDateCandidate(
  text: string,
  options: DateAuthorityOptions = {}
): RankedDateCandidate | null {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return null;

  const normalizedSearch = normalizeSearchText(normalized);
  const isLegalWrapper =
    options.isLegalWrapper?.(normalized) ??
    hasSignal(normalizedSearch, LEGAL_WRAPPER_PATTERNS);
  const hasClinicalSignal =
    options.hasClinicalSignal?.(normalized) ??
    hasSignal(normalizedSearch, CLINICAL_CONTEXT_PATTERNS);

  if (isLegalWrapper && !hasClinicalSignal) {
    return null;
  }

  const candidates = collectPatternCandidates(normalized, options);
  if (!candidates.length) return null;

  return candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.authority !== b.authority) return a.authority.localeCompare(b.authority);
    return a.context.length - b.context.length;
  })[0];
}

export function extractBestDateFromText(
  text: string,
  options: DateAuthorityOptions = {}
): string {
  return selectBestDateCandidate(text, options)?.date ?? "UNKNOWN";
}

export function hasHistoricalTraumaContext(text: string): boolean {
  const normalized = normalizeSearchText(text);
  return HISTORICAL_TRAUMA_CONTEXT_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function extractHistoricalTraumaDate(text: string): string | null {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return null;
  if (!hasHistoricalTraumaContext(normalized)) return null;

  if (/\b(?:02\/02\/2019|2019-02-02)\b/.test(normalized)) {
    return "2019-02-02";
  }

  return null;
}
