// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: API endpoint for users to request data deletion,
//          check request status, or cancel a pending request.
//          Sends webhook to admin server with approval link.
// ============================================================
// --- AI-REPLACED (2026-04-07) ---
// Reason: Complete rewrite for GDPR compliance -- added webhook
//         notifications, approval tokens, cooling-off period,
//         cancellation support, and data summary counts.
// What the new code does better: Webhook-based admin notification
//         with secure approval links instead of bot DM, 14-day
//         cooling-off with user cancellation, data summary in webhook.
// --- Original code (commented out for rollback) ---
// import type { NextApiRequest, NextApiResponse } from "next"
// import { requireAuth } from "@/utils/adminAuth"
// import { prisma } from "@/utils/prisma"
//
// const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
// const NOTIFICATION_CHANNEL = process.env.DELETION_NOTIFICATION_CHANNEL || "1141300314524373042"
// const ADMIN_USER_ID = process.env.DELETION_ADMIN_USER_ID || "757652191656804413"
//
// async function sendDiscordNotification(discordId: string, discordTag: string | null, reason: string | null, requestId: number) {
//   if (!BOT_TOKEN) { console.error("DISCORD_BOT_TOKEN not set"); return }
//   const embed = { title: "Data Deletion Request", color: 0xff4444, fields: [...], timestamp: new Date().toISOString() }
//   try { await fetch(`https://discord.com/api/v10/channels/${NOTIFICATION_CHANNEL}/messages`, { ... }) }
//   catch (err) { console.error("Failed to send Discord deletion notification:", err) }
// }
//
// export default async function handler(req, res) {
//   if (req.method === "GET") { ... check for pending request ... }
//   if (req.method === "POST") { ... create request + send Discord notification ... }
//   res.setHeader("Allow", "GET, POST"); return res.status(405).end("Method Not Allowed")
// }
// --- End original code ---
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"
import { randomBytes } from "crypto"
import { getUserDataCounts } from "@/utils/gdpr-export"

const WEBHOOK_URL = process.env.GDPR_WEBHOOK_URL
const COOLOFF_DAYS = 14

function generateToken(): string {
  return randomBytes(48).toString("hex")
}

async function sendWebhookNotification(
  discordId: string,
  discordTag: string | null,
  reason: string | null,
  requestId: number,
  approvalToken: string,
  cooloffExpiresAt: Date,
  dataCounts: Record<string, number | boolean>,
) {
  if (!WEBHOOK_URL) {
    console.error("GDPR_WEBHOOK_URL not set, cannot send deletion request webhook")
    return
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://lionbot-website.vercel.app"
  const approvalLink = `${baseUrl}/api/privacy/process-deletion?requestId=${requestId}&token=${approvalToken}`

  const countLines = Object.entries(dataCounts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k.replace(/_/g, " ")}: **${v}**`)
    .join("\n")

  const embeds = [
    {
      title: "Data Deletion Request",
      color: 0xff4444,
      fields: [
        { name: "User", value: `<@${discordId}> (${discordId})`, inline: true },
        { name: "Request ID", value: `#${requestId}`, inline: true },
        ...(discordTag ? [{ name: "Discord Tag", value: discordTag, inline: true }] : []),
        ...(reason ? [{ name: "Reason", value: reason.slice(0, 1024) }] : []),
        { name: "Cooling-Off Expires", value: `<t:${Math.floor(cooloffExpiresAt.getTime() / 1000)}:F>` },
        { name: "Data Summary", value: countLines.slice(0, 1024) || "No data found" },
      ],
      timestamp: new Date().toISOString(),
    },
    {
      title: "Approval Link",
      description: `[Click to review and approve deletion](${approvalLink})\n\n` +
        `This link is valid only for this request. The deletion cannot be processed until after the cooling-off period ends.`,
      color: 0xffaa00,
    },
  ]

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "A user is requesting data deletion.",
        embeds,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error(`Webhook notification failed (${res.status}):`, text)
    }
  } catch (err) {
    console.error("Failed to send deletion webhook:", err)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const auth = await requireAuth(req, res)
    if (!auth) return

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
        cooloffExpiresAt: existing.cooloff_expires_at?.toISOString() ?? null,
      } : null,
    })
  }

  if (req.method === "POST") {
    const auth = await requireAuth(req, res)
    if (!auth) return

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
    const approvalToken = generateToken()
    const cooloffExpiresAt = new Date(Date.now() + COOLOFF_DAYS * 24 * 60 * 60 * 1000)

    const request = await prisma.data_deletion_requests.create({
      data: {
        userid: BigInt(auth.discordId),
        discord_tag: typeof discordTag === "string" ? discordTag.slice(0, 100) : null,
        reason: typeof reason === "string" ? reason.slice(0, 1000) : null,
        approval_token: approvalToken,
        cooloff_expires_at: cooloffExpiresAt,
      },
    })

    const dataCounts = await getUserDataCounts(BigInt(auth.discordId))

    await sendWebhookNotification(
      auth.discordId,
      request.discord_tag,
      request.reason,
      request.requestid,
      approvalToken,
      cooloffExpiresAt,
      dataCounts,
    )

    return res.status(201).json({
      success: true,
      requestId: request.requestid,
      cooloffExpiresAt: cooloffExpiresAt.toISOString(),
      message: `Your data deletion request has been submitted. There is a ${COOLOFF_DAYS}-day cooling-off period during which you can cancel. After that, an admin will review and process your request.`,
    })
  }

  if (req.method === "DELETE") {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const existing = await prisma.data_deletion_requests.findFirst({
      where: {
        userid: BigInt(auth.discordId),
        status: "PENDING",
      },
    })

    if (!existing) {
      return res.status(404).json({ error: "No pending deletion request found." })
    }

    await prisma.data_deletion_requests.update({
      where: { requestid: existing.requestid },
      data: {
        status: "REJECTED",
        resolved_at: new Date(),
        resolved_by: "user_cancelled",
        notes: "Cancelled by user during cooling-off period.",
      },
    })

    if (WEBHOOK_URL) {
      try {
        await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [{
              title: "Deletion Request Cancelled",
              description: `User <@${auth.discordId}> (${auth.discordId}) cancelled their deletion request #${existing.requestid}.`,
              color: 0x44ff44,
              timestamp: new Date().toISOString(),
            }],
          }),
        })
      } catch {}
    }

    return res.status(200).json({
      success: true,
      message: "Your deletion request has been cancelled.",
    })
  }

  res.setHeader("Allow", "GET, POST, DELETE")
  return res.status(405).end("Method Not Allowed")
}
// --- END AI-REPLACED ---
