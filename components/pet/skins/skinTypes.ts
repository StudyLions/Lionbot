// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Shared types and constants for the skins gallery
// ============================================================

export interface SkinData {
  skinId: number
  theme: string
  color: string
  assetPath: string
  unlockType: string
  unlockLevel: number | null
  goldPrice: number | null
  gemPrice: number | null
  owned: boolean
  eligible: boolean
  active: boolean
}

export interface SkinsPageData {
  hasPet: boolean
  skins: SkinData[]
  themes: string[]
  activeSkinId: number | null
  petLevel: number
  gold: string
  gems: number
}

export const UNLOCK_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  FREE: { label: "FREE", color: "#40d870", bg: "#40d870" },
  GOLD: { label: "GOLD", color: "#f0c040", bg: "#f0c040" },
  GEMS: { label: "GEMS", color: "#d060f0", bg: "#d060f0" },
  LEVEL: { label: "LEVEL", color: "#4080f0", bg: "#4080f0" },
}

const THEME_DISPLAY: Record<string, string> = {
  basic: "Basic",
  candy: "Candy",
  fire_free: "Fire",
  flowers_free: "Flowers",
  hearts: "Hearts",
  leaves: "Leaves",
  fire: "Fire (Premium)",
  fish_n_flower: "Fish & Flower",
  flat: "Basic",
  flower: "Flower",
  japan_flowers: "Japan Flowers",
  japan_pattern: "Japan Pattern",
  love: "Love",
  wave: "Wave",
}

export function formatThemeName(theme: string): string {
  return THEME_DISPLAY[theme] ?? theme.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatSkinLabel(theme: string, color: string): string {
  return `${formatThemeName(theme)} ${color.replace(/\b\w/g, (c) => c.toUpperCase())}`
}

/** "flat" and "basic" are the same visual theme -- merge them under "basic" */
export function getDisplayTheme(theme: string): string {
  return theme === "flat" ? "basic" : theme
}

export type UnlockFilter = "ALL" | "FREE" | "GOLD" | "GEMS" | "LEVEL"
export type OwnedFilter = "ALL" | "OWNED" | "UNOWNED"

export interface ThemeGroup {
  displayTheme: string
  skins: SkinData[]
}

export function groupSkinsByTheme(skins: SkinData[], themes: string[]): ThemeGroup[] {
  const groups = new Map<string, SkinData[]>()

  for (const theme of themes) {
    const dt = getDisplayTheme(theme)
    if (!groups.has(dt)) groups.set(dt, [])
  }
  for (const skin of skins) {
    const dt = getDisplayTheme(skin.theme)
    const arr = groups.get(dt)
    if (arr) arr.push(skin)
    else groups.set(dt, [skin])
  }

  return Array.from(groups.entries())
    .map(([displayTheme, skins]) => ({ displayTheme, skins }))
    .sort((a, b) => {
      const aFree = a.skins.every((s) => s.unlockType === "FREE")
      const bFree = b.skins.every((s) => s.unlockType === "FREE")
      if (aFree && !bFree) return -1
      if (!aFree && bFree) return 1
      return a.displayTheme.localeCompare(b.displayTheme)
    })
}
