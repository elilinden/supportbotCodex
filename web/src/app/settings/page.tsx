"use client";

import Link from "next/link";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { useCaseStore } from "@/store/useCaseStore";

export default function SettingsPage() {
  const caseCount = useCaseStore((state) => state.cases.length);
  const activeCaseId = useCaseStore((state) => state.activeCaseId);
  const activeCase = useCaseStore((state) =>
    state.cases.find((item) => item.id === state.activeCaseId)
  );
  const clearAll = useCaseStore((state) => state.clearAll);

  return (
    <div className="space-y-8">
      <GlassCardStrong className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Settings
        </p>
        <h1 className="text-2xl font-semibold text-ink">
          Workspace Settings
        </h1>
        <p className="text-sm text-slate-600">
          Settings are stored locally in your browser. This is a NY Family Court OP-only workspace.
        </p>
      </GlassCardStrong>

      <GlassCard className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Data storage</h2>
        <p className="text-xs text-slate-600">Saved cases: {caseCount}</p>

        <button
          className="rounded-full border border-accentRose/30 bg-accentRose/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-accentRose hover:bg-accentRose/15"
          onClick={() => clearAll()}
        >
          Clear all local cases
        </button>

        <div className="flex flex-wrap gap-3">
          {caseCount === 0 ? (
            <Link
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-cardSm hover:bg-slate-50"
              href="/new"
            >
              Start New Intake
            </Link>
          ) : null}

          {activeCaseId ? (
            <Link
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-cardSm hover:bg-slate-50"
              href={
                activeCase?.status === "interview"
                  ? `/case/${activeCaseId}/interview`
                  : `/case/${activeCaseId}/roadmap`
              }
            >
              View Dashboard
            </Link>
          ) : null}
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Safety reminder</h2>
        <p className="text-xs text-slate-600">
          If you are in immediate danger, call 911 or your local emergency number. This tool does not
          replace professional support.
        </p>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          If you are in immediate danger, call 911 or your local emergency number.
        </div>
      </GlassCard>
    </div>
  );
}
