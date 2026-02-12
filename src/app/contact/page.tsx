import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact & Support",
  description:
    "Get in touch with the Pro-Se Prime team for product support, feedback, or questions about NY Family Court Orders of Protection.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <GlassCardStrong className="border border-black/10 bg-white/80 text-slate-900">
        <h1 className="text-2xl font-semibold">Contact</h1>
        <p className="mt-2 text-sm text-slate-600">
          Product support only. We can&apos;t provide legal advice or interpret your situation.
        </p>
      </GlassCardStrong>

      <GlassCard className="border border-black/10 bg-white/70 text-slate-900">
        <ContactForm />
      </GlassCard>

      <GlassCard className="border border-black/10 bg-white/70 text-slate-900">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Important
          </p>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            This inbox is for technical/product questions only. If you are in immediate danger, call 911 (or your
            local emergency number).
          </p>
        </div>
      </GlassCard>

      <GlassCard className="border border-black/10 bg-white/70 text-slate-900">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Helpful links</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/guide"
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
          >
            Court Guide
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
          >
            About
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}