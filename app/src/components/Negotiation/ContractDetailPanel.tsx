import type { NegotiationTab, AllocationKind } from "@/types/negotiation";
import type { ContractCard, ResourceType } from "@/types/cards";
import { RESOURCE_LABEL, CARD_ASPECT } from "@/types/cards";
import { ResourceIcon } from "@/components/Icons/ResourceIcon";
import { PlaceholderCard } from "@/components/Armory/PlaceholderCard";
import {
  getRemainingHazards,
  getRemainingRequirements,
  getRemainingRewards,
} from "@/state/derived";

type Props = {
  contract: ContractCard;
  tab: NegotiationTab;
  onPickResource: (input: { kind: AllocationKind; resourceType: ResourceType; remaining: number }) => void;
  onZoom: () => void;
};

export function ContractDetailPanel({ contract, tab, onPickResource, onZoom }: Props) {
  const reqs = getRemainingRequirements(contract, tab.allocations);
  const rews = getRemainingRewards(contract, tab.allocations);
  const haz = getRemainingHazards(contract, tab.allocations);

  return (
    <div className="mr-panel p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <div className="mr-label text-mr-cyan">// CONTRACT</div>
          <h2 className="mr-title text-lg sm:text-xl text-mr-text leading-tight">{contract.name}</h2>
        </div>
        <button
          type="button"
          onClick={onZoom}
          className="mr-label text-xs hover:text-mr-cyan border border-mr-border/20 hover:border-mr-cyan px-2 py-1 rounded"
        >
          ZOOM
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div
          className="w-24 sm:w-28 shrink-0 rounded-md overflow-hidden border border-mr-border/15"
          style={{ aspectRatio: CARD_ASPECT[contract.category] }}
        >
          {contract.imageUrl ? (
            <img src={contract.imageUrl} alt={contract.name} className="w-full h-full object-cover" />
          ) : (
            <PlaceholderCard card={contract} />
          )}
        </div>
        <div className="flex-1 min-w-0 text-xs text-mr-text-muted">
          {contract.contractType && (
            <div className="mr-label mb-1">{contract.contractType.toUpperCase()}</div>
          )}
          {contract.text && <p className="italic line-clamp-5">{contract.text}</p>}
        </div>
      </div>

      <Pool
        title="Requirements remaining"
        kind="requirement"
        items={reqs}
        onPick={(rt, n) => onPickResource({ kind: "requirement", resourceType: rt, remaining: n })}
      />
      <Pool
        title="Rewards remaining"
        kind="reward"
        items={rews}
        onPick={(rt, n) => onPickResource({ kind: "reward", resourceType: rt, remaining: n })}
      />
      <Pool
        title="Hazard risk remaining"
        kind="risk"
        items={haz > 0 ? [{ type: "hazard", count: haz }] : []}
        onPick={(rt, n) => onPickResource({ kind: "risk", resourceType: rt, remaining: n })}
        emptyLabel={contract.hazards === 0 ? "none" : "all assigned"}
      />
    </div>
  );
}

function Pool({
  title, kind, items, onPick, emptyLabel,
}: {
  title: string;
  kind: AllocationKind;
  items: { type: ResourceType; count: number }[];
  onPick: (rt: ResourceType, remaining: number) => void;
  emptyLabel?: string;
}) {
  const accent =
    kind === "requirement" ? "var(--color-mr-cyan)"
    : kind === "reward"    ? "var(--color-mr-gold)"
    :                        "var(--color-mr-alert)";

  const visible = items.filter((i) => i.count > 0);
  return (
    <div className="mb-3 last:mb-0">
      <div className="mr-label mb-1.5" style={{ color: accent }}>{title}</div>
      {visible.length === 0 ? (
        <div className="text-mr-text-muted/70 text-xs italic">{emptyLabel ?? "all assigned"}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visible.map((r) => (
            <button
              key={r.type}
              type="button"
              onClick={() => onPick(r.type, r.count)}
              className="inline-flex items-center gap-1.5 mr-panel-soft px-2.5 py-1.5 font-mono text-sm hover:scale-105 transition-transform"
              style={{
                borderColor: `color-mix(in oklab, ${accent} 45%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 15%, transparent)`,
              }}
              title={`Assign ${RESOURCE_LABEL[r.type]}`}
            >
              <ResourceIcon type={r.type} size={14} />
              <span>{r.count}</span>
              <span className="text-mr-text-muted/80 text-xs">{RESOURCE_LABEL[r.type]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
