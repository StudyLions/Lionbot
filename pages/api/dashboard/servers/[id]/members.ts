// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET server members with pagination, search, filters (moderator+)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
// --- AI-MODIFIED (2026-03-15) ---
// Purpose: Prisma.sql/Prisma.join for building raw SQL fragments
import { Prisma } from "@prisma/client"
// --- END AI-MODIFIED ---

function buildAvatarUrl(userId: string, avatarHash: string | null): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "webp"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=64`
  }
  const index = Number(BigInt(userId) % BigInt(5))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

// --- AI-MODIFIED (2026-03-15) ---
// Purpose: add last_left IS NULL filter, study time from voice_sessions (raw SQL
//          when sorting by study time, batch query otherwise), display name
//          fallback from user_config.name, search across both name fields
type MemberRow = {
  userid: bigint
  display_name: string | null
  uname: string | null
  avatar_hash: string | null
  coins: number
  workout_count: number
  first_joined: Date | null
  last_left: Date | null
  _timestamp: Date | null
  study_seconds: number
}

export default apiHandler({
  async GET(req, res) {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: validate guild ID from query (400 on invalid format via apiHandler)
    const guildId = parseBigInt(req.query.id, "guildId")
    // --- END AI-MODIFIED ---
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const page = parseInt(req.query.page as string) || 1
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 25, 100)
    const sort = (req.query.sort as string) || "tracked_time"
    const order = (req.query.order as string) === "asc" ? "asc" : "desc"
    const search = req.query.search as string | undefined
    const filter = req.query.filter as string | undefined

    const now = new Date()
    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: use Monday-start (ISO) week to match the bot's week boundaries
    const weekStart = new Date(now)
    const wDay = weekStart.getUTCDay()
    weekStart.setUTCDate(weekStart.getUTCDate() - (wDay === 0 ? 6 : wDay - 1))
    weekStart.setUTCHours(0, 0, 0, 0)
    // --- END AI-MODIFIED ---
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

    const isNumericId = search && /^\d{17,20}$/.test(search)

    let filterUserIds: bigint[] | null = null

    if (filter === "has_records") {
      const ticketMembers = await prisma.tickets.findMany({
        where: { guildid: guildId, ticket_state: { in: ["OPEN", "EXPIRING"] } },
        select: { targetid: true },
        distinct: ["targetid"],
      })
      filterUserIds = ticketMembers.map((t) => t.targetid)
      if (filterUserIds.length === 0) {
        return res.status(200).json({ members: [], pagination: { page: 1, pageSize, total: 0, totalPages: 0 } })
      }
    } else if (filter === "studied_week") {
      const sessionMembers = await prisma.$queryRaw<Array<{ userid: bigint }>>`
        SELECT DISTINCT userid FROM voice_sessions
        WHERE guildid = ${guildId} AND start_time >= ${weekStart}
      `
      filterUserIds = sessionMembers.map((s) => s.userid)
      if (filterUserIds.length === 0) {
        return res.status(200).json({ members: [], pagination: { page: 1, pageSize, total: 0, totalPages: 0 } })
      }
    }

    let memberRows: MemberRow[]
    let total: number

    if (sort === "tracked_time") {
      // === RAW SQL: sort by aggregated voice_sessions duration ===
      // --- AI-MODIFIED (2026-03-20) ---
      // Purpose: parse numeric search as Snowflake via parseBigInt (user input)
      const searchCond = search
        ? isNumericId
          ? Prisma.sql`AND m.userid = ${parseBigInt(search, "search")}`
          : Prisma.sql`AND (m.display_name ILIKE ${"%" + search + "%"} OR u.name ILIKE ${"%" + search + "%"})`
        : Prisma.sql``
      // --- END AI-MODIFIED ---

      const filterCond = filterUserIds
        ? Prisma.sql`AND m.userid IN (${Prisma.join(filterUserIds)})`
        : filter === "inactive_30d"
          ? Prisma.sql`AND m._timestamp < ${thirtyDaysAgo}`
          : Prisma.sql``

      const orderDir = order === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`
      const offset = (page - 1) * pageSize

      const [countResult, entries] = await Promise.all([
        prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM members m
          LEFT JOIN user_config u ON u.userid = m.userid
          WHERE m.guildid = ${guildId} AND m.last_left IS NULL
          ${searchCond} ${filterCond}
        `,
        prisma.$queryRaw<MemberRow[]>`
          SELECT m.userid, m.display_name, u.name as uname, u.avatar_hash,
                 COALESCE(m.coins, 0)::int as coins,
                 COALESCE(m.workout_count, 0)::int as workout_count,
                 m.first_joined, m.last_left, m._timestamp,
                 COALESCE(vs.total_time, 0)::int as study_seconds
          FROM members m
          LEFT JOIN user_config u ON u.userid = m.userid
          LEFT JOIN (
            SELECT userid, SUM(duration) as total_time
            FROM voice_sessions WHERE guildid = ${guildId}
            GROUP BY userid
          ) vs ON vs.userid = m.userid
          WHERE m.guildid = ${guildId} AND m.last_left IS NULL
          ${searchCond} ${filterCond}
          ORDER BY study_seconds ${orderDir}, m.userid ASC
          LIMIT ${pageSize} OFFSET ${offset}
        `,
      ])

      total = Number(countResult[0]?.count || 0)
      memberRows = entries

    } else {
      // === PRISMA: sort by DB column, batch-fetch study times for page ===
      const whereClause: any = { guildid: guildId, last_left: null }

      if (search) {
        if (isNumericId) {
          // --- AI-MODIFIED (2026-03-20) ---
          // Purpose: parse numeric search as Snowflake via parseBigInt (user input)
          whereClause.userid = parseBigInt(search, "search")
          // --- END AI-MODIFIED ---
        } else {
          whereClause.OR = [
            { display_name: { contains: search, mode: "insensitive" } },
            { user_config: { name: { contains: search, mode: "insensitive" } } },
          ]
        }
      }

      if (filterUserIds) {
        whereClause.userid = { in: filterUserIds }
      } else if (filter === "inactive_30d") {
        whereClause.timestamp = { lt: thirtyDaysAgo }
      }

      const [prismaMembers, count] = await Promise.all([
        prisma.members.findMany({
          where: whereClause,
          orderBy: { [sort]: order } as any,
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            userid: true,
            display_name: true,
            coins: true,
            workout_count: true,
            first_joined: true,
            last_left: true,
            timestamp: true,
            user_config: {
              select: { avatar_hash: true, name: true },
            },
          },
        }),
        prisma.members.count({ where: whereClause }),
      ])

      total = count

      const userIds = prismaMembers.map((m) => m.userid)
      const studyTimes = userIds.length > 0
        ? await prisma.$queryRaw<Array<{ userid: bigint; total: number }>>`
            SELECT userid, COALESCE(SUM(duration), 0)::int as total
            FROM voice_sessions
            WHERE guildid = ${guildId} AND userid IN (${Prisma.join(userIds)})
            GROUP BY userid
          `
        : []
      const studyMap = new Map(studyTimes.map((s) => [s.userid.toString(), Number(s.total)]))

      memberRows = prismaMembers.map((m) => ({
        userid: m.userid,
        display_name: m.display_name,
        uname: m.user_config?.name || null,
        avatar_hash: m.user_config?.avatar_hash || null,
        coins: m.coins || 0,
        workout_count: m.workout_count || 0,
        first_joined: m.first_joined,
        last_left: m.last_left,
        _timestamp: m.timestamp,
        study_seconds: studyMap.get(m.userid.toString()) || 0,
      }))
    }

    const memberUserIds = memberRows.map((m) => m.userid)
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

    return res.status(200).json({
      members: memberRows.map((m) => {
        const uid = m.userid.toString()
        return {
          userId: uid,
          displayName: m.display_name || m.uname || null,
          avatarUrl: buildAvatarUrl(uid, m.avatar_hash),
          trackedTimeHours: Math.round((m.study_seconds / 3600) * 10) / 10,
          coins: m.coins,
          workoutCount: m.workout_count,
          firstJoined: m.first_joined,
          lastLeft: m.last_left,
          lastActive: m._timestamp,
          activeRecords: activeRecordsMap.get(uid) ?? { warnings: 0, restrictions: 0, notes: 0 },
        }
      }),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  },
})
// --- END AI-MODIFIED ---
