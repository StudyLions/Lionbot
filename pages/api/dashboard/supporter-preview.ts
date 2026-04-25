// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Modified: 2026-03-20, 2026-04-25
// Purpose: Proxy to bot render API for supporter card effect
//          previews. Passes all customization preferences
//          (per-effect toggles, colors, particle style, intensity,
//          speed, border style, seasonal effects).
//          Rate limited per-user: 1.5s for active supporters
//          (so the LionHeart Studio's debounced auto-render
//          feels instant) and 5s for everyone else (anti-abuse).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/utils/adminAuth";
import { prisma } from "@/utils/prisma";
import { isValidHexColor } from "@/constants/CardEffectPresets";

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Remove hardcoded IP fallback -- staging and production use different ports
// --- Original code (commented out for rollback) ---
// const BOT_RENDER_URL = process.env.BOT_RENDER_URL || "http://65.109.163.156:7100";
// --- End original code ---
const BOT_RENDER_URL = process.env.BOT_RENDER_URL;
// --- END AI-MODIFIED ---
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || "";

// --- AI-REPLACED (2026-04-25) ---
// Reason: The flat 5s rate limit was the single biggest bottleneck of the
//         old supporter dashboard -- a paid subscriber tweaking sliders had
//         to wait 5 full seconds between every preview render. The new
//         LionHeart Studio debounces previews on the client and only fires
//         when the user pauses for 800ms, so a 1.5s server-side floor is
//         plenty of safety margin for active supporters while still keeping
//         a generous 5s gate for anonymous/inactive users (anti-abuse).
// --- Original code (commented out for rollback) ---
// const lastRequestMap = new Map<string, number>();
// const RATE_LIMIT_MS = 5000;
// --- End original code ---
const lastRequestMap = new Map<string, number>();
const SUPPORTER_RATE_LIMIT_MS = 1500;
const NON_SUPPORTER_RATE_LIMIT_MS = 5000;
// --- END AI-REPLACED ---

const COLOR_FIELDS = ["sparkle_color", "ring_color", "edge_glow_color", "particle_color"] as const;
const STRING_FIELDS = ["effects_enabled", "sparkles_enabled", "ring_enabled",
  "edge_glow_enabled", "particles_enabled", "effect_intensity",
  "particle_style", "animation_speed", "border_style", "seasonal_effects"] as const;

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

  try {
    const sub = await prisma.user_subscriptions.findUnique({
      where: { userid: auth.userId },
      select: { tier: true, status: true },
    });

    const supporterTier =
      sub && sub.status === "ACTIVE" && sub.tier !== "NONE"
        ? sub.tier
        : null;

    // --- AI-MODIFIED (2026-04-25) ---
    // Purpose: Apply a tighter (1.5s) rate limit window for active supporters
    //          so the LionHeart Studio's debounced auto-render flows naturally,
    //          and a generous (5s) window for everyone else as anti-abuse.
    const now = Date.now();
    const lastReq = lastRequestMap.get(auth.discordId);
    const limitMs = supporterTier ? SUPPORTER_RATE_LIMIT_MS : NON_SUPPORTER_RATE_LIMIT_MS;
    if (lastReq && now - lastReq < limitMs) {
      const retryAfter = Math.ceil((limitMs - (now - lastReq)) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: supporterTier
          ? "Slow down a touch \u2014 try again in a moment"
          : "Please wait a few seconds before refreshing",
        retryAfter,
      });
    }
    lastRequestMap.set(auth.discordId, now);
    // --- END AI-MODIFIED ---

    const query = req.query as Record<string, string | undefined>;

    for (const field of COLOR_FIELDS) {
      if (query[field] && !isValidHexColor(query[field])) {
        return res.status(400).json({ error: `Invalid color: ${field}` });
      }
    }

    const servers = await prisma.members.findMany({
      where: { userid: auth.userId },
      select: { guildid: true },
      take: 1,
    });

    const resolvedGuildId = query.guildid || (servers[0]?.guildid?.toString() ?? "0");

    const params = new URLSearchParams({
      type: "profile",
      userid: auth.userId.toString(),
      guildid: resolvedGuildId,
    });

    if (supporterTier) params.set("supporter_tier", supporterTier);

    for (const field of COLOR_FIELDS) {
      if (query[field]) params.set(field, query[field]!);
    }
    for (const field of STRING_FIELDS) {
      if (query[field] !== undefined) params.set(field, query[field]!);
    }
    if (query.skin) params.set("skin", query.skin);

    const headers: Record<string, string> = {};
    if (BOT_RENDER_AUTH) {
      headers["Authorization"] = BOT_RENDER_AUTH;
    }

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Fail fast when render URL is not configured
    if (!BOT_RENDER_URL) {
      return res.status(503).json({ error: "Render service not configured" });
    }
    // --- END AI-MODIFIED ---

    const response = await fetch(`${BOT_RENDER_URL}/render?${params}`, {
      headers,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Render API returned ${response.status}: ${text}`);
      if (response.status === 401) {
        return res.status(503).json({
          error: "Card rendering service authentication failed. Please contact support.",
          fallback: true,
        });
      }
      return res.status(response.status).json({
        error: `Card rendering failed (${response.status}). Try again in a moment.`,
        fallback: true,
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
    res.setHeader("Content-Type", isGif ? "image/gif" : "image/png");
    res.setHeader("Cache-Control", "no-cache, no-store");
    return res.send(buffer);
  } catch (err: unknown) {
    console.error("Supporter preview error:", err);
    return res.status(503).json({
      error: "Card rendering service unavailable",
      fallback: true,
    });
  }
}
