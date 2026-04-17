// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-17
// Purpose: Per-member blacklist history endpoint for the new
//          "Blacklist History" tab in the member detail panel.
//          Returns per-type counts, the configured escalation
//          ladders, the currently-active blacklist (if any),
//          recent offences with offense numbers, and a 12-month
//          monthly histogram for the sparkline.
//          Mirrors the offence-counting logic in the bot's
//          VideoTicket.autocreate / ScreenTicket.autocreate.
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

type BlacklistType = "STUDY_BAN" | "SCREEN_BAN"

const BLACKLIST_LABELS: Record<BlacklistType, string> = {
  STUDY_BAN: "Video Blacklist",
  SCREEN_BAN: "Screen Blacklist",
}

function formatDurationSecs(secs: number | null): string {
  if (secs == null) return "Permanent"
  if (secs < 60) return `${secs}s`
  if (secs < 3600) return `${Math.round(secs / 60)}m`
  if (secs < 86400) {
    const h = Math.floor(secs / 3600)
    const m = Math.round((secs % 3600) / 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  if (secs < 604800) {
    const d = Math.floor(secs / 86400)
    const h = Math.round((secs % 86400) / 3600)
    return h > 0 ? `${d}d ${h}h` : `${d}d`
  }
  const d = Math.floor(secs / 86400)
  return `${d}d`
}

async function fetchScreenBanDurations(
  guildId: bigint
): Promise<{ duration: number }[]> {
  const rows = await prisma.$queryRaw<{ duration: number }[]>`
    SELECT duration::int AS duration
    FROM screenban_durations
    WHERE guildid = ${guildId}
    ORDER BY rowid
  `
  return rows.map((r) => ({ duration: Number(r.duration) }))
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const targetUserId = parseBigInt(req.query.userId, "user ID")

    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const member = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
      select: {
        userid: true,
        display_name: true,
        user_config: { select: { avatar_hash: true, name: true } },
      },
    })
    if (!member) {
      return res.status(404).json({ error: "Member not found in this server" })
    }

    const [allTickets, studybanDurations, screenbanDurations] = await Promise.all([
      prisma.tickets.findMany({
        where: {
          guildid: guildId,
          targetid: targetUserId,
          ticket_type: { in: ["STUDY_BAN", "SCREEN_BAN"] },
        },
        orderBy: { ticketid: "asc" },
        select: {
          ticketid: true,
          ticket_type: true,
          ticket_state: true,
          created_at: true,
          content: true,
          moderator_id: true,
          duration: true,
          expiry: true,
          pardoned_by: true,
          pardoned_at: true,
          pardoned_reason: true,
          auto: true,
        },
      }),
      prisma.studyban_durations.findMany({
        where: { guildid: guildId },
        orderBy: { rowid: "asc" },
        select: { duration: true },
      }),
      fetchScreenBanDurations(guildId),
    ])

    const offenseRows =
      allTickets.length > 0
        ? await prisma.$queryRaw<
            { ticketid: number; offense_number: bigint }[]
          >`
            WITH ranked AS (
              SELECT
                ticketid,
                ROW_NUMBER() OVER (
                  PARTITION BY ticket_type
                  ORDER BY ticketid
                ) AS offense_number
              FROM tickets
              WHERE guildid = ${guildId}
                AND targetid = ${targetUserId}
                AND ticket_type IN ('STUDY_BAN'::tickettype, 'SCREEN_BAN'::tickettype)
                AND ticket_state != 'PARDONED'::ticketstate
            )
            SELECT ticketid, offense_number
            FROM ranked
            WHERE ticketid IN (${Prisma.join(
              allTickets.map((t) => t.ticketid)
            )})
          `
        : []
    const offenseMap = new Map<number, number>()
    for (const row of offenseRows) {
      offenseMap.set(row.ticketid, Number(row.offense_number))
    }

    const ladders: Record<
      BlacklistType,
      { tier: number; durationSeconds: number | null; label: string }[]
    > = {
      STUDY_BAN: studybanDurations.map((d, i) => ({
        tier: i + 1,
        durationSeconds: d.duration,
        label: formatDurationSecs(d.duration),
      })),
      SCREEN_BAN: screenbanDurations.map((d, i) => ({
        tier: i + 1,
        durationSeconds: d.duration,
        label: formatDurationSecs(d.duration),
      })),
    }

    const counts: Record<
      BlacklistType,
      { total: number; active: number; pardoned: number }
    > = {
      STUDY_BAN: { total: 0, active: 0, pardoned: 0 },
      SCREEN_BAN: { total: 0, active: 0, pardoned: 0 },
    }
    const activeBlacklist: Record<
      BlacklistType,
      { ticketId: number; expiry: string | null; isPermanent: boolean } | null
    > = {
      STUDY_BAN: null,
      SCREEN_BAN: null,
    }

    for (const t of allTickets) {
      const typ = t.ticket_type as BlacklistType
      counts[typ].total += 1
      if (t.ticket_state === "PARDONED") {
        counts[typ].pardoned += 1
        continue
      }
      counts[typ].active += 1

      if (t.ticket_state === "OPEN" || t.ticket_state === "EXPIRING") {
        const candidate = {
          ticketId: t.ticketid,
          expiry: t.expiry?.toISOString() ?? null,
          isPermanent: t.expiry == null,
        }
        const existing = activeBlacklist[typ]
        if (
          !existing ||
          (candidate.expiry === null && existing.expiry !== null) ||
          (candidate.expiry !== null &&
            existing.expiry !== null &&
            new Date(candidate.expiry).getTime() >
              new Date(existing.expiry).getTime())
        ) {
          activeBlacklist[typ] = candidate
        }
      }
    }

    type LadderTier = {
      tier: number
      durationSeconds: number | null
      label: string
    }
    type ByTypeEntry = {
      label: string
      total: number
      active: number
      pardoned: number
      ladder: LadderTier[]
      nextTier: LadderTier | null
      atPermanentTier: boolean
      currentBlacklist: (typeof activeBlacklist)[BlacklistType]
    }
    const byType: Record<BlacklistType, ByTypeEntry> = {
      STUDY_BAN: {} as ByTypeEntry,
      SCREEN_BAN: {} as ByTypeEntry,
    }

    for (const typ of ["STUDY_BAN", "SCREEN_BAN"] as BlacklistType[]) {
      const ladder = ladders[typ]
      const activeCount = counts[typ].active
      let nextTier: LadderTier | null = null
      let atPermanentTier = false
      if (ladder.length === 0) {
        atPermanentTier = true
      } else if (activeCount >= ladder.length) {
        atPermanentTier = true
      } else {
        nextTier = ladder[activeCount]
      }

      byType[typ] = {
        label: BLACKLIST_LABELS[typ],
        total: counts[typ].total,
        active: counts[typ].active,
        pardoned: counts[typ].pardoned,
        ladder,
        nextTier,
        atPermanentTier,
        currentBlacklist: activeBlacklist[typ],
      }
    }

    const recentTickets = [...allTickets]
      .sort((a, b) => b.ticketid - a.ticketid)
      .slice(0, 20)
      .map((t) => ({
        ticketId: t.ticketid,
        type: t.ticket_type as BlacklistType,
        state: t.ticket_state,
        createdAt: t.created_at,
        content: t.content,
        moderatorId: t.moderator_id.toString(),
        duration: t.duration,
        expiry: t.expiry,
        pardonedBy: t.pardoned_by?.toString() ?? null,
        pardonedAt: t.pardoned_at,
        pardonedReason: t.pardoned_reason,
        auto: t.auto,
        offenseNumber: offenseMap.get(t.ticketid) ?? null,
        totalTiers:
          (t.ticket_type === "STUDY_BAN"
            ? ladders.STUDY_BAN.length
            : ladders.SCREEN_BAN.length) || null,
      }))

    const monthsBack = 12
    const now = new Date()
    const monthly: { month: string; studyBans: number; screenBans: number }[] = []
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      monthly.push({
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        studyBans: 0,
        screenBans: 0,
      })
    }
    const monthIndex = new Map(monthly.map((m, i) => [m.month, i]))
    for (const t of allTickets) {
      if (!t.created_at) continue
      const created = new Date(t.created_at)
      const key = `${created.getFullYear()}-${String(
        created.getMonth() + 1
      ).padStart(2, "0")}`
      const idx = monthIndex.get(key)
      if (idx == null) continue
      if (t.ticket_type === "STUDY_BAN") monthly[idx].studyBans += 1
      else if (t.ticket_type === "SCREEN_BAN") monthly[idx].screenBans += 1
    }

    return res.status(200).json({
      user: {
        userId: member.userid.toString(),
        displayName: member.display_name || member.user_config?.name || null,
      },
      byType,
      recentTickets,
      monthly,
    })
  },
})
