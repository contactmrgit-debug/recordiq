"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const timeline_cleanup_1 = require("../lib/timeline-cleanup");
function normalizeText(value) {
    return (value || "").toLowerCase().replace(/\s+/g, " ").trim();
}
function loadJsonFile(filePath) {
    return JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
}
function assertCondition(condition, error, errors) {
    if (!condition)
        errors.push(error);
}
function countEventsOnDate(events, date) {
    return events.filter((e) => e.date === date).length;
}
function hasTitle(events, title) {
    const target = normalizeText(title);
    return events.some((e) => normalizeText(e.title) === target);
}
function hasEventType(events, eventType) {
    const target = normalizeText(eventType);
    return events.some((e) => normalizeText(e.eventType) === target);
}
function hasProviderName(events, providerName) {
    const target = normalizeText(providerName);
    return events.some((e) => normalizeText(e.providerName) === target ||
        normalizeText(e.physicianName) === target);
}
function normalizeTitleForKey(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function getMaxEventsOnSingleDate(events) {
    const counts = new Map();
    for (const event of events) {
        const dateKey = (event.date ?? "UNKNOWN").trim() || "UNKNOWN";
        counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
    }
    return counts.size > 0 ? Math.max(...counts.values()) : 0;
}
function hasDuplicateNormalizedKeys(events) {
    const seen = new Set();
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
function validateExpected(spec, rawEvents, cleanedEvents, documentName) {
    const errors = [];
    const minEvents = spec.minEvents ?? spec.minCleanedEvents;
    const maxEvents = spec.maxEvents ?? spec.maxCleanedEvents;
    if (typeof minEvents === "number") {
        assertCondition(cleanedEvents.length >= minEvents, `Expected at least ${minEvents} cleaned events, got ${cleanedEvents.length}`, errors);
    }
    if (typeof maxEvents === "number") {
        assertCondition(cleanedEvents.length <= maxEvents, `Expected at most ${maxEvents} cleaned events, got ${cleanedEvents.length}`, errors);
    }
    for (const title of spec.mustIncludeTitles ?? []) {
        assertCondition(hasTitle(cleanedEvents, title), `Missing required title: "${title}"`, errors);
    }
    for (const title of spec.mustNotIncludeTitles ?? []) {
        assertCondition(!hasTitle(cleanedEvents, title), `Found forbidden title: "${title}"`, errors);
    }
    for (const eventType of spec.mustIncludeEventTypes ?? []) {
        assertCondition(hasEventType(cleanedEvents, eventType), `Missing required event type: "${eventType}"`, errors);
    }
    for (const eventType of spec.mustNotIncludeEventTypes ?? []) {
        assertCondition(!hasEventType(cleanedEvents, eventType), `Found forbidden event type: "${eventType}"`, errors);
    }
    for (const providerName of spec.mustIncludeProviderNames ?? []) {
        assertCondition(hasProviderName(cleanedEvents, providerName), `Missing required provider/physician name: "${providerName}"`, errors);
    }
    for (const providerName of spec.mustNotIncludeProviderNames ?? []) {
        assertCondition(!hasProviderName(cleanedEvents, providerName), `Found forbidden provider/physician name: "${providerName}"`, errors);
    }
    for (const [date, max] of Object.entries(spec.maxEventsOnDate ?? {})) {
        const count = countEventsOnDate(cleanedEvents, date);
        assertCondition(count <= max, `Expected at most ${max} events on ${date}, got ${count}`, errors);
    }
    if (spec.maxEventsOnSameDate) {
        const count = countEventsOnDate(cleanedEvents, spec.maxEventsOnSameDate.date);
        assertCondition(count <= spec.maxEventsOnSameDate.max, `Expected at most ${spec.maxEventsOnSameDate.max} events on ${spec.maxEventsOnSameDate.date}, got ${count}`, errors);
    }
    for (const [date, min] of Object.entries(spec.minEventsOnDate ?? {})) {
        const count = countEventsOnDate(cleanedEvents, date);
        assertCondition(count >= min, `Expected at least ${min} events on ${date}, got ${count}`, errors);
    }
    for (const rule of spec.dateRules ?? []) {
        const eventsOnDate = cleanedEvents.filter((e) => e.date === rule.date);
        if (typeof rule.minEvents === "number") {
            assertCondition(eventsOnDate.length >= rule.minEvents, `Expected at least ${rule.minEvents} events on ${rule.date}, got ${eventsOnDate.length}`, errors);
        }
        if (typeof rule.maxEvents === "number") {
            assertCondition(eventsOnDate.length <= rule.maxEvents, `Expected at most ${rule.maxEvents} events on ${rule.date}, got ${eventsOnDate.length}`, errors);
        }
        for (const title of rule.mustIncludeTitles ?? []) {
            assertCondition(eventsOnDate.some((e) => normalizeText(e.title) === normalizeText(title)), `On ${rule.date}, missing required title: "${title}"`, errors);
        }
        for (const title of rule.mustNotIncludeTitles ?? []) {
            assertCondition(!eventsOnDate.some((e) => normalizeText(e.title) === normalizeText(title)), `On ${rule.date}, found forbidden title: "${title}"`, errors);
        }
    }
    if (typeof spec.expectedCleanedCountMin === "number") {
        assertCondition(cleanedEvents.length >= spec.expectedCleanedCountMin, `Expected at least ${spec.expectedCleanedCountMin} cleaned events, got ${cleanedEvents.length}`, errors);
    }
    if (typeof spec.expectedCleanedCountMax === "number") {
        assertCondition(cleanedEvents.length <= spec.expectedCleanedCountMax, `Expected at most ${spec.expectedCleanedCountMax} cleaned events, got ${cleanedEvents.length}`, errors);
    }
    if (spec.expectedRawGreaterThanCleaned === true) {
        assertCondition(rawEvents.length > cleanedEvents.length, `Expected raw events (${rawEvents.length}) to be greater than cleaned events (${cleanedEvents.length})`, errors);
    }
    if (typeof spec.expectedMaxEventsOnSingleDate === "number") {
        const maxOnSingleDate = getMaxEventsOnSingleDate(cleanedEvents);
        assertCondition(maxOnSingleDate <= spec.expectedMaxEventsOnSingleDate, `Expected at most ${spec.expectedMaxEventsOnSingleDate} events on a single date, got ${maxOnSingleDate}`, errors);
    }
    if (spec.expectedNoDuplicateNormalizedKeys === true) {
        assertCondition(!hasDuplicateNormalizedKeys(cleanedEvents), "Expected no duplicate normalized cleaned events, but duplicates were found", errors);
    }
    for (const pattern of spec.mustKeepTitlePatterns ?? []) {
        const regex = new RegExp(pattern, "i");
        assertCondition(cleanedEvents.some((e) => regex.test(e.title ?? "")), `Expected cleaned events to include a title matching pattern: ${pattern}`, errors);
    }
    for (const pattern of spec.mustIncludeTitlePatterns ?? []) {
        const regex = new RegExp(pattern, "i");
        assertCondition(cleanedEvents.some((e) => regex.test(e.title ?? "")), `Expected cleaned events to include a title matching pattern: ${pattern}`, errors);
    }
    for (const pattern of spec.mustNotIncludeTitlePatterns ?? []) {
        const regex = new RegExp(pattern, "i");
        assertCondition(!cleanedEvents.some((e) => regex.test(e.title ?? "")), `Found forbidden title pattern in cleaned events: ${pattern}`, errors);
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
function getBaseName(expectedFile) {
    return expectedFile.replace(/\.expected\.json$/i, "");
}
async function main() {
    const rootDir = process.cwd();
    const fixturesDir = path_1.default.join(rootDir, "test-regression", "fixtures");
    const outputDir = path_1.default.join(rootDir, "test-regression", "output");
    if (!fs_1.default.existsSync(fixturesDir)) {
        console.error("Fixtures directory not found: test-regression/fixtures");
        process.exit(1);
    }
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    const expectedFiles = fs_1.default
        .readdirSync(fixturesDir)
        .filter((file) => file.endsWith(".expected.json"));
    if (expectedFiles.length === 0) {
        console.error("No expected files found in test-regression/fixtures");
        process.exit(1);
    }
    const results = [];
    for (const expectedFile of expectedFiles) {
        const baseName = getBaseName(expectedFile);
        const expectedPath = path_1.default.join(fixturesDir, expectedFile);
        const spec = loadJsonFile(expectedPath);
        const rawTxtPath = path_1.default.join(fixturesDir, `${baseName}.raw.txt`);
        const rawJsonPath = path_1.default.join(fixturesDir, `${baseName}.raw.json`);
        let rawEvents = null;
        let rawSourceLabel = `${baseName}.raw.txt or ${baseName}.raw.json`;
        if (fs_1.default.existsSync(rawJsonPath)) {
            const parsed = loadJsonFile(rawJsonPath);
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
            rawEvents = parsed;
            rawSourceLabel = `${baseName}.raw.json`;
        }
        else if (fs_1.default.existsSync(rawTxtPath)) {
            const rawText = fs_1.default.readFileSync(rawTxtPath, "utf8").trim();
            try {
                const parsed = JSON.parse(rawText);
                if (!Array.isArray(parsed)) {
                    throw new Error("Parsed raw fixture is not an array");
                }
                rawEvents = parsed;
                rawSourceLabel = `${baseName}.raw.txt`;
            }
            catch {
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
        }
        else {
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
            const cleanedEvents = (0, timeline_cleanup_1.cleanTimelineEvents)(rawEvents);
            const result = validateExpected(spec, rawEvents, cleanedEvents, spec.documentName ?? baseName);
            results.push(result);
            const outFile = path_1.default.join(outputDir, `${baseName}.actual.cleaned.json`);
            fs_1.default.writeFileSync(outFile, JSON.stringify({
                documentName: spec.documentName ?? baseName,
                rawSource: rawSourceLabel,
                rawEventCount: rawEvents.length,
                cleanedEventCount: cleanedEvents.length,
                cleanedEvents,
            }, null, 2));
        }
        catch (error) {
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
        }
        else {
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
