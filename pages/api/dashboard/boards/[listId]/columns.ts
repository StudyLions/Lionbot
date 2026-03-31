// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Shared board column CRUD API
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"
import { requireBoardEditor, requireBoardOwner, BOARD_LIMITS } from "@/utils/boardAuth"

function parseListId(raw: unknown): number | null {
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : null
}

export default apiHandler({
  async POST(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardEditor(req, res, listId)
    if (!ctx) return

    const { name, color } = req.body
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > BOARD_LIMITS.MAX_COLUMN_NAME) {
      return res.status(400).json({ error: `Column name required (max ${BOARD_LIMITS.MAX_COLUMN_NAME} chars)` })
    }

    const colCount = await prisma.shared_tasklist_column.count({ where: { listid: listId } })
    if (colCount >= BOARD_LIMITS.MAX_COLUMNS_PER_BOARD) {
      return res.status(400).json({ error: `Board can have up to ${BOARD_LIMITS.MAX_COLUMNS_PER_BOARD} columns` })
    }

    const maxPos = await prisma.shared_tasklist_column.aggregate({
      where: { listid: listId },
      _max: { position: true },
    })

    const column = await prisma.shared_tasklist_column.create({
      data: {
        listid: listId,
        name: name.trim(),
        position: (maxPos._max.position ?? -1) + 1,
        color: color || null,
      },
    })

    await prisma.shared_task_history.create({
      data: {
        listid: listId,
        userid: ctx.auth.userId,
        action: "column_created",
        details: { columnId: column.columnid, name: name.trim() },
      },
    })

    res.status(201).json({
      id: column.columnid,
      name: column.name,
      position: column.position,
      color: column.color,
    })
  },

  async PATCH(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardEditor(req, res, listId)
    if (!ctx) return

    const { columnId, name, color, positions } = req.body

    if (Array.isArray(positions)) {
      for (const p of positions) {
        await prisma.shared_tasklist_column.updateMany({
          where: { columnid: p.columnId, listid: listId },
          data: { position: p.position },
        })
      }
      await prisma.shared_task_history.create({
        data: {
          listid: listId,
          userid: ctx.auth.userId,
          action: "column_reordered",
          details: { positions },
        },
      })
      return res.status(200).json({ success: true })
    }

    if (!columnId) return res.status(400).json({ error: "columnId required" })

    const col = await prisma.shared_tasklist_column.findUnique({ where: { columnid: columnId } })
    if (!col || col.listid !== listId) {
      return res.status(404).json({ error: "Column not found" })
    }

    const updates: any = {}
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0 || name.length > BOARD_LIMITS.MAX_COLUMN_NAME) {
        return res.status(400).json({ error: `Column name required (max ${BOARD_LIMITS.MAX_COLUMN_NAME} chars)` })
      }
      updates.name = name.trim()
    }
    if (color !== undefined) {
      updates.color = color || null
    }

    await prisma.shared_tasklist_column.update({ where: { columnid: columnId }, data: updates })

    await prisma.shared_task_history.create({
      data: {
        listid: listId,
        userid: ctx.auth.userId,
        action: "column_renamed",
        details: { columnId, oldName: col.name, newName: name?.trim() },
      },
    })

    res.status(200).json({ success: true })
  },

  async DELETE(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardOwner(req, res, listId)
    if (!ctx) return

    const { columnId } = req.body
    if (!columnId) return res.status(400).json({ error: "columnId required" })

    const col = await prisma.shared_tasklist_column.findUnique({ where: { columnid: columnId } })
    if (!col || col.listid !== listId) {
      return res.status(404).json({ error: "Column not found" })
    }

    const remaining = await prisma.shared_tasklist_column.findFirst({
      where: { listid: listId, columnid: { not: columnId } },
      orderBy: { position: "asc" },
    })

    if (remaining) {
      await prisma.shared_task.updateMany({
        where: { columnid: columnId, deleted_at: null },
        data: { columnid: remaining.columnid },
      })
    } else {
      await prisma.shared_task.updateMany({
        where: { columnid: columnId, deleted_at: null },
        data: { columnid: null },
      })
    }

    await prisma.shared_tasklist_column.delete({ where: { columnid: columnId } })

    await prisma.shared_task_history.create({
      data: {
        listid: listId,
        userid: ctx.auth.userId,
        action: "column_deleted",
        details: { name: col.name, movedTo: remaining?.name ?? null },
      },
    })

    res.status(200).json({ success: true })
  },
})
