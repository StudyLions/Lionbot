// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Deep analytics for the Private Rooms admin panel --
//          summary cards, health distribution, creation/expiry trends,
//          economic flow, usage heatmap, top rooms, efficiency
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

function discordAvatarUrl(userId: string, hash: string | null): string | null {
  if (!hash) return null
  const ext = hash.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}`
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const guildConfig = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: { renting_price: true },
    })
    const rentPrice = guildConfig?.renting_price ?? 1000

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [activeRooms, allActive, expiredRooms, liveOccupants, totalStudyRaw, creationTrend, expiryTrend, heatmapRaw, topRoomsRaw] = await Promise.all([
      prisma.rented_rooms.count({ where: { guildid: guildId, deleted_at: null } }),

      prisma.rented_rooms.findMany({
        where: { guildid: guildId, deleted_at: null },
        select: { channelid: true, coin_balance: true, created_at: true, contribution: true },
      }),

      prisma.rented_rooms.findMany({
        where: { guildid: guildId, deleted_at: { not: null } },
        select: { created_at: true, deleted_at: true },
      }),

      prisma.voice_sessions_ongoing.count({
        where: {
          guildid: guildId,
          channelid: { in: (await prisma.rented_rooms.findMany({ where: { guildid: guildId, deleted_at: null }, select: { channelid: true } })).map(r => r.channelid) },
        },
      }),

      prisma.$queryRawUnsafe<Array<{ total: bigint }>>(
        `SELECT COALESCE(SUM(duration), 0) as total FROM voice_sessions WHERE guildid = $1 AND channelid IN (SELECT channelid FROM rented_rooms WHERE guildid = $1)`,
        guildId
      ),

      prisma.$queryRawUnsafe<Array<{ day: Date; cnt: bigint }>>(
        `SELECT DATE(created_at) as day, COUNT(*) as cnt FROM rented_rooms WHERE guildid = $1 AND created_at >= $2 GROUP BY DATE(created_at) ORDER BY day`,
        guildId, thirtyDaysAgo
      ),

      prisma.$queryRawUnsafe<Array<{ day: Date; cnt: bigint }>>(
        `SELECT DATE(deleted_at) as day, COUNT(*) as cnt FROM rented_rooms WHERE guildid = $1 AND deleted_at >= $2 AND deleted_at IS NOT NULL GROUP BY DATE(deleted_at) ORDER BY day`,
        guildId, thirtyDaysAgo
      ),

      prisma.$queryRawUnsafe<Array<{ dow: number; hr: number; cnt: bigint }>>(
        `SELECT EXTRACT(DOW FROM start_time) as dow, EXTRACT(HOUR FROM start_time) as hr, COUNT(*) as cnt
         FROM voice_sessions WHERE guildid = $1 AND start_time >= $2
         AND channelid IN (SELECT channelid FROM rented_rooms WHERE guildid = $1)
         GROUP BY dow, hr ORDER BY dow, hr`,
        guildId, sevenDaysAgo
      ),

      prisma.$queryRawUnsafe<Array<{ channelid: bigint; total_seconds: bigint }>>(
        `SELECT vs.channelid, COALESCE(SUM(vs.duration), 0) as total_seconds
         FROM voice_sessions vs WHERE vs.guildid = $1
         AND vs.channelid IN (SELECT channelid FROM rented_rooms WHERE guildid = $1 AND deleted_at IS NULL)
         GROUP BY vs.channelid ORDER BY total_seconds DESC LIMIT 5`,
        guildId
      ),
    ])

    const totalCoinsInBanks = allActive.reduce((s, r) => s + r.coin_balance, 0)
    const totalContributions = allActive.reduce((s, r) => s + r.contribution, 0)
    const totalStudySeconds = Number(totalStudyRaw[0]?.total ?? 0)

    const lifespans = expiredRooms
      .filter((r) => r.created_at && r.deleted_at)
      .map((r) => (r.deleted_at!.getTime() - r.created_at!.getTime()) / (1000 * 60 * 60 * 24))
    const avgLifespanDays = lifespans.length > 0
      ? Math.round(lifespans.reduce((a, b) => a + b, 0) / lifespans.length)
      : 0

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const createdThisWeek = allActive.filter((r) => r.created_at && r.created_at >= weekAgo).length
      + expiredRooms.filter((r) => r.created_at && r.created_at >= weekAgo).length

    const healthBuckets = { critical: 0, low: 0, medium: 0, healthy: 0 }
    for (const r of allActive) {
      const days = rentPrice > 0 ? Math.floor(r.coin_balance / rentPrice) : 999
      if (days <= 1) healthBuckets.critical++
      else if (days <= 3) healthBuckets.low++
      else if (days <= 7) healthBuckets.medium++
      else healthBuckets.healthy++
    }

    const dayLabels: string[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dayLabels.push(d.toISOString().slice(0, 10))
    }
    const creationMap = new Map(creationTrend.map((r) => [new Date(r.day).toISOString().slice(0, 10), Number(r.cnt)]))
    const expiryMap = new Map(expiryTrend.map((r) => [new Date(r.day).toISOString().slice(0, 10), Number(r.cnt)]))

    const dailyTrend = dayLabels.map((d) => ({
      date: d,
      created: creationMap.get(d) ?? 0,
      expired: expiryMap.get(d) ?? 0,
    }))

    const economicFlow = dayLabels.map((d) => ({
      date: d,
      rentConsumed: rentPrice * activeRooms,
    }))

    const heatmap: Array<{ dow: number; hour: number; count: number }> = []
    for (const r of heatmapRaw) {
      heatmap.push({ dow: Number(r.dow), hour: Number(r.hr), count: Number(r.cnt) })
    }

    const topRoomChannelIds = topRoomsRaw.map((r) => r.channelid)
    let topRoomDetails: Array<{ channelid: bigint; name: string | null; ownerid: bigint }> = []
    if (topRoomChannelIds.length > 0) {
      topRoomDetails = await prisma.rented_rooms.findMany({
        where: { channelid: { in: topRoomChannelIds } },
        select: { channelid: true, name: true, ownerid: true },
      })
    }
    const topRoomMap = new Map(topRoomDetails.map((r) => [r.channelid.toString(), r]))

    const ownerIds = topRoomDetails.map((r) => r.ownerid)
    const ownerConfigs = ownerIds.length > 0 ? await prisma.user_config.findMany({
      where: { userid: { in: ownerIds } },
      select: { userid: true, name: true, avatar_hash: true },
    }) : []
    const ownerMembers = ownerIds.length > 0 ? await prisma.members.findMany({
      where: { guildid: guildId, userid: { in: ownerIds } },
      select: { userid: true, display_name: true },
    }) : []
    const ocMap = new Map(ownerConfigs.map((u) => [u.userid.toString(), u]))
    const omMap = new Map(ownerMembers.map((m) => [m.userid.toString(), m]))

    const topRooms = topRoomsRaw.map((r) => {
      const chId = r.channelid.toString()
      const detail = topRoomMap.get(chId)
      const ownerId = detail?.ownerid.toString() ?? ""
      const oc = ocMap.get(ownerId)
      const om = omMap.get(ownerId)
      return {
        channelId: chId,
        name: detail?.name || "Private Room",
        ownerName: om?.display_name || oc?.name || `User ${ownerId.slice(-4)}`,
        ownerAvatar: discordAvatarUrl(ownerId, oc?.avatar_hash ?? null),
        totalStudyHours: Math.round(Number(r.total_seconds) / 3600 * 10) / 10,
      }
    })

    const efficiency = totalContributions > 0
      ? Math.round((totalStudySeconds / 3600) / (totalContributions / 1000) * 10) / 10
      : 0

    res.status(200).json({
      summary: {
        activeRooms,
        totalCoinsInBanks,
        avgLifespanDays,
        createdThisWeek,
        liveOccupants,
        totalStudyHours: Math.round(totalStudySeconds / 3600 * 10) / 10,
      },
      healthDistribution: healthBuckets,
      dailyTrend,
      economicFlow,
      heatmap,
      topRooms,
      efficiency,
    })
  },
})
