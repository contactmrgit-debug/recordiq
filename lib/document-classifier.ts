import OpenAI from "openai";

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey
  ? new OpenAI({
      apiKey: openaiApiKey,
    })
  : null;

const ALLOWED_TYPES = [
  "MEDICAL_RECORD",
  "BILL",
  "LAB_RESULT",
  "IMAGING",
  "INSURANCE",
  "LEGAL_DOCUMENT",
  "OTHER",
] as const;

type RecordTypeValue = (typeof ALLOWED_TYPES)[number];

function fallbackClassify(text: string): RecordTypeValue {
  const t = text.toLowerCase();

  if (
    t.includes("department of justice") ||
    t.includes("bureau of alcohol, tobacco, firearms") ||
    t.includes("transaction record") ||
    t.includes("court") ||
    t.includes("plaintiff") ||
    t.includes("defendant") ||
    t.includes("affidavit") ||
    t.includes("subpoena") ||
    t.includes("agreement")
  ) {
    return "LEGAL_DOCUMENT";
  }

  if (
    t.includes("invoice") ||
    t.includes("amount due") ||
    t.includes("balance due") ||
    t.includes("billing statement")
  ) {
    return "BILL";
  }

  if (
    t.includes("lab result") ||
    t.includes("reference range") ||
    t.includes("specimen") ||
    t.includes("collected:")
  ) {
    return "LAB_RESULT";
  }

  if (
    t.includes("x-ray") ||
    t.includes("mri") ||
    t.includes("ct scan") ||
    t.includes("ultrasound") ||
    t.includes("impression:")
  ) {
    return "IMAGING";
  }

  if (
    t.includes("claim number") ||
    t.includes("policy number") ||
    t.includes("coverage") ||
    t.includes("explanation of benefits")
  ) {
    return "INSURANCE";
  }

  if (
    t.includes("history of present illness") ||
    t.includes("assessment and plan") ||
    t.includes("discharge summary") ||
    t.includes("progress note") ||
    t.includes("medical record")
  ) {
    return "MEDICAL_RECORD";
  }

  return "OTHER";
}

export async function classifyDocument(
  text: string
): Promise<{ type: RecordTypeValue }> {
  const snippet = text.slice(0, 6000);
  const fallback = fallbackClassify(snippet);

  if (!openai) {
    return { type: fallback };
  }

  try {
    const prompt = `
You classify uploaded documents for a records platform.

Choose exactly one label from this list:
MEDICAL_RECORD
BILL
LAB_RESULT
IMAGING
INSURANCE
LEGAL_DOCUMENT
OTHER

Guidance:
- Court filings, contracts, police forms, government forms, firearms transaction forms, subpoenas, affidavits, and legal correspondence => LEGAL_DOCUMENT
- Clinical notes, hospital records, discharge summaries, visit notes => MEDICAL_RECORD
- Charges, invoices, statements => BILL
- Bloodwork, pathology, specimen reports => LAB_RESULT
- Radiology and scan reports => IMAGING
- Policy, claim, EOB, coverage letters => INSURANCE

Return only the label.
No explanation.

Document text:
${snippet}
`;

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const raw =
      res.choices?.[0]?.message?.content?.trim()?.toUpperCase() ?? "OTHER";

    if (ALLOWED_TYPES.includes(raw as RecordTypeValue)) {
      return { type: raw as RecordTypeValue };
    }

    return { type: fallback };
  } catch (err) {
    console.error("CLASSIFICATION ERROR:", err);
    return { type: fallback };
  }
}