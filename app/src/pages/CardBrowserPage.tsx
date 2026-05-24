import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import Fuse from "fuse.js";

import type { Card, CardCategory } from "@/types/cards";
import { CATEGORY_LABEL } from "@/types/cards";
import { cardsByCategory, expansionsFor } from "@/lib/cards";

import { CardTile } from "@/components/Armory/CardTile";
import { CardZoomModal } from "@/components/Armory/CardZoomModal";

const VALID: CardCategory[] = ["contract", "crew", "ship_part", "action", "objective"];

const SEARCH_KEYS: Record<CardCategory, string[]> = {
  contract:  ["name", "contractType", "tags", "text", "expansionName", "requirements.type", "rewards.type"],
  crew:      ["name", "role", "crewType", "text", "tags", "expansionName"],
  ship_part: ["name", "brand", "text", "tags", "cardSlots", "expansionName"],
  action:    ["name", "tags", "expansionName"],
  objective: ["name", "color", "text", "tags", "expansionName"],
};

export function CardBrowserPage() {
  const { category } = useParams<{ category: string }>();
  if (!category || !VALID.includes(category as CardCategory)) {
    return <Navigate to="/armory" replace />;
  }
  const cat = category as CardCategory;

  const all = useMemo(() => cardsByCategory(cat), [cat]);
  const expansions = useMemo(() => expansionsFor(cat), [cat]);

  const [query, setQuery] = useState("");
  const [expansion, setExpansion] = useState<string>("all");
  const [zoom, setZoom] = useState<Card | null>(null);

  const fuse = useMemo(
    () => new Fuse(all, { keys: SEARCH_KEYS[cat], threshold: 0.35, ignoreLocation: true }),
    [all, cat]
  );

  const results = useMemo(() => {
    let list = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : all;
    if (expansion !== "all") list = list.filter((c) => c.expansion === expansion);
    return list;
  }, [query, expansion, fuse, all]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-4">
        <Link to="/armory" className="mr-label hover:text-mr-cyan inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> ARMORY
        </Link>
        <span className="mr-label">// {CATEGORY_LABEL[cat].toUpperCase()}</span>
      </div>

      <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
        <h1 className="mr-title text-2xl sm:text-4xl">{CATEGORY_LABEL[cat]}</h1>
        <div className="mr-label">
          {results.length}<span className="text-mr-text-muted/60"> / {all.length}</span> RESULTS
        </div>
      </div>

      {/* Search + expansion filter */}
      <div className="mr-panel p-3 sm:p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 mr-panel-soft px-3 py-2">
          <Search className="w-4 h-4 text-mr-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholderFor(cat)}
            className="flex-1 bg-transparent outline-none text-mr-text placeholder-mr-text-muted/70 font-mono text-sm"
            aria-label="Search cards"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mr-label hover:text-mr-cyan"
            >
              CLEAR
            </button>
          )}
        </div>

        {expansions.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1">
            <FilterChip active={expansion === "all"} onClick={() => setExpansion("all")}>
              ALL
            </FilterChip>
            {expansions.map((e) => (
              <FilterChip key={e} active={expansion === e} onClick={() => setExpansion(e)}>
                {e.replace(/_/g, " ").toUpperCase()}
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mr-panel p-10 text-center">
          <div className="mr-label text-mr-alert mb-2">// NO MATCHES</div>
          <p className="text-mr-text-muted text-sm">
            Try a different search or clear the expansion filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {results.map((c) => (
            <CardTile key={c.id} card={c} onOpen={setZoom} />
          ))}
        </div>
      )}

      <CardZoomModal card={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}

function FilterChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md font-mono uppercase tracking-widest text-[10px] border whitespace-nowrap transition-colors ${
        active
          ? "border-mr-cyan/70 text-mr-cyan bg-mr-cyan/10"
          : "border-mr-border/15 text-mr-text-muted hover:text-mr-text hover:border-mr-border/35"
      }`}
    >
      {children}
    </button>
  );
}

function placeholderFor(cat: CardCategory): string {
  switch (cat) {
    case "contract":  return "search by name, type, reward…";
    case "crew":      return "search by name, role, ability…";
    case "ship_part": return "search by name, brand, ability…";
    case "action":    return "search action cards…";
    case "objective": return "search by name, color, description…";
  }
}
