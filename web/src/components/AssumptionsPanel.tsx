import { GlassCard } from "@/components/GlassCard";

export function AssumptionsPanel({
  assumptions,
  uncertainties
}: {
  assumptions: string[];
  uncertainties: string[];
}) {
  return (
    <GlassCard className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ui-text">Assumptions</h3>
        <ul className="mt-2 space-y-1 text-xs text-ui-textMuted" aria-label="Case assumptions">
          {assumptions.length ? (
            assumptions.map((item, index) => <li key={index}>- {item}</li>)
          ) : (
            <li>- None yet.</li>
          )}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-ui-text">Uncertainties</h3>
        <ul className="mt-2 space-y-1 text-xs text-ui-textMuted" aria-label="Case uncertainties">
          {uncertainties.length ? (
            uncertainties.map((item, index) => <li key={index}>- {item}</li>)
          ) : (
            <li>- None yet.</li>
          )}
        </ul>
      </div>
    </GlassCard>
  );
}
