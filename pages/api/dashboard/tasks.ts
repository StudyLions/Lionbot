// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Task CRUD API - personal tasks for logged-in user
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add stats to GET, cascade toggle to PATCH, bulk ops to DELETE, fix char limit
// --- END AI-MODIFIED ---
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

function getUtcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function getWeekStart(d: Date): Date {
  const day = d.getUTCDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() + mondayOffset)
  return getUtcDayStart(monday)
}

function getWeekId(date: Date): number {
  const d = new Date(date)
  const daysToMonday = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - daysToMonday)
  d.setUTCHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const now = new Date()
    const todayStart = getUtcDayStart(now)
    const weekStart = getWeekStart(now)
    const weekId = getWeekId(now)

    const [tasks, completedTodayCount, completedWeekCount, totalCompletedCount, weeklyGoalRow] = await Promise.all([
      prisma.tasklist.findMany({
        where: { userid: auth.userId, deleted_at: null },
        orderBy: { created_at: "asc" },
        select: {
          taskid: true,
          content: true,
          completed_at: true,
          created_at: true,
          last_updated_at: true,
          parentid: true,
          rewarded: true,
        },
      }),
      prisma.tasklist.count({
        where: {
          userid: auth.userId,
          deleted_at: null,
          completed_at: { gte: todayStart },
        },
      }),
      prisma.tasklist.count({
        where: {
          userid: auth.userId,
          deleted_at: null,
          completed_at: { gte: weekStart },
        },
      }),
      prisma.tasklist.count({
        where: {
          userid: auth.userId,
          completed_at: { not: null },
        },
      }),
      prisma.user_weekly_goals.findUnique({
        where: { userid_weekid: { userid: auth.userId, weekid: weekId } },
        select: { task_goal: true },
      }),
    ])

    const totalActive = tasks.filter(t => !t.completed_at).length

    res.status(200).json({
      tasks: tasks.map((t) => ({
        id: t.taskid,
        content: t.content,
        completed: !!t.completed_at,
        completedAt: t.completed_at,
        createdAt: t.created_at,
        updatedAt: t.last_updated_at,
        parentId: t.parentid,
        rewarded: t.rewarded,
      })),
      stats: {
        completedToday: completedTodayCount,
        completedThisWeek: completedWeekCount,
        totalCompleted: totalCompletedCount,
        totalActive,
        weeklyGoal: weeklyGoalRow?.task_goal ?? null,
      },
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { content, parentId } = req.body
    if (!content || typeof content !== "string" || content.trim().length === 0 || content.length > 100) {
      return res.status(400).json({ error: "Content required (max 100 chars)" })
    }

    if (parentId) {
      const parent = await prisma.tasklist.findUnique({ where: { taskid: parentId } })
      if (!parent || parent.userid !== auth.userId || parent.deleted_at) {
        return res.status(404).json({ error: "Parent task not found" })
      }
    }

    const task = await prisma.tasklist.create({
      data: {
        userid: auth.userId,
        content: content.trim(),
        parentid: parentId || null,
      },
    })

    res.status(201).json({ id: task.taskid, content: task.content })
  },

  async PATCH(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { taskId, content, completed, cascade } = req.body
    if (!taskId) return res.status(400).json({ error: "taskId required" })

    const task = await prisma.tasklist.findUnique({ where: { taskid: taskId } })
    if (!task || task.userid !== auth.userId) return res.status(404).json({ error: "Task not found" })

    const updates: any = { last_updated_at: new Date() }
    if (typeof content === "string") {
      if (content.trim().length === 0 || content.length > 100) {
        return res.status(400).json({ error: "Content required (max 100 chars)" })
      }
      updates.content = content.trim()
    }
    if (typeof completed === "boolean") {
      updates.completed_at = completed ? new Date() : null
    }

    await prisma.tasklist.update({ where: { taskid: taskId }, data: updates })

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: cascade toggle to children (matching bot behavior)
    let cascadedCount = 0
    if (typeof completed === "boolean" && cascade !== false) {
      const result = await prisma.tasklist.updateMany({
        where: {
          parentid: taskId,
          userid: auth.userId,
          deleted_at: null,
        },
        data: {
          completed_at: completed ? new Date() : null,
          last_updated_at: new Date(),
        },
      })
      cascadedCount = result.count
    }
    // --- END AI-MODIFIED ---

    res.status(200).json({ success: true, cascadedCount })
  },

  async DELETE(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { taskId, taskIds, action } = req.body

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: bulk operations - clear_completed and multi-delete
    if (action === "clear_completed") {
      const result = await prisma.tasklist.updateMany({
        where: {
          userid: auth.userId,
          completed_at: { not: null },
          deleted_at: null,
        },
        data: { deleted_at: new Date() },
      })
      return res.status(200).json({ success: true, deletedCount: result.count })
    }

    if (Array.isArray(taskIds) && taskIds.length > 0) {
      const result = await prisma.tasklist.updateMany({
        where: {
          taskid: { in: taskIds },
          userid: auth.userId,
          deleted_at: null,
        },
        data: { deleted_at: new Date() },
      })
      return res.status(200).json({ success: true, deletedCount: result.count })
    }
    // --- END AI-MODIFIED ---

    if (!taskId) return res.status(400).json({ error: "taskId, taskIds, or action required" })

    const task = await prisma.tasklist.findUnique({ where: { taskid: taskId } })
    if (!task || task.userid !== auth.userId) return res.status(404).json({ error: "Task not found" })

    await prisma.tasklist.update({
      where: { taskid: taskId },
      data: { deleted_at: new Date() },
    })
    res.status(200).json({ success: true })
  },
})
