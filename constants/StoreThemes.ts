// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 Phase 2 -- catalog of personal-store
//          themes. Each theme owns the background, panel, accent,
//          text, font-family, and (optionally) an animation hook
//          for the sticky page background. Themes are tier-gated;
//          the free tier always gets `default`, premium tiers
//          unlock progressively richer aesthetics.
//
//          The four "premium" themes are ports of the design
//          mockups in pet-ui-mockups/ (Stardew, Pokemon GBA,
//          Earthbound, Gameboy Color), repackaged as data so the
//          StoreCanvas + customizer can render them without a
//          file-per-theme component.
//
//          Used by:
//            components/pet/store/StoreCanvas.tsx (rendering)
//            pages/pet/marketplace/store/customize.tsx (preview)
//            pages/api/pet/marketplace/store/me.ts (server-side
//                                                  field gating)
// ============================================================
import { LION_HEART_TIER_RANK, type LionHeartTier } from "@/utils/subscription"

export type StoreThemeId =
  | "default"
  | "stardew"
  | "pokemon"
  | "earthbound"
  | "gameboy"

export type StoreAnimationId =
  | "none"
  | "parallax-clouds"
  | "pulse"
  | "rainbow"

export interface ThemeFont {
  /** family used in font-family CSS. Always include a sane fallback. */
  family: string
  /** href to a Google Fonts stylesheet. Loaded lazily once per page. */
  googleFontHref?: string
}

export interface StoreTheme {
  id: StoreThemeId
  name: string
  description: string
  /** lowest tier required to use this theme. */
  minTier: LionHeartTier
  /** primary background CSS for the page wrapper (full-bleed). */
  pageBackground: string
  /** card/panel background for inner blocks (listings grid, header). */
  panelBackground: string
  /** border color/style for cards. */
  panelBorder: string
  /** text color for the body copy. */
  textColor: string
  /** dim text color for hints. */
  textDim: string
  /** accent color (used for store name, tier badge, speech bubble border). */
  accent: string
  /** font for headings + body. */
  font: ThemeFont
  /** preview swatch color, shown in the theme picker thumbnail. */
  previewSwatch: string
}

export interface StoreAnimation {
  id: StoreAnimationId
  name: string
  description: string
  minTier: LionHeartTier
}

// ----------------------------------------------------------------
// Theme catalog. Order is intentional: free first, then premium.
// ----------------------------------------------------------------

export const STORE_THEMES: Record<StoreThemeId, StoreTheme> = {
  default: {
    id: "default",
    name: "LionGotchi Classic",
    description: "The default dark-blue interface used everywhere else in the app.",
    minTier: "FREE",
    pageBackground: "linear-gradient(180deg, #02050d 0%, #0c1020 100%)",
    panelBackground: "#0c1020",
    panelBorder: "#2a3a5c",
    textColor: "#e2e8f0",
    textDim: "#8899aa",
    accent: "#f0c040",
    font: {
      family: "'Press Start 2P', system-ui, monospace",
    },
    previewSwatch: "#0c1020",
  },

  stardew: {
    id: "stardew",
    name: "Harvest Parchment",
    description:
      "Warm cream parchment, dark wood borders, soft hand-painted feel inspired by farm sims.",
    minTier: "LIONHEART",
    pageBackground:
      "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 60px), " +
      "repeating-linear-gradient(90deg, #4a2c14 0 2px, #6b4220 2px 240px, #4a2c14 240px 242px, #8b6033 242px 480px)",
    panelBackground: "#f8e8c0",
    panelBorder: "#4a2c14",
    textColor: "#3d2614",
    textDim: "#6b4f30",
    accent: "#e8b424",
    font: {
      family: "'Pixelify Sans', system-ui, monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;700&display=swap",
    },
    previewSwatch: "#f8e8c0",
  },

  pokemon: {
    id: "pokemon",
    name: "GBA Adventurer",
    description:
      "Off-white pages with bevelled red/gold accents, like a classic handheld JRPG menu.",
    minTier: "LIONHEART",
    pageBackground: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    panelBackground: "#f5f0e6",
    panelBorder: "#3a3a4a",
    textColor: "#1a1a2e",
    textDim: "#5a5a6a",
    accent: "#d92e2e",
    font: {
      family: "'Press Start 2P', monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
    },
    previewSwatch: "#f5f0e6",
  },

  earthbound: {
    id: "earthbound",
    name: "Psychedelic Trip",
    description:
      "Wild rainbow gradients, neon outlines, dotty patterns -- channels classic Mother / Earthbound vibes.",
    minTier: "LIONHEART_PLUS",
    pageBackground:
      "linear-gradient(135deg, #ff6b9d 0%, #ffd93d 25%, #6bcf7f 50%, #4dc4ff 75%, #c084fc 100%)",
    panelBackground: "rgba(10,10,10,0.85)",
    panelBorder: "#1a1a1a",
    textColor: "#f5f5f5",
    textDim: "#bababa",
    accent: "#ffd93d",
    font: {
      family: "'VT323', monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=Silkscreen&family=VT323&display=swap",
    },
    previewSwatch: "linear-gradient(135deg, #ff6b9d, #ffd93d, #6bcf7f, #4dc4ff, #c084fc)",
  },

  gameboy: {
    id: "gameboy",
    name: "DMG-99 Green",
    description:
      "Pure 4-shade Game Boy palette. Everything in shades of swamp green. Maximum nostalgia.",
    minTier: "LIONHEART_PLUS_PLUS",
    pageBackground:
      "repeating-linear-gradient(0deg, rgba(15,56,15,0.9) 0 2px, rgba(48,98,48,0.9) 2px 4px)",
    panelBackground: "#9bbc0f",
    panelBorder: "#0f380f",
    textColor: "#0f380f",
    textDim: "#306230",
    accent: "#306230",
    font: {
      family: "'Press Start 2P', monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
    },
    previewSwatch: "#9bbc0f",
  },
}

export const STORE_THEME_ORDER: StoreThemeId[] = [
  "default", "stardew", "pokemon", "earthbound", "gameboy",
]

// ----------------------------------------------------------------
// Background animations. Pure CSS keyframes wired up by StoreCanvas.
// ----------------------------------------------------------------

export const STORE_ANIMATIONS: Record<StoreAnimationId, StoreAnimation> = {
  none: {
    id: "none",
    name: "Still",
    description: "No movement. Quietest option.",
    minTier: "FREE",
  },
  "parallax-clouds": {
    id: "parallax-clouds",
    name: "Drifting Clouds",
    description: "Soft horizontal drift across the background. Subtle.",
    minTier: "LIONHEART",
  },
  pulse: {
    id: "pulse",
    name: "Heart Pulse",
    description: "Slow pulsing accent glow synced with the page.",
    minTier: "LIONHEART_PLUS",
  },
  rainbow: {
    id: "rainbow",
    name: "Aurora Wash",
    description: "Animated rainbow shift across the page background. Showy.",
    minTier: "LIONHEART_PLUS_PLUS",
  },
}

export const STORE_ANIMATION_ORDER: StoreAnimationId[] = [
  "none", "parallax-clouds", "pulse", "rainbow",
]

// ----------------------------------------------------------------
// Tier-gating helpers.
// ----------------------------------------------------------------

export function canUseTheme(tier: LionHeartTier, themeId: StoreThemeId): boolean {
  const theme = STORE_THEMES[themeId]
  if (!theme) return false
  return LION_HEART_TIER_RANK[tier] >= LION_HEART_TIER_RANK[theme.minTier]
}

export function canUseAnimation(tier: LionHeartTier, animId: StoreAnimationId): boolean {
  const anim = STORE_ANIMATIONS[animId]
  if (!anim) return false
  return LION_HEART_TIER_RANK[tier] >= LION_HEART_TIER_RANK[anim.minTier]
}

export function isValidThemeId(id: string): id is StoreThemeId {
  return id in STORE_THEMES
}

export function isValidAnimationId(id: string): id is StoreAnimationId {
  return id in STORE_ANIMATIONS
}

/**
 * Returns the theme to render. If the seller's saved theme is no longer
 * accessible at their current tier (e.g. they downgraded), gracefully
 * fall back to the default theme so we never render a broken page.
 */
export function resolveThemeForRender(
  themeId: string | null | undefined,
  sellerTier: LionHeartTier,
): StoreTheme {
  if (themeId && isValidThemeId(themeId) && canUseTheme(sellerTier, themeId)) {
    return STORE_THEMES[themeId]
  }
  return STORE_THEMES.default
}

export function resolveAnimationForRender(
  animId: string | null | undefined,
  sellerTier: LionHeartTier,
): StoreAnimation {
  if (animId && isValidAnimationId(animId) && canUseAnimation(sellerTier, animId)) {
    return STORE_ANIMATIONS[animId]
  }
  return STORE_ANIMATIONS.none
}

/**
 * Validates that an accent color override is a CSS hex color (#rgb, #rgba,
 * #rrggbb, or #rrggbbaa). Returns null if invalid so callers can fall back
 * to the theme accent.
 */
export function sanitizeAccentColor(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim().toLowerCase()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(trimmed)) {
    return null
  }
  return trimmed
}
