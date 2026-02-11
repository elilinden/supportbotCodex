"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthModal } from "@/components/AuthModal";

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const signOut = useAuthStore((s) => s.signOut);

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    if (accountOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [accountOpen]);

  return (
    <>
    <div className="w-full px-4 py-4 sm:px-6 lg:px-10">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-[220px]">
          <Link href="/" aria-label="Home">
            <Image
              src="/images/logo.png"
              alt="Pro-Se Prime"
              width={180}
              height={89}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <p className="text-xs text-ui-textMuted">NY Family Court / Orders of Protection / Information-only</p>
        </div>

        {/* Hamburger button — mobile only */}
        <button
          className="rounded-lg border border-ui-border bg-ui-surface p-2 text-ui-text lg:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-3 text-sm text-ui-textMuted" aria-label="Main navigation">
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

          {/* Auth: avatar dropdown or sign-in button */}
          {!loading && (
            user ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ui-primary text-sm font-semibold text-white hover:opacity-90"
                  aria-label="Account menu"
                  title={user.email ?? "Account"}
                >
                  {(user.email ?? "U")[0].toUpperCase()}
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-ui-border bg-ui-surface p-3 shadow-card">
                    <p className="truncate text-xs font-medium text-ui-text">{user.email}</p>
                    <hr className="my-2 border-ui-border" />
                    <Link
                      href="/settings"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-lg px-3 py-2 text-xs text-ui-text hover:bg-ui-surface2"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => { signOut(); setAccountOpen(false); }}
                      className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-ui-danger hover:bg-ui-dangerSoft"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="rounded-full border border-ui-primary bg-ui-primarySoft px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-primary hover:opacity-90"
              >
                Sign In
              </button>
            )
          )}
        </nav>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="mt-3 flex flex-col gap-2 lg:hidden" aria-label="Main navigation">
          <Link
            href="/"
            className="rounded-xl border border-ui-border bg-ui-surface px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ui-text hover:bg-ui-surface2"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/new"
            className="rounded-xl bg-ui-primary px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-95"
            onClick={() => setMenuOpen(false)}
          >
            New Intake
          </Link>
          <Link
            href="/guide"
            className="rounded-xl border border-ui-border bg-ui-surface px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ui-text hover:bg-ui-surface2"
            onClick={() => setMenuOpen(false)}
          >
            Court Guide
          </Link>
          <Link
            href="/settings"
            className="rounded-xl border border-ui-border bg-ui-surface px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ui-text hover:bg-ui-surface2"
            onClick={() => setMenuOpen(false)}
          >
            Settings
          </Link>

          {/* Auth — mobile */}
          {!loading && (
            user ? (
              <>
                <p className="truncate px-4 py-1 text-xs text-ui-textMuted">{user.email}</p>
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="rounded-xl border border-ui-border bg-ui-surface px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ui-text hover:bg-ui-surface2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setAuthOpen(true); setMenuOpen(false); }}
                className="rounded-xl border border-ui-primary bg-ui-primarySoft px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ui-primary hover:opacity-90"
              >
                Sign In
              </button>
            )
          )}
        </nav>
      )}
    </div>

    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
