// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET/PATCH server settings (admin only)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAdmin, requireAuth, isModerator } from "@/utils/adminAuth"

const EDITABLE_FIELDS = [
  'timezone', 'locale', 'force_locale',
  'study_hourly_reward', 'study_hourly_live_bonus', 'daily_study_cap',
  'starting_funds', 'allow_transfers', 'coins_per_centixp',
  'max_tasks', 'task_reward', 'task_reward_limit',
  'renting_price', 'renting_cap', 'renting_visible',
  'accountability_bonus', 'accountability_reward', 'accountability_price',
  'rank_type', 'dm_ranks', 'xp_per_period',
  'video_studyban', 'video_grace_period', 'persist_roles',
  'greeting_message', 'returning_message',
  'min_workout_length', 'workout_reward',
] as const

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const guildId = BigInt(req.query.id as string)

  if (req.method === "GET") {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const hasModPerms = await isModerator(auth, guildId)
    if (!hasModPerms) return res.status(403).json({ error: "Not a moderator of this server" })

    const config = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
    })
    if (!config) return res.status(404).json({ error: "Server not found" })

    const safeConfig: Record<string, any> = {}
    for (const field of EDITABLE_FIELDS) {
      safeConfig[field] = (config as any)[field]
    }
    safeConfig.name = config.name
    safeConfig.guildid = config.guildid.toString()

    return res.status(200).json(safeConfig)
  }

  if (req.method === "PATCH") {
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const updates: Record<string, any> = {}
    const body = req.body

    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    await prisma.guild_config.update({
      where: { guildid: guildId },
      data: updates,
    })

    return res.status(200).json({ success: true, updated: Object.keys(updates) })
  }

  return res.status(405).json({ error: "Method not allowed" })
}
