// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-06
// Purpose: Bearer-authed room FURNISHING for the Anki addon (native Furnish
//          picker). Shares lib/pet/roomFurnitureService with the cheat-proof
//          placement rules. Rate-limited, user-scoped.
//          GET  (anki.pet.read)  -> getFurnishing
//          POST (anki.pet.write) { action: "set", slot, assetPath }
//                                 { action: "clear", slot }
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { getFurnishing, setFurniture, clearFurniture } from "@/lib/pet/roomFurnitureService"
import { PetServiceError } from "@/lib/pet/careService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/room-furniture")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    try {
      return res.status(200).json(await getFurnishing(ctx.userId))
    } catch (err) {
      console.error("[anki/pet/room-furniture GET] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not load furnishing" })
    }
  }

  if (req.method === "POST") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/room-furniture")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    const { action, slot, assetPath } = (req.body || {}) as {
      action?: string
      slot?: string
      assetPath?: string
    }
    try {
      if (action === "set") {
        return res.status(200).json(await setFurniture(ctx.userId, slot, assetPath))
      }
      if (action === "clear") {
        return res.status(200).json(await clearFurniture(ctx.userId, slot))
      }
      return res.status(400).json({ error: "bad_action", message: "Unknown furnishing action" })
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.code, message: err.message })
      }
      console.error("[anki/pet/room-furniture POST] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not update furnishing" })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "method_not_allowed" })
}
