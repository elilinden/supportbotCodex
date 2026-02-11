import type { Metadata } from "next";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Pro-Se Prime team for product support, feedback, or questions about NY Family Court Orders of Protection.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <GlassCardStrong className="border border-black/10 bg-white/80 text-slate-900">
        <h1 className="text-2xl font-semibold">Contact</h1>
        <p className="mt-2 text-sm text-slate-600">
          Product support only. We can’t provide legal advice or interpret your situation.
        </p>
      </GlassCardStrong>

      <GlassCard className="border border-black/10 bg-white/70 text-slate-900">
        <div className="space-y-4 text-sm text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Email</p>
            <p className="mt-2">
              <span className="font-medium text-slate-900">Support:</span>{" "}
              <a className="underline underline-offset-4" href="mailto:support@proseprime.com">
                support@proseprime.com
              </a>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Include your case ID (if available), device/browser, and what you expected vs. what happened.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Important
            </p>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              This inbox is for technical/product questions only. If you are in immediate danger, call 911 (or your
              local emergency number).
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}