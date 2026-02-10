import { describe, expect, it } from "vitest";
import { detectImmediateDanger, detectDanger } from "@/lib/safety";

describe("detectImmediateDanger", () => {
  describe("detects critical (immediate danger) patterns", () => {
    it("detects 'immediate danger'", () => {
      expect(detectImmediateDanger("I am in immediate danger")).toBe(true);
    });

    it("detects 'in danger right now'", () => {
      expect(detectImmediateDanger("I am in danger right now")).toBe(true);
    });

    it("detects 'threatened to kill'", () => {
      expect(detectImmediateDanger("He threatened to kill me")).toBe(true);
    });

    it("detects 'threatening to kill'", () => {
      expect(detectImmediateDanger("He is threatening to kill me")).toBe(true);
    });

    it("detects 'going to kill'", () => {
      expect(detectImmediateDanger("He said he is going to kill me")).toBe(true);
    });

    it("detects 'strangle'", () => {
      expect(detectImmediateDanger("He tried to strangle me")).toBe(true);
    });

    it("detects strangulation", () => {
      expect(detectImmediateDanger("She reported strangulation")).toBe(true);
    });

    it("detects 'choked me'", () => {
      expect(detectImmediateDanger("He choked me until I couldn't breathe")).toBe(true);
    });

    it("detects 'gun pointed'", () => {
      expect(detectImmediateDanger("He pointed a gun at me")).toBe(true);
    });

    it("detects threat to harm child", () => {
      expect(detectImmediateDanger("He threatened to hurt the child")).toBe(true);
    });

    it("detects suicide threat", () => {
      expect(detectImmediateDanger("He threatened to commit suicide")).toBe(true);
    });

    it("detects weapon acquisition", () => {
      expect(detectImmediateDanger("He bought a gun yesterday")).toBe(true);
    });
  });

  describe("case insensitivity", () => {
    it("detects mixed case 'Immediate Danger'", () => {
      expect(detectImmediateDanger("I am in Immediate Danger")).toBe(true);
    });

    it("detects uppercase 'THREATENED TO KILL'", () => {
      expect(detectImmediateDanger("HE THREATENED TO KILL ME")).toBe(true);
    });
  });

  describe("returns false for non-critical inputs", () => {
    it("returns false for a normal sentence", () => {
      expect(detectImmediateDanger("I need help with my case")).toBe(false);
    });

    it("returns false for general mention of gun (high but not critical)", () => {
      expect(detectImmediateDanger("He has a gun")).toBe(false);
    });

    it("returns false for an unrelated sentence", () => {
      expect(detectImmediateDanger("The weather is nice today")).toBe(false);
    });

    it("returns false for a greeting", () => {
      expect(detectImmediateDanger("Hello, how are you?")).toBe(false);
    });
  });

  describe("handles empty and null-like inputs", () => {
    it("returns false for an empty string", () => {
      expect(detectImmediateDanger("")).toBe(false);
    });

    it("returns false for undefined (cast as any)", () => {
      expect(detectImmediateDanger(undefined as unknown as string)).toBe(false);
    });

    it("returns false for null (cast as any)", () => {
      expect(detectImmediateDanger(null as unknown as string)).toBe(false);
    });
  });
});

describe("detectDanger", () => {
  it("returns severity 'none' for safe text", () => {
    const result = detectDanger("I need help with my case");
    expect(result.severity).toBe("none");
    expect(result.immediateDanger).toBe(false);
    expect(result.matchedCategories).toEqual([]);
  });

  it("returns severity 'high' for weapon mention", () => {
    const result = detectDanger("He has a gun in the house");
    expect(result.severity).toBe("high");
    expect(result.immediateDanger).toBe(false);
    expect(result.matchedCategories).toContain("weapons");
  });

  it("returns severity 'critical' for death threats", () => {
    const result = detectDanger("He threatened to kill me");
    expect(result.severity).toBe("critical");
    expect(result.immediateDanger).toBe(true);
    expect(result.matchedCategories).toContain("death_threat");
  });

  it("detects stalking patterns", () => {
    const result = detectDanger("He has been stalking me and followed me to work");
    expect(result.severity).toBe("high");
    expect(result.matchedCategories).toContain("stalking");
  });

  it("detects physical violence", () => {
    const result = detectDanger("He hit me and shoved me against the wall");
    expect(result.severity).toBe("high");
    expect(result.matchedCategories).toContain("physical_violence");
  });

  it("detects isolation/control", () => {
    const result = detectDanger("He won't let me see my family");
    expect(result.severity).toBe("high");
    expect(result.matchedCategories).toContain("isolation");
  });

  it("detects order violations", () => {
    const result = detectDanger("He violated the order of protection");
    expect(result.severity).toBe("high");
    expect(result.matchedCategories).toContain("order_violation");
  });

  it("returns multiple categories when text matches multiple patterns", () => {
    const result = detectDanger("He threatened to kill me and he has a gun");
    expect(result.severity).toBe("critical");
    expect(result.matchedCategories.length).toBeGreaterThan(1);
  });
});
