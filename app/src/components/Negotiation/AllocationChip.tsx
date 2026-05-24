import type { Allocation } from "@/types/negotiation";
import { ResourceIcon } from "@/components/Icons/ResourceIcon";

const KIND_TINT: Record<Allocation["kind"], string> = {
  requirement: "var(--color-mr-cyan)",
  reward:      "var(--color-mr-gold)",
  risk:        "var(--color-mr-alert)",
};

export function AllocationChip({
  allocation, onClick,
}: { allocation: Allocation; onClick?: () => void }) {
  const tint = KIND_TINT[allocation.kind];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="inline-flex items-center gap-1 mr-panel-soft px-1.5 py-0.5 font-mono text-xs hover:scale-105 transition-transform disabled:hover:scale-100"
      style={{
        borderColor: `color-mix(in oklab, ${tint} 45%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${tint} 15%, transparent)`,
      }}
      title={onClick ? "Edit allocation" : undefined}
    >
      <ResourceIcon type={allocation.resourceType} size={12} />
      <span>{allocation.count}</span>
    </button>
  );
}
