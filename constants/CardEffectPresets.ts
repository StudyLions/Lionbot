// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Modified: 2026-03-20
// Purpose: Color presets and validation for LionHeart animated
//          card effects. Presets are quick-select shortcuts;
//          any valid hex color is now accepted (Phase 2).
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

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function isValidHexColor(hex: string | null | undefined): boolean {
  if (!hex) return true;
  return HEX_COLOR_REGEX.test(hex);
}

export function isValidPresetColor(hex: string | null | undefined): boolean {
  return isValidHexColor(hex);
}

export const DEFAULT_PRESET_ID = "default";

export const PARTICLE_STYLES = [
  { id: "stars", name: "Stars", icon: "✦" },
  { id: "hearts", name: "Hearts", icon: "♥" },
  { id: "diamonds", name: "Diamonds", icon: "◆" },
  { id: "circles", name: "Circles", icon: "●" },
  { id: "snowflakes", name: "Snowflakes", icon: "❄" },
  { id: "lightning", name: "Lightning", icon: "⚡" },
] as const;

export const EFFECT_INTENSITIES = [
  { id: "subtle", name: "Subtle" },
  { id: "normal", name: "Normal" },
  { id: "dense", name: "Dense" },
  { id: "maximum", name: "Maximum" },
] as const;

export const ANIMATION_SPEEDS = [
  { id: "slow", name: "Slow" },
  { id: "normal", name: "Normal" },
  { id: "fast", name: "Fast" },
] as const;

export const BORDER_STYLES = [
  { id: "clean", name: "None" },
  { id: "minimal", name: "Minimal" },
  { id: "neon", name: "Neon" },
  { id: "ornate", name: "Ornate" },
  { id: "regal", name: "Regal" },
  { id: "pixel", name: "Pixel" },
] as const;

export type ParticleStyle = typeof PARTICLE_STYLES[number]["id"];
export type EffectIntensity = typeof EFFECT_INTENSITIES[number]["id"];
export type AnimationSpeed = typeof ANIMATION_SPEEDS[number]["id"];
export type BorderStyle = typeof BORDER_STYLES[number]["id"];
