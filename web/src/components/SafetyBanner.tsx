"use client";

import { useState } from "react";

export function SafetyBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-3 text-xs text-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-ink">Not legal advice.</span>
          <button
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] uppercase tracking-wide text-slate-700 hover:bg-slate-50"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? "Hide safety" : "Safety"}
          </button>
        </div>
        {open ? (
          <div className="grid gap-1 text-slate-700">
            <p>
              If you are in immediate danger, call 911 or your local emergency number. You can also
              contact NYC Safe Horizon or the NYS Domestic Violence Hotline for confidential help.
            </p>
            <p>
              This tool is limited to New York Family Court Orders of Protection and provides
              general, information-only guidance.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
