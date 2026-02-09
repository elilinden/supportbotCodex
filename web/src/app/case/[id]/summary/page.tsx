"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { AssumptionsPanel } from "@/components/AssumptionsPanel";
import { useCaseStore } from "@/store/useCaseStore";

export default function CaseSummaryPage() {
  const params = useParams();
  const caseId = Array.isArray((params as any)?.id) ? (params as any).id[0] : (params as any)?.id;
  const caseFile = useCaseStore((state) => state.cases.find((item) => item.id === caseId));

  if (!caseFile) {
    return (
      <GlassCard className="space-y-4">
        <h1 className="text-xl font-semibold text-ink">Case not found</h1>
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
  const showHotlines =
    intake.safetyStatus === "Unsafe" ||
    intake.safetyStatus === "Immediate danger" ||
    caseFile.safety.immediateDanger ||
    caseFile.safety.flags.includes("immediate_danger");

  return (
    <div className="space-y-8">
      <GlassCardStrong className="space-y-3 no-print">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Printable Summary</p>
        <h1 className="text-2xl font-semibold text-ink">NY Family Court OP Summary</h1>
        <p className="text-sm text-slate-600">Information-only summary for Orders of Protection. Not legal advice.</p>

        <div className="flex flex-wrap gap-3">
          <button
            className="w-fit rounded-full bg-accentBlue px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-95"
            onClick={() => window.print()}
          >
            Print / Export
          </button>

          <Link
            href={`/case/${caseFile.id}/roadmap`}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Roadmap
          </Link>
        </div>
      </GlassCardStrong>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Facts snapshot</h2>

            <p className="text-xs text-slate-700">
              <strong>Parties:</strong> {facts.parties.petitioner || "Petitioner"} vs.{" "}
              {facts.parties.respondent || "Respondent"}
            </p>

            <p className="text-xs text-slate-700">
              <strong>Relationship:</strong> {facts.relationship}
            </p>

            <p className="text-xs text-slate-700">
              <strong>Safety concerns:</strong> {facts.safetyConcerns.join(" / ") || "None listed"}
            </p>

            <p className="text-xs text-slate-700">
              <strong>Requested relief:</strong> {facts.requestedRelief.join(" / ") || "None listed"}
            </p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Outputs (info-only)</h2>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <strong>2-minute script:</strong>
                <p className="mt-1 whitespace-pre-wrap">{outputs.script2Min}</p>
              </div>

              <div>
                <strong>5-minute outline:</strong>
                <ul className="mt-1 space-y-1">
                  {outputs.outline5Min.map((item, index) => (
                    <li key={index}>- {item}</li>
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
                    <li key={index}>- {item}</li>
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
                <strong>What to expect:</strong>
                <ul className="mt-1 space-y-1">
                  {outputs.whatToExpect.map((item, index) => (
                    <li key={index}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Intake details</h2>
            <ul className="space-y-2 text-xs text-slate-700">
              <li>Relationship: {intake.relationshipCategory || "-"}</li>
              <li>Cohabitation: {intake.cohabitation || "-"}</li>
              <li>Most recent incident: {intake.mostRecentIncidentAt || "-"}</li>
              <li>Pattern: {intake.patternOfIncidents || "-"}</li>
              <li>Children: {intake.childrenInvolved || "-"}</li>
              <li>Existing cases/orders: {intake.existingCasesOrders || "-"}</li>
              <li>Firearms: {intake.firearmsAccess || "-"}</li>
              <li>Safety status: {intake.safetyStatus || "-"}</li>
              <li>Evidence inventory: {intake.evidenceInventory || "-"}</li>
            </ul>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Filing basics (info-only)</h2>
            <ul className="space-y-2 text-xs text-slate-700">
              <li>- Family Offense Petition (UCS-FC8-2) requesting an Order of Protection.</li>
              <li>- Address confidentiality or safety request if revealing your address creates risk.</li>
              <li>- Service basics: confirm service method, note the return date, and keep proof of service.</li>
            </ul>
          </GlassCard>

          {showHotlines ? (
            <GlassCard className="space-y-2">
              <h2 className="text-sm font-semibold text-ink">Safety resources</h2>
              <p className="text-xs text-slate-700">
                If you are in immediate danger, call 911 or your local emergency number.
              </p>
              <div className="text-xs text-slate-700">
                <p>NY State Domestic and Sexual Violence Hotline: 800-942-6906</p>
                <p>Text: 844-997-2121</p>
                <p>NYC Safe Horizon Hotline: 800-621-4673</p>
              </div>
            </GlassCard>
          ) : null}

          <AssumptionsPanel assumptions={assumptions} uncertainties={uncertainties} />
        </div>
      </div>
    </div>
  );
}
