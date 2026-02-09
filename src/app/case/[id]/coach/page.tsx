"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { SafetyInterrupt } from "@/components/SafetyInterrupt";
import { useCaseStore } from "@/store/useCaseStore";
import { detectImmediateDanger } from "@/lib/safety";

export default function CoachPage() {
  const params = useParams();
  const caseId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const caseFile = useCaseStore((state) => state.cases.find((item) => item.id === caseId));
  const addMessage = useCaseStore((state) => state.addMessage);
  const updateFacts = useCaseStore((state) => state.updateFacts);
  const setSafety = useCaseStore((state) => state.setSafety);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interruptOpen, setInterruptOpen] = useState(false);
  const [nextQuestions, setNextQuestions] = useState<string[]>([]);

  const recentMessages = useMemo(() => {
    if (!caseFile) return [];
    return caseFile.messages.slice(-8).map((msg) => ({ role: msg.role, content: msg.content }));
  }, [caseFile]);

  useEffect(() => {
    if (caseFile?.safety.immediateDanger) {
      setInterruptOpen(true);
    }
  }, [caseFile?.safety.immediateDanger]);

  if (!caseFile) {
    return (
      <GlassCard className="space-y-4">
        <h1 className="text-xl font-semibold text-ui-text">Case not found</h1>
        <p className="text-sm text-ui-textMuted">Start a new NY Family Court Order of Protection intake.</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full border border-ui-border px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text"
          >
            Back Home
          </Link>
          <Link
            href="/settings"
            className="inline-flex rounded-full border border-ui-border px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text"
          >
            Settings
          </Link>
        </div>
      </GlassCard>
    );
  }

  const handleSend = async (override?: string) => {
    const message = (override ?? input).trim();
    if (!message) return;

    setInput("");
    setError(null);
    setNextQuestions([]);

    const userMessage = {
      id: `msg_${Date.now()}`,
      role: "user" as const,
      content: message,
      createdAt: new Date().toISOString()
    };

    addMessage(caseFile.id, userMessage);

    const immediateDanger = detectImmediateDanger(message);
    if (immediateDanger) {
      setSafety(caseFile.id, true, "User indicated immediate danger in coach chat.", ["immediate_danger"]);
      setInterruptOpen(true);
    }

    setLoading(true);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseFile.id,
          intake: caseFile.intake,
          facts: caseFile.facts,
          lastMessages: recentMessages,
          userMessage: message
        })
      });

      if (!response.ok) {
        throw new Error(`Coach error ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: "assistant" as const,
        content: data.assistant_message || "",
        createdAt: new Date().toISOString()
      };

      addMessage(caseFile.id, assistantMessage);

      if (data.extracted_facts && typeof data.extracted_facts === "object") {
        updateFacts(caseFile.id, data.extracted_facts);
      }

      if (data.next_questions && Array.isArray(data.next_questions)) {
        setNextQuestions(data.next_questions);
      }

      if (data.safety_flags && Array.isArray(data.safety_flags)) {
        const hasImmediate = data.safety_flags.includes("immediate_danger");
        if (hasImmediate) {
          setSafety(caseFile.id, true, "Safety interrupt triggered by coach response.", data.safety_flags);
          setInterruptOpen(true);
        } else if (data.safety_flags.length) {
          setSafety(caseFile.id, caseFile.safety.immediateDanger, caseFile.safety.notes, data.safety_flags);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <GlassCardStrong className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-ui-textMuted">Coach Mode</p>
        <h1 className="text-2xl font-semibold text-ui-text">NY Family Court OP Coach</h1>
        <p className="text-sm text-ui-textMuted">
          Ask questions, refine facts, and stay within New York Family Court Order of Protection scope.
        </p>
      </GlassCardStrong>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <GlassCard className="flex h-[560px] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 text-sm text-ui-text">
            {caseFile.messages.length ? (
              caseFile.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-2xl border px-4 py-3 text-xs ${
                    msg.role === "user"
                      ? "border-ui-border bg-ui-surface2 text-ui-text"
                      : "border-ui-border bg-ui-surface2 text-ui-text"
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wide text-ui-textMuted">{msg.role}</p>
                  <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-ui-textMuted">No messages yet. Ask about your case facts or next steps.</p>
            )}
          </div>
          {error ? <p className="mt-2 text-xs text-ui-danger">{error}</p> : null}
          {nextQuestions.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {nextQuestions.map((question) => (
                <button
                  key={question}
                  className="rounded-full border border-ui-border bg-ui-surface2 px-3 py-1 text-xs text-ui-text hover:border-ui-borderStrong"
                  onClick={() => handleSend(question)}
                  disabled={loading}
                >
                  {question}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <input
              className="flex-1 rounded-full border border-ui-border bg-ui-surface2 px-4 py-2 text-xs text-ui-text"
              placeholder="Ask a question about NY Family Court OP preparation..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSend();
              }}
              disabled={loading}
            />
            <button
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text"
              onClick={() => handleSend()}
              disabled={loading}
            >
              {loading ? "Sending" : "Send"}
            </button>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ui-text">Facts</h2>
            <p className="text-xs text-ui-textMuted">
              {caseFile.facts.relationship}
            </p>
            <div className="text-xs text-ui-textMuted">
              {caseFile.facts.timeline.length
                ? caseFile.facts.timeline.map((item, index) => <p key={index}>- {item}</p>)
                : "No timeline entries yet."}
            </div>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ui-text">Requested relief</h2>
            <p className="text-xs text-ui-textMuted">
              {caseFile.facts.requestedRelief.length
                ? caseFile.facts.requestedRelief.join(" / ")
                : "None listed yet."}
            </p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ui-text">Evidence list</h2>
            <ul className="space-y-1 text-xs text-ui-textMuted">
              {caseFile.facts.evidenceList.length
                ? caseFile.facts.evidenceList.map((item, index) => <li key={index}>- {item}</li>)
                : "No evidence listed yet."}
            </ul>
          </GlassCard>
        </div>
      </div>

      <SafetyInterrupt open={interruptOpen} onClose={() => setInterruptOpen(false)} />
    </div>
  );
}
