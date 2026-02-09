"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { AssumptionsPanel } from "@/components/AssumptionsPanel";
import { useCaseStore } from "@/store/useCaseStore";
import { safeText } from "@/lib/utils";

export default function CaseDashboardPage() {
  const params = useParams();
  const caseId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const caseFile = useCaseStore((state) => state.cases.find((item) => item.id === caseId));

  if (!caseFile) {
    return (
      <GlassCard className="space-y-4">
        <h1 className="text-xl font-semibold text-white">Case not found</h1>
        <p className="text-sm text-white/70">Start a new New York Family Court Order of Protection intake.</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
          >
            Back Home
          </Link>
          <Link
            href="/settings"
            className="inline-flex rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
          >
            Settings
          </Link>
        </div>
      </GlassCard>
    );
  }

  const { intake, facts, outputs, assumptions, uncertainties } = caseFile;

  return (
    <div className="space-y-8">
      <GlassCardStrong className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Case Dashboard</p>
            <h1 className="text-2xl font-semibold text-white">Order of Protection - NY Family Court</h1>
            <p className="text-xs text-white/60">Last updated {new Date(caseFile.updatedAt).toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/case/${caseFile.id}/interview`}
              className="rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ink"
            >
              Interview
            </Link>
            <Link
              href={`/case/${caseFile.id}/roadmap`}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 shadow-sm hover:bg-slate-50"            >
              Roadmap
            </Link>
            <Link
              href={`/case/${caseFile.id}/summary`}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 shadow-sm hover:bg-slate-50"            >
              Summary
            </Link>
          </div>
        </div>
      </GlassCardStrong>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <h2 className="text-sm font-semibold text-white">Intake snapshot</h2>
            <div className="grid gap-3 text-xs text-white/70 md:grid-cols-2">
              <div>
                <span className="text-white/50">Relationship</span>
                <p>{safeText(intake.relationshipCategory)}</p>
              </div>
              <div>
                <span className="text-white/50">Cohabitation</span>
                <p>{safeText(intake.cohabitation)}</p>
              </div>
              <div>
                <span className="text-white/50">Most recent incident</span>
                <p>{safeText(intake.mostRecentIncidentAt)}</p>
              </div>
              <div>
                <span className="text-white/50">Children involved</span>
                <p>{safeText(intake.childrenInvolved)}</p>
              </div>
              <div>
                <span className="text-white/50">Existing cases/orders</span>
                <p>{safeText(intake.existingCasesOrders)}</p>
              </div>
              <div>
                <span className="text-white/50">Firearms access</span>
                <p>{safeText(intake.firearmsAccess)}</p>
              </div>
              <div>
                <span className="text-white/50">Safety status</span>
                <p className={intake.safetyStatus === "Immediate danger" ? "text-rose-300" : ""}>
                  {safeText(intake.safetyStatus)}
                </p>
              </div>
              <div>
                <span className="text-white/50">Evidence inventory</span>
                <p>{safeText(intake.evidenceInventory)}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h2 className="text-sm font-semibold text-white">Facts snapshot</h2>
            <div className="grid gap-4 text-xs text-white/70 md:grid-cols-2">
              <div>
                <span className="text-white/50">Parties</span>
                <p>{facts.parties.petitioner || "Petitioner"} vs. {facts.parties.respondent || "Respondent"}</p>
              </div>
              <div>
                <span className="text-white/50">Relationship</span>
                <p>{safeText(facts.relationship)}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-white/50">Safety concerns</span>
                <p>{facts.safetyConcerns.join(" / ") || "None noted"}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-white/50">Evidence list</span>
                <p>{facts.evidenceList.join(" / ") || "None listed"}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h2 className="text-sm font-semibold text-white">Outputs (info-only)</h2>
            <div className="space-y-3 text-xs text-white/70">
              <div>
                <span className="text-white/50">2-minute script</span>
                <p>{safeText(outputs.script2Min)}</p>
              </div>
              <div>
                <span className="text-white/50">5-minute outline</span>
                <ul className="mt-2 space-y-1">
                  {outputs.outline5Min.length ? outputs.outline5Min.map((item, index) => (
                    <li key={index}>- {item}</li>
                  )) : <li>- None yet.</li>}
                </ul>
              </div>
              <div>
                <span className="text-white/50">Evidence checklist</span>
                <ul className="mt-2 space-y-1">
                  {outputs.evidenceChecklist.length ? outputs.evidenceChecklist.map((item, index) => (
                    <li key={index}>- {item}</li>
                  )) : <li>- None yet.</li>}
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Timeline</h2>
            <ul className="space-y-2 text-xs text-white/70">
              {facts.timeline.length ? facts.timeline.map((item, index) => (
                <li key={index}>- {item}</li>
              )) : <li>- Add incidents to build a timeline.</li>}
            </ul>
          </GlassCard>

          <AssumptionsPanel assumptions={assumptions} uncertainties={uncertainties} />
        </div>
      </div>
    </div>
  );
}
