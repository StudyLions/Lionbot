// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Dashboard API - specific server stats and leaderboard
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { getDiscordId, unauthorized } from "@/utils/dashboardAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

  const discordId = await getDiscordId(req)
  if (!discordId) return unauthorized(res)

  const userId = BigInt(discordId)
  const guildId = BigInt(req.query.id as string)

  const [membership, guildConfig, leaderboard, userRank] = await Promise.all([
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
  ])

  if (!membership) {
    return res.status(404).json({ error: "You are not a member of this server" })
  }

  return res.status(200).json({
    server: {
      id: guildId.toString(),
      name: guildConfig?.name || "Unknown Server",
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
      ranks: userRank,
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
}
