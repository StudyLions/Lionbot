// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Leaderboard API - multi-type, period filtering, pagination, search
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { Prisma } from "@prisma/client"

type LBType = "study" | "messages" | "coins"
type LBPeriod = "all" | "season" | "month" | "week" | "today"

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: in-memory cache for expensive voice_sessions aggregation queries (2 min TTL)
interface CacheEntry {
  data: any
  expiresAt: number
}
const lbCache = new Map<string, CacheEntry>()
const CACHE_TTL = 120_000

function getCached<T>(key: string): T | null {
  const entry = lbCache.get(key)
  if (!entry || Date.now() > entry.expiresAt) {
    lbCache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache(key: string, data: any) {
  lbCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL })
}
// --- END AI-MODIFIED ---

function getPeriodStart(period: LBPeriod, timezone: string | null, seasonStart: Date | null): Date | null {
  if (period === "all") return null
  if (period === "season") return seasonStart || null

  const now = new Date()
  if (period === "today") {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (period === "week") {
    const d = new Date(now)
    const day = d.getDay()
    const diff = (day + 6) % 7
    d.setDate(d.getDate() - diff)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (period === "month") {
    const d = new Date(now)
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  }
  return null
}

function buildResponse(
  entries: Array<{ userid: bigint; display_name: string | null; value: number }>,
  offset: number,
  userId: bigint,
  totalEntries: number,
  pageSize: number,
  page: number,
  yourRank: number,
  yourValue: number,
  serverName: string,
  seasonStart: Date | null
) {
  return {
    entries: entries.map((e, i) => ({
      rank: offset + i + 1,
      userId: e.userid.toString(),
      displayName: e.display_name,
      value: Number(e.value),
      isYou: e.userid === userId,
    })),
    totalEntries,
    totalPages: Math.ceil(totalEntries / pageSize),
    page,
    yourPosition: { rank: yourRank, value: yourValue },
    serverName,
    seasonStart: seasonStart?.toISOString() || null,
  }
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const guildIdStr = req.query.guildId as string
    if (!guildIdStr) return res.status(400).json({ error: "guildId required" })

    const guildId = BigInt(guildIdStr)
    const userId = auth.userId
    const type = (req.query.type as LBType) || "study"
    const period = (req.query.period as LBPeriod) || "all"
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 25))
    const search = (req.query.search as string)?.trim() || ""
    const offset = (page - 1) * pageSize

    const membership = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: userId } },
      select: { userid: true },
    })
    if (!membership) return res.status(404).json({ error: "Not a member of this server" })

    const guildConfig = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: { name: true, season_start: true, timezone: true },
    })

    const seasonStart = guildConfig?.season_start || null
    const serverName = guildConfig?.name || "Unknown Server"
    const periodStart = getPeriodStart(period, guildConfig?.timezone || null, seasonStart)

    // ===== COINS =====
    if (type === "coins") {
      const searchWhere = search
        ? Prisma.sql`AND m.display_name ILIKE ${"%" + search + "%"}`
        : Prisma.sql``

      const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM members m
        WHERE m.guildid = ${guildId} AND (m.coins IS NOT NULL AND m.coins > 0)
        ${searchWhere}
      `
      const totalEntries = Number(countResult[0]?.count || 0)

      const entries = await prisma.$queryRaw<Array<{ userid: bigint; display_name: string | null; value: number }>>`
        SELECT m.userid, m.display_name, COALESCE(m.coins, 0) as value
        FROM members m
        WHERE m.guildid = ${guildId} AND (m.coins IS NOT NULL AND m.coins > 0)
        ${searchWhere}
        ORDER BY value DESC, m.userid ASC
        LIMIT ${pageSize} OFFSET ${offset}
      `

      const yourValueResult = await prisma.$queryRaw<[{ value: number }]>`
        SELECT COALESCE(m.coins, 0) as value FROM members m
        WHERE m.guildid = ${guildId} AND m.userid = ${userId}
      `
      const yourValue = Number(yourValueResult[0]?.value || 0)
      const yourRankResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM members m
        WHERE m.guildid = ${guildId} AND COALESCE(m.coins, 0) > ${yourValue}
      `
      const yourRank = Number(yourRankResult[0]?.count || 0) + 1

      return res.status(200).json(
        buildResponse(entries, offset, userId, totalEntries, pageSize, page, yourRank, yourValue, serverName, seasonStart)
      )
    }

    // ===== STUDY (all periods aggregate voice_sessions) =====
    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: members.tracked_time is not populated by the bot; aggregate voice_sessions instead
    if (type === "study") {
      const since = periodStart || new Date(0)
      const cacheKey = `study:${guildIdStr}:${period}:${page}:${search}`

      const searchJoin = search
        ? Prisma.sql`AND m.display_name ILIKE ${"%" + search + "%"}`
        : Prisma.sql``

      let totalEntries: number
      let entries: Array<{ userid: bigint; display_name: string | null; value: number }>

      const cached = getCached<{ totalEntries: number; entries: typeof entries }>(cacheKey)
      if (cached) {
        totalEntries = cached.totalEntries
        entries = cached.entries
      } else {
        const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM (
            SELECT v.userid FROM voice_sessions v
            JOIN members m ON m.guildid = v.guildid AND m.userid = v.userid
            WHERE v.guildid = ${guildId} AND v.start_time >= ${since}
            ${searchJoin}
            GROUP BY v.userid HAVING SUM(v.duration) > 0
          ) sub
        `
        totalEntries = Number(countResult[0]?.count || 0)

        entries = await prisma.$queryRaw`
          SELECT v.userid, m.display_name, ROUND(SUM(v.duration)::numeric / 3600, 1) as value
          FROM voice_sessions v
          JOIN members m ON m.guildid = v.guildid AND m.userid = v.userid
          WHERE v.guildid = ${guildId} AND v.start_time >= ${since}
          ${searchJoin}
          GROUP BY v.userid, m.display_name
          HAVING SUM(v.duration) > 0
          ORDER BY value DESC, v.userid ASC
          LIMIT ${pageSize} OFFSET ${offset}
        `
        setCache(cacheKey, { totalEntries, entries })
      }

      const yourCacheKey = `study-you:${guildIdStr}:${period}:${auth.discordId}`
      let yourValue: number
      let yourRank: number

      const yourCached = getCached<{ yourValue: number; yourRank: number }>(yourCacheKey)
      if (yourCached) {
        yourValue = yourCached.yourValue
        yourRank = yourCached.yourRank
      } else {
        const yourValueResult = await prisma.$queryRaw<[{ value: number }]>`
          SELECT COALESCE(ROUND(SUM(v.duration)::numeric / 3600, 1), 0) as value
          FROM voice_sessions v
          WHERE v.guildid = ${guildId} AND v.userid = ${userId} AND v.start_time >= ${since}
        `
        yourValue = Number(yourValueResult[0]?.value || 0)

        const yourRankResult = await prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM (
            SELECT v.userid, SUM(v.duration) as total
            FROM voice_sessions v
            WHERE v.guildid = ${guildId} AND v.start_time >= ${since}
            GROUP BY v.userid
            HAVING SUM(v.duration) > (
              SELECT COALESCE(SUM(duration), 0) FROM voice_sessions
              WHERE guildid = ${guildId} AND userid = ${userId} AND start_time >= ${since}
            )
          ) sub
        `
        yourRank = Number(yourRankResult[0]?.count || 0) + 1
        setCache(yourCacheKey, { yourValue, yourRank })
      }

      return res.status(200).json(
        buildResponse(entries, offset, userId, totalEntries, pageSize, page, yourRank, yourValue, serverName, seasonStart)
      )
    }
    // --- END AI-MODIFIED ---

    // ===== MESSAGES =====
    if (type === "messages") {
      const since = periodStart || new Date(0)
      const searchJoin = search
        ? Prisma.sql`AND m.display_name ILIKE ${"%" + search + "%"}`
        : Prisma.sql``

      const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM (
          SELECT t.userid FROM text_sessions t
          JOIN members m ON m.guildid = t.guildid AND m.userid = t.userid
          WHERE t.guildid = ${guildId} AND t.start_time >= ${since}
          ${searchJoin}
          GROUP BY t.userid HAVING SUM(t.messages) > 0
        ) sub
      `
      const totalEntries = Number(countResult[0]?.count || 0)

      const entries = await prisma.$queryRaw<Array<{ userid: bigint; display_name: string | null; value: number }>>`
        SELECT t.userid, m.display_name, SUM(t.messages)::int as value
        FROM text_sessions t
        JOIN members m ON m.guildid = t.guildid AND m.userid = t.userid
        WHERE t.guildid = ${guildId} AND t.start_time >= ${since}
        ${searchJoin}
        GROUP BY t.userid, m.display_name
        HAVING SUM(t.messages) > 0
        ORDER BY value DESC, t.userid ASC
        LIMIT ${pageSize} OFFSET ${offset}
      `

      const yourValueResult = await prisma.$queryRaw<[{ value: number }]>`
        SELECT COALESCE(SUM(t.messages)::int, 0) as value
        FROM text_sessions t
        WHERE t.guildid = ${guildId} AND t.userid = ${userId} AND t.start_time >= ${since}
      `
      const yourValue = Number(yourValueResult[0]?.value || 0)
      const yourRankResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM (
          SELECT t.userid, SUM(t.messages) as total
          FROM text_sessions t
          WHERE t.guildid = ${guildId} AND t.start_time >= ${since}
          GROUP BY t.userid
          HAVING SUM(t.messages) > (
            SELECT COALESCE(SUM(messages), 0) FROM text_sessions
            WHERE guildid = ${guildId} AND userid = ${userId} AND start_time >= ${since}
          )
        ) sub
      `
      const yourRank = Number(yourRankResult[0]?.count || 0) + 1

      return res.status(200).json(
        buildResponse(entries, offset, userId, totalEntries, pageSize, page, yourRank, yourValue, serverName, seasonStart)
      )
    }

    return res.status(400).json({ error: "Invalid type" })
  },
})
