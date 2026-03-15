// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Returns servers the user is a member of (for leaderboard server picker)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth, getUserGuilds } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { Prisma } from "@prisma/client"

// --- AI-MODIFIED (2026-03-15) ---
// Purpose: only show servers the user is currently in (cross-ref Discord + DB),
//          sort by actual study time from voice_sessions, use Discord member counts
export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const guilds = await getUserGuilds(auth.accessToken, auth.discordId)
    if (!guilds.length) {
      return res.status(200).json({ servers: [] })
    }

    const discordGuildIds = new Set(guilds.map((g) => g.id))
    const discordGuildMap = new Map(guilds.map((g) => [g.id, g]))

    const memberRows = await prisma.members.findMany({
      where: {
        userid: auth.userId,
        last_left: null,
      },
      select: { guildid: true },
    })

    const activeGuildIds = memberRows
      .map((r) => r.guildid)
      .filter((gid) => discordGuildIds.has(gid.toString()))

    if (!activeGuildIds.length) {
      return res.status(200).json({ servers: [] })
    }

    const [studyTimes, memberCountsRaw, guildConfigs] = await Promise.all([
      prisma.$queryRaw<Array<{ guildid: bigint; total: number }>>`
        SELECT guildid, COALESCE(SUM(duration), 0)::int as total
        FROM voice_sessions
        WHERE userid = ${auth.userId} AND guildid IN (${Prisma.join(activeGuildIds)})
        GROUP BY guildid
      `,

      prisma.members.groupBy({
        by: ["guildid"],
        where: { guildid: { in: activeGuildIds }, last_left: null },
        _count: true,
      }),

      prisma.guild_config.findMany({
        where: { guildid: { in: activeGuildIds } },
        select: { guildid: true, name: true },
      }),
    ])

    const studyMap = new Map(studyTimes.map((s) => [s.guildid.toString(), Number(s.total)]))
    const dbMemberCounts = new Map(memberCountsRaw.map((r) => [r.guildid.toString(), r._count]))
    const configMap = new Map(guildConfigs.map((c) => [c.guildid.toString(), c.name]))

    const servers = activeGuildIds
      .map((gid) => {
        const gidStr = gid.toString()
        const discord = discordGuildMap.get(gidStr)
        const name = discord?.name || configMap.get(gidStr) || `Server ${gidStr}`
        const iconUrl = discord?.icon
          ? `https://cdn.discordapp.com/icons/${gidStr}/${discord.icon}.webp?size=64`
          : null

        return {
          id: gidStr,
          name,
          iconUrl,
          memberCount: discord?.approximate_member_count || dbMemberCounts.get(gidStr) || 0,
          studyHours: Math.round((studyMap.get(gidStr) || 0) / 3600 * 10) / 10,
        }
      })
      .sort((a, b) => b.studyHours - a.studyHours)

    return res.status(200).json({ servers })
  },
})
// --- END AI-MODIFIED ---
