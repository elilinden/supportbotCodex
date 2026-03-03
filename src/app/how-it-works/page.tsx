import Link from "next/link";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Sign In & Start an Intake",
    description:
      "Create an account (email & password) so your work is saved securely. Then start a new intake to capture the core details of your situation.",
    details: [
      "Your name, the other person's name, and your relationship",
      "What happened — the most recent incident, any pattern of behavior, and where it occurred",
      "Safety concerns, evidence you have, and what relief you want from the court",
    ],
    note: "You don't need everything right now — you can skip fields and come back. Your progress saves automatically.",
  },
  {
    step: 2,
    title: "AI-Guided Interview",
    description:
      'After you submit the intake, an AI assistant asks you follow-up questions one at a time — like a conversation. It reads what you\'ve already provided and figures out what\'s missing or needs more detail.',
    details: [
      "It asks targeted questions based on what Family Court typically requires",
      "You answer in your own words — plain language is fine",
      "It may ask about dates, locations, exact words used, witnesses, injuries, or evidence",
      "You can send follow-up messages to add or correct information at any time",
    ],
    note: "The AI does not give legal advice. It helps you organize facts the way a court expects to see them.",
  },
  {
    step: 3,
    title: "It Identifies What's Missing",
    description:
      "As the conversation continues, the AI tracks which details are still needed and asks about them. It shows you a progress indicator so you can see how complete your information is.",
    details: [
      "Missing dates, locations, or specifics about incidents",
      "Whether there are prior orders or ongoing cases",
      "Firearms access and current safety status",
      "Evidence you may have but haven't mentioned (texts, photos, medical records, witnesses)",
    ],
    note: "You can stop and come back later — everything is saved to your account.",
  },
  {
    step: 4,
    title: "It Generates Preparation Materials",
    description:
      "Once the AI has enough information, it produces a set of organized, information-only materials you can use to prepare for court.",
    details: [
      "A 2-minute spoken script summarizing your situation for the judge",
      "A longer 5-minute outline with key points in order",
      "An evidence checklist — what to bring and how to organize it",
      "A timeline of incidents in chronological order",
      "A \"what to expect\" overview of court procedures",
      "A \"what to bring\" list for your court date",
    ],
    note: "These are informational only — not legal filings. You can print or reference them when preparing.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Hero */}
      <GlassCardStrong className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          How It Works
        </p>
        <h1 className="text-2xl font-semibold leading-tight text-slate-900 md:text-3xl">
          How This Tool Helps You Prepare
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 leading-relaxed">
          Pro-Se Prime walks you through the process of organizing your information for a New York Family Court
          Order of Protection. It uses an AI assistant to ask you the right questions, identify gaps, and
          generate court-preparation materials — all in plain language.
          <strong className="text-slate-700"> This is informational only and is not legal advice.</strong>
        </p>
      </GlassCardStrong>

      {/* Overview */}
      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">The Short Version</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {["Sign in", "Fill out an intake", "Answer AI follow-ups", "Get prep materials"].map(
            (label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ui-primary text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-slate-700">{label}</span>
                {i < 3 && <span className="text-slate-300">&rarr;</span>}
              </div>
            )
          )}
        </div>
      </GlassCard>

      {/* Detailed Steps */}
      {WORKFLOW_STEPS.map((item) => (
        <GlassCard key={item.step} className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ui-primary text-sm font-bold text-white">
              {item.step}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          </div>

          <div className="ml-14 space-y-3">
            <ul className="space-y-1.5">
              {item.details.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="mt-0.5 text-ui-primary">&#8226;</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-600">{item.note}</p>
            </div>
          </div>
        </GlassCard>
      ))}

      {/* What You End Up With */}
      <GlassCard className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">What You End Up With</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "2-Minute Script", desc: "A spoken summary of your situation for the judge" },
            { label: "5-Minute Outline", desc: "Key points organized in the order courts expect" },
            { label: "Evidence Checklist", desc: "What to gather and bring with you" },
            { label: "Incident Timeline", desc: "Your incidents in chronological order with details" },
            { label: "What to Expect", desc: "An overview of what happens at each stage of court" },
            { label: "What to Bring", desc: "A list of documents and items for your court date" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-900">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Privacy / Security */}
      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Privacy & Security</h2>
        <ul className="space-y-1.5 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-ui-success">&#10003;</span>
            <span>Your data is encrypted before it leaves your browser</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-ui-success">&#10003;</span>
            <span>Saved to your account so you can come back later from any device</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-ui-success">&#10003;</span>
            <span>No one else can access your case data — it&apos;s tied to your login</span>
          </li>
        </ul>
      </GlassCard>

      {/* Important Limitations */}
      <GlassCard className="border-ui-warning/30 bg-ui-warningSoft/30 space-y-3">
        <h2 className="text-sm font-semibold text-ui-warning">Important Limitations</h2>
        <ul className="space-y-1.5 text-xs text-slate-700">
          <li>• This tool does <strong>not</strong> file anything with the court.</li>
          <li>• It does <strong>not</strong> provide legal advice or act as your attorney.</li>
          <li>• The AI-generated materials are <strong>informational only</strong> — they help you organize, not replace legal counsel.</li>
          <li>• If you can, consult with a lawyer. Family Court can appoint one if you cannot afford it — ask the judge.</li>
        </ul>
      </GlassCard>

      {/* CTAs */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/new"
          className="rounded-full bg-ui-primary px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90"
        >
          Start Your Intake
        </Link>
        <Link
          href="/guide"
          className="rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50"
        >
          Court Guide & Forms
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}
