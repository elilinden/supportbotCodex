"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

  const dialogRef = useRef<HTMLDivElement>(null);

  /* ---- Focus trap: keep Tab cycling inside the dialog ---- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  /* ---- Restore focus on unmount ---- */
  const previousFocus = useRef<Element | null>(null);
  useEffect(() => {
    previousFocus.current = document.activeElement;
    return () => {
      if (previousFocus.current instanceof HTMLElement) {
        previousFocus.current.focus();
      }
    };
  }, []);

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

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto py-8 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="mx-4 my-auto w-full max-w-sm rounded-2xl border border-ui-border bg-ui-surface p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="auth-modal-title" className="text-lg font-semibold text-ui-text">{title}</h2>
          <button
            className="text-ui-textMuted hover:text-ui-text"
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
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
              autoFocus
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
            <p role="alert" className="rounded-xl border border-ui-danger/30 bg-ui-dangerSoft px-3 py-2 text-xs text-ui-danger">
              {error}
            </p>
          )}

          {info && (
            <p role="status" className="rounded-xl border border-ui-success/30 bg-ui-successSoft px-3 py-2 text-xs text-ui-success">
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
    </div>,
    document.body
  );
}
