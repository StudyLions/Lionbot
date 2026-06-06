// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19  (computation extracted to lib/anki/reviewStats 2026-06-06)
// Purpose: Stats summary for the addon's "Anki Stats" tab (bearer-authed).
//          Thin wrapper: auth + rate-limit, then delegate to the shared
//          getReviewStats() — the ONE computation also used by the website
//          dashboard's session-authed summary, so the numbers never drift.
//          Returns today/week/month/all-time card counts, streak, global
//          rank (today + all-time), and today's gold progress.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { getReviewStats } from "@/lib/anki/reviewStats"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed", message: "GET only" })
  }

  const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
  if (!ctx) return

  // Per-user rate limit — DoS backstop (the addon is public).
  const rl = ankiRateLimit(ctx.userId, "me/stats")
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
  }

  try {
    return res.status(200).json(await getReviewStats(ctx.userId))
  } catch (err) {
    console.error("[anki/me/stats] failed:", err)
    return res.status(503).json({ error: "db_unavailable", message: "Could not load stats" })
  }
}
