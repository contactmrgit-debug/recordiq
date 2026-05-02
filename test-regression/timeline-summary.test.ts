import assert from "node:assert/strict";
import { cleanTimelineEvents } from "../lib/timeline-cleanup.ts";
import {
  classifySummaryCategory,
  generateTimelineSummary,
} from "../lib/timeline-summary.ts";

type SummaryEvent = {
  date?: string | null;
  title?: string | null;
  description?: string | null;
  eventType?: string | null;
  sourcePage?: number | null;
};

function makeEvent(
  title: string,
  description: string,
  overrides: Partial<SummaryEvent> = {}
): SummaryEvent {
  return {
    date: "2024-01-01",
    title,
    description,
    eventType: overrides.eventType ?? "other",
    sourcePage: overrides.sourcePage ?? 1,
    ...overrides,
  };
}

function createShortTimeline(): SummaryEvent[] {
  return [
    makeEvent(
      "Workplace injury",
      "Patient struck in the head by a pipe falling from a derrick."
    ),
    makeEvent(
      "ER presentation",
      "Presented with headache, scalp swelling, and bruising."
    ),
    makeEvent(
      "CT head",
      "CT head showed no acute intracranial injury but scalp hematoma."
    ),
    makeEvent("Treatment", "Ketorolac administered for pain control."),
    makeEvent("Disposition", "Discharged home with return precautions."),
  ];
}

function createGroupedTimeline(): SummaryEvent[] {
  return [
    makeEvent("Workplace injury", "Pipe fell from derrick and struck the patient."),
    makeEvent("Presentation", "Arrived with headache and neck pain."),
    makeEvent("CT head", "CT head showed scalp hematoma without acute bleed.", {
      eventType: "report",
      sourcePage: 2,
    }),
    makeEvent("CT cervical spine", "C2 fracture and mild alignment change noted.", {
      eventType: "report",
      sourcePage: 3,
    }),
    makeEvent("Labs", "CBC showed mild leukocytosis.", {
      eventType: "report",
      sourcePage: 4,
    }),
    makeEvent("Labs", "Metabolic panel documented elevated glucose.", {
      eventType: "report",
      sourcePage: 4,
    }),
    makeEvent("Procedure", "Cervical collar applied and spine precautions maintained.", {
      eventType: "treatment",
    }),
    makeEvent("Medication", "Morphine and ondansetron were administered in the ER.", {
      eventType: "treatment",
    }),
    makeEvent("Transfer", "Accepted for transfer to Shannon for higher-level care.", {
      eventType: "communication",
    }),
    makeEvent("Disposition", "Transfer paperwork completed and ambulance arranged.", {
      eventType: "other",
    }),
    makeEvent("Follow-up", "Advised orthopedic follow-up after discharge.", {
      eventType: "appointment",
    }),
    makeEvent("Follow-up", "Return precautions reviewed with patient and family.", {
      eventType: "appointment",
    }),
  ];
}

function createTest2Timeline(): SummaryEvent[] {
  return [
    makeEvent(
      "Workplace head injury after pipe fell from derrick",
      "At work on a drill rig, a pipe fell from the derrick onto his head.",
      { eventType: "incident", sourcePage: 10 }
    ),
    makeEvent(
      "ER presentation with head, neck, left shoulder pain",
      "Emergency Department presentation with head pain, neck pain, and left shoulder pain after the injury.",
      { eventType: "symptom", sourcePage: 2 }
    ),
    makeEvent(
      "Left scalp/periorbital injury findings",
      "Exam found left scalp swelling and periorbital bruising around the left eye.",
      { eventType: "observation", sourcePage: 3 }
    ),
    makeEvent(
      "CT head result",
      "CT head impression: soft tissue swelling and no intracranial hemorrhage.",
      { eventType: "report", sourcePage: 12 }
    ),
    makeEvent(
      "C2 fracture imaging result",
      "Cervical spine impression: nondisplaced C2 facet and lamina fracture.",
      { eventType: "report", sourcePage: 12 }
    ),
    makeEvent(
      "Scapular fracture imaging result",
      "Left shoulder and humerus radiographs impression: left scapular body fracture.",
      { eventType: "report", sourcePage: 14 }
    ),
    makeEvent(
      "Grouped medications",
      "Encounter medications documented: hydromorphone, ondansetron, ketorolac, tdap, acetaminophen.",
      { eventType: "treatment", sourcePage: 18 }
    ),
    makeEvent(
      "Grouped labs/urinalysis",
      "Labs and urinalysis documented: urinalysis.",
      { eventType: "report", sourcePage: 19 }
    ),
    makeEvent(
      "Transferred to Shannon for higher level care",
      "Transferred to Shannon Medical Center for higher-level trauma care.",
      { eventType: "treatment", sourcePage: 16 }
    ),
  ];
}

function createEndocrineTimeline(): SummaryEvent[] {
  return [
    makeEvent(
      "Lab visit documented",
      "Laboratory follow-up visit documented.",
      { eventType: "appointment", sourcePage: 23, date: "2025-07-18" }
    ),
    makeEvent(
      "Endocrinology results follow-up",
      "Results follow-up documented adrenal insufficiency, ALD/adrenoleukodystrophy, status post allogeneic bone marrow transplant, and X-linked adrenoleukodystrophy.",
      { eventType: "appointment", sourcePage: 15, date: "2025-07-21" }
    ),
    makeEvent(
      "ACTH remained high and renin elevated",
      "ACTH remained high after stress dosing and renin was elevated.",
      { eventType: "report", sourcePage: 16, date: "2025-07-22" }
    ),
    makeEvent(
      "Hydrocortisone and fludrocortisone doses increased",
      "Hydrocortisone and fludrocortisone doses were increased.",
      { eventType: "treatment", sourcePage: 16, date: "2025-07-22" }
    ),
    makeEvent(
      "Parent reported fatigue, color changes, dry lips, and thirst",
      "Parent reported fatigue, color changes, dry lips, and thirst.",
      { eventType: "communication", sourcePage: 17, date: "2025-07-22" }
    ),
    makeEvent(
      "Repeat lytes, ACTH, and renin planned in 4 weeks",
      "Repeat lytes, ACTH, and renin were planned in 4 weeks.",
      { eventType: "other", sourcePage: 19, date: "2025-07-22" }
    ),
    makeEvent(
      "BMT/ER guidance if symptoms persist",
      "Family was advised to contact the BMT team and/or go to the ER if symptoms persisted.",
      { eventType: "communication", sourcePage: 20, date: "2025-07-25" }
    ),
  ];
}

function createDavidWeirCleanupTimeline(): SummaryEvent[] {
  return [
    makeEvent(
      "Workplace head injury after pipe fell from derrick",
      "At work on a drill rig, a pipe fell from the derrick and struck the patient on the head.",
      { eventType: "incident", sourcePage: 46, date: "2019-02-02" }
    ),
    makeEvent(
      "ER presentation with head, neck, and left shoulder pain",
      "Emergency department presentation with head pain, neck pain, and left shoulder pain after the injury.",
      { eventType: "symptom", sourcePage: 46, date: "2019-02-02" }
    ),
    makeEvent(
      "CT head showed no acute intracranial injury",
      "CT head showed no acute intracranial injury with left periorbital soft tissue swelling.",
      { eventType: "report", sourcePage: 46, date: "2019-02-02" }
    ),
    makeEvent(
      "Head laceration and left periorbital swelling documented",
      "Exam documented a scalp laceration with left periorbital swelling and bruising.",
      { eventType: "observation", sourcePage: 46, date: "2019-02-02" }
    ),
    makeEvent(
      "C2 fracture with vertebral foramen extension",
      "CT neck showed C2 fracture with vertebral foramen extension and vascular injury concern.",
      { eventType: "report", sourcePage: 46, date: "2019-02-02" }
    ),
    makeEvent(
      "CTA neck showed vascular injury concern",
      "CTA neck showed vascular injury concern involving the vertebral artery.",
      { eventType: "report", sourcePage: 46, date: "2019-02-02" }
    ),
    makeEvent(
      "Nondisplaced left scapular fracture",
      "Imaging showed a nondisplaced left scapular fracture.",
      { eventType: "report", sourcePage: 46, date: "2019-02-02" }
    ),
    makeEvent(
      "Grouped medications",
      "Encounter medications documented: hydromorphone, ondansetron, ketorolac, tdap, acetaminophen.",
      { eventType: "treatment", sourcePage: 46, date: "2019-02-02" }
    ),
    makeEvent(
      "CBC and metabolic panel results documented",
      "CBC and metabolic panel results documented during the trauma encounter.",
      { eventType: "report", sourcePage: 46, date: "2019-02-02" }
    ),
    makeEvent(
      "Parent reported fatigue, color changes, dry lips, and thirst",
      "Parent reported fatigue, color changes, dry lips, and thirst.",
      { eventType: "communication", sourcePage: 46, date: "2019-02-02" }
    ),
    makeEvent(
      "Neurology follow-up with migraine medication changes",
      "Neurology follow-up documented migraine medication changes and follow-up recommendations.",
      { eventType: "appointment", sourcePage: 47, date: "2022-03-08" }
    ),
  ];
}

function createLargeTimeline(): SummaryEvent[] {
  const events: SummaryEvent[] = [
    makeEvent("Workplace injury", "Pipe fell from derrick and caused head trauma."),
    makeEvent("EMS", "Patient immobilized with cervical collar and backboard."),
    makeEvent("Presentation", "Headache, neck pain, and left shoulder pain documented."),
    makeEvent("Presentation", "Bruising and scalp swelling noted on arrival."),
    makeEvent("CT head", "CT head showed scalp hematoma without intracranial hemorrhage."),
    makeEvent("CT neck", "CT neck showed C2 fracture and vertebral artery injury concern."),
    makeEvent("CTA", "CTA neck confirmed vascular injury concern."),
    makeEvent("X-ray", "Left scapular fracture identified on imaging."),
    makeEvent("Labs", "CBC documented mild leukocytosis.", { sourcePage: 5 }),
    makeEvent("Labs", "Metabolic panel showed low potassium.", { sourcePage: 5 }),
    makeEvent("Labs", "Coagulation studies were abnormal.", { sourcePage: 5 }),
    makeEvent("Labs", "Urinalysis was negative for infection.", { sourcePage: 6 }),
    makeEvent("Procedure", "Cervical collar maintained and trauma consult obtained."),
    makeEvent("Procedure", "Wound care performed for scalp injury."),
    makeEvent("Procedure", "Orthopedic evaluation completed for scapular fracture."),
    makeEvent("Medication", "Morphine administered for pain control."),
    makeEvent("Medication", "Ondansetron given for nausea."),
    makeEvent("Medication", "Keppra started due to seizure prophylaxis."),
    makeEvent("Transfer", "Accepted by Shannon for higher-level care."),
    makeEvent("Transfer", "Ambulance transfer arranged with accepting physician."),
    makeEvent("Disposition", "Transferred to Shannon ER for trauma management."),
    makeEvent("Follow-up", "Orthopedic follow-up recommended after stabilization."),
    makeEvent("Follow-up", "Neurosurgery follow-up discussed if symptoms worsen."),
    makeEvent("Follow-up", "Return precautions reviewed prior to transport."),
    makeEvent("Follow-up", "Family instructed on wound check and re-evaluation."),
    makeEvent("Imaging", "Repeat imaging showed unchanged fracture alignment.", {
      sourcePage: 7,
    }),
    makeEvent("Imaging", "Final read documented no acute intracranial findings.", {
      sourcePage: 8,
    }),
    makeEvent("Procedure", "Trauma service review completed.", { sourcePage: 9 }),
    makeEvent("Medication", "Tetanus booster administered.", { sourcePage: 10 }),
    makeEvent("Disposition", "Discharge instructions prepared after transfer.", {
      sourcePage: 11,
    }),
  ];

  return events;
}

function createBoilerplateMixedTimeline(): SummaryEvent[] {
  return [
    makeEvent("Encounter opened", "Encounter opened for documentation only."),
    makeEvent("Vital signs documented", "Vital signs documented on intake."),
    makeEvent("Administrative form", "Administrative form reviewed and scanned."),
    makeEvent("Normal lab", "CBC normal and no acute abnormalities."),
    makeEvent("Workplace injury", "Pipe struck patient in the head at work."),
    makeEvent("CT head", "CT head showed scalp hematoma and no bleed."),
    makeEvent("Treatment", "Ketorolac administered for pain control."),
    makeEvent("Transfer", "Accepted to Shannon for trauma care."),
  ];
}

function hasDuplicateBullets(bullets: string[]): boolean {
  return new Set(bullets).size !== bullets.length;
}

function run() {
  {
    const result = generateTimelineSummary([]);
    assert.equal(result.mode, "short");
    assert.equal(result.caseSummary, "No timeline events have been generated yet.");
    assert.equal(result.keyFindings.length, 0);
  }

  {
    const result = generateTimelineSummary(createShortTimeline());
    assert.equal(result.mode, "short");
    assert.ok(result.keyFindings.length <= 5);
    assert.ok(/workplace|head|injur|presentation|ct head/i.test(result.caseSummary));
    assert.ok(!hasDuplicateBullets(result.keyFindings));
    assert.ok(
      result.keyFindings.some((bullet) => /Incident \/ mechanism|Imaging|Procedures \/ treatment|Transfer \/ discharge/i.test(bullet))
    );
  }

  {
    const result = generateTimelineSummary(createGroupedTimeline());
    assert.equal(result.mode, "grouped");
    assert.ok(result.keyFindings.length >= 5 && result.keyFindings.length <= 8);
    assert.ok(
      result.keyFindings.some((bullet) => /Incident \/ mechanism/i.test(bullet))
    );
    assert.ok(result.keyFindings.some((bullet) => /Imaging/i.test(bullet)));
    assert.ok(result.keyFindings.some((bullet) => /Labs/i.test(bullet)));
    assert.ok(result.keyFindings.some((bullet) => /Procedures \/ treatment/i.test(bullet)));
    assert.ok(result.keyFindings.some((bullet) => /Medication/i.test(bullet)));
    assert.ok(result.keyFindings.some((bullet) => /Transfer \/ discharge/i.test(bullet)));
    assert.ok(result.keyFindings.some((bullet) => /Follow-up/i.test(bullet)));
    assert.ok(!hasDuplicateBullets(result.keyFindings));
  }

  {
    const ctaEvent = makeEvent(
      "CTA neck result",
      "CTA neck raised concern for vascular injury.",
      { eventType: "report" }
    );
    const workplaceEvent = makeEvent(
      "Workplace pipe injury",
      "Pipe fell from derrick and struck patient at work.",
      { eventType: "incident" }
    );

    assert.equal(classifySummaryCategory(ctaEvent), "imaging");
    assert.equal(classifySummaryCategory(workplaceEvent), "incident");
  }

  {
    const result = generateTimelineSummary(createTest2Timeline());
    assert.equal(result.mode, "grouped");
    assert.ok(
      result.caseSummary.startsWith(
        "The records describe an emergency evaluation after a workplace head injury"
      )
    );
    assert.ok(!/^CTA neck/i.test(result.caseSummary));
    assert.ok(
      result.keyFindings.some(
        (bullet) =>
          bullet ===
          "Symptoms / presentation: Head, neck, and left shoulder pain with head laceration and left periorbital swelling."
      )
    );
    assert.ok(result.keyFindings.some((bullet) => /Incident \/ mechanism/i.test(bullet)));
    assert.ok(result.keyFindings.some((bullet) => /Imaging/i.test(bullet)));
    assert.ok(result.keyFindings.some((bullet) => /Treatment \/ medication/i.test(bullet)));
    assert.ok(result.keyFindings.some((bullet) => /Labs/i.test(bullet)));
    assert.ok(result.keyFindings.some((bullet) => /Transfer \/ discharge/i.test(bullet)));
    assert.ok(!hasDuplicateBullets(result.keyFindings));
  }

  {
    const result = generateTimelineSummary(createLargeTimeline());
    assert.equal(result.mode, "highlights");
    assert.ok(result.keyFindings.length <= 8);
    assert.ok(result.keyFindings.length < 30);
    assert.ok(result.keyFindings.some((bullet) => /Imaging/i.test(bullet)));
    assert.ok(result.keyFindings.some((bullet) => /Labs/i.test(bullet)));
    assert.ok(
      result.keyFindings.some((bullet) => /Procedures \/ treatment|Transfer \/ discharge/i.test(bullet))
    );
    assert.ok(result.keyFindings.some((bullet) => /Follow-up/i.test(bullet)));
    assert.ok(!hasDuplicateBullets(result.keyFindings));
  }

  {
    const result = generateTimelineSummary(createEndocrineTimeline());
    assert.ok(/endocrinology results follow-up/i.test(result.caseSummary));
    assert.ok(/ACTH remained high/i.test(result.caseSummary));
    assert.ok(/hydrocortisone and fludrocortisone/i.test(result.caseSummary));
    assert.ok(/fatigue, color changes, dry lips, and thirst/i.test(result.caseSummary));
    assert.ok(/BMT team/i.test(result.caseSummary) || /ER/i.test(result.caseSummary));
  }

  {
    const cleanedEvents = cleanTimelineEvents(createDavidWeirCleanupTimeline() as any);
    assert.ok(
      !cleanedEvents.some((event) =>
        /parent reported fatigue|color changes, dry lips, and thirst|dry lips|thirst/i.test(
          `${event.title || ""} ${event.description || ""} ${event.sourceExcerpt || ""}`
        )
      )
    );

    const result = generateTimelineSummary(cleanedEvents);
    assert.ok(
      !/parent reported fatigue|color changes, dry lips, and thirst|dry lips|thirst/i.test(
        result.caseSummary
      )
    );
    assert.ok(
      !result.keyFindings.some((bullet) =>
        /parent reported fatigue|color changes, dry lips, and thirst|dry lips|thirst/i.test(
          bullet
        )
      )
    );
  }

  {
    const result = generateTimelineSummary(createBoilerplateMixedTimeline());
    assert.ok(result.keyFindings.length <= 5);
    const highValueHits = result.keyFindings.filter((bullet) =>
      /Incident \/ mechanism|Imaging|Procedures \/ treatment|Transfer \/ discharge/i.test(
        bullet
      )
    );
    const boilerplateHits = result.keyFindings.filter((bullet) =>
      /Encounter opened|Vital signs|Administrative|normal lab/i.test(bullet)
    );

    assert.ok(highValueHits.length >= 3);
    assert.ok(boilerplateHits.length <= 1);
  }

  console.log("timeline-summary tests passed");
}

run();
