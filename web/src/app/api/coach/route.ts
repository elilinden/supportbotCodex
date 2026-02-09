import { NextResponse } from "next/server";
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
  const body = await request.json();
  const intake = body?.intake as IntakeData | undefined;
  const facts = body?.facts as Facts | undefined;
  const lastMessages = body?.lastMessages as { role: "user" | "assistant"; content: string }[] | undefined;
  const userMessage = (body?.userMessage as string | undefined) || "";

  if (!intake || !facts) {
    return NextResponse.json({ error: "Missing intake or facts" }, { status: 400 });
  }

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

  const mode = body?.mode === "update" ? "update" : "interview";

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
