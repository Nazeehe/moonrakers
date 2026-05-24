import type { Allocation, NegotiationTab, SessionStatus } from "@/types/negotiation";
import type { ContractCard, CountedResource } from "@/types/cards";

export function getRemainingRequirements(
  contract: ContractCard,
  allocations: Allocation[]
): CountedResource[] {
  return subtract(contract.requirements, filterAlloc(allocations, "requirement"));
}

export function getRemainingRewards(
  contract: ContractCard,
  allocations: Allocation[]
): CountedResource[] {
  return subtract(contract.rewards, filterAlloc(allocations, "reward"));
}

export function getRemainingHazards(
  contract: ContractCard,
  allocations: Allocation[]
): number {
  const used = allocations
    .filter((a) => a.kind === "risk" && a.resourceType === "hazard")
    .reduce((sum, a) => sum + a.count, 0);
  return Math.max(0, contract.hazards - used);
}

export function isContractSatisfied(contract: ContractCard, allocations: Allocation[]): boolean {
  return getRemainingRequirements(contract, allocations).every((r) => r.count <= 0);
}

export function isDealReady(contract: ContractCard, allocations: Allocation[]): boolean {
  return (
    isContractSatisfied(contract, allocations) &&
    getRemainingRewards(contract, allocations).every((r) => r.count <= 0) &&
    getRemainingHazards(contract, allocations) === 0
  );
}

export function getSessionStatus(contract: ContractCard, tab: NegotiationTab): SessionStatus {
  if (!isContractSatisfied(contract, tab.allocations)) return "incomplete";
  if (isDealReady(contract, tab.allocations)) return "deal_ready";
  if (getRemainingRewards(contract, tab.allocations).some((r) => r.count > 0)) return "rewards_unresolved";
  if (getRemainingHazards(contract, tab.allocations) > 0) return "risk_unresolved";
  return "satisfied_only";
}

function filterAlloc(allocations: Allocation[], kind: Allocation["kind"]) {
  return allocations.filter((a) => a.kind === kind);
}

function subtract(base: CountedResource[], allocations: Allocation[]): CountedResource[] {
  return base.map((req) => {
    const used = allocations
      .filter((a) => a.resourceType === req.type)
      .reduce((sum, a) => sum + a.count, 0);
    return { type: req.type, count: Math.max(0, req.count - used) };
  });
}
