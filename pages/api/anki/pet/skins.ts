// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Bearer-authed gameboy-skin list + equip for the Anki addon.
//          GET  (anki.pet.read)  -> listSkins  (ownership/eligibility/active)
//          POST (anki.pet.write) -> equipSkin  ({ skinId }, validated)
//          Shares lib/pet/skinService with the web. Rate-limited, user-scoped.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { listSkins, equipSkin, purchaseSkin } from "@/lib/pet/skinService"
import { PetServiceError } from "@/lib/pet/careService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/skins")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    try {
      return res.status(200).json(await listSkins(ctx.userId))
    } catch (err) {
      console.error("[anki/pet/skins GET] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not load skins" })
    }
  }

  if (req.method === "POST") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/skins")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    const { action, skinId } = (req.body || {}) as { action?: string; skinId?: number }
    try {
      const out = action === "purchase"
        ? await purchaseSkin(ctx.userId, skinId)
        : await equipSkin(ctx.userId, skinId)
      return res.status(200).json(out)
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.code, message: err.message })
      }
      console.error("[anki/pet/skins POST] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not equip skin" })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "method_not_allowed", message: "GET or POST only" })
}
