// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Bearer-authed room read + switch for the Anki addon.
//          GET  (anki.pet.read)  -> getRoomState  (rooms + active + balances)
//          POST (anki.pet.write) -> switchRoom    ({ roomId }, ownership-checked)
//          Shares lib/pet/roomService with the web. Rate-limited, user-scoped.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { getRoomState, switchRoom, purchaseRoom } from "@/lib/pet/roomService"
import { PetServiceError } from "@/lib/pet/careService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/room")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    try {
      return res.status(200).json(await getRoomState(ctx.userId))
    } catch (err) {
      console.error("[anki/pet/room GET] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not load rooms" })
    }
  }

  if (req.method === "POST") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/room")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    const { action, roomId } = (req.body || {}) as { action?: string; roomId?: number }
    try {
      if (action === "purchase") {
        // Buy then activate (the user owns it after purchaseRoom).
        const bought = await purchaseRoom(ctx.userId, roomId)
        const switched = await switchRoom(ctx.userId, roomId)
        return res.status(200).json({ ...bought, activeRoomId: switched.activeRoomId })
      }
      return res.status(200).json(await switchRoom(ctx.userId, roomId))
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.code, message: err.message })
      }
      console.error("[anki/pet/room POST] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not switch room" })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "method_not_allowed", message: "GET or POST only" })
}
