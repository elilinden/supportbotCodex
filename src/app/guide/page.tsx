"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import {
  COURT_FORMS,
  COURT_PROCESS_STEPS,
  AVAILABLE_RELIEF,
  QUALIFYING_OFFENSES,
  ORDER_DURATION_INFO,
  CASE_DISPOSITIONS,
} from "@/lib/courtData";
import type { CourtForm } from "@/lib/courtData";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_LABELS: Record<string, string> = {
  filing: "Filing Packet (To Start Your Case)",
  "court-issued": "Court-Issued Documents",
  violation: "If the Order Is Violated",
  modification: "Extension / Modification",
  guide: "Official Guides & Resources",
  remote: "Remote Filing (EDDS)",
  service: "Service Notification",
};

const CATEGORY_ORDER = ["filing", "court-issued", "violation", "modification", "guide", "remote", "service"];

/** Inline legal term definitions — Priority 2 */
const LEGAL_TERMS: Record<string, string> = {
  "Family Offense proceeding":
    "A civil (non-criminal) case in Family Court where you ask for an Order of Protection based on specific offenses committed by a family or household member.",
  "Return date":
    "The court date when both sides come back after the initial filing. The respondent is notified and has a chance to appear.",
  "Inquest":
    "A hearing where only you (the petitioner) present evidence because the respondent did not show up. The judge decides based on what you provide.",
  "Fact-finding hearing":
    "The trial portion of the case where the judge hears testimony and reviews evidence to decide whether a family offense occurred.",
  "Consent order":
    "An agreement where the respondent agrees to the order without admitting fault. It becomes a legally binding court order.",
};

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */

/** Map of form-number patterns to their URLs for inline linking. */
const FORM_URL_MAP: Record<string, string> = {};
for (const form of COURT_FORMS) {
  FORM_URL_MAP[form.formNumber] = form.url;
}

/** Inline clickable term definition — shows a tooltip on tap/hover */
function TermDef({ term }: { term: string }) {
  const [open, setOpen] = useState(false);
  const definition = LEGAL_TERMS[term];
  const toggle = useCallback(() => setOpen((v: boolean) => !v), []);

  if (!definition) return <strong>{term}</strong>;

  return (
    <span className="relative inline">
      <button
        type="button"
        onClick={toggle}
        className="inline cursor-help border-b border-dashed border-ui-primary/50 font-semibold text-slate-900 hover:border-ui-primary"
      >
        {term}
      </button>
      {open && (
        <span className="absolute left-0 top-full z-20 mt-1 w-72 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-lg leading-relaxed">
          {definition}
          <button
            type="button"
            onClick={toggle}
            className="ml-2 font-semibold text-ui-primary hover:underline"
          >
            Close
          </button>
        </span>
      )}
    </span>
  );
}

/** Inline clickable reference for a specific form. */
function InlineForm({ formNumber, label }: { formNumber: string; label?: string }) {
  const form = COURT_FORMS.find((f) => f.formNumber === formNumber || f.id === formNumber);
  if (!form) return <span>{label ?? formNumber}</span>;
  return (
    <a
      href={form.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 font-semibold text-ui-primary underline decoration-ui-primary/30 hover:decoration-ui-primary"
    >
      {label ?? `${form.formNumber} — ${form.name}`}
      <span className="text-[10px]">&#8599;</span>
    </a>
  );
}

/**
 * Replaces known form references (e.g., "GF-21", "8-2", "GF-8") in a plain
 * text string with clickable links. Returns a React fragment.
 */
function linkifyFormRefs(text: string): React.ReactNode {
  // Match form numbers that appear in the text
  const pattern = /\b(GF-\d+[a-z]?|UCS-FC 8-2|8-2)\b/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const ref = match[0];
    const form = COURT_FORMS.find(
      (f) => f.formNumber.toLowerCase() === ref.toLowerCase() ||
        f.formNumber.toLowerCase().includes(ref.toLowerCase())
    );
    if (form) {
      parts.push(
        <a
          key={`${match.index}-${ref}`}
          href={form.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-ui-primary underline decoration-ui-primary/30 hover:decoration-ui-primary"
        >
          {ref}<span className="text-[10px]">&#8599;</span>
        </a>
      );
    } else {
      parts.push(ref);
    }
    lastIndex = match.index + ref.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? <>{parts}</> : text;
}

function FormLink({ form }: { form: CourtForm }) {
  return (
    <a
      href={form.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-ui-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ui-primary">{form.formNumber}</span>
            {form.required && (
              <span className="rounded-full bg-ui-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-ui-primary">
                Required
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-900">{form.name}</p>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">{form.description}</p>
        </div>
        <span className="mt-1 shrink-0 text-slate-400">&#8599;</span>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick-jump targets                                                 */
/* ------------------------------------------------------------------ */

const QUICK_JUMPS = [
  { label: "Steps", href: "#steps" },
  { label: "What to Say", href: "#what-to-say" },
  { label: "Forms", href: "#forms" },
  { label: "Relief", href: "#relief" },
  { label: "Service", href: "#service" },
  { label: "Safety", href: "#safety" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function GuidePage() {
  const groupedForms = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    forms: COURT_FORMS.filter((f) => f.category === cat),
  })).filter((g) => g.forms.length > 0);

  const requiredForms = COURT_FORMS.filter((f) => f.required);
  const additionalForms = COURT_FORMS.filter((f) => !f.required);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <GlassCardStrong className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          NY Family Court / Orders of Protection
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
          Complete Court Guide
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 leading-relaxed">
          Everything you need to know about filing for an Order of Protection in New York Family Court:
          the step-by-step process, every form you need (with links), what to say to the judge,
          how to structure your argument, time estimates, and more.
          <strong className="text-slate-700"> This is informational only and is not legal advice.</strong>
        </p>

        {/* Reassurance — Priority 1 */}
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          You do not need a lawyer to file. Thousands of people navigate this process on their own every year.
          This guide walks you through each step.
        </div>

        {/* Quick Jump buttons — Priority 1 (expanded) */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/new"
            className="rounded-full bg-ui-primary px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90"
          >
            Start Intake
          </Link>
          {QUICK_JUMPS.map((j) => (
            <a
              key={j.href}
              href={j.href}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50"
            >
              {j.label}
            </a>
          ))}
        </div>
      </GlassCardStrong>

      {/* Quick Start — Priority 1 */}
      <GlassCard className="space-y-3 border-2 border-ui-primary/20 bg-ui-primary/5">
        <h2 className="text-base font-bold text-slate-900">Quick Start: 4 Things to Know</h2>
        <ol className="space-y-2 text-sm text-slate-700">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ui-primary text-xs font-bold text-white">1</span>
            <span>You file a <InlineForm formNumber="UCS-FC 8-2" label="Family Offense Petition" /> at Family Court. No fee, no lawyer needed.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ui-primary text-xs font-bold text-white">2</span>
            <span>A judge can issue a <strong>Temporary Order of Protection</strong> the same day you file.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ui-primary text-xs font-bold text-white">3</span>
            <span>The order must be <strong>served</strong> on the other person before it is enforceable. You cannot serve it yourself.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ui-primary text-xs font-bold text-white">4</span>
            <span>At the <TermDef term="Return date" />, the case is either resolved by <TermDef term="Consent order" /> or set for a <TermDef term="Fact-finding hearing" />.</span>
          </li>
        </ol>
      </GlassCard>

      {/* Big Picture */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">What You&apos;re Doing (Big Picture)</h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            A <strong>Family Court Order of Protection</strong> is part of a civil (non-criminal) case called a{" "}
            <TermDef term="Family Offense proceeding" />. You start it by filing a{" "}
            <InlineForm formNumber="UCS-FC 8-2" label="Family Offense Petition" />.
          </p>
          <p>
            Family Court and Criminal Court often have <strong>concurrent jurisdiction</strong> over
            family offenses, meaning you may be able to proceed in Family Court, Criminal Court, or both.
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Two Core Stages</p>
            <ol className="mt-2 space-y-2 text-sm">
              <li>
                <strong>1. Temporary Order of Protection (TOP)</strong> — Fast, usually same day you file.
                Meant to protect you until the next court date.
              </li>
              <li>
                <strong>2. Final Order of Protection</strong> — After the case is resolved, either by{" "}
                <TermDef term="Consent order" /> or after the judge finds a family offense occurred
                at a <TermDef term="Fact-finding hearing" />.
              </li>
            </ol>
          </div>
        </div>
      </GlassCard>

      {/* Who Can File */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Who Can File in Family Court</h2>
        <p className="text-sm text-slate-700">
          You can file if you and the other person are:
        </p>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex gap-2"><span className="text-ui-primary font-bold">1.</span> Related by blood or marriage</li>
          <li className="flex gap-2"><span className="text-ui-primary font-bold">2.</span> Married or formerly married</li>
          <li className="flex gap-2"><span className="text-ui-primary font-bold">3.</span> Have a child in common</li>
          <li className="flex gap-2"><span className="text-ui-primary font-bold">4.</span> Are or were in an intimate relationship (not casual acquaintances)</li>
        </ul>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          If the person does NOT fit one of these categories, Family Court may not be available.
          You may need Criminal Court instead.
        </div>
      </GlassCard>

      {/* Who Can Be Protected — FAQ */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Who Can Be Protected by the Order?</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          People frequently ask whether the order can cover more than just themselves. The short answer: <strong>yes</strong>.
          Family Court can include protections for additional people and locations.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">People</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              <li><span className="mr-1 text-green-600">&#10003;</span> You (the petitioner)</li>
              <li><span className="mr-1 text-green-600">&#10003;</span> Your children (the order can include them)</li>
              <li><span className="mr-1 text-green-600">&#10003;</span> Other family/household members named in the petition</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Locations</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              <li><span className="mr-1 text-green-600">&#10003;</span> Your home / residence</li>
              <li><span className="mr-1 text-green-600">&#10003;</span> Your workplace</li>
              <li><span className="mr-1 text-green-600">&#10003;</span> Your child&apos;s school / daycare</li>
              <li><span className="mr-1 text-green-600">&#10003;</span> Any other location specified by the court</li>
            </ul>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <strong>Custody note:</strong> Temporary custody and visitation provisions can also be addressed in a Family Court
          family offense proceeding. If you need temporary custody as part of the order, tell the judge explicitly.
        </div>
      </GlassCard>

      {/* Qualifying Offenses */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">What Conduct Qualifies (Family Offenses)</h2>
        <p className="text-sm text-slate-700">
          Your <InlineForm formNumber="UCS-FC 8-2" label="petition" /> must allege that a legally recognized family offense occurred. Qualifying offenses include:
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {QUALIFYING_OFFENSES.map((offense) => (
            <div key={offense} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              {offense}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Available Relief */}
      <div id="relief" className="scroll-mt-8">
        <GlassCard className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">What the Judge Can Order (Relief Options)</h2>
          <p className="text-sm text-slate-700">You can ask for any combination of:</p>
          <div className="space-y-3">
            {AVAILABLE_RELIEF.map((relief) => (
              <div key={relief.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{relief.label}</p>
                <p className="mt-1 text-xs text-slate-600">{relief.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Step-by-Step Process */}
      <div id="steps" className="scroll-mt-8 space-y-6">
        <GlassCardStrong className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">Step-by-Step: How It Actually Works</h2>
          <p className="text-sm text-slate-600">
            The typical flow in NYC Family Court (broadly similar statewide). Each step includes time estimates
            and practical tips.
          </p>
        </GlassCardStrong>

        {COURT_PROCESS_STEPS.map((step) => (
          <GlassCard key={step.step} className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ui-primary text-sm font-bold text-white">
                {step.step}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">{linkifyFormRefs(step.description)}</p>
              </div>
            </div>

            <div className="ml-14 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Details</p>
                <ul className="mt-2 space-y-1.5">
                  {step.details.map((d, i) => (
                    <li key={i} className="text-xs text-slate-700 leading-relaxed">
                      <span className="mr-1 text-slate-400">&#8226;</span> {linkifyFormRefs(d)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-800">
                  <span className="font-semibold">Time estimate:</span> {step.timeEstimate}
                </div>
              </div>

              {step.tips.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Tips</p>
                  <ul className="mt-1.5 space-y-1">
                    {step.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-amber-800 leading-relaxed">
                        <span className="mr-1">&#9733;</span> {linkifyFormRefs(tip)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Mid-page CTA — Priority 5 */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-ui-primary/20 bg-ui-primary/5 px-6 py-8 text-center">
        <p className="text-sm font-semibold text-slate-800">Ready to get started?</p>
        <p className="max-w-md text-xs text-slate-600">
          Our guided intake collects the information you need, generates your court scripts,
          and builds a personalized roadmap.
        </p>
        <Link
          href="/new"
          className="rounded-full bg-ui-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:opacity-90"
        >
          Start My Intake
        </Link>
      </div>

      {/* What to Say to the Judge — Priority 4: moved right after steps */}
      <div id="what-to-say" className="scroll-mt-8">
        <GlassCard className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">What to Say to the Judge</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            When you see the judge for a temporary order, hit these 3 points in order:
          </p>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-ui-primary">1. Most Recent Incident (60-90 seconds)</p>
              <p className="mt-2 text-sm text-slate-700">
                Date, time, location, what happened, any threats (exact words), any injuries, any weapons.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-ui-primary">2. Why the Risk Is Ongoing</p>
              <p className="mt-2 text-sm text-slate-700">
                Continued contact, stalking, escalation, access to weapons, prior order violations.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-ui-primary">3. Exact Relief You Want Today</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li><span className="mr-1 text-slate-400">&#8226;</span> &ldquo;Stay-away from me, my home, my work, and my child&apos;s school.&rdquo;</li>
                <li><span className="mr-1 text-slate-400">&#8226;</span> &ldquo;No contact by phone/text/social media.&rdquo;</li>
                <li><span className="mr-1 text-slate-400">&#8226;</span> &ldquo;Exclude respondent from the home.&rdquo;</li>
                <li><span className="mr-1 text-slate-400">&#8226;</span> &ldquo;Firearms restriction.&rdquo;</li>
                <li><span className="mr-1 text-slate-400">&#8226;</span> &ldquo;Temporary child support.&rdquo;</li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Example Opening Statement</p>
            <p className="mt-2 text-sm text-slate-700 italic leading-relaxed">
              &ldquo;Judge, I&apos;m requesting a temporary order of protection because I&apos;m afraid of immediate harm
              based on what I alleged in my petition. The most recent incident was on [date] when [what happened].
              I&apos;m concerned the behavior will continue because [reason]. I&apos;m requesting [specific relief].&rdquo;
            </p>
          </div>
        </GlassCard>
      </div>

      {/* How to Structure Your Argument at Trial */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">How to Structure Your Case at Trial</h2>
        <p className="text-sm text-slate-700">
          At the <TermDef term="Fact-finding hearing" />, the standard is &ldquo;fair preponderance of the evidence&rdquo; (more likely than not).
          Structure your presentation like this:
        </p>
        <ol className="space-y-3">
          {[
            { title: "Jurisdiction Hook", detail: "\"We meet the relationship requirement and the petition alleges family offenses.\"" },
            { title: "Timeline", detail: "First incident \u2192 worst incident \u2192 most recent incident. Chronological, date-specific." },
            { title: "Elements Through Facts", detail: "Threats, unwanted contact, physical acts, stalking pattern \u2014 each tied to dates and places." },
            { title: "Credibility Anchors", detail: "Contemporaneous texts, photos, medical records, police involvement \u2014 evidence that corroborates your account." },
            { title: "Relief Requested", detail: "Why specific terms are needed for your safety going forward." },
          ].map((item, i) => (
            <li key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ui-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600 italic">{item.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </GlassCard>

      {/* Other Possible Outcomes */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Other Possible Case Outcomes</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          Not every case ends with a <TermDef term="Consent order" /> or a trial-issued final order. Under{" "}
          <a
            href="https://www.nysenate.gov/legislation/laws/FCT/841"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ui-primary underline decoration-ui-primary/30 hover:decoration-ui-primary"
          >
            FCA &sect;841<span className="text-[10px]">&#8599;</span>
          </a>
          , Family Court can enter several types of &ldquo;orders of disposition&rdquo;:
        </p>
        <div className="space-y-3">
          {CASE_DISPOSITIONS.map((d) => (
            <div key={d.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{d.label}</p>
              <p className="mt-1 text-xs text-slate-600">{d.description}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Service Requirements — Priority 3: warning box already exists, add id for jump */}
      <div id="service" className="scroll-mt-8">
        <GlassCard className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Service Requirements</h2>
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-bold">Service of Process Warning</p>
            <p className="mt-1">
              The order is <strong>NOT enforceable</strong> until it has been served on the respondent.
              You <strong>CANNOT</strong> serve it yourself. Plan service <strong>immediately</strong> after filing.
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <p>Service must be <strong>personal</strong> (handed directly to the respondent). The server can be:</p>
            <ul className="space-y-1.5 text-xs">
              <li><span className="mr-1 text-slate-400">&#8226;</span> Sheriff or police</li>
              <li><span className="mr-1 text-slate-400">&#8226;</span> A friend or relative over age 18 (you&apos;ll need an affidavit of service)</li>
              <li><span className="mr-1 text-slate-400">&#8226;</span> A professional process server</li>
            </ul>
            <p className="text-xs">
              <strong>Proof of service:</strong> If a friend/relative serves, you need an affidavit of service at the next court date.
              If police serve, they provide a Statement of Personal Service. If the sheriff serves, the court typically receives proof directly.
            </p>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Proof of Service Resources</p>
              <p className="mt-2 text-xs text-blue-800">
                You can find service-related affidavits and forms at your local court&apos;s filing office or online:
              </p>
              <div className="mt-2 space-y-1">
                <a
                  href="https://ww2.nycourts.gov/COURTS/nyc/family/homeforms.shtml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-ui-primary underline hover:no-underline"
                >
                  NYC Family Court Forms &amp; Resources (includes service documents) &#8599;
                </a>
                <a
                  href="https://nycourts.gov/Courthelp/Safety/familyfiling.shtml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-ui-primary underline hover:no-underline"
                >
                  NYS CourtHelp — Filing Walkthrough (explains TOP must be served before it&apos;s in effect) &#8599;
                </a>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Optional: Order of Protection Notification System</p>
              <p className="mt-2 text-xs text-slate-700">
                New York offers an Order of Protection Notification System so you can receive updates about service and enforcement status:
              </p>
              <div className="mt-2 space-y-1">
                <a
                  href="https://oopalert.ny.gov/oopalert/xhtml/subscriptionRenewal.xhtml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-ui-primary underline hover:no-underline"
                >
                  NY-Alert OOP Notification Portal &#8599;
                </a>
                <a
                  href="https://sheriff-assist.org/order-of-protection-notification/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-ui-primary underline hover:no-underline"
                >
                  Sheriffs&apos; Institute — How Order of Protection Notification Works &#8599;
                </a>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* How Long Orders Last */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">How Long Orders Last</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Standard</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{ORDER_DURATION_INFO.standard}</p>
          </div>
          <div className="rounded-xl border border-ui-primary/20 bg-ui-primary/5 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-ui-primary">With Aggravating Circumstances</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{ORDER_DURATION_INFO.aggravated}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Aggravating Circumstances Include</p>
          <ul className="mt-2 space-y-1">
            {ORDER_DURATION_INFO.aggravatingExamples.map((ex, i) => (
              <li key={i} className="text-xs text-slate-700">
                <span className="mr-1 text-slate-400">&#8226;</span> {ex}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-600">
          Extensions can be granted by motion (<InlineForm formNumber="GF-10" label="form GF-10" />) for good cause.
        </p>
      </GlassCard>

      {/* Violations */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">If the Order Is Violated</h2>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          It is a <strong>crime</strong> to violate a temporary or final order of protection.
        </div>
        <div className="space-y-3 text-sm text-slate-700">
          <p>If the respondent violates the order:</p>
          <ol className="space-y-2 text-xs">
            <li><strong>1. Call 911 immediately</strong> if you are in danger.</li>
            <li><strong>2. Document the violation</strong> (screenshots, photos, witness names, dates/times).</li>
            <li>
              <strong>3. File a Violation Petition</strong> (form GF-8) in Family Court.
              <a
                href="https://www.nycourts.gov/LegacyPDFS/FORMS/familycourt/pdfs/GF-8.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-ui-primary underline hover:no-underline"
              >
                Download GF-8 &#8599;
              </a>
            </li>
            <li><strong>4. Report to police</strong> — they can arrest for a violation of an Order of Protection.</li>
          </ol>
        </div>
      </GlassCard>

      {/* Can't Afford a Lawyer */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">If You Can&apos;t Afford a Lawyer</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          Both petitioners and respondents in Family Offense cases may get <strong>court-appointed
          (&ldquo;18-B&rdquo;) attorneys</strong> if they are indigent (cannot afford a lawyer). However,{" "}
          <strong>you must ask the judge</strong> — it is not automatic. Tell the judge at your first
          appearance that you cannot afford an attorney and request one.
        </p>
      </GlassCard>

      {/* Time Estimates */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Realistic Time Estimates</h2>
        <p className="text-xs text-slate-500">Times vary by county but this is the typical shape.</p>
        <div className="space-y-3">
          {[
            { stage: "Filing + Temporary Order", time: "Same day (but you may wait hours in court)" },
            { stage: "Return Date", time: "Days to a few weeks after filing" },
            { stage: "If Consent Order", time: "Final order can happen on the return date" },
            { stage: "If Trial", time: "Often multiple dates; weeks to months" },
            { stage: "Final Order Duration", time: "Typically 2 years; up to 5 years possible" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="min-w-[180px] text-sm font-semibold text-slate-900">{item.stage}</p>
              <p className="text-xs text-slate-600">{item.time}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* All Forms & Documents — Priority 4: split into Required vs Additional */}
      <div id="forms" className="scroll-mt-8 space-y-6">
        <GlassCardStrong className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">All Court Forms & Documents</h2>
          <p className="text-sm text-slate-600">
            Click any form to open it. Required forms are marked. All links go to official NY Courts sources.
          </p>
        </GlassCardStrong>

        {/* Required to Start */}
        {requiredForms.length > 0 && (
          <GlassCard className="space-y-4 border-2 border-ui-primary/20">
            <h3 className="text-sm font-bold text-ui-primary">Required to Start Your Case</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {requiredForms.map((form) => (
                <FormLink key={form.id} form={form} />
              ))}
            </div>
          </GlassCard>
        )}

        {/* Additional / As Needed */}
        {additionalForms.length > 0 && (
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Additional / As Needed</h3>
            <p className="text-xs text-slate-500">These forms may be needed depending on your situation.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {additionalForms.map((form) => (
                <FormLink key={form.id} form={form} />
              ))}
            </div>
          </GlassCard>
        )}

        {/* Grouped by category (collapsed under a divider for reference) */}
        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-700">
            View forms grouped by category
          </summary>
          <div className="mt-4 space-y-6">
            {groupedForms.map((group) => (
              <GlassCard key={group.category} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">{group.label}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.forms.map((form) => (
                    <FormLink key={form.id} form={form} />
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </details>
      </div>

      {/* What to Include Checklist */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">What to Include (Checklist)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Must-Haves</p>
            <ul className="mt-2 space-y-1.5">
              <li className="text-xs text-slate-700">
                <span className="mr-1 text-green-600">&#10003;</span> The relationship basis (why Family Court has jurisdiction)
              </li>
              <li className="text-xs text-slate-700">
                <span className="mr-1 text-green-600">&#10003;</span> At least one qualifying family offense, with facts
              </li>
              <li className="text-xs text-slate-700">
                <span className="mr-1 text-green-600">&#10003;</span> Completed <InlineForm formNumber="UCS-FC 8-2" label="Family Offense Petition (8-2)" /> with dates and locations of incidents
              </li>
              <li className="text-xs text-slate-700">
                <span className="mr-1 text-green-600">&#10003;</span> Details of injuries and weapons (if any)
              </li>
              <li className="text-xs text-slate-700">
                <span className="mr-1 text-green-600">&#10003;</span> Specific terms of relief requested (stay-away, no-contact, etc.)
              </li>
              <li className="text-xs text-slate-700">
                <span className="mr-1 text-green-600">&#10003;</span> <InlineForm formNumber="GF-21" label="Address Confidentiality (GF-21)" /> if your address needs to be hidden
              </li>
              <li className="text-xs text-slate-700">
                <span className="mr-1 text-green-600">&#10003;</span> Service plan + proof of service for the return date
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Common &ldquo;Judge Persuasion&rdquo; Points</p>
            <ul className="mt-2 space-y-1.5">
              {[
                "Recent escalation / most recent incident",
                "Ongoing risk (continued contact, stalking, threats)",
                "Weapons access",
                "Prior order violations",
                "Impact on children",
              ].map((item, i) => (
                <li key={i} className="text-xs text-amber-800">
                  <span className="mr-1">&#9733;</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Incident Narrative Structure */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">How to Write Your Incident Narrative</h2>
        <p className="text-sm text-slate-700">
          Use this structure for each incident you include in your{" "}
          <InlineForm formNumber="UCS-FC 8-2" label="petition (8-2)" />:
        </p>
        <ol className="space-y-2">
          {[
            { num: 1, title: "Date / Time / Place", detail: "Be as specific as possible" },
            { num: 2, title: "Who Was Present", detail: "You, children, witnesses" },
            { num: 3, title: "What the Respondent Did/Said", detail: "Actions + exact quotes of threats" },
            { num: 4, title: "Your Reaction", detail: "Why you feared harm" },
            { num: 5, title: "Injury / Property Damage", detail: "Photos, medical records if any" },
            { num: 6, title: "Why It Matters Now", detail: "Recent escalation, continued contact, threats, stalking" },
            { num: 7, title: "What You Want the Court to Order", detail: "Specific terms" },
          ].map((item) => (
            <li key={item.num} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ui-primary text-xs font-bold text-white">
                {item.num}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-600">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </GlassCard>

      {/* Key Terms Reference — Priority 2 */}
      <GlassCard className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Key Legal Terms</h2>
        <p className="text-xs text-slate-500">
          Tap any underlined term throughout this guide to see its definition. Here they all are in one place:
        </p>
        <div className="space-y-3">
          {Object.entries(LEGAL_TERMS).map(([term, definition]) => (
            <div key={term} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{term}</p>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{definition}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Safety banner */}
      <div id="safety" className="scroll-mt-8">
        <GlassCard className="border-2 border-ui-danger/30 bg-red-50 space-y-3">
          <h2 className="text-sm font-bold text-ui-danger">Safety Resources</h2>
          <div className="space-y-2 text-xs text-slate-700">
            <p>If you are in immediate danger, <strong>call 911</strong>.</p>
            <p>National DV Hotline: <strong>1-800-799-7233</strong> (24/7, confidential)</p>
            <p>NY State DV & Sexual Violence Hotline: <strong>800-942-6906</strong></p>
            <p>NYC Safe Horizon: <strong>800-621-4673</strong></p>
          </div>
        </GlassCard>
      </div>

      {/* Bottom nav */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/new"
          className="rounded-full bg-ui-primary px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90"
        >
          Start Your Intake
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}
