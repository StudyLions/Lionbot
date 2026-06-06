// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Bearer-authed FAMILY (clan) core for the Anki addon.
//   GET  (anki.pet.read):
//     ?view=overview|members|invites|bank
//   POST (anki.pet.write) { action, ... }:
//     create  {name}                       -> createFamily (10k gold)
//     invite  {query}                      -> inviteToFamily (permission-gated)
//     respond {inviteId, decision}         -> respondFamilyInvite
//     leave                                -> leaveFamily (auto-transfer/disband)
//     bank    {bankAction, amount}         -> bankGold (deposit/withdraw, capped)
//   Shares lib/pet/familyService. Rate-limited, user-scoped.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { PetServiceError } from "@/lib/pet/careService"
import {
  getFamilyOverview,
  getMembers,
  listFamilyInvites,
  getBankGold,
  createFamily,
  inviteToFamily,
  respondFamilyInvite,
  leaveFamily,
  bankGold,
} from "@/lib/pet/familyService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/family")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    const view = (req.query.view as string) || "overview"
    try {
      if (view === "members") return res.status(200).json(await getMembers(ctx.userId))
      if (view === "invites") return res.status(200).json(await listFamilyInvites(ctx.userId))
      if (view === "bank") return res.status(200).json(await getBankGold(ctx.userId))
      return res.status(200).json(await getFamilyOverview(ctx.userId))
    } catch (err) {
      if (err instanceof PetServiceError) return res.status(err.status).json({ error: err.code, message: err.message })
      console.error("[anki/pet/family GET] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not load family" })
    }
  }

  if (req.method === "POST") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/family")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    const body = (req.body || {}) as {
      action?: string
      name?: string
      query?: string
      inviteId?: number
      decision?: string
      bankAction?: string
      amount?: number
    }
    try {
      let out
      switch (body.action) {
        case "create": out = await createFamily(ctx.userId, body.name); break
        case "invite": out = await inviteToFamily(ctx.userId, body.query); break
        case "respond": out = await respondFamilyInvite(ctx.userId, body.inviteId, body.decision); break
        case "leave": out = await leaveFamily(ctx.userId); break
        case "bank": out = await bankGold(ctx.userId, body.bankAction, body.amount); break
        default:
          return res.status(400).json({ error: "bad_action", message: "Unknown family action" })
      }
      return res.status(200).json(out)
    } catch (err) {
      if (err instanceof PetServiceError) return res.status(err.status).json({ error: err.code, message: err.message })
      console.error("[anki/pet/family POST] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not update family" })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "method_not_allowed", message: "GET or POST only" })
}
