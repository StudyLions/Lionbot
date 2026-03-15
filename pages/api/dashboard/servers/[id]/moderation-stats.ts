// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Moderation command center stats - summary counts,
//          30-day activity breakdown, and top targets
// ============================================================
import { prisma } from "@/utils/prisma"
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

    const now = new Date()
    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: use Monday-start (ISO) week to match the bot's week boundaries
    const weekStart = new Date(now)
    const wDay = weekStart.getUTCDay()
    weekStart.setUTCDate(weekStart.getUTCDate() - (wDay === 0 ? 6 : wDay - 1))
    weekStart.setUTCHours(0, 0, 0, 0)
    // --- END AI-MODIFIED ---
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

    const [
      activeCounts,
      resolvedThisWeek,
      createdThisWeek,
      dailyActivity,
      topTargetsRaw,
    ] = await Promise.all([
      prisma.tickets.groupBy({
        by: ["ticket_type"],
        where: { guildid: guildId, ticket_state: { in: ["OPEN", "EXPIRING"] } },
        _count: true,
      }),

      prisma.tickets.count({
        where: { guildid: guildId, ticket_state: "PARDONED", pardoned_at: { gte: weekStart } },
      }),

      prisma.tickets.count({
        where: { guildid: guildId, created_at: { gte: weekStart } },
      }),

      prisma.$queryRaw<Array<{ day: string; ticket_type: string; ticket_state: string; cnt: bigint }>>`
        SELECT
          to_char(created_at, 'YYYY-MM-DD') as day,
          ticket_type::text,
          ticket_state::text,
          COUNT(*) as cnt
        FROM tickets
        WHERE guildid = ${guildId} AND created_at >= ${thirtyDaysAgo}
        GROUP BY day, ticket_type, ticket_state
        ORDER BY day
      `,

      prisma.tickets.groupBy({
        by: ["targetid"],
        where: { guildid: guildId, ticket_state: { in: ["OPEN", "EXPIRING"] } },
        _count: true,
        orderBy: { _count: { targetid: "desc" } },
        take: 5,
      }),
    ])

    let activeWarnings = 0, activeRestrictions = 0, activeNotes = 0
    for (const row of activeCounts) {
      if (row.ticket_type === "WARNING") activeWarnings = row._count
      else if (row.ticket_type === "STUDY_BAN") activeRestrictions = row._count
      else if (row.ticket_type === "NOTE") activeNotes = row._count
    }
    const totalActive = activeWarnings + activeRestrictions + activeNotes +
      activeCounts.filter((r) => !["WARNING", "STUDY_BAN", "NOTE"].includes(r.ticket_type)).reduce((s, r) => s + r._count, 0)

    const activityMap = new Map<string, { warnings: number; restrictions: number; notes: number; resolved: number }>()
    for (let d = 0; d < 30; d++) {
      const date = new Date(thirtyDaysAgo)
      date.setUTCDate(date.getUTCDate() + d)
      activityMap.set(date.toISOString().slice(0, 10), { warnings: 0, restrictions: 0, notes: 0, resolved: 0 })
    }
    for (const row of dailyActivity) {
      const entry = activityMap.get(row.day)
      if (!entry) continue
      const count = Number(row.cnt)
      if (row.ticket_state === "PARDONED") {
        entry.resolved += count
      } else if (row.ticket_type === "WARNING") {
        entry.warnings += count
      } else if (row.ticket_type === "STUDY_BAN") {
        entry.restrictions += count
      } else if (row.ticket_type === "NOTE") {
        entry.notes += count
      }
    }
    const activity = Array.from(activityMap.entries()).map(([date, data]) => ({ date, ...data }))

    const targetUserIds = topTargetsRaw.map((t) => t.targetid)
    const targetMembers = targetUserIds.length > 0
      ? await prisma.members.findMany({
          where: { guildid: guildId, userid: { in: targetUserIds } },
          select: { userid: true, display_name: true, user_config: { select: { avatar_hash: true } } },
        })
      : []
    const memberMap = new Map(targetMembers.map((m) => [m.userid.toString(), m]))

    const topTargets = topTargetsRaw.map((t) => {
      const uid = t.targetid.toString()
      const member = memberMap.get(uid)
      return {
        userId: uid,
        displayName: member?.display_name || `User ...${uid.slice(-4)}`,
        avatarUrl: buildAvatarUrl(uid, member?.user_config?.avatar_hash ?? null),
        activeCount: t._count,
      }
    })

    res.status(200).json({
      summary: {
        totalActive,
        activeWarnings,
        activeRestrictions,
        activeNotes,
        resolvedThisWeek,
        createdThisWeek,
      },
      activity,
      topTargets,
    })
  },
})
