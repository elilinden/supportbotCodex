"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { SafetyUpdateInput } from "@/components/SafetyUpdateInput";
import { SafetyInterrupt } from "@/components/SafetyInterrupt";
import { useCaseStore } from "@/store/useCaseStore";
import type { CaseFile, IntakeData } from "@/lib/types";

const FAMILY_COURT_RELATIONSHIPS = new Set<string>([
  "Spouse",
  "Former spouse",
  "Parent of child in common",
  "Family member (blood/marriage/adoption)",
  "Intimate partner (dating)",
  "Household member"
]);

type FactsIncident = {
  date?: string;
  time?: string;
  location?: string;
  whatHappened?: string;
  injuries?: string;
  threats?: string;
  witnesses?: string;
  evidence?: string;
};

// --- Helpers ---

function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "";
}

function splitToList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(safeString).filter(Boolean);
  const s = safeString(value);
  if (!s) return [];
  return s.split(/\n|,|;|•/g).map((x) => x.trim()).filter(Boolean);
}

function uniq(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const v = item.trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function looksLikeNo(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === "no" || v === "none" || v === "n/a" || v === "not involved" || v === "false";
}

function joinNice(list: string[]): string {
  const xs = list.map((x) => x.trim()).filter(Boolean);
  if (xs.length === 0) return "";
  if (xs.length === 1) return xs[0];
  if (xs.length === 2) return `${xs[0]} and ${xs[1]}`;
  return `${xs.slice(0, -1).join(", ")}, and ${xs[xs.length - 1]}`;
}

function scoreIncident(inc: FactsIncident): number {
  const fields = [
    inc.date,
    inc.time,
    inc.location,
    inc.whatHappened,
    inc.injuries,
    inc.threats,
    inc.witnesses,
    inc.evidence
  ];
  return fields.reduce((acc, f) => acc + (safeString(f) ? 1 : 0), 0);
}

export default function RoadmapPage() {
  const params = useParams<{ id: string | string[] }>();
  const caseId = Array.isArray(params.id) ? params.id[0] : params.id;

  const caseFile = useCaseStore((state) =>
    state.cases.find((item) => item.id === caseId)
  ) as CaseFile | undefined;

  const [interruptOpen, setInterruptOpen] = useState(false);

  const now = useMemo(() => new Date(), []);
  const dayGreeting = now.getHours() < 12 ? "morning" : "afternoon";

  if (!caseFile) {
    return (
      <GlassCard className="space-y-4 max-w-2xl mx-auto mt-20 text-ink">
        <h1 className="text-2xl font-bold text-ink">Case not found</h1>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50"
          >
            Back Home
          </Link>
          <Link
            href="/settings"
            className="inline-flex rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50"
          >
            Settings
          </Link>
        </div>
      </GlassCard>
    );
  }

  const { intake, facts, outputs, safety, status } = caseFile;

  const incidents = useMemo<FactsIncident[]>(
    () => (Array.isArray((facts as any)?.incidents) ? ((facts as any).incidents as FactsIncident[]) : []),
    [facts]
  );

  const getField = useCallback(
    (key: keyof IntakeData): string => {
      const fromIntake = safeString((intake as any)?.[key]);
      if (fromIntake) return fromIntake;

      const fromFactsDirect = safeString((facts as any)?.[key]);
      if (fromFactsDirect) return fromFactsDirect;

      const safetyConcerns = Array.isArray((facts as any)?.safetyConcerns) ? (facts as any).safetyConcerns : [];

      if (key === "firearmsAccess") {
        const joined = safetyConcerns.join(" ").toLowerCase();
        if (joined.includes("firearm") || joined.includes("gun")) {
          if (joined.includes("yes")) return "Yes";
          if (joined.includes("no")) return "No";
          return "Unknown";
        }
      }

      if (key === "safetyStatus") {
        if ((safety as any)?.immediateDanger || (safety as any)?.flags?.includes("immediate_danger")) {
          return "Immediate danger";
        }
      }

      if (key === "childrenInvolved") {
        const witnessText = incidents.map((inc) => safeString(inc?.witnesses)).join(" ").toLowerCase();
        if (witnessText.includes("child") || witnessText.includes("kid")) return "Children involved";
      }

      return "";
    },
    [facts, incidents, intake, safety]
  );

  const derived = useMemo(() => {
    const relationshipCategory = getField("relationshipCategory");
    const relationshipKnown = Boolean(relationshipCategory);
    const familyCourtLikely = relationshipKnown && FAMILY_COURT_RELATIONSHIPS.has(relationshipCategory);

    const safetyStatus = getField("safetyStatus");
    const showHotlines =
      safetyStatus === "Unsafe" ||
      safetyStatus === "Immediate danger" ||
      Boolean((safety as any)?.immediateDanger) ||
      Boolean((safety as any)?.flags?.includes("immediate_danger"));

    const cohabitation = getField("cohabitation");
    const childrenInvolved = getField("childrenInvolved");
    const firearmsAccess = getField("firearmsAccess");
    const existingOrders = getField("existingCasesOrders");
    const patternSummary = getField("patternOfIncidents");
    const mostRecentIncidentAt = getField("mostRecentIncidentAt");

    const topIncidents = [...incidents]
      .filter((inc) => scoreIncident(inc) > 0)
      .sort((a, b) => scoreIncident(b) - scoreIncident(a))
      .slice(0, 3);

    const evidenceList = uniq([
      ...splitToList(getField("evidenceInventory")),
      ...splitToList((facts as any)?.evidenceList),
      ...topIncidents.flatMap((i) => splitToList(i?.evidence))
    ]);

    const reliefList = uniq([
      ...splitToList(getField("requestedRelief")),
      ...splitToList((facts as any)?.requestedRelief)
    ]);

    const timelineItems: string[] = (() => {
      if (Array.isArray((outputs as any)?.timelineSummary) && (outputs as any).timelineSummary.length) {
        return (outputs as any).timelineSummary;
      }
      if (Array.isArray((facts as any)?.timeline) && (facts as any).timeline.length) return (facts as any).timeline;
      if (topIncidents.length) {
        return topIncidents.map((inc) => {
          const d = safeString(inc?.date) || "[date]";
          const t = safeString(inc?.time);
          const l = safeString(inc?.location) || "[location]";
          const w = safeString(inc?.whatHappened) || "[what happened]";
          return `${d}${t ? ` at ${t}` : ""} - ${l}: ${w}`;
        });
      }
      return [];
    })();

    const scriptText = safeString((outputs as any)?.script2Min);

    const evidenceChecklist: string[] =
      Array.isArray((outputs as any)?.evidenceChecklist) && (outputs as any).evidenceChecklist.length
        ? ((outputs as any).evidenceChecklist as string[]).filter((x: unknown): x is string => typeof x === "string")
        : evidenceList;

    return {
      relationshipCategory,
      relationshipKnown,
      familyCourtLikely,
      safetyStatus,
      showHotlines,
      cohabitation,
      childrenInvolved,
      firearmsAccess,
      existingOrders,
      patternSummary,
      mostRecentIncidentAt,
      topIncidents,
      evidenceList,
      reliefList,
      timelineItems,
      scriptText,
      evidenceChecklist
    };
  }, [facts, getField, incidents, outputs, safety]);

  const tips = useMemo(() => {
    const t: string[] = [];
    const {
      relationshipKnown,
      familyCourtLikely,
      relationshipCategory,
      firearmsAccess,
      childrenInvolved,
      cohabitation,
      existingOrders
    } = derived;

    if (!relationshipKnown) {
      t.push(
        "Confirm your relationship category. Family Court access depends on a qualifying relationship (family/household or an “intimate relationship”)."
      );
    } else if (!familyCourtLikely) {
      t.push(
        "Based on the relationship selected, Family Court might not be available. Ask the clerk about a Criminal Court path (parallel matters can exist)."
      );
    } else if (relationshipCategory !== "Spouse" && relationshipCategory !== "Parent of child in common") {
      t.push(
        "If this is an “intimate relationship,” be ready to describe it concretely (how long, how often you saw each other, the nature of the relationship) so eligibility is clear."
      );
    }

    if (firearmsAccess === "Yes") {
      t.push("If firearms are involved, state it early and plainly and ask about firearms surrender/suspension language.");
    }

    if (childrenInvolved && !looksLikeNo(childrenInvolved)) {
      t.push(
        "If children were present or impacted, keep it factual: where they were, what they saw/heard, and what specific protection you want (inclusion in the order, safe exchange logistics)."
      );
    }

    if (cohabitation === "Lives together now") {
      t.push("If you live together, be prepared to request “exclusion” or a clear stay-away perimeter to safely access the home.");
    }

    if (existingOrders && !looksLikeNo(existingOrders)) {
      t.push("Bring docket numbers/copies of any existing cases or orders and state them clearly for the record.");
    }

    return t;
  }, [derived]);

  const scripts = useMemo(() => {
    const {
      relationshipKnown,
      relationshipCategory,
      topIncidents,
      mostRecentIncidentAt,
      patternSummary,
      cohabitation,
      childrenInvolved,
      firearmsAccess,
      existingOrders,
      evidenceList,
      reliefList
    } = derived;

    const incidentCore = topIncidents[0] || {};
    const incidentDate = safeString(incidentCore?.date) || mostRecentIncidentAt || "[date]";
    const incidentTime = safeString(incidentCore?.time);
    const incidentLocation = safeString(incidentCore?.location) || "[location]";
    const whatHappened =
      safeString(incidentCore?.whatHappened) || patternSummary || "[brief, factual description of what happened]";
    const injuries = safeString(incidentCore?.injuries);
    const threats = safeString(incidentCore?.threats);

    const reliefAsk =
      reliefList.length > 0 ? joinNice(reliefList) : "[stay-away / no-contact / exclusion / child-related terms]";

    const evidenceSay =
      evidenceList.length > 0
        ? `I have ${joinNice(evidenceList.slice(0, 4))}${evidenceList.length > 4 ? " and additional supporting proof." : "."}`
        : "I have supporting proof (texts, photos, reports, witnesses) and can provide it to the court.";

    const relationshipLine = relationshipKnown
      ? `The respondent is my ${relationshipCategory}.`
      : "I can explain the relationship category if the court needs it for eligibility.";

    const riskBits: string[] = [];
    if (threats) riskBits.push(`Threats: ${threats}`);
    if (injuries) riskBits.push(`Injuries: ${injuries}`);
    if (cohabitation === "Lives together now") riskBits.push("We currently live together");
    if (childrenInvolved && !looksLikeNo(childrenInvolved)) riskBits.push("Children were involved/affected");
    if (firearmsAccess === "Yes") riskBits.push("Firearms access was reported");

    const riskLine =
      riskBits.length > 0
        ? `My safety concern is: ${riskBits.join(". ")}.`
        : "My safety concern is that the incidents are continuing or escalating and I am afraid for my safety.";

    const whyNowLine =
      safeString(incidentCore?.date) || mostRecentIncidentAt
        ? "I’m requesting protection now because the most recent incident is recent and I’m concerned the situation will continue or escalate."
        : "I’m requesting protection now because I’m concerned the situation will continue or escalate.";

    const exParteScript = [
      `Good ${dayGreeting}, Your Honor. My name is [your name]. I am the petitioner, and I am requesting a Temporary Order of Protection.`,
      relationshipLine,
      `The most recent incident was on ${incidentDate}${incidentTime ? ` at about ${incidentTime}` : ""} at ${incidentLocation}. The respondent ${whatHappened}.`,
      riskLine,
      whyNowLine,
      evidenceSay,
      `I’m requesting ${reliefAsk}. I’m requesting those terms because they address the specific safety risk and reduce the chance of further contact or harm.`,
      `If helpful, I can summarize the prior incidents in date order and tie each one to the evidence I have.`
    ].join("\n\n");

    const returnDateScript = [
      `Good ${dayGreeting}, Your Honor. I’m the petitioner. I’m asking the court to continue the temporary order and schedule/keep a fact-finding hearing if the order is contested.`,
      `My request is based on the reported incidents, especially the most recent incident on ${incidentDate}.`,
      `I have organized my timeline and evidence. I can testify to what I personally observed and provide the proof I have.`,
      `I’m requesting ${reliefAsk} because it directly addresses safety and prevents further incidents.`
    ].join("\n\n");

    const factFindingOutline: string[] = [
      "1) Foundation (30 seconds): who you are, how you know respondent, and what you want (protection for safety).",
      "2) Eligibility (short): relationship category + simple facts showing family/household or intimate relationship.",
      "3) Incident #1 (most recent): date/time/location → exact actions/words → what you did next → impact/injury/threat.",
      "4) Incident #2 (if applicable): same structure, no side stories.",
      "5) Incident #3 (if applicable): same structure.",
      "6) Pattern/escalation: one sentence connecting the incidents (frequency, recentness, escalation).",
      "7) Evidence: identify each item, what it shows, and which incident it supports.",
      "8) Relief requested: list each term and the safety reason for each (how it prevents a specific risk)."
    ];

    const judgeQuestions: Array<{ q: string; a: string }> = [
      {
        q: "“Why are you asking for an order today?”",
        a: "“Because the most recent incident was recent and I’m concerned the behavior will continue or escalate. I’m asking for specific conditions to prevent further contact or harm.”"
      },
      {
        q: "“What exactly happened in the most recent incident?”",
        a: `“On ${incidentDate}${incidentTime ? ` around ${incidentTime}` : ""} at ${incidentLocation}, the respondent ${whatHappened}. Then I [what you did next].”`
      },
      {
        q: "“What do you want the order to say?”",
        a: `“I’m requesting ${reliefAsk}. I’m requesting those terms because they address the safety risk.”`
      },
      {
        q: "“What proof do you have?”",
        a: `“${evidenceSay}”`
      },
      {
        q: "“Any existing cases or orders?”",
        a: existingOrders && !looksLikeNo(existingOrders) ? `“Yes. ${existingOrders}.”` : "“No existing cases or orders.”"
      },
      {
        q: "“Any firearms?”",
        a: firearmsAccess ? `“${firearmsAccess}.”` : "“Unknown.”"
      },
      {
        q: "“You live together. Are you asking me to order them to move out?”",
        a:
          cohabitation === "Lives together now"
            ? "“Yes, Your Honor. I am requesting exclusion because [describe fear/risk]. I have no other safe place to go.”"
            : "“No, we do not currently live together.”"
      }
    ];

    return { exParteScript, returnDateScript, factFindingOutline, judgeQuestions };
  }, [derived, dayGreeting]);

  return (
    <div className="min-h-[calc(100vh-120px)] animate-float-in text-ink">
      <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
        <Link
          href={`/case/${caseFile.id}/interview`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
        >
          Back to Interview
        </Link>
        <Link
          href={`/case/${caseFile.id}/summary`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
        >
          View Facts
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* LEFT SIDEBAR (dashboard-style) */}
        <aside className="hidden lg:block">
          <GlassCard className="p-4 space-y-4 text-ink">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Navigation
              </p>
              <h2 className="text-sm font-bold text-ink">Case Dashboard</h2>
            </div>

            <div className="space-y-2">
              <Link
                href={`/case/${caseFile.id}/interview`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span>Interview</span>
                <span className="text-slate-400">↗</span>
              </Link>

              <Link
                href={`/case/${caseFile.id}/summary`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span>Facts Summary</span>
                <span className="text-slate-400">↗</span>
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</p>
              <div className="mt-2 space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mode</span>
                  <span className="font-semibold text-ink">{status === "active" ? "Active" : "Draft"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Safety</span>
                  <span className="font-semibold text-ink">{derived.safetyStatus || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Relationship</span>
                  <span className="font-semibold text-ink">{derived.relationshipCategory || "Not set"}</span>
                </div>
              </div>
            </div>

            {status !== "active" ? (
              <div className="rounded-xl border border-accentRose/20 bg-accentRose/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accentRose">
                  Draft mode
                </p>
                <p className="mt-2 text-xs text-slate-700 leading-relaxed">
                  Finish the interview to generate the strongest plan.
                </p>
                <Link
                  href={`/case/${caseFile.id}/interview`}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-ink shadow-sm border border-slate-200 hover:bg-slate-50"
                >
                  Continue
                </Link>
              </div>
            ) : null}
          </GlassCard>
        </aside>

        {/* MAIN */}
        <main className="space-y-6">
          {/* Header row (dashboard-like) */}
          <GlassCardStrong className="p-5 text-ink">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-accentBlue">
                  Dashboard
                </p>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-ink">
                  Your Filing Roadmap
                </h1>
                <p className="text-sm text-slate-600 max-w-2xl">
                  Informational only (not legal advice). Optimized for clear, chronological, court-ready speaking.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/case/${caseFile.id}/interview`}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
                >
                  Interview
                </Link>
                <Link
                  href={`/case/${caseFile.id}/summary`}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
                >
                  Facts
                </Link>
              </div>
            </div>

{/* Quick Update */}
<div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        Quick Update
      </p>
      <p className="mt-1 text-xs text-slate-700">
        Add a new detail (incident, threat, evidence, safety change) without restarting.
      </p>
    </div>
  </div>

  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <SafetyUpdateInput
      caseFile={caseFile}
      onSafetyInterrupt={() => setInterruptOpen(true)}
    />
  </div>
</div>
          </GlassCardStrong>

          {/* KPI row */}
          <div className="grid gap-4 md:grid-cols-3">
            <GlassCard className="p-4 text-ink">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Timeline Items
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-ink">
                  {derived.timelineItems.length}
                </span>
                <span className="text-xs text-slate-500">items</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Built from outputs, facts, or your top incidents.
              </p>
            </GlassCard>

            <GlassCard className="p-4 text-ink">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Evidence Items
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-ink">
                  {derived.evidenceChecklist.length}
                </span>
                <span className="text-xs text-slate-500">tracked</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Consolidated from intake + facts + incident attachments.
              </p>
            </GlassCard>

            <GlassCard className="p-4 text-ink">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Top Incidents
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-ink">
                  {derived.topIncidents.length}
                </span>
                <span className="text-xs text-slate-500">anchors</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Highest detail incidents used to draft scripts.
              </p>
            </GlassCard>
          </div>

          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* LEFT */}
            <div className="space-y-6">
              {/* Timeline preview */}
              <GlassCard className="p-5 text-ink">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-ink">Timeline</h2>
                  <span className="text-xs text-slate-400">Showing up to 6</span>
                </div>
                <div className="mt-4">
                  {derived.timelineItems.length ? (
                    <ul className="space-y-2">
                      {derived.timelineItems.slice(0, 6).map((item: string, index: number) => (
                        <li
                          key={`${index}-${item}`}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700"
                        >
                          <span className="text-slate-400 mr-2">{index + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Add incidents to build a timeline.</p>
                  )}
                </div>
              </GlassCard>

              {/* Scripts */}
              <GlassCard className="p-5 space-y-4 text-ink">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-ink">Scripts for Court</h2>
                  <span className="text-xs text-slate-400">Record-first</span>
                </div>

                <details className="group rounded-2xl border border-slate-200 bg-slate-50 open:bg-slate-100">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 group-hover:text-accentBlue">
                    Ex Parte (Temporary Order)
                  </summary>
                  <div className="px-4 pb-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {scripts.exParteScript}
                    </pre>
                  </div>
                </details>

                <details className="group rounded-2xl border border-slate-200 bg-slate-50 open:bg-slate-100">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 group-hover:text-accentBlue">
                    Return Date
                  </summary>
                  <div className="px-4 pb-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {scripts.returnDateScript}
                    </pre>
                  </div>
                </details>

                <details className="group rounded-2xl border border-slate-200 bg-slate-50 open:bg-slate-100">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 group-hover:text-accentBlue">
                    Fact-Finding Outline
                  </summary>
                  <div className="px-4 pb-4">
                    <ol className="space-y-2 text-sm text-slate-700">
                      {scripts.factFindingOutline.map((line: string, i: number) => (
                        <li key={`${i}-${line}`} className="leading-relaxed">
                          <span className="text-slate-400 mr-2">{i + 1}.</span>
                          {line}
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>
              </GlassCard>

              {/* Judge Q&A */}
              <GlassCard className="p-5 text-ink">
                <h2 className="text-sm font-bold text-ink">Common Judge Questions</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {scripts.judgeQuestions.map((qa, idx) => (
                    <div
                      key={`${idx}-${qa.q}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-widest text-accentBlue">
                        {qa.q}
                      </p>
                      <p className="mt-2 text-sm text-slate-700 italic leading-relaxed">
                        {qa.a}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* RIGHT */}
            <aside className="space-y-6">
              {/* Evidence */}
              <GlassCard className="p-5 text-ink">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ink">Evidence</h3>
                  <span className="text-xs text-slate-400">Top 8</span>
                </div>
                <div className="mt-4">
                  {derived.evidenceChecklist.length ? (
                    <ul className="space-y-2">
                      {derived.evidenceChecklist.slice(0, 8).map((item: string, index: number) => (
                        <li
                          key={`${index}-${item}`}
                          className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                        >
                          <span className="text-accentRose mt-[1px]">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Add texts, photos, reports, witnesses, logs.
                    </p>
                  )}
                </div>
              </GlassCard>

              {/* Strategy tips */}
              {tips.length > 0 ? (
                <GlassCard className="p-5 border border-amber-400/20 bg-amber-50 text-ink">
                  <h3 className="text-sm font-bold text-amber-700">Personalized Strategy</h3>
                  <ul className="mt-3 space-y-2">
                    {tips.map((tip, i) => (
                      <li key={i} className="text-xs text-slate-700 leading-relaxed">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              ) : null}

              {/* Safety */}
              <GlassCard className="p-5 border border-accentRose/20 bg-accentRose/5 text-ink">
                <h3 className="text-sm font-bold text-accentRose">Safety First</h3>
                <p className="mt-2 text-xs text-slate-700 leading-relaxed">
                  If you are in immediate danger, call 911. This tool is informational only.
                </p>

                {derived.showHotlines ? (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Hotlines (confidential)
                      </p>
                      <p className="mt-2 text-xs text-slate-700">
                        NY State Domestic & Sexual Violence: 800-942-6906
                      </p>
                      <p className="text-xs text-slate-700">Text: 844-997-2121</p>
                      <p className="text-xs text-slate-700">NYC Safe Horizon: 800-621-4673</p>
                    </div>
                  </div>
                ) : null}
              </GlassCard>
            </aside>
          </div>

          <SafetyInterrupt open={interruptOpen} onClose={() => setInterruptOpen(false)} />
        </main>
      </div>
    </div>
  );
}
