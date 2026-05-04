import assert from "node:assert/strict";
import {
  detectPatientNameFromText,
  shouldStoreDetectedPatientName,
} from "../lib/patient-name.ts";

assert.equal(detectPatientNameFromText("RE: Joshua Bergeron"), "Joshua Bergeron");
assert.equal(
  detectPatientNameFromText("Patient Name: JOSHUA BERGERON DOB: 01/01/1980"),
  "Joshua Bergeron"
);
assert.equal(
  detectPatientNameFromText(
    "Ochsner Health System Patient Name: JOSHUA BERGERON DOB: 01/01/1980 Account: 12345"
  ),
  "Joshua Bergeron"
);
assert.equal(
  detectPatientNameFromText(
    "RE: Our Client ... Patient Name: Joshua Bergeron"
  ),
  "Joshua Bergeron"
);
assert.equal(detectPatientNameFromText("RE: Our Client"), null);
assert.equal(
  detectPatientNameFromText(
    "Regarding: The Client ... JOSHUA BERGERON DOB: 01/01/1980"
  ),
  "Joshua Bergeron"
);
assert.equal(
  detectPatientNameFromText("JOSHUA BERGERON DOB: 01/01/1980"),
  "Joshua Bergeron"
);
assert.equal(detectPatientNameFromText("RE: Medical Records"), null);
assert.equal(
  shouldStoreDetectedPatientName("Ochsner Test", "Joshua Bergeron"),
  false
);
assert.equal(
  shouldStoreDetectedPatientName("Unnamed Patient", "Joshua Bergeron"),
  true
);
