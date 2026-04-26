// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Curated whole-card "Looks" for the LionHeart Studio.
//          Each look is a coordinated set of every card-effect
//          preference (sparkle/ring/glow/particle colors, shape,
//          border, intensity, speed, seasonal). A single click
//          in the Looks gallery applies the entire object to
//          the user's draft prefs, which auto-debounces a render.
// ============================================================

import type {
  ParticleStyle,
  EffectIntensity,
  AnimationSpeed,
  BorderStyle,
} from "./CardEffectPresets";

export interface LookPrefs {
  effects_enabled: boolean;
  sparkles_enabled: boolean;
  ring_enabled: boolean;
  edge_glow_enabled: boolean;
  particles_enabled: boolean;
  sparkle_color: string | null;
  ring_color: string | null;
  edge_glow_color: string | null;
  particle_color: string | null;
  username_color: string | null;
  embed_color: string | null;
  particle_style: ParticleStyle;
  effect_intensity: EffectIntensity;
  animation_speed: AnimationSpeed;
  border_style: BorderStyle;
  seasonal_effects: boolean;
}

export interface CardLook {
  id: string;
  name: string;
  vibe: string;
  /** Two stops used for the gallery thumbnail gradient */
  preview: { from: string; to: string };
  /** Optional emoji for the thumbnail micro-icon */
  glyph?: string;
  prefs: LookPrefs;
}

const baseLook: LookPrefs = {
  effects_enabled: true,
  sparkles_enabled: true,
  ring_enabled: true,
  edge_glow_enabled: true,
  particles_enabled: true,
  sparkle_color: null,
  ring_color: null,
  edge_glow_color: null,
  particle_color: null,
  username_color: null,
  embed_color: null,
  particle_style: "stars",
  effect_intensity: "normal",
  animation_speed: "normal",
  border_style: "clean",
  seasonal_effects: false,
};

export const CARD_LOOKS: CardLook[] = [
  {
    id: "royal_gold",
    name: "Royal Gold",
    vibe: "Throne-room ceremony",
    preview: { from: "#FFD700", to: "#B8860B" },
    glyph: "\u{1F451}",
    prefs: {
      ...baseLook,
      sparkle_color: "#FFD700",
      ring_color: "#FFD700",
      edge_glow_color: "#F59E0B",
      particle_color: "#FFE066",
      username_color: "#FFD700",
      embed_color: "#F59E0B",
      particle_style: "stars",
      border_style: "regal",
      effect_intensity: "dense",
      animation_speed: "slow",
    },
  },
  {
    id: "cyber_pink",
    name: "Cyber Pink",
    vibe: "Neo-Tokyo arcade",
    preview: { from: "#FF1493", to: "#8B5CF6" },
    glyph: "\u26A1",
    prefs: {
      ...baseLook,
      sparkle_color: "#FF1493",
      ring_color: "#F472B6",
      edge_glow_color: "#A855F7",
      particle_color: "#F472B6",
      username_color: "#FF69B4",
      embed_color: "#FF1493",
      particle_style: "lightning",
      border_style: "neon",
      effect_intensity: "dense",
      animation_speed: "fast",
    },
  },
  {
    id: "cozy_garden",
    name: "Cozy Garden",
    vibe: "Sunday afternoon, warm light",
    preview: { from: "#F9A8D4", to: "#FCA5A5" },
    glyph: "\u{1F33B}",
    prefs: {
      ...baseLook,
      sparkle_color: "#F9A8D4",
      ring_color: "#FCA5A5",
      edge_glow_color: "#F97316",
      particle_color: "#F472B6",
      username_color: "#F9A8D4",
      embed_color: "#F472B6",
      particle_style: "hearts",
      border_style: "minimal",
      effect_intensity: "subtle",
      animation_speed: "slow",
    },
  },
  {
    id: "holographic",
    name: "Holographic",
    vibe: "Iridescent prism",
    preview: { from: "#A78BFA", to: "#38BDF8" },
    glyph: "\u{1F48E}",
    prefs: {
      ...baseLook,
      sparkle_color: "#A78BFA",
      ring_color: "#38BDF8",
      edge_glow_color: "#F472B6",
      particle_color: "#A78BFA",
      username_color: "#A78BFA",
      embed_color: "#8B5CF6",
      particle_style: "diamonds",
      border_style: "ornate",
      effect_intensity: "normal",
      animation_speed: "normal",
    },
  },
  {
    id: "minimal_ice",
    name: "Minimal Ice",
    vibe: "A single quiet detail",
    preview: { from: "#5B8DEF", to: "#38BDF8" },
    glyph: "\u2744",
    prefs: {
      ...baseLook,
      sparkle_color: "#5B8DEF",
      ring_color: "#5B8DEF",
      edge_glow_color: "#5B8DEF",
      particle_color: "#5B8DEF",
      username_color: "#5B8DEF",
      embed_color: "#5B8DEF",
      particle_style: "stars",
      border_style: "minimal",
      effect_intensity: "subtle",
      animation_speed: "slow",
      particles_enabled: false,
    },
  },
  {
    id: "stardust",
    name: "Stardust",
    vibe: "Late-night observatory",
    preview: { from: "#94A3B8", to: "#5B8DEF" },
    glyph: "\u2728",
    prefs: {
      ...baseLook,
      sparkle_color: "#FFFFFF",
      ring_color: "#94A3B8",
      edge_glow_color: "#5B8DEF",
      particle_color: "#FFFFFF",
      username_color: "#94A3B8",
      embed_color: "#5B8DEF",
      particle_style: "stars",
      border_style: "pixel",
      effect_intensity: "dense",
      animation_speed: "normal",
    },
  },
  {
    id: "snowstorm",
    name: "Snowstorm",
    vibe: "Quiet blizzard",
    preview: { from: "#E0F2FE", to: "#38BDF8" },
    glyph: "\u2744",
    prefs: {
      ...baseLook,
      sparkle_color: "#FFFFFF",
      ring_color: "#38BDF8",
      edge_glow_color: "#5B8DEF",
      particle_color: "#FFFFFF",
      username_color: "#38BDF8",
      embed_color: "#5B8DEF",
      particle_style: "snowflakes",
      border_style: "regal",
      effect_intensity: "dense",
      animation_speed: "slow",
    },
  },
  {
    id: "lightning_strike",
    name: "Lightning Strike",
    vibe: "Eight-bit thunderclap",
    preview: { from: "#FBBF24", to: "#A855F7" },
    glyph: "\u26A1",
    prefs: {
      ...baseLook,
      sparkle_color: "#FBBF24",
      ring_color: "#A855F7",
      edge_glow_color: "#FBBF24",
      particle_color: "#FBBF24",
      username_color: "#FBBF24",
      embed_color: "#A855F7",
      particle_style: "lightning",
      border_style: "neon",
      effect_intensity: "maximum",
      animation_speed: "fast",
    },
  },
  {
    id: "hearts_on_fire",
    name: "Hearts on Fire",
    vibe: "Loud and devoted",
    preview: { from: "#DC2626", to: "#FF69B4" },
    glyph: "\u2764",
    prefs: {
      ...baseLook,
      sparkle_color: "#FF69B4",
      ring_color: "#DC2626",
      edge_glow_color: "#DC2626",
      particle_color: "#FF69B4",
      username_color: "#DC2626",
      embed_color: "#DC2626",
      particle_style: "hearts",
      border_style: "ornate",
      effect_intensity: "dense",
      animation_speed: "normal",
    },
  },
  {
    id: "black_diamond",
    name: "Black Diamond",
    vibe: "Glass case in a dark room",
    preview: { from: "#0F172A", to: "#94A3B8" },
    glyph: "\u25C6",
    prefs: {
      ...baseLook,
      sparkle_color: "#FFFFFF",
      ring_color: "#94A3B8",
      edge_glow_color: "#94A3B8",
      particle_color: "#FFFFFF",
      username_color: "#FFFFFF",
      embed_color: "#94A3B8",
      particle_style: "diamonds",
      border_style: "minimal",
      effect_intensity: "subtle",
      animation_speed: "slow",
    },
  },
  {
    id: "sakura",
    name: "Sakura",
    vibe: "Spring, the first warm afternoon",
    preview: { from: "#F9A8D4", to: "#FBBF24" },
    glyph: "\u{1F338}",
    prefs: {
      ...baseLook,
      sparkle_color: "#F9A8D4",
      ring_color: "#F9A8D4",
      edge_glow_color: "#FBBF24",
      particle_color: "#F472B6",
      username_color: "#F9A8D4",
      embed_color: "#F472B6",
      particle_style: "hearts",
      border_style: "ornate",
      effect_intensity: "normal",
      animation_speed: "normal",
    },
  },
  {
    id: "inferno",
    name: "Inferno",
    vibe: "Volcano at sunset",
    preview: { from: "#DC2626", to: "#F59E0B" },
    glyph: "\u{1F525}",
    prefs: {
      ...baseLook,
      sparkle_color: "#F97316",
      ring_color: "#DC2626",
      edge_glow_color: "#DC2626",
      particle_color: "#F97316",
      username_color: "#F97316",
      embed_color: "#DC2626",
      particle_style: "lightning",
      border_style: "regal",
      effect_intensity: "maximum",
      animation_speed: "fast",
    },
  },
];

/**
 * Pick a random look. Used by the "Surprise me" button on the hero.
 */
export function randomLook(): CardLook {
  return CARD_LOOKS[Math.floor(Math.random() * CARD_LOOKS.length)];
}

/**
 * Find a look by id (for restoring user state, telemetry, etc.).
 */
export function lookById(id: string): CardLook | undefined {
  return CARD_LOOKS.find((l) => l.id === id);
}
