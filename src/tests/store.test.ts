import { describe, expect, it, beforeEach } from "vitest";
import { useCaseStore, defaultIntake } from "@/store/useCaseStore";

describe("case store", () => {
  beforeEach(() => {
    // Reset store state before each test
    useCaseStore.setState({ cases: [], activeCaseId: null });
  });

  it("creates and updates a case", () => {
    const id = useCaseStore.getState().createCase({
      ...defaultIntake,
      relationshipCategory: "Spouse",
      safetyStatus: "Safe now"
    });

    const caseFile = useCaseStore.getState().cases.find((item) => item.id === id);
    expect(caseFile).toBeTruthy();
    expect(caseFile?.facts.relationship).toContain("Spouse");

    useCaseStore.getState().updateOutputs(id, { script2Min: "Updated script" });
    const updated = useCaseStore.getState().cases.find((item) => item.id === id);
    expect(updated?.outputs.script2Min).toBe("Updated script");
  });
});
