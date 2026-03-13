// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Pomodoro timer configuration API
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const guildId = BigInt(req.query.id as string)

  if (req.method === "GET") {
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
  }

  if (req.method === "PATCH") {
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
  }

  return res.status(405).json({ error: "Method not allowed" })
}
