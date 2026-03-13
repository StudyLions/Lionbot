// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Task CRUD API - personal tasks for logged-in user
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  if (req.method === "GET") {
    const tasks = await prisma.tasklist.findMany({
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
    })

    return res.status(200).json({
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
    })
  }

  if (req.method === "POST") {
    const { content, parentId } = req.body
    if (!content || typeof content !== "string" || content.length > 200) {
      return res.status(400).json({ error: "Content required (max 200 chars)" })
    }

    const task = await prisma.tasklist.create({
      data: {
        userid: auth.userId,
        content: content.trim(),
        parentid: parentId || null,
      },
    })

    return res.status(201).json({ id: task.taskid, content: task.content })
  }

  if (req.method === "PATCH") {
    const { taskId, content, completed } = req.body
    if (!taskId) return res.status(400).json({ error: "taskId required" })

    const task = await prisma.tasklist.findUnique({ where: { taskid: taskId } })
    if (!task || task.userid !== auth.userId) return res.status(404).json({ error: "Task not found" })

    const updates: any = { last_updated_at: new Date() }
    if (typeof content === "string") updates.content = content.trim()
    if (typeof completed === "boolean") {
      updates.completed_at = completed ? new Date() : null
    }

    await prisma.tasklist.update({ where: { taskid: taskId }, data: updates })
    return res.status(200).json({ success: true })
  }

  if (req.method === "DELETE") {
    const { taskId } = req.body
    if (!taskId) return res.status(400).json({ error: "taskId required" })

    const task = await prisma.tasklist.findUnique({ where: { taskid: taskId } })
    if (!task || task.userid !== auth.userId) return res.status(404).json({ error: "Task not found" })

    await prisma.tasklist.update({
      where: { taskid: taskId },
      data: { deleted_at: new Date() },
    })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: "Method not allowed" })
}
