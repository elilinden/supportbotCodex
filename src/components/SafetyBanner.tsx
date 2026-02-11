"use client";

import { useState } from "react";

export function SafetyBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full border-b border-ui-warning/30 bg-ui-warningSoft/60 backdrop-blur-xl" role="banner">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-3 text-xs text-ui-text">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-ui-warning" aria-hidden="true" />
            <span className="font-semibold text-ui-warning">Not legal advice.</span>
            <span className="text-ui-textMuted">Information-only guidance for NY Family Court OPs.</span>
          </div>
          <button
            className="rounded-full border border-ui-warning/30 bg-white/60 px-3 py-1 text-[11px] uppercase tracking-wide text-ui-text hover:bg-white"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls="safety-info"
          >
            {open ? "Hide safety info" : "Show safety info"}
          </button>
        </div>
        {open ? (
          <div id="safety-info" className="grid gap-1 text-ui-text">
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
