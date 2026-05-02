import assert from "node:assert/strict";
import { cleanTimelineEvents, RawTimelineEvent } from "../lib/timeline-cleanup";

const contaminatedEvents: RawTimelineEvent[] = [
  {
    date: "2010-04-12",
    title: "Workplace head injury after pipe fell from derrick",
    description: "Workplace trauma after pipe fell from derrick struck the patient at work.",
    eventType: "incident",
    sourcePage: 2,
    sourceExcerpt: "Notice of filing and subpoena wrapper page.",
  },
  {
    date: "2018-04-12",
    title: "Grouped medications",
    description:
      "Encounter medications documented included hydromorphone/Dilaudid, ondansetron/Zofran, and Tdap.",
    eventType: "treatment",
    sourcePage: 6,
    sourceExcerpt: "Attorney notice and legal wrapper page.",
  },
];

const cleanedEvents = cleanTimelineEvents(contaminatedEvents);

assert(
  cleanedEvents.some(
    (event) =>
      event.title === "Workplace head injury after pipe fell from derrick" &&
      event.date === "2019-02-02"
  ),
  "Expected workplace injury date to normalize to 2019-02-02"
);

assert(
  cleanedEvents.some(
    (event) =>
      event.title === "Grouped medications" &&
      (event.date === "2019-02-02" || event.date === "2019-02-03")
  ),
  "Expected grouped medications date to normalize to 2019-02-02 or 2019-02-03"
);

assert(
  !cleanedEvents.some(
    (event) =>
      event.title === "Workplace head injury after pipe fell from derrick" &&
      event.date === "2010-04-12"
  ),
  "Expected 2010-04-12 workplace injury date to be removed"
);

assert(
  !cleanedEvents.some(
    (event) => event.title === "Grouped medications" && event.date === "2018-04-12"
  ),
  "Expected 2018-04-12 grouped medications date to be removed"
);

console.log("fontana-date-contamination test passed");
