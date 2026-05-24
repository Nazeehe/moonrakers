import type { KeyboardEvent } from "react";
import type { Allocation } from "@/types/negotiation";
import type { Faction } from "@/data/factions";
import { AllocationChip } from "./AllocationChip";

type Props = {
  faction: Faction;
  isLeader: boolean;
  allocations: Allocation[];
  // When true, the player box itself is the assignment target.
  assignmentMode: boolean;
  onAssignClick: () => void;
  onEditAllocation: (a: Allocation) => void;
};

export function PlayerBox({
  faction, isLeader, allocations, assignmentMode, onAssignClick, onEditAllocation,
}: Props) {
  const grouped = {
    requirement: allocations.filter((a) => a.kind === "requirement"),
    reward:      allocations.filter((a) => a.kind === "reward"),
    risk:        allocations.filter((a) => a.kind === "risk"),
  };
  const empty = allocations.length === 0;

  // The whole box acts as a button when assignment is pending, but the
  // chip buttons inside must always remain interactive — so we render a
  // <div role="button"> instead of a real <button> (nested <button> is
  // invalid HTML and iOS drops the inner taps).
  function handleBoxClick() {
    if (assignmentMode) onAssignClick();
  }
  function handleBoxKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!assignmentMode) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onAssignClick();
    }
  }

  return (
    <div
      role={assignmentMode ? "button" : undefined}
      tabIndex={assignmentMode ? 0 : -1}
      onClick={handleBoxClick}
      onKeyDown={handleBoxKey}
      aria-label={assignmentMode ? `Assign to ${faction.name}` : undefined}
      className={`mr-panel-soft p-3 text-left w-full transition-all ${
        assignmentMode ? "hover:scale-[1.01] cursor-pointer" : "cursor-default"
      }`}
      style={{
        borderColor: `color-mix(in oklab, ${faction.colorHex} ${assignmentMode ? 75 : 45}%, transparent)`,
        boxShadow: assignmentMode
          ? `0 0 0 1px ${faction.colorHex}, 0 0 24px -4px ${faction.colorHex}`
          : `inset 0 0 0 1px color-mix(in oklab, ${faction.colorHex} 15%, transparent)`,
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-3 h-3 rounded-full border shrink-0"
            style={{ background: faction.colorHex, borderColor: faction.colorHex, boxShadow: `0 0 8px -1px ${faction.colorHex}` }}
          />
          <span className="mr-title text-sm text-mr-text truncate">{faction.name}</span>
        </div>
        {isLeader && (
          <span className="mr-label text-[9px] px-1.5 py-0.5 rounded border border-mr-gold/60 text-mr-gold">
            LEADER
          </span>
        )}
      </div>

      {empty ? (
        <div className="text-mr-text-muted/70 text-xs italic">
          {assignmentMode ? "Tap to assign here" : "No allocations"}
        </div>
      ) : (
        <div className="space-y-1.5">
          {grouped.requirement.length > 0 && <Row label="REQ" items={grouped.requirement} onEdit={onEditAllocation} />}
          {grouped.reward.length > 0 &&      <Row label="REW" items={grouped.reward}      onEdit={onEditAllocation} />}
          {grouped.risk.length > 0 &&        <Row label="RISK" items={grouped.risk}       onEdit={onEditAllocation} />}
        </div>
      )}
    </div>
  );
}

function Row({
  label, items, onEdit,
}: { label: string; items: Allocation[]; onEdit: (a: Allocation) => void }) {
  // Stop both click and keydown so the parent box's assign handler doesn't fire
  // when the user is editing a chip.
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="mr-label w-9 shrink-0 text-[9px]">{label}</span>
      <div
        className="flex flex-wrap gap-1.5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {items.map((a) => (
          <AllocationChip key={a.id} allocation={a} onClick={() => onEdit(a)} />
        ))}
      </div>
    </div>
  );
}
