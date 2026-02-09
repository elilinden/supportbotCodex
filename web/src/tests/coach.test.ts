import { describe, expect, it } from "vitest";
import { parseCoachResponse } from "@/lib/coach";

const sampleResponse = [
  "```json",
  "{",
  "  \"assistant_message\": \"Thanks for sharing. Let's keep this court-friendly and factual.\",",
  "  \"next_questions\": [\"What is the relationship category?\", \"Do you live together?\"],",
  "  \"extracted_facts\": {",
  "    \"parties\": { \"petitioner\": \"Alex\", \"respondent\": \"Jordan\" },",
  "    \"relationship\": \"Former spouse\",",
  "    \"incidents\": [],",
  "    \"safetyConcerns\": [\"Immediate danger\"],",
  "    \"requestedRelief\": [\"Stay-away order\"],",
  "    \"evidenceList\": [\"Text messages\"],",
  "    \"timeline\": [\"Incident on Jan 5\"]",
  "  },",
  "  \"missing_fields\": [\"relationship_category\", \"cohabitation\"],",
  "  \"progress_percent\": 35,",
  "  \"safety_flags\": [\"immediate_danger\"]",
  "}",
  "```"
].join("\n");

describe("parseCoachResponse", () => {
  it("extracts structured data from JSON with code fences", () => {
    const parsed = parseCoachResponse(sampleResponse);
    expect(parsed).toBeTruthy();
    expect(parsed?.assistantMessage).toContain("court-friendly");
    expect(parsed?.nextQuestions.length).toBe(2);
    expect(parsed?.missingFields).toContain("relationship_category");
  });
});
