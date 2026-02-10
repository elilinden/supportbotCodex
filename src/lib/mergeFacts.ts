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
 * Check if two incidents are likely the same event (same date + similar description).
 */
function incidentMatches(a: Incident, b: Incident): boolean {
  if (!a.date && !b.date) return false;
  if (a.date.trim().toLowerCase() !== b.date.trim().toLowerCase()) return false;
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
 * Merge two incident objects, preferring longer/non-empty values from incoming.
 */
function mergeIncident(existing: Incident, incoming: Incident): Incident {
  const pick = (a: string, b: string) => {
    if (!b.trim()) return a;
    if (!a.trim()) return b;
    return b.length >= a.length ? b : a;
  };
  return {
    date: pick(existing.date, incoming.date),
    time: pick(existing.time, incoming.time),
    location: pick(existing.location, incoming.location),
    whatHappened: pick(existing.whatHappened, incoming.whatHappened),
    injuries: pick(existing.injuries, incoming.injuries),
    threats: pick(existing.threats, incoming.threats),
    witnesses: pick(existing.witnesses, incoming.witnesses),
    evidence: pick(existing.evidence, incoming.evidence),
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
