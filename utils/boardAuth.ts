// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Permission helpers for shared kanban board API routes
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "./prisma"
import { requireAuth, type AuthContext } from "./adminAuth"

export interface BoardAuthContext {
  auth: AuthContext
  role: "owner" | "editor" | "viewer"
  listId: number
}

export const BOARD_LIMITS = {
  MAX_BOARDS_PER_USER: 5,
  MAX_MEMBERS_PER_BOARD: 10,
  MAX_TASKS_PER_BOARD: 200,
  MAX_COLUMNS_PER_BOARD: 8,
  MAX_BOARD_NAME: 50,
  MAX_BOARD_DESC: 200,
  MAX_TASK_CONTENT: 100,
  MAX_TASK_DESC: 500,
  MAX_COLUMN_NAME: 30,
} as const

async function getMembership(
  userId: bigint,
  listId: number
): Promise<{ role: string } | null> {
  const member = await prisma.shared_tasklist_member.findUnique({
    where: { listid_userid: { listid: listId, userid: userId } },
    select: { role: true },
  })
  return member
}

export async function requireBoardMember(
  req: NextApiRequest,
  res: NextApiResponse,
  listId: number
): Promise<BoardAuthContext | null> {
  const auth = await requireAuth(req, res)
  if (!auth) return null

  const board = await prisma.shared_tasklist.findUnique({
    where: { listid: listId },
    select: { deleted_at: true },
  })
  if (!board || board.deleted_at) {
    res.status(404).json({ error: "Board not found" })
    return null
  }

  const member = await getMembership(auth.userId, listId)
  if (!member) {
    res.status(403).json({ error: "You are not a member of this board" })
    return null
  }

  return { auth, role: member.role as BoardAuthContext["role"], listId }
}

export async function requireBoardEditor(
  req: NextApiRequest,
  res: NextApiResponse,
  listId: number
): Promise<BoardAuthContext | null> {
  const ctx = await requireBoardMember(req, res, listId)
  if (!ctx) return null

  if (ctx.role === "viewer") {
    res.status(403).json({ error: "Editors and owners can perform this action" })
    return null
  }
  return ctx
}

export async function requireBoardOwner(
  req: NextApiRequest,
  res: NextApiResponse,
  listId: number
): Promise<BoardAuthContext | null> {
  const ctx = await requireBoardMember(req, res, listId)
  if (!ctx) return null

  if (ctx.role !== "owner") {
    res.status(403).json({ error: "Only the board owner can perform this action" })
    return null
  }
  return ctx
}
