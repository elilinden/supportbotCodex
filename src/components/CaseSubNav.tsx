"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const CASE_TABS = [
  { label: "Interview", segment: "interview" },
  { label: "Summary", segment: "summary" },
  { label: "Roadmap", segment: "roadmap" },
] as const;

export function CaseSubNav({ caseId }: { caseId: string }) {
  const pathname = usePathname();
  const activeSegment = pathname.split("/").pop();

  return (
    <nav
      className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm"
      aria-label="Case navigation"
    >
      {CASE_TABS.map((tab) => {
        const isActive = activeSegment === tab.segment;
        return (
          <Link
            key={tab.segment}
            href={`/case/${caseId}/${tab.segment}`}
            className={[
              "rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors",
              isActive
                ? "bg-ui-primary text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
      <Link
        href="/guide"
        className="ml-1 rounded-full border border-dashed border-slate-300 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:border-ui-primary/40 hover:bg-ui-primary/5 hover:text-ui-primary"
      >
        Court Guide &#8599;
      </Link>
    </nav>
  );
}
