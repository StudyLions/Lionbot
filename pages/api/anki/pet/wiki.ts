// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Bearer-authed read-only WIKI (item catalog) for the Anki addon.
//   GET (anki.pet.read):
//     ?view=browse [&search&category&rarity&sort&page&pageSize] -> browseWiki
//     ?view=item&itemId=<id>                                    -> getWikiItem
//   Shares lib/pet/wikiService. Rate-limited, user-scoped (for "you own N").
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { PetServiceError } from "@/lib/pet/careService"
import { browseWiki, getWikiItem } from "@/lib/pet/wikiService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed", message: "GET only" })
  }
  const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
  if (!ctx) return
  const rl = ankiRateLimit(ctx.userId, "pet/wiki")
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
  }
  try {
    if ((req.query.view as string) === "item") {
      return res.status(200).json(await getWikiItem(ctx.userId, req.query.itemId))
    }
    return res.status(200).json(
      await browseWiki(ctx.userId, {
        search: req.query.search as string,
        category: req.query.category as string,
        rarity: req.query.rarity as string,
        sort: req.query.sort as string,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      })
    )
  } catch (err) {
    if (err instanceof PetServiceError) return res.status(err.status).json({ error: err.code, message: err.message })
    console.error("[anki/pet/wiki] failed:", err)
    return res.status(503).json({ error: "db_unavailable", message: "Could not load the wiki" })
  }
}
