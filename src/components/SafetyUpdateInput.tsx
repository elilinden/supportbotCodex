"use client";

import { useState } from "react";
import { useCaseStore } from "@/store/useCaseStore";
import { mergeFacts } from "@/lib/mergeFacts";
import { buildOutputsFromFacts } from "@/lib/case";
import type { CaseFile } from "@/lib/types";

export function SafetyUpdateInput({
  caseFile,
  onSafetyInterrupt
}: {
  caseFile: CaseFile;
  onSafetyInterrupt: () => void;
}) {
  const updateFacts = useCaseStore((state) => state.updateFacts);
  const updateOutputs = useCaseStore((state) => state.updateOutputs);
  const setSafety = useCaseStore((state) => state.setSafety);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const handleSubmit = async () => {
    const message = input.trim();
    if (!message || loading) return;

    setLoading(true);
    setError(null);
    setNote(null);

    try {
      // ✅ FIX: Added x-api-secret header to authorize the request
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-secret": process.env.NEXT_PUBLIC_API_SECRET || "" 
        },
        body: JSON.stringify({
          mode: "update",
          caseId: caseFile.id,
          intake: caseFile.intake,
          facts: caseFile.facts,
          lastMessages: [],
          userMessage: message
        })
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Check API Secret in Vercel.");
        throw new Error(`Update error ${response.status}`);
      }

      const data = await response.json();
      const extractedFacts = (data.extracted_facts || {}) as object;
      const mergedFacts = mergeFacts(caseFile.facts, extractedFacts as any);

      updateFacts(caseFile.id, mergedFacts);
      updateOutputs(caseFile.id, buildOutputsFromFacts(mergedFacts));

      if (data.safety_flags && Array.isArray(data.safety_flags)) {
        if (data.safety_flags.includes("immediate_danger")) {
          setSafety(caseFile.id, true, "Safety interrupt triggered during quick update.", data.safety_flags);
          onSafetyInterrupt();
        } else if (data.safety_flags.length) {
          setSafety(caseFile.id, caseFile.safety.immediateDanger, caseFile.safety.notes, data.safety_flags);
        }
      }

      setNote(data.assistant_message || "Update saved.");
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="flex-1 rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs text-ui-text placeholder:text-ui-textMuted shadow-sm outline-none focus:border-ui-primary focus:ring-4 focus:ring-ui-primarySoft"
          aria-label="Quick update input"
          placeholder="Quick update (e.g., 'I remembered he hit me in 2023')"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSubmit();
          }}
          disabled={loading}
        />
        <button
          className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text shadow-sm hover:bg-ui-surface2 disabled:opacity-60"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Updating" : "Update"}
        </button>
      </div>

      {note ? <p className="text-xs text-ui-textMuted" role="status">{note}</p> : null}
      {error ? <p className="text-xs text-ui-danger" role="alert">{error}</p> : null}
    </div>
  );
}
