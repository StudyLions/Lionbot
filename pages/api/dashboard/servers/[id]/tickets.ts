// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET moderation records with filters, member info (moderator+)
//          PATCH to resolve (pardon) records individually or in bulk
// ============================================================
import { Prisma } from "@prisma/client"
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

    // --- AI-MODIFIED (2026-04-17) ---
    // Purpose: Surface "Offense #N of M" on STUDY_BAN/SCREEN_BAN tickets so
    //   moderators see the escalation context inline (matches bot ticket log).
    //   - offenseNumber: row-number among non-pardoned same-target same-type
    //                    tickets (mirrors bot's autocreate count + 1 logic).
    //   - totalTiers   : configured number of escalation durations for that
    //                    blacklist type in this guild.
    const blacklistTickets = tickets.filter(
      (t) => t.ticket_type === "STUDY_BAN" || t.ticket_type === "SCREEN_BAN"
    )
    const offenseMap = new Map<number, number>()
    let studyBanTiers: number | null = null
    let screenBanTiers: number | null = null

    if (blacklistTickets.length > 0) {
      const blacklistTargetIds = Array.from(
        new Set(blacklistTickets.map((t) => t.targetid))
      )
      const offenseRows = await prisma.$queryRaw<{ ticketid: number; offense_number: bigint }[]>`
        WITH ranked AS (
          SELECT
            ticketid,
            ROW_NUMBER() OVER (
              PARTITION BY targetid, ticket_type
              ORDER BY ticketid
            ) AS offense_number
          FROM tickets
          WHERE guildid = ${guildId}
            AND ticket_type IN ('STUDY_BAN'::tickettype, 'SCREEN_BAN'::tickettype)
            AND ticket_state != 'PARDONED'::ticketstate
            AND targetid IN (${Prisma.join(blacklistTargetIds)})
        )
        SELECT ticketid, offense_number
        FROM ranked
        WHERE ticketid IN (${Prisma.join(blacklistTickets.map((t) => t.ticketid))})
      `
      for (const row of offenseRows) {
        offenseMap.set(row.ticketid, Number(row.offense_number))
      }

      const hasStudyBan = blacklistTickets.some((t) => t.ticket_type === "STUDY_BAN")
      const hasScreenBan = blacklistTickets.some((t) => t.ticket_type === "SCREEN_BAN")
      if (hasStudyBan) {
        const c = await prisma.studyban_durations.count({ where: { guildid: guildId } })
        studyBanTiers = c || null
      }
      if (hasScreenBan) {
        const screenRows = await prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)::bigint AS count
          FROM screenban_durations
          WHERE guildid = ${guildId}
        `
        const c = screenRows[0]?.count ? Number(screenRows[0].count) : 0
        screenBanTiers = c || null
      }
    }
    // --- END AI-MODIFIED ---

    return res.status(200).json({
      tickets: tickets.map((t) => {
        const uid = t.targetid.toString()
        const member = memberMap.get(uid)
        // --- AI-MODIFIED (2026-04-17) ---
        // Purpose: Add offenseNumber/totalTiers fields for blacklist tickets.
        let offenseNumber: number | null = null
        let totalTiers: number | null = null
        if (t.ticket_type === "STUDY_BAN") {
          offenseNumber = offenseMap.get(t.ticketid) ?? null
          totalTiers = studyBanTiers
        } else if (t.ticket_type === "SCREEN_BAN") {
          offenseNumber = offenseMap.get(t.ticketid) ?? null
          totalTiers = screenBanTiers
        }
        // --- END AI-MODIFIED ---
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
          offenseNumber,
          totalTiers,
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
