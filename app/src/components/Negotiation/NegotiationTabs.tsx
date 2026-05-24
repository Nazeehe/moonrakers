import { useState } from "react";
import { Plus, Copy, X, Pencil } from "lucide-react";
import type { NegotiationSession, NegotiationAction } from "@/types/negotiation";

type Props = {
  session: NegotiationSession;
  dispatch: (a: NegotiationAction) => void;
};

export function NegotiationTabs({ session, dispatch }: Props) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function commitRename(id: string) {
    if (draft.trim()) dispatch({ type: "RENAME_TAB", tabId: id, name: draft.trim() });
    setRenamingId(null);
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 py-1">
      {session.tabs.map((t) => {
        const active = t.id === session.activeTabId;
        const renaming = renamingId === t.id;
        return (
          <div
            key={t.id}
            className={`group inline-flex items-center gap-1 px-2 py-1 rounded-md border whitespace-nowrap font-mono text-xs uppercase tracking-widest transition-colors ${
              active
                ? "border-mr-cyan/70 text-mr-cyan bg-mr-cyan/10"
                : "border-mr-border/15 text-mr-text-muted hover:text-mr-text hover:border-mr-border/35"
            }`}
          >
            {renaming ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => commitRename(t.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(t.id);
                  if (e.key === "Escape") setRenamingId(null);
                }}
                className="bg-transparent outline-none w-24 text-mr-text"
              />
            ) : (
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_ACTIVE_TAB", tabId: t.id })}
                onDoubleClick={() => { setDraft(t.name); setRenamingId(t.id); }}
                className="px-1"
                title="Click to switch · double-click to rename"
              >
                {t.name}
              </button>
            )}

            <button
              type="button"
              onClick={() => { setDraft(t.name); setRenamingId(t.id); }}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
              title="Rename"
              aria-label={`Rename ${t.name}`}
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "DUPLICATE_TAB", tabId: t.id })}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
              title="Duplicate"
              aria-label={`Duplicate ${t.name}`}
            >
              <Copy className="w-3 h-3" />
            </button>
            {session.tabs.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete ${t.name}?`)) dispatch({ type: "DELETE_TAB", tabId: t.id });
                }}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:!text-mr-alert transition-opacity"
                title="Delete"
                aria-label={`Delete ${t.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => dispatch({ type: "ADD_TAB" })}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-mr-border/25 text-mr-text-muted hover:text-mr-cyan hover:border-mr-cyan font-mono text-xs uppercase tracking-widest"
        title="New offer tab"
      >
        <Plus className="w-3 h-3" /> Tab
      </button>
    </div>
  );
}
