// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Bearer-authed cosmetic-overlay set/clear for the Anki addon
//          (anki.pet.write), rate-limited, user-scoped. Shares
//          lib/pet/inventoryService.setCosmetic with the web. Purely
//          visual — never affects stat-bearing equipment / economy.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { setCosmetic, type CosmeticParams } from "@/lib/pet/inventoryService"
import { PetServiceError } from "@/lib/pet/careService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "method_not_allowed", message: "POST only" })
  }
  const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
  if (!ctx) return
  const rl = ankiRateLimit(ctx.userId, "inventory/cosmetic")
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
  }
  try {
    return res.status(200).json(await setCosmetic(ctx.userId, (req.body || {}) as CosmeticParams))
  } catch (err) {
    if (err instanceof PetServiceError) {
      return res.status(err.status).json({ error: err.code, message: err.message })
    }
    console.error("[anki/pet/inventory/cosmetic] failed:", err)
    return res.status(503).json({ error: "db_unavailable", message: "Could not update cosmetic" })
  }
}
