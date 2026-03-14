// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Goals API - weekly and monthly study goals
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: full rewrite - all goal types, custom task items, attendance, period nav, summary, streaks, CRUD
// --- END AI-MODIFIED ---
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

function getWeekId(date: Date): number {
  const d = new Date(date)
  const daysToMonday = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - daysToMonday)
  d.setUTCHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

function getMonthId(date: Date): number {
  const d = new Date(date)
  d.setUTCDate(1)
  d.setUTCHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

function getWeekBounds(weekId: number): { start: Date; end: Date } {
  const start = new Date(weekId * 1000)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 7)
  return { start, end }
}

function getMonthBounds(monthId: number): { start: Date; end: Date } {
  const start = new Date(monthId * 1000)
  const end = new Date(start)
  end.setUTCMonth(end.getUTCMonth() + 1)
  return { start, end }
}

function offsetWeekId(baseWeekId: number, offset: number): number {
  const d = new Date(baseWeekId * 1000)
  d.setUTCDate(d.getUTCDate() + offset * 7)
  return Math.floor(d.getTime() / 1000)
}

function offsetMonthId(baseMonthId: number, offset: number): number {
  const d = new Date(baseMonthId * 1000)
  d.setUTCMonth(d.getUTCMonth() + offset)
  return Math.floor(d.getTime() / 1000)
}

function formatWeekLabel(weekId: number): string {
  const s = new Date(weekId * 1000)
  const e = new Date(s)
  e.setUTCDate(e.getUTCDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
  return `${fmt(s)} – ${fmt(e)}, ${s.getUTCFullYear()}`
}

function formatMonthLabel(monthId: number): string {
  const d = new Date(monthId * 1000)
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
}

function isGoalMet(goal: number | null, progress: number): boolean {
  if (goal == null || goal <= 0) return true
  return progress >= goal
}

async function buildGoalItems(
  userId: bigint,
  goals: any[],
  bounds: { start: Date; end: Date },
  type: "weekly" | "monthly"
) {
  if (goals.length === 0) return []

  const guildIds = goals.map(g => g.guildid)

  const [studyByGuild, messagesByGuild, attendanceByGuild] = await Promise.all([
    prisma.voice_sessions.groupBy({
      by: ["guildid"],
      where: { userid: userId, guildid: { in: guildIds }, start_time: { gte: bounds.start, lt: bounds.end } },
      _sum: { duration: true },
    }),
    prisma.text_sessions.groupBy({
      by: ["guildid"],
      where: { userid: userId, guildid: { in: guildIds }, start_time: { gte: bounds.start, lt: bounds.end } },
      _sum: { messages: true },
    }),
    prisma.schedule_session_members.findMany({
      where: {
        userid: userId,
        guildid: { in: guildIds },
        schedule_sessions: { opened_at: { gte: bounds.start, lt: bounds.end } },
      },
      select: { guildid: true, attended: true },
    }),
  ])

  const studyMap = new Map(studyByGuild.map(r => [r.guildid.toString(), r._sum.duration ?? 0]))
  const msgMap = new Map(messagesByGuild.map(r => [r.guildid.toString(), r._sum.messages ?? 0]))

  const attMap = new Map<string, { booked: number; attended: number }>()
  for (const a of attendanceByGuild) {
    const key = a.guildid.toString()
    const cur = attMap.get(key) || { booked: 0, attended: 0 }
    cur.booked++
    if (a.attended) cur.attended++
    attMap.set(key, cur)
  }

  return goals.map(g => {
    const gid = g.guildid.toString()
    const studySeconds = studyMap.get(gid) ?? 0
    const studyHours = Math.round((studySeconds / 3600) * 10) / 10
    const taskItems = type === "weekly" ? g.member_weekly_goal_tasks : g.member_monthly_goal_tasks
    const tasksCompleted = taskItems.filter((t: any) => t.completed).length
    const messages = msgMap.get(gid) ?? 0
    const att = attMap.get(gid) || { booked: 0, attended: 0 }
    const serverName = g.members?.guild_config?.name ?? `Server ${gid}`

    return {
      guildId: gid,
      serverName,
      periodId: type === "weekly" ? g.weekid : g.monthid,
      studyGoal: g.study_goal ?? null,
      taskGoal: g.task_goal ?? null,
      messageGoal: g.message_goal ?? null,
      studyProgress: studyHours,
      tasksProgress: tasksCompleted,
      messageProgress: messages,
      attendance: att,
      goalTasks: taskItems.map((t: any) => ({
        id: t.taskid,
        content: t.content,
        completed: t.completed,
      })),
    }
  })
}

async function computeStreak(
  userId: bigint,
  currentPeriodId: number,
  type: "weekly" | "monthly",
  maxLookback: number
): Promise<number> {
  let streak = 0
  for (let i = 1; i <= maxLookback; i++) {
    const pid = type === "weekly" ? offsetWeekId(currentPeriodId, -i) : offsetMonthId(currentPeriodId, -i)
    const bounds = type === "weekly" ? getWeekBounds(pid) : getMonthBounds(pid)

    const goals = type === "weekly"
      ? await prisma.member_weekly_goals.findMany({
          where: { userid: userId, weekid: pid },
          include: { member_weekly_goal_tasks: { select: { completed: true } } },
        })
      : await prisma.member_monthly_goals.findMany({
          where: { userid: userId, monthid: pid },
          include: { member_monthly_goal_tasks: { select: { completed: true } } },
        })

    if (goals.length === 0) break

    let allMet = true
    for (const g of goals) {
      const tasks = type === "weekly"
        ? (g as any).member_weekly_goal_tasks
        : (g as any).member_monthly_goal_tasks
      const tasksDone = tasks.filter((t: any) => t.completed).length

      if (g.study_goal && g.study_goal > 0) {
        const studyAgg = await prisma.voice_sessions.aggregate({
          where: {
            userid: userId,
            guildid: g.guildid,
            start_time: { gte: bounds.start, lt: bounds.end },
          },
          _sum: { duration: true },
        })
        const hours = (studyAgg._sum.duration ?? 0) / 3600
        if (hours < g.study_goal) { allMet = false; break }
      }
      if (g.task_goal && g.task_goal > 0 && tasksDone < g.task_goal) { allMet = false; break }
    }

    if (!allMet) break
    streak++
  }
  return streak
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const weekOffset = parseInt(req.query.weekOffset as string) || 0
    const monthOffset = parseInt(req.query.monthOffset as string) || 0

    const now = new Date()
    const currentWeekId = getWeekId(now)
    const currentMonthId = getMonthId(now)
    const weekId = offsetWeekId(currentWeekId, weekOffset)
    const monthId = offsetMonthId(currentMonthId, monthOffset)
    const weekBounds = getWeekBounds(weekId)
    const monthBounds = getMonthBounds(monthId)

    const taskSelect = { taskid: true, content: true, completed: true }

    const [weeklyGoals, monthlyGoals] = await Promise.all([
      prisma.member_weekly_goals.findMany({
        where: { userid: auth.userId, weekid: weekId },
        include: {
          members: { select: { guild_config: { select: { name: true } } } },
          member_weekly_goal_tasks: { select: taskSelect },
        },
      }),
      prisma.member_monthly_goals.findMany({
        where: { userid: auth.userId, monthid: monthId },
        include: {
          members: { select: { guild_config: { select: { name: true } } } },
          member_monthly_goal_tasks: { select: taskSelect },
        },
      }),
    ])

    const [weekly, monthly] = await Promise.all([
      buildGoalItems(auth.userId, weeklyGoals, weekBounds, "weekly"),
      buildGoalItems(auth.userId, monthlyGoals, monthBounds, "monthly"),
    ])

    // Cross-server summary
    const totalStudyHours = weekly.reduce((s, g) => s + g.studyProgress, 0)
    const totalTasksDone = weekly.reduce((s, g) => s + g.tasksProgress, 0)
    const totalMessages = weekly.reduce((s, g) => s + g.messageProgress, 0)
    let goalsSet = 0
    let goalsMet = 0
    for (const g of weekly) {
      if (g.studyGoal && g.studyGoal > 0) { goalsSet++; if (g.studyProgress >= g.studyGoal) goalsMet++ }
      if (g.taskGoal && g.taskGoal > 0) { goalsSet++; if (g.tasksProgress >= g.taskGoal) goalsMet++ }
      if (g.messageGoal && g.messageGoal > 0) { goalsSet++; if (g.messageProgress >= g.messageGoal) goalsMet++ }
    }

    // Check if older goals exist (for navigation)
    const olderWeekly = await prisma.member_weekly_goals.findFirst({
      where: { userid: auth.userId, weekid: { lt: weekId } },
      select: { weekid: true },
    })
    const olderMonthly = await prisma.member_monthly_goals.findFirst({
      where: { userid: auth.userId, monthid: { lt: monthId } },
      select: { monthid: true },
    })

    // Streaks (only compute for current period to avoid N+1 on past navigation)
    let weeklyStreak = 0
    let monthlyStreak = 0
    if (weekOffset === 0 && weekly.length > 0) {
      weeklyStreak = await computeStreak(auth.userId, currentWeekId, "weekly", 12)
    }
    if (monthOffset === 0 && monthly.length > 0) {
      monthlyStreak = await computeStreak(auth.userId, currentMonthId, "monthly", 6)
    }

    res.status(200).json({
      weekId, monthId, weekOffset, monthOffset,
      weekLabel: formatWeekLabel(weekId),
      monthLabel: formatMonthLabel(monthId),
      canGoBack: { weekly: !!olderWeekly, monthly: !!olderMonthly },
      canGoForward: { weekly: weekOffset < 0, monthly: monthOffset < 0 },
      weekly, monthly,
      summary: {
        totalStudyHours: Math.round(totalStudyHours * 10) / 10,
        totalTasksDone,
        totalMessages,
        serversWithGoals: weekly.length,
        goalsSet, goalsMet,
        allGoalsMet: goalsSet > 0 && goalsMet === goalsSet,
      },
      streaks: { weeklyStreak, monthlyStreak },
    })
  },

  async PATCH(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { action } = req.body

    // Toggle a checklist item
    if (action === "toggle_task") {
      const { taskId, type } = req.body
      if (!taskId || !type) return res.status(400).json({ error: "taskId and type required" })

      if (type === "weekly") {
        const task = await prisma.member_weekly_goal_tasks.findUnique({ where: { taskid: taskId } })
        if (!task || task.userid !== auth.userId) return res.status(404).json({ error: "Not found" })
        await prisma.member_weekly_goal_tasks.update({
          where: { taskid: taskId },
          data: { completed: !task.completed },
        })
      } else {
        const task = await prisma.member_monthly_goal_tasks.findUnique({ where: { taskid: taskId } })
        if (!task || task.userid !== auth.userId) return res.status(404).json({ error: "Not found" })
        await prisma.member_monthly_goal_tasks.update({
          where: { taskid: taskId },
          data: { completed: !task.completed },
        })
      }
      return res.status(200).json({ success: true })
    }

    // Upsert goal values
    const { guildId, weekid, monthid, type, study_goal, task_goal, message_goal } = req.body
    if (!guildId || !type) return res.status(400).json({ error: "guildId and type required" })

    const guildIdBigInt = BigInt(guildId)
    const updates: Record<string, number | null> = {}
    if (study_goal !== undefined) updates.study_goal = study_goal
    if (task_goal !== undefined) updates.task_goal = task_goal
    if (message_goal !== undefined) updates.message_goal = message_goal
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No fields to update" })

    if (type === "weekly") {
      if (weekid == null) return res.status(400).json({ error: "weekid required" })
      await prisma.member_weekly_goals.upsert({
        where: { guildid_userid_weekid: { guildid: guildIdBigInt, userid: auth.userId, weekid: Number(weekid) } },
        update: updates,
        create: { guildid: guildIdBigInt, userid: auth.userId, weekid: Number(weekid), ...updates },
      })
    } else if (type === "monthly") {
      if (monthid == null) return res.status(400).json({ error: "monthid required" })
      await prisma.member_monthly_goals.upsert({
        where: { guildid_userid_monthid: { guildid: guildIdBigInt, userid: auth.userId, monthid: Number(monthid) } },
        update: updates,
        create: { guildid: guildIdBigInt, userid: auth.userId, monthid: Number(monthid), ...updates },
      })
    } else {
      return res.status(400).json({ error: "type must be 'weekly' or 'monthly'" })
    }

    res.status(200).json({ success: true })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { action } = req.body

    if (action === "add_task") {
      const { guildId, periodId, type, content } = req.body
      if (!guildId || !periodId || !type || !content) {
        return res.status(400).json({ error: "guildId, periodId, type, content required" })
      }
      if (typeof content !== "string" || content.trim().length === 0 || content.length > 200) {
        return res.status(400).json({ error: "Content required (max 200 chars)" })
      }

      const guildIdBigInt = BigInt(guildId)

      if (type === "weekly") {
        const task = await prisma.member_weekly_goal_tasks.create({
          data: {
            guildid: guildIdBigInt,
            userid: auth.userId,
            weekid: Number(periodId),
            content: content.trim(),
            completed: false,
          },
        })
        return res.status(201).json({ id: task.taskid, content: task.content, completed: task.completed })
      } else if (type === "monthly") {
        const task = await prisma.member_monthly_goal_tasks.create({
          data: {
            guildid: guildIdBigInt,
            userid: auth.userId,
            monthid: Number(periodId),
            content: content.trim(),
            completed: false,
          },
        })
        return res.status(201).json({ id: task.taskid, content: task.content, completed: task.completed })
      }
      return res.status(400).json({ error: "type must be 'weekly' or 'monthly'" })
    }

    res.status(400).json({ error: "Unknown action" })
  },

  async DELETE(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { taskId, type } = req.body
    if (!taskId || !type) return res.status(400).json({ error: "taskId and type required" })

    if (type === "weekly") {
      const task = await prisma.member_weekly_goal_tasks.findUnique({ where: { taskid: taskId } })
      if (!task || task.userid !== auth.userId) return res.status(404).json({ error: "Not found" })
      await prisma.member_weekly_goal_tasks.delete({ where: { taskid: taskId } })
    } else if (type === "monthly") {
      const task = await prisma.member_monthly_goal_tasks.findUnique({ where: { taskid: taskId } })
      if (!task || task.userid !== auth.userId) return res.status(404).json({ error: "Not found" })
      await prisma.member_monthly_goal_tasks.delete({ where: { taskid: taskId } })
    } else {
      return res.status(400).json({ error: "type must be 'weekly' or 'monthly'" })
    }

    res.status(200).json({ success: true })
  },
})
