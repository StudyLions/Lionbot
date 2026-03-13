// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET moderation tickets with filters (moderator+)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
import { apiHandler } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
  const auth = await requireModerator(req, res, guildId)
  if (!auth) return

  const page = parseInt(req.query.page as string) || 1
  const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 50)
  const ticketType = req.query.type as string | undefined
  const ticketState = req.query.state as string | undefined

  const where: any = { guildid: guildId }
  if (ticketType) where.ticket_type = ticketType
  if (ticketState) where.ticket_state = ticketState

  const [tickets, total] = await Promise.all([
    prisma.tickets.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        ticketid: true,
        targetid: true,
        ticket_type: true,
        ticket_state: true,
        moderator_id: true,
        content: true,
        context: true,
        addendum: true,
        duration: true,
        auto: true,
        created_at: true,
        expiry: true,
        pardoned_by: true,
        pardoned_at: true,
        pardoned_reason: true,
      },
    }),
    prisma.tickets.count({ where }),
  ])

  return res.status(200).json({
    tickets: tickets.map((t) => ({
      id: t.ticketid,
      targetId: t.targetid.toString(),
      type: t.ticket_type,
      state: t.ticket_state,
      moderatorId: t.moderator_id.toString(),
      content: t.content,
      context: t.context,
      addendum: t.addendum,
      duration: t.duration,
      auto: t.auto,
      createdAt: t.created_at,
      expiry: t.expiry,
      pardonedBy: t.pardoned_by?.toString(),
      pardonedAt: t.pardoned_at,
      pardonedReason: t.pardoned_reason,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
  },
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: Phase 2D - PATCH handler to pardon a ticket
  async PATCH(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const { ticketId, reason } = req.body
    if (!ticketId) return res.status(400).json({ error: "ticketId is required" })
    const reasonStr = typeof reason === "string" ? reason.trim() : ""

    const existing = await prisma.tickets.findFirst({
      where: { ticketid: ticketId, guildid: guildId },
    })
    if (!existing) return res.status(404).json({ error: "Ticket not found" })

    await prisma.tickets.update({
      where: { ticketid: ticketId },
      data: {
        ticket_state: "PARDONED",
        pardoned_by: auth.userId,
        pardoned_at: new Date(),
        pardoned_reason: reasonStr || null,
      },
    })
    return res.status(200).json({ success: true })
  },
  // --- END AI-MODIFIED ---
})
