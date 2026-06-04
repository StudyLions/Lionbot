// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Bearer-authed FRIENDS for the Anki addon.
//   GET  (anki.pet.read):
//     ?view=list                 -> listFriends
//     ?view=pending              -> listPendingRequests
//     ?view=profile&userId=<id>  -> getFriendProfile
//   POST (anki.pet.write) { action, ... }:
//     request  {query}                      -> sendFriendRequest
//     respond  {requestId, action}          -> respondFriendRequest
//     remove   {targetUserId}               -> removeFriend
//     interact {targetUserId, type, plotId} -> interactWithFriend (friendship-gated, daily-deduped)
//   Shares lib/pet/friendsService with the web. Rate-limited, user-scoped.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { PetServiceError } from "@/lib/pet/careService"
import {
  listFriends,
  listPendingRequests,
  getFriendProfile,
  sendFriendRequest,
  respondFriendRequest,
  removeFriend,
  interactWithFriend,
} from "@/lib/pet/friendsService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/friends")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    const view = (req.query.view as string) || "list"
    try {
      if (view === "pending") return res.status(200).json(await listPendingRequests(ctx.userId))
      if (view === "profile") return res.status(200).json(await getFriendProfile(ctx.userId, req.query.userId))
      return res.status(200).json(await listFriends(ctx.userId))
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.code, message: err.message })
      }
      console.error("[anki/pet/friends GET] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not load friends" })
    }
  }

  if (req.method === "POST") {
    const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
    if (!ctx) return
    const rl = ankiRateLimit(ctx.userId, "pet/friends")
    if (!rl.ok) {
      res.setHeader("Retry-After", String(rl.retryAfter))
      return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
    }
    const body = (req.body || {}) as {
      action?: string
      query?: string
      requestId?: number
      decision?: string // "accept" | "decline" (distinct from the top-level action)
      targetUserId?: string
      type?: string
      plotId?: number
    }
    try {
      let out
      switch (body.action) {
        case "request": out = await sendFriendRequest(ctx.userId, body.query); break
        case "respond": out = await respondFriendRequest(ctx.userId, body.requestId, body.decision); break
        case "remove": out = await removeFriend(ctx.userId, body.targetUserId); break
        case "interact": out = await interactWithFriend(ctx.userId, body.targetUserId, body.type, body.plotId); break
        default:
          return res.status(400).json({ error: "bad_action", message: "Unknown friends action" })
      }
      return res.status(200).json(out)
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.code, message: err.message })
      }
      console.error("[anki/pet/friends POST] failed:", err)
      return res.status(503).json({ error: "db_unavailable", message: "Could not update friends" })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "method_not_allowed", message: "GET or POST only" })
}
