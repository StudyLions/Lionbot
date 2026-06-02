// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-02
// Purpose: Bearer-authed equip/unequip for the Anki addon
//          (anki.pet.write), rate-limited, user-scoped via the bearer.
//          Shares lib/pet/inventoryService.equipItem with the web —
//          server-authoritative (client sends inventoryId/action only).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { equipItem } from "@/lib/pet/inventoryService"
import { PetServiceError } from "@/lib/pet/careService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "method_not_allowed", message: "POST only" })
  }
  const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
  if (!ctx) return
  const rl = ankiRateLimit(ctx.userId, "inventory/equip")
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
  }
  try {
    const result = await equipItem(ctx.userId, (req.body || {}) as Record<string, unknown>)
    return res.status(200).json(result)
  } catch (err) {
    if (err instanceof PetServiceError) {
      return res.status(err.status).json({ error: err.code, message: err.message })
    }
    console.error("[anki/pet/inventory/equip] failed:", err)
    return res.status(503).json({ error: "db_unavailable", message: "Could not update equipment" })
  }
}
