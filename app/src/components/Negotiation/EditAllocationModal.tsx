import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import type { Allocation, NegotiationAction } from "@/types/negotiation";
import type { ContractCard } from "@/types/cards";
import { RESOURCE_LABEL } from "@/types/cards";
import { ResourceIcon } from "@/components/Icons/ResourceIcon";
import { FACTIONS, type FactionId } from "@/data/factions";
import {
  getRemainingHazards,
  getRemainingRequirements,
  getRemainingRewards,
} from "@/state/derived";

type Props = {
  allocation: Allocation | null;
  contract: ContractCard;
  allAllocations: Allocation[];
  onClose: () => void;
  dispatch: (a: NegotiationAction) => void;
};

export function EditAllocationModal({ allocation, contract, allAllocations, onClose, dispatch }: Props) {
  // Draft state — held locally until Apply. Lets the user reassign without
  // losing the count edit and gives instant visual feedback on the active player.
  const [draftCount, setDraftCount] = useState(1);
  const [draftPlayerId, setDraftPlayerId] = useState<FactionId | null>(null);

  useEffect(() => {
    if (!allocation) return;
    setDraftCount(allocation.count);
    setDraftPlayerId(allocation.playerId);
  }, [allocation?.id]);

  // Max we could set this chip to:
  // (whatever's still unallocated of this resource) + (this chip's current count)
  const max = useMemo(() => {
    if (!allocation) return 0;
    const others = allAllocations.filter((a) => a.id !== allocation.id);
    if (allocation.kind === "risk" && allocation.resourceType === "hazard") {
      return getRemainingHazards(contract, others);
    }
    if (allocation.kind === "requirement") {
      const r = getRemainingRequirements(contract, others).find((x) => x.type === allocation.resourceType);
      return r?.count ?? 0;
    }
    if (allocation.kind === "reward") {
      const r = getRemainingRewards(contract, others).find((x) => x.type === allocation.resourceType);
      return r?.count ?? 0;
    }
    return allocation.count;
  }, [allocation, contract, allAllocations]);

  useEffect(() => {
    if (!allocation) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [allocation, onClose]);

  if (!allocation) return null;

  const clampedCount = Math.min(Math.max(1, draftCount), Math.max(1, max));
  const playerChanged = draftPlayerId !== allocation.playerId;
  const countChanged = clampedCount !== allocation.count;
  const dirty = playerChanged || countChanged;

  function apply() {
    if (!allocation) return;
    const patch: Partial<Allocation> = {};
    if (playerChanged && draftPlayerId) patch.playerId = draftPlayerId;
    if (countChanged) patch.count = clampedCount;
    if (Object.keys(patch).length > 0) {
      dispatch({ type: "UPDATE_ALLOCATION", allocationId: allocation.id, patch });
    }
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-mr-bg-deep/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="mr-panel w-full max-w-md p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md border border-mr-border/30 grid place-items-center">
              <ResourceIcon type={allocation.resourceType} size={20} />
            </div>
            <div>
              <div className="mr-label">EDIT {allocation.kind.toUpperCase()}</div>
              <div className="mr-title text-lg text-mr-text">{RESOURCE_LABEL[allocation.resourceType]}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-md border border-mr-border/25 grid place-items-center text-mr-text-muted hover:text-mr-cyan hover:border-mr-cyan"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <div className="mr-label mb-2">
            Count <span className="text-mr-text-muted/70">· max {max}</span>
          </div>
          <div className="inline-flex items-center mr-panel-soft">
            <button
              type="button"
              onClick={() => setDraftCount((c) => Math.max(1, c - 1))}
              disabled={clampedCount <= 1}
              aria-label="Decrease"
              className="w-10 h-10 grid place-items-center text-mr-text hover:text-mr-cyan disabled:opacity-40"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 font-mono text-lg tabular-nums min-w-[3rem] text-center text-mr-cyan">{clampedCount}</span>
            <button
              type="button"
              onClick={() => setDraftCount((c) => Math.min(max, c + 1))}
              disabled={clampedCount >= max}
              aria-label="Increase"
              className="w-10 h-10 grid place-items-center text-mr-text hover:text-mr-cyan disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-5">
          <div className="mr-label mb-2">Assigned to · tap to reassign</div>
          <div className="grid grid-cols-5 gap-1.5">
            {FACTIONS.map((f) => {
              const active = draftPlayerId === f.id;
              const wasActive = allocation.playerId === f.id && !active;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setDraftPlayerId(f.id)}
                  className="mr-panel-soft p-2 flex flex-col items-center gap-1 transition-all relative"
                  style={{
                    borderColor: active
                      ? f.colorHex
                      : `color-mix(in oklab, ${f.colorHex} 25%, transparent)`,
                    boxShadow: active
                      ? `0 0 0 2px ${f.colorHex}, 0 0 16px -2px ${f.colorHex}`
                      : undefined,
                    opacity: active || !draftPlayerId ? 1 : 0.85,
                  }}
                  aria-pressed={active}
                  title={`Assign to ${f.name}`}
                >
                  <span className="w-5 h-5 rounded-full" style={{ background: f.colorHex }} />
                  <span className="mr-label text-[9px]">{f.name.slice(0, 4).toUpperCase()}</span>
                  {wasActive && (
                    <span className="absolute -top-1 -right-1 text-[8px] font-mono px-1 rounded bg-mr-bg-deep text-mr-text-muted border border-mr-border/30">
                      was
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => { dispatch({ type: "REMOVE_ALLOCATION", allocationId: allocation.id }); onClose(); }}
            className="px-3 py-2 rounded border border-mr-alert/40 text-mr-alert hover:bg-mr-alert/10 font-mono text-xs uppercase tracking-widest inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 mr-button text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={!dirty}
              className="px-4 py-2 mr-button text-xs"
              style={{ borderColor: "var(--color-mr-cyan)" }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
