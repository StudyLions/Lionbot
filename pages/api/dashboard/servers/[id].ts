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
    const [membership, guildConfig, leaderboard, userRank, discordGuilds] = await Promise.all([
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

    prisma.members.findMany({
      where: { guildid: guildId },
      orderBy: { tracked_time: "desc" },
      take: 25,
      select: {
        userid: true,
        display_name: true,
        tracked_time: true,
        coins: true,
      },
    }),

    prisma.member_ranks.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: userId } },
      select: {
        current_xp_rankid: true,
        current_voice_rankid: true,
        current_msg_rankid: true,
      },
    }),

    getUserGuilds(auth.accessToken, auth.discordId),
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
    you: {
      trackedTimeSeconds: membership.tracked_time || 0,
      trackedTimeHours: Math.round((membership.tracked_time || 0) / 3600 * 10) / 10,
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
    leaderboard: leaderboard.map((m, i) => ({
      rank: i + 1,
      userId: m.userid.toString(),
      displayName: m.display_name,
      trackedTimeHours: Math.round((m.tracked_time || 0) / 3600 * 10) / 10,
      coins: m.coins || 0,
      isYou: m.userid === userId,
    })),
    })
  },
})
