// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Paginated schedule session history with per-session
//          member details (attendance, clock time)
// ============================================================
import { prisma } from "@/utils/prisma"
import { Prisma } from "@prisma/client"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

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
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: validate guild id from query via parseBigInt (400 on invalid)
    const guildId = parseBigInt(req.query.id, "id")
    // --- END AI-MODIFIED ---
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 20))
    const offset = (page - 1) * pageSize

    // --- AI-MODIFIED (2026-04-04) ---
    // Purpose: Support from/to date range filtering for calendar view
    const fromParam = req.query.from as string | undefined
    const toParam = req.query.to as string | undefined
    let fromSlotId: number | null = null
    let toSlotId: number | null = null
    if (fromParam) {
      const d = new Date(fromParam)
      if (!isNaN(d.getTime())) fromSlotId = Math.floor(d.getTime() / 1000)
    }
    if (toParam) {
      const d = new Date(toParam)
      if (!isNaN(d.getTime())) toSlotId = Math.floor(d.getTime() / 1000)
    }

    const hasDateFilter = fromSlotId !== null || toSlotId !== null
    const dateFilterClause = hasDateFilter
      ? Prisma.sql`${fromSlotId !== null ? Prisma.sql`AND slotid >= ${fromSlotId}` : Prisma.empty}${toSlotId !== null ? Prisma.sql` AND slotid <= ${toSlotId}` : Prisma.empty}`
      : Prisma.empty
    // --- END AI-MODIFIED ---

    const [totalCountRaw, sessionsRaw] = await Promise.all([
      prisma.$queryRaw<[{ cnt: bigint }]>`
        SELECT COUNT(*) as cnt
        FROM schedule_sessions
        WHERE guildid = ${guildId} ${dateFilterClause}
      `,
      prisma.$queryRaw<Array<{
        slotid: number
        opened_at: Date | null
        closed_at: Date | null
        created_at: Date | null
      }>>`
        SELECT slotid, opened_at, closed_at, created_at
        FROM schedule_sessions
        WHERE guildid = ${guildId} ${dateFilterClause}
        ORDER BY slotid DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `,
    ])

    const totalCount = Number(totalCountRaw[0]?.cnt || 0)

    if (sessionsRaw.length === 0) {
      return res.status(200).json({ sessions: [], totalCount, page, pageSize })
    }

    const slotIds = sessionsRaw.map((s) => s.slotid)

    const membersRaw = await prisma.$queryRaw<Array<{
      slotid: number
      userid: bigint
      attended: boolean
      clock: number
      booked_at: Date
      display_name: string | null
      global_name: string | null
      avatar_hash: string | null
    }>>`
      SELECT
        ssm.slotid,
        ssm.userid,
        ssm.attended,
        ssm.clock,
        ssm.booked_at,
        m.display_name,
        uc.name as global_name,
        uc.avatar_hash
      FROM schedule_session_members ssm
      LEFT JOIN members m ON m.guildid = ssm.guildid AND m.userid = ssm.userid
      LEFT JOIN user_config uc ON uc.userid = ssm.userid
      WHERE ssm.guildid = ${guildId} AND ssm.slotid IN (${Prisma.join(slotIds)})
      ORDER BY ssm.slotid DESC, ssm.booked_at
    `

    const membersBySlot = new Map<number, Array<{
      userId: string
      name: string
      avatarUrl: string
      attended: boolean
      clock: number
      bookedAt: string
    }>>()

    for (const m of membersRaw) {
      if (!membersBySlot.has(m.slotid)) membersBySlot.set(m.slotid, [])
      const uid = m.userid.toString()
      const name = m.display_name || m.global_name || `User ${uid}`
      membersBySlot.get(m.slotid)!.push({
        userId: uid,
        name,
        avatarUrl: buildAvatarUrl(uid, m.avatar_hash ?? null),
        attended: m.attended,
        clock: m.clock,
        bookedAt: m.booked_at.toISOString(),
      })
    }

    const sessions = sessionsRaw.map((s) => {
      const members = membersBySlot.get(s.slotid) || []
      const totalBooked = members.length
      const totalAttended = members.filter((m) => m.attended).length
      const totalMissed = s.closed_at ? totalBooked - totalAttended : 0
      return {
        slotid: s.slotid,
        slotTime: new Date(s.slotid * 1000).toISOString(),
        openedAt: s.opened_at?.toISOString() ?? null,
        closedAt: s.closed_at?.toISOString() ?? null,
        totalBooked,
        totalAttended,
        totalMissed,
        attendanceRate: totalBooked > 0 ? Math.round((totalAttended / totalBooked) * 100) : 0,
        members,
      }
    })

    res.status(200).json({ sessions, totalCount, page, pageSize })
  },
})
