// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Validate an iOS bearer JWT and return the same user
//          shape as /api/auth/ios/exchange. The iOS app calls this
//          on cold start to confirm the cached session is still good
//          and to refresh `is_premium` live.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { extractBearer, verifyIosBearer } from "@/lib/ios/auth"
import { isLionheartActive } from "./exchange"

const DISCORD_USER_URL = "https://discord.com/api/users/@me"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const token = extractBearer(req)
  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" })
  }

  const verified = await verifyIosBearer(token)
  if (!verified) {
    return res
      .status(401)
      .json({ error: "Invalid or expired bearer token" })
  }

  // Fetch the Discord user fresh so the iOS profile reflects current
  // username/avatar/global_name/email rather than a stale snapshot
  // captured at exchange time.
  let username = ""
  let globalName: string | null = null
  let avatar: string | null = null
  let email: string | null = null
  try {
    const userRes = await fetch(DISCORD_USER_URL, {
      headers: { Authorization: `Bearer ${verified.discordAccessToken}` },
    })
    if (userRes.status === 401) {
      // The Discord access token inside the bearer expired. Tell the
      // iOS app to re-authenticate. (Phase 2+ will refresh transparently
      // using the stored refresh token; for now keep the contract simple.)
      return res
        .status(401)
        .json({ error: "Discord access token expired -- please sign in again" })
    }
    if (!userRes.ok) {
      const text = await userRes.text()
      console.error("[ios/me] users/@me failed:", userRes.status, text)
      // Fall through to a degraded response from DB so we don't lock
      // the user out on a transient Discord blip.
    } else {
      const u = (await userRes.json()) as {
        id: string
        username: string
        global_name?: string | null
        avatar?: string | null
        email?: string | null
      }
      username = u.username
      globalName = u.global_name ?? null
      avatar = u.avatar ?? null
      email = u.email ?? null
    }
  } catch (err) {
    console.error("[ios/me] Discord user request error:", err)
  }

  // If the Discord call degraded, fall back to whatever we have in
  // user_config so the response is still useful.
  if (!username || !email) {
    try {
      const cfg = await prisma.user_config.findUnique({
        where: { userid: BigInt(verified.discordId) },
        select: { name: true, email: true },
      })
      if (cfg) {
        if (!username) username = cfg.name || ""
        if (!email) email = cfg.email || null
      }
    } catch (err) {
      console.error("[ios/me] user_config lookup failed:", err)
    }
  }

  const isPremium = await isLionheartActive(verified.discordId)

  return res.status(200).json({
    user: {
      discord_id: verified.discordId,
      username: username || verified.discordId,
      global_name: globalName,
      avatar,
      email,
      is_premium: isPremium,
    },
  })
}
