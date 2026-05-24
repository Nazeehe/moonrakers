import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ArrowRight, RotateCcw } from "lucide-react";
import Fuse from "fuse.js";

import { FACTIONS, type FactionId } from "@/data/factions";
import { contracts } from "@/lib/cards";
import { useNegotiationSession } from "@/state/useNegotiationSession";
import { CardTile } from "@/components/Armory/CardTile";
import { CardZoomModal } from "@/components/Armory/CardZoomModal";
import { PlaceholderCard } from "@/components/Armory/PlaceholderCard";
import { ResourceIcon } from "@/components/Icons/ResourceIcon";
import { CARD_ASPECT, RESOURCE_LABEL } from "@/types/cards";
import type { Card, ContractCard, ResourceType } from "@/types/cards";

const LEADER_KEY = "mr.dispatch.lastLeader.v1";

export function DispatchSetupPage() {
  const nav = useNavigate();
  const { session, dispatch } = useNegotiationSession();
  const allContracts = useMemo(() => contracts(), []);

  const [leader, setLeader] = useState<FactionId | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.localStorage.getItem(LEADER_KEY);
    return (saved as FactionId) ?? null;
  });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<Card | null>(null);

  useEffect(() => {
    if (leader) window.localStorage.setItem(LEADER_KEY, leader);
  }, [leader]);

  const fuse = useMemo(
    () =>
      new Fuse(allContracts, {
        keys: ["name", "contractType", "tags", "text", "expansionName", "requirements.type", "rewards.type"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [allContracts]
  );

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return allContracts.slice(0, 18);
    return fuse.search(trimmed).slice(0, 24).map((r) => r.item);
  }, [query, fuse, allContracts]);

  const selected = useMemo(
    () => allContracts.find((c) => c.id === selectedId) ?? null,
    [selectedId, allContracts]
  );

  const canBegin = !!leader && !!selected;

  function beginNegotiation() {
    if (!canBegin || !leader || !selected) return;
    dispatch({ type: "CREATE_SESSION", missionLeader: leader, contractId: selected.id });
    nav("/negotiation");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="mr-label hover:text-mr-cyan inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> HOME
        </Link>
        <span className="mr-label">// DISPATCH</span>
      </div>

      {session && (
        <div className="mr-panel p-3 sm:p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-mr-text-muted">
            <span className="mr-label text-mr-gold mr-2">// IN PROGRESS</span>
            A negotiation session is already open.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => nav("/negotiation")}
              className="mr-button px-3 py-1.5 text-xs"
            >
              Resume <ArrowRight className="inline w-3 h-3 ml-1" />
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "DISCARD_SESSION" })}
              className="mr-button px-3 py-1.5 text-xs"
              style={{ borderColor: "color-mix(in oklab, var(--color-mr-alert) 55%, transparent)" }}
              title="Discard the open session"
            >
              <RotateCcw className="inline w-3 h-3 mr-1" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Mission Leader */}
      <section className="mb-8">
        <h2 className="mr-title text-lg sm:text-xl mb-3">Select Mission Leader</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          {FACTIONS.map((f) => {
            const active = leader === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setLeader(f.id)}
                className={`mr-panel-soft p-3 flex flex-col items-center gap-2 transition-all ${
                  active ? "scale-[1.03]" : "hover:scale-[1.02]"
                }`}
                style={{
                  borderColor: active ? f.colorHex : `color-mix(in oklab, ${f.colorHex} 30%, transparent)`,
                  boxShadow: active ? `0 0 22px -4px ${f.colorHex}, inset 0 0 0 1px ${f.colorHex}` : undefined,
                }}
                aria-pressed={active}
              >
                <span
                  className="w-9 h-9 rounded-full border"
                  style={{
                    background: f.colorHex,
                    borderColor: f.colorHex,
                    boxShadow: `0 0 14px -2px ${f.colorHex}`,
                  }}
                />
                <span className="mr-title text-xs text-mr-text">{f.name}</span>
                <span className="mr-label text-[9px]">{f.tagline}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Find Contract */}
      <section className="mb-8">
        <h2 className="mr-title text-lg sm:text-xl mb-3">Find Contract</h2>

        <div className="mr-panel p-3 sm:p-4 mb-5 flex items-center gap-2">
          <Search className="w-4 h-4 text-mr-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search contract name, type, reward…"
            className="flex-1 bg-transparent outline-none text-mr-text placeholder-mr-text-muted/70 font-mono text-sm"
            aria-label="Search contracts"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="mr-label hover:text-mr-cyan">
              CLEAR
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="mr-panel p-8 text-center text-mr-text-muted text-sm">
            No contracts match that query.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {results.map((c) => (
              <ContractPickTile
                key={c.id}
                card={c}
                active={selectedId === c.id}
                onPick={() => setSelectedId(c.id)}
                onZoom={() => setZoom(c)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Selected Contract preview */}
      {selected && (
        <section className="mb-8">
          <h2 className="mr-title text-lg sm:text-xl mb-3">Selected Contract</h2>
          <div className="mr-panel p-4 sm:p-5 flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-56 shrink-0" style={{ aspectRatio: CARD_ASPECT[selected.category] }}>
              {selected.imageUrl ? (
                <img
                  src={selected.imageUrl}
                  alt={selected.name}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <PlaceholderCard card={selected} large />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="mr-label text-mr-cyan mb-1">
                CONTRACT · {selected.contractType?.toUpperCase() ?? "OTHER"}
              </div>
              <h3 className="mr-title text-2xl text-mr-text mb-3">{selected.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <SummaryBlock title="Requirements" items={selected.requirements} />
                <SummaryBlock title="Rewards" items={selected.rewards} />
                <SummaryBlock title="Hazards" items={selected.hazards ? [{ type: "hazard", count: selected.hazards }] : []} />
              </div>
              {selected.text && (
                <p className="mt-3 text-mr-text-muted text-sm italic">{selected.text}</p>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={beginNegotiation}
          disabled={!canBegin}
          className="mr-button px-8 py-3 text-base inline-flex items-center gap-2"
        >
          Begin Negotiation <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <CardZoomModal card={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}

function ContractPickTile({
  card, active, onPick, onZoom,
}: {
  card: ContractCard;
  active: boolean;
  onPick: () => void;
  onZoom: () => void;
}) {
  return (
    <div className="relative group">
      <CardTile card={card} onOpen={onPick} />
      {active && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-mr-cyan"
          style={{ boxShadow: "0 0 24px -4px var(--color-mr-cyan), inset 0 0 0 1px var(--color-mr-cyan)" }}
        />
      )}
      <button
        type="button"
        onClick={onZoom}
        className="absolute top-1 right-1 px-1.5 py-0.5 mr-label rounded
                   bg-mr-bg-deep/80 border border-mr-border/30 hover:text-mr-cyan hover:border-mr-cyan
                   opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
        aria-label={`Zoom ${card.name}`}
      >
        ZOOM
      </button>
    </div>
  );
}

function SummaryBlock({
  title, items,
}: { title: string; items: { type: ResourceType; count: number }[] }) {
  return (
    <div>
      <div className="mr-label mb-1">{title}</div>
      {items.length === 0 ? (
        <span className="text-mr-text-muted/60 text-xs">—</span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((r, i) => (
            <span key={i} className="inline-flex items-center gap-1 mr-panel-soft px-2 py-0.5 font-mono text-xs">
              <ResourceIcon type={r.type} size={14} />
              <span>{r.count}</span>
              <span className="text-mr-text-muted/80">{RESOURCE_LABEL[r.type]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
