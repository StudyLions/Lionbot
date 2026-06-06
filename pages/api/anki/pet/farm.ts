// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Bearer-authed INTERACTIVE farm for the Anki addon.
//          GET  (anki.pet.read)  -> getFarmView  (plots + seed catalog + gold)
//          POST (anki.pet.write) -> plant/water/harvest/remove/clear +
//                                    waterAll/plantAll/harvestAll
//          Shares lib/pet/farmService with the web — server-authoritative
//          gold spend/grant + rarity rolls + harvest item drops. Rate-
//          limited, user-scoped via the bearer (no IDOR).
//          (The older /api/anki/farm stays as the lightweight summary used
//          by the farm-portrait render.)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { PetServiceError } from "@/lib/pet/careService"
import {
  getFarmView,
  plantSeed,
  waterPlot,
  harvestPlot,
  uprootPlot,
  clearPlot,
  waterAll,
  plantAll,
  harvestAll,
} from "@/lib/pet/farmService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/farm")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    try {
      return res.status(200).json(await getFarmView(ctx.userId))
    } catch (err) {
      console.error("[anki/pet/farm GET] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not load farm" })
    }
  }

  if (req.method === "POST") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/farm")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    const { action, plotId, seedId } = (req.body || {}) as {
      action?: string
      plotId?: number
      seedId?: number
    }
    try {
      let out
      switch (action) {
        case "plant": out = await plantSeed(ctx.userId, plotId as number, seedId as number); break
        case "water": out = await waterPlot(ctx.userId, plotId as number); break
        case "harvest": out = await harvestPlot(ctx.userId, plotId as number); break
        case "remove": out = await uprootPlot(ctx.userId, plotId as number); break
        case "clear": out = await clearPlot(ctx.userId, plotId as number); break
        case "waterAll": out = await waterAll(ctx.userId); break
        case "plantAll": out = await plantAll(ctx.userId, seedId as number); break
        case "harvestAll": out = await harvestAll(ctx.userId); break
        default:
          return res.status(400).json({ error: "bad_action", message: "Unknown farm action" })
      }
      return res.status(200).json(out)
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.code, message: err.message })
      }
      console.error("[anki/pet/farm POST] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not update farm" })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "method_not_allowed", message: "GET or POST only" })
}
