// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Sign out the Anki addon by revoking the device row.
//
//          Two modes:
//            POST { scope: "this" }       — revoke the device that
//                                            owns the bearer.
//            POST { scope: "all" }        — revoke all of this user's
//                                            devices (including this one).
//
//          Both modes succeed even if the bearer is missing or
//          invalid, returning 200 — the addon must always be
//          able to "sign out" from its perspective (clear its
//          local credentials) regardless of server state. The
//          revocation work is best-effort.
//
//          A future /dashboard/anki page will call this with a
//          NextAuth cookie (not a bearer) to revoke OTHER
//          devices the user owns — that flow lives in
//          /api/anki/devices.ts, not here.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { extractAnkiBearer, verifyAnkiBearer } from "@/lib/anki/auth"
import { invalidateDeviceCache } from "@/lib/anki/requireAuth"

interface SignoutBody {
  scope?: "this" | "all"
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "method_not_allowed", message: "POST only" })
  }

  const body = (req.body || {}) as SignoutBody
  const scope = body.scope === "all" ? "all" : "this"

  const token = extractAnkiBearer(req)
  if (!token) {
    // No bearer presented: the addon already lost its session.
    // Nothing to revoke server-side. Reply OK so the client UX
    // is consistent.
    return res.status(200).json({ ok: true, revoked: 0, note: "no_bearer" })
  }

  const verified = await verifyAnkiBearer(token)
  if (!verified) {
    return res.status(200).json({ ok: true, revoked: 0, note: "bearer_invalid" })
  }

  try {
    if (scope === "all") {
      const result = await prisma.anki_devices.updateMany({
        where: {
          userid: BigInt(verified.discordId),
          revoked_at: null,
        },
        data: {
          revoked_at: new Date(),
          revoked_reason: "user_signed_out_everywhere",
        },
      })
      // Best-effort cache invalidation. We don't know all the
      // device_ids without another query; the 60s TTL will
      // naturally evict them.
      invalidateDeviceCache(verified.deviceId)
      return res.status(200).json({ ok: true, revoked: result.count, scope: "all" })
    } else {
      const result = await prisma.anki_devices.updateMany({
        where: {
          device_id: verified.deviceId,
          revoked_at: null,
        },
        data: {
          revoked_at: new Date(),
          revoked_reason: "user_signed_out",
        },
      })
      invalidateDeviceCache(verified.deviceId)
      return res.status(200).json({ ok: true, revoked: result.count, scope: "this" })
    }
  } catch (err) {
    console.error("[anki/signout] DB update failed:", err)
    return res.status(503).json({
      error: "db_unavailable",
      message: "Could not revoke device",
      ok: false,
    })
  }
}
