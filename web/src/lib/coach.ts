import { z } from "zod";
import type { CaseOutputs, Facts, IntakeData } from "@/lib/types";

/**
 * Small helpers to make LLM outputs resilient.
 */
function toTrimmedString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return "";
}

function splitList(s: string): string[] {
  return s
    .split(/\n|,|;|•/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

/**
 * Accept either:
 * - string[] (already good),
 * - a single string like "a, b; c",
 * - null/undefined
 * and normalize to string[].
 */
const StringList = z.preprocess((val) => {
  if (Array.isArray(val)) return val.map(toTrimmedString).filter(Boolean);
  const s = toTrimmedString(val);
  return s ? splitList(s) : [];
}, z.array(z.string()));

const CoercedString = z.preprocess((val) => toTrimmedString(val), z.string());

/**
 * Facts schema (what we persist as "case memory")
 */
const IncidentSchema = z
  .object({
    date: CoercedString.optional().default(""),
    time: CoercedString.optional().default(""),
    location: CoercedString.optional().default(""),
    whatHappened: CoercedString.optional().default(""),
    injuries: CoercedString.optional().default(""),
    threats: CoercedString.optional().default(""),
    witnesses: CoercedString.optional().default(""),
    evidence: CoercedString.optional().default("")
  })
  .passthrough();

/**
 * NOTE:
 * - .passthrough() keeps “virtual” fields like cohabitation, safetyStatus, etc.
 * - Defaults ensure arrays always exist.
 */
const FactsSchema: z.ZodType<Facts, z.ZodTypeDef, unknown> = z
  .object({
    parties: z
      .object({
        petitioner: CoercedString.optional().default(""),
        respondent: CoercedString.optional().default("")
      })
      .default({ petitioner: "", respondent: "" }),
    relationship: CoercedString.optional().default(""),
    incidents: z.preprocess((val) => (Array.isArray(val) ? val : []), z.array(IncidentSchema)).default([]),

    safetyConcerns: StringList.default([]),
    requestedRelief: StringList.default([]),
    evidenceList: StringList.default([]),
    timeline: StringList.default([])
  })
  .passthrough();

/**
 * Outputs schema
 */
const OutputsSchema: z.ZodType<CaseOutputs, z.ZodTypeDef, unknown> = z
  .object({
    script2Min: CoercedString.optional().default(""),
    outline5Min: StringList.default([]),
    evidenceChecklist: StringList.default([]),
    timelineSummary: StringList.default([]),
    whatToBring: StringList.default([]),
    whatToExpect: StringList.default([])
  })
  .passthrough();

/**
 * Model response schema (STRICT JSON)
 */
const CoachResponseSchema = z.object({
  assistant_message: z.string(),
  next_questions: z.array(z.string()).optional().default([]),
  extracted_facts: z.record(z.any()).optional().default({}),
  missing_fields: z.array(z.string()).optional().default([]),
  progress_percent: z.number().min(0).max(100).optional().default(0),
  safety_flags: z.array(z.string()).optional().default([])
});

export type CoachParsed = {
  assistantMessage: string;
  nextQuestions: string[];
  extractedFacts: Record<string, unknown>;
  missingFields: string[];
  progressPercent: number;
  safetyFlags: string[];
  raw: string;
};

export type IntakeFieldDefinition = {
  label: string;
  intakeKey: keyof IntakeData | null;
  question: string;
  priority: number;
  optional?: boolean;
};

/**
 * Allowed missing field labels
 */
export const INTAKE_FIELD_DEFINITIONS: IntakeFieldDefinition[] = [
  {
    label: "relationship_category",
    intakeKey: "relationshipCategory",
    question: "What is the relationship category between you and the other person?",
    priority: 1
  },
  {
    label: "cohabitation",
    intakeKey: "cohabitation",
    question: "Do you currently live together, previously live together, or never lived together?",
    priority: 2
  },
  {
    label: "most_recent_incident_datetime",
    intakeKey: "mostRecentIncidentAt",
    question: "What is the date and time of the most recent incident?",
    priority: 3
  },
  {
    label: "pattern_summary",
    intakeKey: "patternOfIncidents",
    question: "Please summarize the pattern of incidents and note any reported injuries or threats (brief and factual).",
    priority: 4
  },
  {
    label: "safety_status",
    intakeKey: "safetyStatus",
    question: "Are you safe right now? (safe now / unsafe / immediate danger / unsure)",
    priority: 5
  },
  {
    label: "firearms_access",
    intakeKey: "firearmsAccess",
    question: "Does the other person have access to firearms? (yes / no / unknown)",
    priority: 6
  },
  {
    label: "children_involved",
    intakeKey: "childrenInvolved",
    question: "Were any children involved or did they witness the incidents?",
    priority: 7
  },
  {
    label: "existing_cases_orders",
    intakeKey: "existingCasesOrders",
    question: "Are there any existing cases or orders between you and this person?",
    priority: 8
  },
  {
    label: "evidence_inventory",
    intakeKey: "evidenceInventory",
    question: "What evidence do you have (texts, photos, reports, witnesses, etc.)?",
    priority: 9
  },
  {
    // Keep your label for backward compatibility (even though parentheses are awkward).
    label: "requested_relief(optional)",
    intakeKey: "requestedRelief",
    question: "What relief are you asking for (stay-away, no contact, custody, etc.)? (optional)",
    priority: 10,
    optional: true
  },
  {
    label: "top_events",
    intakeKey: null,
    question: "Please list 1-3 most important events with dates or approximate dates, locations, and what was reported to happen.",
    priority: 11
  },
  {
    label: "petitioner_name(optional)",
    intakeKey: "petitionerName",
    question: "What is the petitioner's name? (optional)",
    priority: 12,
    optional: true
  },
  {
    label: "respondent_name(optional)",
    intakeKey: "respondentName",
    question: "What is the respondent's name? (optional)",
    priority: 13,
    optional: true
  }
];

const FIELD_LOOKUP = new Map(INTAKE_FIELD_DEFINITIONS.map((f) => [f.label, f]));
const ALLOWED_LABELS = new Set(INTAKE_FIELD_DEFINITIONS.map((f) => f.label));
const REQUIRED_LABELS = INTAKE_FIELD_DEFINITIONS.filter((f) => !f.optional).map((f) => f.label);

/**
 * If the model wraps JSON in ```json fences, strip them.
 */
export function sanitizeModelOutput(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

/**
 * Extract the first valid JSON object from a string by bracket depth.
 * This is resilient to "assistant_message" containing braces later.
 */
export function extractFirstJsonObject(text: string): string | null {
  let depth = 0;
  let startIndex = -1;

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];

    if (c === "{") {
      if (depth === 0) startIndex = i;
      depth += 1;
      continue;
    }
    if (c === "}") {
      depth -= 1;
      if (depth === 0 && startIndex !== -1) {
        const candidate = text.slice(startIndex, i + 1);
        try {
          JSON.parse(candidate);
          return candidate;
        } catch {
          startIndex = -1;
        }
      }
    }
  }
  return null;
}

export function parseCoachResponse(text: string): CoachParsed | null {
  const sanitized = sanitizeModelOutput(text);
  const jsonCandidate = extractFirstJsonObject(sanitized);
  if (!jsonCandidate) return null;

  try {
    const parsed = JSON.parse(jsonCandidate);
    const result = CoachResponseSchema.safeParse(parsed);
    if (!result.success) return null;

    const nextQuestions = (result.data.next_questions || [])
      .map((s) => s.trim())
      .filter(Boolean);

    const missingFields = (result.data.missing_fields || [])
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((label) => ALLOWED_LABELS.has(label));

    const safetyFlags = (result.data.safety_flags || [])
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      assistantMessage: result.data.assistant_message.trim(),
      nextQuestions,
      extractedFacts: result.data.extracted_facts || {},
      missingFields,
      progressPercent: result.data.progress_percent ?? 0,
      safetyFlags,
      raw: text
    };
  } catch {
    return null;
  }
}

export function coerceExtractedFacts(input: Record<string, unknown>): Partial<Facts> | null {
  const parsed = FactsSchema.safeParse(input);
  if (!parsed.success) return null;
  return parsed.data;
}

export function coerceExtractedOutputs(input: Record<string, unknown>): Partial<CaseOutputs> | null {
  const parsed = OutputsSchema.safeParse(input);
  if (!parsed.success) return null;
  return parsed.data;
}

export function buildCoachPrompt(params: {
  intake: IntakeData;
  facts: Facts;
  lastMessages: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  mode: "interview" | "update";
}): { systemInstruction: string; userPrompt: string } {
  const { intake, facts, lastMessages, userMessage, mode } = params;

  const baseStyle = `You are a safety-first, court-friendly information assistant focused ONLY on New York Family Court Orders of Protection.
This is NOT legal advice.

STYLE RULES:
- Be neutral, factual, and chronological.
- Avoid emotional or inflammatory language. Prefer "reported" / "alleged".
- Avoid legal conclusions. Describe actions.
- If uncertainties exist, explicitly flag them in assistant_message.
- DO NOT invent facts. Only use INTAKE DATA or RECENT CONVERSATION.
- Output STRICT JSON ONLY (no markdown, no extra text).`;

  const interviewInstruction = `${baseStyle}
MODE: Interview (investigator). Your goal is to fill missing critical fields with concise, petition-style facts.
For each key incident, ask for: date/time (or approximate date like "early Jan 2026" if exact is unknown), location,
what happened (clear verbs), reported injuries, reported threats (exact quotes if possible), witnesses, and evidence.`;

  const updateInstruction = `${baseStyle}
MODE: Roadmap Update (updater). The user is providing a new fact to add. Extract and update the JSON.
Do NOT ask follow-up questions unless the new fact is unclear.`;

  const systemInstruction = mode === "update" ? updateInstruction : interviewInstruction;

  const allowedLabels = INTAKE_FIELD_DEFINITIONS.map((f) => f.label).join(", ");

  const convo = lastMessages
    .slice(-12)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const userPrompt = `Return STRICT JSON ONLY. The JSON must match exactly:
{
  "assistant_message": string,
  "next_questions": string[],
  "extracted_facts": object,
  "missing_fields": string[],
  "progress_percent": number,
  "safety_flags": string[]
}

Allowed missing field labels ONLY (exact text): ${allowedLabels}

PRIORITY for follow-up questions (max 3):
relationship/cohabitation -> most recent incident datetime -> injuries/threats -> firearms -> children -> existing cases/orders -> evidence -> requested relief -> top_events.

extracted_facts should align to this structure when possible:
{
  "parties": { "petitioner": string, "respondent": string },
  "relationship": string,
  "incidents": [{ "date": "...", "time": "...", "location": "...", "whatHappened": "...", "injuries": "...", "threats": "...", "witnesses": "...", "evidence": "..." }],
  "safetyConcerns": [],
  "requestedRelief": [],
  "evidenceList": [],
  "timeline": []
}

INTAKE DATA:
${JSON.stringify(intake, null, 2)}

CURRENT FACTS:
${JSON.stringify(facts, null, 2)}

RECENT CONVERSATION:
${convo}

NEW USER MESSAGE:
${userMessage}`;

  return { systemInstruction, userPrompt };
}

function valueIsMissing(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim().length === 0;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

export function computeMissingFields(intake: IntakeData, facts: Facts): string[] {
  const missing: string[] = [];
  const safeFacts = (FactsSchema.safeParse(facts).success ? facts : FactsSchema.parse({})) as Facts;

  // Check BOTH intake and facts, plus special-case “mostRecentIncidentAt”
  const has = (intakeKey: keyof IntakeData) => {
    const valIntake = (intake as any)?.[intakeKey];
    const valFacts = (safeFacts as any)?.[intakeKey];

    if (!valueIsMissing(valIntake) || !valueIsMissing(valFacts)) return true;

    if (intakeKey === "mostRecentIncidentAt") {
      return (safeFacts.incidents || []).some((i) => toTrimmedString(i?.date).length > 0);
    }

    return false;
  };

  for (const def of INTAKE_FIELD_DEFINITIONS) {
    if (!def.intakeKey) continue;
    if (def.optional) continue;
    if (!has(def.intakeKey)) missing.push(def.label);
  }

  // Computed: top_events
  const hasTopEvent = (safeFacts.incidents || []).some((inc) => {
    return Boolean(toTrimmedString((inc as any)?.whatHappened) && toTrimmedString((inc as any)?.date));
  });

  if (!hasTopEvent) missing.push("top_events");

  return missing
    .map((label) => FIELD_LOOKUP.get(label) || { label, priority: 999, intakeKey: null, question: "" })
    .sort((a, b) => a.priority - b.priority)
    .map((f) => f.label);
}

export function buildQuestionsFromMissing(missingFields: string[], limit = 3): string[] {
  return missingFields
    .map((label) => FIELD_LOOKUP.get(label))
    .filter((f): f is IntakeFieldDefinition => Boolean(f))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit)
    .map((f) => f.question);
}

export function calculateProgress(missingFields: string[]): number {
  const total = REQUIRED_LABELS.length;
  const remaining = missingFields.filter((label) => REQUIRED_LABELS.includes(label)).length;
  const progress = Math.round(((total - remaining) / total) * 100);
  return Math.min(100, Math.max(0, progress));
}

export function mergeOutputs(
  existing: CaseOutputs | undefined,
  incoming: CaseOutputs | undefined
): CaseOutputs | undefined {
  if (!existing) return incoming;
  if (!incoming) return existing;

  return {
    script2Min: incoming.script2Min || existing.script2Min,
    outline5Min: incoming.outline5Min?.length ? incoming.outline5Min : existing.outline5Min,
    evidenceChecklist: incoming.evidenceChecklist?.length ? incoming.evidenceChecklist : existing.evidenceChecklist,
    timelineSummary: incoming.timelineSummary?.length ? incoming.timelineSummary : existing.timelineSummary,
    whatToBring: incoming.whatToBring?.length ? incoming.whatToBring : existing.whatToBring,
    whatToExpect: incoming.whatToExpect?.length ? incoming.whatToExpect : existing.whatToExpect
  };
}

export const __schemas = { IncidentSchema, FactsSchema, OutputsSchema, CoachResponseSchema };