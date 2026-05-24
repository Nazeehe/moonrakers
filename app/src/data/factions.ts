export type FactionId = "sorelia" | "komek" | "ventus" | "magnomi" | "henko";

export type Faction = {
  id: FactionId;
  name: string;
  colorHex: string;
  cssVar: string;
  tagline: string;
};

export const FACTIONS: Faction[] = [
  { id: "sorelia", name: "Sorelia", colorHex: "#62C7E6", cssVar: "var(--color-faction-sorelia)", tagline: "Reactor Cartel" },
  { id: "komek",   name: "Komek",   colorHex: "#F1C94B", cssVar: "var(--color-faction-komek)",   tagline: "Thruster Syndicate" },
  { id: "ventus",  name: "Ventus",  colorHex: "#E89042", cssVar: "var(--color-faction-ventus)",  tagline: "Wildcatters" },
  { id: "magnomi", name: "Magnomi", colorHex: "#B987C9", cssVar: "var(--color-faction-magnomi)", tagline: "Munitions Guild" },
  { id: "henko",   name: "Henko",   colorHex: "#8CCB6A", cssVar: "var(--color-faction-henko)",   tagline: "Shield Concord" },
];

export const FACTION_BY_ID: Record<FactionId, Faction> =
  FACTIONS.reduce((acc, f) => ({ ...acc, [f.id]: f }), {} as Record<FactionId, Faction>);
