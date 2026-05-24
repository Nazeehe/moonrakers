export type CardCategory = "contract" | "crew" | "ship_part" | "action" | "objective";

export type ResourceType =
  | "damage"
  | "reactor"
  | "thruster"
  | "shield"
  | "crew"
  | "prestige"
  | "credit"
  | "bonus_card"
  | "hazard"
  | "binding_ties"
  | "moon"
  | "flex";

export type CountedResource = {
  type: ResourceType;
  count: number;
};

export type CardBase = {
  id: string;
  name: string;
  category: CardCategory;
  imageUrl?: string;
  expansion?: string;
  expansionName?: string;
  tags?: string[];
  text?: string;
};

export type ContractCard = CardBase & {
  category: "contract";
  contractType?: "delivery" | "explore" | "kill" | "rescue" | "unstable" | "other" | string;
  requirements: CountedResource[];
  rewards: CountedResource[];
  hazards: number;
};

export type CrewCard = CardBase & {
  category: "crew";
  role?: string;
  crewType?: string;
  cost?: number;
};

export type ShipPartCard = CardBase & {
  category: "ship_part";
  brand?: string;
  cardSlots?: string[];
  cost?: number;
};

export type ObjectiveCard = CardBase & {
  category: "objective";
  color?: string;
};

export type ActionCard = CardBase & { category: "action" };

export type Card = ContractCard | CrewCard | ShipPartCard | ObjectiveCard | ActionCard;

export const CATEGORY_LABEL: Record<CardCategory, string> = {
  contract: "Contracts",
  crew: "Crew",
  ship_part: "Ship Parts",
  action: "Action Cards",
  objective: "Objectives",
};

export const CATEGORY_SUBTITLE: Record<CardCategory, string> = {
  contract: "mission list",
  crew: "personnel",
  ship_part: "upgrades",
  action: "loadout",
  objective: "vault",
};

export const RESOURCE_LABEL: Record<ResourceType, string> = {
  damage: "Damage",
  reactor: "Reactor",
  thruster: "Thruster",
  shield: "Shield",
  crew: "Crew",
  prestige: "Prestige",
  credit: "Credits",
  bonus_card: "Bonus Card",
  hazard: "Hazard",
  binding_ties: "Binding Ties",
  moon: "Moon",
  flex: "Flex",
};

export const CARD_ASPECT: Record<CardCategory, string> = {
  contract:  "5 / 7",
  crew:      "5 / 7",
  action:    "5 / 7",
  ship_part: "1 / 1",
  objective: "1 / 1",
};

export const RESOURCE_COLOR: Record<ResourceType, string> = {
  damage: "var(--color-mr-orange)",
  reactor: "var(--color-mr-cyan)",
  thruster: "var(--color-faction-komek)",
  shield: "var(--color-mr-green)",
  crew: "var(--color-mr-purple)",
  prestige: "var(--color-mr-gold)",
  credit: "var(--color-mr-gold)",
  bonus_card: "var(--color-mr-text)",
  hazard: "var(--color-mr-alert)",
  binding_ties: "var(--color-mr-purple)",
  moon: "var(--color-mr-text-muted)",
  flex: "var(--color-mr-text-muted)",
};
