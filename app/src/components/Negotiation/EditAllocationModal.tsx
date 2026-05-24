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
  const [count, setCount] = useState(allocation?.count ?? 1);

  useEffect(() => {
    setCount(allocation?.count ?? 1);
  }, [allocation?.id, allocation?.count]);

  // Headroom = whatever's still unallocated for this resource, plus this allocation's own current count.
  const max = useMemo(() => {
    if (!allocation) return 0;
    const others = allAllocations.filter((a) => a.id !== allocation.id);
    if (allocation.kind === "risk" && allocation.resourceType === "hazard") {
      return getRemainingHazards(contract, others) + 0; // remaining already excludes this alloc
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
  const clamped = Math.min(Math.max(1, count), Math.max(1, max));

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
          <div className="mr-label mb-2">Count <span className="text-mr-text-muted/70">· max {max}</span></div>
          <div className="inline-flex items-center mr-panel-soft">
            <button
              type="button"
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              disabled={clamped <= 1}
              aria-label="Decrease"
              className="w-10 h-10 grid place-items-center text-mr-text hover:text-mr-cyan disabled:opacity-40"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 font-mono text-lg tabular-nums min-w-[3rem] text-center text-mr-cyan">{clamped}</span>
            <button
              type="button"
              onClick={() => setCount((c) => Math.min(max, c + 1))}
              disabled={clamped >= max}
              aria-label="Increase"
              className="w-10 h-10 grid place-items-center text-mr-text hover:text-mr-cyan disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-5">
          <div className="mr-label mb-2">Assigned to</div>
          <div className="grid grid-cols-5 gap-1.5">
            {FACTIONS.map((f) => {
              const active = allocation.playerId === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => dispatch({ type: "UPDATE_ALLOCATION", allocationId: allocation.id, patch: { playerId: f.id } })}
                  className="mr-panel-soft p-2 flex flex-col items-center gap-1 transition-all"
                  style={{
                    borderColor: active ? f.colorHex : `color-mix(in oklab, ${f.colorHex} 25%, transparent)`,
                    boxShadow: active ? `0 0 0 1px ${f.colorHex}` : undefined,
                  }}
                  aria-pressed={active}
                  title={`Move to ${f.name}`}
                >
                  <span className="w-4 h-4 rounded-full" style={{ background: f.colorHex }} />
                  <span className="mr-label text-[9px]">{f.name.slice(0, 4).toUpperCase()}</span>
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
              onClick={() => {
                dispatch({ type: "UPDATE_ALLOCATION", allocationId: allocation.id, patch: { count: clamped } });
                onClose();
              }}
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

// Tiny helper so PlayerBox doesn't need to know about player ID typing in the modal.
export type EditingAllocation = { allocation: Allocation; ownerId: FactionId };
