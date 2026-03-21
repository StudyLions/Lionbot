// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: API endpoint for users to request data deletion.
//          Requires Discord auth. Logs to DB, notifies via
//          Discord bot message in the admin server.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Switch from raw getToken (no rate limit) to requireAuth (rate-limited).
//          Move hardcoded Discord IDs to env vars.
import { requireAuth } from "@/utils/adminAuth"
// --- End original code ---
// import { getToken } from "next-auth/jwt"
// --- END AI-MODIFIED ---
import { prisma } from "@/utils/prisma"

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Move hardcoded Discord IDs to env vars for flexibility
const NOTIFICATION_CHANNEL = process.env.DELETION_NOTIFICATION_CHANNEL || "1141300314524373042"
const ADMIN_USER_ID = process.env.DELETION_ADMIN_USER_ID || "757652191656804413"
// --- END AI-MODIFIED ---

async function sendDiscordNotification(discordId: string, discordTag: string | null, reason: string | null, requestId: number) {
  if (!BOT_TOKEN) {
    console.error("DISCORD_BOT_TOKEN not set, cannot send deletion request notification")
    return
  }

  const embed = {
    title: "Data Deletion Request",
    color: 0xff4444,
    fields: [
      { name: "User", value: `<@${discordId}> (${discordId})`, inline: true },
      { name: "Request ID", value: `#${requestId}`, inline: true },
      ...(discordTag ? [{ name: "Discord Tag", value: discordTag, inline: true }] : []),
      ...(reason ? [{ name: "Reason", value: reason.slice(0, 1024) }] : []),
    ],
    timestamp: new Date().toISOString(),
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${NOTIFICATION_CHANNEL}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `<@${ADMIN_USER_ID}> — A user is requesting data deletion.`,
        embeds: [embed],
        allowed_mentions: { users: [ADMIN_USER_ID] },
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`Discord notification failed (${res.status}):`, text)
    }
  } catch (err) {
    console.error("Failed to send Discord deletion notification:", err)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Use requireAuth for rate limiting
    const auth = await requireAuth(req, res)
    if (!auth) return
    // --- END AI-MODIFIED ---

    const existing = await prisma.data_deletion_requests.findFirst({
      where: {
        userid: BigInt(auth.discordId),
        status: "PENDING",
      },
      orderBy: { requested_at: "desc" },
    })

    return res.status(200).json({
      hasPending: !!existing,
      request: existing ? {
        requestId: existing.requestid,
        status: existing.status,
        requestedAt: existing.requested_at.toISOString(),
      } : null,
    })
  }

  if (req.method === "POST") {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Use requireAuth for rate limiting
    const auth = await requireAuth(req, res)
    if (!auth) return
    // --- END AI-MODIFIED ---

    const existing = await prisma.data_deletion_requests.findFirst({
      where: {
        userid: BigInt(auth.discordId),
        status: "PENDING",
      },
    })

    if (existing) {
      return res.status(409).json({
        error: "You already have a pending deletion request.",
        requestId: existing.requestid,
      })
    }

    const { reason, discordTag } = req.body || {}

    const request = await prisma.data_deletion_requests.create({
      data: {
        userid: BigInt(auth.discordId),
        discord_tag: typeof discordTag === "string" ? discordTag.slice(0, 100) : null,
        reason: typeof reason === "string" ? reason.slice(0, 1000) : null,
      },
    })

    await sendDiscordNotification(
      auth.discordId,
      request.discord_tag,
      request.reason,
      request.requestid
    )

    return res.status(201).json({
      success: true,
      requestId: request.requestid,
      message: "Your data deletion request has been submitted. We will process it within 30 days.",
    })
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).end("Method Not Allowed")
}
