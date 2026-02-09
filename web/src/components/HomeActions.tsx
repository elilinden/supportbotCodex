"use client";

import Link from "next/link";
import { useCaseStore } from "@/store/useCaseStore";

export function HomeActions() {
  const caseCount = useCaseStore((state) => state.cases.length);
  const activeCaseId = useCaseStore((state) => state.activeCaseId);
  const activeCase = useCaseStore((state) =>
    state.cases.find((item) => item.id === state.activeCaseId)
  );

  const dashboardHref = activeCaseId
    ? activeCase?.status === "interview"
      ? `/case/${activeCaseId}/interview`
      : `/case/${activeCaseId}/roadmap`
    : "/";

  const primaryBtn =
    "inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 " +
    "text-xs font-semibold uppercase tracking-wide text-white shadow-sm " +
    "hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100";

  const outlineBtn =
    "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 " +
    "text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm " +
    "hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100";

  return (
    <div className="flex flex-wrap gap-3">
      {caseCount === 0 ? (
        <Link href="/new" className={primaryBtn}>
          Start New Intake
        </Link>
      ) : null}

      {activeCaseId ? (
        <Link href={dashboardHref} className={primaryBtn}>
          View Dashboard
        </Link>
      ) : null}

      <Link href="/settings" className={outlineBtn}>
        Configure Settings
      </Link>
    </div>
  );
}