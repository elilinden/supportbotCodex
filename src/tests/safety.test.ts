import { describe, expect, it } from "vitest";
import { detectImmediateDanger } from "@/lib/safety";

describe("detectImmediateDanger", () => {
  describe("detects all danger patterns", () => {
    it("detects 'gun'", () => {
      expect(detectImmediateDanger("He has a gun")).toBe(true);
    });

    it("detects 'firearm'", () => {
      expect(detectImmediateDanger("There is a firearm in the house")).toBe(true);
    });

    it("detects 'weapon'", () => {
      expect(detectImmediateDanger("He grabbed a weapon")).toBe(true);
    });

    it("detects 'strangle'", () => {
      expect(detectImmediateDanger("He tried to strangle me")).toBe(true);
    });

    it("detects 'choke'", () => {
      expect(detectImmediateDanger("He started to choke me")).toBe(true);
    });

    it("detects 'threaten to kill' (threatened to kill)", () => {
      expect(detectImmediateDanger("He threatened to kill me")).toBe(true);
    });

    it("detects 'threatening to kill'", () => {
      expect(detectImmediateDanger("He is threatening to kill me")).toBe(true);
    });

    it("detects 'immediate danger'", () => {
      expect(detectImmediateDanger("I am in immediate danger")).toBe(true);
    });

    it("detects 'in danger right now'", () => {
      expect(detectImmediateDanger("I am in danger right now")).toBe(true);
    });

    it("detects 'right now'", () => {
      expect(detectImmediateDanger("He is hurting me right now")).toBe(true);
    });

    it("detects \"can't stay safe\"", () => {
      expect(detectImmediateDanger("I can't stay safe here")).toBe(true);
    });
  });

  describe("case insensitivity", () => {
    it("detects uppercase 'GUN'", () => {
      expect(detectImmediateDanger("HE HAS A GUN")).toBe(true);
    });

    it("detects mixed case 'Immediate Danger'", () => {
      expect(detectImmediateDanger("I am in Immediate Danger")).toBe(true);
    });

    it("detects mixed case 'Weapon'", () => {
      expect(detectImmediateDanger("He has a Weapon")).toBe(true);
    });
  });

  describe("returns false for safe inputs", () => {
    it("returns false for a normal sentence", () => {
      expect(detectImmediateDanger("I need help with my case")).toBe(false);
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
