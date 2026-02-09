"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultIntake, useCaseStore } from "@/store/useCaseStore";
import type { IntakeData } from "@/lib/types";

const steps = [
  "Safety Status",
  "Relationship",
  "Household & Children",
  "Most Recent Incident",
  "Pattern & History",
  "Evidence & Relief"
];

const relationshipOptions = [
  "Spouse",
  "Former spouse",
  "Parent of child in common",
  "Family member (blood/marriage/adoption)",
  "Intimate partner (dating)",
  "Household member"
];

const cohabitationOptions = ["Lives together now", "Previously lived together", "Never lived together"];
const childrenOptions = ["Children involved", "Children witnessed", "Children not involved", "Unsure"];
const firearmsOptions = ["Yes", "No", "Unknown"];
const safetyOptions = ["Safe now", "Unsafe", "Immediate danger", "Unsure"];

export default function NewIntakePage() {
  const router = useRouter();
  const createCase = useCaseStore((state) => state.createCase);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<IntakeData>({ ...defaultIntake });

  const stepLabel = useMemo(() => steps[step] || "", [step]);

  const updateField = <K extends keyof IntakeData>(key: K, value: IntakeData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = () => {
    const id = createCase(form);
    router.push(`/case/${id}/interview`);
  };

  const labelCls = "block text-xs font-medium text-slate-900";
  const helpCls = "text-[11px] text-slate-500";
  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 " +
    "placeholder:text-slate-400 shadow-sm outline-none " +
    "focus:border-blue-600 focus:ring-4 focus:ring-blue-100";
  const textareaCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 " +
    "placeholder:text-slate-400 shadow-sm outline-none " +
    "focus:border-blue-600 focus:ring-4 focus:ring-blue-100";
  const selectCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 " +
    "shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  return (
    <div className="mx-auto max-w-5xl space-y-8 text-slate-900">
      {/* Header card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            New Order of Protection Intake
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">NY Family Court OP Intake</h1>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          Capture the core details for a New York Family Court Order of Protection. This is information-only and not
          legal advice.
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-600">
            Tip: Keep answers short and specific (dates, locations, exact words used). You can refine details later.
          </p>
        </div>
      </div>

      {/* Step pills */}
      <div className="flex flex-wrap gap-2 text-xs" role="tablist" aria-label="Intake steps">
        {steps.map((item, index) => {
          const active = index === step;
          const completed = index < step;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStep(index)}
              className={[
                "rounded-full border px-3 py-1 transition",
                active
                  ? "border-blue-600 bg-blue-600 text-white font-semibold"
                  : completed
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              ].join(" ")}
            >
              {index + 1}. {item}
            </button>
          );
        })}
      </div>

      {/* Step content card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">{stepLabel}</h2>
            <p className={helpCls}>
              Step {step + 1} of {steps.length}
            </p>
          </div>
          <div className="text-right">
            <p className={helpCls}>You can change steps anytime</p>
          </div>
        </div>

        <div className="mt-6">
          {/* Step 0: Safety Status */}
          {step === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelCls}>Current safety status</label>
                <select
                  className={selectCls}
                  value={form.safetyStatus}
                  onChange={(event) => updateField("safetyStatus", event.target.value as IntakeData["safetyStatus"])}
                >
                  <option value="">Select</option>
                  {safetyOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <p className={helpCls}>If you are in immediate danger, call 911.</p>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Firearms access</label>
                <select
                  className={selectCls}
                  value={form.firearmsAccess}
                  onChange={(event) => updateField("firearmsAccess", event.target.value as IntakeData["firearmsAccess"])}
                >
                  <option value="">Select</option>
                  {firearmsOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <p className={helpCls}>Does the respondent have access to firearms or weapons?</p>
              </div>

              {form.safetyStatus === "Immediate danger" ? (
                <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">
                    If you are in immediate danger, call 911 now.
                  </p>
                  <p className="mt-1 text-xs text-red-600">
                    NY Domestic Violence Hotline: 800-942-6906 | NYC Safe Horizon: 800-621-4673
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Step 1: Relationship */}
          {step === 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelCls}>Petitioner name (optional)</label>
                <input
                  className={inputCls}
                  value={form.petitionerName}
                  onChange={(event) => updateField("petitionerName", event.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Respondent name (optional)</label>
                <input
                  className={inputCls}
                  value={form.respondentName}
                  onChange={(event) => updateField("respondentName", event.target.value)}
                  placeholder="Other person's name"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className={labelCls}>Relationship category</label>
                <select
                  className={selectCls}
                  value={form.relationshipCategory}
                  onChange={(event) =>
                    updateField("relationshipCategory", event.target.value as IntakeData["relationshipCategory"])
                  }
                >
                  <option value="">Select</option>
                  {relationshipOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <p className={helpCls}>
                  Family Court requires a qualifying relationship: family/household or intimate partner.
                </p>
              </div>
            </div>
          ) : null}

          {/* Step 2: Household & Children */}
          {step === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelCls}>Cohabitation / living situation</label>
                <select
                  className={selectCls}
                  value={form.cohabitation}
                  onChange={(event) => updateField("cohabitation", event.target.value as IntakeData["cohabitation"])}
                >
                  <option value="">Select</option>
                  {cohabitationOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Children involved or witnessed</label>
                <select
                  className={selectCls}
                  value={form.childrenInvolved}
                  onChange={(event) =>
                    updateField("childrenInvolved", event.target.value as IntakeData["childrenInvolved"])
                  }
                >
                  <option value="">Select</option>
                  {childrenOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className={labelCls}>Existing cases/orders</label>
                <textarea
                  className={`${textareaCls} min-h-[90px]`}
                  value={form.existingCasesOrders}
                  onChange={(event) => updateField("existingCasesOrders", event.target.value)}
                  placeholder="List any existing court orders, family court cases, or criminal matters."
                />
              </div>
            </div>
          ) : null}

          {/* Step 3: Most Recent Incident */}
          {step === 3 ? (
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Most recent incident date/time</label>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={form.mostRecentIncidentAt}
                  onChange={(event) => updateField("mostRecentIncidentAt", event.target.value)}
                />
                <p className={helpCls}>If unknown, approximate (e.g., &quot;early January&quot;).</p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-800">Court tip</p>
                <p className="mt-1 text-xs text-blue-700">
                  Courts want specific details: exact date, time, location, what was said/done, injuries, and who witnessed it.
                  The more specific you are here, the stronger your filing.
                </p>
              </div>
            </div>
          ) : null}

          {/* Step 4: Pattern & History */}
          {step === 4 ? (
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Pattern of incidents (summary)</label>
                <textarea
                  className={`${textareaCls} min-h-[160px]`}
                  value={form.patternOfIncidents}
                  onChange={(event) => updateField("patternOfIncidents", event.target.value)}
                  placeholder="Describe the pattern of incidents, threats, or escalation. Include dates, locations, and specific actions."
                />
                <p className={helpCls}>
                  Focus on frequency, escalation, and specific behaviors. Courts look for a pattern that shows
                  ongoing risk.
                </p>
              </div>
            </div>
          ) : null}

          {/* Step 5: Evidence & Relief */}
          {step === 5 ? (
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Evidence inventory</label>
                <textarea
                  className={`${textareaCls} min-h-[120px]`}
                  value={form.evidenceInventory}
                  onChange={(event) => updateField("evidenceInventory", event.target.value)}
                  placeholder="List texts, photos, reports, witness names, medical records, police reports, or other evidence."
                />
                <p className={helpCls}>
                  For each piece of evidence, note which incident it supports.
                </p>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Requested relief</label>
                <textarea
                  className={`${textareaCls} min-h-[90px]`}
                  value={form.requestedRelief}
                  onChange={(event) => updateField("requestedRelief", event.target.value)}
                  placeholder="Stay-away, refrain from harassment, temporary custody, exclusion from home, firearms surrender, etc."
                />
                <p className={helpCls}>
                  List each specific protection you want and why it addresses a safety risk.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={goBack}
            disabled={step === 0}
          >
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              className="rounded-full bg-blue-600 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-blue-700"
              onClick={goNext}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="rounded-full bg-blue-600 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Start Interview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
