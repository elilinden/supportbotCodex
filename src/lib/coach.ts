import { z } from "zod";
import type { CaseOutputs, Facts, IntakeData } from "@/lib/types";
import { QUALIFYING_OFFENSES, AVAILABLE_RELIEF, ORDER_DURATION_INFO, COURT_FORMS } from "@/lib/courtData";

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
    question: "What is the relationship between you and the other person? Family Court requires a qualifying relationship: spouse, former spouse, parent of child in common, family member (by blood/marriage/adoption), intimate partner (dating — not casual), or household member. Which applies?",
    priority: 1
  },
  {
    label: "cohabitation",
    intakeKey: "cohabitation",
    question: "Do you currently live together, previously lived together, or never lived together? This affects which court has jurisdiction.",
    priority: 2
  },
  {
    label: "top_events",
    intakeKey: null,
    question: "Please describe three key incidents: (1) the MOST RECENT incident, (2) the FIRST incident, and (3) the WORST incident. For each, give the date (or approximate date), location, exactly what happened, any injuries, exact words of threats if possible, and any witnesses present.",
    priority: 3
  },
  {
    label: "most_recent_incident_datetime",
    intakeKey: "mostRecentIncidentAt",
    question: "When did the most recent incident happen? Please give a date and approximate time. If the exact date is unknown, an approximation like 'early January 2026' is fine.",
    priority: 4
  },
  {
    label: "pattern_summary",
    intakeKey: "patternOfIncidents",
    question: "Describe the pattern of behavior: Has the conduct escalated over time? How frequent are the incidents? Include any reported injuries, threats (with exact words if possible), and whether the behavior is getting worse.",
    priority: 5
  },
  {
    label: "safety_status",
    intakeKey: "safetyStatus",
    question: "Are you safe right now? (safe now / unsafe / immediate danger / unsure). The court considers current safety level when deciding whether to grant a temporary order.",
    priority: 6
  },
  {
    label: "firearms_access",
    intakeKey: "firearmsAccess",
    question: "Does the other person have access to guns, firearms, or other weapons? (yes / no / unknown). The court must consider this when issuing an order of protection.",
    priority: 7
  },
  {
    label: "children_involved",
    intakeKey: "childrenInvolved",
    question: "Are any children involved? Did children witness incidents, or are they directly affected? This may affect whether child protective provisions are included in the order.",
    priority: 8
  },
  {
    label: "existing_cases_orders",
    intakeKey: "existingCasesOrders",
    question: "Are there any existing court cases, orders of protection, custody agreements, or criminal cases involving you and this person? Include case numbers if known.",
    priority: 9
  },
  {
    label: "evidence_inventory",
    intakeKey: "evidenceInventory",
    question: "What evidence do you have? (text messages, photos, medical records, police reports, witness names, voicemails, social media screenshots, etc.)",
    priority: 10
  },
  {
    label: "requested_relief(optional)",
    intakeKey: "requestedRelief",
    question: "What specific protections are you seeking? (e.g., stay-away order, refrain from harassment, temporary custody, exclusive use of home, surrender of firearms, etc.)",
    priority: 11,
    optional: true
  },
  {
    label: "prior_dv_history",
    intakeKey: null,
    question: "Has the other person been violent or threatening in past relationships that you know of? Have they ever been arrested for domestic violence or violated a prior order of protection?",
    priority: 12
  },
  {
    label: "isolation_control",
    intakeKey: null,
    question: "Has the other person tried to control your daily life — such as monitoring your phone, controlling finances, isolating you from family/friends, or preventing you from working or leaving the home?",
    priority: 13
  },
  {
    label: "stalking_harassment",
    intakeKey: null,
    question: "Has the other person followed you, shown up uninvited at your home/work/school, tracked your location, or sent unwanted repeated messages after being told to stop?",
    priority: 14
  },
  {
    label: "petitioner_name(optional)",
    intakeKey: "petitionerName",
    question: "What is the petitioner's name? (optional)",
    priority: 15,
    optional: true
  },
  {
    label: "respondent_name(optional)",
    intakeKey: "respondentName",
    question: "What is the respondent's name? (optional)",
    priority: 16,
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

/**
 * Build court context dynamically from courtData.ts instead of hardcoding.
 */
function buildCourtContext(): string {
  const offenses = QUALIFYING_OFFENSES.join(", ");
  const reliefOptions = AVAILABLE_RELIEF.map((r) => r.label).join(", ");
  const keyForms = COURT_FORMS
    .filter((f) => f.required || f.category === "filing")
    .map((f) => `${f.name} (${f.formNumber})`)
    .join(", ");

  return `COURT CONTEXT (use to guide questions — do NOT recite to user unless directly relevant):
- NY Family Court Act §812 defines family offenses: ${offenses}.
- Judges evaluate: severity and frequency of incidents, escalation pattern, presence of weapons, impact on children, prior violations of orders, credibility of the account.
- Strangulation is treated as a high-lethality indicator in DV risk assessment.
- Temporary (ex parte) orders can be granted same-day if there is immediate risk. The standard is "good cause shown" (FCA §828).
- The petitioner's detailed, date-specific, factual account is the strongest evidence.
- WHO CAN FILE: Must be related by blood/marriage, married/formerly married, have a child in common, or be/have been in an intimate relationship (not casual). Qualifying relationship categories: Spouse, Former spouse, Parent of child in common, Family member (blood/marriage/adoption), Intimate partner (dating), Household member.
- WHAT JUDGE WANTS TO HEAR: (1) Most recent incident with date/time/location/details, (2) Why the risk is ongoing (escalation, stalking, threats, weapons access), (3) Specific relief requested (${reliefOptions}).
- KEY PAPERWORK: ${keyForms}.
- SERVICE: Order not enforceable until served on respondent. Petitioner cannot serve it themselves.
- DURATION: ${ORDER_DURATION_INFO.standard} standard, ${ORDER_DURATION_INFO.aggravated} with aggravating circumstances.
- TRIAL STANDARD: "Fair preponderance of the evidence" (more likely than not).
- LAWYER: Both sides can request court-appointed attorneys (18-B) if indigent — must ask the judge.
- The petition should include: the MOST RECENT incident, the FIRST incident, and the WORST incident, with exact quotes of threats if possible.`;
}

export function buildCoachPrompt(params: {
  intake: IntakeData;
  facts: Facts;
  lastMessages: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  mode: "interview" | "update";
}): { systemInstruction: string; userPrompt: string } {
  const { intake, facts, lastMessages, userMessage, mode } = params;

  const courtContext = buildCourtContext();

  const baseStyle = `You are a safety-first, court-friendly information assistant focused ONLY on New York Family Court Orders of Protection.
This is NOT legal advice.

STYLE RULES:
- Be neutral, factual, and chronological.
- Avoid emotional or inflammatory language. Prefer "reported" / "alleged".
- Avoid legal conclusions. Describe actions and reported events.
- If uncertainties exist, explicitly flag them in assistant_message.
- DO NOT invent facts. Only use INTAKE DATA or RECENT CONVERSATION.
- Output STRICT JSON ONLY (no markdown, no extra text).

${courtContext}

RELATIONSHIP VALIDATION:
- The relationship category MUST be one of: Spouse, Former spouse, Parent of child in common, Family member (blood/marriage/adoption), Intimate partner (dating), or Household member.
- If the user describes a relationship that doesn't clearly fit (e.g., "neighbor", "coworker", "friend"), note in assistant_message that Family Court requires a qualifying relationship and ask them to clarify whether they are/were in an intimate relationship, related by blood/marriage, or household members.

SAFETY AWARENESS:
- If user mentions strangulation, choking, suffocation, weapons, threats to kill, threats to children, suicide threats, stalking, sexual violence, or controlling behavior (financial, medical, isolation), set safety_flags and include a brief safety note in assistant_message reminding them to contact 911 or the National DV Hotline (1-800-799-7233) if in immediate danger.
- Do NOT minimize reported violence. Acknowledge what was shared and ask clarifying questions.`;

  const interviewInstruction = `${baseStyle}

MODE: Interview (investigator). Your goal is to fill missing critical fields with concise, petition-style facts.

INTERVIEW STRATEGY:
- Ask ONE focused question at a time (max 2 if closely related). Do not overwhelm.
- For each key incident, collect: date/time (or approximate date like "early Jan 2026"), location, what happened (use clear action verbs), reported injuries, reported threats (exact quotes if possible), witnesses present, and evidence available.
- After gathering basic facts, probe for ESCALATION PATTERNS: "Has the behavior gotten worse over time?" "When did it start?"
- Ask about CONTROL behaviors: financial control, isolation from family/friends, monitoring phone/location, preventing from leaving.
- Check for prior DV history or order violations by the respondent.
- If user's answer is vague (e.g., "he was mean"), follow up: "Can you describe what specifically happened? What did he say or do?"
- If user's answer contradicts earlier facts, gently note: "Earlier you mentioned X. Can you help me understand how that relates to Y?"
- Prioritize collecting the most serious/recent incidents first — these matter most for the petition.`;

  const updateInstruction = `${baseStyle}

MODE: Roadmap Update (updater). The user is providing a new fact to add. Extract and update the JSON.
Do NOT ask follow-up questions unless the new fact is unclear or contradicts existing information.`;

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

Allowed missing_fields labels ONLY (exact text): ${allowedLabels}

QUESTION PRIORITY (ask max 2 per turn, in this order):
1. relationship_category / cohabitation (jurisdiction — validate against FCA qualifying relationships)
2. top_events (three critical incidents: most recent, first, worst — most important for petition)
3. most_recent_incident_datetime (recency for temporary order)
4. pattern_summary (escalation pattern)
5. safety_status / firearms_access (immediate risk)
6. children_involved (child protective provisions)
7. prior_dv_history / stalking_harassment / isolation_control (pattern evidence)
8. existing_cases_orders (procedural context)
9. evidence_inventory (documentation)
10. requested_relief (what protections to seek)

extracted_facts: Put any NEW facts from the user's message here. Only include fields that have new information. Structure:
{
  "parties": { "petitioner": string, "respondent": string },
  "relationship": string,
  "incidents": [{ "date": "...", "time": "...", "location": "...", "whatHappened": "...", "injuries": "...", "threats": "...", "witnesses": "...", "evidence": "..." }],
  "safetyConcerns": [],
  "requestedRelief": [],
  "evidenceList": [],
  "timeline": []
}

safety_flags: Include "immediate_danger" if the user describes life-threatening situations, strangulation, weapons pointed at them, or active threats. Include descriptive flags like "strangulation_reported", "weapon_access", "stalking_reported", "child_safety_concern", "suicide_threat", "order_violation" as appropriate.

progress_percent: Estimate 0-100 based on how complete the case information is for filing a petition. Weight serious incident details and safety information more heavily than optional fields.

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

const EMPTY_FACTS: Facts = {
  parties: { petitioner: "", respondent: "" },
  relationship: "",
  incidents: [],
  safetyConcerns: [],
  requestedRelief: [],
  evidenceList: [],
  timeline: []
};

function isFactsShape(v: unknown): v is Facts {
  if (!v || typeof v !== "object") return false;
  const f = v as Record<string, unknown>;
  return (
    typeof f.parties === "object" &&
    f.parties !== null &&
    Array.isArray(f.incidents) &&
    Array.isArray(f.safetyConcerns)
  );
}

export function computeMissingFields(intake: IntakeData, facts: Facts): string[] {
  const missing: string[] = [];
  // Lightweight shape check instead of full Zod safeParse (~100x faster).
  // Facts from our own Zustand store are always valid; Zod is only needed
  // when parsing untrusted LLM output (handled elsewhere).
  const safeFacts = isFactsShape(facts) ? facts : EMPTY_FACTS;

  // Check BOTH intake and facts, plus special-case "mostRecentIncidentAt"
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

  // Computed: top_events — require at least 3 incidents with meaningful detail,
  // not just the single intake-seeded incident. The interview needs to collect
  // the most recent, first, and worst incidents separately.
  const detailedIncidents = (safeFacts.incidents || []).filter((inc) => {
    const what = toTrimmedString((inc as any)?.whatHappened);
    const date = toTrimmedString((inc as any)?.date);
    // Require both a date and a description with at least some substance
    return what.length > 0 && date.length > 0;
  });
  if (detailedIncidents.length < 3) missing.push("top_events");

  // Computed: fields with intakeKey=null that need to be gathered during interview.
  // These are only satisfiable by facts collected during the conversation.
  const factsRecord = safeFacts as unknown as Record<string, unknown>;

  // prior_dv_history — check if facts contain any prior DV info
  const hasPriorDV = !valueIsMissing(factsRecord["priorDVHistory"]);
  if (!hasPriorDV) missing.push("prior_dv_history");

  // isolation_control — check if facts contain isolation/control info
  const hasIsolation = !valueIsMissing(factsRecord["isolationControl"]);
  if (!hasIsolation) missing.push("isolation_control");

  // stalking_harassment — check if facts contain stalking/harassment info
  const hasStalking = !valueIsMissing(factsRecord["stalkingHarassment"]);
  if (!hasStalking) missing.push("stalking_harassment");

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