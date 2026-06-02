// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-02
// Purpose: Bearer-authed CARE action for the Anki addon
//          (feed / bathe / sleep). The addon's in-app care buttons
//          POST here instead of opening the website.
//
//          Server-authoritative: the addon sends ONLY {action};
//          the userId comes from the verified bearer (never the
//          client), and all logic lives in the shared
//          lib/pet/careService.applyCare — the SAME path the website
//          /api/pet/care uses. Requires the anki.pet.write scope and
//          is per-user rate limited.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { applyCare, PetServiceError } from "@/lib/pet/careService"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res
      .status(405)
      .json({ error: "method_not_allowed", message: "POST only" })
  }

  const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
  if (!ctx) return

  const rl = ankiRateLimit(ctx.userId, "pet/care")
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return res
      .status(429)
      .json({ error: "rate_limited", message: "Too many requests — slow down." })
  }

  const { action } = (req.body ?? {}) as { action?: string }

  try {
    const result = await applyCare(ctx.userId, action ?? "")
    return res.status(200).json(result)
  } catch (err) {
    if (err instanceof PetServiceError) {
      return res.status(err.status).json({ error: err.code, message: err.message })
    }
    console.error("[anki/pet/care] failed:", err)
    return res
      .status(503)
      .json({ error: "db_unavailable", message: "Could not apply care — please retry" })
  }
}
