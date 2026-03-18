// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-18
// Purpose: Premium pomodoro analytics API - streaks, milestones,
//          focus power leaderboard, and advanced study patterns
// ============================================================
import { prisma } from "@/utils/prisma"
import { Prisma } from "@prisma/client"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

function buildAvatarUrl(userId: string, avatarHash: string | null): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "webp"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=64`
  }
  const index = Number(BigInt(userId) % BigInt(5))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const [
      streakLeaderboardRaw,
      focusPowerLeaderboardRaw,
      recentMilestonesRaw,
      guildStatsRaw,
    ] = await Promise.all([
      prisma.$queryRaw<Array<{
        userid: bigint
        name: string | null
        avatar_hash: string | null
        current_daily_streak: number
        longest_daily_streak: number
        total_cycles_completed: number
        focus_power: number
      }>>`
        SELECT
          ps.userid,
          COALESCE(m.display_name, uc.name) as name,
          uc.avatar_hash,
          ps.current_daily_streak,
          ps.longest_daily_streak,
          ps.total_cycles_completed,
          ps.focus_power
        FROM pomodoro_streaks ps
        JOIN members m ON m.guildid = ${guildId} AND m.userid = ps.userid
        LEFT JOIN user_config uc ON uc.userid = ps.userid
        ORDER BY ps.current_daily_streak DESC
        LIMIT 20
      `,

      prisma.$queryRaw<Array<{
        userid: bigint
        name: string | null
        avatar_hash: string | null
        focus_power: number
        total_focus_minutes: number
      }>>`
        SELECT
          ps.userid,
          COALESCE(m.display_name, uc.name) as name,
          uc.avatar_hash,
          ps.focus_power,
          ps.total_focus_minutes
        FROM pomodoro_streaks ps
        JOIN members m ON m.guildid = ${guildId} AND m.userid = ps.userid
        LEFT JOIN user_config uc ON uc.userid = ps.userid
        ORDER BY ps.focus_power DESC
        LIMIT 20
      `,

      prisma.$queryRaw<Array<{
        userid: bigint
        name: string | null
        milestone_type: string
        milestone_value: number
        achieved_at: Date
      }>>`
        SELECT
          pm.userid,
          COALESCE(m.display_name, uc.name) as name,
          pm.milestone_type,
          pm.milestone_value,
          pm.achieved_at
        FROM pomodoro_milestones pm
        JOIN members m ON m.guildid = ${guildId} AND m.userid = pm.userid
        LEFT JOIN user_config uc ON uc.userid = pm.userid
        ORDER BY pm.achieved_at DESC
        LIMIT 20
      `,

      prisma.$queryRaw<[{
        total_cycles: bigint
        total_minutes: bigint
        active_studiers: bigint
      }]>`
        SELECT
          COALESCE(SUM(ps.total_cycles_completed), 0) as total_cycles,
          COALESCE(SUM(ps.total_focus_minutes), 0) as total_minutes,
          COUNT(DISTINCT ps.userid) as active_studiers
        FROM pomodoro_streaks ps
        JOIN members m ON m.guildid = ${guildId} AND m.userid = ps.userid
      `,
    ])

    const gs = guildStatsRaw[0]

    const streakLeaderboard = streakLeaderboardRaw.map((r) => {
      const uid = r.userid.toString()
      return {
        userid: uid,
        name: r.name,
        avatar_url: buildAvatarUrl(uid, r.avatar_hash),
        current_daily_streak: Number(r.current_daily_streak),
        longest_daily_streak: Number(r.longest_daily_streak),
        total_cycles_completed: Number(r.total_cycles_completed),
        focus_power: Number(r.focus_power),
      }
    })

    const focusPowerLeaderboard = focusPowerLeaderboardRaw.map((r) => {
      const uid = r.userid.toString()
      return {
        userid: uid,
        name: r.name,
        avatar_url: buildAvatarUrl(uid, r.avatar_hash),
        focus_power: Number(r.focus_power),
        total_focus_minutes: Number(r.total_focus_minutes),
      }
    })

    const recentMilestones = recentMilestonesRaw.map((r) => ({
      userid: r.userid.toString(),
      name: r.name,
      milestone_type: r.milestone_type,
      milestone_value: Number(r.milestone_value),
      achieved_at: r.achieved_at.toISOString(),
    }))

    res.status(200).json({
      streakLeaderboard,
      focusPowerLeaderboard,
      recentMilestones,
      guildStats: {
        total_cycles: Number(gs?.total_cycles || 0),
        total_focus_hours: Math.round(Number(gs?.total_minutes || 0) / 60 * 10) / 10,
        active_studiers: Number(gs?.active_studiers || 0),
      },
    })
  },
})
