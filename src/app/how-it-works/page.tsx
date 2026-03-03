import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "How It Works — Free NY Family Court Self-Help Tool",
  description:
    "Learn how Pro-Se Prime uses guided intake and AI-powered interview to help you prepare court-ready materials for New York Family Court Orders of Protection.",
};

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-float-in pb-24">
      {/* Hero */}
      <section className="text-center space-y-4 pt-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">
          How It Works
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-ui-text tracking-tight">
          From your story to court-ready prep
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Pro-Se Prime guides you through a simple process: you share what
          happened, an AI coach asks follow-up questions, and together you build
          organized materials for court.
        </p>
      </section>

      {/* Overview flow */}
      <GlassCardStrong className="p-8 md:p-10 border-l-4 border-l-ui-primary text-slate-900">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-ui-text uppercase tracking-widest">
            The big picture
          </h2>
          <p className="text-slate-700 leading-7">
            Courts need specific, factual, chronological details. Most people
            arrive with scattered memories, partial proof, and no idea what the
            judge will ask. Pro-Se Prime helps you organize everything{" "}
            <em>before</em> you walk in.
          </p>
          <p className="text-slate-700 leading-7">
            The process has three parts: a quick intake form, a guided
            conversation with an AI coach, and auto-generated court materials.
            The whole thing is designed to feel like talking to a calm,
            structured helper — not filling out legal paperwork.
          </p>
        </div>
      </GlassCardStrong>

      {/* Step-by-step */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-grow bg-slate-200" />
          <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            Step by step
          </h2>
          <div className="h-[1px] flex-grow bg-slate-200" />
        </div>

        {/* Step 1 — Intake */}
        <GlassCard className="p-6 md:p-8 space-y-4 relative overflow-hidden group hover:border-ui-primary/30 transition-all text-slate-900">
          <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-bold text-ui-primary group-hover:opacity-20 transition-opacity">
            1
          </div>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-full bg-ui-primary/10 flex items-center justify-center text-ui-primary font-bold text-lg">
              1
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-ui-text">
                You fill out a short intake form
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Answer plain-language questions about your situation. No legal
                jargon. The form has three sections:
              </p>
              <ul className="text-sm text-slate-600 leading-relaxed space-y-1">
                <li>
                  <strong className="text-slate-700">Relationship &amp; household</strong> — who is
                  involved, children, living situation.
                </li>
                <li>
                  <strong className="text-slate-700">Incident snapshot</strong> — what happened most
                  recently, when, where.
                </li>
                <li>
                  <strong className="text-slate-700">Safety &amp; evidence</strong> — existing orders,
                  weapons access, photos/texts/witnesses you already have.
                </li>
              </ul>
              <p className="text-xs text-slate-500 leading-relaxed">
                You only need to fill in what you know right now. The AI coach
                will help fill in the rest.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Step 2 — AI Interview */}
        <GlassCard className="p-6 md:p-8 space-y-4 relative overflow-hidden group hover:border-ui-success/30 transition-all text-slate-900">
          <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-bold text-ui-success group-hover:opacity-20 transition-opacity">
            2
          </div>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-full bg-ui-success/10 flex items-center justify-center text-ui-success font-bold text-lg">
              2
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-ui-text">
                An AI coach asks you follow-up questions
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                After your intake, the AI reviews what you provided and
                identifies gaps — the details courts commonly ask about. Then it
                starts a guided conversation with you, one question at a time.
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Example exchange
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="shrink-0 text-ui-success font-bold">Coach:</span>
                    <span className="text-slate-700">
                      &ldquo;You mentioned an incident on January 15th. Can you
                      describe what happened — what was said or done, and were
                      there any injuries?&rdquo;
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 text-ui-primary font-bold">You:</span>
                    <span className="text-slate-700">
                      &ldquo;He grabbed my arm hard enough to leave a bruise and
                      said he would take the kids if I tried to leave.&rdquo;
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 text-ui-success font-bold">Coach:</span>
                    <span className="text-slate-700">
                      &ldquo;Thank you. Did anyone else witness this — a
                      neighbor, family member, or the children?&rdquo;
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The AI asks up to 5 rounds of questions, focusing on what is
                most important for your case — dates, locations, injuries,
                threats, witnesses, and evidence.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Step 3 — Details organized */}
        <GlassCard className="p-6 md:p-8 space-y-4 relative overflow-hidden group hover:border-amber-500/30 transition-all text-slate-900">
          <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-bold text-amber-500 group-hover:opacity-20 transition-opacity">
            3
          </div>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700 font-bold text-lg">
              3
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-ui-text">
                Your answers are organized automatically
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                As you answer each question, the AI extracts key facts and
                organizes them into structured categories — incidents with
                dates and details, safety concerns, evidence inventory, and
                requested protections. You can see what is still missing and
                what has been captured in real time.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-bold text-ui-primary">3/5</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-1">
                    Exchanges used
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">4</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-1">
                    Fields still needed
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-bold text-ui-success">72%</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-1">
                    Progress
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Step 4 — Court materials */}
        <GlassCard className="p-6 md:p-8 space-y-4 relative overflow-hidden group hover:border-ui-danger/30 transition-all text-slate-900">
          <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-bold text-ui-danger group-hover:opacity-20 transition-opacity">
            4
          </div>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-full bg-ui-danger/10 flex items-center justify-center text-ui-danger font-bold text-lg">
              4
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-ui-text">
                You get court-ready prep materials
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Once the interview is complete, Pro-Se Prime generates
                organized materials you can review, print, or bring to court:
              </p>
              <ul className="text-sm text-slate-600 leading-relaxed space-y-1">
                <li>
                  <strong className="text-slate-700">2-minute script</strong> — a clear, factual
                  statement for the judge.
                </li>
                <li>
                  <strong className="text-slate-700">Presentation outline</strong> — a longer breakdown
                  of your case with supporting details.
                </li>
                <li>
                  <strong className="text-slate-700">Evidence checklist</strong> — what to bring and how
                  it connects to your incidents.
                </li>
                <li>
                  <strong className="text-slate-700">Timeline summary</strong> — chronological events
                  that show the pattern.
                </li>
              </ul>
              <p className="text-xs text-slate-500 leading-relaxed">
                You can also add new information later and your materials will
                update.
              </p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* What the AI does and doesn't do */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-grow bg-slate-200" />
          <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            About the AI
          </h2>
          <div className="h-[1px] flex-grow bg-slate-200" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="p-8 space-y-4 text-slate-900">
            <h3 className="text-lg font-bold text-ui-text flex items-center gap-2">
              <span className="text-ui-primary">&#10003;</span> What the AI coach does
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
              <li>
                &#8226; Asks one focused question at a time about your
                situation.
              </li>
              <li>
                &#8226; Identifies missing details the court will likely ask
                about.
              </li>
              <li>
                &#8226; Extracts facts from your answers and organizes them.
              </li>
              <li>
                &#8226; Generates court-ready wording from your own words.
              </li>
              <li>
                &#8226; Flags safety concerns and provides hotline resources.
              </li>
            </ul>
          </GlassCard>

          <GlassCard className="p-8 space-y-4 border border-ui-danger/20 bg-ui-danger/5 text-slate-900">
            <h3 className="text-lg font-bold text-ui-danger flex items-center gap-2">
              <span className="text-ui-danger">&#9888;</span> What the AI coach does not do
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
              <li>&#8226; Does not invent or assume facts you did not share.</li>
              <li>&#8226; Does not give legal advice or predict outcomes.</li>
              <li>
                &#8226; Does not file paperwork or contact the court for you.
              </li>
              <li>
                &#8226; Does not replace a lawyer or create an attorney-client
                relationship.
              </li>
              <li>&#8226; Does not store your data on external servers.</li>
            </ul>
          </GlassCard>
        </div>
      </section>

      {/* Privacy & Safety */}
      <GlassCard className="p-8 space-y-4 text-slate-900">
        <h3 className="text-lg font-bold text-ui-text flex items-center gap-2">
          <span className="text-ui-primary">&#128737;</span> Your privacy
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Your case data is encrypted and stored on your device. If you create
          an account, encrypted backups can sync to the cloud — but the tool
          works fully offline in your browser. You can delete your data at any
          time from Settings.
        </p>
      </GlassCard>

      {/* CTA */}
      <div className="flex flex-wrap justify-center gap-4 pt-6">
        <Link
          href="/new"
          className="rounded-full bg-ui-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:opacity-95"
        >
          Start Your Case
        </Link>
        <Link
          href="/guide"
          className="rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
        >
          Court Guide
        </Link>
      </div>
    </div>
  );
}
