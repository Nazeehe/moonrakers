import type { ResourceType } from "@/types/cards";
import { RESOURCE_COLOR, RESOURCE_LABEL } from "@/types/cards";

type Props = {
  type: ResourceType;
  size?: number;
  className?: string;
  title?: string;
};

// Hand-rolled SVG glyphs so we don't ship official art. Each is on a 24-unit canvas.
function Glyph({ type }: { type: ResourceType }) {
  switch (type) {
    case "damage":
      return (
        <path d="M12 2 L14 9 L21 10 L15.5 14.5 L17 21 L12 17.5 L7 21 L8.5 14.5 L3 10 L10 9 Z" />
      );
    case "reactor":
      return <path d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z" />;
    case "thruster":
      return (
        <>
          <path d="M12 3 C15 7 16 11 16 14 L12 18 L8 14 C8 11 9 7 12 3 Z" />
          <path d="M10 18 L8 22 M14 18 L16 22 M12 18 L12 22" strokeWidth="1.5" />
        </>
      );
    case "shield":
      return <path d="M12 2 L20 5 V12 C20 17 16 21 12 22 C8 21 4 17 4 12 V5 Z" />;
    case "crew":
      return (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 22 C5 16 8 14 12 14 C16 14 19 16 19 22 Z" />
        </>
      );
    case "prestige":
      return (
        <>
          <circle cx="12" cy="9" r="5" />
          <path d="M9 13 L8 22 L12 19 L16 22 L15 13" />
        </>
      );
    case "credit":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 6 V18 M8 9 H15 C16 9 17 10 17 11 C17 12 16 13 15 13 H9 C8 13 7 14 7 15 C7 16 8 17 9 17 H16" strokeWidth="1.5" fill="none" />
        </>
      );
    case "bonus_card":
      return (
        <>
          <rect x="6" y="4" width="11" height="15" rx="1.5" />
          <rect x="9" y="7" width="11" height="15" rx="1.5" opacity="0.5" />
        </>
      );
    case "hazard":
      return (
        <>
          <path d="M12 3 L22 21 H2 Z" />
          <path d="M12 10 V15 M12 17 V18.5" strokeWidth="2" stroke="black" fill="none" />
        </>
      );
    case "binding_ties":
      return (
        <>
          <circle cx="9" cy="12" r="4" fill="none" strokeWidth="2" />
          <circle cx="15" cy="12" r="4" fill="none" strokeWidth="2" />
        </>
      );
    case "moon":
      return <path d="M16 4 A8 8 0 1 0 16 20 A6 6 0 1 1 16 4 Z" />;
    case "flex":
      return (
        <>
          <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2" />
          <path d="M8 12 H16 M12 8 V16" strokeWidth="2" />
        </>
      );
    default:
      return <circle cx="12" cy="12" r="6" />;
  }
}

export function ResourceIcon({ type, size = 18, className, title }: Props) {
  const color = RESOURCE_COLOR[type];
  const stroke = type === "binding_ties" || type === "flex" ? color : "transparent";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label={title ?? RESOURCE_LABEL[type]}
      fill={color}
      stroke={stroke}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <title>{title ?? RESOURCE_LABEL[type]}</title>
      <Glyph type={type} />
    </svg>
  );
}
