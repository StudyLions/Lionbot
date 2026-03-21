// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Leaderboard API - multi-type, period filtering, pagination, search
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { Prisma } from "@prisma/client"

type LBType = "study" | "messages" | "coins"
// --- AI-MODIFIED (2026-03-15) ---
// Purpose: added "custom" period for arbitrary date range filtering
type LBPeriod = "all" | "season" | "month" | "week" | "today" | "custom"
// --- END AI-MODIFIED ---

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

// --- AI-MODIFIED (2026-03-15) ---
// Purpose: always return a URL -- fall back to Discord's default avatar when no hash
function getAvatarUrl(userId: bigint, avatarHash: string | null): string {
  const uid = userId.toString()
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "webp"
    return `https://cdn.discordapp.com/avatars/${uid}/${avatarHash}.${ext}?size=64`
  }
  const index = Number(BigInt(uid) % BigInt(5))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-15) ---
// Purpose: added uname field for display name fallback chain
function buildResponse(
  entries: Array<{ userid: bigint; display_name: string | null; uname?: string | null; value: number; avatar_hash?: string | null }>,
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
      displayName: e.display_name || e.uname || null,
      avatarUrl: getAvatarUrl(e.userid, e.avatar_hash ?? null),
      value: Number(e.value),
      isYou: e.userid === userId,
    })),
// --- END AI-MODIFIED ---
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

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: validate guildId query param via parseBigInt (400 on invalid)
    const guildId = parseBigInt(guildIdStr, "guildId")
    // --- END AI-MODIFIED ---
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

    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: support custom date range via from/to query params
    const fromStr = req.query.from as string | undefined
    const toStr = req.query.to as string | undefined
    let periodStart: Date | null
    let periodEnd: Date | null = null

    if (period === "custom" && fromStr) {
      periodStart = new Date(fromStr + "T00:00:00Z")
      if (toStr) {
        const d = new Date(toStr + "T00:00:00Z")
        d.setUTCDate(d.getUTCDate() + 1)
        periodEnd = d
      }
    } else {
      periodStart = getPeriodStart(period, guildConfig?.timezone || null, seasonStart)
    }
    // --- END AI-MODIFIED ---

    // ===== COINS =====
    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: added last_left IS NULL filter, u.name for display name fallback, search across both name fields
    if (type === "coins") {
      const searchWhere = search
        ? Prisma.sql`AND (m.display_name ILIKE ${"%" + search + "%"} OR u.name ILIKE ${"%" + search + "%"})`
        : Prisma.sql``

      const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM members m
        LEFT JOIN user_config u ON u.userid = m.userid
        WHERE m.guildid = ${guildId} AND m.last_left IS NULL AND (m.coins IS NOT NULL AND m.coins > 0)
        ${searchWhere}
      `
      const totalEntries = Number(countResult[0]?.count || 0)

      const entries = await prisma.$queryRaw<Array<{ userid: bigint; display_name: string | null; uname: string | null; avatar_hash: string | null; value: number }>>`
        SELECT m.userid, m.display_name, u.name as uname, u.avatar_hash, COALESCE(m.coins, 0) as value
        FROM members m
        LEFT JOIN user_config u ON u.userid = m.userid
        WHERE m.guildid = ${guildId} AND m.last_left IS NULL AND (m.coins IS NOT NULL AND m.coins > 0)
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
        WHERE m.guildid = ${guildId} AND m.last_left IS NULL AND COALESCE(m.coins, 0) > ${yourValue}
      `
      const yourRank = Number(yourRankResult[0]?.count || 0) + 1
    // --- END AI-MODIFIED ---

      return res.status(200).json(
        buildResponse(entries, offset, userId, totalEntries, pageSize, page, yourRank, yourValue, serverName, seasonStart)
      )
    }

    // ===== STUDY (all periods aggregate voice_sessions) =====
    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: members.tracked_time is not populated by the bot; aggregate voice_sessions instead
    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: added last_left IS NULL filter, u.name for display name fallback, search across both name fields
    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: added periodEnd support for custom date range filtering
    if (type === "study") {
      const since = periodStart || new Date(0)
      const untilV = periodEnd ? Prisma.sql`AND v.start_time < ${periodEnd}` : Prisma.sql``
      const untilBare = periodEnd ? Prisma.sql`AND start_time < ${periodEnd}` : Prisma.sql``
      const cacheKey = `study:${guildIdStr}:${period}:${fromStr || ""}:${toStr || ""}:${page}:${search}`

      const searchJoin = search
        ? Prisma.sql`AND (m.display_name ILIKE ${"%" + search + "%"} OR u.name ILIKE ${"%" + search + "%"})`
        : Prisma.sql``

      let totalEntries: number
      let entries: Array<{ userid: bigint; display_name: string | null; uname: string | null; avatar_hash: string | null; value: number }>

      const cached = getCached<{ totalEntries: number; entries: typeof entries }>(cacheKey)
      if (cached) {
        totalEntries = cached.totalEntries
        entries = cached.entries
      } else {
        const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM (
            SELECT v.userid FROM voice_sessions v
            JOIN members m ON m.guildid = v.guildid AND m.userid = v.userid
            LEFT JOIN user_config u ON u.userid = v.userid
            WHERE v.guildid = ${guildId} AND v.start_time >= ${since} ${untilV}
            AND m.last_left IS NULL
            ${searchJoin}
            GROUP BY v.userid HAVING SUM(v.duration) > 0
          ) sub
        `
        totalEntries = Number(countResult[0]?.count || 0)

        entries = await prisma.$queryRaw`
          SELECT v.userid, m.display_name, u.name as uname, u.avatar_hash,
            ROUND(SUM(v.duration)::numeric / 3600, 1) as value
          FROM voice_sessions v
          JOIN members m ON m.guildid = v.guildid AND m.userid = v.userid
          LEFT JOIN user_config u ON u.userid = v.userid
          WHERE v.guildid = ${guildId} AND v.start_time >= ${since} ${untilV}
          AND m.last_left IS NULL
          ${searchJoin}
          GROUP BY v.userid, m.display_name, u.name, u.avatar_hash
          HAVING SUM(v.duration) > 0
          ORDER BY value DESC, v.userid ASC
          LIMIT ${pageSize} OFFSET ${offset}
        `
        setCache(cacheKey, { totalEntries, entries })
      }

      const yourCacheKey = `study-you:${guildIdStr}:${period}:${fromStr || ""}:${toStr || ""}:${auth.discordId}`
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
          WHERE v.guildid = ${guildId} AND v.userid = ${userId} AND v.start_time >= ${since} ${untilV}
        `
        yourValue = Number(yourValueResult[0]?.value || 0)

        const yourRankResult = await prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM (
            SELECT v.userid, SUM(v.duration) as total
            FROM voice_sessions v
            WHERE v.guildid = ${guildId} AND v.start_time >= ${since} ${untilV}
            GROUP BY v.userid
            HAVING SUM(v.duration) > (
              SELECT COALESCE(SUM(duration), 0) FROM voice_sessions
              WHERE guildid = ${guildId} AND userid = ${userId} AND start_time >= ${since} ${untilBare}
            )
          ) sub
        `
        yourRank = Number(yourRankResult[0]?.count || 0) + 1
        setCache(yourCacheKey, { yourValue, yourRank })
      }
    // --- END AI-MODIFIED ---

      return res.status(200).json(
        buildResponse(entries, offset, userId, totalEntries, pageSize, page, yourRank, yourValue, serverName, seasonStart)
      )
    }
    // --- END AI-MODIFIED ---

    // ===== MESSAGES =====
    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: added last_left IS NULL filter, u.name for display name fallback, search across both name fields
    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: added periodEnd support for custom date range filtering
    if (type === "messages") {
      const since = periodStart || new Date(0)
      const untilT = periodEnd ? Prisma.sql`AND t.start_time < ${periodEnd}` : Prisma.sql``
      const untilBare = periodEnd ? Prisma.sql`AND start_time < ${periodEnd}` : Prisma.sql``
      const searchJoin = search
        ? Prisma.sql`AND (m.display_name ILIKE ${"%" + search + "%"} OR u.name ILIKE ${"%" + search + "%"})`
        : Prisma.sql``

      const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM (
          SELECT t.userid FROM text_sessions t
          JOIN members m ON m.guildid = t.guildid AND m.userid = t.userid
          LEFT JOIN user_config u ON u.userid = t.userid
          WHERE t.guildid = ${guildId} AND t.start_time >= ${since} ${untilT}
          AND m.last_left IS NULL
          ${searchJoin}
          Group BY t.userid HAVING SUM(t.messages) > 0
        ) sub
      `
      const totalEntries = Number(countResult[0]?.count || 0)

      const entries = await prisma.$queryRaw<Array<{ userid: bigint; display_name: string | null; uname: string | null; avatar_hash: string | null; value: number }>>`
        SELECT t.userid, m.display_name, u.name as uname, u.avatar_hash, SUM(t.messages)::int as value
        FROM text_sessions t
        JOIN members m ON m.guildid = t.guildid AND m.userid = t.userid
        LEFT JOIN user_config u ON u.userid = t.userid
        WHERE t.guildid = ${guildId} AND t.start_time >= ${since} ${untilT}
        AND m.last_left IS NULL
        ${searchJoin}
        GROUP BY t.userid, m.display_name, u.name, u.avatar_hash
        HAVING SUM(t.messages) > 0
        ORDER BY value DESC, t.userid ASC
        LIMIT ${pageSize} OFFSET ${offset}
      `

      const yourValueResult = await prisma.$queryRaw<[{ value: number }]>`
        SELECT COALESCE(SUM(t.messages)::int, 0) as value
        FROM text_sessions t
        WHERE t.guildid = ${guildId} AND t.userid = ${userId} AND t.start_time >= ${since} ${untilT}
      `
      const yourValue = Number(yourValueResult[0]?.value || 0)
      const yourRankResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM (
          SELECT t.userid, SUM(t.messages) as total
          FROM text_sessions t
          WHERE t.guildid = ${guildId} AND t.start_time >= ${since} ${untilT}
          GROUP BY t.userid
          HAVING SUM(t.messages) > (
            SELECT COALESCE(SUM(messages), 0) FROM text_sessions
            WHERE guildid = ${guildId} AND userid = ${userId} AND start_time >= ${since} ${untilBare}
          )
        ) sub
      `
      const yourRank = Number(yourRankResult[0]?.count || 0) + 1
    // --- END AI-MODIFIED ---

      return res.status(200).json(
        buildResponse(entries, offset, userId, totalEntries, pageSize, page, yourRank, yourValue, serverName, seasonStart)
      )
    }

    return res.status(400).json({ error: "Invalid type" })
  },
})
