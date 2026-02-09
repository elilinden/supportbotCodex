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
import { detectImmediateDanger } from "@/lib/safety";
import { mergeFacts } from "@/lib/mergeFacts";
import type { Facts, IntakeData } from "@/lib/types";

const IMMEDIATE_DANGER_FLAG = "immediate_danger";

/** Zod schema for validating incoming coach requests */
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
  facts: z.object({
    parties: z.object({
      petitioner: z.string().max(500).default(""),
      respondent: z.string().max(500).default("")
    }).default({ petitioner: "", respondent: "" }),
    relationship: z.string().max(500).default(""),
    incidents: z.array(z.record(z.unknown())).default([]),
    safetyConcerns: z.array(z.string()).default([]),
    requestedRelief: z.array(z.string()).default([]),
    evidenceList: z.array(z.string()).default([]),
    timeline: z.array(z.string()).default([])
  }),
  lastMessages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(5000)
  })).max(20).default([]),
  userMessage: z.string().max(5000).default(""),
  mode: z.enum(["interview", "update"]).default("interview")
});

function buildFallbackResponse(intake: IntakeData, facts: Facts, userMessage: string) {
  const missingFields = computeMissingFields(intake, facts);
  const nextQuestions = buildQuestionsFromMissing(missingFields, 3);
  const safetyFlags = [] as string[];
  if (intake.safetyStatus === "Immediate danger") safetyFlags.push(IMMEDIATE_DANGER_FLAG);
  if (detectImmediateDanger(userMessage)) safetyFlags.push(IMMEDIATE_DANGER_FLAG);

  const questionsText = nextQuestions.length
    ? `\n\nTo keep this court-friendly and clear, I still need:\n- ${nextQuestions.join("\n- ")}`
    : "";

  return {
    assistant_message:
      "Thanks for sharing. I can help organize New York Family Court Order of Protection information in a neutral, factual way." +
      " If anything feels unsafe right now, contact emergency services." +
      questionsText,
    next_questions: nextQuestions,
    extracted_facts: {},
    missing_fields: missingFields,
    progress_percent: calculateProgress(missingFields),
    safety_flags: Array.from(new Set(safetyFlags))
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CoachRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { intake, facts, lastMessages, userMessage, mode: parsedMode } = parsed.data as unknown as {
    intake: IntakeData;
    facts: Facts;
    lastMessages: { role: "user" | "assistant"; content: string }[];
    userMessage: string;
    mode: "interview" | "update";
  };

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    const fallback = buildFallbackResponse(intake, facts, userMessage);
    return NextResponse.json({
      ...fallback,
      assistant_message:
        "Gemini is not configured. Add GEMINI_API_KEY to web/.env.local to enable coach responses. " +
        "This tool provides information-only guidance and does not give legal advice." +
        (fallback.next_questions.length
          ? `\n\nTo continue, please answer:\n- ${fallback.next_questions.join("\n- ")}`
          : "")
    });
  }

  const mode = parsedMode;

  const { systemInstruction, userPrompt } = buildCoachPrompt({
    intake,
    facts,
    lastMessages: lastMessages || [],
    userMessage,
    mode
  });
  const systemInstructionWithSafetyPrompt =
    `${systemInstruction}\n\n` +
    "If the user describes general arguing, explicitly ask if there was any physical contact, threats of harm with a weapon, or unwanted repetitive contact (harassment/stalking).";

  const baseSafetyFlags = [] as string[];
  if (intake.safetyStatus === "Immediate danger") baseSafetyFlags.push(IMMEDIATE_DANGER_FLAG);
  if (detectImmediateDanger(userMessage)) baseSafetyFlags.push(IMMEDIATE_DANGER_FLAG);

  try {
    const response = await callGemini({ systemInstruction: systemInstructionWithSafetyPrompt, userPrompt }, apiKey, model);
    const parsed = parseCoachResponse(response.text);

    if (!parsed || !parsed.assistantMessage) {
      return NextResponse.json(buildFallbackResponse(intake, facts, userMessage));
    }

    const extractedFacts = coerceExtractedFacts(parsed.extractedFacts) || undefined;
    
    // Merge the new facts (including virtual fields) into the existing facts
    const mergedFacts = mergeFacts(facts, extractedFacts);
    
    // Compute missing fields using the MERGED facts (so we don't ask for things we just learned)
    const missingFields = computeMissingFields(intake, mergedFacts);
    const nextQuestions =
      mode === "interview" ? buildQuestionsFromMissing(missingFields, 3) : [];
    const progressPercent = calculateProgress(missingFields);
    const safetyFlags = Array.from(new Set([...baseSafetyFlags, ...parsed.safetyFlags]));

    return NextResponse.json({
      assistant_message: parsed.assistantMessage,
      next_questions: nextQuestions,
      extracted_facts: extractedFacts || {},
      missing_fields: missingFields,
      progress_percent: progressPercent,
      safety_flags: safetyFlags
    });
  } catch {
    return NextResponse.json(buildFallbackResponse(intake, facts, userMessage));
  }
}
