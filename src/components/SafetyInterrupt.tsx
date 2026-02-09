"use client";

import { useEffect, useRef } from "react";

export function SafetyInterrupt({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    // Focus the close button when modal opens
    closeButtonRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      // Trap focus within the modal
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-interrupt-title"
      aria-describedby="safety-interrupt-desc"
    >
      <div
        ref={dialogRef}
        className="max-w-lg rounded-2xl border border-ui-danger/40 bg-ui-dangerSoft p-6 shadow-card"
      >
        <h2 id="safety-interrupt-title" className="text-lg font-semibold text-ui-danger">
          Immediate Safety Check
        </h2>
        <p id="safety-interrupt-desc" className="mt-3 text-sm text-ui-text">
          If you are in immediate danger, call 911 or your local emergency number right now. If you
          can, go to a safe location. This tool can wait.
        </p>
        <p className="mt-3 text-xs text-ui-textMuted">
          You can also contact the NYS Domestic Violence Hotline or NYC Safe Horizon for confidential
          support.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs uppercase tracking-wide text-ui-text hover:bg-ui-surface2"
          >
            I am safe right now
          </button>
        </div>
      </div>
    </div>
  );
}
