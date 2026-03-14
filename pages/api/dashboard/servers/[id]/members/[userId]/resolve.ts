// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Resolve (pardon) one or more moderation records
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async PATCH(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const { ticketIds, reason } = req.body
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ error: "At least one ticket ID is required" })
    }

    const validIds = ticketIds.filter((id: any) => typeof id === "number" && id > 0)
    if (validIds.length === 0) {
      return res.status(400).json({ error: "No valid ticket IDs provided" })
    }

    const result = await prisma.tickets.updateMany({
      where: {
        ticketid: { in: validIds },
        guildid: guildId,
        ticket_state: { in: ["OPEN", "EXPIRING"] },
      },
      data: {
        ticket_state: "PARDONED",
        pardoned_by: auth.userId,
        pardoned_at: new Date(),
        pardoned_reason: reason?.trim() || "Resolved via dashboard",
      },
    })

    res.status(200).json({ resolved: result.count, message: `${result.count} record(s) resolved` })
  },
})
