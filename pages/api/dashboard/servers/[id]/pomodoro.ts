// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Pomodoro timer configuration API
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: added pretty_name, channel_name to patchable fields; added unit conversion (seconds <-> minutes)
const PATCHABLE_FIELDS = [
  "focus_length",
  "break_length",
  "voice_alerts",
  "inactivity_threshold",
  "manager_roleid",
  "auto_restart",
  "notification_channelid",
  "pretty_name",
  "channel_name",
] as const

function serializeTimer(t: {
  channelid: bigint
  guildid: bigint
  notification_channelid: bigint | null
  focus_length: number
  break_length: number
  voice_alerts: boolean | null
  inactivity_threshold: number | null
  manager_roleid: bigint | null
  channel_name: string | null
  pretty_name: string | null
  auto_restart: boolean | null
  last_started: Date | null
}) {
  return {
    timerid: t.channelid.toString(),
    guildid: t.guildid.toString(),
    channelid: t.channelid.toString(),
    notification_channelid: t.notification_channelid?.toString() ?? null,
    focus_length: Math.round(t.focus_length / 60),
    break_length: Math.round(t.break_length / 60),
    voice_alerts: t.voice_alerts ?? true,
    inactivity_threshold: t.inactivity_threshold,
    manager_roleid: t.manager_roleid?.toString() ?? null,
    channel_name: t.channel_name,
    pretty_name: t.pretty_name,
    auto_restart: t.auto_restart ?? false,
    last_started: t.last_started?.toISOString() ?? null,
  }
}

function validateFocusBreak(focus: number, breakLen: number): string | null {
  if (isNaN(focus) || focus < 1 || focus > 1440) return "focus_length must be 1-1440 minutes"
  if (isNaN(breakLen) || breakLen < 1 || breakLen > 1440) return "break_length must be 1-1440 minutes"
  return null
}
// --- END AI-MODIFIED ---

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const [timers, guildConfig] = await Promise.all([
      prisma.timers.findMany({ where: { guildid: guildId } }),
      prisma.guild_config.findUnique({
        where: { guildid: guildId },
        select: { pomodoro_channel: true },
      }),
    ])

    if (!guildConfig) return res.status(404).json({ error: "Server not found" })

    return res.status(200).json({
      timers: timers.map(serializeTimer),
      pomodoro_channel: guildConfig.pomodoro_channel?.toString() ?? null,
    })
  },

  async PATCH(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { timerId, ...fields } = req.body
    if (!timerId) return res.status(400).json({ error: "timerId is required" })

    const channelId = BigInt(timerId)
    const updates: Record<string, unknown> = {}

    for (const field of PATCHABLE_FIELDS) {
      if (!(field in fields)) continue
      const val = (fields as Record<string, unknown>)[field]

      if (field === "manager_roleid" || field === "notification_channelid") {
        updates[field] = val === null || val === "" ? null : BigInt(val as string)
      } else if (field === "focus_length" || field === "break_length") {
        const num = typeof val === "number" ? val : parseInt(String(val), 10)
        if (isNaN(num) || num < 1 || num > 1440) {
          return res.status(400).json({ error: `${field} must be 1-1440 minutes` })
        }
        updates[field] = num * 60
      } else if (field === "inactivity_threshold") {
        if (val === null || val === "") {
          updates[field] = null
        } else {
          const num = typeof val === "number" ? val : parseInt(String(val), 10)
          if (isNaN(num) || num < 0 || num > 64) {
            return res.status(400).json({ error: "inactivity_threshold must be 0-64 cycles" })
          }
          updates[field] = num
        }
      } else {
        updates[field] = val
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    const existing = await prisma.timers.findFirst({
      where: { channelid: channelId, guildid: guildId },
    })
    if (!existing) return res.status(404).json({ error: "Timer not found" })

    const updated = await prisma.timers.update({
      where: { channelid: channelId },
      data: updates,
    })

    return res.status(200).json({ success: true, timer: serializeTimer(updated) })
  },

  async POST(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const {
      channelid, focus_length, break_length,
      notification_channelid, inactivity_threshold,
      voice_alerts, auto_restart, manager_roleid,
      pretty_name, channel_name,
    } = req.body

    if (!channelid) return res.status(400).json({ error: "channelid is required" })
    const channelId = BigInt(channelid)

    const focus = typeof focus_length === "number" ? focus_length : parseInt(String(focus_length), 10)
    const breakLen = typeof break_length === "number" ? break_length : parseInt(String(break_length), 10)
    const validationErr = validateFocusBreak(focus, breakLen)
    if (validationErr) return res.status(400).json({ error: validationErr })

    const guildConfig = await prisma.guild_config.findUnique({ where: { guildid: guildId } })
    if (!guildConfig) return res.status(404).json({ error: "Server not found" })

    const existing = await prisma.timers.findUnique({ where: { channelid: channelId } })
    if (existing) return res.status(409).json({ error: "A timer already exists for this channel" })

    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: store focus/break in SECONDS (bot expects seconds), validate inactivity_threshold
    const inactThresh = inactivity_threshold != null && inactivity_threshold !== ""
      ? parseInt(String(inactivity_threshold), 10)
      : null
    if (inactThresh !== null && (isNaN(inactThresh) || inactThresh < 0 || inactThresh > 64)) {
      return res.status(400).json({ error: "inactivity_threshold must be 0-64 cycles" })
    }

    const timer = await prisma.timers.create({
      data: {
        channelid: channelId,
        guildid: guildId,
        focus_length: focus * 60,
        break_length: breakLen * 60,
        notification_channelid: notification_channelid ? BigInt(notification_channelid) : null,
        inactivity_threshold: inactThresh,
        voice_alerts: voice_alerts ?? true,
        auto_restart: auto_restart ?? true,
        manager_roleid: manager_roleid ? BigInt(manager_roleid) : null,
        pretty_name: pretty_name || null,
        channel_name: channel_name || null,
      },
    })
    // --- END AI-MODIFIED ---
    return res.status(201).json({ success: true, timer: serializeTimer(timer) })
  },

  async DELETE(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { channelid } = req.body
    if (!channelid) return res.status(400).json({ error: "channelid is required" })
    const channelId = BigInt(channelid)

    const existing = await prisma.timers.findFirst({
      where: { channelid: channelId, guildid: guildId },
    })
    if (!existing) return res.status(404).json({ error: "Timer not found" })

    await prisma.timers.delete({ where: { channelid: channelId } })
    return res.status(200).json({ success: true })
  },
})
