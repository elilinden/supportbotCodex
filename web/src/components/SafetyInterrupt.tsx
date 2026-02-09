"use client";

import { useEffect } from "react";

export function SafetyInterrupt({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="glass-panel-strong max-w-lg rounded-2xl border border-rose-400/40 bg-rose-500/10 p-6">
        <h2 className="text-lg font-semibold text-white">Immediate Safety Check</h2>
        <p className="mt-3 text-sm text-white/80">
          If you are in immediate danger, call 911 or your local emergency number right now. If you
          can, go to a safe location. This tool can wait.
        </p>
        <p className="mt-3 text-xs text-white/70">
          You can also contact the NYS Domestic Violence Hotline or NYC Safe Horizon for confidential
          support.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide text-white/80"
          >
            I am safe right now
          </button>
        </div>
      </div>
    </div>
  );
}
