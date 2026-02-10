"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { CaseSubNav } from "@/components/CaseSubNav";
import { SafetyInterrupt } from "@/components/SafetyInterrupt";
import { useCaseStore, useHydrated } from "@/store/useCaseStore";
import { computeMissingFields } from "@/lib/coach";
import { mergeFacts } from "@/lib/mergeFacts";
import { buildOutputsFromFacts } from "@/lib/case";

const MAX_TURNS = 5;

export default function InterviewPage() {
  const params = useParams<{ id: string | string[] }>();
  const caseId = Array.isArray(params.id) ? params.id[0] : params.id;

  const caseFile = useCaseStore((state) => state.cases.find((item) => item.id === caseId));
  const addMessage = useCaseStore((state) => state.addMessage);
  const updateFacts = useCaseStore((state) => state.updateFacts);
  const updateOutputs = useCaseStore((state) => state.updateOutputs);
  const incrementTurn = useCaseStore((state) => state.incrementTurn);
  const setStatus = useCaseStore((state) => state.setStatus);
  const setSafety = useCaseStore((state) => state.setSafety);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [interruptOpen, setInterruptOpen] = useState(false);

  const initialized = useRef(false);

  const missingFields = useMemo(() => {
    if (!caseFile) return [];
    return computeMissingFields(caseFile.intake, caseFile.facts);
  }, [caseFile]);

  useEffect(() => {
    if (!caseFile) return;
    const currentTurns = caseFile.turnCount ?? 0;
    const complete = missingFields.length === 0 || currentTurns >= MAX_TURNS;
    setDone(complete);
    if (complete && caseFile.status !== "active") {
      setStatus(caseFile.id, "active");
    }
  }, [caseFile, missingFields, setStatus]);

  const askInterviewQuestion = async (message: string, turnCountOverride?: number) => {
    if (!caseFile) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "interview",
          caseId: caseFile.id,
          intake: caseFile.intake,
          facts: caseFile.facts,
          lastMessages: caseFile.messages.slice(-8).map((msg) => ({ role: msg.role, content: msg.content })),
          userMessage: message
        })
      });

      if (!response.ok) throw new Error(`Interview error ${response.status}`);

      const data = await response.json();

      const assistantMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: "assistant" as const,
        content: data.assistant_message || "",
        createdAt: new Date().toISOString()
      };

      addMessage(caseFile.id, assistantMessage);

      const extractedFacts = (data.extracted_facts || {}) as object;
      const mergedFacts = mergeFacts(caseFile.facts, extractedFacts as any);
      updateFacts(caseFile.id, mergedFacts);
      updateOutputs(caseFile.id, buildOutputsFromFacts(mergedFacts));

      const stillMissing = computeMissingFields(caseFile.intake, mergedFacts);
      const turnCountValue = typeof turnCountOverride === "number" ? turnCountOverride : caseFile.turnCount ?? 0;
      const isComplete = stillMissing.length === 0 || turnCountValue >= MAX_TURNS;

      setDone(isComplete);

      if (data.safety_flags && Array.isArray(data.safety_flags)) {
        if (data.safety_flags.includes("immediate_danger")) {
          setSafety(caseFile.id, true, "Safety interrupt triggered during interview.", data.safety_flags);
          setInterruptOpen(true);
        } else if (data.safety_flags.length) {
          setSafety(caseFile.id, caseFile.safety.immediateDanger, caseFile.safety.notes, data.safety_flags);
        }
      }

      if (isComplete && caseFile.status !== "active") {
        setStatus(caseFile.id, "active");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!caseFile || initialized.current) return;

    const shouldAsk = missingFields.length > 0 && (caseFile.turnCount ?? 0) < MAX_TURNS;
    if (!shouldAsk) {
      initialized.current = true;
      return;
    }

    const hasAssistant = caseFile.messages.some((msg) => msg.role === "assistant");
    if (hasAssistant) {
      initialized.current = true;
      return;
    }

    initialized.current = true;
    void askInterviewQuestion("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseFile, missingFields]);

  const handleSend = async () => {
    if (!caseFile) return;
    if (done) return;

    const message = input.trim();
    if (!message) return;

    setInput("");
    setError(null);

    const userMessage = {
      id: `msg_${Date.now()}`,
      role: "user" as const,
      content: message,
      createdAt: new Date().toISOString()
    };

    addMessage(caseFile.id, userMessage);

    const nextTurn = (caseFile.turnCount ?? 0) + 1;
    incrementTurn(caseFile.id);

    await askInterviewQuestion(message, nextTurn);
  };

  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <GlassCard className="space-y-4 max-w-2xl mx-auto mt-20 animate-pulse">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="h-4 w-64 rounded bg-slate-100" />
      </GlassCard>
    );
  }

  if (!caseFile) {
    return (
      <GlassCard className="space-y-4 max-w-2xl mx-auto mt-20">
        <h1 className="text-2xl font-display font-semibold text-ui-text">Case not found</h1>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50"
          >
            Back Home
          </Link>
          <Link
            href="/settings"
            className="inline-flex rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50"
          >
            Settings
          </Link>
        </div>
      </GlassCard>
    );
  }

  const turnsUsed = caseFile.turnCount ?? 0;
  const modeLabel = caseFile.status === "active" ? "Active" : "Draft";

  return (
    <div className="min-h-[calc(100vh-120px)]">
      <div className="mb-6">
        <CaseSubNav caseId={caseFile.id} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* LEFT SIDEBAR — visible on all screens, collapses in single-column on mobile */}
        <aside>
          <GlassCard className="p-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
              <div className="mt-2 space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Mode</span>
                  <span className="font-semibold text-ui-text">{modeLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Turns</span>
                  <span className="font-semibold text-ui-text">
                    {turnsUsed} / {MAX_TURNS}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Missing</span>
                  <span className="font-semibold text-ui-text">{missingFields.length}</span>
                </div>
              </div>
            </div>

            {!done ? (
              <div className="rounded-xl border border-ui-danger/25 bg-ui-danger/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ui-danger/90">Interview</p>
                <p className="mt-2 text-xs text-slate-700 leading-relaxed">
                  Answer in short, factual sentences. Dates, locations, injuries, threats, evidence.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Complete</p>
                <p className="mt-2 text-xs text-slate-700 leading-relaxed">You can generate the final roadmap now.</p>
                <Link
                  href={`/case/${caseFile.id}/roadmap`}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-ui-text hover:opacity-95"
                >
                  Generate Roadmap
                </Link>
              </div>
            )}
          </GlassCard>
        </aside>

        {/* MAIN */}
        <main className="space-y-6">
          {/* Header row (dashboard-like) */}
          <GlassCardStrong className="p-5">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-slate-500">Interview</p>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-ui-text">Guided Interview</h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Informational only (not legal advice). Focused on missing critical details.
              </p>
            </div>

            {/* KPI row (same vibe as Roadmap) */}
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Turns</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-display font-bold text-ui-text">{turnsUsed}</span>
                  <span className="text-xs text-slate-500">of {MAX_TURNS}</span>
                </div>
                <p className="mt-2 text-xs text-slate-600">Max turns before auto-complete.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Missing</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-display font-bold text-ui-text">{missingFields.length}</span>
                  <span className="text-xs text-slate-500">fields</span>
                </div>
                <p className="mt-2 text-xs text-slate-600">Dates, locations, injuries, threats, evidence.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-display font-bold text-ui-text">{done ? "Done" : "In progress"}</span>
                </div>
                <p className="mt-2 text-xs text-slate-600">Complete to unlock Roadmap.</p>
              </div>
            </div>
          </GlassCardStrong>

          {/* Content grid */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Chat */}
            <GlassCard className="flex h-[640px] flex-col p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-ui-text">Conversation</h2>
              </div>

              <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                {caseFile.messages.length ? (
                  caseFile.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-2xl border px-4 py-3 text-xs ${
                        msg.role === "user"
                          ? "border-slate-200 bg-white text-ui-text"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        {msg.role === "user" ? "You" : "Assistant"}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-600 italic">Waiting to begin the interview...</p>
                )}
              </div>

              {error ? <p className="mt-3 text-xs text-rose-600" role="alert">{error}</p> : null}

              <div className="mt-4 flex items-center gap-2">
                <input
                  className={[
                    "flex-1 rounded-full border px-4 py-2 text-xs",
                    "border-slate-200 bg-white text-ui-text shadow-sm outline-none",
                    "placeholder:text-slate-400",
                    "focus:border-ui-primary focus:ring-4 focus:ring-ui-primary/20",
                    "disabled:cursor-not-allowed disabled:opacity-60"
                  ].join(" ")}
                  aria-label="Interview response"
                  placeholder={done ? "Interview complete" : "Answer the interview question..."}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleSend();
                  }}
                  disabled={loading || done}
                />
                <button
                  className="rounded-full bg-ui-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => void handleSend()}
                  disabled={loading || done}
                >
                  {loading ? "Sending" : "Send"}
                </button>
              </div>
              {done ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Interview complete. You can generate your final roadmap.
                  </p>
                  <Link
                    href={`/case/${caseFile.id}/roadmap`}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-ui-text hover:opacity-95"
                  >
                    Generate Roadmap
                  </Link>
                </div>
              ) : null}
            </GlassCard>

            {/* Right panel */}
            <aside className="space-y-6">
              <GlassCard className="p-5">
                <h3 className="text-sm font-bold text-ui-text">Interview status</h3>
                <div className="mt-3 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Turns used</span>
                    <span className="font-semibold text-ui-text">
                      {turnsUsed} / {MAX_TURNS}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Missing fields</span>
                    <span className="font-semibold text-ui-text">{missingFields.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Mode</span>
                    <span className="font-semibold text-ui-text">{modeLabel}</span>
                  </div>
                </div>

                {missingFields.length ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Next targets</p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-700">
                      {missingFields.slice(0, 6).map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                      {missingFields.length > 6 ? (
                        <li className="text-slate-500">• …and {missingFields.length - 6} more</li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}

                {done ? (
                  <Link
                    href={`/case/${caseFile.id}/roadmap`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-ui-text hover:opacity-95"
                  >
                    Generate Roadmap
                  </Link>
                ) : (
                  <p className="mt-4 text-xs text-slate-600">
                    Keep answering until the missing fields hit 0 (or turn limit).
                  </p>
                )}
              </GlassCard>

              <GlassCard className="p-5 border border-ui-danger/20 bg-ui-danger/5">
                <h3 className="text-sm font-bold text-ui-text">Safety First</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  If you are in immediate danger, call 911. This tool is informational only.
                </p>
              </GlassCard>
            </aside>
          </div>

          <SafetyInterrupt open={interruptOpen} onClose={() => setInterruptOpen(false)} />
        </main>
      </div>
    </div>
  );
}
