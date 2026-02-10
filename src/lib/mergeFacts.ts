import type { Facts, Incident } from "@/lib/types";

/**
 * Deduplicate string arrays by normalizing to lowercase trimmed values.
 */
function dedupeStrings(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map((s) => s.trim().toLowerCase()));
  const result = [...existing];
  for (const item of incoming) {
    const key = item.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

/**
 * Normalize date strings so "January 5, 2026", "01/05/2026", "Jan 5 2026"
 * all compare as equal for deduplication.
 */
const MONTH_MAP: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04",
  may: "05", june: "06", july: "07", august: "08",
  september: "09", october: "10", november: "11", december: "12",
  jan: "01", feb: "02", mar: "03", apr: "04",
  jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function normalizeDate(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  const lower = s.toLowerCase();

  // "Month Day, Year" or "Month Day Year" or "Month Day"
  const namedMatch = lower.match(
    /^(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:\s*,?\s*(\d{4}))?/
  );
  if (namedMatch) {
    const mm = MONTH_MAP[namedMatch[1]] || "00";
    const dd = namedMatch[2].padStart(2, "0");
    const yyyy = namedMatch[3] || "0000";
    return `${yyyy}-${mm}-${dd}`;
  }

  // "MM/DD/YYYY" or "M/D/YYYY"
  const slashMatch = lower.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const mm = slashMatch[1].padStart(2, "0");
    const dd = slashMatch[2].padStart(2, "0");
    return `${slashMatch[3]}-${mm}-${dd}`;
  }

  // "YYYY-MM-DD"
  const isoMatch = lower.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }

  return lower;
}

/**
 * Check if two incidents are likely the same event (same date + similar description).
 * Uses normalized dates so "January 5" and "01/05/2026" can match.
 */
function incidentMatches(a: Incident, b: Incident): boolean {
  if (!a.date && !b.date) return false;
  const aNorm = normalizeDate(a.date);
  const bNorm = normalizeDate(b.date);
  if (aNorm !== bNorm) return false;
  // Same date — check if whatHappened overlaps significantly
  if (a.whatHappened && b.whatHappened) {
    const aLower = a.whatHappened.trim().toLowerCase();
    const bLower = b.whatHappened.trim().toLowerCase();
    return aLower === bLower || aLower.includes(bLower) || bLower.includes(aLower);
  }
  // Same date, at least one has no description — treat as same
  return true;
}

/**
 * Merge two incident objects.
 * Identity fields (date, time, location): keep the more specific (longer) value.
 * Detail fields (whatHappened, injuries, threats, witnesses, evidence): concatenate unique content.
 */
function mergeIncident(existing: Incident, incoming: Incident): Incident {
  const pickSpecific = (a: string, b: string) => {
    if (!b.trim()) return a;
    if (!a.trim()) return b;
    return b.length >= a.length ? b : a;
  };

  const concat = (a: string, b: string) => {
    if (!b.trim()) return a;
    if (!a.trim()) return b;
    const aLower = a.trim().toLowerCase();
    const bLower = b.trim().toLowerCase();
    if (aLower.includes(bLower)) return a;
    if (bLower.includes(aLower)) return b;
    return `${a.trim()}; ${b.trim()}`;
  };

  return {
    date: pickSpecific(existing.date, incoming.date),
    time: pickSpecific(existing.time, incoming.time),
    location: pickSpecific(existing.location, incoming.location),
    whatHappened: concat(existing.whatHappened, incoming.whatHappened),
    injuries: concat(existing.injuries, incoming.injuries),
    threats: concat(existing.threats, incoming.threats),
    witnesses: concat(existing.witnesses, incoming.witnesses),
    evidence: concat(existing.evidence, incoming.evidence),
  };
}

/**
 * Deduplicate incidents: merge matching ones, append truly new ones.
 */
function dedupeIncidents(existing: Incident[], incoming: Incident[]): Incident[] {
  const result = [...existing];
  for (const inc of incoming) {
    const matchIdx = result.findIndex((e) => incidentMatches(e, inc));
    if (matchIdx >= 0) {
      result[matchIdx] = mergeIncident(result[matchIdx], inc);
    } else {
      result.push(inc);
    }
  }
  return result;
}

export function mergeFacts(current: Facts, incoming?: Partial<Facts>): Facts {
  if (!incoming) return current;
  return {
    ...current,
    ...incoming,
    parties: {
      ...current.parties,
      ...(incoming.parties || {}),
    },
    incidents: dedupeIncidents(current.incidents, incoming.incidents || []),
    safetyConcerns: dedupeStrings(current.safetyConcerns, incoming.safetyConcerns || []),
    requestedRelief: dedupeStrings(current.requestedRelief, incoming.requestedRelief || []),
    evidenceList: dedupeStrings(current.evidenceList, incoming.evidenceList || []),
    timeline: dedupeStrings(current.timeline, incoming.timeline || []),
  };
}
