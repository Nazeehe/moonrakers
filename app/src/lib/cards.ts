import raw from "@/data/cards.json";
import type { Card, CardCategory, ContractCard } from "@/types/cards";

export const ALL_CARDS: Card[] = raw as unknown as Card[];

export function cardsByCategory(category: CardCategory): Card[] {
  return ALL_CARDS.filter((c) => c.category === category);
}

export function contracts(): ContractCard[] {
  return cardsByCategory("contract") as ContractCard[];
}

export function expansionsFor(category: CardCategory): string[] {
  const set = new Set<string>();
  for (const c of cardsByCategory(category)) {
    if (c.expansion) set.add(c.expansion);
  }
  return Array.from(set).sort();
}
