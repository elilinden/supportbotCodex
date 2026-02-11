"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthModal } from "@/components/AuthModal";
import { GlassCard } from "@/components/GlassCard";

/**
 * Wraps page content that requires authentication.
 * Shows a sign-in prompt if the user is not logged in.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) {
    return (
      <GlassCard className="py-12 text-center">
        <p className="text-sm text-ui-textMuted">Loading...</p>
      </GlassCard>
    );
  }

  if (!user) {
    return (
      <>
        <GlassCard className="mx-auto max-w-md space-y-4 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ui-primarySoft">
            <svg className="h-6 w-6 text-ui-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-ui-text">Sign in required</h2>
          <p className="text-sm text-ui-textMuted">
            Sign in or create an account to continue. Your data is encrypted on-device before it is saved to the cloud.
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className="rounded-full bg-ui-primary px-6 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            Sign In or Create Account
          </button>
        </GlassCard>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      </>
    );
  }

  return <>{children}</>;
}
