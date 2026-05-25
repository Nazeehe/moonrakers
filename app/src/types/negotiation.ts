import type { FactionId } from "@/data/factions";
import type { ResourceType } from "@/types/cards";

export type AllocationKind = "requirement" | "reward" | "risk";

export type Allocation = {
  id: string;
  kind: AllocationKind;
  resourceType: ResourceType;
  count: number;
  playerId: FactionId;
};

export type NegotiationTab = {
  id: string;
  name: string;
  allocations: Allocation[];
  acceptedBy: FactionId[];
  notes?: string;
};

export type NegotiationSession = {
  id: string;
  missionLeader: FactionId;
  contractId: string;
  tabs: NegotiationTab[];
  activeTabId: string;
  createdAt: number;
};

export type NegotiationAction =
  | { type: "CREATE_SESSION"; missionLeader: FactionId; contractId: string }
  | { type: "DISCARD_SESSION" }
  | { type: "ADD_TAB" }
  | { type: "DUPLICATE_TAB"; tabId: string }
  | { type: "DELETE_TAB"; tabId: string }
  | { type: "SET_ACTIVE_TAB"; tabId: string }
  | { type: "RENAME_TAB"; tabId: string; name: string }
  | { type: "ADD_ALLOCATION"; allocation: Omit<Allocation, "id"> & { id?: string } }
  | { type: "UPDATE_ALLOCATION"; allocationId: string; patch: Partial<Omit<Allocation, "id">> }
  | { type: "SPLIT_ALLOCATION"; allocationId: string; moveCount: number; toPlayerId: FactionId }
  | { type: "REMOVE_ALLOCATION"; allocationId: string }
  | { type: "TOGGLE_ACCEPTED"; tabId: string; playerId: FactionId };

export type SessionStatus =
  | "incomplete"
  | "satisfied_only"        // requirements met, rewards/hazards still unresolved
  | "rewards_unresolved"
  | "risk_unresolved"
  | "deal_ready";
