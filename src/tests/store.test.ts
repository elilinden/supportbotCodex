import { describe, expect, it } from "vitest";
import { createJSONStorage } from "zustand/middleware";
import { createCaseStore, defaultIntake } from "@/store/useCaseStore";

const memoryStorage = (() => {
  const storage = new Map<string, string>();
  return {
    getItem: (name: string) => storage.get(name) ?? null,
    setItem: (name: string, value: string) => {
      storage.set(name, value);
    },
    removeItem: (name: string) => {
      storage.delete(name);
    }
  } as Storage;
})();

describe("case store", () => {
  it("creates and updates a case", () => {
    const store = createCaseStore(createJSONStorage(() => memoryStorage));
    const id = store.getState().createCase({
      ...defaultIntake,
      relationshipCategory: "Spouse",
      safetyStatus: "Safe now"
    });

    const caseFile = store.getState().cases.find((item) => item.id === id);
    expect(caseFile).toBeTruthy();
    expect(caseFile?.facts.relationship).toContain("Spouse");

    store.getState().updateOutputs(id, { script2Min: "Updated script" });
    const updated = store.getState().cases.find((item) => item.id === id);
    expect(updated?.outputs.script2Min).toBe("Updated script");
  });
});
