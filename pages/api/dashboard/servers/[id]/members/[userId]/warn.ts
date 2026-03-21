// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Issue a bot warning to a member (creates WARNING ticket)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: validate guild/user IDs from query (400 on invalid format via apiHandler)
    const guildId = parseBigInt(req.query.id, "guildId")
    const targetUserId = parseBigInt(req.query.userId, "userId")
    // --- END AI-MODIFIED ---
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const { reason } = req.body
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return res.status(400).json({ error: "Reason is required" })
    }
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: cap warning reason length to match Discord-style limits and reduce abuse
    if (reason.length > 2000) {
      return res.status(400).json({ error: "Reason too long (max 2000 characters)" })
    }
    // --- END AI-MODIFIED ---

    const member = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
      select: { userid: true },
    })
    if (!member) {
      return res.status(404).json({ error: "Member not found in this server" })
    }

    const ticket = await prisma.tickets.create({
      data: {
        guildid: guildId,
        targetid: targetUserId,
        ticket_type: "WARNING",
        ticket_state: "OPEN",
        moderator_id: auth.userId,
        content: reason.trim(),
        auto: false,
      },
    })

    res.status(201).json({ ticketId: ticket.ticketid, message: "Warning added" })
  },
})
