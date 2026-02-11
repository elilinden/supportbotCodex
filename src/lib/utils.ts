export const EMPTY_VALUE = "-";

export function splitList(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatDateTime(isoString: string): { date: string; time: string } {
  if (!isoString) return { date: "", time: "" };
  const dateObj = new Date(isoString);
  if (Number.isNaN(dateObj.getTime())) return { date: isoString, time: "" };
  const date = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
  return { date, time };
}

export function safeText(value: string | undefined | null, fallback = EMPTY_VALUE): string {
  if (!value || !value.trim()) return fallback;
  return value;
}

export function createTimelineLabel(title: string, detail: string): string {
  return detail ? `${title}: ${detail}` : title;
}

/**
 * Shared output normalization function.
 * Runs on all generated text to fix common template merge issues:
 * - Sentence casing after periods
 * - Whitespace cleanup (collapse multiple spaces, trim)
 * - Deduplicate consecutive words ("I have I have" → "I have")
 * - Basic grammar smoothing for common patterns
 * - Safe placeholder fallback when data is missing
 */
export function normalizeOutputText(text: string): string {
  if (!text) return text;

  let result = text;

  // Collapse multiple spaces / tabs into single space
  result = result.replace(/[ \t]+/g, " ");

  // Deduplicate consecutive identical words/phrases (case-insensitive)
  // Handles "I have I have", "the the", "respondent He he" etc.
  result = result.replace(/\b(\w+(?:\s+\w+)?)\s+\1\b/gi, "$1");

  // Fix "respondent He" → "respondent he" (lowercase after respondent/petitioner)
  result = result.replace(
    /\b(respondent|petitioner)\s+([A-Z])(?=[a-z])/g,
    (_match, word, letter) => `${word} ${letter.toLowerCase()}`
  );

  // Fix sentences starting with lowercase after a period
  result = result.replace(/\.\s+([a-z])/g, (_match, letter) => `. ${letter.toUpperCase()}`);

  // Remove doubled punctuation
  result = result.replace(/\.{2,}/g, ".");
  result = result.replace(/,,+/g, ",");

  // Clean up spacing around punctuation
  result = result.replace(/\s+\./g, ".");
  result = result.replace(/\s+,/g, ",");

  // Ensure single space after punctuation
  result = result.replace(/\.(?=[A-Za-z])/g, ". ");
  result = result.replace(/,(?=[A-Za-z])/g, ", ");

  return result.trim();
}

/**
 * Mapping from developer-facing field keys to user-facing labels.
 * Used in the Interview page "Next Targets" and anywhere developer
 * field names appear in the UI.
 */
export const FIELD_DISPLAY_LABELS: Record<string, string> = {
  top_events: "Key incidents",
  most_recent_incident_datetime: "Most recent incident date/time",
  prior_dv_history: "Prior abuse history",
  isolation_control: "Isolation / control",
  stalking_harassment: "Stalking / harassment",
  relationship_category: "Relationship type",
  cohabitation: "Living situation",
  pattern_summary: "Pattern of behavior",
  safety_status: "Safety status",
  firearms_access: "Firearms access",
  children_involved: "Children involved",
  existing_cases_orders: "Existing cases / orders",
  evidence_inventory: "Evidence inventory",
  "requested_relief(optional)": "Requested protections",
  "petitioner_name(optional)": "Your name",
  "respondent_name(optional)": "Other person's name",
};
