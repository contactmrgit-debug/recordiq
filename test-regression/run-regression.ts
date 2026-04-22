import fs from "fs";
import path from "path";
import { extractTimelineEvents } from "../lib/ai-timeline";
import { cleanTimelineEvents, RawTimelineEvent } from "../lib/timeline-cleanup";

type ExpectedDateRule = {
  date: string;
  mustIncludeTitles?: string[];
  mustNotIncludeTitles?: string[];
  minEvents?: number;
  maxEvents?: number;
};

type ExpectedEventAssertion = {
  title: string;
  physicianName?: string | null;
  medicalFacility?: string | null;
  sourcePage?: number | null;
  eventType?: string | null;
};

type PageTextFixture = {
  page: number;
  text: string;
};

type ExpectedSpec = {
  documentName?: string;
  notes?: string;
  minEvents?: number;
  maxEvents?: number;
  minCleanedEvents?: number;
  maxCleanedEvents?: number;
  mustIncludeTitles?: string[];
  mustNotIncludeTitles?: string[];
  mustIncludeTitlePatterns?: string[];
  mustNotIncludeTitlePatterns?: string[];
  mustIncludeEventTypes?: string[];
  mustNotIncludeEventTypes?: string[];
  maxEventsOnDate?: Record<string, number>;
  minEventsOnDate?: Record<string, number>;
  maxEventsOnSameDate?: {
    date: string;
    max: number;
  };
  dateRules?: ExpectedDateRule[];
  mustIncludeProviderNames?: string[];
  mustNotIncludeProviderNames?: string[];
  mustIncludeMedicalFacilities?: string[];
  mustNotIncludeMedicalFacilities?: string[];
  eventAssertions?: ExpectedEventAssertion[];
  expectedTitlesInOrder?: string[];

  expectedCleanedCountMin?: number;
  expectedCleanedCountMax?: number;
  expectedRawGreaterThanCleaned?: boolean;
  expectedMaxEventsOnSingleDate?: number;
  expectedNoDuplicateNormalizedKeys?: boolean;
  mustKeepTitlePatterns?: string[];
};

type RegressionResult = {
  documentName: string;
  passed: boolean;
  errors: string[];
  rawEventCount: number;
  cleanedEventCount: number;
  cleanedEvents: RawTimelineEvent[];
};

function normalizeText(value?: string | null): string {
  return (value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function loadJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function isPageTextFixture(value: unknown): value is PageTextFixture[] {
  if (!Array.isArray(value) || value.length === 0) return false;

  return value.every(
    (item) =>
      !!item &&
      typeof item === "object" &&
      "page" in item &&
      "text" in item &&
      typeof (item as PageTextFixture).page === "number" &&
      typeof (item as PageTextFixture).text === "string"
  );
}

function assertCondition(condition: boolean, error: string, errors: string[]) {
  if (!condition) errors.push(error);
}

function countEventsOnDate(events: RawTimelineEvent[], date: string): number {
  return events.filter((e) => e.date === date).length;
}

function hasTitle(events: RawTimelineEvent[], title: string): boolean {
  const target = normalizeText(title);
  return events.some((e) => normalizeText(e.title) === target);
}

function hasEventType(events: RawTimelineEvent[], eventType: string): boolean {
  const target = normalizeText(eventType);
  return events.some((e) => normalizeText(e.eventType) === target);
}

function hasProviderName(events: RawTimelineEvent[], providerName: string): boolean {
  const target = normalizeText(providerName);
  return events.some(
    (e) =>
      normalizeText(e.providerName) === target ||
      normalizeText(e.physicianName) === target
  );
}

function hasMedicalFacility(
  events: RawTimelineEvent[],
  medicalFacility: string
): boolean {
  const target = normalizeText(medicalFacility);
  return events.some((e) => normalizeText(e.medicalFacility) === target);
}

function findEventByTitle(
  events: RawTimelineEvent[],
  title: string
): RawTimelineEvent | undefined {
  const target = normalizeText(title);
  return events.find((e) => normalizeText(e.title) === target);
}

function getEventTitles(events: RawTimelineEvent[]): string[] {
  return events.map((event) => normalizeText(event.title));
}

function normalizeTitleForKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMaxEventsOnSingleDate(events: RawTimelineEvent[]): number {
  const counts = new Map<string, number>();

  for (const event of events) {
    const dateKey = (event.date ?? "UNKNOWN").trim() || "UNKNOWN";
    counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
  }

  return counts.size > 0 ? Math.max(...counts.values()) : 0;
}

function hasDuplicateNormalizedKeys(events: RawTimelineEvent[]): boolean {
  const seen = new Set<string>();

  for (const event of events) {
    const date = (event.date ?? "UNKNOWN").trim().toUpperCase();
    const title = normalizeTitleForKey(event.title ?? "");
    const key = `${date}::${title}`;

    if (seen.has(key)) {
      return true;
    }

    seen.add(key);
  }

  return false;
}

function validateExpected(
  spec: ExpectedSpec,
  rawEvents: RawTimelineEvent[],
  cleanedEvents: RawTimelineEvent[],
  documentName: string
): RegressionResult {
  const errors: string[] = [];
  const minEvents = spec.minEvents ?? spec.minCleanedEvents;
  const maxEvents = spec.maxEvents ?? spec.maxCleanedEvents;

  if (typeof minEvents === "number") {
    assertCondition(
      cleanedEvents.length >= minEvents,
      `Expected at least ${minEvents} cleaned events, got ${cleanedEvents.length}`,
      errors
    );
  }

  if (typeof maxEvents === "number") {
    assertCondition(
      cleanedEvents.length <= maxEvents,
      `Expected at most ${maxEvents} cleaned events, got ${cleanedEvents.length}`,
      errors
    );
  }

  for (const title of spec.mustIncludeTitles ?? []) {
    assertCondition(
      hasTitle(cleanedEvents, title),
      `Missing required title: "${title}"`,
      errors
    );
  }

  for (const title of spec.mustNotIncludeTitles ?? []) {
    assertCondition(
      !hasTitle(cleanedEvents, title),
      `Found forbidden title: "${title}"`,
      errors
    );
  }

  for (const eventType of spec.mustIncludeEventTypes ?? []) {
    assertCondition(
      hasEventType(cleanedEvents, eventType),
      `Missing required event type: "${eventType}"`,
      errors
    );
  }

  for (const eventType of spec.mustNotIncludeEventTypes ?? []) {
    assertCondition(
      !hasEventType(cleanedEvents, eventType),
      `Found forbidden event type: "${eventType}"`,
      errors
    );
  }

  for (const providerName of spec.mustIncludeProviderNames ?? []) {
    assertCondition(
      hasProviderName(cleanedEvents, providerName),
      `Missing required provider/physician name: "${providerName}"`,
      errors
    );
  }

  for (const providerName of spec.mustNotIncludeProviderNames ?? []) {
    assertCondition(
      !hasProviderName(cleanedEvents, providerName),
      `Found forbidden provider/physician name: "${providerName}"`,
      errors
    );
  }

  for (const facility of spec.mustIncludeMedicalFacilities ?? []) {
    assertCondition(
      hasMedicalFacility(cleanedEvents, facility),
      `Missing required medical facility: "${facility}"`,
      errors
    );
  }

  for (const facility of spec.mustNotIncludeMedicalFacilities ?? []) {
    assertCondition(
      !hasMedicalFacility(cleanedEvents, facility),
      `Found forbidden medical facility: "${facility}"`,
      errors
    );
  }

  for (const [date, max] of Object.entries(spec.maxEventsOnDate ?? {})) {
    const count = countEventsOnDate(cleanedEvents, date);
    assertCondition(
      count <= max,
      `Expected at most ${max} events on ${date}, got ${count}`,
      errors
    );
  }

  if (spec.maxEventsOnSameDate) {
    const count = countEventsOnDate(cleanedEvents, spec.maxEventsOnSameDate.date);
    assertCondition(
      count <= spec.maxEventsOnSameDate.max,
      `Expected at most ${spec.maxEventsOnSameDate.max} events on ${spec.maxEventsOnSameDate.date}, got ${count}`,
      errors
    );
  }

  for (const [date, min] of Object.entries(spec.minEventsOnDate ?? {})) {
    const count = countEventsOnDate(cleanedEvents, date);
    assertCondition(
      count >= min,
      `Expected at least ${min} events on ${date}, got ${count}`,
      errors
    );
  }

  for (const rule of spec.dateRules ?? []) {
    const eventsOnDate = cleanedEvents.filter((e) => e.date === rule.date);

    if (typeof rule.minEvents === "number") {
      assertCondition(
        eventsOnDate.length >= rule.minEvents,
        `Expected at least ${rule.minEvents} events on ${rule.date}, got ${eventsOnDate.length}`,
        errors
      );
    }

    if (typeof rule.maxEvents === "number") {
      assertCondition(
        eventsOnDate.length <= rule.maxEvents,
        `Expected at most ${rule.maxEvents} events on ${rule.date}, got ${eventsOnDate.length}`,
        errors
      );
    }

    for (const title of rule.mustIncludeTitles ?? []) {
      assertCondition(
        eventsOnDate.some((e) => normalizeText(e.title) === normalizeText(title)),
        `On ${rule.date}, missing required title: "${title}"`,
        errors
      );
    }

    for (const title of rule.mustNotIncludeTitles ?? []) {
      assertCondition(
        !eventsOnDate.some((e) => normalizeText(e.title) === normalizeText(title)),
        `On ${rule.date}, found forbidden title: "${title}"`,
        errors
      );
    }
  }

  if (typeof spec.expectedCleanedCountMin === "number") {
    assertCondition(
      cleanedEvents.length >= spec.expectedCleanedCountMin,
      `Expected at least ${spec.expectedCleanedCountMin} cleaned events, got ${cleanedEvents.length}`,
      errors
    );
  }

  if (typeof spec.expectedCleanedCountMax === "number") {
    assertCondition(
      cleanedEvents.length <= spec.expectedCleanedCountMax,
      `Expected at most ${spec.expectedCleanedCountMax} cleaned events, got ${cleanedEvents.length}`,
      errors
    );
  }

  if (spec.expectedRawGreaterThanCleaned === true) {
    assertCondition(
      rawEvents.length > cleanedEvents.length,
      `Expected raw events (${rawEvents.length}) to be greater than cleaned events (${cleanedEvents.length})`,
      errors
    );
  }

  if (typeof spec.expectedMaxEventsOnSingleDate === "number") {
    const maxOnSingleDate = getMaxEventsOnSingleDate(cleanedEvents);

    assertCondition(
      maxOnSingleDate <= spec.expectedMaxEventsOnSingleDate,
      `Expected at most ${spec.expectedMaxEventsOnSingleDate} events on a single date, got ${maxOnSingleDate}`,
      errors
    );
  }

  if (spec.expectedNoDuplicateNormalizedKeys === true) {
    assertCondition(
      !hasDuplicateNormalizedKeys(cleanedEvents),
      "Expected no duplicate normalized cleaned events, but duplicates were found",
      errors
    );
  }

  for (const pattern of spec.mustKeepTitlePatterns ?? []) {
    const regex = new RegExp(pattern, "i");

    assertCondition(
      cleanedEvents.some((e) => regex.test(e.title ?? "")),
      `Expected cleaned events to include a title matching pattern: ${pattern}`,
      errors
    );
  }

  for (const pattern of spec.mustIncludeTitlePatterns ?? []) {
    const regex = new RegExp(pattern, "i");

    assertCondition(
      cleanedEvents.some((e) => regex.test(e.title ?? "")),
      `Expected cleaned events to include a title matching pattern: ${pattern}`,
      errors
    );
  }

  for (const pattern of spec.mustNotIncludeTitlePatterns ?? []) {
    const regex = new RegExp(pattern, "i");

    assertCondition(
      !cleanedEvents.some((e) => regex.test(e.title ?? "")),
      `Found forbidden title pattern in cleaned events: ${pattern}`,
      errors
    );
  }

  for (const assertion of spec.eventAssertions ?? []) {
    const event = findEventByTitle(cleanedEvents, assertion.title);

    assertCondition(
      Boolean(event),
      `Missing required event for assertion: "${assertion.title}"`,
      errors
    );

    if (!event) continue;

    if (assertion.physicianName !== undefined) {
      assertCondition(
        normalizeText(event.physicianName) === normalizeText(assertion.physicianName),
        `Event "${assertion.title}" expected physicianName "${assertion.physicianName}", got "${event.physicianName ?? ""}"`,
        errors
      );
    }

    if (assertion.medicalFacility !== undefined) {
      assertCondition(
        normalizeText(event.medicalFacility) === normalizeText(assertion.medicalFacility),
        `Event "${assertion.title}" expected medicalFacility "${assertion.medicalFacility}", got "${event.medicalFacility ?? ""}"`,
        errors
      );
    }

    if (assertion.sourcePage !== undefined) {
      assertCondition(
        (event.sourcePage ?? null) === assertion.sourcePage,
        `Event "${assertion.title}" expected sourcePage "${assertion.sourcePage}", got "${event.sourcePage ?? null}"`,
        errors
      );
    }

    if (assertion.eventType !== undefined) {
      assertCondition(
        normalizeText(event.eventType) === normalizeText(assertion.eventType),
        `Event "${assertion.title}" expected eventType "${assertion.eventType}", got "${event.eventType ?? ""}"`,
        errors
      );
    }
  }

  if (spec.expectedTitlesInOrder?.length) {
    const expectedTitles = spec.expectedTitlesInOrder.map((title) =>
      normalizeText(title)
    );
    const actualTitles = getEventTitles(cleanedEvents);

    assertCondition(
      actualTitles.length === expectedTitles.length &&
        actualTitles.every((title, index) => title === expectedTitles[index]),
      `Expected event titles in exact order:\n${expectedTitles.join(" | ")}\nActual:\n${actualTitles.join(" | ")}`,
      errors
    );
  }

  return {
    documentName,
    passed: errors.length === 0,
    errors,
    rawEventCount: rawEvents.length,
    cleanedEventCount: cleanedEvents.length,
    cleanedEvents,
  };
}

function getBaseName(expectedFile: string): string {
  return expectedFile.replace(/\.expected\.json$/i, "");
}

async function main() {
  const rootDir = process.cwd();
  const fixturesDir = path.join(rootDir, "test-regression", "fixtures");
  const outputDir = path.join(rootDir, "test-regression", "output");

  if (!fs.existsSync(fixturesDir)) {
    console.error("Fixtures directory not found: test-regression/fixtures");
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const expectedFiles = fs
    .readdirSync(fixturesDir)
    .filter((file) => file.endsWith(".expected.json"));

  if (expectedFiles.length === 0) {
    console.error("No expected files found in test-regression/fixtures");
    process.exit(1);
  }

  const results: RegressionResult[] = [];

  for (const expectedFile of expectedFiles) {
    const baseName = getBaseName(expectedFile);
    const expectedPath = path.join(fixturesDir, expectedFile);
    const spec = loadJsonFile<ExpectedSpec>(expectedPath);

    const rawTxtPath = path.join(fixturesDir, `${baseName}.raw.txt`);
    const rawJsonPath = path.join(fixturesDir, `${baseName}.raw.json`);

    let rawEvents: RawTimelineEvent[] | null = null;
    let pageTexts: PageTextFixture[] | null = null;
    let rawSourceLabel = `${baseName}.raw.txt or ${baseName}.raw.json`;

    if (fs.existsSync(rawJsonPath)) {
      const parsed = loadJsonFile<unknown>(rawJsonPath);

      if (!Array.isArray(parsed)) {
        results.push({
          documentName: spec.documentName ?? baseName,
          passed: false,
          errors: [`Fixture is not an array: ${rawJsonPath}`],
          rawEventCount: 0,
          cleanedEventCount: 0,
          cleanedEvents: [],
        });
        continue;
      }

      if (isPageTextFixture(parsed)) {
        pageTexts = parsed;
        rawSourceLabel = `${baseName}.raw.json (page texts)`;
      } else {
        rawEvents = parsed as RawTimelineEvent[];
        rawSourceLabel = `${baseName}.raw.json`;
      }
    } else if (fs.existsSync(rawTxtPath)) {
      const rawText = fs.readFileSync(rawTxtPath, "utf8").trim();

      try {
        const parsed = JSON.parse(rawText);

        if (!Array.isArray(parsed)) {
          throw new Error("Parsed raw fixture is not an array");
        }

        rawEvents = parsed as RawTimelineEvent[];
        rawSourceLabel = `${baseName}.raw.txt`;
      } catch {
        results.push({
          documentName: spec.documentName ?? baseName,
          passed: false,
          errors: [
            `Raw fixture found at ${rawTxtPath}, but it is plain text. This runner expects raw extracted event JSON arrays. Paste the RAW TIMELINE EVENTS array into ${baseName}.raw.json or replace ${baseName}.raw.txt contents with a JSON array.`,
          ],
          rawEventCount: 0,
          cleanedEventCount: 0,
          cleanedEvents: [],
        });
        continue;
      }
    } else {
      results.push({
        documentName: spec.documentName ?? baseName,
        passed: false,
        errors: [`Fixture raw file not found: expected ${rawSourceLabel}`],
        rawEventCount: 0,
        cleanedEventCount: 0,
        cleanedEvents: [],
      });
      continue;
    }

    try {
      if (pageTexts) {
        rawEvents = await extractTimelineEvents(pageTexts);
      }

      const extractedEvents = rawEvents ?? [];
      const cleanedEvents = cleanTimelineEvents(extractedEvents);
      const result = validateExpected(
        spec,
        extractedEvents,
        cleanedEvents,
        spec.documentName ?? baseName
      );
      results.push(result);

      const outFile = path.join(outputDir, `${baseName}.actual.cleaned.json`);

      fs.writeFileSync(
        outFile,
        JSON.stringify(
          {
            documentName: spec.documentName ?? baseName,
            rawSource: rawSourceLabel,
            rawEventCount: extractedEvents.length,
            cleanedEventCount: cleanedEvents.length,
            cleanedEvents,
          },
          null,
          2
        )
      );
    } catch (error) {
      results.push({
        documentName: spec.documentName ?? baseName,
        passed: false,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        rawEventCount: 0,
        cleanedEventCount: 0,
        cleanedEvents: [],
      });
    }
  }

  let failed = 0;

  console.log("\n=== REGRESSION TEST RESULTS ===\n");

  for (const result of results) {
    if (result.passed) {
      console.log(`PASS  ${result.documentName}`);
      console.log(`      raw: ${result.rawEventCount}, cleaned: ${result.cleanedEventCount}`);
    } else {
      failed++;
      console.log(`FAIL  ${result.documentName}`);
      console.log(`      raw: ${result.rawEventCount}, cleaned: ${result.cleanedEventCount}`);
      for (const error of result.errors) {
        console.log(`      - ${error}`);
      }
    }
  }

  console.log(`\nCompleted ${results.length} test(s). Failed: ${failed}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal regression runner error:", error);
  process.exit(1);
});
