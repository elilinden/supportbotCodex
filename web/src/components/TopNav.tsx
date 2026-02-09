"use client";

import Link from "next/link";
import { useCaseStore } from "@/store/useCaseStore";

export function TopNav() {
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      {/* Full-width container that adapts to page width */}
      <div className="w-full px-4 py-4 sm:px-6 lg:px-10">
        {/* Inner row: grows with screen, no hard max-width cap */}
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <div className="min-w-[220px]">
            <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
              NY Family Court OP Navigator
            </Link>
            <p className="text-xs text-slate-600">Orders of Protection / Information-only</p>
          </div>

          <nav className="flex items-center gap-3 text-sm text-slate-600">
            {activeCaseId ? (
              <Link
                href={dashboardHref}
                className="rounded-full bg-accentBlue px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-95"
              >
                Dashboard
              </Link>
            ) : null}

            {caseCount === 0 ? (
              <Link
                href="/new"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50"
              >
                New Intake
              </Link>
            ) : null}

            <Link
              href="/settings"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50"
            >
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
