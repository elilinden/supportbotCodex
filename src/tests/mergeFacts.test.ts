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

  describe("incidents append + deduplicate behavior", () => {
    it("appends new incidents with different dates", () => {
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
      expect(result.incidents).toHaveLength(2);
      expect(result.incidents[0].date).toBe("Jan 01");
      expect(result.incidents[1].date).toBe("Feb 15");
    });

    it("merges matching incidents (same date) instead of duplicating", () => {
      const current = makeEmptyFacts({
        incidents: [
          {
            date: "Jan 01",
            time: "10:00",
            location: "",
            whatHappened: "Something happened",
            injuries: "",
            threats: "",
            witnesses: "",
            evidence: ""
          }
        ]
      });
      const incoming = [
        {
          date: "Jan 01",
          time: "10:00",
          location: "Home",
          whatHappened: "Something happened with more details added",
          injuries: "bruises",
          threats: "",
          witnesses: "",
          evidence: ""
        }
      ];
      const result = mergeFacts(current, { incidents: incoming });
      expect(result.incidents).toHaveLength(1);
      expect(result.incidents[0].location).toBe("Home");
      expect(result.incidents[0].injuries).toBe("bruises");
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

  describe("safetyConcerns append + deduplicate behavior", () => {
    it("appends new unique concerns to existing ones", () => {
      const current = makeEmptyFacts({ safetyConcerns: ["Old concern"] });
      const result = mergeFacts(current, { safetyConcerns: ["New concern"] });
      expect(result.safetyConcerns).toEqual(["Old concern", "New concern"]);
    });

    it("deduplicates identical concerns", () => {
      const current = makeEmptyFacts({ safetyConcerns: ["Same concern"] });
      const result = mergeFacts(current, { safetyConcerns: ["Same concern"] });
      expect(result.safetyConcerns).toEqual(["Same concern"]);
    });

    it("preserves current when incoming safetyConcerns is empty", () => {
      const current = makeEmptyFacts({ safetyConcerns: ["Keep this"] });
      const result = mergeFacts(current, { safetyConcerns: [] });
      expect(result.safetyConcerns).toEqual(["Keep this"]);
    });
  });

  describe("requestedRelief append + deduplicate behavior", () => {
    it("appends new unique relief to existing ones", () => {
      const current = makeEmptyFacts({ requestedRelief: ["Stay away order"] });
      const result = mergeFacts(current, { requestedRelief: ["Full order of protection"] });
      expect(result.requestedRelief).toEqual(["Stay away order", "Full order of protection"]);
    });

    it("preserves current when incoming requestedRelief is empty", () => {
      const current = makeEmptyFacts({ requestedRelief: ["Stay away order"] });
      const result = mergeFacts(current, { requestedRelief: [] });
      expect(result.requestedRelief).toEqual(["Stay away order"]);
    });
  });

  describe("evidenceList append + deduplicate behavior", () => {
    it("appends new unique evidence items", () => {
      const current = makeEmptyFacts({ evidenceList: ["Photos"] });
      const result = mergeFacts(current, { evidenceList: ["Videos", "Texts"] });
      expect(result.evidenceList).toEqual(["Photos", "Videos", "Texts"]);
    });

    it("deduplicates case-insensitively", () => {
      const current = makeEmptyFacts({ evidenceList: ["Photos"] });
      const result = mergeFacts(current, { evidenceList: ["photos", "Videos"] });
      expect(result.evidenceList).toEqual(["Photos", "Videos"]);
    });

    it("preserves current when incoming evidenceList is empty", () => {
      const current = makeEmptyFacts({ evidenceList: ["Photos"] });
      const result = mergeFacts(current, { evidenceList: [] });
      expect(result.evidenceList).toEqual(["Photos"]);
    });
  });

  describe("timeline append + deduplicate behavior", () => {
    it("appends new unique timeline events", () => {
      const current = makeEmptyFacts({ timeline: ["Old event"] });
      const result = mergeFacts(current, { timeline: ["New event"] });
      expect(result.timeline).toEqual(["Old event", "New event"]);
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
