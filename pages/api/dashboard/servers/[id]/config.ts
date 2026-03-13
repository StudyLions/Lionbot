// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET/PATCH server settings (admin only)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAdmin, requireAuth, isModerator } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
import { apiHandler } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: added missing settings fields (channels, roles, season, rooms, XP per word)
const EDITABLE_FIELDS = [
  'timezone', 'locale', 'force_locale',
  'study_hourly_reward', 'study_hourly_live_bonus', 'daily_study_cap',
  'starting_funds', 'allow_transfers', 'coins_per_centixp',
  'max_tasks', 'task_reward', 'task_reward_limit',
  'renting_price', 'renting_cap', 'renting_visible',
  'renting_category', 'renting_sync_perms',
  'accountability_bonus', 'accountability_reward', 'accountability_price',
  'rank_type', 'dm_ranks', 'xp_per_period', 'xp_per_centiword',
  'rank_channel',
  'video_studyban', 'video_grace_period', 'persist_roles',
  'greeting_message', 'returning_message', 'greeting_channel',
  'min_workout_length', 'workout_reward',
  'event_log_channel', 'mod_log_channel', 'alert_channel',
  'admin_role', 'mod_role',
  'season_start',
] as const

const BIGINT_FIELDS = new Set([
  'event_log_channel', 'mod_log_channel', 'alert_channel',
  'greeting_channel', 'rank_channel', 'renting_category',
  'admin_role', 'mod_role',
])
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAuth(req, res)
    if (!auth) return

    const hasModPerms = await isModerator(auth, guildId)
    if (!hasModPerms) return res.status(403).json({ error: "Not a moderator of this server" })

    const config = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
    })
    if (!config) return res.status(404).json({ error: "Server not found" })

    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: serialize BigInt fields to strings for JSON
    const safeConfig: Record<string, any> = {}
    for (const field of EDITABLE_FIELDS) {
      const val = (config as any)[field]
      if (BIGINT_FIELDS.has(field) && val != null) {
        safeConfig[field] = val.toString()
      } else if (val instanceof Date) {
        safeConfig[field] = val.toISOString()
      } else {
        safeConfig[field] = val
      }
    }
    safeConfig.name = config.name
    safeConfig.guildid = config.guildid.toString()

    return res.status(200).json(safeConfig)
    // --- END AI-MODIFIED ---
  },
  async PATCH(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: convert BigInt fields from strings and handle date fields
    const updates: Record<string, any> = {}
    const body = req.body

    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        const val = body[field]
        if (BIGINT_FIELDS.has(field)) {
          updates[field] = val ? BigInt(val) : null
        } else if (field === 'season_start') {
          updates[field] = val ? new Date(val) : null
        } else {
          updates[field] = val
        }
      }
    }
    // --- END AI-MODIFIED ---

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    await prisma.guild_config.update({
      where: { guildid: guildId },
      data: updates,
    })

    return res.status(200).json({ success: true, updated: Object.keys(updates) })
  },
})
// --- END AI-MODIFIED ---
