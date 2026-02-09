import { describe, expect, it } from "vitest";
import {
  buildFactsFromIntake,
  buildOutputsFromFacts,
  deriveAssumptions,
  deriveUncertainties
} from "@/lib/case";
import type { Facts, IntakeData } from "@/lib/types";

function makeIntake(overrides?: Partial<IntakeData>): IntakeData {
  return {
    petitionerName: "Alice Smith",
    respondentName: "Bob Jones",
    relationshipCategory: "Spouse",
    cohabitation: "Lives together now",
    mostRecentIncidentAt: "2024-06-15T14:30:00Z",
    patternOfIncidents: "Repeated verbal and physical abuse",
    childrenInvolved: "Children involved",
    existingCasesOrders: "Prior temporary order #12345",
    firearmsAccess: "Yes",
    safetyStatus: "Unsafe",
    evidenceInventory: "Photos, text messages",
    requestedRelief: "Full order of protection, stay away order",
    ...overrides
  };
}

function makeFacts(overrides?: Partial<Facts>): Facts {
  return {
    parties: { petitioner: "Alice Smith", respondent: "Bob Jones" },
    relationship: "Spouse / Lives together now",
    incidents: [
      {
        date: "Jun 15, 2024",
        time: "02:30 PM",
        location: "",
        whatHappened: "Repeated verbal and physical abuse",
        injuries: "",
        threats: "",
        witnesses: "Children status: Children involved",
        evidence: "Photos, text messages"
      }
    ],
    safetyConcerns: ["Safety status: Unsafe", "Firearms access: Yes"],
    requestedRelief: ["Full order of protection", "stay away order"],
    evidenceList: ["Photos", "text messages"],
    timeline: [
      "Most recent incident on Jun 15, 2024 at 02:30 PM.",
      "Pattern: Repeated verbal and physical abuse",
      "Existing cases/orders: Prior temporary order #12345"
    ],
    ...overrides
  };
}

describe("buildFactsFromIntake", () => {
  it("creates a facts structure with correct parties", () => {
    const intake = makeIntake();
    const facts = buildFactsFromIntake(intake);
    expect(facts.parties.petitioner).toBe("Alice Smith");
    expect(facts.parties.respondent).toBe("Bob Jones");
  });

  it("defaults petitioner to 'Petitioner' when name is empty", () => {
    const intake = makeIntake({ petitionerName: "" });
    const facts = buildFactsFromIntake(intake);
    expect(facts.parties.petitioner).toBe("Petitioner");
  });

  it("defaults respondent to 'Respondent' when name is empty", () => {
    const intake = makeIntake({ respondentName: "" });
    const facts = buildFactsFromIntake(intake);
    expect(facts.parties.respondent).toBe("Respondent");
  });

  it("creates relationship from category and cohabitation", () => {
    const intake = makeIntake();
    const facts = buildFactsFromIntake(intake);
    expect(facts.relationship).toContain("Spouse");
    expect(facts.relationship).toContain("Lives together now");
  });

  it("creates incidents array with at least one incident", () => {
    const intake = makeIntake();
    const facts = buildFactsFromIntake(intake);
    expect(facts.incidents).toHaveLength(1);
    expect(facts.incidents[0].whatHappened).toBe("Repeated verbal and physical abuse");
  });

  it("includes children status in witnesses field when children are involved", () => {
    const intake = makeIntake({ childrenInvolved: "Children involved" });
    const facts = buildFactsFromIntake(intake);
    expect(facts.incidents[0].witnesses).toContain("Children status");
  });

  it("sets witnesses to empty string when children are not involved", () => {
    const intake = makeIntake({ childrenInvolved: "" });
    const facts = buildFactsFromIntake(intake);
    expect(facts.incidents[0].witnesses).toBe("");
  });

  it("builds safetyConcerns from safetyStatus and firearmsAccess", () => {
    const intake = makeIntake();
    const facts = buildFactsFromIntake(intake);
    expect(facts.safetyConcerns.length).toBeGreaterThanOrEqual(1);
    expect(facts.safetyConcerns.some((c) => c.includes("Safety status"))).toBe(true);
    expect(facts.safetyConcerns.some((c) => c.includes("Firearms access"))).toBe(true);
  });

  it("returns empty safetyConcerns when safetyStatus and firearmsAccess are empty", () => {
    const intake = makeIntake({ safetyStatus: "", firearmsAccess: "" });
    const facts = buildFactsFromIntake(intake);
    expect(facts.safetyConcerns).toEqual([]);
  });

  it("splits requestedRelief into an array", () => {
    const intake = makeIntake({ requestedRelief: "Order A, Order B" });
    const facts = buildFactsFromIntake(intake);
    expect(facts.requestedRelief).toEqual(["Order A", "Order B"]);
  });

  it("splits evidenceInventory into evidenceList", () => {
    const intake = makeIntake({ evidenceInventory: "Photos, Texts" });
    const facts = buildFactsFromIntake(intake);
    expect(facts.evidenceList).toEqual(["Photos", "Texts"]);
  });

  it("creates a non-empty timeline when data is provided", () => {
    const intake = makeIntake();
    const facts = buildFactsFromIntake(intake);
    expect(facts.timeline.length).toBeGreaterThan(0);
  });

  it("includes pattern in timeline", () => {
    const intake = makeIntake();
    const facts = buildFactsFromIntake(intake);
    expect(facts.timeline.some((t) => t.includes("Pattern"))).toBe(true);
  });

  it("includes existing cases/orders in timeline", () => {
    const intake = makeIntake();
    const facts = buildFactsFromIntake(intake);
    expect(facts.timeline.some((t) => t.includes("Existing cases/orders"))).toBe(true);
  });
});

describe("buildOutputsFromFacts", () => {
  it("produces a non-empty script2Min", () => {
    const facts = makeFacts();
    const outputs = buildOutputsFromFacts(facts);
    expect(outputs.script2Min).toBeTruthy();
    expect(outputs.script2Min.length).toBeGreaterThan(0);
  });

  it("includes respondent name in script2Min", () => {
    const facts = makeFacts();
    const outputs = buildOutputsFromFacts(facts);
    expect(outputs.script2Min).toContain("Bob Jones");
  });

  it("produces a non-empty outline5Min", () => {
    const facts = makeFacts();
    const outputs = buildOutputsFromFacts(facts);
    expect(outputs.outline5Min.length).toBeGreaterThan(0);
  });

  it("produces a non-empty evidenceChecklist", () => {
    const facts = makeFacts();
    const outputs = buildOutputsFromFacts(facts);
    expect(outputs.evidenceChecklist.length).toBeGreaterThan(0);
  });

  it("includes standard evidence items in evidenceChecklist", () => {
    const facts = makeFacts();
    const outputs = buildOutputsFromFacts(facts);
    expect(outputs.evidenceChecklist.some((e) => e.includes("Screenshots"))).toBe(true);
    expect(outputs.evidenceChecklist.some((e) => e.includes("Photos of injuries"))).toBe(true);
  });

  it("appends facts.evidenceList items to evidenceChecklist", () => {
    const facts = makeFacts({ evidenceList: ["Custom evidence item"] });
    const outputs = buildOutputsFromFacts(facts);
    expect(outputs.evidenceChecklist).toContain("Custom evidence item");
  });

  it("produces a non-empty timelineSummary", () => {
    const facts = makeFacts();
    const outputs = buildOutputsFromFacts(facts);
    expect(outputs.timelineSummary.length).toBeGreaterThan(0);
  });

  it("produces a non-empty whatToBring", () => {
    const facts = makeFacts();
    const outputs = buildOutputsFromFacts(facts);
    expect(outputs.whatToBring.length).toBeGreaterThan(0);
  });

  it("produces a non-empty whatToExpect", () => {
    const facts = makeFacts();
    const outputs = buildOutputsFromFacts(facts);
    expect(outputs.whatToExpect.length).toBeGreaterThan(0);
  });

  it("falls back to incidents for timeline when facts.timeline is empty", () => {
    const facts = makeFacts({
      timeline: [],
      incidents: [
        {
          date: "Jun 15, 2024",
          time: "02:30 PM",
          location: "Home",
          whatHappened: "Verbal abuse",
          injuries: "",
          threats: "",
          witnesses: "",
          evidence: ""
        }
      ]
    });
    const outputs = buildOutputsFromFacts(facts);
    expect(outputs.script2Min).toContain("Jun 15, 2024");
  });
});

describe("deriveAssumptions", () => {
  it("returns empty array when all fields are provided", () => {
    const intake = makeIntake();
    const facts = buildFactsFromIntake(intake);
    const assumptions = deriveAssumptions(facts, intake);
    expect(assumptions).toEqual([]);
  });

  it("flags missing petitioner name", () => {
    const intake = makeIntake({ petitionerName: "" });
    const facts = buildFactsFromIntake(intake);
    const assumptions = deriveAssumptions(facts, intake);
    expect(assumptions).toContain("Petitioner name not provided.");
  });

  it("flags missing respondent name", () => {
    const intake = makeIntake({ respondentName: "" });
    const facts = buildFactsFromIntake(intake);
    const assumptions = deriveAssumptions(facts, intake);
    expect(assumptions).toContain("Respondent name not provided.");
  });

  it("flags missing incident date/time", () => {
    const intake = makeIntake({ mostRecentIncidentAt: "" });
    const facts = buildFactsFromIntake(intake);
    const assumptions = deriveAssumptions(facts, intake);
    expect(assumptions).toContain("Most recent incident date/time unknown.");
  });

  it("flags missing requested relief", () => {
    const intake = makeIntake({ requestedRelief: "" });
    const facts = buildFactsFromIntake(intake);
    const assumptions = deriveAssumptions(facts, intake);
    expect(assumptions).toContain("Requested relief not specified.");
  });

  it("returns multiple assumptions when multiple fields are missing", () => {
    const intake = makeIntake({
      petitionerName: "",
      respondentName: "",
      mostRecentIncidentAt: "",
      requestedRelief: ""
    });
    const facts = buildFactsFromIntake(intake);
    const assumptions = deriveAssumptions(facts, intake);
    expect(assumptions).toHaveLength(4);
  });
});

describe("deriveUncertainties", () => {
  it("returns empty array when all relevant fields are provided", () => {
    const intake = makeIntake();
    const facts = makeFacts();
    // Ensure incident has a location
    facts.incidents[0].location = "Home";
    const uncertainties = deriveUncertainties(facts, intake);
    expect(uncertainties).toEqual([]);
  });

  it("flags missing pattern of incidents", () => {
    const intake = makeIntake({ patternOfIncidents: "" });
    const facts = makeFacts();
    facts.incidents[0].location = "Home";
    const uncertainties = deriveUncertainties(facts, intake);
    expect(uncertainties).toContain("Pattern of incidents is not described yet.");
  });

  it("flags missing existing cases or orders", () => {
    const intake = makeIntake({ existingCasesOrders: "" });
    const facts = makeFacts();
    facts.incidents[0].location = "Home";
    const uncertainties = deriveUncertainties(facts, intake);
    expect(uncertainties).toContain("Existing cases or orders not described.");
  });

  it("flags missing evidence inventory", () => {
    const intake = makeIntake({ evidenceInventory: "" });
    const facts = makeFacts();
    facts.incidents[0].location = "Home";
    const uncertainties = deriveUncertainties(facts, intake);
    expect(uncertainties).toContain("Evidence inventory not listed yet.");
  });

  it("flags missing incident location", () => {
    const intake = makeIntake();
    const facts = makeFacts();
    facts.incidents[0].location = "";
    const uncertainties = deriveUncertainties(facts, intake);
    expect(uncertainties).toContain("Incident location is missing.");
  });

  it("returns multiple uncertainties when multiple fields are missing", () => {
    const intake = makeIntake({
      patternOfIncidents: "",
      existingCasesOrders: "",
      evidenceInventory: ""
    });
    const facts = makeFacts();
    facts.incidents[0].location = "";
    const uncertainties = deriveUncertainties(facts, intake);
    expect(uncertainties).toHaveLength(4);
  });
});
