// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Achievement definitions for the enhancement system.
//          Keys match achievement_key in lg_enhancement_achievements.
// ============================================================

export interface AchievementDef {
  key: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
}

export const ENHANCEMENT_ACHIEVEMENTS: AchievementDef[] = [
  {
    key: 'first_enhance',
    name: 'First Enhancement',
    description: 'Complete your first enhancement',
    icon: '\u2728',
    tier: 'bronze',
  },
  {
    key: 'plus_5',
    name: 'Halfway There',
    description: 'Reach +5 on any item',
    icon: '\u2B50',
    tier: 'silver',
  },
  {
    key: 'plus_10',
    name: 'Maximum Power',
    description: 'Reach +10 on any item',
    icon: '\uD83D\uDCA5',
    tier: 'gold',
  },
  {
    key: 'survivor_3',
    name: 'Survivor',
    description: 'Survive 3 destroy rolls in a row',
    icon: '\uD83D\uDEE1\uFE0F',
    tier: 'silver',
  },
  {
    key: 'lucky_streak_5',
    name: 'Golden Touch',
    description: '5 consecutive successes',
    icon: '\uD83E\uDD1E',
    tier: 'gold',
  },
  {
    key: 'unlucky_streak_10',
    name: 'Unbreakable Will',
    description: '10 consecutive failures without giving up',
    icon: '\uD83E\uDDB4',
    tier: 'diamond',
  },
  {
    key: 'first_destroy',
    name: 'Heartbreak',
    description: 'Lose your first item to enhancement',
    icon: '\uD83D\uDC94',
    tier: 'bronze',
  },
  {
    key: 'destroy_legendary',
    name: 'Tragic Loss',
    description: 'Lose a Legendary or higher item',
    icon: '\uD83D\uDE2D',
    tier: 'gold',
  },
  {
    key: 'celestial_glow',
    name: 'Celestial Being',
    description: 'Reach Celestial glow tier on any item',
    icon: '\uD83C\uDF1F',
    tier: 'diamond',
  },
  {
    key: 'enhancement_master',
    name: 'Enhancement Master',
    description: 'Complete 100 enhancements total',
    icon: '\uD83D\uDC51',
    tier: 'diamond',
  },
]

export const ACHIEVEMENT_MAP = Object.fromEntries(
  ENHANCEMENT_ACHIEVEMENTS.map(a => [a.key, a])
) as Record<string, AchievementDef>

export const ACHIEVEMENT_TIER_COLORS: Record<AchievementDef['tier'], string> = {
  bronze: '#cd7f32',
  silver: '#c0d2f0',
  gold: '#ffd700',
  diamond: '#64c8ff',
}
