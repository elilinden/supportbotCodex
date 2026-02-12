import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "About — Free NY Family Court Self-Help Tool",
  description:
    "Pro-Se Prime is a free, information-only tool that helps self-represented individuals prepare for New York Family Court Orders of Protection.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-float-in pb-24">
      {/* Hero */}
      <section className="text-center space-y-4 pt-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">
          About Pro-Se Prime
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-ui-text tracking-tight">
          A calmer way to prepare for NY Family Court
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Pro-Se Prime is a private, informational workspace that helps you organize facts, track evidence,
          and practice clear, court-ready wording for New York Family Court Orders of Protection.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/new"
            className="rounded-full bg-ui-primary px-7 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:opacity-95"
          >
            Start Your Case
          </Link>
          <Link
            href="/guide"
            className="rounded-full border border-slate-200 bg-white px-7 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
          >
            Court Guide
          </Link>
          <Link
            href="/terms"
            className="rounded-full border border-slate-200 bg-white px-7 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="rounded-full border border-slate-200 bg-white px-7 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
          >
            Privacy
          </Link>
        </div>
      </section>

      {/* Mission */}
      <GlassCardStrong className="p-8 md:p-10 border-l-4 border-l-ui-primary text-slate-900">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-ui-text uppercase tracking-widest">The mission</h2>
          <p className="text-slate-700 leading-7">
            Going to Family Court without a lawyer can feel overwhelming. The court needs specific, chronological,
            factual details. Most people show up with lived experience, fear, and scattered proof.
          </p>
          <p className="text-slate-700 leading-7">
            Pro-Se Prime helps you convert your story into a clear record: what happened, when, where, who saw it,
            what proof exists, and what protection you are asking for. It does not replace a lawyer. It helps you
            prepare to speak plainly and stay organized.
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Important</p>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              Pro-Se Prime provides general, informational content. It is not legal advice and does not create an
              attorney-client relationship. If you are in immediate danger, call 911.
            </p>
          </div>
        </div>
      </GlassCardStrong>

      {/* How it works */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-grow bg-slate-200" />
          <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest">How it works</h2>
          <div className="h-[1px] flex-grow bg-slate-200" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <GlassCard className="p-6 space-y-3 relative overflow-hidden group hover:border-ui-primary/30 transition-all text-slate-900">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-bold text-ui-primary group-hover:opacity-20 transition-opacity">
              1
            </div>
            <div className="h-10 w-10 rounded-full bg-ui-primary/10 flex items-center justify-center text-ui-primary font-bold">
              <span className="text-lg">✎</span>
            </div>
            <h3 className="font-bold text-ui-text">Guided intake</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Answer plain-language questions about relationship eligibility, incidents, safety, and proof. No jargon.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-3 relative overflow-hidden group hover:border-ui-success/30 transition-all text-slate-900">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-bold text-ui-success group-hover:opacity-20 transition-opacity">
              2
            </div>
            <div className="h-10 w-10 rounded-full bg-ui-success/10 flex items-center justify-center text-ui-success font-bold">
              <span className="text-[11px] font-extrabold tracking-widest">AI</span>
            </div>
            <h3 className="font-bold text-ui-text">Missing-details check</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The tool flags gaps that courts commonly ask about: dates, locations, injuries, threats, witnesses, and weapons.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-3 relative overflow-hidden group hover:border-ui-danger/30 transition-all text-slate-900">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-bold text-ui-danger group-hover:opacity-20 transition-opacity">
              3
            </div>
            <div className="h-10 w-10 rounded-full bg-ui-danger/10 flex items-center justify-center text-ui-danger font-bold">
              <span className="text-lg">✓</span>
            </div>
            <h3 className="font-bold text-ui-text">Evidence organization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Build a checklist of texts, photos, reports, witness names, and logs so you know what to bring.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-3 relative overflow-hidden group hover:border-amber-500/30 transition-all text-slate-900">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-bold text-amber-500 group-hover:opacity-20 transition-opacity">
              4
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700 font-bold">
              <span className="text-lg">🎙</span>
            </div>
            <h3 className="font-bold text-ui-text">Court roadmap</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get a clear script and outline for court, focused on the facts that matter for an Order of Protection.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* What we are / aren’t */}
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="p-8 space-y-4 text-slate-900">
          <h3 className="text-lg font-bold text-ui-text flex items-center gap-2">
            <span className="text-ui-primary">✅</span> What this tool does
          </h3>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
            <li>• Helps you gather facts in a clean timeline.</li>
            <li>• Helps you list evidence and match it to incidents.</li>
            <li>• Helps you practice short, court-ready wording.</li>
            <li>• Helps you keep track of what is missing.</li>
          </ul>
        </GlassCard>

        <GlassCard className="p-8 space-y-4 border border-ui-danger/20 bg-ui-danger/5 text-slate-900">
          <h3 className="text-lg font-bold text-ui-danger flex items-center gap-2">
            <span className="text-ui-danger">⚠️</span> What this tool is not
          </h3>
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
            <li>• Not a lawyer, not a substitute for legal representation.</li>
            <li>• Does not file paperwork for you or contact the court.</li>
            <li>• Does not guarantee outcomes or eligibility decisions.</li>
            <li>• Not for emergencies. If you are in danger, call 911.</li>
          </ul>
        </GlassCard>
      </div>

      {/* Privacy & Safety */}
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="p-8 space-y-4 text-slate-900">
          <h3 className="text-lg font-bold text-ui-text flex items-center gap-2">
            <span className="text-ui-primary">🛡</span> Privacy-first design
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your information is sensitive. Pro-Se Prime is designed to minimize what it keeps and to make it easy to
            print and leave. Review the Privacy Policy for details and best practices.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/privacy"
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
            >
              Read Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
            >
              Contact Support
            </Link>
          </div>
        </GlassCard>

        <GlassCard className="p-8 space-y-4 border border-ui-danger/20 bg-ui-danger/5 text-slate-900">
          <h3 className="text-lg font-bold text-ui-danger flex items-center gap-2">
            <span className="text-ui-danger">🕵️</span> Safety tips
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            If you share a device with the person causing harm, consider private browsing and clearing history.
            If you believe your communications are monitored, use a safer device or location when possible.
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Hotlines (NY)</p>
            <p className="mt-2 text-xs text-slate-700">NY State Domestic & Sexual Violence: 800-942-6906</p>
            <p className="text-xs text-slate-700">Text: 844-997-2121</p>
            <p className="text-xs text-slate-700">NYC Safe Horizon: 800-621-4673</p>
          </div>
        </GlassCard>
      </div>

      {/* Disclaimer footer */}
      <div className="rounded-xl bg-slate-100 p-6 text-center space-y-2 border border-slate-200">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Legal disclaimer</p>
        <p className="text-xs text-slate-600 max-w-3xl mx-auto leading-relaxed">
          This application is for informational purposes only and is not legal advice. Use of this tool does not
          create an attorney-client relationship. Court procedures and eligibility can vary by county and facts.
          Always confirm critical information with official court resources or a qualified attorney.
        </p>
      </div>

      <div className="flex justify-center pt-6">
        <Link
          href="/new"
          className="rounded-full bg-ui-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:opacity-95"
        >
          Start Your Case
        </Link>
      </div>
    </div>
  );
}