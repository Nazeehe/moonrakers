import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { NegotiationAction, NegotiationSession } from "@/types/negotiation";
import { negotiationReducer } from "./negotiationReducer";

const STORAGE_KEY = "mr.dispatch.session.v1";

function load(): NegotiationSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.id) return null;
    return parsed as NegotiationSession;
  } catch {
    return null;
  }
}

function save(session: NegotiationSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // quota or privacy mode — best-effort
  }
}

export function useNegotiationSession() {
  const [session, dispatch] = useReducer(negotiationReducer, null, load);

  // Persist on every change after first render.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    save(session);
  }, [session]);

  const activeTab = useMemo(
    () => session?.tabs.find((t) => t.id === session.activeTabId) ?? null,
    [session]
  );

  const safeDispatch = useCallback((action: NegotiationAction) => dispatch(action), []);

  return { session, activeTab, dispatch: safeDispatch };
}

export function readPersistedSession(): NegotiationSession | null {
  return load();
}
