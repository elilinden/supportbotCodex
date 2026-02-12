import type { Metadata } from "next";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { HomeActions } from "@/components/HomeActions";

export const metadata: Metadata = {
  title: "NY Family Court Order of Protection — Free Guided Workspace",
  description:
    "Free workspace to organize facts and evidence for a New York Family Court Order of Protection. Build court-ready materials — no attorney required.",
};

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <GlassCardStrong className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Information-Only Tool
          </p>

          <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            A focused workspace for New York Family Court Orders of Protection.
          </h1>

          <p className="text-sm text-slate-600">
            Designed for individuals representing themselves in Family Court.
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

          <div className="rounded-2xl border border-ui-danger/30 bg-ui-dangerSoft p-4 text-xs font-medium text-ui-danger">
            If you are in immediate danger, call 911 or your local emergency number.
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
