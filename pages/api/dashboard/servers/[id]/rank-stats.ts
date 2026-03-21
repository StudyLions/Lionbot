// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Rank statistics API - member distribution, activity
//          percentiles, and near-next-rank data
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

type RankType = "XP" | "VOICE" | "MESSAGE"

interface DistributionRow {
  rankid: number
  roleid: bigint
  required: number
  reward: number
  member_count: bigint
}

interface MemberRow {
  userid: bigint
  display_name: string | null
  name: string | null
  avatar_hash: string | null
  rankid: number
}

interface StatRow {
  userid: bigint
  display_name: string | null
  name: string | null
  avatar_hash: string | null
  stat_value: number
  current_rankid: number | null
}

function getRankTable(rt: RankType) {
  return rt === "XP" ? "xp_ranks" : rt === "VOICE" ? "voice_ranks" : "msg_ranks"
}

function getRankIdCol(rt: RankType) {
  return rt === "XP" ? "current_xp_rankid" : rt === "VOICE" ? "current_voice_rankid" : "current_msg_rankid"
}

function getStatQuery(rt: RankType, guildId: bigint, seasonStart: Date | null): Prisma.Sql {
  const since = seasonStart || new Date("2000-01-01")
  if (rt === "VOICE") {
    return Prisma.sql`
      SELECT m.userid, m.display_name, uc.name, uc.avatar_hash,
             COALESCE(SUM(vs.duration), 0)::int as stat_value,
             mr.current_voice_rankid as current_rankid
      FROM members m
      LEFT JOIN user_config uc ON uc.userid = m.userid
      LEFT JOIN voice_sessions vs ON vs.guildid = m.guildid AND vs.userid = m.userid AND vs.start_time >= ${since}
      LEFT JOIN member_ranks mr ON mr.guildid = m.guildid AND mr.userid = m.userid
      WHERE m.guildid = ${guildId} AND m.last_left IS NULL
      GROUP BY m.userid, m.display_name, uc.name, uc.avatar_hash, mr.current_voice_rankid
    `
  } else if (rt === "XP") {
    return Prisma.sql`
      SELECT m.userid, m.display_name, uc.name, uc.avatar_hash,
             COALESCE(SUM(me.amount), 0)::int as stat_value,
             mr.current_xp_rankid as current_rankid
      FROM members m
      LEFT JOIN user_config uc ON uc.userid = m.userid
      LEFT JOIN member_experience me ON me.guildid = m.guildid AND me.userid = m.userid AND me.earned_at >= ${since}
      LEFT JOIN member_ranks mr ON mr.guildid = m.guildid AND mr.userid = m.userid
      WHERE m.guildid = ${guildId} AND m.last_left IS NULL
      GROUP BY m.userid, m.display_name, uc.name, uc.avatar_hash, mr.current_xp_rankid
    `
  } else {
    return Prisma.sql`
      SELECT m.userid, m.display_name, uc.name, uc.avatar_hash,
             COALESCE(SUM(ts.messages), 0)::int as stat_value,
             mr.current_msg_rankid as current_rankid
      FROM members m
      LEFT JOIN user_config uc ON uc.userid = m.userid
      LEFT JOIN text_sessions ts ON ts.guildid = m.guildid AND ts.userid = m.userid AND ts.start_time >= ${since}
      LEFT JOIN member_ranks mr ON mr.guildid = m.guildid AND mr.userid = m.userid
      WHERE m.guildid = ${guildId} AND m.last_left IS NULL
      GROUP BY m.userid, m.display_name, uc.name, uc.avatar_hash, mr.current_msg_rankid
    `
  }
}

export default apiHandler({
  async GET(req, res) {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: validate guild id from query via parseBigInt (400 on invalid)
    const guildId = parseBigInt(req.query.id, "id")
    // --- END AI-MODIFIED ---
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const config = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: { rank_type: true, season_start: true },
    })

    const rankType = (config?.rank_type as RankType) || null
    if (!rankType) {
      return res.status(200).json({
        rankType: null,
        totalMembers: 0,
        rankedMembers: 0,
        unrankedMembers: 0,
        distribution: [],
        nearNextRank: [],
        activityStats: null,
      })
    }

    const rankTable = getRankTable(rankType)
    const rankIdCol = getRankIdCol(rankType)
    const seasonStart = config?.season_start || null

    const [totalMembers, distributionRows, membersByRank, allStats] = await Promise.all([
      // --- AI-MODIFIED (2026-03-15) ---
      // Purpose: only count current members
      prisma.members.count({ where: { guildid: guildId, last_left: null } }),
      // --- END AI-MODIFIED ---

      prisma.$queryRawUnsafe<DistributionRow[]>(`
        SELECT r.rankid, r.roleid, r.required, r.reward,
               COUNT(mr.userid)::bigint as member_count
        FROM ${rankTable} r
        LEFT JOIN member_ranks mr ON mr.${rankIdCol} = r.rankid AND mr.guildid = r.guildid
        WHERE r.guildid = $1
        GROUP BY r.rankid, r.roleid, r.required, r.reward
        ORDER BY r.required ASC
      `, guildId),

      prisma.$queryRawUnsafe<MemberRow[]>(`
        SELECT mr.userid, m.display_name, uc.name, uc.avatar_hash, mr.${rankIdCol} as rankid
        FROM member_ranks mr
        JOIN members m ON m.guildid = mr.guildid AND m.userid = mr.userid
        LEFT JOIN user_config uc ON uc.userid = mr.userid
        WHERE mr.guildid = $1 AND mr.${rankIdCol} IS NOT NULL
        ORDER BY mr.${rankIdCol}, mr.userid
      `, guildId),

      prisma.$queryRaw<StatRow[]>(getStatQuery(rankType, guildId, seasonStart)),
    ])

    const membersByRankMap = new Map<number, Array<{ userId: string; displayName: string; avatar: string | null }>>()
    for (const row of membersByRank) {
      const list = membersByRankMap.get(row.rankid) || []
      if (list.length < 10) {
        list.push({
          userId: row.userid.toString(),
          displayName: row.display_name || row.name || `User ${row.userid.toString().slice(-4)}`,
          avatar: row.avatar_hash ? `https://cdn.discordapp.com/avatars/${row.userid}/${row.avatar_hash}.png?size=64` : null,
        })
      }
      membersByRankMap.set(row.rankid, list)
    }

    const rankedMembers = distributionRows.reduce((sum, r) => sum + Number(r.member_count), 0)

    const distribution = distributionRows.map((r) => ({
      rankId: r.rankid,
      roleId: r.roleid.toString(),
      required: r.required,
      reward: r.reward,
      memberCount: Number(r.member_count),
      members: membersByRankMap.get(r.rankid) || [],
    }))

    const sortedRanks = [...distributionRows].sort((a, b) => a.required - b.required)

    const nearNextRank: Array<{
      userId: string
      displayName: string
      avatar: string | null
      currentStat: number
      nextRequired: number
      percentComplete: number
    }> = []

    for (const stat of allStats) {
      const statVal = Number(stat.stat_value)
      if (statVal <= 0) continue

      let nextRank: DistributionRow | null = null
      if (stat.current_rankid != null) {
        const currentIdx = sortedRanks.findIndex((r) => r.rankid === stat.current_rankid)
        if (currentIdx >= 0 && currentIdx < sortedRanks.length - 1) {
          nextRank = sortedRanks[currentIdx + 1]
        }
      } else {
        nextRank = sortedRanks[0] || null
      }

      if (!nextRank) continue
      const nextReq = nextRank.required
      if (statVal >= nextReq) continue

      const pct = Math.round((statVal / nextReq) * 100)
      if (pct >= 50) {
        nearNextRank.push({
          userId: stat.userid.toString(),
          displayName: stat.display_name || stat.name || `User ${stat.userid.toString().slice(-4)}`,
          avatar: stat.avatar_hash ? `https://cdn.discordapp.com/avatars/${stat.userid}/${stat.avatar_hash}.png?size=64` : null,
          currentStat: statVal,
          nextRequired: nextReq,
          percentComplete: pct,
        })
      }
    }
    nearNextRank.sort((a, b) => b.percentComplete - a.percentComplete)
    nearNextRank.splice(5)

    const statValues = allStats.map((s) => Number(s.stat_value)).filter((v) => v > 0).sort((a, b) => a - b)
    const activeMembersCount = statValues.length
    let activityStats = null
    if (activeMembersCount > 0) {
      const sum = statValues.reduce((a, b) => a + b, 0)
      const pIdx = (p: number) => statValues[Math.min(Math.floor(p * statValues.length), statValues.length - 1)]
      activityStats = {
        avgStatPerMember: Math.round(sum / activeMembersCount),
        medianStat: pIdx(0.5),
        p25Stat: pIdx(0.25),
        p75Stat: pIdx(0.75),
        maxStat: statValues[statValues.length - 1],
        activeMembersCount,
      }
    }

    return res.status(200).json({
      rankType,
      totalMembers,
      rankedMembers,
      unrankedMembers: totalMembers - rankedMembers,
      distribution,
      nearNextRank,
      activityStats,
    })
  },
})
