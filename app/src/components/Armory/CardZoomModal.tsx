import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Card } from "@/types/cards";
import { CARD_ASPECT } from "@/types/cards";
import { PlaceholderCard } from "./PlaceholderCard";

type Props = {
  card: Card | null;
  onClose: () => void;
};

export function CardZoomModal({ card, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!card) return;
    setImgFailed(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [card, onClose]);

  if (!card) return null;

  const showImage = card.imageUrl && !imgFailed;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={card.name}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-mr-bg-deep/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-[fadeIn_120ms_ease]"
    >
      <button
        ref={closeRef}
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-md border border-mr-border/30 bg-mr-panel/60
                   text-mr-text hover:border-mr-cyan hover:text-mr-cyan grid place-items-center"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full"
      >
        <div className="rounded-xl overflow-hidden mr-panel"
             style={{ aspectRatio: CARD_ASPECT[card.category], boxShadow: "0 0 60px -10px rgba(88,199,232,0.4)" }}>
          {showImage ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <PlaceholderCard card={card} large />
          )}
        </div>

        <div className="mt-3 text-center">
          <div className="mr-title text-mr-text text-lg">{card.name}</div>
          {card.expansionName && <div className="mr-label">{card.expansionName}</div>}
        </div>
      </div>
    </div>
  );
}
