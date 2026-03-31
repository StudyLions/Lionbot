// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Board member management API (add, remove, role change)
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"
import { requireBoardMember, requireBoardEditor, requireBoardOwner, BOARD_LIMITS } from "@/utils/boardAuth"
import { requireAuth } from "@/utils/adminAuth"

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

    const members = await prisma.shared_tasklist_member.findMany({
      where: { listid: listId },
      select: {
        userid: true,
        role: true,
        joined_at: true,
        invited_by: true,
        user: { select: { userid: true, name: true, avatar_hash: true } },
      },
    })

    res.status(200).json({
      members: members.map((m) => ({
        userId: m.userid.toString(),
        role: m.role,
        joinedAt: m.joined_at,
        invitedBy: m.invited_by?.toString() ?? null,
        name: m.user.name,
        avatarHash: m.user.avatar_hash,
      })),
    })
  },

  async POST(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardEditor(req, res, listId)
    if (!ctx) return

    const { userId, role } = req.body
    if (!userId) return res.status(400).json({ error: "userId required" })
    const validRoles = ["editor", "viewer"]
    const targetRole = validRoles.includes(role) ? role : "viewer"

    const targetUserId = BigInt(userId)

    const existing = await prisma.shared_tasklist_member.findUnique({
      where: { listid_userid: { listid: listId, userid: targetUserId } },
    })
    if (existing) return res.status(400).json({ error: "User is already a member" })

    const user = await prisma.user_config.findUnique({
      where: { userid: targetUserId },
      select: { userid: true },
    })
    if (!user) return res.status(404).json({ error: "User not found (they must have used LionBot at least once)" })

    const memberCount = await prisma.shared_tasklist_member.count({ where: { listid: listId } })
    if (memberCount >= BOARD_LIMITS.MAX_MEMBERS_PER_BOARD) {
      return res.status(400).json({ error: `Board can have up to ${BOARD_LIMITS.MAX_MEMBERS_PER_BOARD} members` })
    }

    await prisma.shared_tasklist_member.create({
      data: {
        listid: listId,
        userid: targetUserId,
        role: targetRole,
        invited_by: ctx.auth.userId,
      },
    })

    await prisma.shared_task_history.create({
      data: {
        listid: listId,
        userid: ctx.auth.userId,
        action: "member_added",
        details: { targetUserId: userId, role: targetRole },
      },
    })

    res.status(201).json({ success: true })
  },

  async PATCH(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const ctx = await requireBoardOwner(req, res, listId)
    if (!ctx) return

    const { userId, role } = req.body
    if (!userId || !role) return res.status(400).json({ error: "userId and role required" })

    const validRoles = ["owner", "editor", "viewer"]
    if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" })

    const targetUserId = BigInt(userId)
    if (targetUserId === ctx.auth.userId) {
      return res.status(400).json({ error: "Cannot change your own role" })
    }

    const member = await prisma.shared_tasklist_member.findUnique({
      where: { listid_userid: { listid: listId, userid: targetUserId } },
    })
    if (!member) return res.status(404).json({ error: "Member not found" })

    const oldRole = member.role

    await prisma.shared_tasklist_member.update({
      where: { listid_userid: { listid: listId, userid: targetUserId } },
      data: { role },
    })

    if (role === "owner") {
      await prisma.shared_tasklist.update({
        where: { listid: listId },
        data: { ownerid: targetUserId },
      })
      await prisma.shared_tasklist_member.update({
        where: { listid_userid: { listid: listId, userid: ctx.auth.userId } },
        data: { role: "editor" },
      })
    }

    await prisma.shared_task_history.create({
      data: {
        listid: listId,
        userid: ctx.auth.userId,
        action: "member_role_changed",
        details: { targetUserId: userId, oldRole, newRole: role },
      },
    })

    res.status(200).json({ success: true })
  },

  async DELETE(req, res) {
    const listId = parseListId(req.query.listId)
    if (!listId) return res.status(400).json({ error: "Invalid board ID" })

    const auth = await requireAuth(req, res)
    if (!auth) return

    const { userId } = req.body
    const targetUserId = userId ? BigInt(userId) : auth.userId
    const isSelfLeave = targetUserId === auth.userId

    if (isSelfLeave) {
      const member = await prisma.shared_tasklist_member.findUnique({
        where: { listid_userid: { listid: listId, userid: auth.userId } },
      })
      if (!member) return res.status(404).json({ error: "Not a member" })
      if (member.role === "owner") {
        return res.status(400).json({ error: "Owners cannot leave. Transfer ownership first or delete the board." })
      }

      await prisma.shared_tasklist_member.delete({
        where: { listid_userid: { listid: listId, userid: auth.userId } },
      })

      await prisma.shared_task.updateMany({
        where: { listid: listId, assignee_id: auth.userId },
        data: { assignee_id: null },
      })

      await prisma.shared_task_history.create({
        data: { listid: listId, userid: auth.userId, action: "member_removed", details: { targetUserId: auth.userId.toString(), selfLeave: true } },
      })

      return res.status(200).json({ success: true })
    }

    const ctx = await requireBoardOwner(req, res, listId)
    if (!ctx) return

    const member = await prisma.shared_tasklist_member.findUnique({
      where: { listid_userid: { listid: listId, userid: targetUserId } },
    })
    if (!member) return res.status(404).json({ error: "Member not found" })

    await prisma.shared_tasklist_member.delete({
      where: { listid_userid: { listid: listId, userid: targetUserId } },
    })

    await prisma.shared_task.updateMany({
      where: { listid: listId, assignee_id: targetUserId },
      data: { assignee_id: null },
    })

    await prisma.shared_task_history.create({
      data: {
        listid: listId,
        userid: auth.userId,
        action: "member_removed",
        details: { targetUserId: userId },
      },
    })

    res.status(200).json({ success: true })
  },
})
