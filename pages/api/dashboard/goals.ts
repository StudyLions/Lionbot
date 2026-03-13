// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Goals API - weekly and monthly study goals
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"

/** UTC timestamp of start of week (Monday) */
function getWeekId(date: Date): number {
  const d = new Date(date)
  const daysToMonday = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - daysToMonday)
  d.setUTCHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

/** UTC timestamp of start of month */
function getMonthId(date: Date): number {
  const d = new Date(date)
  d.setUTCDate(1)
  d.setUTCHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

/** Week boundaries for a weekid */
function getWeekBounds(weekId: number): { start: Date; end: Date } {
  const start = new Date(weekId * 1000)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 7)
  return { start, end }
}

/** Month boundaries for a monthid */
function getMonthBounds(monthId: number): { start: Date; end: Date } {
  const start = new Date(monthId * 1000)
  const end = new Date(start)
  end.setUTCMonth(end.getUTCMonth() + 1)
  return { start, end }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  if (req.method === "GET") {
    const now = new Date()
    const weekId = getWeekId(now)
    const monthId = getMonthId(now)
    const { start: weekStart, end: weekEnd } = getWeekBounds(weekId)
    const { start: monthStart, end: monthEnd } = getMonthBounds(monthId)

    const [weeklyGoals, monthlyGoals] = await Promise.all([
      prisma.member_weekly_goals.findMany({
        where: { userid: auth.userId, weekid: weekId },
        include: {
          members: {
            select: {
              guild_config: { select: { name: true, guildid: true } },
            },
          },
          member_weekly_goal_tasks: { select: { completed: true } },
        },
      }),
      prisma.member_monthly_goals.findMany({
        where: { userid: auth.userId, monthid: monthId },
        include: {
          members: {
            select: {
              guild_config: { select: { name: true, guildid: true } },
            },
          },
          member_monthly_goal_tasks: { select: { completed: true } },
        },
      }),
    ])

    const [studyByGuildWeek, studyByGuildMonth] = await Promise.all([
      prisma.voice_sessions.groupBy({
        by: ["guildid"],
        where: {
          userid: auth.userId,
          start_time: { gte: weekStart, lt: weekEnd },
        },
        _sum: { duration: true },
      }),
      prisma.voice_sessions.groupBy({
        by: ["guildid"],
        where: {
          userid: auth.userId,
          start_time: { gte: monthStart, lt: monthEnd },
        },
        _sum: { duration: true },
      }),
    ])

    const studyByGuildWeekMap = new Map(
      studyByGuildWeek.map((r) => [r.guildid.toString(), r._sum.duration ?? 0])
    )
    const studyByGuildMonthMap = new Map(
      studyByGuildMonth.map((r) => [r.guildid.toString(), r._sum.duration ?? 0])
    )

    const weekly = weeklyGoals.map((g) => {
      const guildIdStr = g.guildid.toString()
      const studySeconds = studyByGuildWeekMap.get(guildIdStr) ?? 0
      const studyHours = studySeconds / 3600
      const tasksCompleted = g.member_weekly_goal_tasks.filter((t) => t.completed).length
      const serverName =
        g.members?.guild_config?.name ?? `Server ${guildIdStr}`
      return {
        guildId: guildIdStr,
        serverName,
        weekid: g.weekid,
        studyGoal: g.study_goal ?? null,
        taskGoal: g.task_goal ?? null,
        studyProgress: Math.round(studyHours * 10) / 10,
        tasksProgress: tasksCompleted,
      }
    })

    const monthly = monthlyGoals.map((g) => {
      const guildIdStr = g.guildid.toString()
      const studySeconds = studyByGuildMonthMap.get(guildIdStr) ?? 0
      const studyHours = studySeconds / 3600
      const tasksCompleted = g.member_monthly_goal_tasks.filter((t) => t.completed).length
      const serverName =
        g.members?.guild_config?.name ?? `Server ${guildIdStr}`
      return {
        guildId: guildIdStr,
        serverName,
        monthid: g.monthid,
        studyGoal: g.study_goal ?? null,
        taskGoal: g.task_goal ?? null,
        studyProgress: Math.round(studyHours * 10) / 10,
        tasksProgress: tasksCompleted,
      }
    })

    return res.status(200).json({
      weekid: weekId,
      monthid: monthId,
      weekly,
      monthly,
    })
  }

  if (req.method === "PATCH") {
    const { guildId, weekid, monthid, type, study_goal, task_goal } = req.body

    if (!guildId || !type) {
      return res.status(400).json({ error: "guildId and type are required" })
    }

    const guildIdBigInt = BigInt(guildId)

    if (type === "weekly") {
      if (weekid == null) {
        return res.status(400).json({ error: "weekid is required for weekly goals" })
      }
      const updates: Record<string, number | null> = {}
      if (study_goal !== undefined) updates.study_goal = study_goal
      if (task_goal !== undefined) updates.task_goal = task_goal

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" })
      }

      await prisma.member_weekly_goals.updateMany({
        where: {
          guildid: guildIdBigInt,
          userid: auth.userId,
          weekid: Number(weekid),
        },
        data: updates,
      })

      return res.status(200).json({ success: true })
    }

    if (type === "monthly") {
      if (monthid == null) {
        return res.status(400).json({ error: "monthid is required for monthly goals" })
      }
      const updates: Record<string, number | null> = {}
      if (study_goal !== undefined) updates.study_goal = study_goal
      if (task_goal !== undefined) updates.task_goal = task_goal

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" })
      }

      await prisma.member_monthly_goals.updateMany({
        where: {
          guildid: guildIdBigInt,
          userid: auth.userId,
          monthid: Number(monthid),
        },
        data: updates,
      })

      return res.status(200).json({ success: true })
    }

    return res.status(400).json({ error: "type must be 'weekly' or 'monthly'" })
  }

  return res.status(405).json({ error: "Method not allowed" })
}
