"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type PersistOptions } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import { encryptedStorage } from "@/lib/encryption";
import {
  buildFactsFromIntake,
  buildOutputsFromFacts,
  deriveAssumptions,
  deriveUncertainties
} from "@/lib/case";
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

export type InterviewResponseUpdate = {
  message?: CoachMessage;
  facts?: Facts;
  outputs?: CaseOutputs;
  safety?: { immediateDanger: boolean; notes?: string; flags?: string[] };
  status?: CaseFile["status"];
};

export type CaseStoreState = {
  cases: CaseFile[];
  activeCaseId: string | null;

  createCase: (intake: IntakeData) => string;
  updateCase: (id: string, patch: Partial<CaseFile>) => void;
  updateFacts: (id: string, facts: Partial<Facts>) => void;
  updateOutputs: (id: string, outputs: Partial<CaseOutputs>) => void;

  addMessage: (id: string, message: CoachMessage) => void;

  /** Batch update: apply message + facts + outputs + safety + status in ONE set() call. */
  applyInterviewResponse: (id: string, update: InterviewResponseUpdate) => void;

  setAssumptions: (id: string, assumptions: string[]) => void;
  setUncertainties: (id: string, uncertainties: string[]) => void;

  setSafety: (id: string, immediateDanger: boolean, notes?: string, flags?: string[]) => void;

  incrementTurn: (id: string) => void;
  resetTurn: (id: string) => void;

  setStatus: (id: string, status: CaseFile["status"]) => void;
  clearAll: () => void;
};

// What we actually persist (NO functions)
type PersistedSlice = Pick<CaseStoreState, "cases" | "activeCaseId">;

const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

const isBrowser = typeof window !== "undefined";
const STORE_VERSION = 1;

const persistOptions: PersistOptions<CaseStoreState, PersistedSlice> = {
  name: "ny-op-case-store-encrypted",
  version: STORE_VERSION,

  storage: createJSONStorage(() => (isBrowser ? encryptedStorage : memoryStorage)),

  partialize: (state) => ({
    cases: state.cases,
    activeCaseId: state.activeCaseId
  }),

  migrate: (persisted, version) => {
    // Persisted data only contains the slice, not the actions.
    if (!persisted || typeof persisted !== "object") {
      return { cases: [], activeCaseId: null };
    }

    const p = persisted as Partial<PersistedSlice>;

    if (version < 1) {
      return {
        cases: Array.isArray(p.cases) ? p.cases : [],
        activeCaseId: typeof p.activeCaseId === "string" ? p.activeCaseId : null
      };
    }

    return {
      cases: Array.isArray(p.cases) ? p.cases : [],
      activeCaseId: typeof p.activeCaseId === "string" ? p.activeCaseId : null
    };
  }
};

export const useCaseStore = create<CaseStoreState>()(
  persist(
    (set, get) => ({
      cases: [],
      activeCaseId: null,

      createCase: (intake) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `case_${Math.random().toString(36).slice(2, 10)}`;

        const createdAt = new Date().toISOString();

        const facts = buildFactsFromIntake(intake);
        const outputs = buildOutputsFromFacts(facts);
        const assumptions = deriveAssumptions(facts, intake);
        const uncertainties = deriveUncertainties(facts, intake);

        const immediateDanger = intake.safetyStatus === "Immediate danger";

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
            immediateDanger,
            notes: "",
            flags: immediateDanger ? ["immediate_danger"] : []
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
            item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
          )
        })),

      updateFacts: (id, factsPatch) =>
        set((state) => ({
          cases: state.cases.map((item) =>
            item.id === id
              ? {
                  ...item,
                  facts: { ...item.facts, ...factsPatch },
                  updatedAt: new Date().toISOString()
                }
              : item
          )
        })),

      updateOutputs: (id, outputsPatch) =>
        set((state) => ({
          cases: state.cases.map((item) =>
            item.id === id
              ? {
                  ...item,
                  outputs: { ...item.outputs, ...outputsPatch },
                  updatedAt: new Date().toISOString()
                }
              : item
          )
        })),

      addMessage: (id, message) =>
        set((state) => ({
          cases: state.cases.map((item) =>
            item.id === id
              ? { ...item, messages: [...item.messages, message], updatedAt: new Date().toISOString() }
              : item
          )
        })),

      applyInterviewResponse: (id, update) =>
        set((state) => ({
          cases: state.cases.map((item) => {
            if (item.id !== id) return item;
            const now = new Date().toISOString();
            let next = { ...item, updatedAt: now };
            if (update.message) {
              next = { ...next, messages: [...next.messages, update.message] };
            }
            if (update.facts) {
              next = { ...next, facts: update.facts };
            }
            if (update.outputs) {
              next = { ...next, outputs: update.outputs };
            }
            if (update.safety) {
              next = {
                ...next,
                safety: {
                  immediateDanger: update.safety.immediateDanger,
                  notes: update.safety.notes ?? next.safety.notes,
                  flags: update.safety.flags?.length
                    ? Array.from(new Set(update.safety.flags))
                    : next.safety.flags
                }
              };
            }
            if (update.status) {
              next = { ...next, status: update.status };
            }
            return next;
          })
        })),

      setAssumptions: (id, assumptions) =>
        set((state) => ({
          cases: state.cases.map((item) =>
            item.id === id ? { ...item, assumptions, updatedAt: new Date().toISOString() } : item
          )
        })),

      setUncertainties: (id, uncertainties) =>
        set((state) => ({
          cases: state.cases.map((item) =>
            item.id === id ? { ...item, uncertainties, updatedAt: new Date().toISOString() } : item
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
                    notes: notes ?? item.safety.notes,
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
              ? { ...item, turnCount: (item.turnCount ?? 0) + 1, updatedAt: new Date().toISOString() }
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

      clearAll: () => set(() => ({ cases: [], activeCaseId: null }))
    }),
    persistOptions
  )
);

/**
 * Returns false until the persisted Zustand store has rehydrated from storage.
 * Use this to avoid showing "Case not found" before data is loaded.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useCaseStore.persist.onFinishHydration(() => setHydrated(true));
    // If already hydrated (e.g., SSR → client), set immediately
    if (useCaseStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}