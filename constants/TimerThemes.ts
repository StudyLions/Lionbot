// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Timer theme definitions for Focus Mode (LionHeart perk).
//          Each theme defines stage colors, typography, ring style,
//          particle effects, and background animations.
// ============================================================

export type ThemeTier = "FREE" | "LIONHEART" | "LIONHEART_PLUS" | "LIONHEART_PLUS_PLUS"

export interface StageColors {
  bg: string
  stroke: string
  glow: string
  glowStrong: string
  text: string
  label: string
}

export interface ParticleConfig {
  type: "petals" | "embers" | "stars" | "bubbles" | "sparkles" | "shimmer"
  count: number
  colors: string[]
  speed: number // 0.5 = slow, 1 = normal, 2 = fast
}

export interface TimerTheme {
  id: string
  name: string
  description: string
  tier: ThemeTier
  preview: string // CSS gradient for the theme picker swatch

  focus: StageColors
  break: StageColors
  session: StageColors

  fontFamily: string
  fontImport?: string
  fontWeight: string
  letterSpacing?: string

  ringWidth: { normal: number; popout: number }
  ringLinecap: "round" | "butt" | "square"

  particles?: ParticleConfig
  backgroundCss?: string
  ringExtraCss?: string
}

export const TIMER_THEMES: Record<string, TimerTheme> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "The original warm amber timer",
    tier: "FREE",
    preview: "linear-gradient(135deg, #f59e0b, #06b6d4, #8b5cf6)",
    focus: {
      bg: "from-amber-950/40 via-gray-950 to-gray-950",
      stroke: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.15)",
      glowStrong: "rgba(245, 158, 11, 0.3)",
      text: "text-amber-400",
      label: "FOCUS",
    },
    break: {
      bg: "from-cyan-950/40 via-gray-950 to-gray-950",
      stroke: "#06b6d4",
      glow: "rgba(6, 182, 212, 0.15)",
      glowStrong: "rgba(6, 182, 212, 0.3)",
      text: "text-cyan-400",
      label: "BREAK",
    },
    session: {
      bg: "from-violet-950/30 via-gray-950 to-gray-950",
      stroke: "#8b5cf6",
      glow: "rgba(139, 92, 246, 0.12)",
      glowStrong: "rgba(139, 92, 246, 0.25)",
      text: "text-violet-400",
      label: "SESSION",
    },
    fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
    fontWeight: "700",
    ringWidth: { normal: 8, popout: 6 },
    ringLinecap: "round",
  },

  neon_pulse: {
    id: "neon_pulse",
    name: "Neon Pulse",
    description: "Cyberpunk glow with pulsing neon",
    tier: "LIONHEART",
    preview: "linear-gradient(135deg, #39ff14, #ff00ff, #00e5ff)",
    focus: {
      bg: "from-green-950/50 via-gray-950 to-gray-950",
      stroke: "#39ff14",
      glow: "rgba(57, 255, 20, 0.2)",
      glowStrong: "rgba(57, 255, 20, 0.45)",
      text: "text-green-400",
      label: "FOCUS",
    },
    break: {
      bg: "from-fuchsia-950/50 via-gray-950 to-gray-950",
      stroke: "#ff00ff",
      glow: "rgba(255, 0, 255, 0.2)",
      glowStrong: "rgba(255, 0, 255, 0.45)",
      text: "text-fuchsia-400",
      label: "BREAK",
    },
    session: {
      bg: "from-cyan-950/40 via-gray-950 to-gray-950",
      stroke: "#00e5ff",
      glow: "rgba(0, 229, 255, 0.18)",
      glowStrong: "rgba(0, 229, 255, 0.4)",
      text: "text-cyan-300",
      label: "SESSION",
    },
    fontFamily: "'Orbitron', sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap",
    fontWeight: "700",
    letterSpacing: "0.05em",
    ringWidth: { normal: 6, popout: 5 },
    ringLinecap: "butt",
    backgroundCss: "neon-scanlines",
  },

  ocean_deep: {
    id: "ocean_deep",
    name: "Ocean Deep",
    description: "Calm deep-sea blues with drifting bubbles",
    tier: "LIONHEART",
    preview: "linear-gradient(135deg, #0ea5e9, #0e4d6e, #164e63)",
    focus: {
      bg: "from-sky-950/50 via-gray-950 to-gray-950",
      stroke: "#0ea5e9",
      glow: "rgba(14, 165, 233, 0.18)",
      glowStrong: "rgba(14, 165, 233, 0.35)",
      text: "text-sky-400",
      label: "FOCUS",
    },
    break: {
      bg: "from-teal-950/50 via-gray-950 to-gray-950",
      stroke: "#2dd4bf",
      glow: "rgba(45, 212, 191, 0.18)",
      glowStrong: "rgba(45, 212, 191, 0.35)",
      text: "text-teal-400",
      label: "BREAK",
    },
    session: {
      bg: "from-blue-950/40 via-gray-950 to-gray-950",
      stroke: "#3b82f6",
      glow: "rgba(59, 130, 246, 0.14)",
      glowStrong: "rgba(59, 130, 246, 0.3)",
      text: "text-blue-400",
      label: "SESSION",
    },
    fontFamily: "'Space Mono', monospace",
    fontImport: "https://fonts.googleapis.com/css2?family=Space+Mono:wght@700&display=swap",
    fontWeight: "700",
    ringWidth: { normal: 10, popout: 7 },
    ringLinecap: "round",
    particles: { type: "bubbles", count: 12, colors: ["#0ea5e9", "#38bdf8", "#7dd3fc"], speed: 0.5 },
  },

  sakura: {
    id: "sakura",
    name: "Sakura",
    description: "Soft pink petals drifting gently",
    tier: "LIONHEART",
    preview: "linear-gradient(135deg, #f9a8d4, #ec4899, #f472b6)",
    focus: {
      bg: "from-pink-950/40 via-gray-950 to-gray-950",
      stroke: "#ec4899",
      glow: "rgba(236, 72, 153, 0.16)",
      glowStrong: "rgba(236, 72, 153, 0.32)",
      text: "text-pink-400",
      label: "FOCUS",
    },
    break: {
      bg: "from-rose-950/40 via-gray-950 to-gray-950",
      stroke: "#fb7185",
      glow: "rgba(251, 113, 133, 0.16)",
      glowStrong: "rgba(251, 113, 133, 0.32)",
      text: "text-rose-400",
      label: "BREAK",
    },
    session: {
      bg: "from-fuchsia-950/30 via-gray-950 to-gray-950",
      stroke: "#d946ef",
      glow: "rgba(217, 70, 239, 0.12)",
      glowStrong: "rgba(217, 70, 239, 0.26)",
      text: "text-fuchsia-400",
      label: "SESSION",
    },
    fontFamily: "'Quicksand', sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Quicksand:wght@700&display=swap",
    fontWeight: "700",
    ringWidth: { normal: 7, popout: 5 },
    ringLinecap: "round",
    particles: { type: "petals", count: 15, colors: ["#f9a8d4", "#f472b6", "#fce7f3", "#fda4af"], speed: 0.7 },
  },

  terminal: {
    id: "terminal",
    name: "Terminal",
    description: "Green-on-black hacker aesthetic",
    tier: "LIONHEART",
    preview: "linear-gradient(135deg, #22c55e, #052e16, #15803d)",
    focus: {
      bg: "from-green-950/30 via-gray-950 to-black",
      stroke: "#22c55e",
      glow: "rgba(34, 197, 94, 0.12)",
      glowStrong: "rgba(34, 197, 94, 0.28)",
      text: "text-green-500",
      label: "FOCUS",
    },
    break: {
      bg: "from-emerald-950/30 via-gray-950 to-black",
      stroke: "#10b981",
      glow: "rgba(16, 185, 129, 0.12)",
      glowStrong: "rgba(16, 185, 129, 0.28)",
      text: "text-emerald-500",
      label: "BREAK",
    },
    session: {
      bg: "from-lime-950/20 via-gray-950 to-black",
      stroke: "#84cc16",
      glow: "rgba(132, 204, 22, 0.1)",
      glowStrong: "rgba(132, 204, 22, 0.22)",
      text: "text-lime-500",
      label: "SESSION",
    },
    fontFamily: "'Share Tech Mono', monospace",
    fontImport: "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap",
    fontWeight: "400",
    ringWidth: { normal: 4, popout: 3 },
    ringLinecap: "butt",
    backgroundCss: "terminal-scanlines",
  },

  aurora: {
    id: "aurora",
    name: "Aurora",
    description: "Northern lights with shifting colors",
    tier: "LIONHEART_PLUS",
    preview: "linear-gradient(135deg, #34d399, #818cf8, #a78bfa, #22d3ee)",
    focus: {
      bg: "from-emerald-950/40 via-indigo-950/20 to-gray-950",
      stroke: "#34d399",
      glow: "rgba(52, 211, 153, 0.18)",
      glowStrong: "rgba(52, 211, 153, 0.35)",
      text: "text-emerald-400",
      label: "FOCUS",
    },
    break: {
      bg: "from-indigo-950/40 via-cyan-950/20 to-gray-950",
      stroke: "#818cf8",
      glow: "rgba(129, 140, 248, 0.18)",
      glowStrong: "rgba(129, 140, 248, 0.35)",
      text: "text-indigo-400",
      label: "BREAK",
    },
    session: {
      bg: "from-cyan-950/30 via-violet-950/20 to-gray-950",
      stroke: "#22d3ee",
      glow: "rgba(34, 211, 238, 0.15)",
      glowStrong: "rgba(34, 211, 238, 0.3)",
      text: "text-cyan-400",
      label: "SESSION",
    },
    fontFamily: "'Inter', sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap",
    fontWeight: "700",
    ringWidth: { normal: 8, popout: 6 },
    ringLinecap: "round",
    ringExtraCss: "aurora-gradient-ring",
    particles: { type: "shimmer", count: 25, colors: ["#34d399", "#818cf8", "#22d3ee", "#a78bfa"], speed: 0.4 },
  },

  ember: {
    id: "ember",
    name: "Ember",
    description: "Warm flames and rising sparks",
    tier: "LIONHEART_PLUS",
    preview: "linear-gradient(135deg, #ef4444, #f97316, #fbbf24)",
    focus: {
      bg: "from-red-950/50 via-orange-950/20 to-gray-950",
      stroke: "#f97316",
      glow: "rgba(249, 115, 22, 0.2)",
      glowStrong: "rgba(249, 115, 22, 0.4)",
      text: "text-orange-400",
      label: "FOCUS",
    },
    break: {
      bg: "from-amber-950/40 via-red-950/15 to-gray-950",
      stroke: "#fbbf24",
      glow: "rgba(251, 191, 36, 0.18)",
      glowStrong: "rgba(251, 191, 36, 0.35)",
      text: "text-amber-400",
      label: "BREAK",
    },
    session: {
      bg: "from-orange-950/35 via-gray-950 to-gray-950",
      stroke: "#ef4444",
      glow: "rgba(239, 68, 68, 0.15)",
      glowStrong: "rgba(239, 68, 68, 0.3)",
      text: "text-red-400",
      label: "SESSION",
    },
    fontFamily: "'Rajdhani', sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap",
    fontWeight: "700",
    ringWidth: { normal: 9, popout: 7 },
    ringLinecap: "round",
    particles: { type: "embers", count: 18, colors: ["#f97316", "#fbbf24", "#ef4444", "#fb923c"], speed: 1.0 },
  },

  frosted: {
    id: "frosted",
    name: "Frosted Glass",
    description: "Clean and minimal with a frosted finish",
    tier: "LIONHEART_PLUS",
    preview: "linear-gradient(135deg, #e2e8f0, #94a3b8, #f1f5f9)",
    focus: {
      bg: "from-slate-900/40 via-gray-950 to-gray-950",
      stroke: "#cbd5e1",
      glow: "rgba(203, 213, 225, 0.1)",
      glowStrong: "rgba(203, 213, 225, 0.2)",
      text: "text-slate-300",
      label: "FOCUS",
    },
    break: {
      bg: "from-blue-950/20 via-gray-950 to-gray-950",
      stroke: "#93c5fd",
      glow: "rgba(147, 197, 253, 0.1)",
      glowStrong: "rgba(147, 197, 253, 0.2)",
      text: "text-blue-300",
      label: "BREAK",
    },
    session: {
      bg: "from-gray-900/40 via-gray-950 to-gray-950",
      stroke: "#a5b4fc",
      glow: "rgba(165, 180, 252, 0.08)",
      glowStrong: "rgba(165, 180, 252, 0.18)",
      text: "text-indigo-300",
      label: "SESSION",
    },
    fontFamily: "'DM Sans', sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@700&display=swap",
    fontWeight: "700",
    letterSpacing: "0.02em",
    ringWidth: { normal: 3, popout: 2 },
    ringLinecap: "round",
  },

  cosmic: {
    id: "cosmic",
    name: "Cosmic",
    description: "Deep-space nebula with twinkling stars",
    tier: "LIONHEART_PLUS_PLUS",
    preview: "linear-gradient(135deg, #7c3aed, #2563eb, #6d28d9, #1e3a5f)",
    focus: {
      bg: "from-violet-950/50 via-blue-950/30 to-gray-950",
      stroke: "#7c3aed",
      glow: "rgba(124, 58, 237, 0.2)",
      glowStrong: "rgba(124, 58, 237, 0.4)",
      text: "text-violet-400",
      label: "FOCUS",
    },
    break: {
      bg: "from-blue-950/50 via-violet-950/20 to-gray-950",
      stroke: "#2563eb",
      glow: "rgba(37, 99, 235, 0.2)",
      glowStrong: "rgba(37, 99, 235, 0.4)",
      text: "text-blue-400",
      label: "BREAK",
    },
    session: {
      bg: "from-purple-950/40 via-blue-950/25 to-gray-950",
      stroke: "#6d28d9",
      glow: "rgba(109, 40, 217, 0.18)",
      glowStrong: "rgba(109, 40, 217, 0.35)",
      text: "text-purple-400",
      label: "SESSION",
    },
    fontFamily: "'Major Mono Display', monospace",
    fontImport: "https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap",
    fontWeight: "400",
    letterSpacing: "0.08em",
    ringWidth: { normal: 6, popout: 5 },
    ringLinecap: "round",
    particles: { type: "stars", count: 30, colors: ["#c4b5fd", "#93c5fd", "#e9d5ff", "#bfdbfe", "#ffffff"], speed: 0.3 },
  },

  luxe_gold: {
    id: "luxe_gold",
    name: "Luxe Gold",
    description: "Opulent gold with elegant serif type",
    tier: "LIONHEART_PLUS_PLUS",
    preview: "linear-gradient(135deg, #fbbf24, #d4a017, #78350f, #fef3c7)",
    focus: {
      bg: "from-yellow-950/40 via-amber-950/20 to-gray-950",
      stroke: "#fbbf24",
      glow: "rgba(251, 191, 36, 0.18)",
      glowStrong: "rgba(251, 191, 36, 0.35)",
      text: "text-amber-300",
      label: "FOCUS",
    },
    break: {
      bg: "from-amber-950/30 via-yellow-950/15 to-gray-950",
      stroke: "#f5d67b",
      glow: "rgba(245, 214, 123, 0.15)",
      glowStrong: "rgba(245, 214, 123, 0.3)",
      text: "text-yellow-300",
      label: "BREAK",
    },
    session: {
      bg: "from-yellow-950/25 via-gray-950 to-gray-950",
      stroke: "#d4a017",
      glow: "rgba(212, 160, 23, 0.14)",
      glowStrong: "rgba(212, 160, 23, 0.28)",
      text: "text-yellow-400",
      label: "SESSION",
    },
    fontFamily: "'Playfair Display', serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap",
    fontWeight: "700",
    letterSpacing: "0.02em",
    ringWidth: { normal: 7, popout: 5 },
    ringLinecap: "round",
    ringExtraCss: "luxe-shimmer",
    particles: { type: "sparkles", count: 10, colors: ["#fbbf24", "#fef3c7", "#fde68a", "#f5d67b"], speed: 0.6 },
  },
}

const TIER_RANK: Record<ThemeTier, number> = {
  FREE: 0,
  LIONHEART: 1,
  LIONHEART_PLUS: 2,
  LIONHEART_PLUS_PLUS: 3,
}

const SUB_TO_THEME_TIER: Record<string, ThemeTier> = {
  NONE: "FREE",
  LIONHEART: "LIONHEART",
  LIONHEART_PLUS: "LIONHEART_PLUS",
  LIONHEART_PLUS_PLUS: "LIONHEART_PLUS_PLUS",
}

export function userTierFromSub(subTier: string | null | undefined): ThemeTier {
  return SUB_TO_THEME_TIER[subTier ?? "NONE"] ?? "FREE"
}

export function canAccessTheme(themeId: string, userThemeTier: ThemeTier): boolean {
  const theme = TIMER_THEMES[themeId]
  if (!theme) return false
  return TIER_RANK[userThemeTier] >= TIER_RANK[theme.tier]
}

export function getTheme(themeId: string): TimerTheme {
  return TIMER_THEMES[themeId] ?? TIMER_THEMES.classic
}

export function getAccessibleThemes(userThemeTier: ThemeTier): TimerTheme[] {
  return Object.values(TIMER_THEMES).filter(
    (t) => TIER_RANK[userThemeTier] >= TIER_RANK[t.tier]
  )
}

export const ALL_THEMES = Object.values(TIMER_THEMES)

export const TIER_LABEL: Record<ThemeTier, string> = {
  FREE: "Free",
  LIONHEART: "LionHeart",
  LIONHEART_PLUS: "LionHeart+",
  LIONHEART_PLUS_PLUS: "LionHeart++",
}
