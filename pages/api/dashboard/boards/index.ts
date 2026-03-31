// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Shared boards list + create API
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { BOARD_LIMITS } from "@/utils/boardAuth"

const DEFAULT_COLUMNS = [
  { name: "To Do", position: 0, color: "#6366f1" },
  { name: "In Progress", position: 1, color: "#f59e0b" },
  { name: "Done", position: 2, color: "#10b981" },
]

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const memberships = await prisma.shared_tasklist_member.findMany({
      where: { userid: auth.userId },
      select: {
        role: true,
        board: {
          select: {
            listid: true,
            name: true,
            description: true,
            color: true,
            created_at: true,
            updated_at: true,
            deleted_at: true,
            ownerid: true,
            members: {
              select: {
                userid: true,
                role: true,
                user: { select: { userid: true, name: true, avatar_hash: true } },
              },
            },
            _count: {
              select: {
                tasks: { where: { deleted_at: null } },
              },
            },
          },
        },
      },
    })

    const boards = memberships
      .filter((m) => !m.board.deleted_at)
      .map((m) => ({
        id: m.board.listid,
        name: m.board.name,
        description: m.board.description,
        color: m.board.color,
        myRole: m.role,
        ownerId: m.board.ownerid.toString(),
        createdAt: m.board.created_at,
        updatedAt: m.board.updated_at,
        taskCount: m.board._count.tasks,
        members: m.board.members.map((mem) => ({
          userId: mem.userid.toString(),
          role: mem.role,
          name: mem.user.name,
          avatarHash: mem.user.avatar_hash,
        })),
      }))

    res.status(200).json({ boards })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { name, description, color } = req.body
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > BOARD_LIMITS.MAX_BOARD_NAME) {
      return res.status(400).json({ error: `Board name required (max ${BOARD_LIMITS.MAX_BOARD_NAME} chars)` })
    }
    if (description && (typeof description !== "string" || description.length > BOARD_LIMITS.MAX_BOARD_DESC)) {
      return res.status(400).json({ error: `Description max ${BOARD_LIMITS.MAX_BOARD_DESC} chars` })
    }

    const ownedCount = await prisma.shared_tasklist.count({
      where: { ownerid: auth.userId, deleted_at: null },
    })
    if (ownedCount >= BOARD_LIMITS.MAX_BOARDS_PER_USER) {
      return res.status(400).json({ error: `You can own up to ${BOARD_LIMITS.MAX_BOARDS_PER_USER} boards` })
    }

    const board = await prisma.shared_tasklist.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || null,
        ownerid: auth.userId,
        columns: {
          create: DEFAULT_COLUMNS,
        },
        members: {
          create: {
            userid: auth.userId,
            role: "owner",
            invited_by: auth.userId,
          },
        },
        history: {
          create: {
            userid: auth.userId,
            action: "board_created",
            details: { name: name.trim() },
          },
        },
      },
      include: {
        columns: { orderBy: { position: "asc" } },
      },
    })

    res.status(201).json({
      id: board.listid,
      name: board.name,
      columns: board.columns.map((c) => ({
        id: c.columnid,
        name: c.name,
        position: c.position,
        color: c.color,
      })),
    })
  },
})
