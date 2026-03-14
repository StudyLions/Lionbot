// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Rank progress summary across user's top servers for dashboard overview
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth, getUserGuilds } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

interface RankEntry {
  guildId: string
  guildName: string
  guildIcon: string | null
  rankType: string
  currentValue: number
  currentRankRole: string | null
  currentRankRequired: number
  nextRankRole: string | null
  nextRankRequired: number | null
  progress: number
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = auth.userId

    const topMembers = await prisma.members.findMany({
      where: { userid: userId },
      orderBy: { tracked_time: "desc" },
      take: 3,
      select: {
        guildid: true,
        guild_config: {
          select: { guildid: true, name: true, rank_type: true },
        },
      },
    })

    if (topMembers.length === 0) {
      return res.status(200).json({ ranks: [] })
    }

    let discordGuildMap = new Map<string, { icon: string | null }>()
    try {
      const guilds = await getUserGuilds(auth.accessToken, auth.discordId)
      discordGuildMap = new Map(guilds.map(g => [g.id, { icon: g.icon }]))
    } catch {
      // Discord API may fail; proceed without icons
    }

    const ranks: RankEntry[] = []

    for (const m of topMembers) {
      const guildId = m.guildid
      const guildIdStr = guildId.toString()
      const rankType = m.guild_config?.rank_type ?? "VOICE"

      const [xpRanks, voiceRanks, msgRanks] = await Promise.all([
        rankType === "XP" ? prisma.xp_ranks.findMany({ where: { guildid: guildId }, orderBy: { required: "asc" } }) : Promise.resolve([]),
        rankType === "VOICE" ? prisma.voice_ranks.findMany({ where: { guildid: guildId }, orderBy: { required: "asc" } }) : Promise.resolve([]),
        rankType === "MESSAGE" ? prisma.msg_ranks.findMany({ where: { guildid: guildId }, orderBy: { required: "asc" } }) : Promise.resolve([]),
      ])

      let currentValue = 0
      let rankDefs: { rankid: number; roleid: bigint; required: number }[] = []

      if (rankType === "XP") {
        const agg = await prisma.member_experience.aggregate({
          where: { guildid: guildId, userid: userId },
          _sum: { amount: true },
        })
        currentValue = agg._sum.amount ?? 0
        rankDefs = xpRanks
      } else if (rankType === "VOICE") {
        const agg = await prisma.voice_sessions.aggregate({
          where: { guildid: guildId, userid: userId },
          _sum: { duration: true },
        })
        currentValue = agg._sum.duration ?? 0
        rankDefs = voiceRanks
      } else {
        const agg = await prisma.text_sessions.aggregate({
          where: { guildid: guildId, userid: userId },
          _sum: { words: true },
        })
        currentValue = agg._sum.words ?? 0
        rankDefs = msgRanks
      }

      if (rankDefs.length === 0) continue

      const currentRank = rankDefs.filter(r => r.required <= currentValue).pop() ?? null
      const nextRank = rankDefs.find(r => r.required > currentValue) ?? null

      const currentRankRequired = currentRank?.required ?? 0
      const nextRankRequired = nextRank?.required ?? null
      const progress = nextRankRequired != null
        ? Math.min(100, Math.round(((currentValue - currentRankRequired) / (nextRankRequired - currentRankRequired)) * 100))
        : 100

      const discordGuild = discordGuildMap.get(guildIdStr)
      let iconUrl: string | null = null
      if (discordGuild?.icon) {
        const ext = discordGuild.icon.startsWith("a_") ? "gif" : "webp"
        iconUrl = `https://cdn.discordapp.com/icons/${guildIdStr}/${discordGuild.icon}.${ext}?size=64`
      }

      ranks.push({
        guildId: guildIdStr,
        guildName: m.guild_config?.name || "Unknown Server",
        guildIcon: iconUrl,
        rankType,
        currentValue,
        currentRankRole: currentRank ? currentRank.roleid.toString() : null,
        currentRankRequired,
        nextRankRole: nextRank ? nextRank.roleid.toString() : null,
        nextRankRequired,
        progress,
      })
    }

    res.status(200).json({ ranks })
  },
})
