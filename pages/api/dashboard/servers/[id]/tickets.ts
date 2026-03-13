// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET moderation tickets with filters (moderator+)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

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
}
