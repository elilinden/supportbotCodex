// src/app/api/coach/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { callGemini } from "@/lib/gemini";
import {
  buildCoachPrompt,
  parseCoachResponse,
  computeMissingFields,
  buildQuestionsFromMissing,
  calculateProgress,
  coerceExtractedFacts
} from "@/lib/coach";
import { detectImmediateDanger, detectDanger } from "@/lib/safety";
import { mergeFacts } from "@/lib/mergeFacts";
import type { Facts, IntakeData } from "@/lib/types";

const IMMEDIATE_DANGER_FLAG = "immediate_danger";
const DEFAULT_MODEL = "gemini-2.5-flash";

// Require API_SECRET in production to prevent abuse
const REQUIRE_API_SECRET_IN_PROD = true;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function uniqStrings(xs: unknown): string[] {
  if (!Array.isArray(xs)) return [];
  return Array.from(new Set(xs.filter((x) => typeof x === "string"))) as string[];
}

/**
 * Zod schema validates "shape + max lengths" from the client.
 * We intentionally keep these as generic strings and later coerce into IntakeData/Facts
 * (because IntakeData uses narrow unions like "" | RelationshipCategory).
 */
const CoachRequestSchema = z.object({
  intake: z.object({
    petitionerName: z.string().max(500).default(""),
    respondentName: z.string().max(500).default(""),
    relationshipCategory: z.string().max(200).default(""),
    cohabitation: z.string().max(200).default(""),
    mostRecentIncidentAt: z.string().max(200).default(""),
    patternOfIncidents: z.string().max(5000).default(""),
    childrenInvolved: z.string().max(200).default(""),
    existingCasesOrders: z.string().max(2000).default(""),
    firearmsAccess: z.string().max(50).default(""),
    safetyStatus: z.string().max(50).default(""),
    evidenceInventory: z.string().max(5000).default(""),
    requestedRelief: z.string().max(2000).default("")
  }),

  facts: z
    .object({
      parties: z
        .object({
          petitioner: z.string().max(500).default(""),
          respondent: z.string().max(500).default("")
        })
        .default({ petitioner: "", respondent: "" }),
      relationship: z.string().max(500).default(""),
      incidents: z.array(z.record(z.unknown())).default([]),
      safetyConcerns: z.array(z.string()).default([]),
      requestedRelief: z.array(z.string()).default([]),
      evidenceList: z.array(z.string()).default([]),
      timeline: z.array(z.string()).default([])
    })
    .default({
      parties: { petitioner: "", respondent: "" },
      relationship: "",
      incidents: [],
      safetyConcerns: [],
      requestedRelief: [],
      evidenceList: [],
      timeline: []
    }),

  lastMessages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(5000)
      })
    )
    .max(20)
    .default([]),

  userMessage: z.string().max(5000).default(""),
  mode: z.enum(["interview", "update"]).default("interview")
});

type CoachRequest = z.infer<typeof CoachRequestSchema>;

/**
 * Coerce parsed data into your strict types.
 */
function coerceIntake(raw: CoachRequest["intake"]): IntakeData {
  return {
    petitionerName: raw.petitionerName ?? "",
    respondentName: raw.respondentName ?? "",
    relationshipCategory: (raw.relationshipCategory ?? "") as IntakeData["relationshipCategory"],
    cohabitation: (raw.cohabitation ?? "") as IntakeData["cohabitation"],
    mostRecentIncidentAt: raw.mostRecentIncidentAt ?? "",
    patternOfIncidents: raw.patternOfIncidents ?? "",
    childrenInvolved: (raw.childrenInvolved ?? "") as IntakeData["childrenInvolved"],
    existingCasesOrders: raw.existingCasesOrders ?? "",
    firearmsAccess: (raw.firearmsAccess ?? "") as IntakeData["firearmsAccess"],
    safetyStatus: (raw.safetyStatus ?? "") as IntakeData["safetyStatus"],
    evidenceInventory: raw.evidenceInventory ?? "",
    requestedRelief: raw.requestedRelief ?? ""
  };
}

function coerceFacts(raw: CoachRequest["facts"]): Facts {
  return raw as unknown as Facts;
}

/**
 * Collect safety flags from multiple sources: intake status, user message text analysis,
 * and conversation history.
 */
function collectSafetyFlags(intake: IntakeData, userMessage: string, lastMessages: { role: string; content: string }[]): Set<string> {
  const flags = new Set<string>();

  // Check intake safety status
  if (intake.safetyStatus === "Immediate danger") flags.add(IMMEDIATE_DANGER_FLAG);

  // Analyze current user message
  const dangerResult = detectDanger(userMessage);
  if (dangerResult.immediateDanger) flags.add(IMMEDIATE_DANGER_FLAG);
  for (const cat of dangerResult.matchedCategories) {
    flags.add(cat);
  }

  // Also check recent user messages for patterns across the conversation
  for (const msg of lastMessages) {
    if (msg.role === "user") {
      const result = detectDanger(msg.content);
      if (result.immediateDanger) flags.add(IMMEDIATE_DANGER_FLAG);
      for (const cat of result.matchedCategories) {
        flags.add(cat);
      }
    }
  }

  return flags;
}

function buildFallbackResponse(intake: IntakeData, facts: Facts, userMessage: string, lastMessages: { role: string; content: string }[] = []) {
  const missingFields = computeMissingFields(intake, facts);
  const nextQuestions = buildQuestionsFromMissing(missingFields, 3);

  const safetyFlags = collectSafetyFlags(intake, userMessage, lastMessages);

  const questionsText = nextQuestions.length
    ? `\n\nTo keep this court-friendly and clear, I still need:\n- ${nextQuestions.join("\n- ")}`
    : "";

  return {
    assistant_message:
      "Thanks for sharing. I can help organize New York Family Court Order of Protection information in a neutral, factual way." +
      " If anything feels unsafe right now, contact emergency services (911) or the National DV Hotline (1-800-799-7233)." +
      questionsText,
    next_questions: nextQuestions,
    extracted_facts: {},
    missing_fields: missingFields,
    progress_percent: calculateProgress(missingFields),
    safety_flags: Array.from(safetyFlags)
  };
}

function isAuthorized(req: Request) {
  const envSecret = process.env.API_SECRET;

  if (REQUIRE_API_SECRET_IN_PROD && process.env.NODE_ENV === "production" && !envSecret) {
    return false;
  }

  // Dev-friendly: if no secret configured, allow.
  if (!envSecret) return true;

  const headerSecret = req.headers.get("x-api-secret");
  return headerSecret === envSecret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return json({ error: "Unauthorized" }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsedReq = CoachRequestSchema.safeParse(body);
  if (!parsedReq.success) {
    return json(
      { error: "Invalid request", details: parsedReq.error.flatten().fieldErrors },
      400
    );
  }

  const reqData = parsedReq.data as CoachRequest;
  const intake = coerceIntake(reqData.intake);
  const facts = coerceFacts(reqData.facts);
  const lastMessages = reqData.lastMessages ?? [];
  const userMessage = reqData.userMessage ?? "";
  const mode = reqData.mode ?? "interview";

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    const fallback = buildFallbackResponse(intake, facts, userMessage, lastMessages);
    return json({
      ...fallback,
      assistant_message:
        "Gemini is not configured. Add GEMINI_API_KEY to web/.env.local to enable coach responses. " +
        "This tool provides information-only guidance and does not give legal advice." +
        (fallback.next_questions.length
          ? `\n\nTo continue, please answer:\n- ${fallback.next_questions.join("\n- ")}`
          : "")
    });
  }

  const baseSafetyFlags = collectSafetyFlags(intake, userMessage, lastMessages);

  const { systemInstruction, userPrompt } = buildCoachPrompt({
    intake,
    facts,
    lastMessages,
    userMessage,
    mode
  });

  // Additional safety clarifier appended to system instruction
  const systemInstructionWithSafetyPrompt =
    `${systemInstruction}\n\n` +
    "ADDITIONAL SAFETY PROBE: If the user describes general arguing or conflict without specifics, " +
    "explicitly ask if there was any physical contact, threats of harm, use of or access to weapons, " +
    "or unwanted repetitive contact (harassment/stalking). These details are critical for the petition.";

  try {
    const llmResponse = await callGemini(
      { systemInstruction: systemInstructionWithSafetyPrompt, userPrompt },
      apiKey,
      model
    );

    const parsed = parseCoachResponse(llmResponse.text);
    if (!parsed?.assistantMessage) {
      return json(buildFallbackResponse(intake, facts, userMessage, lastMessages));
    }

    const extractedFacts = (coerceExtractedFacts(parsed.extractedFacts) ?? {}) as object;

    // Merge new facts into existing, then compute missing based on merged
    const mergedFacts = mergeFacts(facts, extractedFacts as Partial<Facts>);
    const missingFields = computeMissingFields(intake, mergedFacts);

    const nextQuestions =
      mode === "interview" ? buildQuestionsFromMissing(missingFields, 3) : [];

    // Combine server-side safety detection with LLM-reported flags
    const safetyFlags = Array.from(
      new Set([...Array.from(baseSafetyFlags), ...uniqStrings(parsed.safetyFlags)])
    );

    return json({
      assistant_message: parsed.assistantMessage,
      next_questions: nextQuestions,
      extracted_facts: extractedFacts,
      missing_fields: missingFields,
      progress_percent: calculateProgress(missingFields),
      safety_flags: safetyFlags
    });
  } catch (e) {
    console.error("[coach] POST failed", e);
    return json(buildFallbackResponse(intake, facts, userMessage, lastMessages));
  }
}
