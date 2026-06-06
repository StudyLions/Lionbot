// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-02
// Purpose: Bearer-authed inventory list for the Anki addon. Read-only
//          (anki.pet.read), rate-limited, user-scoped via the bearer.
//          Shares lib/pet/inventoryService.listInventory with the web.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { listInventory } from "@/lib/pet/inventoryService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed", message: "GET only" })
  }
  const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
  if (!ctx) return
  const rl = ankiRateLimit(ctx.userId, "inventory")
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
  }
  try {
    const filter = (req.query.filter as string) || "all"
    return res.status(200).json(await listInventory(ctx.userId, filter))
  } catch (err) {
    console.error("[anki/pet/inventory] failed:", err)
    return res.status(503).json({ error: "db_unavailable", message: "Could not load inventory" })
  }
}
