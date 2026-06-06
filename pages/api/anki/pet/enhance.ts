// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Bearer-authed enhancement for the Anki addon.
//          GET  (anki.pet.read)  -> getEnhanceView (equipment + scrolls + odds)
//          POST (anki.pet.write) -> applyEnhancement ({equipmentInventoryId,
//                                    scrollInventoryId}); server rolls the
//                                    success/destroy outcome — never trusted
//                                    from the client.
//          Shares lib/pet/enhanceService with the web. Rate-limited, user-scoped.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { getEnhanceView, applyEnhancement } from "@/lib/pet/enhanceService"
import { PetServiceError } from "@/lib/pet/careService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/enhance")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    try {
      return res.status(200).json(await getEnhanceView(ctx.userId))
    } catch (err) {
      console.error("[anki/pet/enhance GET] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not load enhancement" })
    }
  }

  if (req.method === "POST") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/enhance")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    const { equipmentInventoryId, scrollInventoryId } = (req.body || {}) as {
      equipmentInventoryId?: number
      scrollInventoryId?: number
    }
    try {
      return res.status(200).json(
        await applyEnhancement(ctx.userId, equipmentInventoryId as number, scrollInventoryId as number)
      )
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.code, message: err.message })
      }
      console.error("[anki/pet/enhance POST] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not enhance" })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "method_not_allowed", message: "GET or POST only" })
}
