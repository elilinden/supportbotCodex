"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { RequireAuth } from "@/components/RequireAuth";
import { defaultIntake, useCaseStore } from "@/store/useCaseStore";
import { useAuthStore } from "@/store/useAuthStore";
import { cloudSave } from "@/lib/cloudSync";
import type { IntakeData } from "@/lib/types";

const steps = ["Relationship & Household", "Incident Snapshot", "Safety & Evidence"];

const relationshipOptions = [
  "Spouse",
  "Former spouse",
  "Parent of child in common",
  "Family member (blood/marriage/adoption)",
  "Intimate partner (dating)",
  "Household member"
];

const cohabitationOptions = ["Lives together now", "Previously lived together", "Never lived together"];

const childrenOptions = ["Children involved", "Children witnessed incidents", "Children not involved", "Unsure"];

const firearmsOptions = ["Yes", "No", "Unknown"];
const safetyOptions = ["Safe now", "Unsafe", "Immediate danger", "Unsure"];

// --- helpers ---

/** Check whether a step has any data filled in. */
function stepHasData(form: IntakeData, stepIndex: number): boolean {
  if (stepIndex === 0) {
    return !!(
      form.petitionerName ||
      form.respondentName ||
      form.relationshipCategory ||
      form.cohabitation ||
      form.childrenInvolved
    );
  }
  if (stepIndex === 1) {
    return !!(form.mostRecentIncidentAt || form.patternOfIncidents || form.incidentLocation);
  }
  return !!(
    form.existingCasesOrders ||
    form.firearmsAccess ||
    form.safetyStatus ||
    form.evidenceInventory ||
    form.requestedRelief
  );
}

function RecommendedBadge() {
  return <span className="ml-1 rounded bg-ui-primarySoft px-1.5 py-0.5 text-[10px] font-semibold text-ui-primary">Recommended</span>;
}

function OptionalBadge() {
  return <span className="ml-1 rounded bg-ui-surface2 px-1.5 py-0.5 text-[10px] font-medium text-ui-textMuted">Optional</span>;
}

export default function NewIntakePage() {
  const router = useRouter();
  const createCase = useCaseStore((state) => state.createCase);
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<IntakeData>({ ...defaultIntake });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepLabel = useMemo(() => steps[step] || "", [step]);

  const updateField = useCallback(<K extends keyof IntakeData>(key: K, value: IntakeData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setValidationError(null);
  }, []);

  // Auto-save indicator: piggy-back on the global auto-save in AuthProvider,
  // but show visual feedback here too.
  useEffect(() => {
    if (saveStatus !== "idle") return;
    // nothing to signal yet
  }, [saveStatus]);

  // Whenever form changes, flash "Saving…" → "Saved"
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveStatus("saved");
      // Reset back to idle after a few seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 1500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [form]);

  const goNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = () => {
    // Soft nudge — not a hard block
    if (!form.relationshipCategory) {
      setValidationError("If you can, select a relationship category (Step 1) — this helps determine eligibility and improves the materials.");
      setStep(0);
      return;
    }
    if (!form.patternOfIncidents && !form.mostRecentIncidentAt) {
      setValidationError("If you can, add an incident date and a short description (Step 2) — this improves the preparation materials.");
      setStep(1);
      return;
    }
    const id = createCase(form);
    // Trigger a cloud save immediately after case creation
    if (user) {
      cloudSave(user.id).catch(() => {});
    }
    router.push(`/case/${id}/interview`);
  };

  // Input styles
  const labelCls = "block text-xs font-medium text-ui-text";
  const helpCls = "text-[11px] text-ui-textMuted";
  const inputCls =
    "w-full rounded-xl border border-ui-border bg-ui-surface px-4 py-2 text-sm text-ui-text " +
    "placeholder:text-ui-textMuted shadow-sm outline-none " +
    "focus:border-ui-primary focus:ring-4 focus:ring-ui-primarySoft";
  const textareaCls =
    "w-full rounded-xl border border-ui-border bg-ui-surface px-4 py-2 text-sm text-ui-text " +
    "placeholder:text-ui-textMuted shadow-sm outline-none " +
    "focus:border-ui-primary focus:ring-4 focus:ring-ui-primarySoft";
  const selectCls =
    "w-full rounded-xl border border-ui-border bg-ui-surface px-4 py-2 text-sm text-ui-text " +
    "shadow-sm outline-none focus:border-ui-primary focus:ring-4 focus:ring-ui-primarySoft";

  return (
    <RequireAuth>
    <div className="mx-auto max-w-5xl space-y-8 text-ui-text">
      {/* ---- Header ---- */}
      <GlassCardStrong className="space-y-4 text-ui-text">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            New Order of Protection Intake
          </p>
          <h1 className="text-2xl font-semibold text-ui-text">NY Family Court Order of Protection Intake</h1>
        </div>

        <p className="text-sm text-slate-600">
          Capture the core details for a New York Family Court Order of Protection. This is information-only and not
          legal advice.
        </p>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-700">
            Tip: Keep answers short and specific (dates, locations, exact words used). You can refine details later.
          </p>
          {saveStatus === "saving" && (
            <span className="shrink-0 ml-3 text-[11px] text-ui-textMuted">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="shrink-0 ml-3 text-[11px] text-ui-success">Saved</span>
          )}
        </div>

        <p className="text-[11px] text-ui-textMuted">Your progress saves automatically.</p>
      </GlassCardStrong>

      {/* ---- Step Pills with completion indicators ---- */}
      <div className="flex flex-wrap gap-2 text-xs">
        {steps.map((item, index) => {
          const active = index === step;
          const completed = stepHasData(form, index);
          return (
            <button
              key={item}
              type="button"
              onClick={() => setStep(index)}
              className={[
                "flex items-center gap-1.5 rounded-full border px-3 py-1 transition",
                active
                  ? "border-ui-primary/30 bg-ui-primary text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              ].join(" ")}
              aria-current={active ? "step" : undefined}
            >
              {completed && !active && (
                <svg className="h-3 w-3 text-ui-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {completed && active && (
                <svg className="h-3 w-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {index + 1}. {item}
            </button>
          );
        })}
      </div>

      {/* ---- Step Content ---- */}
      <GlassCard className="space-y-6 text-ui-text">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-ui-text">{stepLabel}</h2>
            <p className={helpCls}>
              Step {step + 1} of {steps.length}
            </p>
          </div>
          <div className="text-right">
            <p className={helpCls}>You can change steps anytime</p>
          </div>
        </div>

        {validationError ? (
          <div className="rounded-xl border border-ui-warning/30 bg-ui-warningSoft px-4 py-3" role="alert">
            <p className="text-xs text-ui-warning font-medium">{validationError}</p>
          </div>
        ) : null}

        {/* ======== STEP 1: Relationship & Household ======== */}
        {step === 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-ui-textMuted">
              Family Court requires a qualifying relationship — these details help determine eligibility.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="petitionerName" className={labelCls}>
                  Petitioner name (you) <OptionalBadge />
                </label>
                <input
                  id="petitionerName"
                  className={inputCls}
                  value={form.petitionerName}
                  onChange={(event) => updateField("petitionerName", event.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="respondentName" className={labelCls}>
                  Respondent name (person you're seeking protection from) <OptionalBadge />
                </label>
                <input
                  id="respondentName"
                  className={inputCls}
                  value={form.respondentName}
                  onChange={(event) => updateField("respondentName", event.target.value)}
                  placeholder="The other person's name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="relationshipCategory" className={labelCls}>
                  Relationship category <RecommendedBadge />
                </label>
                <select
                  id="relationshipCategory"
                  className={selectCls}
                  value={form.relationshipCategory}
                  onChange={(event) =>
                    updateField("relationshipCategory", event.target.value as IntakeData["relationshipCategory"])
                  }
                >
                  <option value="">Select</option>
                  {relationshipOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="cohabitation" className={labelCls}>
                  Cohabitation / living situation <OptionalBadge />
                </label>
                <select
                  id="cohabitation"
                  className={selectCls}
                  value={form.cohabitation}
                  onChange={(event) => updateField("cohabitation", event.target.value as IntakeData["cohabitation"])}
                >
                  <option value="">Select</option>
                  {cohabitationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="childrenInvolved" className={labelCls}>
                  Children involved or witnessed incidents <OptionalBadge />
                </label>
                <select
                  id="childrenInvolved"
                  className={selectCls}
                  value={form.childrenInvolved}
                  onChange={(event) =>
                    updateField("childrenInvolved", event.target.value as IntakeData["childrenInvolved"])
                  }
                >
                  <option value="">Select</option>
                  {childrenOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : null}

        {/* ======== STEP 2: Incident Snapshot ======== */}
        {step === 1 ? (
          <div className="grid gap-4">
            <div className="space-y-2">
              <label htmlFor="mostRecentIncidentAt" className={labelCls}>
                Most recent incident date/time <RecommendedBadge />
              </label>
              <input
                id="mostRecentIncidentAt"
                type="datetime-local"
                className={inputCls}
                value={form.mostRecentIncidentAt}
                onChange={(event) => updateField("mostRecentIncidentAt", event.target.value)}
              />
              <p className={helpCls}>If unknown, approximate is fine (e.g., &quot;early January&quot;). Any detail helps.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="patternOfIncidents" className={labelCls}>
                Most recent incident — what happened? <RecommendedBadge />
              </label>
              <textarea
                id="patternOfIncidents"
                className={`${textareaCls} min-h-[120px]`}
                value={form.patternOfIncidents}
                onChange={(event) => updateField("patternOfIncidents", event.target.value)}
                placeholder="Describe what happened during the most recent incident. Has this happened before? If so, describe the pattern."
              />
              <p className={helpCls}>
                What types of behavior occurred? (physical, verbal, threats, stalking, property damage, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="incidentLocation" className={labelCls}>
                Where did this happen? <OptionalBadge />
              </label>
              <input
                id="incidentLocation"
                className={inputCls}
                value={form.incidentLocation}
                onChange={(event) => updateField("incidentLocation", event.target.value)}
                placeholder="e.g., home, work, near children's school, online, public place"
              />
              <p className={helpCls}>Location helps establish jurisdiction and context for the court.</p>
            </div>
          </div>
        ) : null}

        {/* ======== STEP 3: Safety & Evidence ======== */}
        {step === 2 ? (
          <div className="grid gap-4">
            <div className="space-y-2">
              <label htmlFor="existingCasesOrders" className={labelCls}>
                Existing cases/orders <OptionalBadge />
              </label>
              <textarea
                id="existingCasesOrders"
                className={`${textareaCls} min-h-[110px]`}
                value={form.existingCasesOrders}
                onChange={(event) => updateField("existingCasesOrders", event.target.value)}
                placeholder="List any existing orders, family court cases, or criminal matters."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firearmsAccess" className={labelCls}>
                  Firearms access <RecommendedBadge />
                </label>
                <select
                  id="firearmsAccess"
                  className={selectCls}
                  value={form.firearmsAccess}
                  onChange={(event) => updateField("firearmsAccess", event.target.value as IntakeData["firearmsAccess"])}
                >
                  <option value="">Select</option>
                  {firearmsOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="safetyStatus" className={labelCls}>
                  Safety status <RecommendedBadge />
                </label>
                <select
                  id="safetyStatus"
                  className={selectCls}
                  value={form.safetyStatus}
                  onChange={(event) => updateField("safetyStatus", event.target.value as IntakeData["safetyStatus"])}
                >
                  <option value="">Select</option>
                  {safetyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="evidenceInventory" className={labelCls}>
                Evidence inventory <OptionalBadge />
              </label>
              <textarea
                id="evidenceInventory"
                className={`${textareaCls} min-h-[120px]`}
                value={form.evidenceInventory}
                onChange={(event) => updateField("evidenceInventory", event.target.value)}
                placeholder="List texts, photos, reports, witness names, or other evidence."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="requestedRelief" className={labelCls}>
                Requested relief <OptionalBadge />
              </label>
              <textarea
                id="requestedRelief"
                className={`${textareaCls} min-h-[90px]`}
                value={form.requestedRelief}
                onChange={(event) => updateField("requestedRelief", event.target.value)}
                placeholder="Stay-away, refrain from harassment, temporary custody, etc."
              />
            </div>
          </div>
        ) : null}

        {/* ---- Navigation & Submit ---- */}
        <div className="space-y-4 pt-2">
          {step === steps.length - 1 && (
            <p className="text-xs text-ui-textMuted">
              Next, you'll answer a few guided questions to help generate an organized summary and preparation materials.
            </p>
          )}

          <div className="flex flex-wrap justify-between gap-3">
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
                className="rounded-full bg-ui-primary px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-95"
                onClick={goNext}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="rounded-full bg-ui-primary px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-95"
                onClick={handleSubmit}
              >
                Begin Guided Prep
              </button>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
    </RequireAuth>
  );
}
