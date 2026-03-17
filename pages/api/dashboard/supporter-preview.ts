// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Proxy to bot render API for supporter card effect
//          previews. Passes custom sparkle/ring colors and
//          effects_enabled flag alongside user data.
//          Rate limited to 1 request per 5 seconds per user.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/utils/adminAuth";
import { prisma } from "@/utils/prisma";
import { isValidPresetColor } from "@/constants/CardEffectPresets";

const BOT_RENDER_URL = process.env.BOT_RENDER_URL || "http://65.109.163.156:7100";
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || "";

const lastRequestMap = new Map<string, number>();
const RATE_LIMIT_MS = 5000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const now = Date.now();
  const lastReq = lastRequestMap.get(auth.discordId);
  if (lastReq && now - lastReq < RATE_LIMIT_MS) {
    return res.status(429).json({ error: "Please wait a few seconds before refreshing" });
  }
  lastRequestMap.set(auth.discordId, now);

  try {
    const sub = await prisma.user_subscriptions.findUnique({
      where: { userid: auth.userId },
      select: { tier: true, status: true },
    });

    const supporterTier =
      sub && sub.status === "ACTIVE" && sub.tier !== "NONE"
        ? sub.tier
        : null;

    const {
      sparkle_color,
      ring_color,
      effects_enabled,
      skin,
      guildid,
    } = req.query as Record<string, string | undefined>;

    if (sparkle_color && !isValidPresetColor(sparkle_color)) {
      return res.status(400).json({ error: "Invalid sparkle color" });
    }
    if (ring_color && !isValidPresetColor(ring_color)) {
      return res.status(400).json({ error: "Invalid ring color" });
    }

    const servers = await prisma.members.findMany({
      where: { userid: auth.userId },
      select: { guildid: true },
      take: 1,
    });

    const resolvedGuildId = guildid || (servers[0]?.guildid?.toString() ?? "0");

    const params = new URLSearchParams({
      type: "profile",
      userid: auth.userId.toString(),
      guildid: resolvedGuildId,
    });

    if (supporterTier) params.set("supporter_tier", supporterTier);
    if (sparkle_color) params.set("sparkle_color", sparkle_color);
    if (ring_color) params.set("ring_color", ring_color);
    if (effects_enabled !== undefined) params.set("effects_enabled", effects_enabled);
    if (skin) params.set("skin", skin);

    const headers: Record<string, string> = {};
    if (BOT_RENDER_AUTH) {
      headers["Authorization"] = BOT_RENDER_AUTH;
    }

    const response = await fetch(`${BOT_RENDER_URL}/render?${params}`, {
      headers,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `Render failed: ${text}`,
        fallback: true,
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
    res.setHeader("Content-Type", isGif ? "image/gif" : "image/png");
    res.setHeader("Cache-Control", "no-cache, no-store");
    return res.send(buffer);
  } catch (err: any) {
    console.error("Supporter preview error:", err);
    return res.status(503).json({
      error: "Card rendering service unavailable",
      fallback: true,
    });
  }
}
