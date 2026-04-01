// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Shared board task CRUD API (create, update, delete)
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"
import { requireBoardEditor, requireBoardMember, BOARD_LIMITS } from "@/utils/boardAuth"

function parseListId(raw: unknown): number | null {
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : null
}

export default apiHandler({
  async GET(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardMember(req, res, listId)
    if (!ctx) return

    const tasks = await prisma.shared_task.findMany({
      where: { listid: listId, deleted_at: null },
      orderBy: { position: "asc" },
      select: {
        taskid: true,
        content: true,
        description: true,
        position: true,
        color: true,
        assignee_id: true,
        created_by: true,
        completed_at: true,
        created_at: true,
        last_updated_at: true,
        columnid: true,
      },
    })

    res.status(200).json({
      tasks: tasks.map((t) => ({
        id: t.taskid,
        content: t.content,
        description: t.description,
        position: t.position,
        color: t.color,
        assigneeId: t.assignee_id?.toString() ?? null,
        createdBy: t.created_by.toString(),
        completed: !!t.completed_at,
        completedAt: t.completed_at,
        createdAt: t.created_at,
        updatedAt: t.last_updated_at,
        columnId: t.columnid,
      })),
    })
  },

  async POST(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardEditor(req, res, listId)
    if (!ctx) return

    const { content, columnId, description, color, assigneeId } = req.body
    if (!content || typeof content !== "string" || content.trim().length === 0 || content.length > BOARD_LIMITS.MAX_TASK_CONTENT) {
      return res.status(400).json({ error: `Task content required (max ${BOARD_LIMITS.MAX_TASK_CONTENT} chars)` })
    }
    if (description && (typeof description !== "string" || description.length > BOARD_LIMITS.MAX_TASK_DESC)) {
      return res.status(400).json({ error: `Description max ${BOARD_LIMITS.MAX_TASK_DESC} chars` })
    }

    const activeCount = await prisma.shared_task.count({
      where: { listid: listId, deleted_at: null },
    })
    if (activeCount >= BOARD_LIMITS.MAX_TASKS_PER_BOARD) {
      return res.status(400).json({ error: `Board can have up to ${BOARD_LIMITS.MAX_TASKS_PER_BOARD} tasks` })
    }

    if (columnId) {
      const col = await prisma.shared_tasklist_column.findUnique({ where: { columnid: columnId } })
      if (!col || col.listid !== listId) {
        return res.status(400).json({ error: "Column not found on this board" })
      }
    }

    if (assigneeId) {
      const member = await prisma.shared_tasklist_member.findUnique({
        where: { listid_userid: { listid: listId, userid: BigInt(assigneeId) } },
      })
      if (!member) return res.status(400).json({ error: "Assignee must be a board member" })
    }

    const maxPos = await prisma.shared_task.aggregate({
      where: { listid: listId, columnid: columnId || null, deleted_at: null },
      _max: { position: true },
    })

    const task = await prisma.shared_task.create({
      data: {
        listid: listId,
        columnid: columnId || null,
        content: content.trim(),
        description: description?.trim() || null,
        color: color || null,
        assignee_id: assigneeId ? BigInt(assigneeId) : null,
        created_by: ctx.auth.userId,
        position: (maxPos._max.position ?? -1) + 1,
      },
    })

    await prisma.shared_task_history.create({
      data: {
        listid: listId,
        taskid: task.taskid,
        userid: ctx.auth.userId,
        action: "task_created",
        details: { content: content.trim(), columnId },
      },
    })

    res.status(201).json({
      id: task.taskid,
      content: task.content,
      position: task.position,
      columnId: task.columnid,
    })
  },

  async PATCH(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardEditor(req, res, listId)
    if (!ctx) return

    const { taskId, content, description, columnId, position, completed, color, assigneeId } = req.body
    if (!taskId) return res.status(400).json({ error: "taskId required" })

    const task = await prisma.shared_task.findUnique({ where: { taskid: taskId } })
    if (!task || task.listid !== listId || task.deleted_at) {
      return res.status(404).json({ error: "Task not found" })
    }

    const updates: any = { last_updated_at: new Date() }
    const historyDetails: any = {}

    if (content !== undefined) {
      if (typeof content !== "string" || content.trim().length === 0 || content.length > BOARD_LIMITS.MAX_TASK_CONTENT) {
        return res.status(400).json({ error: `Content required (max ${BOARD_LIMITS.MAX_TASK_CONTENT} chars)` })
      }
      historyDetails.oldContent = task.content
      historyDetails.newContent = content.trim()
      updates.content = content.trim()
    }

    if (description !== undefined) {
      if (description && (typeof description !== "string" || description.length > BOARD_LIMITS.MAX_TASK_DESC)) {
        return res.status(400).json({ error: `Description max ${BOARD_LIMITS.MAX_TASK_DESC} chars` })
      }
      updates.description = description?.trim() || null
    }

    if (color !== undefined) {
      updates.color = color || null
    }

    if (columnId !== undefined) {
      if (columnId !== null) {
        const col = await prisma.shared_tasklist_column.findUnique({ where: { columnid: columnId } })
        if (!col || col.listid !== listId) {
          return res.status(400).json({ error: "Column not found on this board" })
        }
      }
      if (task.columnid !== columnId) {
        historyDetails.fromColumnId = task.columnid
        historyDetails.toColumnId = columnId
      }
      updates.columnid = columnId
    }

    if (position !== undefined && typeof position === "number") {
      updates.position = position
    }

    if (typeof completed === "boolean") {
      updates.completed_at = completed ? new Date() : null
      historyDetails.completed = completed
    }

    if (assigneeId !== undefined) {
      if (assigneeId !== null) {
        const member = await prisma.shared_tasklist_member.findUnique({
          where: { listid_userid: { listid: listId, userid: BigInt(assigneeId) } },
        })
        if (!member) return res.status(400).json({ error: "Assignee must be a board member" })
      }
      updates.assignee_id = assigneeId ? BigInt(assigneeId) : null
    }

    await prisma.shared_task.update({ where: { taskid: taskId }, data: updates })

    let action = "task_edited"
    if (historyDetails.fromColumnId !== undefined || historyDetails.toColumnId !== undefined) action = "task_moved"
    if (historyDetails.completed !== undefined) action = historyDetails.completed ? "task_completed" : "task_uncompleted"
    if (assigneeId !== undefined) action = "task_assigned"

    await prisma.shared_task_history.create({
      data: { listid: listId, taskid: taskId, userid: ctx.auth.userId, action, details: historyDetails },
    })

    await prisma.shared_tasklist.update({
      where: { listid: listId },
      data: { updated_at: new Date() },
    })

    res.status(200).json({ success: true })
  },

  async DELETE(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardEditor(req, res, listId)
    if (!ctx) return

    const { taskId } = req.body
    if (!taskId) return res.status(400).json({ error: "taskId required" })

    const task = await prisma.shared_task.findUnique({ where: { taskid: taskId } })
    if (!task || task.listid !== listId || task.deleted_at) {
      return res.status(404).json({ error: "Task not found" })
    }

    await prisma.shared_task.update({
      where: { taskid: taskId },
      data: { deleted_at: new Date() },
    })

    await prisma.shared_task_history.create({
      data: {
        listid: listId,
        taskid: taskId,
        userid: ctx.auth.userId,
        action: "task_deleted",
        details: { content: task.content },
      },
    })

    await prisma.shared_tasklist.update({
      where: { listid: listId },
      data: { updated_at: new Date() },
    })

    res.status(200).json({ success: true })
  },
})
