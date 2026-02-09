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
        <h3 className="text-sm font-semibold text-white">Assumptions</h3>
        <ul className="mt-2 space-y-1 text-xs text-white/70">
          {assumptions.length ? (
            assumptions.map((item, index) => <li key={index}>- {item}</li>)
          ) : (
            <li>- None yet.</li>
          )}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">Uncertainties</h3>
        <ul className="mt-2 space-y-1 text-xs text-white/70">
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
