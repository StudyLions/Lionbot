// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Dashboard API - specific server stats and leaderboard
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: switched to requireAuth for rate limiting consistency
import { requireAuth, getUserGuilds } from "@/utils/adminAuth"
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
import { apiHandler } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

export default apiHandler({
  async GET(req, res) {
    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: use requireAuth instead of getDiscordId for rate limiting
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    // --- END AI-MODIFIED ---
    const guildId = BigInt(req.query.id as string)

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: fetch Discord guild data for icon and banner URLs
    const [membership, guildConfig, leaderboard, userRank, discordGuilds, userStudyTime] = await Promise.all([
    prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: userId } },
      select: {
        tracked_time: true,
        coins: true,
        display_name: true,
        workout_count: true,
        first_joined: true,
      },
    }),

    prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: {
        guildid: true,
        name: true,
        study_hourly_reward: true,
        study_hourly_live_bonus: true,
        max_tasks: true,
        task_reward: true,
        rank_type: true,
        season_start: true,
        timezone: true,
      },
    }),

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: tracked_time is not populated; aggregate voice_sessions for leaderboard
    prisma.$queryRaw<Array<{ userid: bigint; display_name: string | null; total_seconds: number; coins: number }>>`
      SELECT v.userid, m.display_name, SUM(v.duration)::int as total_seconds, COALESCE(m.coins, 0)::int as coins
      FROM voice_sessions v
      JOIN members m ON m.guildid = v.guildid AND m.userid = v.userid
      WHERE v.guildid = ${guildId}
      GROUP BY v.userid, m.display_name, m.coins
      HAVING SUM(v.duration) > 0
      ORDER BY total_seconds DESC
      LIMIT 25
    `.catch(() => []),
    // --- END AI-MODIFIED ---

    prisma.member_ranks.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: userId } },
      select: {
        current_xp_rankid: true,
        current_voice_rankid: true,
        current_msg_rankid: true,
      },
    }),

    getUserGuilds(auth.accessToken, auth.discordId),

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: compute user's total study seconds from voice_sessions
    prisma.$queryRaw<[{ total: number }]>`
      SELECT COALESCE(SUM(duration), 0)::int as total
      FROM voice_sessions
      WHERE guildid = ${guildId} AND userid = ${userId}
    `.catch(() => [{ total: 0 }]),
    // --- END AI-MODIFIED ---
    ])
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: build icon and banner CDN URLs from Discord guild data
    const guildIdStr = guildId.toString()
    const discordGuild = discordGuilds.find((g) => g.id === guildIdStr)
    let iconUrl: string | null = null
    let bannerUrl: string | null = null
    if (discordGuild?.icon) {
      const ext = discordGuild.icon.startsWith("a_") ? "gif" : "webp"
      iconUrl = `https://cdn.discordapp.com/icons/${guildIdStr}/${discordGuild.icon}.${ext}?size=128`
    }
    if (discordGuild?.banner) {
      const ext = discordGuild.banner.startsWith("a_") ? "gif" : "webp"
      bannerUrl = `https://cdn.discordapp.com/banners/${guildIdStr}/${discordGuild.banner}.${ext}?size=480`
    }
    // --- END AI-MODIFIED ---

    if (!membership) {
      return res.status(404).json({ error: "You are not a member of this server" })
    }

    return res.status(200).json({
    server: {
      id: guildIdStr,
      name: discordGuild?.name || guildConfig?.name || "Unknown Server",
      iconUrl,
      bannerUrl,
      settings: guildConfig ? {
        studyHourlyReward: guildConfig.study_hourly_reward,
        studyHourlyLiveBonus: guildConfig.study_hourly_live_bonus,
        maxTasks: guildConfig.max_tasks,
        taskReward: guildConfig.task_reward,
        rankType: guildConfig.rank_type,
        seasonStart: guildConfig.season_start,
        timezone: guildConfig.timezone,
      } : null,
    },
    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: use voice_sessions aggregate instead of members.tracked_time (which is always 0)
    you: {
      trackedTimeSeconds: Number(userStudyTime?.[0]?.total || 0),
      trackedTimeHours: Math.round(Number(userStudyTime?.[0]?.total || 0) / 3600 * 10) / 10,
      coins: membership.coins || 0,
      displayName: membership.display_name,
      workoutCount: membership.workout_count,
      firstJoined: membership.first_joined,
      // --- AI-MODIFIED (2026-03-13) ---
      // Purpose: serialize BigInt rank IDs to prevent JSON.stringify crash
      ranks: userRank ? {
        currentXpRankId: userRank.current_xp_rankid?.toString() || null,
        currentVoiceRankId: userRank.current_voice_rankid?.toString() || null,
        currentMsgRankId: userRank.current_msg_rankid?.toString() || null,
      } : null,
      // --- END AI-MODIFIED ---
    },
    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: use voice_sessions aggregation result fields
    leaderboard: leaderboard.map((m, i) => ({
      rank: i + 1,
      userId: m.userid.toString(),
      displayName: m.display_name,
      trackedTimeHours: Math.round(Number(m.total_seconds || 0) / 3600 * 10) / 10,
      coins: Number(m.coins || 0),
      isYou: m.userid === userId,
    })),
    // --- END AI-MODIFIED ---
    })
  },
})
