// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-07
// Purpose: Token-authenticated endpoint for admin to preview
//          and execute a user data deletion. Called via the
//          secure link in the webhook notification.
//          GET = preview (dry-run), POST = execute deletion.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { getDeletionPreview, executeUserDeletion } from "@/utils/gdpr-deletion"

const WEBHOOK_URL = process.env.GDPR_WEBHOOK_URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { requestId, token } = req.query

  if (!requestId || !token || typeof requestId !== "string" || typeof token !== "string") {
    return res.status(400).json({ error: "Missing requestId or token." })
  }

  const requestIdNum = parseInt(requestId, 10)
  if (isNaN(requestIdNum)) {
    return res.status(400).json({ error: "Invalid requestId." })
  }

  const request = await prisma.data_deletion_requests.findUnique({
    where: { requestid: requestIdNum },
  })

  if (!request) {
    return res.status(404).json({ error: "Deletion request not found." })
  }

  if (request.approval_token !== token) {
    return res.status(403).json({ error: "Invalid approval token." })
  }

  if (request.status !== "PENDING") {
    return res.status(409).json({
      error: `This request has already been ${request.status.toLowerCase()}.`,
      status: request.status,
    })
  }

  if (req.method === "GET") {
    const now = new Date()
    const cooloffActive = request.cooloff_expires_at && request.cooloff_expires_at > now
    const preview = await getDeletionPreview(request.userid)

    return res.status(200).json({
      requestId: request.requestid,
      userId: request.userid.toString(),
      discordTag: request.discord_tag,
      reason: request.reason,
      requestedAt: request.requested_at.toISOString(),
      cooloffExpiresAt: request.cooloff_expires_at?.toISOString() ?? null,
      cooloffActive,
      preview,
    })
  }

  if (req.method === "POST") {
    const now = new Date()
    if (request.cooloff_expires_at && request.cooloff_expires_at > now) {
      return res.status(403).json({
        error: "The cooling-off period has not expired yet.",
        cooloffExpiresAt: request.cooloff_expires_at.toISOString(),
      })
    }

    try {
      await prisma.data_deletion_requests.update({
        where: { requestid: requestIdNum },
        data: { status: "APPROVED" },
      })

      const summary = await executeUserDeletion(request.userid)

      await prisma.data_deletion_requests.update({
        where: { requestid: requestIdNum },
        data: {
          status: "COMPLETED",
          resolved_at: new Date(),
          resolved_by: "admin_approved",
          deletion_summary: summary as object,
          notes: `Deletion executed successfully. ${Object.keys(summary).length} tables affected.`,
        },
      })

      if (WEBHOOK_URL) {
        const summaryLines = Object.entries(summary)
          .filter(([, v]) => v.count > 0)
          .map(([k, v]) => `${v.action === "deleted" ? "🗑️" : "🔒"} ${k}: ${v.count} ${v.action}`)
          .join("\n")

        try {
          await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              embeds: [{
                title: "Data Deletion Completed",
                description: `Deletion for user ${request.userid.toString()} (request #${requestIdNum}) has been processed.`,
                color: 0x44ff44,
                fields: [
                  { name: "Summary", value: summaryLines.slice(0, 1024) || "No data was found to delete." },
                ],
                timestamp: new Date().toISOString(),
              }],
            }),
          })
        } catch {}
      }

      return res.status(200).json({
        success: true,
        requestId: requestIdNum,
        summary,
      })
    } catch (err) {
      console.error("Deletion execution failed:", err)

      await prisma.data_deletion_requests.update({
        where: { requestid: requestIdNum },
        data: {
          status: "PENDING",
          notes: `Deletion failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        },
      })

      return res.status(500).json({ error: "Deletion failed. The request has been reverted to pending." })
    }
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).end("Method Not Allowed")
}
