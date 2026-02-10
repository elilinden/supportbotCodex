"use client";

import Link from "next/link";

export function TopNav() {
  return (
    <div className="w-full px-4 py-4 sm:px-6 lg:px-10">
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <div className="min-w-[220px]">
          <Link href="/" className="text-lg font-semibold tracking-tight text-ui-text" aria-label="Home">
            Pro-Se Prime
          </Link>
          <p className="text-xs text-ui-textMuted">NY Family Court / Orders of Protection / Information-only</p>
        </div>

        <nav className="flex items-center gap-3 text-sm text-ui-textMuted" aria-label="Main navigation">
          <Link
            href="/"
            className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text hover:bg-ui-surface2"
          >
            Home
          </Link>

          <Link
            href="/new"
            className="rounded-full bg-ui-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-95"
          >
            New Intake
          </Link>

          <Link
            href="/guide"
            className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text hover:bg-ui-surface2"
          >
            Court Guide
          </Link>

          <Link
            href="/settings"
            className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text hover:bg-ui-surface2"
          >
            Settings
          </Link>
        </nav>
      </div>
    </div>
  );
}
