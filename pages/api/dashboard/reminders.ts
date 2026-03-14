// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: CRUD for personal reminders
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: harden API with bot-matching limits (25 max, 600s interval, 2000 char), add totalCount, add clear_past
const MAX_REMINDERS = 25
const MIN_INTERVAL_SECONDS = 600
const MAX_CONTENT_LENGTH = 2000

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
      totalCount: reminders.length,
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { title, content, remindAt, interval } = req.body
    if (!content || !remindAt) {
      return res.status(400).json({ error: "content and remindAt are required" })
    }

    const trimmed = (content as string).trim()
    if (trimmed.length === 0 || trimmed.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ error: `Content must be 1-${MAX_CONTENT_LENGTH} characters` })
    }

    const remindDate = new Date(remindAt)
    if (isNaN(remindDate.getTime())) {
      return res.status(400).json({ error: "Invalid remindAt date" })
    }
    if (remindDate.getTime() <= Date.now()) {
      return res.status(400).json({ error: "Reminder time must be in the future" })
    }

    if (typeof interval === "number" && interval > 0 && interval < MIN_INTERVAL_SECONDS) {
      return res.status(400).json({ error: `Minimum repeat interval is 10 minutes (${MIN_INTERVAL_SECONDS} seconds)` })
    }

    const existingCount = await prisma.reminders.count({ where: { userid: auth.userId } })
    if (existingCount >= MAX_REMINDERS) {
      return res.status(400).json({ error: `You can have at most ${MAX_REMINDERS} reminders` })
    }

    const reminder = await prisma.reminders.create({
      data: {
        userid: auth.userId,
        content: trimmed,
        title: title?.trim() || null,
        remind_at: remindDate,
        interval: typeof interval === "number" && interval >= MIN_INTERVAL_SECONDS ? interval : null,
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
    if (typeof content === "string" && content.trim()) {
      const trimmed = content.trim()
      if (trimmed.length > MAX_CONTENT_LENGTH) {
        return res.status(400).json({ error: `Content must be 1-${MAX_CONTENT_LENGTH} characters` })
      }
      updates.content = trimmed
    }
    if (remindAt) {
      const d = new Date(remindAt)
      if (!isNaN(d.getTime())) updates.remind_at = d
    }
    if (typeof interval === "number") {
      if (interval > 0 && interval < MIN_INTERVAL_SECONDS) {
        return res.status(400).json({ error: `Minimum repeat interval is 10 minutes` })
      }
      updates.interval = interval > 0 ? interval : null
    }
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

    const { reminderId, action } = req.body

    if (action === "clear_past") {
      const deleted = await prisma.reminders.deleteMany({
        where: {
          userid: auth.userId,
          remind_at: { lt: new Date() },
          OR: [{ interval: null }, { interval: 0 }],
        },
      })
      return res.status(200).json({ success: true, deleted: deleted.count })
    }

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
