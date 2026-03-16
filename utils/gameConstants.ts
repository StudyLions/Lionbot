// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Game constants mirroring bot's gameplay.py values.
//          Single source of truth for the website. Update this
//          file when bot constants change.
// ============================================================

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Updated to match new drop system (materials removed, equipment/scrolls drop directly)
export const GAME_CONSTANTS = {
  LEVEL_PENALTY_FACTOR: 0.08,
  ENHANCEMENT_GOLD_BONUS: 0.02,
  ENHANCEMENT_XP_BONUS: 0.02,

  MAX_ENHANCEMENT_BY_RARITY: {
    COMMON: 5,
    UNCOMMON: 7,
    RARE: 10,
    EPIC: 12,
    LEGENDARY: 15,
    MYTHICAL: 20,
  } as Record<string, number>,

  ITEM_DROP_WEIGHTS: {
    COMMON: 45,
    UNCOMMON: 28,
    RARE: 15,
    EPIC: 7,
    LEGENDARY: 3.5,
    MYTHICAL: 0.5,
  } as Record<string, number>,

  ITEM_DROP_CHANCE_VOICE: 0.05,
  ITEM_DROP_CHANCE_TEXT: 0.03,
  ITEM_DROP_CHANCE_HARVEST: 0.15,

  SCROLL_DROP_RATIO: 0.6,
}
// --- END AI-MODIFIED ---

export function getOwnershipTier(count: number): string {
  if (count === 0) return "Undiscovered"
  if (count <= 2) return "Ultra Rare"
  if (count <= 10) return "Very Rare"
  if (count <= 25) return "Rare"
  if (count <= 50) return "Uncommon"
  if (count <= 100) return "Common"
  return "Widely Held"
}
