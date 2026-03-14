// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Returns servers the user is a member of (for leaderboard server picker)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth, getUserGuilds } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const memberRows = await prisma.members.findMany({
      where: { userid: auth.userId },
      select: {
        guildid: true,
        tracked_time: true,
      },
      orderBy: { tracked_time: "desc" },
    })

    if (!memberRows.length) {
      return res.status(200).json({ servers: [] })
    }

    const guilds = await getUserGuilds(auth.accessToken, auth.discordId)
    const guildMap = new Map(guilds.map((g) => [g.id, g]))

    const memberCountsRaw = await prisma.members.groupBy({
      by: ["guildid"],
      where: { guildid: { in: memberRows.map((r) => r.guildid) } },
      _count: true,
    })

    const memberCounts = new Map(
      memberCountsRaw.map((r) => [r.guildid.toString(), r._count])
    )

    const guildConfigs = await prisma.guild_config.findMany({
      where: { guildid: { in: memberRows.map((r) => r.guildid) } },
      select: { guildid: true, name: true },
    })
    const configMap = new Map(
      guildConfigs.map((c) => [c.guildid.toString(), c.name])
    )

    const servers = memberRows.map((row) => {
      const gid = row.guildid.toString()
      const discord = guildMap.get(gid)
      const name =
        discord?.name || configMap.get(gid) || `Server ${gid}`
      const iconUrl = discord?.icon
        ? `https://cdn.discordapp.com/icons/${gid}/${discord.icon}.webp?size=64`
        : null

      return {
        id: gid,
        name,
        iconUrl,
        memberCount: memberCounts.get(gid) || 0,
      }
    })

    return res.status(200).json({ servers })
  },
})
