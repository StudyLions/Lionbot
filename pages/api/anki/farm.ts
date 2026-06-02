// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-20
// Purpose: Farm summary JSON for the Anki addon's Farm tab —
//          plot counts (planted / growing / ready / needs water /
//          dead / empty) + a per-plot list. Read-only; all farm
//          ACTIONS deep-link to the website (/pet/farm).
//
//          Auth: requires a valid Anki bearer (anki.pet.read).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"

type PlotStatus = "empty" | "dead" | "ready" | "needs_water" | "growing"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed" })
  }
  const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
  if (!ctx) return

  // --- AI-MODIFIED (2026-06-02) ---
  const rl = ankiRateLimit(ctx.userId, "farm")
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
  }
  // --- END AI-MODIFIED ---

  let rows
  try {
    rows = await prisma.lg_user_farm.findMany({
      where: { userid: ctx.userId },
      orderBy: { plot_id: "asc" },
      select: {
        plot_id: true,
        seed_id: true,
        growth_stage: true,
        dead: true,
        rarity: true,
        last_watered: true,
        lg_farm_seeds: { select: { name: true, water_interval_hours: true } },
      },
    })
  } catch (err) {
    console.error("[anki/farm] load failed:", err)
    return res.status(503).json({ error: "db_unavailable" })
  }

  const now = Date.now()
  const counts = { total: rows.length, planted: 0, growing: 0, ready: 0, needs_water: 0, dead: 0, empty: 0 }
  const plots = rows.map((r) => {
    let status: PlotStatus
    let watered = false
    if (r.last_watered) {
      const interval = (r.lg_farm_seeds?.water_interval_hours ?? 4) * 3600 * 1000
      watered = now - new Date(r.last_watered).getTime() < interval
    }
    if (!r.seed_id) {
      status = "empty"
      counts.empty++
    } else if (r.dead) {
      status = "dead"
      counts.dead++
      counts.planted++
    } else if ((r.growth_stage || 0) >= 5) {
      status = "ready"
      counts.ready++
      counts.planted++
    } else if (!watered) {
      status = "needs_water"
      counts.needs_water++
      counts.planted++
      counts.growing++
    } else {
      status = "growing"
      counts.growing++
      counts.planted++
    }
    return {
      plot: r.plot_id + 1,
      name: r.seed_id ? r.lg_farm_seeds?.name ?? "Plant" : null,
      stage: r.growth_stage || 0,
      rarity: r.rarity || "COMMON",
      status,
    }
  })

  res.setHeader("Cache-Control", "private, max-age=30")
  return res.status(200).json({ counts, plots })
}
