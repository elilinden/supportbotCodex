"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

type Mode = "sign-in" | "sign-up" | "reset";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);

    if (mode === "reset") {
      const { error } = await resetPassword(email);
      setBusy(false);
      if (error) return setError(error);
      setInfo("Check your email for a password reset link.");
      return;
    }

    const action = mode === "sign-in" ? signIn : signUp;
    const { error } = await action(email, password);
    setBusy(false);

    if (error) return setError(error);

    if (mode === "sign-up") {
      setInfo("Account created! Check your email to confirm, then sign in.");
      return;
    }

    // Successful sign-in — close
    onClose();
  };

  const title =
    mode === "sign-in" ? "Sign In" : mode === "sign-up" ? "Create Account" : "Reset Password";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto py-8 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 my-auto w-full max-w-sm rounded-2xl border border-ui-border bg-ui-surface p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ui-text">{title}</h2>
          <button
            className="text-ui-textMuted hover:text-ui-text"
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="mb-1 block text-xs font-semibold text-ui-textMuted">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-ui-border bg-ui-surface2 px-3 py-2 text-sm text-ui-text outline-none focus:border-ui-primary focus:ring-1 focus:ring-ui-primary"
            />
          </div>

          {mode !== "reset" && (
            <div>
              <label htmlFor="auth-password" className="mb-1 block text-xs font-semibold text-ui-textMuted">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-ui-border bg-ui-surface2 px-3 py-2 text-sm text-ui-text outline-none focus:border-ui-primary focus:ring-1 focus:ring-ui-primary"
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-ui-danger/30 bg-ui-dangerSoft px-3 py-2 text-xs text-ui-danger">
              {error}
            </p>
          )}

          {info && (
            <p className="rounded-xl border border-ui-success/30 bg-ui-successSoft px-3 py-2 text-xs text-ui-success">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-ui-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
          >
            {busy ? "Please wait..." : title}
          </button>
        </form>

        <div className="mt-4 space-y-2 text-center text-xs text-ui-textMuted">
          {mode === "sign-in" && (
            <>
              <button className="hover:text-ui-primary" onClick={() => { setMode("sign-up"); setError(null); setInfo(null); }}>
                No account? Create one
              </button>
              <span className="mx-2">|</span>
              <button className="hover:text-ui-primary" onClick={() => { setMode("reset"); setError(null); setInfo(null); }}>
                Forgot password?
              </button>
            </>
          )}
          {mode === "sign-up" && (
            <button className="hover:text-ui-primary" onClick={() => { setMode("sign-in"); setError(null); setInfo(null); }}>
              Already have an account? Sign in
            </button>
          )}
          {mode === "reset" && (
            <button className="hover:text-ui-primary" onClick={() => { setMode("sign-in"); setError(null); setInfo(null); }}>
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
