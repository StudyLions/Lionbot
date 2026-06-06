// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Bearer-authed MARKETPLACE for the Anki addon.
//   GET  (anki.pet.read):
//     ?view=browse [&search&rarity&currency&sort&page&pageSize] -> browseMarketplace
//     ?view=mine                                                 -> getMyListings
//   POST (anki.pet.write) { action, ... }:
//     list   {itemId, quantity, pricePerUnit, currency, enhancementLevel} -> createListing
//     buy    {listingId, quantity}                                        -> buyListing (atomic, FOR UPDATE)
//     cancel {listingId}                                                  -> cancelListing
//   Shares lib/pet/marketplaceService. Rate-limited, user-scoped.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { PetServiceError } from "@/lib/pet/careService"
import {
  browseMarketplace,
  getMyListings,
  createListing,
  buyListing,
  cancelListing,
} from "@/lib/pet/marketplaceService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/marketplace")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    const view = (req.query.view as string) || "browse"
    try {
      if (view === "mine") return res.status(200).json(await getMyListings(ctx.userId))
      return res.status(200).json(
        await browseMarketplace(ctx.userId, {
          search: req.query.search as string,
          rarity: req.query.rarity as string,
          currency: req.query.currency as string,
          sort: req.query.sort as string,
          page: req.query.page ? Number(req.query.page) : undefined,
          pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        })
      )
    } catch (err) {
      if (err instanceof PetServiceError) return res.status(err.status).json({ error: err.code, message: err.message })
      console.error("[anki/pet/marketplace GET] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not load marketplace" })
    }
  }

  if (req.method === "POST") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/marketplace")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    const body = (req.body || {}) as {
      action?: string
      itemId?: number; quantity?: number; pricePerUnit?: number; currency?: string; enhancementLevel?: number
      listingId?: number
    }
    try {
      let out
      switch (body.action) {
        case "list": out = await createListing(ctx.userId, body); break
        case "buy": out = await buyListing(ctx.userId, body.listingId, body.quantity ?? 1); break
        case "cancel": out = await cancelListing(ctx.userId, body.listingId); break
        default:
          return res.status(400).json({ error: "bad_action", message: "Unknown marketplace action" })
      }
      return res.status(200).json(out)
    } catch (err) {
      if (err instanceof PetServiceError) return res.status(err.status).json({ error: err.code, message: err.message })
      console.error("[anki/pet/marketplace POST] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not update marketplace" })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "method_not_allowed", message: "GET or POST only" })
}
