// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Voice Time Editor member API - GET user's servers with
//          premium/enabled status, sessions for selected guild, usage counts
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth, getUserGuilds } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

const ADMINISTRATOR = 0x8

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = auth.userId
    const guildParam = req.query.guild as string | undefined
    const page = parseInt(req.query.page as string) || 1
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 50)

    const [memberships, discordGuilds] = await Promise.all([
      prisma.members.findMany({
        where: { userid: userId },
        select: {
          guildid: true,
          guild_config: {
            select: {
              guildid: true,
              name: true,
              manual_sessions_enabled: true,
              manual_sessions_limit: true,
              manual_sessions_until: true,
              admin_role: true,
              premium_guilds: {
                select: { premium_until: true },
              },
            },
          },
        },
      }),
      getUserGuilds(auth.accessToken, auth.discordId),
    ])

    const discordGuildMap = new Map(discordGuilds.map((g) => [g.id, g]))
    const now = new Date()

    const servers = memberships
      .filter((m) => discordGuildMap.has(m.guildid.toString()))
      .map((m) => {
        const gc = m.guild_config
        const dg = discordGuildMap.get(m.guildid.toString())!
        const premiumRow = gc.premium_guilds
        const isPremium = !!premiumRow && premiumRow.premium_until > now
        const autoDisabled = gc.manual_sessions_until ? gc.manual_sessions_until < now : false
        const isEnabled = isPremium && !!gc.manual_sessions_enabled && !autoDisabled

        const perms = BigInt(dg.permissions)
        let isAdmin = !!(perms & BigInt(ADMINISTRATOR))
        if (!isAdmin && gc.admin_role) {
          // admin_role check would require fetching roles — simplified here
          // Full admin check happens server-side on write operations
        }

        return {
          guildId: m.guildid.toString(),
          guildName: gc.name || dg.name || "Unknown",
          isPremium,
          isEnabled,
          isAdmin,
          monthlyLimit: gc.manual_sessions_limit ?? 5,
          autoDisableDate: gc.manual_sessions_until?.toISOString() ?? null,
        }
      })
      .sort((a, b) => {
        if (a.isEnabled && !b.isEnabled) return -1
        if (!a.isEnabled && b.isEnabled) return 1
        if (a.isPremium && !b.isPremium) return -1
        if (!a.isPremium && b.isPremium) return 1
        return a.guildName.localeCompare(b.guildName)
      })

    if (!guildParam) {
      return res.status(200).json({ servers, sessions: null, usage: null })
    }

    const guildId = parseBigInt(guildParam, "guild")

    const serverInfo = servers.find((s) => s.guildId === guildId.toString())
    if (!serverInfo) {
      return res.status(404).json({ error: "Server not found or you are not a member" })
    }

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [sessions, total, usageCount] = await Promise.all([
      prisma.voice_sessions.findMany({
        where: { guildid: guildId, userid: userId },
        orderBy: { start_time: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          sessionid: true,
          start_time: true,
          duration: true,
          live_duration: true,
          stream_duration: true,
          video_duration: true,
          tag: true,
          rating: true,
          is_manual: true,
        },
      }),
      prisma.voice_sessions.count({
        where: { guildid: guildId, userid: userId },
      }),
      prisma.manual_session_log.count({
        where: {
          guildid: guildId,
          userid: userId,
          created_at: { gte: monthStart },
          action: { in: ["ADD", "EDIT"] },
        },
      }),
    ])

    return res.status(200).json({
      servers,
      sessions: sessions.map((s) => ({
        id: s.sessionid,
        startTime: s.start_time.toISOString(),
        duration: s.duration,
        durationMinutes: Math.round(s.duration / 60),
        liveDurationMinutes: Math.round((s.live_duration || 0) / 60),
        streamDurationMinutes: Math.round((s.stream_duration || 0) / 60),
        videoDurationMinutes: Math.round((s.video_duration || 0) / 60),
        tag: s.tag,
        rating: s.rating,
        isManual: !!s.is_manual,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      usage: {
        used: usageCount,
        limit: serverInfo.monthlyLimit,
      },
    })
  },
})
