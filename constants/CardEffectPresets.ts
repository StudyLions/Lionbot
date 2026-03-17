// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Curated color presets for LionHeart animated card
//          effects (sparkles, avatar ring). Validated server-side
//          to prevent arbitrary color injection.
// ============================================================

export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  category: "warm" | "cool" | "neutral" | "vibrant";
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: "royal_gold",  name: "Royal Gold",  hex: "#FFD700", category: "warm" },
  { id: "rose",        name: "Rose",        hex: "#FF69B4", category: "warm" },
  { id: "crimson",     name: "Crimson",     hex: "#DC2626", category: "warm" },
  { id: "sunset",      name: "Sunset",      hex: "#F97316", category: "warm" },
  { id: "amber",       name: "Amber",       hex: "#F59E0B", category: "warm" },
  { id: "ice_blue",    name: "Ice Blue",    hex: "#5B8DEF", category: "cool" },
  { id: "arctic",      name: "Arctic",      hex: "#38BDF8", category: "cool" },
  { id: "emerald",     name: "Emerald",     hex: "#50C878", category: "cool" },
  { id: "mint",        name: "Mint",        hex: "#34D399", category: "cool" },
  { id: "violet",      name: "Violet",      hex: "#8B5CF6", category: "vibrant" },
  { id: "lavender",    name: "Lavender",    hex: "#A78BFA", category: "vibrant" },
  { id: "sakura",      name: "Sakura",      hex: "#F9A8D4", category: "vibrant" },
  { id: "neon_green",  name: "Neon Green",  hex: "#4ADE80", category: "vibrant" },
  { id: "silver",      name: "Silver",      hex: "#94A3B8", category: "neutral" },
];

export const PRESET_HEX_SET = new Set(COLOR_PRESETS.map((p) => p.hex));

export function isValidPresetColor(hex: string | null | undefined): boolean {
  if (!hex) return true;
  return PRESET_HEX_SET.has(hex);
}

export const DEFAULT_PRESET_ID = "default";
