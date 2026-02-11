"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { SafetyUpdateInput } from "@/components/SafetyUpdateInput";
import { CaseSubNav } from "@/components/CaseSubNav";
import { SafetyInterrupt } from "@/components/SafetyInterrupt";
import { useCaseStore, useHydrated } from "@/store/useCaseStore";
import { normalizeOutputText } from "@/lib/utils";
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
  return s.split(/\n|,|;|\u2022/g).map((x) => x.trim()).filter(Boolean);
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
      <GlassCard className="space-y-4 max-w-2xl mx-auto mt-20 text-ui-text">
        <h1 className="text-2xl font-bold text-ui-text">Case not found</h1>
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

  return <RoadmapContent caseFile={caseFile} />;
}

function RoadmapContent({ caseFile }: { caseFile: CaseFile }) {
  const [interruptOpen, setInterruptOpen] = useState(false);
  const now = useMemo(() => new Date(), []);
  const dayGreeting = now.getHours() < 12 ? "morning" : "afternoon";

  const { intake, facts, outputs, safety, status } = caseFile;

  const petitionerName = facts.parties.petitioner || intake.petitionerName || "[Your Name]";

  const incidents = useMemo<FactsIncident[]>(
    () => (Array.isArray(facts.incidents) ? facts.incidents : []),
    [facts]
  );

  const getField = useCallback(
    (key: keyof IntakeData): string => {
      const fromIntake = safeString(intake[key]);
      if (fromIntake) return fromIntake;

      const safetyConcerns = facts.safetyConcerns ?? [];

      if (key === "firearmsAccess") {
        const joined = safetyConcerns.join(" ").toLowerCase();
        if (joined.includes("firearm") || joined.includes("gun")) {
          if (joined.includes("yes")) return "Yes";
          if (joined.includes("no")) return "No";
          return "Unknown";
        }
      }

      if (key === "safetyStatus") {
        if (safety.immediateDanger || safety.flags.includes("immediate_danger")) {
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
      ...splitToList(facts.evidenceList),
      ...topIncidents.flatMap((i) => splitToList(i?.evidence))
    ]);

    const reliefList = uniq([
      ...splitToList(getField("requestedRelief")),
      ...splitToList(facts.requestedRelief)
    ]);

    const timelineItems: string[] = (() => {
      if (outputs.timelineSummary.length) {
        return outputs.timelineSummary;
      }
      if (facts.timeline.length) return facts.timeline;
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

    const scriptText = safeString(outputs.script2Min);

    const evidenceChecklist: string[] =
      outputs.evidenceChecklist.length
        ? outputs.evidenceChecklist.filter((x): x is string => typeof x === "string")
        : evidenceList;

    return {
      relationshipCategory,
      relationshipKnown,
      familyCourtLikely,
      safetyStatus,
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
        "Confirm your relationship category. Family Court access depends on a qualifying relationship (family/household or an intimate relationship)."
      );
    } else if (!familyCourtLikely) {
      t.push(
        "Based on the relationship selected, Family Court might not be available. Ask the clerk about a Criminal Court path (parallel matters can exist)."
      );
    } else if (relationshipCategory !== "Spouse" && relationshipCategory !== "Parent of child in common") {
      t.push(
        "If this is an intimate relationship, be ready to describe it concretely (how long, how often you saw each other, the nature of the relationship) so eligibility is clear."
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
      t.push("If you live together, be prepared to request exclusion or a clear stay-away perimeter to safely access the home.");
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
      ? `The respondent is my ${relationshipCategory.toLowerCase()}.`
      : "I can explain the relationship category if the court needs it for eligibility.";

    const riskBits: string[] = [];
    if (threats) riskBits.push(`threats: ${threats}`);
    if (injuries) riskBits.push(`injuries: ${injuries}`);
    if (cohabitation === "Lives together now") riskBits.push("we currently live together");
    if (childrenInvolved && !looksLikeNo(childrenInvolved)) riskBits.push("children were involved or affected");
    if (firearmsAccess === "Yes") riskBits.push("firearms access was reported");

    const riskLine =
      riskBits.length > 0
        ? `My safety concern is: ${riskBits.join("; ")}.`
        : "My safety concern is that the incidents are continuing or escalating and I am afraid for my safety.";

    const whyNowLine =
      safeString(incidentCore?.date) || mostRecentIncidentAt
        ? "I'm requesting protection now because the most recent incident is recent and I'm concerned the situation will continue or escalate."
        : "I'm requesting protection now because I'm concerned the situation will continue or escalate.";

    const exParteScript = normalizeOutputText([
      `Good ${dayGreeting}, Your Honor. My name is ${petitionerName}. I am the petitioner, and I am requesting a Temporary Order of Protection.`,
      relationshipLine,
      `The most recent incident was on ${incidentDate}${incidentTime ? ` at about ${incidentTime}` : ""} at ${incidentLocation}. The respondent ${whatHappened}.`,
      riskLine,
      whyNowLine,
      evidenceSay,
      `I'm requesting ${reliefAsk}. I'm requesting those terms because they address the specific safety risk and reduce the chance of further contact or harm.`,
      `If helpful, I can summarize the prior incidents in date order and tie each one to the evidence I have.`
    ].join("\n\n"));

    const returnDateScript = normalizeOutputText([
      `Good ${dayGreeting}, Your Honor. I'm the petitioner. I'm asking the court to continue the temporary order and schedule or keep a fact-finding hearing if the order is contested.`,
      `My request is based on the reported incidents, especially the most recent incident on ${incidentDate}.`,
      `I have organized my timeline and evidence. I can testify to what I personally observed and provide the proof I have.`,
      `I'm requesting ${reliefAsk} because it directly addresses safety and prevents further incidents.`
    ].join("\n\n"));

    const factFindingOutline: string[] = [
      "Foundation (30 seconds): who you are, how you know the respondent, and what you want (protection for safety).",
      "Eligibility (short): relationship category plus simple facts showing family/household or intimate relationship.",
      "Incident #1 (most recent): date/time/location, exact actions/words, what you did next, impact/injury/threat.",
      "Incident #2 (if applicable): same structure, no side stories.",
      "Incident #3 (if applicable): same structure.",
      "Pattern/escalation: one sentence connecting the incidents (frequency, recentness, escalation).",
      "Evidence: identify each item, what it shows, and which incident it supports.",
      "Relief requested: list each term and the safety reason for each (how it prevents a specific risk)."
    ];

    const judgeQuestions: Array<{ q: string; a: string }> = [
      {
        q: "Why are you asking for an order today?",
        a: normalizeOutputText("Because the most recent incident was recent and I'm concerned the behavior will continue or escalate. I'm asking for specific conditions to prevent further contact or harm.")
      },
      {
        q: "What exactly happened in the most recent incident?",
        a: normalizeOutputText(`On ${incidentDate}${incidentTime ? ` around ${incidentTime}` : ""} at ${incidentLocation}, the respondent ${whatHappened}. Then I [what you did next].`)
      },
      {
        q: "What do you want the order to say?",
        a: normalizeOutputText(`I'm requesting ${reliefAsk}. I'm requesting those terms because they address the safety risk.`)
      },
      {
        q: "What proof do you have?",
        a: normalizeOutputText(evidenceSay)
      },
      {
        q: "Any existing cases or orders?",
        a: existingOrders && !looksLikeNo(existingOrders) ? normalizeOutputText(`Yes. ${existingOrders}.`) : "No existing cases or orders."
      },
      {
        q: "Any firearms?",
        a: firearmsAccess ? `${firearmsAccess}.` : "Unknown."
      },
      {
        q: "You live together. Are you asking me to order them to move out?",
        a:
          cohabitation === "Lives together now"
            ? "Yes, Your Honor. I am requesting exclusion because [describe fear/risk]. I have no other safe place to go."
            : "No, we do not currently live together."
      }
    ];

    return { exParteScript, returnDateScript, factFindingOutline, judgeQuestions };
  }, [derived, dayGreeting, petitionerName]);

  // Table of Contents sections for anchor-link navigation
  const tocSections = [
    { id: "roadmap-timeline", label: "Timeline" },
    { id: "roadmap-scripts", label: "Scripts" },
    { id: "roadmap-judge-qa", label: "Judge Questions" },
    { id: "roadmap-evidence", label: "Evidence" },
    { id: "roadmap-strategy", label: "Strategy" },
    { id: "roadmap-forms", label: "Forms" },
    { id: "roadmap-safety", label: "Safety" },
  ];

  return (
    <div className="min-h-[calc(100vh-120px)] animate-float-in text-ui-text">
      <div className="mb-6">
        <CaseSubNav caseId={caseFile.id} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* LEFT SIDEBAR */}
        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <GlassCard className="p-4 space-y-4 text-ui-text">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</p>
              <div className="mt-2 space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 flex-shrink-0">Mode</span>
                  <span className="font-semibold text-ui-text text-right">{status === "active" ? "Active" : "Draft"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 flex-shrink-0">Safety</span>
                  <span className="font-semibold text-ui-text text-right">{derived.safetyStatus || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 flex-shrink-0">Relationship</span>
                  <span className="font-semibold text-ui-text text-right truncate max-w-[120px]" title={derived.relationshipCategory || "Not set"}>{derived.relationshipCategory || "Not set"}</span>
                </div>
              </div>
            </div>

            {status !== "active" ? (
              <div className="rounded-xl border border-ui-danger/20 bg-ui-danger/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ui-danger">
                  Draft mode
                </p>
                <p className="mt-2 text-xs text-slate-700 leading-relaxed">
                  Finish the interview to generate the strongest plan.
                </p>
                <Link
                  href={`/case/${caseFile.id}/interview`}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-ui-text shadow-sm border border-slate-200 hover:bg-slate-50"
                >
                  Continue
                </Link>
              </div>
            ) : null}
          </GlassCard>

          {/* Table of Contents - hidden on mobile, shown on lg */}
          <GlassCard className="hidden lg:block p-4 text-ui-text">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">On this page</p>
            <nav className="mt-2 space-y-1">
              {tocSections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block rounded-lg px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-ui-primary transition-colors"
                >
                  {sec.label}
                </a>
              ))}
            </nav>
          </GlassCard>
        </aside>

        {/* MAIN */}
        <main className="space-y-6">
          {/* Header */}
          <GlassCardStrong className="p-5 text-ui-text">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-ui-primary">
                Roadmap
              </p>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-ui-text">
                Your Filing Roadmap
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Informational only (not legal advice). Optimized for clear, chronological, court-ready speaking.
              </p>
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
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <GlassCard className="p-4 text-ui-text">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Timeline Items
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-ui-text">
                  {derived.timelineItems.length}
                </span>
                <span className="text-xs text-slate-500">items</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Built from your interview answers and top incidents.
              </p>
            </GlassCard>

            <GlassCard className="p-4 text-ui-text">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Evidence Items
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-ui-text">
                  {derived.evidenceChecklist.length}
                </span>
                <span className="text-xs text-slate-500">tracked</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Combined from your intake, interview, and incident details.
              </p>
            </GlassCard>

            <GlassCard className="p-4 text-ui-text">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Key Incidents
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-ui-text">
                  {derived.topIncidents.length}
                </span>
                <span className="text-xs text-slate-500">documented</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Most detailed incidents used to draft your scripts.
              </p>
            </GlassCard>
          </div>

          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* LEFT column */}
            <div className="space-y-6">
              {/* Timeline */}
              <GlassCard id="roadmap-timeline" className="p-5 text-ui-text scroll-mt-52">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-ui-text">Timeline</h2>
                  <span className="text-xs text-slate-400">Showing up to 6</span>
                </div>
                <div className="mt-4">
                  {derived.timelineItems.length ? (
                    <div className="relative ml-3 border-l-2 border-slate-200 pl-4 space-y-4">
                      {derived.timelineItems.slice(0, 6).map((item: string, index: number) => {
                        const dateMatch = item.match(/^([A-Za-z]{3}\s+\d{1,2},?\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|[A-Za-z]+\s+\d{4})/);
                        const dateLabel = dateMatch ? dateMatch[1] : null;
                        const description = dateLabel ? item.slice(dateLabel.length).replace(/^\s*[-:\u2013]\s*/, "") : item;
                        return (
                          <div key={`${index}-${item}`} className="relative">
                            <div className="absolute -left-[22px] top-1 h-3 w-3 rounded-full border-2 border-ui-primary bg-white" />
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                              {dateLabel ? (
                                <>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-ui-primary">{dateLabel}</p>
                                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">{normalizeOutputText(description)}</p>
                                </>
                              ) : (
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  <span className="text-slate-400 mr-2">{index + 1}.</span>
                                  {normalizeOutputText(item)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Add incidents to build a timeline.</p>
                  )}
                </div>
              </GlassCard>

              {/* Scripts */}
              <GlassCard id="roadmap-scripts" className="p-5 space-y-4 text-ui-text scroll-mt-52">
                <h2 className="text-sm font-bold text-ui-text">Scripts for Court</h2>

                <details className="group rounded-2xl border border-slate-200 bg-slate-50 open:bg-slate-100">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 group-hover:text-ui-primary">
                    Ex Parte (Temporary Order)
                  </summary>
                  <div className="px-4 pb-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {scripts.exParteScript}
                    </pre>
                  </div>
                </details>

                <details className="group rounded-2xl border border-slate-200 bg-slate-50 open:bg-slate-100">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 group-hover:text-ui-primary">
                    Return Date
                  </summary>
                  <div className="px-4 pb-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {scripts.returnDateScript}
                    </pre>
                  </div>
                </details>

                <details className="group rounded-2xl border border-slate-200 bg-slate-50 open:bg-slate-100">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 group-hover:text-ui-primary">
                    Fact-Finding Outline
                  </summary>
                  <div className="px-4 pb-4">
                    <ol className="space-y-2 text-sm text-slate-700">
                      {scripts.factFindingOutline.map((line: string, i: number) => (
                        <li key={`${i}-${line}`} className="leading-relaxed">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-ui-primary/10 text-[10px] font-bold text-ui-primary mr-2">{i + 1}</span>
                          {line}
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>
              </GlassCard>

              {/* Judge Q&A */}
              <GlassCard id="roadmap-judge-qa" className="p-5 text-ui-text scroll-mt-52">
                <h2 className="text-sm font-bold text-ui-text">Common Judge Questions</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {scripts.judgeQuestions.map((qa, idx) => (
                    <div
                      key={`${idx}-${qa.q}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-[11px] font-bold text-ui-primary leading-snug">
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

            {/* RIGHT column */}
            <aside className="space-y-6">
              {/* Evidence */}
              <GlassCard id="roadmap-evidence" className="p-5 text-ui-text scroll-mt-52">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ui-text">Evidence</h3>
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
                          <span className="text-ui-danger mt-[1px]">&#10003;</span>
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
                <GlassCard id="roadmap-strategy" className="p-5 border border-amber-400/20 bg-amber-50 text-ui-text scroll-mt-52">
                  <h3 className="text-sm font-bold text-amber-700">Personalized Strategy</h3>
                  <ul className="mt-3 space-y-2">
                    {tips.map((tip, i) => (
                      <li key={i} className="text-xs text-slate-700 leading-relaxed">
                        &bull; {tip}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              ) : null}

              {/* Court Forms Quick Links */}
              <GlassCard id="roadmap-forms" className="p-5 text-ui-text scroll-mt-52">
                <h3 className="text-sm font-bold text-ui-text">Key Court Forms</h3>
                <div className="mt-3 space-y-2">
                  <a
                    href="https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/8-2.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 hover:border-ui-primary/30 hover:bg-white"
                  >
                    <span><span className="font-bold text-ui-primary">8-2</span> Family Offense Petition</span>
                    <span className="text-slate-400">&#8599;</span>
                  </a>
                  <a
                    href="https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/gf-21.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 hover:border-ui-primary/30 hover:bg-white"
                  >
                    <span><span className="font-bold text-ui-primary">GF-21</span> Address Confidentiality</span>
                    <span className="text-slate-400">&#8599;</span>
                  </a>
                  <a
                    href="https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/GF-8.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 hover:border-ui-primary/30 hover:bg-white"
                  >
                    <span><span className="font-bold text-ui-primary">GF-8</span> Violation Petition</span>
                    <span className="text-slate-400">&#8599;</span>
                  </a>
                  <Link
                    href="/guide#forms"
                    className="flex items-center justify-center rounded-lg border border-ui-primary/20 bg-ui-primary/5 px-3 py-2 text-xs font-semibold text-ui-primary hover:bg-ui-primary/10"
                  >
                    View All Forms &amp; Guide
                  </Link>
                </div>
              </GlassCard>

              {/* Safety - more visually prominent */}
              <GlassCard id="roadmap-safety" className="p-5 border-2 border-ui-danger/40 bg-red-50 text-ui-text scroll-mt-52">
                <div className="flex items-center gap-2">
                  <span className="text-lg" role="img" aria-label="Warning">&#9888;&#65039;</span>
                  <h3 className="text-sm font-bold text-ui-danger">Safety First</h3>
                </div>
                <p className="mt-2 text-xs text-slate-700 leading-relaxed">
                  If you are in immediate danger, call <strong>911</strong>. This tool is informational only &mdash; it is not legal advice.
                </p>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Hotlines (confidential)
                    </p>
                    <p className="mt-2 text-xs text-slate-700">
                      NY State Domestic &amp; Sexual Violence: <strong>800-942-6906</strong>
                    </p>
                    <p className="text-xs text-slate-700">Text: <strong>844-997-2121</strong></p>
                    <p className="text-xs text-slate-700">NYC Safe Horizon: <strong>800-621-4673</strong></p>
                    <p className="text-xs text-slate-700">National DV Hotline: <strong>1-800-799-7233</strong></p>
                  </div>
                </div>
              </GlassCard>
            </aside>
          </div>

          <SafetyInterrupt open={interruptOpen} onClose={() => setInterruptOpen(false)} />
        </main>
      </div>
    </div>
  );
}
