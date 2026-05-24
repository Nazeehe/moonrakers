import type { Card, ContractCard } from "@/types/cards";
import { RESOURCE_LABEL } from "@/types/cards";
import { ResourceIcon } from "@/components/Icons/ResourceIcon";

// Stylized fallback when we have no image — uses card metadata only.
export function PlaceholderCard({ card, large = false }: { card: Card; large?: boolean }) {
  const accent = accentFor(card);
  return (
    <div
      className={`relative w-full h-full rounded-md overflow-hidden border ${large ? "p-5" : "p-3"}`}
      style={{
        background: `linear-gradient(160deg, var(--color-mr-bg-deep) 0%, var(--color-mr-panel) 100%)`,
        borderColor: `color-mix(in oklab, ${accent} 50%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 18%, transparent)`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="mr-label" style={{ color: accent }}>{categoryLabel(card)}</span>
        {card.expansionName && (
          <span className="mr-label text-mr-text-muted">{card.expansionName}</span>
        )}
      </div>
      <div className={`mr-title leading-tight text-mr-text ${large ? "text-2xl" : "text-sm"} mb-2`}>
        {card.name}
      </div>

      {card.category === "contract" && <ContractBody card={card as ContractCard} large={large} />}

      {card.text && (
        <p className={`text-mr-text-muted ${large ? "text-sm" : "text-[10px]"} mt-2 line-clamp-${large ? "8" : "3"}`}>
          {card.text}
        </p>
      )}

      <div
        aria-hidden
        className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-30"
        style={{ background: accent }}
      />
    </div>
  );
}

function ContractBody({ card, large }: { card: ContractCard; large: boolean }) {
  return (
    <div className="space-y-2 mt-1">
      {card.contractType && (
        <div className="mr-label text-mr-text-muted">{card.contractType.toUpperCase()}</div>
      )}
      {card.requirements.length > 0 && (
        <ResourceRow label="REQ" items={card.requirements} large={large} />
      )}
      {card.rewards.length > 0 && (
        <ResourceRow label="REW" items={card.rewards} large={large} />
      )}
      {card.hazards > 0 && (
        <ResourceRow label="HAZ" items={[{ type: "hazard", count: card.hazards }]} large={large} />
      )}
    </div>
  );
}

function ResourceRow({
  label, items, large,
}: { label: string; items: { type: any; count: number }[]; large: boolean }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="mr-label w-8 shrink-0">{label}</span>
      {items.map((r, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 mr-panel-soft px-1.5 py-0.5 text-xs font-mono"
          title={RESOURCE_LABEL[r.type as keyof typeof RESOURCE_LABEL] ?? r.type}
        >
          <ResourceIcon type={r.type} size={large ? 16 : 12} />
          <span>{r.count}</span>
        </span>
      ))}
    </div>
  );
}

function accentFor(card: Card) {
  switch (card.category) {
    case "contract": return "var(--color-mr-cyan)";
    case "crew":     return "var(--color-mr-purple)";
    case "ship_part":return "var(--color-mr-gold)";
    case "action":   return "var(--color-mr-orange)";
    case "objective":return "var(--color-mr-green)";
    default:         return "var(--color-mr-text-muted)";
  }
}

function categoryLabel(card: Card) {
  if (card.category === "contract" && (card as ContractCard).contractType) {
    return `CONTRACT · ${(card as ContractCard).contractType!.toUpperCase()}`;
  }
  return card.category.replace("_", " ").toUpperCase();
}
