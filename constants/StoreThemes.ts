// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Updated: 2026-04-30 -- expanded catalog from 5 to 15 themes
//                       (5 LionHeart, 5 LionHeart+, 4 LionHeart++)
// Purpose: Marketplace 2.0 Phase 2 -- catalog of personal-store
//          themes. Each theme owns the background, panel, accent,
//          text, font-family, and (optionally) an animation hook
//          for the sticky page background. Themes are tier-gated;
//          the free tier always gets `default`, premium tiers
//          unlock progressively richer aesthetics.
//
//          The original 4 "premium" themes are ports of the
//          mockups in pet-ui-mockups/ (Stardew, Pokemon GBA,
//          Earthbound, Gameboy Color). The 10 newer themes are
//          custom-designed (sakura, library, mint, synthwave,
//          cosmic, cottage, cyberpunk, lava, aurora, royal) and
//          shipped as pure CSS data so StoreCanvas + customizer
//          can render them without a file-per-theme component.
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
  | "sakura"
  | "library"
  | "mint"
  | "earthbound"
  | "synthwave"
  | "cosmic"
  | "cottage"
  | "cyberpunk"
  | "gameboy"
  | "lava"
  | "aurora"
  | "royal"

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

  sakura: {
    id: "sakura",
    name: "Cherry Blossom",
    description:
      "Soft pink petals over a warm cream parchment. A gentle, springtime garden vibe.",
    minTier: "LIONHEART",
    pageBackground:
      "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.55) 0 6px, transparent 7px) 0 0/180px 220px, " +
      "radial-gradient(circle at 72% 64%, rgba(255,255,255,0.55) 0 5px, transparent 6px) 60px 80px/220px 260px, " +
      "linear-gradient(180deg, #ffd9e2 0%, #ffeef2 55%, #fff5ed 100%)",
    panelBackground: "#fff1f5",
    panelBorder: "#a04060",
    textColor: "#3a1f2c",
    textDim: "#7a5060",
    accent: "#d04880",
    font: {
      family: "'Pixelify Sans', system-ui, monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;700&display=swap",
    },
    previewSwatch: "linear-gradient(135deg, #ffd9e2, #ffeef2, #fff5ed)",
  },

  library: {
    id: "library",
    name: "Scholar's Library",
    description:
      "Sepia parchment, leather spines, and brass trim. Smells faintly of pipe tobacco and old paper.",
    minTier: "LIONHEART",
    pageBackground:
      "repeating-linear-gradient(90deg, #2d1808 0 4px, #4a2814 4px 6px, #2d1808 6px 200px), " +
      "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 30%)",
    panelBackground: "#f4eadc",
    panelBorder: "#5c3a1d",
    textColor: "#2d1808",
    textDim: "#7a5230",
    accent: "#b89438",
    font: {
      family: "'VT323', monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=VT323&display=swap",
    },
    previewSwatch: "#f4eadc",
  },

  mint: {
    id: "mint",
    name: "Mint & Cocoa",
    description:
      "Cool mint cream over warm cocoa wood. Like a chocolate-mint bar wrapped in pixel art.",
    minTier: "LIONHEART",
    pageBackground:
      "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 80px), " +
      "linear-gradient(180deg, #3a201a 0%, #5a3024 100%)",
    panelBackground: "#e3f0e0",
    panelBorder: "#3a201a",
    textColor: "#2a1610",
    textDim: "#6a4030",
    accent: "#4cc090",
    font: {
      family: "'Pixelify Sans', system-ui, monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;700&display=swap",
    },
    previewSwatch: "linear-gradient(135deg, #e3f0e0, #4cc090, #3a201a)",
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

  synthwave: {
    id: "synthwave",
    name: "Synthwave Sunset",
    description:
      "Hot pink and cyan over a vapor-grid horizon. Equal parts arcade and 80s mall.",
    minTier: "LIONHEART_PLUS",
    pageBackground:
      "linear-gradient(180deg, #1a0030 0%, #4a0a5a 28%, #ff2d92 55%, #ff7e36 78%, #ffd060 100%), " +
      "repeating-linear-gradient(180deg, rgba(0,240,255,0.18) 0 1px, transparent 1px 24px)",
    panelBackground: "#0a0418",
    panelBorder: "#ff2d92",
    textColor: "#ddf6ff",
    textDim: "#8090b0",
    accent: "#ff2d92",
    font: {
      family: "'VT323', monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=VT323&display=swap",
    },
    previewSwatch: "linear-gradient(180deg, #1a0030, #ff2d92, #ffd060)",
  },

  cosmic: {
    id: "cosmic",
    name: "Cosmic Drift",
    description:
      "Deep indigo nebula dotted with pixel stars. Quiet, slow, infinite.",
    minTier: "LIONHEART_PLUS",
    pageBackground:
      "radial-gradient(circle at 12% 18%, #ffffff 1px, transparent 2px) 0 0/280px 320px, " +
      "radial-gradient(circle at 78% 62%, #b0b8ff 1px, transparent 2px) 80px 120px/300px 360px, " +
      "radial-gradient(circle at 36% 84%, #ffffff 1px, transparent 2px) 160px 40px/240px 280px, " +
      "radial-gradient(ellipse at 50% 30%, #2c1858 0%, #0a0820 60%, #03030f 100%)",
    panelBackground: "#080a18",
    panelBorder: "#3a2870",
    textColor: "#e8e8ff",
    textDim: "#9090b8",
    accent: "#5cc8ff",
    font: {
      family: "'Press Start 2P', monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
    },
    previewSwatch: "radial-gradient(ellipse, #2c1858, #0a0820, #03030f)",
  },

  cottage: {
    id: "cottage",
    name: "Mossy Cottage",
    description:
      "Warm wood, moss-green trim, hand-painted parchment. Cozy fireplace energy.",
    minTier: "LIONHEART_PLUS",
    pageBackground:
      "repeating-linear-gradient(90deg, #4a2c14 0 2px, #6b4220 2px 200px, #4a2c14 200px 202px, #8b6033 202px 400px), " +
      "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 40%)",
    panelBackground: "#f0e8d4",
    panelBorder: "#3a5028",
    textColor: "#2a3818",
    textDim: "#5a6038",
    accent: "#7a9050",
    font: {
      family: "'Pixelify Sans', system-ui, monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;700&display=swap",
    },
    previewSwatch: "linear-gradient(135deg, #f0e8d4, #7a9050, #4a2c14)",
  },

  cyberpunk: {
    id: "cyberpunk",
    name: "Neon Alley",
    description:
      "Wet asphalt, blown-out cyan, hot magenta signage. The dive bar of the future.",
    minTier: "LIONHEART_PLUS",
    pageBackground:
      "radial-gradient(ellipse at 18% 24%, rgba(255,0,170,0.32) 0 60px, transparent 80px), " +
      "radial-gradient(ellipse at 78% 70%, rgba(0,240,255,0.30) 0 70px, transparent 90px), " +
      "linear-gradient(180deg, #06060c 0%, #0a0e1c 60%, #060810 100%)",
    panelBackground: "#0a0a14",
    panelBorder: "#00f0ff",
    textColor: "#e0fcff",
    textDim: "#7080a0",
    accent: "#ff00aa",
    font: {
      family: "'Press Start 2P', monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
    },
    previewSwatch: "linear-gradient(135deg, #06060c, #ff00aa, #00f0ff)",
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

  lava: {
    id: "lava",
    name: "Volcanic Forge",
    description:
      "Charcoal obsidian veined with molten ember. The floor is, in fact, lava.",
    minTier: "LIONHEART_PLUS_PLUS",
    pageBackground:
      "radial-gradient(ellipse at 20% 90%, rgba(255,80,40,0.45) 0 18%, transparent 40%), " +
      "radial-gradient(ellipse at 80% 110%, rgba(255,140,40,0.40) 0 14%, transparent 38%), " +
      "linear-gradient(180deg, #0a0303 0%, #1a0a05 50%, #2a0e06 100%)",
    panelBackground: "#1a0a05",
    panelBorder: "#ff5028",
    textColor: "#ffe8d8",
    textDim: "#a08070",
    accent: "#ff8030",
    font: {
      family: "'Press Start 2P', monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
    },
    previewSwatch: "radial-gradient(ellipse, #ff8030, #1a0a05, #0a0303)",
  },

  aurora: {
    id: "aurora",
    name: "Aurora Glacier",
    description:
      "Frosted ice with shimmering northern-lights ribbons of teal and lavender drifting overhead.",
    minTier: "LIONHEART_PLUS_PLUS",
    pageBackground:
      "linear-gradient(135deg, #5fc8e8 0%, #8a78ff 30%, #5fc8e8 55%, #b078ff 80%, #5fc8e8 100%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)",
    panelBackground: "#e8f3fb",
    panelBorder: "#1a2a4a",
    textColor: "#0a1a3a",
    textDim: "#5070a0",
    accent: "#3a90c8",
    font: {
      family: "'Pixelify Sans', system-ui, monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;700&display=swap",
    },
    previewSwatch: "linear-gradient(135deg, #5fc8e8, #8a78ff, #b078ff)",
  },

  royal: {
    id: "royal",
    name: "Royal Tapestry",
    description:
      "Deep burgundy velvet with gold filigree. Built for nobility and very expensive cheese.",
    minTier: "LIONHEART_PLUS_PLUS",
    pageBackground:
      "radial-gradient(circle at 25% 35%, rgba(212,168,56,0.20) 0 6px, transparent 8px) 0 0/120px 140px, " +
      "radial-gradient(circle at 75% 75%, rgba(212,168,56,0.16) 0 4px, transparent 6px) 60px 70px/120px 140px, " +
      "linear-gradient(180deg, #2a040c 0%, #4a0a1a 60%, #2a040c 100%)",
    panelBackground: "#f8efd8",
    panelBorder: "#4a0a1a",
    textColor: "#3a050f",
    textDim: "#7a3040",
    accent: "#d4a838",
    font: {
      family: "'VT323', monospace",
      googleFontHref:
        "https://fonts.googleapis.com/css2?family=VT323&display=swap",
    },
    previewSwatch: "linear-gradient(135deg, #4a0a1a, #d4a838, #f8efd8)",
  },
}

export const STORE_THEME_ORDER: StoreThemeId[] = [
  // FREE
  "default",
  // LIONHEART
  "stardew", "pokemon", "sakura", "library", "mint",
  // LIONHEART_PLUS
  "earthbound", "synthwave", "cosmic", "cottage", "cyberpunk",
  // LIONHEART_PLUS_PLUS
  "gameboy", "lava", "aurora", "royal",
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
