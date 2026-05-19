// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Manage an authenticated user's paired Anki devices
//          from the /dashboard/anki website page.
//
//          Authentication uses the NextAuth session cookie
//          (NOT an Anki bearer) — the user might be signing out
//          devices from a browser without their phone/laptop
//          having the bearer.
//
//          GET   /api/anki/devices         -> list user's devices
//          POST  /api/anki/devices?action=revoke    body: { device_id }
//          POST  /api/anki/devices?action=revoke_all
//          POST  /api/anki/devices?action=rename    body: { device_id, name }
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/utils/prisma"
import { invalidateDeviceCache } from "@/lib/anki/requireAuth"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function getDiscordIdFromSession(req: NextApiRequest): Promise<string | null> {
  const token = await getToken({
    req,
    secret: process.env.SECRET,
    cookieName: "__Secure-next-auth.session-token.v2",
  })
  if (!token?.discordId) return null
  return token.discordId as string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const discordId = await getDiscordIdFromSession(req)
  if (!discordId) {
    return res
      .status(401)
      .json({ error: "not_authenticated", message: "Sign in with Discord first" })
  }
  const userId = BigInt(discordId)

  if (req.method === "GET") {
    return handleList(userId, res)
  }
  if (req.method === "POST") {
    const action = req.query.action as string | undefined
    if (action === "revoke") return handleRevoke(userId, req, res)
    if (action === "revoke_all") return handleRevokeAll(userId, res)
    if (action === "rename") return handleRename(userId, req, res)
    return res
      .status(400)
      .json({ error: "bad_action", message: "Unknown action" })
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "method_not_allowed", message: "GET or POST" })
}

async function handleList(userId: bigint, res: NextApiResponse) {
  const devices = await prisma.anki_devices.findMany({
    where: { userid: userId },
    orderBy: [{ revoked_at: { sort: "asc", nulls: "first" } }, { last_seen_at: "desc" }],
    select: {
      device_id: true,
      device_name: true,
      addon_version: true,
      os_platform: true,
      anki_version: true,
      created_at: true,
      last_seen_at: true,
      revoked_at: true,
      revoked_reason: true,
    },
  })
  return res.status(200).json({
    devices: devices.map((d) => ({
      device_id: d.device_id,
      device_name: d.device_name,
      addon_version: d.addon_version,
      os_platform: d.os_platform,
      anki_version: d.anki_version,
      created_at: d.created_at.toISOString(),
      last_seen_at: d.last_seen_at.toISOString(),
      revoked_at: d.revoked_at?.toISOString() ?? null,
      revoked_reason: d.revoked_reason,
    })),
  })
}

async function handleRevoke(
  userId: bigint,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = (req.body || {}) as { device_id?: string }
  if (!body.device_id || !UUID_RE.test(body.device_id)) {
    return res.status(400).json({ error: "bad_device_id", message: "device_id must be a UUID" })
  }
  const result = await prisma.anki_devices.updateMany({
    where: {
      device_id: body.device_id,
      userid: userId,
      revoked_at: null,
    },
    data: {
      revoked_at: new Date(),
      revoked_reason: "dashboard_revoke",
    },
  })
  invalidateDeviceCache(body.device_id)
  if (result.count === 0) {
    return res
      .status(404)
      .json({ error: "device_not_found", message: "No matching active device" })
  }
  return res.status(200).json({ ok: true, revoked: result.count })
}

async function handleRevokeAll(userId: bigint, res: NextApiResponse) {
  // Get IDs first so we can invalidate the cache. We don't need
  // them otherwise — the UPDATE is fine without.
  const ids = await prisma.anki_devices.findMany({
    where: { userid: userId, revoked_at: null },
    select: { device_id: true },
  })
  const result = await prisma.anki_devices.updateMany({
    where: { userid: userId, revoked_at: null },
    data: {
      revoked_at: new Date(),
      revoked_reason: "dashboard_revoke_all",
    },
  })
  ids.forEach((d) => invalidateDeviceCache(d.device_id))
  return res.status(200).json({ ok: true, revoked: result.count })
}

async function handleRename(
  userId: bigint,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = (req.body || {}) as { device_id?: string; name?: string }
  if (!body.device_id || !UUID_RE.test(body.device_id)) {
    return res.status(400).json({ error: "bad_device_id", message: "device_id must be a UUID" })
  }
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name || name.length > 64) {
    return res
      .status(400)
      .json({ error: "bad_name", message: "name must be 1..64 chars" })
  }
  const result = await prisma.anki_devices.updateMany({
    where: { device_id: body.device_id, userid: userId },
    data: { device_name: name },
  })
  if (result.count === 0) {
    return res.status(404).json({ error: "device_not_found", message: "No matching device" })
  }
  return res.status(200).json({ ok: true, renamed: result.count })
}
