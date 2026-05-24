import { useState } from "react";
import type { Card } from "@/types/cards";
import { CARD_ASPECT } from "@/types/cards";
import { PlaceholderCard } from "./PlaceholderCard";

type Props = {
  card: Card;
  onOpen: (card: Card) => void;
};

export function CardTile({ card, onOpen }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = card.imageUrl && !imgFailed;

  return (
    <button
      type="button"
      onClick={() => onOpen(card)}
      style={{ aspectRatio: CARD_ASPECT[card.category] }}
      className="group relative rounded-md overflow-hidden mr-panel-soft text-left
                 hover:scale-[1.02] hover:shadow-[0_0_24px_-6px_rgba(88,199,232,0.45)]
                 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mr-cyan"
      aria-label={`Open ${card.name}`}
    >
      {showImage ? (
        <img
          src={card.imageUrl}
          alt={card.name}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <PlaceholderCard card={card} />
      )}

      {/* Name strip — always visible, even with image, on hover */}
      {showImage && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-mr-bg-deep/95 via-mr-bg-deep/60 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity p-2">
          <div className="mr-title text-xs text-mr-text leading-tight line-clamp-2">{card.name}</div>
          {card.expansionName && (
            <div className="mr-label text-[9px] mt-0.5">{card.expansionName}</div>
          )}
        </div>
      )}
    </button>
  );
}
