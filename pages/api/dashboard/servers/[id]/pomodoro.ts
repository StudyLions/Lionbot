// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Pomodoro timer configuration API
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
import { apiHandler } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

const PATCHABLE_FIELDS = [
  "focus_length",
  "break_length",
  "voice_alerts",
  "inactivity_threshold",
  "manager_roleid",
  "auto_restart",
  "notification_channelid",
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
}) {
  return {
    timerid: t.channelid.toString(),
    guildid: t.guildid.toString(),
    channelid: t.channelid.toString(),
    notification_channelid: t.notification_channelid?.toString() ?? null,
    focus_length: t.focus_length,
    break_length: t.break_length,
    voice_alerts: t.voice_alerts ?? false,
    inactivity_threshold: t.inactivity_threshold,
    manager_roleid: t.manager_roleid?.toString() ?? null,
    channel_name: t.channel_name,
    pretty_name: t.pretty_name,
    auto_restart: t.auto_restart ?? false,
  }
}

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const [timers, guildConfig] = await Promise.all([
      prisma.timers.findMany({
        where: { guildid: guildId },
      }),
      prisma.guild_config.findUnique({
        where: { guildid: guildId },
        select: { pomodoro_channel: true },
      }),
    ])

    if (!guildConfig) return res.status(404).json({ error: "Server not found" })

    const serialized = timers.map(serializeTimer)
    return res.status(200).json({
      timers: serialized,
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
      if (field in fields) {
        const val = (fields as Record<string, unknown>)[field]
        if (field === "manager_roleid" || field === "notification_channelid") {
          updates[field] = val === null || val === "" ? null : BigInt(val as string)
        } else {
          updates[field] = val
        }
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
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: Phase 2E - POST create timer, DELETE remove timer
  async POST(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const {
      channelid,
      focus_length,
      break_length,
      notification_channelid,
      inactivity_threshold,
      voice_alerts,
      auto_restart,
      manager_roleid,
    } = req.body

    if (!channelid) return res.status(400).json({ error: "channelid is required" })
    const channelId = BigInt(channelid)
    const focus = typeof focus_length === "number" ? focus_length : parseInt(String(focus_length), 10)
    const breakLen = typeof break_length === "number" ? break_length : parseInt(String(break_length), 10)
    if (isNaN(focus) || focus < 1 || focus > 120) {
      return res.status(400).json({ error: "focus_length must be 1-120" })
    }
    if (isNaN(breakLen) || breakLen < 1 || breakLen > 60) {
      return res.status(400).json({ error: "break_length must be 1-60" })
    }

    const guildConfig = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
    })
    if (!guildConfig) return res.status(404).json({ error: "Server not found" })

    const existing = await prisma.timers.findUnique({
      where: { channelid: channelId },
    })
    if (existing) return res.status(409).json({ error: "A timer already exists for this channel" })

    const timer = await prisma.timers.create({
      data: {
        channelid: channelId,
        guildid: guildId,
        focus_length: focus,
        break_length: breakLen,
        notification_channelid:
          notification_channelid != null && notification_channelid !== ""
            ? BigInt(notification_channelid)
            : null,
        inactivity_threshold:
          inactivity_threshold != null && inactivity_threshold !== ""
            ? parseInt(String(inactivity_threshold), 10)
            : null,
        voice_alerts: voice_alerts ?? false,
        auto_restart: auto_restart ?? false,
        manager_roleid:
          manager_roleid != null && manager_roleid !== ""
            ? BigInt(manager_roleid)
            : null,
      },
    })
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

    await prisma.timers.delete({
      where: { channelid: channelId },
    })
    return res.status(200).json({ success: true })
  },
  // --- END AI-MODIFIED ---
})
