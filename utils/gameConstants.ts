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
  // --- AI-REPLACED (2026-03-22) ---
  // Reason: Linear penalty made scrolls unusable at high levels
  // What the new code does better: Diminishing-returns curve keeps rates challenging but doable
  // --- Original code (commented out for rollback) ---
  // LEVEL_PENALTY_FACTOR: 0.08,
  // --- End original code ---
  LEVEL_PENALTY_FLOOR: 0.30,
  LEVEL_DECAY_FACTOR: 0.12,
  // --- END AI-REPLACED ---
  ENHANCEMENT_GOLD_BONUS: 0.02,
  ENHANCEMENT_XP_BONUS: 0.02,
  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Drop rate bonus from enhancement + glow tier thresholds
  ENHANCEMENT_DROP_BONUS: 0.005,
  // --- END AI-MODIFIED ---

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

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Diminishing-returns level penalty for scroll enhancement success rates
export function calcLevelPenalty(level: number): number {
  const { LEVEL_PENALTY_FLOOR: floor, LEVEL_DECAY_FACTOR: decay } = GAME_CONSTANTS
  return floor + (1 - floor) / (1 + decay * level)
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Glow tier thresholds and calculation helpers (MapleStory-style scroll quality)
export type GlowTier = 'none' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'celestial'

const GLOW_TIERS: [number, GlowTier][] = [
  [6.0, 'celestial'],
  [4.0, 'diamond'],
  [2.5, 'gold'],
  [1.5, 'silver'],
  [0.01, 'bronze'],
]

export function calcGlowTier(enhancementLevel: number, totalBonus: number): GlowTier {
  if (enhancementLevel <= 0 || totalBonus <= 0) return 'none'
  const avg = totalBonus / enhancementLevel
  for (const [threshold, tier] of GLOW_TIERS) {
    if (avg >= threshold) return tier
  }
  return 'none'
}

export function calcGlowIntensity(enhancementLevel: number): number {
  if (enhancementLevel >= 13) return 3
  if (enhancementLevel >= 8) return 2
  if (enhancementLevel >= 4) return 1
  return 0
}

export const GLOW_COLORS: Record<GlowTier, string> = {
  none: 'transparent',
  bronze: 'rgba(205, 127, 50, 0.7)',
  silver: 'rgba(192, 210, 240, 0.8)',
  gold: 'rgba(255, 215, 0, 0.9)',
  diamond: 'rgba(100, 200, 255, 0.9)',
  celestial: 'rgba(200, 100, 255, 0.9)',
}

export const GLOW_LABELS: Record<GlowTier, string> = {
  none: '',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  diamond: 'Diamond',
  celestial: 'Celestial',
}

export const GLOW_TEXT_COLORS: Record<GlowTier, string> = {
  none: '',
  bronze: 'text-amber-500',
  silver: 'text-slate-300',
  gold: 'text-yellow-400',
  diamond: 'text-cyan-300',
  celestial: 'text-purple-400',
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
