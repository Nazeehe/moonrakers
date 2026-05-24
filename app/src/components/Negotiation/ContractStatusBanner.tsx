import { CheckCircle2, AlertTriangle, Gift, Radio } from "lucide-react";
import type { NegotiationTab, SessionStatus } from "@/types/negotiation";
import type { ContractCard } from "@/types/cards";
import { RESOURCE_LABEL } from "@/types/cards";
import {
  getRemainingHazards,
  getRemainingRequirements,
  getRemainingRewards,
  getSessionStatus,
} from "@/state/derived";

type Props = {
  contract: ContractCard;
  tab: NegotiationTab;
};

export function ContractStatusBanner({ contract, tab }: Props) {
  const status = getSessionStatus(contract, tab);
  const meta = STATUS_META[status];

  const remainingReqs = getRemainingRequirements(contract, tab.allocations).filter((r) => r.count > 0);
  const remainingRewards = getRemainingRewards(contract, tab.allocations).filter((r) => r.count > 0);
  const remainingHazards = getRemainingHazards(contract, tab.allocations);

  let detail: string;
  if (status === "incomplete") {
    detail = "Missing: " + remainingReqs.map((r) => `${r.count} ${RESOURCE_LABEL[r.type]}`).join(", ");
  } else if (status === "rewards_unresolved") {
    detail = "Unassigned: " + remainingRewards.map((r) => `${r.count} ${RESOURCE_LABEL[r.type]}`).join(", ");
  } else if (status === "risk_unresolved") {
    detail = `Hazard dice unresolved: ${remainingHazards}`;
  } else if (status === "satisfied_only") {
    detail = "Requirements satisfied. Rewards and hazards still need attention.";
  } else {
    detail = "All requirements satisfied, rewards allocated, hazards covered.";
  }

  return (
    <div
      className="mr-panel p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
      style={{
        borderColor: `color-mix(in oklab, ${meta.color} 55%, transparent)`,
        boxShadow: `0 0 0 1px color-mix(in oklab, ${meta.color} 20%, transparent), 0 0 24px -8px ${meta.color}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-md grid place-items-center shrink-0 border"
        style={{ color: meta.color, borderColor: meta.color, background: `color-mix(in oklab, ${meta.color} 10%, transparent)` }}
      >
        {meta.icon}
      </div>
      <div className="min-w-0">
        <div className="mr-label" style={{ color: meta.color }}>// {meta.label}</div>
        <div className="text-mr-text text-sm sm:text-base truncate">{detail}</div>
      </div>
    </div>
  );
}

const STATUS_META: Record<SessionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  incomplete:        { label: "REQUIREMENTS INCOMPLETE", color: "var(--color-mr-alert)", icon: <AlertTriangle className="w-5 h-5" /> },
  satisfied_only:    { label: "CONTRACT SATISFIED",      color: "var(--color-mr-cyan)",  icon: <Radio className="w-5 h-5" /> },
  rewards_unresolved:{ label: "REWARDS UNRESOLVED",      color: "var(--color-mr-gold)",  icon: <Gift className="w-5 h-5" /> },
  risk_unresolved:   { label: "HAZARD RISK UNRESOLVED",  color: "var(--color-mr-alert)", icon: <AlertTriangle className="w-5 h-5" /> },
  deal_ready:        { label: "DEAL READY",              color: "var(--color-mr-green)", icon: <CheckCircle2 className="w-5 h-5" /> },
};
