// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-17
// Purpose: Admin-only endpoint to selectively reset a single member's
//          tracked stats (voice/text sessions, XP, pomodoro milestones,
//          season stats, coins) in ONE specific guild, with optional
//          time-frame filtering. Supports a `?dryRun=true` preview that
//          returns row counts without touching any data, then a real
//          POST that runs everything inside a single Prisma transaction
//          plus an audit row.
//
//          Safety model:
//            - guildId + userId come ONLY from the URL path
//            - requireAdmin is checked against THAT guild
//            - every Prisma query has WHERE { guildid, userid, ... }
//            - assertScope() rejects any query missing those keys before
//              it is queued into the transaction
//            - all destructive ops happen in one $transaction; if any
//              step (including the audit insert) fails, Postgres rolls
//              back EVERYTHING -- no partial reset is ever committed
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

const RESET_ACTION_TYPE = "MEMBER_STATS_RESET"
const REASON_MIN_LENGTH = 3
const REASON_MAX_LENGTH = 1000
const FIVE_YEARS_MS = 5 * 365 * 24 * 60 * 60 * 1000

type Selections = {
  voiceSessions?: boolean
  textSessions?: boolean
  voiceXp?: boolean
  textXp?: boolean
  pomodoroMilestones?: boolean
  seasonStats?: boolean
  coins?: boolean
}

type TimeFrame =
  | { kind: "all" }
  | { kind: "last"; hours: number }
  | { kind: "custom"; startISO: string; endISO: string }

interface ResetBody {
  selections: Selections
  timeFrame: TimeFrame
  reason: string
}

const TIME_FRAMED_KEYS = [
  "voiceSessions",
  "textSessions",
  "voiceXp",
  "textXp",
  "pomodoroMilestones",
] as const
type TimeFramedKey = (typeof TIME_FRAMED_KEYS)[number]

const NON_TIME_FRAMED_KEYS = ["seasonStats", "coins"] as const
type NonTimeFramedKey = (typeof NON_TIME_FRAMED_KEYS)[number]

interface ParsedRange {
  start: Date | null
  end: Date | null
}

function parseTimeFrame(tf: TimeFrame): ParsedRange {
  if (tf.kind === "all") return { start: null, end: null }
  if (tf.kind === "last") {
    const end = new Date()
    const start = new Date(end.getTime() - tf.hours * 60 * 60 * 1000)
    return { start, end }
  }
  return { start: new Date(tf.startISO), end: new Date(tf.endISO) }
}

function rangeFilter(range: ParsedRange) {
  if (!range.start || !range.end) return undefined
  return { gte: range.start, lte: range.end }
}

type ValidationResult =
  | { ok: true; data: ResetBody; error?: undefined }
  | { ok: false; data?: undefined; error: string }

function validateBody(body: any): ValidationResult {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request body" }

  const { selections, timeFrame, reason } = body as Partial<ResetBody>

  if (!selections || typeof selections !== "object") {
    return { ok: false, error: "selections object is required" }
  }
  const knownKeys: ReadonlyArray<keyof Selections> = [
    ...TIME_FRAMED_KEYS,
    ...NON_TIME_FRAMED_KEYS,
  ]
  const cleanedSelections: Selections = {}
  for (const k of knownKeys) {
    if (selections[k] === true) cleanedSelections[k] = true
    else if (selections[k] !== undefined && typeof selections[k] !== "boolean") {
      return { ok: false, error: `selections.${k} must be boolean` }
    }
  }
  if (!Object.values(cleanedSelections).some((v) => v === true)) {
    return { ok: false, error: "At least one selection must be true" }
  }

  if (!timeFrame || typeof timeFrame !== "object") {
    return { ok: false, error: "timeFrame is required" }
  }
  let cleanedTimeFrame: TimeFrame
  if (timeFrame.kind === "all") {
    cleanedTimeFrame = { kind: "all" }
  } else if (timeFrame.kind === "last") {
    const hours = Number((timeFrame as any).hours)
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24 * 365 * 10) {
      return { ok: false, error: "timeFrame.hours must be a positive number" }
    }
    cleanedTimeFrame = { kind: "last", hours }
  } else if (timeFrame.kind === "custom") {
    const start = new Date((timeFrame as any).startISO)
    const end = new Date((timeFrame as any).endISO)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { ok: false, error: "timeFrame.startISO/endISO must be valid ISO dates" }
    }
    if (end.getTime() <= start.getTime()) {
      return { ok: false, error: "timeFrame end must be after start" }
    }
    const now = Date.now()
    if (now - start.getTime() > FIVE_YEARS_MS || end.getTime() - now > FIVE_YEARS_MS) {
      return { ok: false, error: "timeFrame must be within the last 5 years" }
    }
    cleanedTimeFrame = { kind: "custom", startISO: start.toISOString(), endISO: end.toISOString() }
  } else {
    return { ok: false, error: "timeFrame.kind must be 'all', 'last', or 'custom'" }
  }

  if (typeof reason !== "string") return { ok: false, error: "reason is required" }
  const trimmedReason = reason.trim()
  if (trimmedReason.length < REASON_MIN_LENGTH) {
    return { ok: false, error: `reason must be at least ${REASON_MIN_LENGTH} characters` }
  }
  if (trimmedReason.length > REASON_MAX_LENGTH) {
    return { ok: false, error: `reason too long (max ${REASON_MAX_LENGTH} characters)` }
  }

  if (cleanedTimeFrame.kind !== "all") {
    for (const k of NON_TIME_FRAMED_KEYS) {
      if (cleanedSelections[k]) {
        return {
          ok: false,
          error: "Season stats and coins can only be reset across all time. Switch the time frame to 'All time' or unselect them.",
        }
      }
    }
  }

  return { ok: true, data: { selections: cleanedSelections, timeFrame: cleanedTimeFrame, reason: trimmedReason } }
}

function assertScope(scope: { guildId: bigint; userId: bigint }, where: any, label: string): void {
  if (!where || typeof where !== "object") {
    throw new Error(`assertScope[${label}]: where missing`)
  }
  if (where.guildid_userid) {
    const k = where.guildid_userid
    if (k.guildid !== scope.guildId || k.userid !== scope.userId) {
      throw new Error(`assertScope[${label}]: composite key mismatch`)
    }
    return
  }
  if (where.guildid !== scope.guildId) {
    throw new Error(`assertScope[${label}]: guildid missing or mismatched`)
  }
  if (where.userid === undefined) {
    throw new Error(`assertScope[${label}]: userid missing`)
  }
  if (where.userid !== scope.userId) {
    if (typeof where.userid === "object" && where.userid !== null && "in" in where.userid) {
      throw new Error(`assertScope[${label}]: userid must be a single value, not an 'in' clause`)
    }
    throw new Error(`assertScope[${label}]: userid mismatched`)
  }
}

async function buildPreview(
  guildId: bigint,
  userId: bigint,
  selections: Selections,
  range: ParsedRange,
) {
  const tf = rangeFilter(range)

  const [
    voiceCountAgg,
    textCountAgg,
    voiceXpAgg,
    textXpAgg,
    pomodoroCount,
    seasonRow,
    memberRow,
    ongoingRow,
  ] = await Promise.all([
    selections.voiceSessions
      ? prisma.voice_sessions.aggregate({
          where: { guildid: guildId, userid: userId, ...(tf ? { start_time: tf } : {}) },
          _count: { sessionid: true },
          _sum: { duration: true },
        })
      : null,
    selections.textSessions
      ? prisma.text_sessions.aggregate({
          where: { guildid: guildId, userid: userId, ...(tf ? { start_time: tf } : {}) },
          _count: { sessionid: true },
          _sum: { duration: true },
        })
      : null,
    selections.voiceXp
      ? prisma.member_experience.aggregate({
          where: {
            guildid: guildId,
            userid: userId,
            exp_type: "VOICE_XP",
            ...(tf ? { earned_at: tf } : {}),
          },
          _count: { member_expid: true },
          _sum: { amount: true },
        })
      : null,
    selections.textXp
      ? prisma.member_experience.aggregate({
          where: {
            guildid: guildId,
            userid: userId,
            exp_type: "TEXT_XP",
            ...(tf ? { earned_at: tf } : {}),
          },
          _count: { member_expid: true },
          _sum: { amount: true },
        })
      : null,
    selections.pomodoroMilestones
      ? prisma.pomodoro_milestones.count({
          where: { guildid: guildId, userid: userId, ...(tf ? { achieved_at: tf } : {}) },
        })
      : null,
    selections.seasonStats
      ? prisma.season_stats.findUnique({
          where: { guildid_userid: { guildid: guildId, userid: userId } },
          select: { voice_stats: true, xp_stats: true, message_stats: true },
        })
      : null,
    prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: userId } },
      select: { coins: true },
    }),
    prisma.voice_sessions_ongoing.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: userId } },
      select: { start_time: true, live_duration: true },
    }),
  ])

  let activeSessionWillBeDeleted = false
  if (selections.voiceSessions && ongoingRow?.start_time) {
    if (!range.start && !range.end) {
      activeSessionWillBeDeleted = true
    } else if (range.start && range.end) {
      const t = ongoingRow.start_time.getTime()
      activeSessionWillBeDeleted = t >= range.start.getTime() && t <= range.end.getTime()
    }
  }

  return {
    counts: {
      voiceSessions: voiceCountAgg?._count.sessionid ?? 0,
      voiceSessionsSeconds: voiceCountAgg?._sum.duration ?? 0,
      textSessions: textCountAgg?._count.sessionid ?? 0,
      textSessionsSeconds: textCountAgg?._sum.duration ?? 0,
      voiceXp: voiceXpAgg?._count.member_expid ?? 0,
      voiceXpAmount: voiceXpAgg?._sum.amount ?? 0,
      textXp: textXpAgg?._count.member_expid ?? 0,
      textXpAmount: textXpAgg?._sum.amount ?? 0,
      pomodoroMilestones: pomodoroCount ?? 0,
      hasSeasonStats: !!seasonRow,
      seasonStatsSnapshot: seasonRow ?? null,
    },
    currentCoins: memberRow?.coins ?? 0,
    activeSession: ongoingRow
      ? {
          exists: true,
          startedAt: ongoingRow.start_time?.toISOString() ?? null,
          willBeDeleted: activeSessionWillBeDeleted,
        }
      : { exists: false, startedAt: null, willBeDeleted: false },
  }
}

export default apiHandler({
  async POST(req: NextApiRequest, res: NextApiResponse) {
    const guildId = parseBigInt(req.query.id, "guildId")
    const targetUserId = parseBigInt(req.query.userId, "userId")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (auth.userId === targetUserId) {
      return res.status(400).json({ error: "You cannot reset your own stats from the dashboard." })
    }

    const memberExists = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
      select: { userid: true },
    })
    if (!memberExists) {
      return res.status(404).json({ error: "Member not found in this server" })
    }

    const validation = validateBody(req.body)
    if (validation.ok !== true) {
      return res.status(400).json({ error: validation.error })
    }
    const { selections, timeFrame, reason } = validation.data
    const range = parseTimeFrame(timeFrame)
    const tf = rangeFilter(range)

    const isDryRun = req.query.dryRun === "true" || req.query.dryRun === "1"

    if (isDryRun) {
      const preview = await buildPreview(guildId, targetUserId, selections, range)
      return res.status(200).json({ dryRun: true, ...preview })
    }

    const memberRow = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
      select: { coins: true, last_study_badgeid: true },
    })
    const previousCoins = memberRow?.coins ?? 0

    const ongoingRow = await prisma.voice_sessions_ongoing.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
      select: { start_time: true },
    })

    const ranksRow = await prisma.member_ranks.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
      select: { current_voice_rankid: true, current_xp_rankid: true },
    })
    let shouldDeleteOngoing = false
    if (selections.voiceSessions && ongoingRow?.start_time) {
      if (!range.start && !range.end) {
        shouldDeleteOngoing = true
      } else if (range.start && range.end) {
        const t = ongoingRow.start_time.getTime()
        shouldDeleteOngoing = t >= range.start.getTime() && t <= range.end.getTime()
      }
    }

    let textXpExpIdsToOrphan: bigint[] = []
    if (selections.textXp) {
      const rows = await prisma.member_experience.findMany({
        where: {
          guildid: guildId,
          userid: targetUserId,
          exp_type: "TEXT_XP",
          ...(tf ? { earned_at: tf } : {}),
        },
        select: { member_expid: true },
      })
      textXpExpIdsToOrphan = rows.map((r) => r.member_expid)
    }

    const scope = { guildId, userId: targetUserId }
    const ops: Prisma.PrismaPromise<unknown>[] = []
    type AffectedKey =
      | "voiceSessions"
      | "voiceSessionsOngoing"
      | "textSessions"
      | "voiceXp"
      | "textXpSessionsOrphaned"
      | "textXp"
      | "pomodoroMilestones"
      | "seasonStats"
      | "lastStudyBadgeCleared"
      | "ranksCleared"
      | "coinsCleared"
      | "auditRowId"
    const opLabels: AffectedKey[] = []

    function pushOp<T>(label: AffectedKey, where: any, factory: () => Prisma.PrismaPromise<T>) {
      assertScope(scope, where, label)
      ops.push(factory() as Prisma.PrismaPromise<unknown>)
      opLabels.push(label)
    }

    if (selections.voiceSessions) {
      const where = { guildid: guildId, userid: targetUserId, ...(tf ? { start_time: tf } : {}) }
      pushOp("voiceSessions", where, () => prisma.voice_sessions.deleteMany({ where }))
    }

    if (shouldDeleteOngoing) {
      const where = { guildid: guildId, userid: targetUserId }
      pushOp("voiceSessionsOngoing", where, () => prisma.voice_sessions_ongoing.deleteMany({ where }))
    }

    if (selections.textSessions) {
      const where = { guildid: guildId, userid: targetUserId, ...(tf ? { start_time: tf } : {}) }
      pushOp("textSessions", where, () => prisma.text_sessions.deleteMany({ where }))
    }

    if (selections.voiceXp) {
      const where = {
        guildid: guildId,
        userid: targetUserId,
        exp_type: "VOICE_XP" as const,
        ...(tf ? { earned_at: tf } : {}),
      }
      pushOp("voiceXp", where, () => prisma.member_experience.deleteMany({ where }))
    }

    if (selections.textXp) {
      if (textXpExpIdsToOrphan.length > 0) {
        const orphanWhere = {
          guildid: guildId,
          userid: targetUserId,
          member_expid: { in: textXpExpIdsToOrphan },
        }
        pushOp("textXpSessionsOrphaned", orphanWhere, () =>
          prisma.text_sessions.updateMany({
            where: orphanWhere,
            data: { member_expid: null },
          }),
        )
      }
      const where = {
        guildid: guildId,
        userid: targetUserId,
        exp_type: "TEXT_XP" as const,
        ...(tf ? { earned_at: tf } : {}),
      }
      pushOp("textXp", where, () => prisma.member_experience.deleteMany({ where }))
    }

    if (selections.pomodoroMilestones) {
      const where = { guildid: guildId, userid: targetUserId, ...(tf ? { achieved_at: tf } : {}) }
      pushOp("pomodoroMilestones", where, () => prisma.pomodoro_milestones.deleteMany({ where }))
    }

    if (selections.seasonStats) {
      const where = { guildid: guildId, userid: targetUserId }
      pushOp("seasonStats", where, () => prisma.season_stats.deleteMany({ where }))
    }

    const shouldClearBadge = !!(selections.voiceSessions || selections.voiceXp)
    if (shouldClearBadge && memberRow?.last_study_badgeid != null) {
      const where = { guildid_userid: { guildid: guildId, userid: targetUserId } }
      pushOp("lastStudyBadgeCleared", where, () =>
        prisma.members.update({ where, data: { last_study_badgeid: null } }),
      )
    }

    const clearVoiceRank =
      !!(selections.voiceSessions || selections.voiceXp) && ranksRow?.current_voice_rankid != null
    const clearXpRank =
      !!(selections.voiceXp || selections.textXp) && ranksRow?.current_xp_rankid != null
    if (ranksRow && (clearVoiceRank || clearXpRank)) {
      const where = { guildid_userid: { guildid: guildId, userid: targetUserId } }
      const data: Prisma.member_ranksUpdateInput = {}
      if (clearVoiceRank) data.voice_ranks = { disconnect: true }
      if (clearXpRank) data.xp_ranks = { disconnect: true }
      pushOp("ranksCleared", where, () =>
        prisma.member_ranks.update({ where, data }),
      )
    }

    if (selections.coins && previousCoins > 0) {
      const memberWhere = { guildid_userid: { guildid: guildId, userid: targetUserId } }
      pushOp("coinsCleared", memberWhere, () =>
        prisma.members.update({ where: memberWhere, data: { coins: 0 } }),
      )
      ops.push(
        prisma.coin_transactions.create({
          data: {
            transactiontype: "ADMIN",
            guildid: guildId,
            actorid: auth.userId,
            amount: previousCoins,
            bonus: 0,
            from_account: targetUserId,
            to_account: null,
          },
        }),
      )
      opLabels.push("coinsCleared")
    } else if (selections.coins && previousCoins === 0) {
      // No-op: nothing to clear, but record it in the audit so admins can see.
    }

    const resultPlaceholderIndex = ops.length
    ops.push(
      prisma.dashboard_admin_audit.create({
        data: {
          actor_userid: auth.userId,
          guildid: guildId,
          target_userid: targetUserId,
          action_type: RESET_ACTION_TYPE,
          selections: selections as unknown as Prisma.InputJsonValue,
          time_frame: timeFrame as unknown as Prisma.InputJsonValue,
          reason,
          result: { pending: true } as Prisma.InputJsonValue,
        },
        select: { auditid: true },
      }),
    )

    let txResults: any[]
    try {
      txResults = await prisma.$transaction(ops)
    } catch (err: any) {
      console.error("[reset-stats] transaction failed", {
        guildId: guildId.toString(),
        userId: targetUserId.toString(),
        actor: auth.discordId,
        msg: err?.message,
      })
      return res.status(500).json({
        error: "Reset failed -- no changes were made (transaction rolled back).",
      })
    }

    const affected: Record<string, number> = {}
    for (let i = 0; i < opLabels.length; i++) {
      const label = opLabels[i]
      const r = txResults[i]
      if (r && typeof r.count === "number") {
        affected[label] = (affected[label] || 0) + r.count
      } else if (
        label === "lastStudyBadgeCleared" ||
        label === "coinsCleared" ||
        label === "ranksCleared"
      ) {
        affected[label] = (affected[label] || 0) + 1
      }
    }
    if (selections.coins) {
      affected.coinsCleared = previousCoins
    }

    const auditRow = txResults[resultPlaceholderIndex] as { auditid: bigint }
    const auditId = auditRow.auditid.toString()

    try {
      await prisma.dashboard_admin_audit.update({
        where: { auditid: auditRow.auditid },
        data: {
          result: {
            affected,
            previousCoins: selections.coins ? previousCoins : undefined,
          } as Prisma.InputJsonValue,
        },
      })
    } catch (e) {
      console.warn("[reset-stats] failed to backfill audit result (non-fatal)", e)
    }

    return res.status(200).json({
      success: true,
      auditId,
      affected,
      coinsCleared: selections.coins ? previousCoins : undefined,
      message: `Reset applied. Audit ID #${auditId}.`,
    })
  },
})
