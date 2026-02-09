"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type PersistStorage } from "zustand/middleware";
import { buildFactsFromIntake, buildOutputsFromFacts, deriveAssumptions, deriveUncertainties } from "@/lib/case";
import type { CaseFile, CaseOutputs, CoachMessage, Facts, IntakeData } from "@/lib/types";

export const defaultIntake: IntakeData = {
  petitionerName: "",
  respondentName: "",
  relationshipCategory: "",
  cohabitation: "",
  mostRecentIncidentAt: "",
  patternOfIncidents: "",
  childrenInvolved: "",
  existingCasesOrders: "",
  firearmsAccess: "",
  safetyStatus: "",
  evidenceInventory: "",
  requestedRelief: ""
};

export type CaseStoreState = {
  cases: CaseFile[];
  activeCaseId: string | null;
  createCase: (intake: IntakeData) => string;
  updateCase: (id: string, patch: Partial<CaseFile>) => void;
  updateFacts: (id: string, facts: Partial<Facts>) => void;
  updateOutputs: (id: string, outputs: Partial<CaseOutputs>) => void;
  addMessage: (id: string, message: CoachMessage) => void;
  setAssumptions: (id: string, assumptions: string[]) => void;
  setUncertainties: (id: string, uncertainties: string[]) => void;
  setSafety: (id: string, immediateDanger: boolean, notes?: string, flags?: string[]) => void;
  incrementTurn: (id: string) => void;
  setStatus: (id: string, status: CaseFile["status"]) => void;
  resetTurn: (id: string) => void;
  clearAll: () => void;
};

export const createCaseStore = (storage?: PersistStorage<CaseStoreState>) =>
  create<CaseStoreState>()(
    persist(
      (set, get) => ({
        cases: [],
        activeCaseId: null,
        createCase: (intake) => {
          const id = typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `case_${Math.random().toString(36).slice(2, 9)}`;
          const createdAt = new Date().toISOString();
          const facts = buildFactsFromIntake(intake);
          const outputs = buildOutputsFromFacts(facts);
          const assumptions = deriveAssumptions(facts, intake);
          const uncertainties = deriveUncertainties(facts, intake);

          const newCase: CaseFile = {
            id,
            createdAt,
            updatedAt: createdAt,
            status: "interview",
            turnCount: 0,
            intake,
            facts,
            outputs,
            assumptions,
            uncertainties,
            messages: [],
            safety: {
              immediateDanger: intake.safetyStatus === "Immediate danger",
              notes: "",
              flags: intake.safetyStatus === "Immediate danger" ? ["immediate_danger"] : []
            }
          };

          set((state) => ({
            cases: [...state.cases, newCase],
            activeCaseId: id
          }));

          return id;
        },
        updateCase: (id, patch) =>
          set((state) => ({
            cases: state.cases.map((item) =>
              item.id === id
                ? {
                    ...item,
                    ...patch,
                    updatedAt: new Date().toISOString()
                  }
                : item
            )
          })),
        updateFacts: (id, facts) =>
          set((state) => ({
            cases: state.cases.map((item) =>
              item.id === id
                ? {
                    ...item,
                    facts: { ...item.facts, ...facts },
                    updatedAt: new Date().toISOString()
                  }
                : item
            )
          })),
        updateOutputs: (id, outputs) =>
          set((state) => ({
            cases: state.cases.map((item) =>
              item.id === id
                ? {
                    ...item,
                    outputs: { ...item.outputs, ...outputs },
                    updatedAt: new Date().toISOString()
                  }
                : item
            )
          })),
        addMessage: (id, message) =>
          set((state) => ({
            cases: state.cases.map((item) =>
              item.id === id
                ? {
                    ...item,
                    messages: [...item.messages, message],
                    updatedAt: new Date().toISOString()
                  }
                : item
            )
          })),
        setAssumptions: (id, assumptions) =>
          set((state) => ({
            cases: state.cases.map((item) =>
              item.id === id
                ? {
                    ...item,
                    assumptions,
                    updatedAt: new Date().toISOString()
                  }
                : item
            )
          })),
        setUncertainties: (id, uncertainties) =>
          set((state) => ({
            cases: state.cases.map((item) =>
              item.id === id
                ? {
                    ...item,
                    uncertainties,
                    updatedAt: new Date().toISOString()
                  }
                : item
            )
          })),
        setSafety: (id, immediateDanger, notes, flags) =>
          set((state) => ({
            cases: state.cases.map((item) =>
              item.id === id
                ? {
                    ...item,
                    safety: {
                      immediateDanger,
                      notes: notes || item.safety.notes,
                      flags: flags && flags.length ? Array.from(new Set(flags)) : item.safety.flags
                    },
                    updatedAt: new Date().toISOString()
                  }
                : item
            )
          })),
        incrementTurn: (id) =>
          set((state) => ({
            cases: state.cases.map((item) =>
              item.id === id
                ? {
                    ...item,
                    turnCount: (item.turnCount ?? 0) + 1,
                    updatedAt: new Date().toISOString()
                  }
                : item
            )
          })),
        resetTurn: (id) =>
          set((state) => ({
            cases: state.cases.map((item) =>
              item.id === id ? { ...item, turnCount: 0, updatedAt: new Date().toISOString() } : item
            )
          })),
        setStatus: (id, status) =>
          set((state) => ({
            cases: state.cases.map((item) =>
              item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
            )
          })),
        clearAll: () => set({ cases: [], activeCaseId: null })
      }),
      {
        name: "ny-op-case-store",
        storage
      }
    )
  );

export const useCaseStore = createCaseStore(
  typeof window !== "undefined"
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(
        () =>
          ({
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {},
            key: () => null,
            length: 0
          }) as Storage
      )
);
