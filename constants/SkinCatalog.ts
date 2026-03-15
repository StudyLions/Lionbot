// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Single source of truth for skin metadata, prices,
//          and accent colors. Used by shop UI and purchase API.
// ============================================================

export interface SkinDef {
  id: string
  name: string
  price: number
  description: string
  colors: string[]
}

export const SKIN_CATALOG: SkinDef[] = [
  {
    id: "original",
    name: "Default",
    price: 0,
    description: "The classic LionBot look. Made by Kate Estrabo.",
    colors: ["#5865f2", "#2b2d31"],
  },
  {
    id: "obsidian",
    name: "Obsidian",
    price: 1500,
    description: "Dark and mysterious. Made by Kate Estrabo.",
    colors: ["#9A9FCD", "#B3B6C6", "#414A9F", "#95A9D0"],
  },
  {
    id: "platinum",
    name: "Platinum",
    price: 750,
    description: "Sleek metallic elegance. Made by Kate Estrabo.",
    colors: ["#8685ef", "#9545ff", "#b9b9ba", "#6d6eb6"],
  },
  {
    id: "boston_blue",
    name: "Boston Blue",
    price: 750,
    description: "Cool ocean vibes. Made by Kate Estrabo.",
    colors: ["#1E9AC4", "#E97BC1", "#2276A0", "#CCA7D0"],
  },
  {
    id: "cotton_candy",
    name: "Cotton Candy",
    price: 1500,
    description: "Sweet pastel colors. Made by Kate Estrabo.",
    colors: ["#ffe894", "#7191e2", "#f8e1e7", "#ffffff"],
  },
  {
    id: "blue_bayoux",
    name: "Blue Bayoux",
    price: 1500,
    description: "Deep twilight tones. Made by Kate Estrabo.",
    colors: ["#B79AE2", "#867F93", "#6671D3", "#ffffff"],
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    price: 1500,
    description: "Bold and playful pink. Made by Kate Estrabo.",
    colors: ["#FF3589", "#99D3EE", "#FFF2D4", "#FFF2D4"],
  },
]

export const SKIN_MAP = new Map(SKIN_CATALOG.map((s) => [s.id, s]))
export const SKIN_PRICES: Record<string, number> = Object.fromEntries(
  SKIN_CATALOG.filter((s) => s.price > 0).map((s) => [s.id, s.price])
)
