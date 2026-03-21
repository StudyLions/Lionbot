// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET moderation records with filters, member info (moderator+)
//          PATCH to resolve (pardon) records individually or in bulk
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: parseBigInt for guild ID and numeric search query (target user ID)
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

function buildAvatarUrl(userId: string, avatarHash: string | null): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "webp"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=64`
  }
  const index = Number(BigInt(userId) % BigInt(5))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: join member names/avatars, add bulk resolve, add search by member
export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const page = parseInt(req.query.page as string) || 1
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 50)
    const ticketType = req.query.type as string | undefined
    const ticketState = req.query.state as string | undefined
    const search = req.query.search as string | undefined

    const where: any = { guildid: guildId }
    if (ticketType) where.ticket_type = ticketType
    if (ticketState) where.ticket_state = ticketState

    if (search) {
      const isNumericId = /^\d{17,20}$/.test(search)
      if (isNumericId) {
        where.targetid = parseBigInt(search, "search")
      } else {
        const matchingMembers = await prisma.members.findMany({
          where: { guildid: guildId, display_name: { contains: search, mode: "insensitive" } },
          select: { userid: true },
          take: 50,
        })
        if (matchingMembers.length === 0) {
          return res.status(200).json({ tickets: [], pagination: { page: 1, pageSize, total: 0, totalPages: 0 } })
        }
        where.targetid = { in: matchingMembers.map((m) => m.userid) }
      }
    }

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

    const targetUserIds = Array.from(new Set(tickets.map((t) => t.targetid.toString()))).map((id) => BigInt(id))
    const targetMembers = targetUserIds.length > 0
      ? await prisma.members.findMany({
          where: { guildid: guildId, userid: { in: targetUserIds } },
          select: { userid: true, display_name: true, user_config: { select: { avatar_hash: true } } },
        })
      : []
    const memberMap = new Map(targetMembers.map((m) => [m.userid.toString(), m]))

    return res.status(200).json({
      tickets: tickets.map((t) => {
        const uid = t.targetid.toString()
        const member = memberMap.get(uid)
        return {
          id: t.ticketid,
          targetId: uid,
          targetDisplayName: member?.display_name || `User ...${uid.slice(-4)}`,
          targetAvatarUrl: buildAvatarUrl(uid, member?.user_config?.avatar_hash ?? null),
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
        }
      }),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const { ticketId, ticketIds, reason } = req.body
    const reasonStr = typeof reason === "string" ? reason.trim() : ""

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Add array size limit to prevent DoS
    if (Array.isArray(ticketIds) && ticketIds.length > 100) {
      return res.status(400).json({ error: "Too many ticket IDs (max 100)" })
    }
    // --- END AI-MODIFIED ---

    const idsToResolve: number[] = []
    if (Array.isArray(ticketIds) && ticketIds.length > 0) {
      idsToResolve.push(...ticketIds.filter((id: any) => typeof id === "number" && id > 0))
    } else if (ticketId && typeof ticketId === "number") {
      idsToResolve.push(ticketId)
    }

    if (idsToResolve.length === 0) {
      return res.status(400).json({ error: "At least one ticket ID is required" })
    }

    const result = await prisma.tickets.updateMany({
      where: {
        ticketid: { in: idsToResolve },
        guildid: guildId,
        ticket_state: { in: ["OPEN", "EXPIRING"] },
      },
      data: {
        ticket_state: "PARDONED",
        pardoned_by: auth.userId,
        pardoned_at: new Date(),
        pardoned_reason: reasonStr || "Resolved via dashboard",
      },
    })

    return res.status(200).json({ resolved: result.count, message: `${result.count} record(s) resolved` })
  },
})
// --- END AI-MODIFIED ---
