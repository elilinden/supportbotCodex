/**
 * Danger-pattern detection for domestic violence / order of protection context.
 * Returns both a boolean flag and a severity level for nuanced handling.
 */

type DangerPattern = {
  pattern: RegExp;
  severity: "high" | "critical";
  category: string;
};

const DANGER_PATTERNS: DangerPattern[] = [
  // Critical: Immediate life threats
  { pattern: /immediate danger/i, severity: "critical", category: "imminent_threat" },
  { pattern: /in danger right now/i, severity: "critical", category: "imminent_threat" },
  { pattern: /threaten(?:ed|ing)?\s+to\s+kill/i, severity: "critical", category: "death_threat" },
  { pattern: /going to kill/i, severity: "critical", category: "death_threat" },
  { pattern: /said\s+(?:he|she|they)\s+(?:will|would|is going to)\s+kill/i, severity: "critical", category: "death_threat" },
  { pattern: /gun\s+(?:to|at|on|pointed)/i, severity: "critical", category: "weapon_use" },
  { pattern: /pointed\s+(?:a\s+)?(?:gun|firearm|weapon)/i, severity: "critical", category: "weapon_use" },
  { pattern: /strangle[ds]?|strangulation|strangling/i, severity: "critical", category: "strangulation" },
  { pattern: /chok(?:ed|es|ing)\s+(?:me|him|her|them)/i, severity: "critical", category: "strangulation" },
  { pattern: /(?:hands?|arm)\s+(?:around|on)\s+(?:my|the|his|her)\s+(?:neck|throat)/i, severity: "critical", category: "strangulation" },
  { pattern: /can'?t\s+(?:breathe|breath)/i, severity: "critical", category: "strangulation" },
  { pattern: /threaten(?:ed|ing|s)?\s+(?:to\s+)?(?:harm|hurt|injure)\s+(?:the\s+)?(?:child|kid|baby|son|daughter)/i, severity: "critical", category: "child_threat" },
  { pattern: /kill\s+(?:my|our|the)\s+(?:self|myself|himself|herself)/i, severity: "critical", category: "suicide_threat" },
  { pattern: /threaten(?:ed|ing)?\s+(?:to\s+)?(?:commit\s+)?suicide/i, severity: "critical", category: "suicide_threat" },
  { pattern: /(?:bought|purchased|acquired|got)\s+(?:a\s+)?(?:gun|firearm|weapon)/i, severity: "critical", category: "weapon_acquisition" },

  // High: Serious safety concerns
  { pattern: /gun|firearm/i, severity: "high", category: "weapons" },
  { pattern: /weapon|knife|bat|crowbar/i, severity: "high", category: "weapons" },
  { pattern: /can'?t\s+stay\s+safe/i, severity: "high", category: "unsafe" },
  { pattern: /not\s+safe|don'?t\s+feel\s+safe|afraid\s+to\s+go\s+home/i, severity: "high", category: "unsafe" },
  { pattern: /stalking|followed\s+me|tracking\s+(?:me|my)/i, severity: "high", category: "stalking" },
  { pattern: /showing\s+up\s+(?:at|to)\s+(?:my|the)\s+(?:work|job|school|home)/i, severity: "high", category: "stalking" },
  { pattern: /monitor(?:s|ed|ing)\s+(?:my|the)\s+(?:phone|email|social|location)/i, severity: "high", category: "stalking" },
  { pattern: /sexual(?:ly)?\s+(?:assault|abuse|force|attack)/i, severity: "high", category: "sexual_violence" },
  { pattern: /rap(?:e[ds]?|ing)/i, severity: "high", category: "sexual_violence" },
  { pattern: /forc(?:ed|ing)\s+(?:me\s+)?(?:to\s+)?(?:have\s+)?sex/i, severity: "high", category: "sexual_violence" },
  { pattern: /hit\s+(?:me|him|her)|punch(?:ed|ing)|kick(?:ed|ing)|slap(?:ped|ping)|shov(?:ed|ing)|threw\s+(?:me|him|her)/i, severity: "high", category: "physical_violence" },
  { pattern: /broke\s+(?:my|his|her)\s+(?:arm|nose|rib|bone|jaw|tooth)/i, severity: "high", category: "physical_violence" },
  { pattern: /(?:black\s+eye|bruise[ds]?|concussion|fracture[ds]?|hospitalize[ds]?)/i, severity: "high", category: "injuries" },
  { pattern: /(?:isolat|prevent|forbid|won'?t\s+let)\s+(?:me|him|her)\s+(?:from\s+)?(?:see|leav|go|talk|contact|call)/i, severity: "high", category: "isolation" },
  { pattern: /took\s+(?:my|the)\s+(?:phone|keys|car|money|passport|documents)/i, severity: "high", category: "coercive_control" },
  { pattern: /(?:drunk|intoxicated|high|using\s+drugs?)\s+(?:when|and)\s+(?:he|she|they)\s+(?:hit|punch|kick|attack|assault|threaten)/i, severity: "high", category: "substance_abuse" },
  { pattern: /violat(?:ed|ing|es?)\s+(?:the\s+)?(?:order|OP|restraining)/i, severity: "high", category: "order_violation" },
  { pattern: /threaten(?:ed|ing|s)?\s+(?:to\s+)?(?:take|kidnap|abduct)\s+(?:the\s+)?(?:child|kid|baby|son|daughter)/i, severity: "high", category: "child_threat" },
  { pattern: /threaten(?:ed|ing|s)?\s+(?:to\s+)?(?:hurt|harm|kill)\s+(?:my|the|our)\s+(?:pet|dog|cat|animal)/i, severity: "high", category: "animal_threat" },
  { pattern: /(?:killed|hurt|harmed)\s+(?:my|the|our)\s+(?:pet|dog|cat|animal)/i, severity: "high", category: "animal_threat" },
];

export type DangerResult = {
  immediateDanger: boolean;
  severity: "none" | "high" | "critical";
  matchedCategories: string[];
};

/**
 * Detect danger patterns in text. Returns structured result with severity level.
 */
export function detectDanger(text: string): DangerResult {
  if (!text) return { immediateDanger: false, severity: "none", matchedCategories: [] };

  const matched: DangerPattern[] = [];
  for (const dp of DANGER_PATTERNS) {
    if (dp.pattern.test(text)) {
      matched.push(dp);
    }
  }

  if (matched.length === 0) {
    return { immediateDanger: false, severity: "none", matchedCategories: [] };
  }

  const hasCritical = matched.some((m) => m.severity === "critical");
  const categories = Array.from(new Set(matched.map((m) => m.category)));

  return {
    immediateDanger: hasCritical,
    severity: hasCritical ? "critical" : "high",
    matchedCategories: categories,
  };
}

/**
 * Simple boolean check for backward compatibility.
 */
export function detectImmediateDanger(text: string): boolean {
  return detectDanger(text).immediateDanger;
}
