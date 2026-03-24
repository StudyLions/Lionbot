// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Enhancement leaderboard API route.
//          Returns top 20 users by highest total enhancement
//          level across all their equipment.
// ============================================================

import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const topUsers = await prisma.$queryRaw<Array<{
      userid: bigint
      total_level: bigint
      item_count: bigint
      max_level: number
    }>>`
      SELECT
        i.userid,
        SUM(i.enhancement_level)::bigint AS total_level,
        COUNT(*)::bigint AS item_count,
        MAX(i.enhancement_level) AS max_level
      FROM lg_user_inventory i
      JOIN lg_items it ON it.itemid = i.itemid
      WHERE it.category IN ('HAT', 'GLASSES', 'COSTUME', 'SHIRT', 'WINGS', 'BOOTS')
        AND i.enhancement_level > 0
      GROUP BY i.userid
      ORDER BY total_level DESC
      LIMIT 20
    `

    const userIds = topUsers.map(u => u.userid)
    const userConfigs = userIds.length > 0
      ? await prisma.user_config.findMany({
          where: { userid: { in: userIds } },
          select: { userid: true, name: true, avatar_hash: true },
        })
      : []
    const userMap = new Map(userConfigs.map(u => [u.userid.toString(), u]))

    const currentUserEntry = topUsers.find(u => u.userid === userId)
    let currentUserRank: number | null = null

    if (!currentUserEntry) {
      const userStats = await prisma.$queryRaw<Array<{
        total_level: bigint
        rank: bigint
      }>>`
        WITH user_levels AS (
          SELECT
            i.userid,
            SUM(i.enhancement_level)::bigint AS total_level
          FROM lg_user_inventory i
          JOIN lg_items it ON it.itemid = i.itemid
          WHERE it.category IN ('HAT', 'GLASSES', 'COSTUME', 'SHIRT', 'WINGS', 'BOOTS')
            AND i.enhancement_level > 0
          GROUP BY i.userid
        )
        SELECT total_level, (
          SELECT COUNT(*) + 1 FROM user_levels u2 WHERE u2.total_level > user_levels.total_level
        )::bigint AS rank
        FROM user_levels
        WHERE userid = ${userId}
      `

      if (userStats.length > 0) {
        currentUserRank = Number(userStats[0].rank)
      }
    }

    const leaderboard = topUsers.map((entry, index) => {
      const config = userMap.get(entry.userid.toString())
      return {
        rank: index + 1,
        userId: entry.userid.toString(),
        name: config?.name || 'Unknown',
        avatarHash: config?.avatar_hash || null,
        totalLevel: Number(entry.total_level),
        itemCount: Number(entry.item_count),
        maxLevel: entry.max_level,
        isCurrentUser: entry.userid === userId,
      }
    })

    return res.status(200).json({
      leaderboard,
      currentUserRank: currentUserEntry
        ? topUsers.indexOf(currentUserEntry) + 1
        : currentUserRank,
    })
  },
})
