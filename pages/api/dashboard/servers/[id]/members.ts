// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET server members with pagination, search, filters (moderator+)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

function buildAvatarUrl(userId: string, avatarHash: string | null): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "webp"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=64`
  }
  const index = Number(BigInt(userId) % BigInt(5))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add avatar, lastActive, activeRecordCount, filter param, user ID search
export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const page = parseInt(req.query.page as string) || 1
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 25, 100)
    const sort = (req.query.sort as string) || "tracked_time"
    const order = (req.query.order as string) === "asc" ? "asc" : "desc"
    const search = req.query.search as string | undefined
    const filter = req.query.filter as string | undefined

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay())
    weekStart.setUTCHours(0, 0, 0, 0)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

    let userIdFilter: bigint | null = null
    const isNumericId = search && /^\d{17,20}$/.test(search)

    let whereClause: any = { guildid: guildId }
    if (search) {
      if (isNumericId) {
        userIdFilter = BigInt(search)
        whereClause.userid = userIdFilter
      } else {
        whereClause.display_name = { contains: search, mode: "insensitive" }
      }
    }

    let extraUserIds: bigint[] | null = null

    if (filter === "has_records") {
      const ticketMembers = await prisma.tickets.findMany({
        where: { guildid: guildId, ticket_state: { in: ["OPEN", "EXPIRING"] } },
        select: { targetid: true },
        distinct: ["targetid"],
      })
      extraUserIds = ticketMembers.map((t) => t.targetid)
      if (extraUserIds.length === 0) {
        return res.status(200).json({ members: [], pagination: { page: 1, pageSize, total: 0, totalPages: 0 } })
      }
      whereClause.userid = { in: extraUserIds }
    } else if (filter === "studied_week") {
      const sessionMembers = await prisma.$queryRaw<Array<{ userid: bigint }>>`
        SELECT DISTINCT userid FROM voice_sessions
        WHERE guildid = ${guildId} AND start_time >= ${weekStart}
      `
      extraUserIds = sessionMembers.map((s) => s.userid)
      if (extraUserIds.length === 0) {
        return res.status(200).json({ members: [], pagination: { page: 1, pageSize, total: 0, totalPages: 0 } })
      }
      whereClause.userid = { in: extraUserIds }
    } else if (filter === "inactive_30d") {
      whereClause.timestamp = { lt: thirtyDaysAgo }
    }

    const [members, total] = await Promise.all([
      prisma.members.findMany({
        where: whereClause,
        orderBy: { [sort]: order } as any,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          userid: true,
          display_name: true,
          tracked_time: true,
          coins: true,
          workout_count: true,
          first_joined: true,
          last_left: true,
          timestamp: true,
          user_config: {
            select: { avatar_hash: true },
          },
        },
      }),
      prisma.members.count({ where: whereClause }),
    ])

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: return per-type active record counts for visual indicators
    const memberUserIds = members.map((m) => m.userid)
    const recordCounts = memberUserIds.length > 0
      ? await prisma.tickets.groupBy({
          by: ["targetid", "ticket_type"],
          where: {
            guildid: guildId,
            targetid: { in: memberUserIds },
            ticket_state: { in: ["OPEN", "EXPIRING"] },
          },
          _count: true,
        })
      : []

    const activeRecordsMap = new Map<string, { warnings: number; restrictions: number; notes: number }>()
    for (const r of recordCounts) {
      const uid = r.targetid.toString()
      if (!activeRecordsMap.has(uid)) activeRecordsMap.set(uid, { warnings: 0, restrictions: 0, notes: 0 })
      const entry = activeRecordsMap.get(uid)!
      if (r.ticket_type === "WARNING") entry.warnings += r._count
      else if (r.ticket_type === "STUDY_BAN") entry.restrictions += r._count
      else if (r.ticket_type === "NOTE") entry.notes += r._count
    }
    // --- END AI-MODIFIED ---

    return res.status(200).json({
      members: members.map((m) => {
        const uid = m.userid.toString()
        return {
          userId: uid,
          displayName: m.display_name,
          avatarUrl: buildAvatarUrl(uid, m.user_config?.avatar_hash ?? null),
          trackedTimeHours: Math.round(((m.tracked_time || 0) / 3600) * 10) / 10,
          coins: m.coins || 0,
          workoutCount: m.workout_count || 0,
          firstJoined: m.first_joined,
          lastLeft: m.last_left,
          lastActive: m.timestamp,
          activeRecords: activeRecordsMap.get(uid) ?? { warnings: 0, restrictions: 0, notes: 0 },
        }
      }),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  },
})
// --- END AI-MODIFIED ---
