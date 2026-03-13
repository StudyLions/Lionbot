// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: CRUD for personal reminders
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const reminders = await prisma.reminders.findMany({
      where: { userid: auth.userId },
      orderBy: { remind_at: "asc" },
    })

    res.status(200).json({
      reminders: reminders.map((r) => ({
        id: r.reminderid,
        title: r.title,
        content: r.content,
        remindAt: r.remind_at.toISOString(),
        interval: r.interval,
        failed: r.failed ?? false,
        createdAt: r.created_at?.toISOString() || null,
      })),
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { title, content, remindAt, interval } = req.body
    if (!content || !remindAt) {
      return res.status(400).json({ error: "content and remindAt are required" })
    }

    const remindDate = new Date(remindAt)
    if (isNaN(remindDate.getTime())) {
      return res.status(400).json({ error: "Invalid remindAt date" })
    }

    const reminder = await prisma.reminders.create({
      data: {
        userid: auth.userId,
        content: content.trim(),
        title: title?.trim() || null,
        remind_at: remindDate,
        interval: typeof interval === "number" && interval > 0 ? interval : null,
      },
    })

    res.status(201).json({
      id: reminder.reminderid,
      title: reminder.title,
      content: reminder.content,
      remindAt: reminder.remind_at.toISOString(),
      interval: reminder.interval,
    })
  },

  async PATCH(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { reminderId, title, content, remindAt, interval } = req.body
    if (!reminderId) return res.status(400).json({ error: "reminderId required" })

    const existing = await prisma.reminders.findUnique({ where: { reminderid: reminderId } })
    if (!existing || existing.userid !== auth.userId) {
      return res.status(404).json({ error: "Reminder not found" })
    }

    const updates: Record<string, any> = {}
    if (typeof title === "string") updates.title = title.trim() || null
    if (typeof content === "string" && content.trim()) updates.content = content.trim()
    if (remindAt) {
      const d = new Date(remindAt)
      if (!isNaN(d.getTime())) updates.remind_at = d
    }
    if (typeof interval === "number") updates.interval = interval > 0 ? interval : null
    if (interval === null) updates.interval = null

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    await prisma.reminders.update({ where: { reminderid: reminderId }, data: updates })
    res.status(200).json({ success: true })
  },

  async DELETE(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { reminderId } = req.body
    if (!reminderId) return res.status(400).json({ error: "reminderId required" })

    const existing = await prisma.reminders.findUnique({ where: { reminderid: reminderId } })
    if (!existing || existing.userid !== auth.userId) {
      return res.status(404).json({ error: "Reminder not found" })
    }

    await prisma.reminders.delete({ where: { reminderid: reminderId } })
    res.status(200).json({ success: true })
  },
})
// --- END AI-MODIFIED ---
