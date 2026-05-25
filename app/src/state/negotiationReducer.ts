import type {
  Allocation,
  NegotiationAction,
  NegotiationSession,
  NegotiationTab,
} from "@/types/negotiation";

const DEFAULT_TAB_NAMES = ["Offer A", "Offer B", "Offer C", "Offer D", "Offer E", "Offer F", "Offer G", "Offer H"];

function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nextTabName(existing: NegotiationTab[]): string {
  const used = new Set(existing.map((t) => t.name));
  for (const name of DEFAULT_TAB_NAMES) {
    if (!used.has(name)) return name;
  }
  return `Offer ${existing.length + 1}`;
}

function makeTab(name: string): NegotiationTab {
  return { id: uid("tab"), name, allocations: [], acceptedBy: [] };
}

export function createInitialSession(missionLeader: NegotiationSession["missionLeader"], contractId: string): NegotiationSession {
  const firstTab = makeTab("Offer A");
  return {
    id: uid("session"),
    missionLeader,
    contractId,
    tabs: [firstTab],
    activeTabId: firstTab.id,
    createdAt: Date.now(),
  };
}

export function negotiationReducer(
  state: NegotiationSession | null,
  action: NegotiationAction
): NegotiationSession | null {
  switch (action.type) {
    case "CREATE_SESSION":
      return createInitialSession(action.missionLeader, action.contractId);

    case "DISCARD_SESSION":
      return null;
  }

  if (!state) return state;

  switch (action.type) {
    case "ADD_TAB": {
      const tab = makeTab(nextTabName(state.tabs));
      return { ...state, tabs: [...state.tabs, tab], activeTabId: tab.id };
    }

    case "DUPLICATE_TAB": {
      const src = state.tabs.find((t) => t.id === action.tabId);
      if (!src) return state;
      const tab: NegotiationTab = {
        id: uid("tab"),
        name: `${src.name} (copy)`,
        allocations: src.allocations.map((a) => ({ ...a, id: uid("alloc") })),
        acceptedBy: [],
        notes: src.notes,
      };
      const idx = state.tabs.findIndex((t) => t.id === action.tabId);
      const tabs = [...state.tabs];
      tabs.splice(idx + 1, 0, tab);
      return { ...state, tabs, activeTabId: tab.id };
    }

    case "DELETE_TAB": {
      if (state.tabs.length <= 1) return state; // always keep at least one
      const tabs = state.tabs.filter((t) => t.id !== action.tabId);
      const activeTabId = state.activeTabId === action.tabId ? tabs[0].id : state.activeTabId;
      return { ...state, tabs, activeTabId };
    }

    case "SET_ACTIVE_TAB":
      return state.tabs.some((t) => t.id === action.tabId)
        ? { ...state, activeTabId: action.tabId }
        : state;

    case "RENAME_TAB":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.tabId ? { ...t, name: action.name.trim() || t.name } : t
        ),
      };

    case "ADD_ALLOCATION": {
      const allocation: Allocation = {
        id: action.allocation.id ?? uid("alloc"),
        kind: action.allocation.kind,
        resourceType: action.allocation.resourceType,
        count: action.allocation.count,
        playerId: action.allocation.playerId,
      };
      return mapActiveTab(state, (t) => ({ ...t, allocations: mergeAllocation(t.allocations, allocation) }));
    }

    case "UPDATE_ALLOCATION":
      return mapActiveTab(state, (t) => {
        const current = t.allocations.find((a) => a.id === action.allocationId);
        if (!current) return t;
        const next: Allocation = { ...current, ...action.patch };
        // If the change moves this allocation onto an existing chip
        // (same player/kind/resourceType), merge into that chip and drop this one.
        const sibling = t.allocations.find(
          (a) =>
            a.id !== current.id &&
            a.playerId === next.playerId &&
            a.kind === next.kind &&
            a.resourceType === next.resourceType
        );
        if (sibling) {
          return {
            ...t,
            allocations: t.allocations
              .filter((a) => a.id !== current.id)
              .map((a) => (a.id === sibling.id ? { ...a, count: a.count + next.count } : a))
              .filter((a) => a.count > 0),
          };
        }
        return {
          ...t,
          allocations: t.allocations
            .map((a) => (a.id === current.id ? next : a))
            .filter((a) => a.count > 0),
        };
      });

    case "SPLIT_ALLOCATION":
      return mapActiveTab(state, (t) => {
        const src = t.allocations.find((a) => a.id === action.allocationId);
        if (!src || action.moveCount <= 0 || action.moveCount > src.count) return t;
        const remaining = src.count - action.moveCount;
        let allocations =
          remaining > 0
            ? t.allocations.map((a) => (a.id === src.id ? { ...a, count: remaining } : a))
            : t.allocations.filter((a) => a.id !== src.id);
        const newAlloc: Allocation = {
          id: uid("alloc"),
          kind: src.kind,
          resourceType: src.resourceType,
          count: action.moveCount,
          playerId: action.toPlayerId,
        };
        allocations = mergeAllocation(allocations, newAlloc);
        return { ...t, allocations };
      });

    case "REMOVE_ALLOCATION":
      return mapActiveTab(state, (t) => ({
        ...t,
        allocations: t.allocations.filter((a) => a.id !== action.allocationId),
      }));

    case "TOGGLE_ACCEPTED":
      return {
        ...state,
        tabs: state.tabs.map((t) => {
          if (t.id !== action.tabId) return t;
          const has = t.acceptedBy.includes(action.playerId);
          return {
            ...t,
            acceptedBy: has
              ? t.acceptedBy.filter((id) => id !== action.playerId)
              : [...t.acceptedBy, action.playerId],
          };
        }),
      };

    default:
      return state;
  }
}

function mapActiveTab(
  state: NegotiationSession,
  fn: (tab: NegotiationTab) => NegotiationTab
): NegotiationSession {
  return {
    ...state,
    tabs: state.tabs.map((t) => (t.id === state.activeTabId ? fn(t) : t)),
  };
}

// Collapse adjacent allocations for the same {player, kind, resourceType} so
// the UI doesn't accumulate clutter — e.g. tapping "Damage x2" twice for the
// same player yields one Damage x4 chip, not two.
function mergeAllocation(existing: Allocation[], next: Allocation): Allocation[] {
  const match = existing.find(
    (a) =>
      a.playerId === next.playerId &&
      a.kind === next.kind &&
      a.resourceType === next.resourceType
  );
  if (match) {
    return existing.map((a) => (a.id === match.id ? { ...a, count: a.count + next.count } : a));
  }
  return [...existing, next];
}
