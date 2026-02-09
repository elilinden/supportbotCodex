"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
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

/** 9-Step Roadmap content — Filing through Trial */
const ROADMAP_STEPS = [
  {
    id: "filing",
    title: "Filing the Petition",
    summary:
      "Go to Family Court and file a Family Offense Petition. You'll fill out a petition form describing the incidents and what protection you need."
  },
  {
    id: "ex-parte",
    title: "Ex Parte (Temporary Order)",
    summary:
      "After filing, the judge may issue a Temporary Order of Protection the same day — without the respondent present. Prepare your 2-minute script."
  },
  {
    id: "service",
    title: "Service of Process",
    summary:
      "The respondent must be formally served with the petition and temporary order. The court clerk can arrange service through a process server or police."
  },
  {
    id: "return-date",
    title: "Return Date Hearing",
    summary:
      "Both parties appear. The judge may continue the temporary order, modify it, or schedule a fact-finding hearing if the order is contested."
  },
  {
    id: "fact-finding",
    title: "Fact-Finding Hearing",
    summary:
      "You present your evidence. Testify to what you personally observed. Stick to facts: dates, times, locations, actions, injuries, threats."
  },
  {
    id: "disposition",
    title: "Disposition",
    summary:
      "If the court finds a family offense, it issues a final Order of Protection with specific terms (stay-away, no contact, exclusion, etc.)."
  },
  {
    id: "compliance",
    title: "Compliance & Enforcement",
    summary:
      "Keep a certified copy of the order with you at all times. If the respondent violates the order, call 911 — violation is a criminal offense."
  },
  {
    id: "renewal",
    title: "Renewal / Modification",
    summary:
      "Orders can be renewed before expiration. If circumstances change, you can request modifications from the court."
  },
  {
    id: "appeals",
    title: "Appeals & Parallel Matters",
    summary:
      "Either party can appeal. Criminal charges, custody, and divorce can run in parallel. Keep records organized across all proceedings."
  }
];

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
  const fields = [inc.date, inc.time, inc.location, inc.whatHappened, inc.injuries, inc.threats, inc.witnesses, inc.evidence];
  return fields.reduce((acc, f) => acc + (safeString(f) ? 1 : 0), 0);
}

export default function RoadmapPage() {
  const params = useParams<{ id: string | string[] }>();
  const caseId = Array.isArray(params.id) ? params.id[0] : params.id;

  const caseFile = useCaseStore((state) =>
    state.cases.find((item) => item.id === caseId)
  ) as CaseFile | undefined;

  const [interruptOpen, setInterruptOpen] = useState(false);
  const [openStepId, setOpenStepId] = useState<string | null>("filing");

  const now = useMemo(() => new Date(), []);
  const dayGreeting = now.getHours() < 12 ? "morning" : "afternoon";

  if (!caseFile) {
    return (
      <div className="mx-auto mt-20 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Case not found</h1>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
          >
            Back Home
          </Link>
          <Link
            href="/settings"
            className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
          >
            Settings
          </Link>
        </div>
      </div>
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
      safetyStatus === "Unsafe" || safetyStatus === "Immediate danger" ||
      Boolean((safety as any)?.immediateDanger) || Boolean((safety as any)?.flags?.includes("immediate_danger"));
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
      if (Array.isArray((outputs as any)?.timelineSummary) && (outputs as any).timelineSummary.length) return (outputs as any).timelineSummary;
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
      relationshipCategory, relationshipKnown, familyCourtLikely, safetyStatus, showHotlines,
      cohabitation, childrenInvolved, firearmsAccess, existingOrders, patternSummary,
      mostRecentIncidentAt, topIncidents, evidenceList, reliefList, timelineItems, scriptText, evidenceChecklist
    };
  }, [facts, getField, incidents, outputs, safety]);

  const tips = useMemo(() => {
    const t: string[] = [];
    const { relationshipKnown, familyCourtLikely, relationshipCategory, firearmsAccess, childrenInvolved, cohabitation, existingOrders } = derived;
    if (!relationshipKnown) {
      t.push("Confirm your relationship category. Family Court access depends on a qualifying relationship.");
    } else if (!familyCourtLikely) {
      t.push("Based on the relationship selected, Family Court might not be available. Ask the clerk about a Criminal Court path.");
    } else if (relationshipCategory !== "Spouse" && relationshipCategory !== "Parent of child in common") {
      t.push('If this is an "intimate relationship," be ready to describe it concretely so eligibility is clear.');
    }
    if (firearmsAccess === "Yes") t.push("If firearms are involved, state it early and ask about firearms surrender language.");
    if (childrenInvolved && !looksLikeNo(childrenInvolved)) t.push("If children were present or impacted, keep it factual: where they were, what they saw/heard.");
    if (cohabitation === "Lives together now") t.push('If you live together, be prepared to request "exclusion" or a clear stay-away perimeter.');
    if (existingOrders && !looksLikeNo(existingOrders)) t.push("Bring docket numbers/copies of any existing cases or orders.");
    return t;
  }, [derived]);

  const scripts = useMemo(() => {
    const { relationshipKnown, relationshipCategory, topIncidents, mostRecentIncidentAt, patternSummary, cohabitation, childrenInvolved, firearmsAccess, existingOrders, evidenceList, reliefList } = derived;
    const incidentCore = topIncidents[0] || {};
    const incidentDate = safeString(incidentCore?.date) || mostRecentIncidentAt || "[date]";
    const incidentTime = safeString(incidentCore?.time);
    const incidentLocation = safeString(incidentCore?.location) || "[location]";
    const whatHappened = safeString(incidentCore?.whatHappened) || patternSummary || "[brief, factual description of what happened]";
    const injuries = safeString(incidentCore?.injuries);
    const threats = safeString(incidentCore?.threats);
    const reliefAsk = reliefList.length > 0 ? joinNice(reliefList) : "[stay-away / no-contact / exclusion / child-related terms]";
    const evidenceSay = evidenceList.length > 0
      ? `I have ${joinNice(evidenceList.slice(0, 4))}${evidenceList.length > 4 ? " and additional supporting proof." : "."}`
      : "I have supporting proof (texts, photos, reports, witnesses) and can provide it to the court.";
    const relationshipLine = relationshipKnown ? `The respondent is my ${relationshipCategory}.` : "I can explain the relationship category if the court needs it for eligibility.";
    const riskBits: string[] = [];
    if (threats) riskBits.push(`Threats: ${threats}`);
    if (injuries) riskBits.push(`Injuries: ${injuries}`);
    if (cohabitation === "Lives together now") riskBits.push("We currently live together");
    if (childrenInvolved && !looksLikeNo(childrenInvolved)) riskBits.push("Children were involved/affected");
    if (firearmsAccess === "Yes") riskBits.push("Firearms access was reported");
    const riskLine = riskBits.length > 0
      ? `My safety concern is: ${riskBits.join(". ")}.`
      : "My safety concern is that the incidents are continuing or escalating and I am afraid for my safety.";
    const whyNowLine = safeString(incidentCore?.date) || mostRecentIncidentAt
      ? "I'm requesting protection now because the most recent incident is recent and I'm concerned the situation will continue or escalate."
      : "I'm requesting protection now because I'm concerned the situation will continue or escalate.";

    const exParteScript = [
      `Good ${dayGreeting}, Your Honor. My name is [your name]. I am the petitioner, and I am requesting a Temporary Order of Protection.`,
      relationshipLine,
      `The most recent incident was on ${incidentDate}${incidentTime ? ` at about ${incidentTime}` : ""} at ${incidentLocation}. The respondent ${whatHappened}.`,
      riskLine, whyNowLine, evidenceSay,
      `I'm requesting ${reliefAsk}. I'm requesting those terms because they address the specific safety risk and reduce the chance of further contact or harm.`,
      `If helpful, I can summarize the prior incidents in date order and tie each one to the evidence I have.`
    ].join("\n\n");

    const returnDateScript = [
      `Good ${dayGreeting}, Your Honor. I'm the petitioner. I'm asking the court to continue the temporary order and schedule/keep a fact-finding hearing if the order is contested.`,
      `My request is based on the reported incidents, especially the most recent incident on ${incidentDate}.`,
      `I have organized my timeline and evidence. I can testify to what I personally observed and provide the proof I have.`,
      `I'm requesting ${reliefAsk} because it directly addresses safety and prevents further incidents.`
    ].join("\n\n");

    const factFindingOutline: string[] = [
      "1) Foundation (30 seconds): who you are, how you know respondent, and what you want.",
      "2) Eligibility (short): relationship category + simple facts showing family/household or intimate relationship.",
      "3) Incident #1 (most recent): date/time/location, exact actions/words, what you did next, impact/injury/threat.",
      "4) Incident #2 (if applicable): same structure, no side stories.",
      "5) Incident #3 (if applicable): same structure.",
      "6) Pattern/escalation: one sentence connecting the incidents.",
      "7) Evidence: identify each item, what it shows, and which incident it supports.",
      "8) Relief requested: list each term and the safety reason for each."
    ];

    const judgeQuestions: Array<{ q: string; a: string }> = [
      { q: "Why are you asking for an order today?", a: "Because the most recent incident is recent and I'm concerned the behavior will continue or escalate." },
      { q: "What exactly happened in the most recent incident?", a: `On ${incidentDate}${incidentTime ? ` around ${incidentTime}` : ""} at ${incidentLocation}, the respondent ${whatHappened}.` },
      { q: "What do you want the order to say?", a: `I'm requesting ${reliefAsk}.` },
      { q: "What proof do you have?", a: evidenceSay },
      { q: "Any existing cases or orders?", a: existingOrders && !looksLikeNo(existingOrders) ? `Yes. ${existingOrders}.` : "No existing cases or orders." },
      { q: "Any firearms?", a: firearmsAccess ? `${firearmsAccess}.` : "Unknown." },
      { q: "You live together. Are you asking me to order them to move out?", a: cohabitation === "Lives together now" ? "Yes, Your Honor. I am requesting exclusion because of the safety risk." : "No, we do not currently live together." }
    ];

    return { exParteScript, returnDateScript, factFindingOutline, judgeQuestions };
  }, [derived, dayGreeting]);

  return (
    <div className="min-h-[calc(100vh-120px)] animate-float-in text-slate-900">
      <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
        <Link href={`/case/${caseFile.id}/interview`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50">
          Back to Interview
        </Link>
        <Link href={`/case/${caseFile.id}/summary`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50">
          View Facts
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Navigation</p>
              <h2 className="text-sm font-bold text-slate-900">Case Dashboard</h2>
            </div>
            <div className="space-y-2">
              <Link href={`/case/${caseFile.id}/interview`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                <span>Interview</span><span className="text-slate-400">&rarr;</span>
              </Link>
              <Link href={`/case/${caseFile.id}/summary`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                <span>Facts Summary</span><span className="text-slate-400">&rarr;</span>
              </Link>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</p>
              <div className="mt-2 space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between"><span className="text-slate-500">Mode</span><span className="font-semibold text-slate-900">{status === "active" ? "Active" : "Draft"}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Safety</span><span className="font-semibold text-slate-900">{derived.safetyStatus || "Unknown"}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Relationship</span><span className="font-semibold text-slate-900">{derived.relationshipCategory || "Not set"}</span></div>
              </div>
            </div>
            {status !== "active" ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">Draft mode</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">Finish the interview to generate the strongest plan.</p>
                <Link href={`/case/${caseFile.id}/interview`} className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-900 shadow-sm hover:bg-slate-50">
                  Continue
                </Link>
              </div>
            ) : null}
          </div>
        </aside>

        {/* MAIN */}
        <main className="space-y-6">
          {/* Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-blue-600">Dashboard</p>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">Your Filing Roadmap</h1>
                <p className="text-sm text-slate-600 max-w-2xl">Informational only (not legal advice). Optimized for clear, chronological, court-ready speaking.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/case/${caseFile.id}/interview`} className="rounded-full border border-slate-200 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50">Interview</Link>
                <Link href={`/case/${caseFile.id}/summary`} className="rounded-full border border-slate-200 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50">Facts</Link>
              </div>
            </div>
            {/* Quick Update */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Quick Update</p>
              <p className="mt-1 text-xs text-slate-600">Add a new detail without restarting.</p>
              <div className="mt-3">
                <SafetyUpdateInput caseFile={caseFile} onSafetyInterrupt={() => setInterruptOpen(true)} />
              </div>
            </div>
          </div>

          {/* 9-Step Roadmap Accordion */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Filing &rarr; Service &rarr; Trial</h2>
            {ROADMAP_STEPS.map((rs, idx) => (
              <div key={rs.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenStepId(openStepId === rs.id ? null : rs.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition"
                  aria-expanded={openStepId === rs.id}
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-700">
                    <span className="text-blue-600 mr-2">{idx + 1}.</span>{rs.title}
                  </span>
                  <span className="text-slate-400 text-sm">{openStepId === rs.id ? "−" : "+"}</span>
                </button>
                {openStepId === rs.id ? (
                  <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    <p className="pt-3">{rs.summary}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* KPI row */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Timeline Items</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-slate-900">{derived.timelineItems.length}</span>
                <span className="text-xs text-slate-500">items</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Evidence Items</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-slate-900">{derived.evidenceChecklist.length}</span>
                <span className="text-xs text-slate-500">tracked</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Incidents</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-slate-900">{derived.topIncidents.length}</span>
                <span className="text-xs text-slate-500">anchors</span>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* LEFT */}
            <div className="space-y-6">
              {/* Timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Timeline</h2>
                  <span className="text-xs text-slate-400">Showing up to 6</span>
                </div>
                <div className="mt-4">
                  {derived.timelineItems.length ? (
                    <ul className="space-y-2">
                      {derived.timelineItems.slice(0, 6).map((item: string, index: number) => (
                        <li key={`${index}-${item}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
                          <span className="text-slate-400 mr-2">{index + 1}.</span>{item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Add incidents to build a timeline.</p>
                  )}
                </div>
              </div>

              {/* Scripts */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900">Scripts for Court</h2>

                <details className="group rounded-xl border border-slate-200 bg-slate-50 open:bg-slate-100">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 group-hover:text-blue-600">
                    Ex Parte (Temporary Order)
                  </summary>
                  <div className="px-4 pb-4"><pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{scripts.exParteScript}</pre></div>
                </details>

                <details className="group rounded-xl border border-slate-200 bg-slate-50 open:bg-slate-100">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 group-hover:text-blue-600">
                    Return Date
                  </summary>
                  <div className="px-4 pb-4"><pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{scripts.returnDateScript}</pre></div>
                </details>

                <details className="group rounded-xl border border-slate-200 bg-slate-50 open:bg-slate-100">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 group-hover:text-blue-600">
                    Fact-Finding Outline
                  </summary>
                  <div className="px-4 pb-4">
                    <ol className="space-y-2 text-sm text-slate-700">
                      {scripts.factFindingOutline.map((line: string, i: number) => (
                        <li key={`${i}-${line}`} className="leading-relaxed">{line}</li>
                      ))}
                    </ol>
                  </div>
                </details>
              </div>

              {/* Judge Q&A */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900">Common Judge Questions</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {scripts.judgeQuestions.map((qa, idx) => (
                    <div key={`${idx}-${qa.q}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600">{qa.q}</p>
                      <p className="mt-2 text-sm text-slate-700 italic leading-relaxed">{qa.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <aside className="space-y-6">
              {/* Evidence */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Evidence</h3>
                  <span className="text-xs text-slate-400">Top 8</span>
                </div>
                <div className="mt-4">
                  {derived.evidenceChecklist.length ? (
                    <ul className="space-y-2">
                      {derived.evidenceChecklist.slice(0, 8).map((item: string, index: number) => (
                        <li key={`${index}-${item}`} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                          <span className="text-blue-600 mt-[1px]">&#10003;</span><span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Add texts, photos, reports, witnesses, logs.</p>
                  )}
                </div>
              </div>

              {/* Strategy tips */}
              {tips.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-amber-700">Personalized Strategy</h3>
                  <ul className="mt-3 space-y-2">
                    {tips.map((tip, i) => (<li key={i} className="text-xs text-slate-700 leading-relaxed">&bull; {tip}</li>))}
                  </ul>
                </div>
              ) : null}

              {/* Safety */}
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-red-700">Safety First</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">If you are in immediate danger, call 911. This tool is informational only.</p>
                {derived.showHotlines ? (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hotlines (confidential)</p>
                    <p className="mt-2 text-xs text-slate-700">NY State Domestic & Sexual Violence: 800-942-6906</p>
                    <p className="text-xs text-slate-700">Text: 844-997-2121</p>
                    <p className="text-xs text-slate-700">NYC Safe Horizon: 800-621-4673</p>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>

          <SafetyInterrupt open={interruptOpen} onClose={() => setInterruptOpen(false)} />
        </main>
      </div>
    </div>
  );
}
