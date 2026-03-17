// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: GET/PATCH endpoint for user card effect preferences
//          (sparkle color, ring color, effects enabled).
//          Only active subscribers can save changes.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth, forbidden } from "@/utils/adminAuth";
import { prisma } from "@/utils/prisma";
import { isValidPresetColor } from "@/constants/CardEffectPresets";

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

      return res.status(200).json({
        effects_enabled: prefs?.effects_enabled ?? true,
        sparkle_color: prefs?.sparkle_color ?? null,
        ring_color: prefs?.ring_color ?? null,
      });
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

      const { effects_enabled, sparkle_color, ring_color } = req.body;

      if (sparkle_color !== undefined && sparkle_color !== null) {
        if (!isValidPresetColor(sparkle_color)) {
          return res.status(400).json({ error: "Invalid sparkle color preset" });
        }
      }
      if (ring_color !== undefined && ring_color !== null) {
        if (!isValidPresetColor(ring_color)) {
          return res.status(400).json({ error: "Invalid ring color preset" });
        }
      }

      const data: Record<string, unknown> = { updated_at: new Date() };
      if (typeof effects_enabled === "boolean") data.effects_enabled = effects_enabled;
      if (sparkle_color !== undefined) data.sparkle_color = sparkle_color || null;
      if (ring_color !== undefined) data.ring_color = ring_color || null;

      const result = await prisma.user_card_preferences.upsert({
        where: { userid: auth.userId },
        update: data,
        create: {
          userid: auth.userId,
          effects_enabled: typeof effects_enabled === "boolean" ? effects_enabled : true,
          sparkle_color: sparkle_color || null,
          ring_color: ring_color || null,
        },
      });

      return res.status(200).json({
        effects_enabled: result.effects_enabled,
        sparkle_color: result.sparkle_color,
        ring_color: result.ring_color,
      });
    } catch (err) {
      console.error("Card preferences PATCH error:", err);
      return res.status(500).json({ error: "Failed to save card preferences" });
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
