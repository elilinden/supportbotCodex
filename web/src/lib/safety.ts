const IMMEDIATE_DANGER_PATTERNS = [
  /immediate danger/i,
  /in danger right now/i,
  /right now/i,
  /threaten(?:ed|ing) to kill/i,
  /gun|firearm|weapon/i,
  /strangle|choke/i,
  /can't stay safe/i
];

export function detectImmediateDanger(text: string): boolean {
  if (!text) return false;
  return IMMEDIATE_DANGER_PATTERNS.some((pattern) => pattern.test(text));
}
