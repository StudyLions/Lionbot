// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Resolve (pardon) one or more moderation records
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async PATCH(req, res) {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: validate guild ID from query (400 on invalid format via apiHandler)
    const guildId = parseBigInt(req.query.id, "guildId")
    // --- END AI-MODIFIED ---
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const { ticketIds, reason } = req.body
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ error: "At least one ticket ID is required" })
    }

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Add array size limit to prevent DoS
    if (ticketIds.length > 100) {
      return res.status(400).json({ error: "Too many ticket IDs (max 100)" })
    }
    // --- END AI-MODIFIED ---

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
