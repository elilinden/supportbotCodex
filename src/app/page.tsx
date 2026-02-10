import Link from "next/link";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { HomeActions } from "@/components/HomeActions";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <GlassCardStrong className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            NY Family Court / Orders of Protection
          </p>

          <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            A focused workspace for New York Family Court Orders of Protection.
          </h1>

          <p className="text-sm text-slate-600">
            Capture incident details, organize evidence, and generate information-only prep materials
            for Orders of Protection in New York Family Court. This is not legal advice.
          </p>

          <HomeActions />
        </GlassCardStrong>

        <GlassCard className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">What this site covers</h2>

          <ul className="space-y-2 text-xs text-slate-600">
            <li>• NY Family Court Order of Protection intake and preparation only.</li>
            <li>• Structured facts timeline, evidence inventory, and safety notes.</li>
            <li>• Info-only scripts and checklists you can print or export.</li>
          </ul>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
            If you are in immediate danger, call 911 or your local emergency number.
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Guided Intake",
            text: "Step-by-step collection of relationship, incident, and safety details for NY Family Court OPs.",
            href: "/new"
          },
          {
            title: "Case Dashboard",
            text: "Centralize facts, evidence, and outputs for a single Order of Protection workflow.",
            href: "/settings"
          },
          {
            title: "Coach Mode",
            text: "Ask questions and refine facts while staying within NY Family Court scope.",
            href: "/about"
          }
        ].map((item) => (
          <Link key={item.title} href={item.href}>
            <GlassCard className="space-y-2 transition-all hover:border-ui-primary/30 hover:shadow-lg">
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-600">{item.text}</p>
            </GlassCard>
          </Link>
        ))}
      </section>
    </div>
  );
}