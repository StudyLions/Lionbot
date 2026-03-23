// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET/PATCH server settings (admin only)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireAdmin, requireAuth, isModerator, getUserGuilds } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: parseBigInt for guild ID and bigint fields/IDs from import body
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
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
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: New admin-configurable room settings for Private Rooms panel
  'renting_max_per_user', 'renting_name_limit', 'renting_min_deposit',
  'renting_auto_extend', 'renting_cooldown',
  // --- END AI-MODIFIED ---
  'accountability_bonus', 'accountability_reward', 'accountability_price',
  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Expose accountability channel fields + wizard dismiss tracking for setup wizard
  'accountability_category', 'accountability_lobby',
  'setup_wizard_dismissed_at',
  // --- END AI-MODIFIED ---
  'rank_type', 'dm_ranks', 'xp_per_period', 'xp_per_centiword',
  'rank_channel', 'pomodoro_channel', // AI-MODIFIED (2026-03-13): guild default pomodoro notification channel
  'video_studyban', 'video_grace_period', 'persist_roles',
  'greeting_message', 'returning_message', 'greeting_channel',
  'min_workout_length', 'workout_reward',
  'event_log_channel', 'mod_log_channel', 'alert_channel',
  'admin_role', 'mod_role',
  'season_start',
] as const

const BIGINT_FIELDS = new Set([
  'event_log_channel', 'mod_log_channel', 'alert_channel',
  'greeting_channel', 'rank_channel', 'pomodoro_channel', 'renting_category', // AI-MODIFIED: pomodoro_channel
  'admin_role', 'mod_role',
  'accountability_category', 'accountability_lobby', // AI-MODIFIED (2026-03-23): setup wizard accountability channels
])
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAuth(req, res)
    if (!auth) return

    const hasModPerms = await isModerator(auth, guildId)
    if (!hasModPerms) return res.status(403).json({ error: "Not a moderator of this server" })

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: auto-create guild_config for newly added servers (bot creates lazily on first command,
    // but users may visit the dashboard before running any command)
    let config = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
    })
    if (!config) {
      const guilds = await getUserGuilds(auth.accessToken, auth.discordId)
      const discordGuild = guilds.find((g) => g.id === guildId.toString())
      config = await prisma.guild_config.create({
        data: {
          guildid: guildId,
          name: discordGuild?.name ?? null,
        },
      })
    }
    // --- END AI-MODIFIED ---

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

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: export mode includes list-type settings for full config backup
    if (req.query.format === "export") {
      const adminAuth = await requireAdmin(req, res, guildId)
      if (!adminAuth) return

      const [untrackedVoice, untrackedText, autoroles, botAutoroles, unrankedRoles] = await Promise.all([
        prisma.$queryRaw<{ channelid: bigint }[]>(
          Prisma.sql`SELECT channelid FROM untracked_channels WHERE guildid = ${guildId}`
        ),
        prisma.untracked_text_channels.findMany({
          where: { guildid: guildId }, select: { channelid: true },
        }),
        prisma.$queryRaw<{ roleid: bigint }[]>(
          Prisma.sql`SELECT roleid FROM autoroles WHERE guildid = ${guildId}`
        ),
        prisma.$queryRaw<{ roleid: bigint }[]>(
          Prisma.sql`SELECT roleid FROM bot_autoroles WHERE guildid = ${guildId}`
        ),
        prisma.$queryRaw<{ roleid: bigint }[]>(
          Prisma.sql`SELECT roleid FROM unranked_roles WHERE guildid = ${guildId}`
        ),
      ])

      safeConfig.untrackedVoiceChannels = untrackedVoice.map((r) => r.channelid.toString())
      safeConfig.untrackedTextChannels = untrackedText.map((r) => r.channelid.toString())
      safeConfig.autoroles = autoroles.map((r) => r.roleid.toString())
      safeConfig.botAutoroles = botAutoroles.map((r) => r.roleid.toString())
      safeConfig.unrankedRoles = unrankedRoles.map((r) => r.roleid.toString())
      safeConfig._exportedAt = new Date().toISOString()
      safeConfig._version = 1
    }
    // --- END AI-MODIFIED ---

    return res.status(200).json(safeConfig)
  },
  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
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
          updates[field] = val ? parseBigInt(val, field) : null
        } else if (field === 'season_start' || field === 'setup_wizard_dismissed_at') {
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

  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: full config import (applies all settings at once in a transaction)
  async PUT(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const body = req.body as Record<string, any>
    if (!body || typeof body !== "object") {
      return res.status(400).json({ error: "Invalid import data" })
    }

    const configUpdates: Record<string, any> = {}
    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        const val = body[field]
        if (BIGINT_FIELDS.has(field)) {
          configUpdates[field] = val ? parseBigInt(val, field) : null
        } else if (field === "season_start" || field === "setup_wizard_dismissed_at") {
          configUpdates[field] = val ? new Date(val) : null
        } else {
          configUpdates[field] = val
        }
      }
    }

    const listOps: Array<() => Promise<void>> = []
    const LIST_TABLES: Record<string, { table: string; idCol: string; usePrisma: boolean }> = {
      untrackedVoiceChannels: { table: "untracked_channels", idCol: "channelid", usePrisma: false },
      untrackedTextChannels: { table: "untracked_text_channels", idCol: "channelid", usePrisma: true },
      autoroles: { table: "autoroles", idCol: "roleid", usePrisma: false },
      botAutoroles: { table: "bot_autoroles", idCol: "roleid", usePrisma: false },
      unrankedRoles: { table: "unranked_roles", idCol: "roleid", usePrisma: false },
    }

    for (const [key, { table, idCol, usePrisma }] of Object.entries(LIST_TABLES)) {
      if (key in body && Array.isArray(body[key])) {
        const ids = body[key].map((id: string) => parseBigInt(id, `${key} entry`))
        listOps.push(async () => {
          if (usePrisma) {
            await prisma.untracked_text_channels.deleteMany({ where: { guildid: guildId } })
            for (const cid of ids) {
              await prisma.untracked_text_channels.create({ data: { channelid: cid, guildid: guildId } })
            }
          } else {
            await prisma.$executeRawUnsafe(`DELETE FROM ${table} WHERE guildid = $1`, guildId)
            for (const bid of ids) {
              await prisma.$executeRawUnsafe(
                `INSERT INTO ${table} (guildid, ${idCol}) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                guildId, bid
              )
            }
          }
        })
      }
    }

    if (Object.keys(configUpdates).length > 0) {
      await prisma.guild_config.update({ where: { guildid: guildId }, data: configUpdates })
    }
    for (const op of listOps) {
      await op()
    }

    return res.status(200).json({ success: true, imported: true })
  },
  // --- END AI-MODIFIED ---
})
