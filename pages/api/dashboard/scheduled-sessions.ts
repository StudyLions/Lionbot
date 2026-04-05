// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-04
// Purpose: Member-facing scheduled sessions API — cross-server
//          session data with date range filtering, stats, and
//          upcoming bookings for the authenticated user
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

function buildIconUrl(guildId: string, iconHash: string | null): string | null {
  if (!iconHash) return null
  const ext = iconHash.startsWith("a_") ? "gif" : "webp"
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=64`
}

function slotIdToDate(slotid: number): Date {
  return new Date(slotid * 1000)
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = auth.userId
    const mode = (req.query.mode as string) || "calendar"

    const now = Math.floor(Date.now() / 1000)
    const nowSlotId = now - (now % 3600)

    if (mode === "upcoming") {
      const rows = await prisma.$queryRaw<Array<{
        slotid: number
        guildid: bigint
        booked_at: Date
        guild_name: string | null
        guild_icon: string | null
        schedule_cost: number | null
        opened_at: Date | null
        closed_at: Date | null
      }>>`
        SELECT
          ssm.slotid,
          ssm.guildid,
          ssm.booked_at,
          gc.name as guild_name,
          gc.avatar_hash as guild_icon,
          sgc.schedule_cost,
          ss.opened_at,
          ss.closed_at
        FROM schedule_session_members ssm
        LEFT JOIN schedule_sessions ss ON ss.guildid = ssm.guildid AND ss.slotid = ssm.slotid
        LEFT JOIN guild_config gc ON gc.guildid = ssm.guildid
        LEFT JOIN schedule_guild_config sgc ON sgc.guildid = ssm.guildid
        WHERE ssm.userid = ${userId}
          AND ssm.slotid >= ${nowSlotId}
        ORDER BY ssm.slotid ASC
        LIMIT 50
      `

      // --- AI-MODIFIED (2026-04-05) ---
      // Purpose: isLive must also check slotid is current, not just opened/unclosed
      const sessions = rows.map((r) => ({
        slotid: r.slotid,
        slotTime: slotIdToDate(r.slotid).toISOString(),
        guildId: r.guildid.toString(),
        guildName: r.guild_name || "Unknown Server",
        guildIcon: buildIconUrl(r.guildid.toString(), r.guild_icon),
        bookedAt: r.booked_at.toISOString(),
        cost: r.schedule_cost ?? 0,
        isLive: r.opened_at !== null && r.closed_at === null,
      }))
      // --- END AI-MODIFIED ---

      return res.status(200).json({ sessions })
    }

    if (mode === "stats") {
      const [statsRaw, perServerRaw] = await Promise.all([
        prisma.$queryRaw<[{
          total_booked: bigint
          total_attended: bigint
          total_clock: bigint
          coins_spent: bigint
          coins_earned: bigint
        }]>`
          SELECT
            COUNT(*) as total_booked,
            COUNT(*) FILTER (WHERE attended) as total_attended,
            COALESCE(SUM(clock), 0) as total_clock,
            COALESCE((
              SELECT SUM(ABS(ct.amount))
              FROM coin_transactions ct
              JOIN schedule_session_members ssm2 ON ssm2.book_transactionid = ct.transactionid
              WHERE ssm2.userid = ${userId}
            ), 0) as coins_spent,
            COALESCE((
              SELECT SUM(ct.amount)
              FROM coin_transactions ct
              JOIN schedule_session_members ssm2 ON ssm2.reward_transactionid = ct.transactionid
              WHERE ssm2.userid = ${userId}
            ), 0) as coins_earned
          FROM schedule_session_members ssm
          WHERE ssm.userid = ${userId}
            AND EXISTS (
              SELECT 1 FROM schedule_sessions ss
              WHERE ss.guildid = ssm.guildid AND ss.slotid = ssm.slotid
              AND ss.closed_at IS NOT NULL
            )
        `,
        // --- AI-MODIFIED (2026-04-05) ---
        // Purpose: Filter per-server stats to closed sessions only (matching summary query)
        prisma.$queryRaw<Array<{
          guildid: bigint
          guild_name: string | null
          guild_icon: string | null
          total_booked: bigint
          total_attended: bigint
        }>>`
          SELECT
            ssm.guildid,
            gc.name as guild_name,
            gc.avatar_hash as guild_icon,
            COUNT(*) as total_booked,
            COUNT(*) FILTER (WHERE ssm.attended) as total_attended
          FROM schedule_session_members ssm
          LEFT JOIN guild_config gc ON gc.guildid = ssm.guildid
          WHERE ssm.userid = ${userId}
            AND EXISTS (
              SELECT 1 FROM schedule_sessions ss
              WHERE ss.guildid = ssm.guildid AND ss.slotid = ssm.slotid
              AND ss.closed_at IS NOT NULL
            )
          GROUP BY ssm.guildid, gc.name, gc.avatar_hash
          ORDER BY total_booked DESC
          LIMIT 20
        `,
        // --- END AI-MODIFIED ---
      ])

      const s = statsRaw[0]
      const totalBooked = Number(s?.total_booked || 0)
      const totalAttended = Number(s?.total_attended || 0)

      const streakRows = await prisma.$queryRaw<Array<{ attended: boolean }>>`
        SELECT ssm.attended
        FROM schedule_session_members ssm
        JOIN schedule_sessions ss ON ss.guildid = ssm.guildid AND ss.slotid = ssm.slotid
        WHERE ssm.userid = ${userId} AND ss.closed_at IS NOT NULL
        ORDER BY ssm.slotid DESC
        LIMIT 200
      `
      // --- AI-MODIFIED (2026-04-05) ---
      // Purpose: Fix streak calc — old code set currentStreak to an older run
      // when the most recent session was missed
      let currentStreak = 0
      let foundFirstMiss = false
      for (const row of streakRows) {
        if (row.attended && !foundFirstMiss) currentStreak++
        else foundFirstMiss = true
      }
      let bestStreak = 0
      let streak = 0
      for (const row of streakRows) {
        if (row.attended) {
          streak++
          if (streak > bestStreak) bestStreak = streak
        } else {
          streak = 0
        }
      }
      // --- END AI-MODIFIED ---

      const trendRows = await prisma.$queryRaw<Array<{
        month: string
        booked: bigint
        attended: bigint
      }>>`
        SELECT
          to_char(to_timestamp(ssm.slotid), 'YYYY-MM') as month,
          COUNT(*) as booked,
          COUNT(*) FILTER (WHERE ssm.attended) as attended
        FROM schedule_session_members ssm
        LEFT JOIN schedule_sessions ss ON ss.guildid = ssm.guildid AND ss.slotid = ssm.slotid
        WHERE ssm.userid = ${userId}
          AND ssm.slotid >= ${nowSlotId - 86400 * 180}
        GROUP BY month
        ORDER BY month
      `

      return res.status(200).json({
        summary: {
          totalBooked,
          totalAttended,
          attendanceRate: totalBooked > 0 ? Math.round((totalAttended / totalBooked) * 100) : 0,
          totalClockSeconds: Number(s?.total_clock || 0),
          coinsSpent: Number(s?.coins_spent || 0),
          coinsEarned: Number(s?.coins_earned || 0),
          currentStreak,
          bestStreak,
        },
        perServer: perServerRaw.map((r) => ({
          guildId: r.guildid.toString(),
          guildName: r.guild_name || "Unknown Server",
          guildIcon: buildIconUrl(r.guildid.toString(), r.guild_icon),
          totalBooked: Number(r.total_booked),
          totalAttended: Number(r.total_attended),
          attendanceRate: Number(r.total_booked) > 0
            ? Math.round((Number(r.total_attended) / Number(r.total_booked)) * 100) : 0,
        })),
        monthlyTrend: trendRows.map((r) => ({
          month: r.month,
          booked: Number(r.booked),
          attended: Number(r.attended),
        })),
      })
    }

    // mode === "calendar" (default)
    const fromParam = req.query.from as string | undefined
    const toParam = req.query.to as string | undefined

    let fromSlotId = nowSlotId - 86400 * 90
    let toSlotId = nowSlotId + 86400 * 30

    if (fromParam) {
      const d = new Date(fromParam)
      if (!isNaN(d.getTime())) fromSlotId = Math.floor(d.getTime() / 1000)
    }
    if (toParam) {
      const d = new Date(toParam)
      if (!isNaN(d.getTime())) toSlotId = Math.floor(d.getTime() / 1000)
    }

    const rows = await prisma.$queryRaw<Array<{
      slotid: number
      guildid: bigint
      attended: boolean
      clock: number
      booked_at: Date
      guild_name: string | null
      guild_icon: string | null
      opened_at: Date | null
      closed_at: Date | null
    }>>`
      SELECT
        ssm.slotid,
        ssm.guildid,
        ssm.attended,
        ssm.clock,
        ssm.booked_at,
        gc.name as guild_name,
        gc.avatar_hash as guild_icon,
        ss.opened_at,
        ss.closed_at
      FROM schedule_session_members ssm
      LEFT JOIN schedule_sessions ss ON ss.guildid = ssm.guildid AND ss.slotid = ssm.slotid
      LEFT JOIN guild_config gc ON gc.guildid = ssm.guildid
      WHERE ssm.userid = ${userId}
        AND ssm.slotid >= ${fromSlotId}
        AND ssm.slotid <= ${toSlotId}
      ORDER BY ssm.slotid DESC
      LIMIT 500
    `

    // --- AI-MODIFIED (2026-04-05) ---
    // Purpose: isUpcoming must also check session hasn't closed yet
    const sessions = rows.map((r) => ({
      slotid: r.slotid,
      slotTime: slotIdToDate(r.slotid).toISOString(),
      guildId: r.guildid.toString(),
      guildName: r.guild_name || "Unknown Server",
      guildIcon: buildIconUrl(r.guildid.toString(), r.guild_icon),
      attended: r.attended,
      clock: r.clock,
      bookedAt: r.booked_at.toISOString(),
      isClosed: r.closed_at !== null,
      isUpcoming: r.slotid >= nowSlotId && r.closed_at === null,
    }))
    // --- END AI-MODIFIED ---

    const userTz = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { timezone: true },
    })

    return res.status(200).json({
      sessions,
      timezone: userTz?.timezone || null,
    })
  },
})
