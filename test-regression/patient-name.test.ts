import assert from "node:assert/strict";
import {
  detectPatientNameFromText,
  shouldReplaceSubjectName,
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
assert.equal(detectPatientNameFromText("Name: Payer-Returned Name"), null);
assert.equal(detectPatientNameFromText("Subscriber Name"), null);
assert.equal(detectPatientNameFromText("Guarantor Information"), null);
assert.equal(detectPatientNameFromText("Patient Contacts"), null);
assert.equal(detectPatientNameFromText("Provider Information"), null);
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
assert.equal(
  detectPatientNameFromText(
    "Name: HussainKhail, Imran Ahmad MRN: 12345 DOB: 01/01/1980"
  ),
  "HussainKhail, Imran Ahmad"
);
assert.equal(
  detectPatientNameFromText(
    "HussainKhail, Imran Ahmad MRN: 12345 DOB: 01/01/1980"
  ),
  "HussainKhail, Imran Ahmad"
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
assert.equal(
  shouldStoreDetectedPatientName("Unnamed Case", "Joshua Bergeron"),
  true
);
assert.equal(
  shouldStoreDetectedPatientName("Our Client", "Joshua Bergeron"),
  true
);
assert.equal(
  shouldStoreDetectedPatientName("Patient", "Joshua Bergeron"),
  true
);
assert.equal(
  shouldStoreDetectedPatientName("Unknown", "Joshua Bergeron"),
  true
);
assert.equal(shouldReplaceSubjectName(null), true);
assert.equal(shouldReplaceSubjectName(""), true);
assert.equal(shouldReplaceSubjectName("Patient"), true);
assert.equal(shouldReplaceSubjectName("Payer-Returned Name"), true);
assert.equal(shouldReplaceSubjectName("Imran Ahmad"), false);
