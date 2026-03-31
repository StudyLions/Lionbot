// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Board detail, update, and delete API
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"
import { requireBoardMember, requireBoardOwner, BOARD_LIMITS } from "@/utils/boardAuth"

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

    const board = await prisma.shared_tasklist.findUnique({
      where: { listid: listId },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            tasks: {
              where: { deleted_at: null },
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
            },
          },
        },
        members: {
          select: {
            userid: true,
            role: true,
            joined_at: true,
            user: { select: { userid: true, name: true, avatar_hash: true } },
          },
        },
      },
    })

    if (!board) return res.status(404).json({ error: "Board not found" })

    const unassignedTasks = await prisma.shared_task.findMany({
      where: { listid: listId, columnid: null, deleted_at: null },
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
      id: board.listid,
      name: board.name,
      description: board.description,
      color: board.color,
      ownerId: board.ownerid.toString(),
      myRole: ctx.role,
      createdAt: board.created_at,
      updatedAt: board.updated_at,
      columns: board.columns.map((col) => ({
        id: col.columnid,
        name: col.name,
        position: col.position,
        color: col.color,
        tasks: col.tasks.map(mapTask),
      })),
      unassignedTasks: unassignedTasks.map(mapTask),
      members: board.members.map((m) => ({
        userId: m.userid.toString(),
        role: m.role,
        joinedAt: m.joined_at,
        name: m.user.name,
        avatarHash: m.user.avatar_hash,
      })),
    })
  },

  async PATCH(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardOwner(req, res, listId)
    if (!ctx) return

    const { name, description, color } = req.body
    const updates: any = { updated_at: new Date() }

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0 || name.length > BOARD_LIMITS.MAX_BOARD_NAME) {
        return res.status(400).json({ error: `Board name required (max ${BOARD_LIMITS.MAX_BOARD_NAME} chars)` })
      }
      updates.name = name.trim()
    }
    if (description !== undefined) {
      if (description && (typeof description !== "string" || description.length > BOARD_LIMITS.MAX_BOARD_DESC)) {
        return res.status(400).json({ error: `Description max ${BOARD_LIMITS.MAX_BOARD_DESC} chars` })
      }
      updates.description = description?.trim() || null
    }
    if (color !== undefined) {
      updates.color = color || null
    }

    await prisma.shared_tasklist.update({ where: { listid: listId }, data: updates })

    await prisma.shared_task_history.create({
      data: {
        listid: listId,
        userid: ctx.auth.userId,
        action: "board_edited",
        details: { name, description, color },
      },
    })

    res.status(200).json({ success: true })
  },

  async DELETE(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardOwner(req, res, listId)
    if (!ctx) return

    await prisma.shared_tasklist.update({
      where: { listid: listId },
      data: { deleted_at: new Date(), updated_at: new Date() },
    })

    res.status(200).json({ success: true })
  },
})

function mapTask(t: any) {
  return {
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
  }
}
