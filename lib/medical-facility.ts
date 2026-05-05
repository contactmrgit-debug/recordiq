function normalizeWhitespace(value?: string | null): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizeFacilityKey(value?: string | null): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/\s*-\s*medical\b/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type FacilityPattern = {
  pattern: RegExp;
  facility: string;
  facilityType?: string;
};

const FACILITY_PATTERNS: FacilityPattern[] = [
  {
    pattern: /children'?s health/i,
    facility: "Children's Health",
    facilityType: "hospital",
  },
  {
    pattern: /dallas endocrinology/i,
    facility: "Dallas Endocrinology",
    facilityType: "clinic",
  },
  {
    pattern: /dallas laboratory/i,
    facility: "Dallas Laboratory",
    facilityType: "lab",
  },
  {
    pattern:
      /\bdallas\b.*\b1935 medical district drive\b|\b1935 medical district drive\b.*\bdallas\b/i,
    facility: "Dallas / 1935 Medical District Drive",
    facilityType: "clinic",
  },
  {
    pattern: /shannon medical center/i,
    facility: "Shannon Medical Center",
    facilityType: "hospital",
  },
  {
    pattern: /shannon er/i,
    facility: "Shannon ER",
    facilityType: "hospital",
  },
  {
    pattern: /reagan memorial hospital/i,
    facility: "Reagan Memorial Hospital",
    facilityType: "hospital",
  },
  {
    pattern: /reagan hospital district/i,
    facility: "Reagan Hospital District",
    facilityType: "hospital",
  },
  {
    pattern: /hickman rhc/i,
    facility: "Hickman RHC",
    facilityType: "clinic",
  },
];

export function detectMedicalFacilityFromText(text?: string | null): string | null {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return null;

  for (const candidate of FACILITY_PATTERNS) {
    if (candidate.pattern.test(normalized)) {
      return candidate.facility;
    }
  }

  return null;
}

export function detectMedicalFacilityTypeFromText(
  text?: string | null
): string | null {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return null;

  for (const candidate of FACILITY_PATTERNS) {
    if (candidate.pattern.test(normalized)) {
      return candidate.facilityType || null;
    }
  }

  return null;
}

export function resolveDisplayedMedicalFacility(input: {
  medicalFacility?: string | null;
  title?: string | null;
  description?: string | null;
}): string | null {
  const facility = normalizeWhitespace(input.medicalFacility);
  if (!facility) return null;

  const supportText = normalizeWhitespace(
    `${input.title || ""} ${input.description || ""}`
  );
  if (!supportText) return null;

  const detectedFacility = detectMedicalFacilityFromText(supportText);
  if (!detectedFacility) return null;

  if (normalizeFacilityKey(detectedFacility) !== normalizeFacilityKey(facility)) {
    return null;
  }

  return facility;
}
