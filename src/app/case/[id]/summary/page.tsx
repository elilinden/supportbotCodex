"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { CaseSubNav } from "@/components/CaseSubNav";
import { AssumptionsPanel } from "@/components/AssumptionsPanel";
import { useCaseStore, useHydrated } from "@/store/useCaseStore";
import { normalizeOutputText } from "@/lib/utils";

export default function CaseSummaryPage() {
  const params = useParams();
  const caseId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const caseFile = useCaseStore((state) => state.cases.find((item) => item.id === caseId));
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <GlassCard className="space-y-4 animate-pulse">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="h-4 w-64 rounded bg-slate-100" />
      </GlassCard>
    );
  }

  if (!caseFile) {
    return (
      <GlassCard className="space-y-4">
        <h1 className="text-xl font-semibold text-ui-text">Case not found</h1>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back Home
          </Link>
          <Link
            href="/settings"
            className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Settings
          </Link>
        </div>
      </GlassCard>
    );
  }

  const { intake, facts, outputs, assumptions, uncertainties } = caseFile;

  const petitionerName = facts.parties.petitioner || intake.petitionerName || "[Name not provided]";
  const respondentName = facts.parties.respondent || intake.respondentName || "[Name not provided]";

  return (
    <div className="space-y-8">
      <div className="no-print">
        <CaseSubNav caseId={caseFile.id} />
      </div>

      <GlassCardStrong className="space-y-3 no-print">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Facts Summary</p>
        <h1 className="text-2xl font-semibold text-ui-text">NY Family Court &mdash; Order of Protection Summary</h1>
        <p className="text-sm text-slate-600">Information-only summary for Orders of Protection. Not legal advice.</p>

        <div className="flex flex-wrap gap-3">
          <button
            className="w-fit rounded-full bg-ui-primary px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-95"
            onClick={() => window.print()}
          >
            Print / Export
          </button>
        </div>
      </GlassCardStrong>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ui-text">Facts snapshot</h2>

            <p className="text-xs text-slate-700">
              <strong>Parties:</strong> {petitionerName} vs. {respondentName}
            </p>

            <p className="text-xs text-slate-700">
              <strong>Relationship:</strong> {facts.relationship || "[Not provided]"}
            </p>

            <p className="text-xs text-slate-700">
              <strong>Safety concerns:</strong> {facts.safetyConcerns.join(" / ") || "None listed"}
            </p>

            <p className="text-xs text-slate-700">
              <strong>Requested relief:</strong> {facts.requestedRelief.join(" / ") || "None listed"}
            </p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ui-text">Outputs (info-only)</h2>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <strong>2-minute script:</strong>
                <p className="mt-1 whitespace-pre-wrap">{normalizeOutputText(outputs.script2Min)}</p>
              </div>

              <div>
                <strong>5-minute outline:</strong>
                <ul className="mt-1 space-y-1">
                  {outputs.outline5Min.map((item, index) => (
                    <li key={index}>- {normalizeOutputText(item)}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>Evidence checklist:</strong>
                <ul className="mt-1 space-y-1">
                  {outputs.evidenceChecklist.map((item, index) => (
                    <li key={index}>- {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>Timeline:</strong>
                <ul className="mt-1 space-y-1">
                  {outputs.timelineSummary.map((item, index) => (
                    <li key={index}>- {normalizeOutputText(item)}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>What to bring:</strong>
                <ul className="mt-1 space-y-1">
                  {outputs.whatToBring.map((item, index) => (
                    <li key={index}>- {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>What to expect in court:</strong>
                <div className="mt-2 space-y-3">
                  {outputs.whatToExpect.map((item, index) => {
                    const stepMatch = item.match(/^Step\s*(\d+):\s*(.*)/i);
                    const stepNum = stepMatch ? stepMatch[1] : String(index + 1);
                    const stepText = stepMatch ? stepMatch[2] : item;
                    return (
                      <div key={index} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-ui-primary text-[11px] font-bold text-white">
                          {stepNum}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed pt-1">{normalizeOutputText(stepText)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ui-text">Intake details</h2>
            <ul className="space-y-2 text-xs text-slate-700">
              <li><strong>Relationship:</strong> {intake.relationshipCategory || "[Not provided]"}</li>
              <li><strong>Living situation:</strong> {intake.cohabitation || "[Not provided]"}</li>
              <li><strong>Most recent incident:</strong> {intake.mostRecentIncidentAt || "Date not provided"}</li>
              <li><strong>Pattern:</strong> {intake.patternOfIncidents || "[Not provided]"}</li>
              <li><strong>Children:</strong> {intake.childrenInvolved || "[Not provided]"}</li>
              <li><strong>Existing cases/orders:</strong> {intake.existingCasesOrders || "[Not provided]"}</li>
              <li><strong>Firearms:</strong> {intake.firearmsAccess || "[Not provided]"}</li>
              <li><strong>Safety status:</strong> {intake.safetyStatus || "[Not provided]"}</li>
              <li><strong>Evidence inventory:</strong> {intake.evidenceInventory || "[Not provided]"}</li>
            </ul>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ui-text">Filing basics (info-only)</h2>
            <ul className="space-y-2 text-xs text-slate-700">
              <li>- Family Offense Petition (UCS-FC8-2) requesting an Order of Protection.</li>
              <li>- Address confidentiality or safety request if revealing your address creates risk.</li>
              <li>- Service basics: confirm service method, note the return date, and keep proof of service.</li>
            </ul>
          </GlassCard>

          <GlassCard className="space-y-2 border-2 border-ui-danger/40 bg-red-50">
            <div className="flex items-center gap-2">
              <span className="text-lg" role="img" aria-label="Warning">&#9888;&#65039;</span>
              <h2 className="text-sm font-semibold text-ui-danger">Safety resources</h2>
            </div>
            <p className="text-xs text-slate-700">
              If you are in immediate danger, call <strong>911</strong> or your local emergency number.
            </p>
            <div className="text-xs text-slate-700 space-y-0.5">
              <p>NY State Domestic and Sexual Violence Hotline: <strong>800-942-6906</strong></p>
              <p>Text: <strong>844-997-2121</strong></p>
              <p>NYC Safe Horizon Hotline: <strong>800-621-4673</strong></p>
              <p>National DV Hotline: <strong>1-800-799-7233</strong></p>
            </div>
          </GlassCard>

          <AssumptionsPanel assumptions={assumptions} uncertainties={uncertainties} />
        </div>
      </div>
    </div>
  );
}
