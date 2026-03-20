// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Modified: 2026-03-20
// Purpose: GET/PATCH endpoint for user card effect preferences.
//          Expanded for full customization: per-effect toggles,
//          particle styles, animation speed, intensity, bio text,
//          border styles, seasonal effects, and custom hex colors.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth, forbidden } from "@/utils/adminAuth";
import { prisma } from "@/utils/prisma";
import { isValidHexColor } from "@/constants/CardEffectPresets";

const VALID_PARTICLE_STYLES = new Set(["stars", "hearts", "diamonds", "circles", "snowflakes", "lightning"]);
const VALID_INTENSITIES = new Set(["subtle", "normal", "dense", "maximum"]);
const VALID_SPEEDS = new Set(["slow", "normal", "fast"]);
const VALID_BORDERS = new Set(["clean", "minimal", "neon", "ornate", "regal", "pixel"]);

const ALL_FIELDS = [
  "effects_enabled", "sparkle_color", "ring_color",
  "sparkles_enabled", "ring_enabled", "edge_glow_enabled", "particles_enabled",
  "effect_intensity", "edge_glow_color", "particle_color", "particle_style",
  "animation_speed", "username_color", "bio_text", "border_style", "seasonal_effects",
  "embed_color",
] as const;

function serializePrefs(prefs: Record<string, unknown> | null) {
  return {
    effects_enabled: prefs?.effects_enabled ?? true,
    sparkle_color: prefs?.sparkle_color ?? null,
    ring_color: prefs?.ring_color ?? null,
    sparkles_enabled: prefs?.sparkles_enabled ?? true,
    ring_enabled: prefs?.ring_enabled ?? true,
    edge_glow_enabled: prefs?.edge_glow_enabled ?? true,
    particles_enabled: prefs?.particles_enabled ?? true,
    effect_intensity: prefs?.effect_intensity ?? "normal",
    edge_glow_color: prefs?.edge_glow_color ?? null,
    particle_color: prefs?.particle_color ?? null,
    particle_style: prefs?.particle_style ?? "stars",
    animation_speed: prefs?.animation_speed ?? "normal",
    username_color: prefs?.username_color ?? null,
    bio_text: prefs?.bio_text ?? null,
    border_style: prefs?.border_style ?? "clean",
    seasonal_effects: prefs?.seasonal_effects ?? false,
    embed_color: prefs?.embed_color ?? null,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAuth(req, res);
  if (!auth) return;

  if (req.method === "GET") {
    try {
      const prefs = await prisma.user_card_preferences.findUnique({
        where: { userid: auth.userId },
      });
      return res.status(200).json(serializePrefs(prefs as Record<string, unknown> | null));
    } catch (err) {
      console.error("Card preferences GET error:", err);
      return res.status(500).json({ error: "Failed to fetch card preferences" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const sub = await prisma.user_subscriptions.findUnique({
        where: { userid: auth.userId },
        select: { status: true, tier: true },
      });

      if (!sub || sub.status !== "ACTIVE" || sub.tier === "NONE") {
        return forbidden(res);
      }

      const body = req.body;

      for (const colorField of ["sparkle_color", "ring_color", "edge_glow_color", "particle_color", "username_color", "embed_color"]) {
        const val = body[colorField];
        if (val !== undefined && val !== null && !isValidHexColor(val)) {
          return res.status(400).json({ error: `Invalid color for ${colorField}` });
        }
      }

      if (body.particle_style !== undefined && !VALID_PARTICLE_STYLES.has(body.particle_style)) {
        return res.status(400).json({ error: "Invalid particle style" });
      }
      if (body.effect_intensity !== undefined && !VALID_INTENSITIES.has(body.effect_intensity)) {
        return res.status(400).json({ error: "Invalid effect intensity" });
      }
      if (body.animation_speed !== undefined && !VALID_SPEEDS.has(body.animation_speed)) {
        return res.status(400).json({ error: "Invalid animation speed" });
      }
      if (body.border_style !== undefined && !VALID_BORDERS.has(body.border_style)) {
        return res.status(400).json({ error: "Invalid border style" });
      }
      if (body.bio_text !== undefined && body.bio_text !== null) {
        if (typeof body.bio_text !== "string" || body.bio_text.length > 50) {
          return res.status(400).json({ error: "Bio text must be 50 characters or fewer" });
        }
      }

      const data: Record<string, unknown> = { updated_at: new Date() };

      for (const field of ["effects_enabled", "sparkles_enabled", "ring_enabled", "edge_glow_enabled", "particles_enabled", "seasonal_effects"]) {
        if (typeof body[field] === "boolean") data[field] = body[field];
      }

      for (const field of ["sparkle_color", "ring_color", "edge_glow_color", "particle_color", "username_color", "embed_color"]) {
        if (body[field] !== undefined) data[field] = body[field] || null;
      }

      for (const field of ["particle_style", "effect_intensity", "animation_speed", "border_style"]) {
        if (body[field] !== undefined) data[field] = body[field];
      }

      if (body.bio_text !== undefined) {
        data.bio_text = body.bio_text ? body.bio_text.slice(0, 50) : null;
      }

      const defaults: Record<string, unknown> = {
        effects_enabled: true, sparkles_enabled: true, ring_enabled: true,
        edge_glow_enabled: true, particles_enabled: true, seasonal_effects: false,
        effect_intensity: "normal", particle_style: "stars",
        animation_speed: "normal", border_style: "clean",
      };

      const result = await prisma.user_card_preferences.upsert({
        where: { userid: auth.userId },
        update: data,
        create: {
          userid: auth.userId,
          ...defaults,
          ...data,
        },
      });

      return res.status(200).json(serializePrefs(result as unknown as Record<string, unknown>));
    } catch (err) {
      console.error("Card preferences PATCH error:", err);
      return res.status(500).json({ error: "Failed to save card preferences" });
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
