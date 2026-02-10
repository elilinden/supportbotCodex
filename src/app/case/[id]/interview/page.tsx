"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { CaseSubNav } from "@/components/CaseSubNav";
import { SafetyInterrupt } from "@/components/SafetyInterrupt";
import { useCaseStore, useHydrated } from "@/store/useCaseStore";
import { computeMissingFields } from "@/lib/coach";
import { mergeFacts } from "@/lib/mergeFacts";
import { buildOutputsFromFacts } from "@/lib/case";
import type { CoachMessage, Facts, IntakeData } from "@/lib/types";

const MAX_TURNS = 5;

/* ------------------------------------------------------------------ */
/*  Memoized sub-components — each only re-renders when its props     */
/*  actually change, preventing the entire page from re-rendering.    */
/* ------------------------------------------------------------------ */

const ChatMessageBubble = memo(function ChatMessageBubble({
  msg
}: {
  msg: CoachMessage;
}) {
  return (
    <div
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
  );
});

const ChatMessageList = memo(function ChatMessageList({
  messages,
  loading,
  chatEndRef
}: {
  messages: CoachMessage[];
  loading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
      {messages.length ? (
        messages.map((msg) => <ChatMessageBubble key={msg.id} msg={msg} />)
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-ui-primary" />
          <p className="text-sm font-medium text-ui-text">Preparing your interview...</p>
          <p className="mt-1 text-xs text-slate-500">Analyzing your intake to identify key questions.</p>
        </div>
      ) : (
        <p className="text-xs text-slate-600 italic">Waiting to begin the interview...</p>
      )}
      <div ref={chatEndRef} />
    </div>
  );
});

const MissingFieldsList = memo(function MissingFieldsList({
  fields
}: {
  fields: string[];
}) {
  if (!fields.length) return null;
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Next targets</p>
      <ul className="mt-2 space-y-1 text-xs text-slate-700">
        {fields.slice(0, 6).map((f) => (
          <li key={f}>• {f}</li>
        ))}
        {fields.length > 6 ? (
          <li className="text-slate-500">• …and {fields.length - 6} more</li>
        ) : null}
      </ul>
    </div>
  );
});

const KPICards = memo(function KPICards({
  turnsUsed,
  missingCount,
  done
}: {
  turnsUsed: number;
  missingCount: number;
  done: boolean;
}) {
  return (
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
          <span className="text-3xl font-display font-bold text-ui-text">{missingCount}</span>
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
  );
});

/* ------------------------------------------------------------------ */
/*  Stable missingFields hook — returns same array reference when     */
/*  contents haven't changed, and only recomputes when intake/facts   */
/*  change (not on every message or turnCount change).                */
/* ------------------------------------------------------------------ */

function useStableMissingFields(intake: IntakeData | undefined, facts: Facts | undefined): string[] {
  const prevRef = useRef<string[]>([]);

  return useMemo(() => {
    if (!intake || !facts) return prevRef.current;
    const next = computeMissingFields(intake, facts);
    // Return same reference if contents are identical (prevents downstream re-renders)
    const prev = prevRef.current;
    if (prev.length === next.length && prev.every((v, i) => v === next[i])) {
      return prev;
    }
    prevRef.current = next;
    return next;
  }, [intake, facts]);
}

/* ------------------------------------------------------------------ */
/*  Main page component                                               */
/* ------------------------------------------------------------------ */

export default function InterviewPage() {
  const params = useParams<{ id: string | string[] }>();
  const caseId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Granular Zustand selectors — only re-render when the specific field changes
  const caseFile = useCaseStore((state) => state.cases.find((item) => item.id === caseId));
  const addMessage = useCaseStore((state) => state.addMessage);
  const applyInterviewResponse = useCaseStore((state) => state.applyInterviewResponse);
  const incrementTurn = useCaseStore((state) => state.incrementTurn);
  const setStatus = useCaseStore((state) => state.setStatus);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [interruptOpen, setInterruptOpen] = useState(false);

  const initialized = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Only recompute when intake or facts change (not messages, turnCount, etc.)
  const missingFields = useStableMissingFields(caseFile?.intake, caseFile?.facts);

  useEffect(() => {
    if (!caseFile) return;
    const currentTurns = caseFile.turnCount ?? 0;
    const complete = missingFields.length === 0 || currentTurns >= MAX_TURNS;
    setDone(complete);
    if (complete && caseFile.status !== "active") {
      setStatus(caseFile.id, "active");
    }
  }, [caseFile, missingFields, setStatus]);

  // Auto-scroll chat to bottom on new messages or loading change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [caseFile?.messages.length, loading]);

  const askInterviewQuestion = useCallback(async (message: string, turnCountOverride?: number) => {
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

      const assistantMessage: CoachMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: "assistant" as const,
        content: data.assistant_message || "",
        createdAt: new Date().toISOString()
      };

      const extractedFacts = (data.extracted_facts || {}) as object;
      const mergedFacts = mergeFacts(caseFile.facts, extractedFacts as Partial<Facts>);
      const mergedOutputs = buildOutputsFromFacts(mergedFacts);

      // Build safety update if flags present
      let safetyUpdate: { immediateDanger: boolean; notes?: string; flags?: string[] } | undefined;
      if (data.safety_flags && Array.isArray(data.safety_flags)) {
        if (data.safety_flags.includes("immediate_danger")) {
          safetyUpdate = {
            immediateDanger: true,
            notes: "Safety interrupt triggered during interview.",
            flags: data.safety_flags
          };
          setInterruptOpen(true);
        } else if (data.safety_flags.length) {
          safetyUpdate = {
            immediateDanger: caseFile.safety.immediateDanger,
            notes: caseFile.safety.notes,
            flags: data.safety_flags
          };
        }
      }

      const stillMissing = computeMissingFields(caseFile.intake, mergedFacts);
      const turnCountValue = typeof turnCountOverride === "number" ? turnCountOverride : caseFile.turnCount ?? 0;
      const isComplete = stillMissing.length === 0 || turnCountValue >= MAX_TURNS;

      // SINGLE batched store update instead of 3-5 sequential updates.
      // This eliminates cascading re-renders that were causing the 6.6s INP.
      applyInterviewResponse(caseFile.id, {
        message: assistantMessage,
        facts: mergedFacts,
        outputs: mergedOutputs,
        safety: safetyUpdate,
        status: isComplete && caseFile.status !== "active" ? "active" : undefined
      });

      // Use startTransition for the non-urgent UI state update
      startTransition(() => {
        setDone(isComplete);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseFile, applyInterviewResponse]);

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

  const handleSend = useCallback(async () => {
    if (!caseFile) return;
    if (done) return;

    const message = input.trim();
    if (!message) return;

    setInput("");
    setError(null);

    const userMessage: CoachMessage = {
      id: `msg_${Date.now()}`,
      role: "user" as const,
      content: message,
      createdAt: new Date().toISOString()
    };

    addMessage(caseFile.id, userMessage);

    const nextTurn = (caseFile.turnCount ?? 0) + 1;
    incrementTurn(caseFile.id);

    await askInterviewQuestion(message, nextTurn);
  }, [caseFile, done, input, addMessage, incrementTurn, askInterviewQuestion]);

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
        {/* LEFT SIDEBAR */}
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
          {/* Header row */}
          <GlassCardStrong className="p-5">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-slate-500">Interview</p>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-ui-text">Guided Interview</h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Informational only (not legal advice). Focused on missing critical details.
              </p>
            </div>

            <KPICards turnsUsed={turnsUsed} missingCount={missingFields.length} done={done} />
          </GlassCardStrong>

          {/* Content grid */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Chat */}
            <GlassCard className="flex h-[640px] flex-col p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-ui-text">Conversation</h2>
              </div>

              <ChatMessageList
                messages={caseFile.messages}
                loading={loading}
                chatEndRef={chatEndRef}
              />

              {loading && caseFile.messages.length > 0 ? (
                <div className="flex items-center gap-2 px-2 py-1">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-ui-primary" />
                  <p className="text-xs text-slate-500">Thinking...</p>
                </div>
              ) : null}

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

                <MissingFieldsList fields={missingFields} />

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
