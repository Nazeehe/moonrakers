import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import type { AllocationKind } from "@/types/negotiation";
import type { ResourceType } from "@/types/cards";
import { RESOURCE_LABEL } from "@/types/cards";
import { ResourceIcon } from "@/components/Icons/ResourceIcon";

type Props = {
  pending: { kind: AllocationKind; resourceType: ResourceType; remaining: number } | null;
  count: number;
  onCount: (n: number) => void;
  onCancel: () => void;
};

const KIND_LABEL: Record<AllocationKind, string> = {
  requirement: "Requirement",
  reward:      "Reward",
  risk:        "Risk",
};

const KIND_TINT: Record<AllocationKind, string> = {
  requirement: "var(--color-mr-cyan)",
  reward:      "var(--color-mr-gold)",
  risk:        "var(--color-mr-alert)",
};

// Non-modal banner (sticky, not full-screen) — keeps the player boxes tappable.
export function AssignmentBanner({ pending, count, onCount, onCancel }: Props) {
  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "ArrowUp" || e.key === "+" || e.key === "=") onCount(Math.min(count + 1, pending.remaining));
      if (e.key === "ArrowDown" || e.key === "-") onCount(Math.max(1, count - 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, count, onCount, onCancel]);

  if (!pending) return null;
  const tint = KIND_TINT[pending.kind];

  return (
    <div
      className="sticky top-[57px] z-20 mr-panel px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 sm:gap-4 flex-wrap"
      style={{
        borderColor: `color-mix(in oklab, ${tint} 60%, transparent)`,
        boxShadow: `0 0 0 1px color-mix(in oklab, ${tint} 25%, transparent), 0 0 28px -8px ${tint}`,
      }}
      role="region"
      aria-label="Pending assignment"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-md border grid place-items-center shrink-0"
          style={{ borderColor: tint, color: tint, background: `color-mix(in oklab, ${tint} 10%, transparent)` }}
        >
          <ResourceIcon type={pending.resourceType} size={18} />
        </div>
        <div className="min-w-0">
          <div className="mr-label" style={{ color: tint }}>// ASSIGN {KIND_LABEL[pending.kind].toUpperCase()}</div>
          <div className="text-sm text-mr-text truncate">
            <span className="font-mono">{RESOURCE_LABEL[pending.resourceType]}</span>
            <span className="text-mr-text-muted"> · {pending.remaining} available · tap a player box below</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CountStepper
          count={count}
          max={pending.remaining}
          onChange={onCount}
          tint={tint}
        />
        <button
          type="button"
          onClick={onCancel}
          className="ml-1 px-2.5 py-1.5 rounded border border-mr-border/25 text-mr-text-muted hover:text-mr-alert hover:border-mr-alert font-mono text-xs uppercase tracking-widest inline-flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

function CountStepper({
  count, max, onChange, tint,
}: { count: number; max: number; onChange: (n: number) => void; tint: string }) {
  return (
    <div className="inline-flex items-center mr-panel-soft">
      <Step
        onClick={() => onChange(Math.max(1, count - 1))}
        disabled={count <= 1}
        ariaLabel="Decrease count"
      >
        <Minus className="w-3.5 h-3.5" />
      </Step>
      <span
        className="px-3 font-mono text-base tabular-nums min-w-[2.5rem] text-center"
        style={{ color: tint }}
      >
        {count}
      </span>
      <Step
        onClick={() => onChange(Math.min(max, count + 1))}
        disabled={count >= max}
        ariaLabel="Increase count"
      >
        <Plus className="w-3.5 h-3.5" />
      </Step>
    </div>
  );
}

function Step({
  onClick, disabled, ariaLabel, children,
}: { onClick: () => void; disabled?: boolean; ariaLabel: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="w-8 h-8 grid place-items-center text-mr-text hover:text-mr-cyan disabled:opacity-40 disabled:hover:text-mr-text"
    >
      {children}
    </button>
  );
}

export function useAssignmentState() {
  const [pending, setPending] =
    useState<{ kind: AllocationKind; resourceType: ResourceType; remaining: number } | null>(null);
  const [count, setCount] = useState(1);

  function open(p: { kind: AllocationKind; resourceType: ResourceType; remaining: number }) {
    setPending(p);
    setCount(1);
  }
  function cancel() { setPending(null); setCount(1); }
  function clampedCount() { return pending ? Math.min(Math.max(1, count), pending.remaining) : 0; }

  return { pending, count: clampedCount(), setCount, open, cancel };
}
