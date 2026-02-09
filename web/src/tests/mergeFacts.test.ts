import { describe, expect, it } from "vitest";
import { mergeFacts } from "@/lib/mergeFacts";
import type { Facts } from "@/lib/types";

function makeEmptyFacts(overrides?: Partial<Facts>): Facts {
  return {
    parties: { petitioner: "Alice", respondent: "Bob" },
    relationship: "Spouse",
    incidents: [],
    safetyConcerns: [],
    requestedRelief: [],
    evidenceList: [],
    timeline: [],
    ...overrides
  };
}

describe("mergeFacts", () => {
  describe("merging with empty / undefined incoming", () => {
    it("returns current facts when incoming is undefined", () => {
      const current = makeEmptyFacts();
      const result = mergeFacts(current, undefined);
      expect(result).toEqual(current);
    });

    it("returns current facts when incoming is an empty object", () => {
      const current = makeEmptyFacts();
      const result = mergeFacts(current, {});
      // parties should still be the current ones
      expect(result.parties.petitioner).toBe("Alice");
      expect(result.parties.respondent).toBe("Bob");
    });
  });

  describe("merging parties", () => {
    it("merges incoming parties over current parties", () => {
      const current = makeEmptyFacts();
      const result = mergeFacts(current, {
        parties: { petitioner: "Carol", respondent: "Dave" }
      });
      expect(result.parties.petitioner).toBe("Carol");
      expect(result.parties.respondent).toBe("Dave");
    });

    it("partially merges parties when only one field is provided", () => {
      const current = makeEmptyFacts();
      const result = mergeFacts(current, {
        parties: { petitioner: "Carol" } as Facts["parties"]
      });
      expect(result.parties.petitioner).toBe("Carol");
      expect(result.parties.respondent).toBe("Bob");
    });
  });

  describe("incidents override behavior", () => {
    it("overrides current incidents when incoming incidents are non-empty", () => {
      const current = makeEmptyFacts({
        incidents: [
          {
            date: "Jan 01",
            time: "10:00",
            location: "Home",
            whatHappened: "Old incident",
            injuries: "",
            threats: "",
            witnesses: "",
            evidence: ""
          }
        ]
      });
      const newIncidents = [
        {
          date: "Feb 15",
          time: "14:00",
          location: "Office",
          whatHappened: "New incident",
          injuries: "",
          threats: "",
          witnesses: "",
          evidence: ""
        }
      ];
      const result = mergeFacts(current, { incidents: newIncidents });
      expect(result.incidents).toEqual(newIncidents);
      expect(result.incidents).not.toEqual(current.incidents);
    });

    it("preserves current incidents when incoming incidents array is empty", () => {
      const currentIncidents = [
        {
          date: "Jan 01",
          time: "10:00",
          location: "Home",
          whatHappened: "Existing incident",
          injuries: "",
          threats: "",
          witnesses: "",
          evidence: ""
        }
      ];
      const current = makeEmptyFacts({ incidents: currentIncidents });
      const result = mergeFacts(current, { incidents: [] });
      expect(result.incidents).toEqual(currentIncidents);
    });

    it("preserves current incidents when incoming incidents is undefined", () => {
      const currentIncidents = [
        {
          date: "Mar 10",
          time: "08:00",
          location: "Park",
          whatHappened: "Event",
          injuries: "",
          threats: "",
          witnesses: "",
          evidence: ""
        }
      ];
      const current = makeEmptyFacts({ incidents: currentIncidents });
      const result = mergeFacts(current, { relationship: "Updated" });
      expect(result.incidents).toEqual(currentIncidents);
    });
  });

  describe("safetyConcerns override behavior", () => {
    it("overrides when incoming safetyConcerns are non-empty", () => {
      const current = makeEmptyFacts({ safetyConcerns: ["Old concern"] });
      const result = mergeFacts(current, { safetyConcerns: ["New concern"] });
      expect(result.safetyConcerns).toEqual(["New concern"]);
    });

    it("preserves current when incoming safetyConcerns is empty", () => {
      const current = makeEmptyFacts({ safetyConcerns: ["Keep this"] });
      const result = mergeFacts(current, { safetyConcerns: [] });
      expect(result.safetyConcerns).toEqual(["Keep this"]);
    });
  });

  describe("requestedRelief override behavior", () => {
    it("overrides when incoming requestedRelief is non-empty", () => {
      const current = makeEmptyFacts({ requestedRelief: ["Stay away order"] });
      const result = mergeFacts(current, { requestedRelief: ["Full order of protection"] });
      expect(result.requestedRelief).toEqual(["Full order of protection"]);
    });

    it("preserves current when incoming requestedRelief is empty", () => {
      const current = makeEmptyFacts({ requestedRelief: ["Stay away order"] });
      const result = mergeFacts(current, { requestedRelief: [] });
      expect(result.requestedRelief).toEqual(["Stay away order"]);
    });
  });

  describe("evidenceList override behavior", () => {
    it("overrides when incoming evidenceList is non-empty", () => {
      const current = makeEmptyFacts({ evidenceList: ["Photos"] });
      const result = mergeFacts(current, { evidenceList: ["Videos", "Texts"] });
      expect(result.evidenceList).toEqual(["Videos", "Texts"]);
    });

    it("preserves current when incoming evidenceList is empty", () => {
      const current = makeEmptyFacts({ evidenceList: ["Photos"] });
      const result = mergeFacts(current, { evidenceList: [] });
      expect(result.evidenceList).toEqual(["Photos"]);
    });
  });

  describe("timeline override behavior", () => {
    it("overrides when incoming timeline is non-empty", () => {
      const current = makeEmptyFacts({ timeline: ["Old event"] });
      const result = mergeFacts(current, { timeline: ["New event"] });
      expect(result.timeline).toEqual(["New event"]);
    });

    it("preserves current when incoming timeline is empty", () => {
      const current = makeEmptyFacts({ timeline: ["Keep this event"] });
      const result = mergeFacts(current, { timeline: [] });
      expect(result.timeline).toEqual(["Keep this event"]);
    });
  });

  describe("scalar field merging", () => {
    it("overrides relationship when incoming provides it", () => {
      const current = makeEmptyFacts({ relationship: "Spouse" });
      const result = mergeFacts(current, { relationship: "Former spouse" });
      expect(result.relationship).toBe("Former spouse");
    });
  });
});
