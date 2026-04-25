// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Shared TypeScript types and tier metadata used across
//          the LionHeart Studio components. Keeps individual
//          component files focused on rendering.
// ============================================================
import type { LookPrefs } from "@/constants/CardLookPresets";

export interface CardPreferences extends LookPrefs {
  bio_text: string | null;
}

export interface SubscriptionData {
  tier: string;
  status: string;
  tierName: string | null;
  tierPrice: number | null;
  tierColor: string | null;
  monthlyGems: number | null;
  gemsPerVote: number | null;
  lionCoinBoost: number | null;
  lgGoldBoost: number | null;
  dropRateBonus: number | null;
  farmGrowthSpeed: number | null;
  seedCostDiscount: number | null;
  harvestGoldBonus: number | null;
  uprootRefund: number | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
}

export interface TimerPreferences {
  theme: string;
  custom_accent_color: string | null;
  focus_label: string | null;
  break_label: string | null;
  session_label: string | null;
}

export const DEFAULT_CARD_PREFS: CardPreferences = {
  effects_enabled: true,
  sparkle_color: null,
  ring_color: null,
  sparkles_enabled: true,
  ring_enabled: true,
  edge_glow_enabled: true,
  particles_enabled: true,
  effect_intensity: "normal",
  edge_glow_color: null,
  particle_color: null,
  particle_style: "stars",
  animation_speed: "normal",
  username_color: null,
  bio_text: null,
  border_style: "clean",
  seasonal_effects: false,
  embed_color: null,
};

export const DEFAULT_TIMER_PREFS: TimerPreferences = {
  theme: "classic",
  custom_accent_color: null,
  focus_label: null,
  break_label: null,
  session_label: null,
};

/**
 * Tier color and a "soft" version for blob backgrounds.
 * Mirrors SUBSCRIPTION_TIERS color but exposes both as plain
 * strings so they can be slotted into inline `style` props.
 */
export const TIER_PALETTE: Record<
  string,
  { hex: string; soft: string; gradient: string }
> = {
  LIONHEART: {
    hex: "#5B8DEF",
    soft: "rgba(91, 141, 239, 0.18)",
    gradient: "linear-gradient(135deg, #5B8DEF 0%, #38BDF8 100%)",
  },
  LIONHEART_PLUS: {
    hex: "#FF69B4",
    soft: "rgba(244, 114, 182, 0.18)",
    gradient: "linear-gradient(135deg, #FF69B4 0%, #A855F7 100%)",
  },
  LIONHEART_PLUS_PLUS: {
    hex: "#FFD700",
    soft: "rgba(255, 215, 0, 0.18)",
    gradient: "linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)",
  },
  NONE: {
    hex: "#94A3B8",
    soft: "rgba(148, 163, 184, 0.15)",
    gradient: "linear-gradient(135deg, #94A3B8 0%, #475569 100%)",
  },
};

export function tierPalette(tier: string | null | undefined) {
  return TIER_PALETTE[tier || "NONE"] || TIER_PALETTE.NONE;
}

/**
 * Build a Discord-style relative timestamp like "Today at 14:23".
 * Used by the sticky preview's mock chat frame.
 */
export function mockChatTimestamp(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `Today at ${hh}:${mm}`;
}

/**
 * Convert a hex color to an rgba string with the supplied alpha.
 * Returns the hex unchanged if it can't be parsed.
 */
export function hexToRgba(hex: string | null | undefined, alpha = 1): string {
  if (!hex || !/^#?[0-9A-Fa-f]{6}$/.test(hex)) return hex || "transparent";
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
