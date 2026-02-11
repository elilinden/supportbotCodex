"use client";

import { useState } from "react";
import Link from "next/link";
import { useCaseStore } from "@/store/useCaseStore";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthModal } from "@/components/AuthModal";

export function HomeActions() {
  const caseCount = useCaseStore((state) => state.cases.length);
  const activeCaseId = useCaseStore((state) => state.activeCaseId);
  const activeCase = useCaseStore((state) =>
    state.cases.find((item) => item.id === state.activeCaseId)
  );
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const [authOpen, setAuthOpen] = useState(false);

  const dashboardHref = activeCaseId
    ? activeCase?.status === "interview"
      ? `/case/${activeCaseId}/interview`
      : `/case/${activeCaseId}/roadmap`
    : "/";

  const primaryBtn =
    "inline-flex items-center justify-center rounded-full bg-ui-primary px-6 py-3 " +
    "text-xs font-semibold uppercase tracking-wide text-white shadow-sm " +
    "hover:opacity-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ui-primarySoft";

  const outlineBtn =
    "inline-flex items-center justify-center rounded-full border border-ui-border bg-ui-surface px-6 py-3 " +
    "text-xs font-semibold uppercase tracking-wide text-ui-text shadow-sm " +
    "hover:bg-ui-surface2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ui-primarySoft";

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {!loading && !user ? (
          <button onClick={() => setAuthOpen(true)} className={primaryBtn}>
            Sign In to Get Started
          </button>
        ) : (
          <>
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
          </>
        )}

        <Link href="/settings" className={outlineBtn}>
          Configure Settings
        </Link>
      </div>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
