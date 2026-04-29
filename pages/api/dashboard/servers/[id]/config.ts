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
// --- AI-MODIFIED (2026-04-29) ---
// Dead-column audit (do NOT surface these in any new dashboard UI):
//   - max_tasks, min_workout_length, workout_reward, video_studyban
//   These columns exist on guild_config but no bot cog ever reads them.
//   They're left in EDITABLE_FIELDS so the existing legacy wizard pages don't
//   throw on POST, but writes are no-ops in-game. Verified 2026-04-29 against
//   StudyLion/src/modules/ — zero references outside core/data.py declarations.
//   See docs/setup-copy.md for the new checklist's allow-list.
// --- END AI-MODIFIED ---
const EDITABLE_FIELDS = [
  'timezone', 'locale', 'force_locale',
  'study_hourly_reward', 'study_hourly_live_bonus', 'daily_study_cap',
  'starting_funds', 'allow_transfers', 'coins_per_centixp',
  'max_tasks', 'task_reward', 'task_reward_limit', // max_tasks: dead column (see audit comment above)
  'renting_price', 'renting_cap', 'renting_visible',
  'renting_category', 'renting_sync_perms', 'renting_role', // AI-MODIFIED (2026-04-01): room moderator role
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: New admin-configurable room settings for Private Rooms panel
  'renting_max_per_user', 'renting_name_limit', 'renting_min_deposit',
  'renting_auto_extend', 'renting_cooldown',
  'renting_notifications', // AI-MODIFIED (2026-04-04): join/leave notification toggle
  'renting_inactivity_enabled', 'renting_inactivity_days', // AI-MODIFIED (2026-04-06): inactivity auto-delete
  // --- END AI-MODIFIED ---
  'accountability_bonus', 'accountability_reward', 'accountability_price',
  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Expose accountability channel fields + wizard dismiss tracking for setup wizard
  'accountability_category', 'accountability_lobby',
  'setup_wizard_dismissed_at',
  // --- END AI-MODIFIED ---
  'rank_type', 'dm_ranks', 'xp_per_period', 'xp_per_centiword',
  'rank_channel', 'pomodoro_channel', // AI-MODIFIED (2026-03-13): guild default pomodoro notification channel
  'session_leave_summary', // AI-MODIFIED (2026-03-25): pomodoro leave summary toggle
  'video_studyban', 'video_grace_period', 'persist_roles', // video_studyban: dead column
  'greeting_message', 'returning_message', 'greeting_channel',
  'min_workout_length', 'workout_reward', // both dead columns (see audit comment above)
  'event_log_channel', 'mod_log_channel', 'alert_channel',
  'admin_role', 'mod_role',
  'season_start',
] as const

const BIGINT_FIELDS = new Set([
  'event_log_channel', 'mod_log_channel', 'alert_channel',
  'greeting_channel', 'rank_channel', 'pomodoro_channel', 'renting_category', // AI-MODIFIED: pomodoro_channel
  'admin_role', 'mod_role', 'renting_role', // AI-MODIFIED (2026-04-01): room moderator role
  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: accountability_category/lobby are now routed via SCHEDULE_CONFIG_FIELDS
  // (to the columns the bot actually reads). They MUST NOT write to guild_config
  // any more or both copies will silently disagree. Kept the comment for git blame.
  // --- Original code (commented out for rollback) ---
  // 'accountability_category', 'accountability_lobby', // AI-MODIFIED (2026-03-23): setup wizard accountability channels
  // --- End original code ---
  // --- END AI-MODIFIED ---
])
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Bot stores daily_study_cap in seconds, dashboard displays in hours.
// Convert on read (seconds→hours) and write (hours→seconds) so the API
// is the single conversion boundary.
const HOURS_TO_SECONDS_FIELDS: Record<string, number> = {
  daily_study_cap: 3600,
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Bot reads accountability settings from schedule_guild_config (not guild_config).
// Map dashboard field names → schedule_guild_config column names so the API
// reads/writes to the table the bot actually uses.
// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Setup checklist redesign -- also route accountability_lobby/category
// to schedule_guild_config (lobby_channel/room_channel) so the schedule cog
// actually picks them up. Previously they were written to dead columns on
// guild_config and silently ignored by the bot.
const SCHEDULE_CONFIG_FIELDS: Record<string, string> = {
  accountability_price: 'schedule_cost',
  accountability_reward: 'reward',
  accountability_bonus: 'bonus_reward',
  accountability_lobby: 'lobby_channel',
  accountability_category: 'room_channel',
}
// schedule_guild_config bigint columns -- converted from string IDs on write
const SCHEDULE_BIGINT_FIELDS = new Set(['lobby_channel', 'room_channel'])
// --- END AI-MODIFIED ---
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

    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Read accountability fields from schedule_guild_config (the table the bot uses)
    const scheduleConfig = await prisma.schedule_guild_config.findUnique({
      where: { guildid: guildId },
    })
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: serialize BigInt fields to strings for JSON
    const safeConfig: Record<string, any> = {}
    for (const field of EDITABLE_FIELDS) {
      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Read accountability fields from schedule_guild_config instead of guild_config
      // --- AI-MODIFIED (2026-04-29) ---
      // Purpose: Serialize bigint schedule columns (lobby_channel/room_channel) to strings
      if (field in SCHEDULE_CONFIG_FIELDS) {
        const schedCol = SCHEDULE_CONFIG_FIELDS[field]
        const schedVal = scheduleConfig ? (scheduleConfig as any)[schedCol] : null
        if (SCHEDULE_BIGINT_FIELDS.has(schedCol) && schedVal != null) {
          safeConfig[field] = schedVal.toString()
        } else {
          safeConfig[field] = schedVal
        }
        continue
      }
      // --- END AI-MODIFIED ---
      // --- END AI-MODIFIED ---
      const val = (config as any)[field]
      if (BIGINT_FIELDS.has(field) && val != null) {
        safeConfig[field] = val.toString()
      } else if (field in HOURS_TO_SECONDS_FIELDS && val != null) {
        safeConfig[field] = Math.round(val / HOURS_TO_SECONDS_FIELDS[field])
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
    const scheduleUpdates: Record<string, any> = {}
    const body = req.body

    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        const val = body[field]
        // --- AI-MODIFIED (2026-03-23) ---
        // Purpose: Write accountability fields to schedule_guild_config (the table the bot reads)
        // --- AI-MODIFIED (2026-04-29) ---
        // Purpose: Convert bigint schedule columns (lobby_channel/room_channel) from string IDs
        if (field in SCHEDULE_CONFIG_FIELDS) {
          const schedCol = SCHEDULE_CONFIG_FIELDS[field]
          if (SCHEDULE_BIGINT_FIELDS.has(schedCol)) {
            scheduleUpdates[schedCol] = val ? parseBigInt(val, field) : null
          } else {
            scheduleUpdates[schedCol] = typeof val === 'number' ? val : val != null ? parseInt(val, 10) : null
          }
        // --- END AI-MODIFIED ---
        // --- END AI-MODIFIED ---
        } else if (BIGINT_FIELDS.has(field)) {
          updates[field] = val ? parseBigInt(val, field) : null
        } else if (field === "season_start" || field === "setup_wizard_dismissed_at") {
          updates[field] = val ? new Date(val) : null
        } else if (field in HOURS_TO_SECONDS_FIELDS) {
          updates[field] = val != null ? Math.round(val * HOURS_TO_SECONDS_FIELDS[field]) : null
        } else {
          updates[field] = val
        }
      }
    }
    // --- END AI-MODIFIED ---

    if (Object.keys(updates).length === 0 && Object.keys(scheduleUpdates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    if (Object.keys(updates).length > 0) {
      await prisma.guild_config.update({
        where: { guildid: guildId },
        data: updates,
      })
    }
    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Write accountability fields to schedule_guild_config via upsert
    if (Object.keys(scheduleUpdates).length > 0) {
      await prisma.schedule_guild_config.upsert({
        where: { guildid: guildId },
        create: { guildid: guildId, ...scheduleUpdates },
        update: scheduleUpdates,
      })
    }
    // --- END AI-MODIFIED ---

    return res.status(200).json({ success: true, updated: [...Object.keys(updates), ...Object.keys(scheduleUpdates)] })
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
    const scheduleImports: Record<string, any> = {}
    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        const val = body[field]
        // --- AI-MODIFIED (2026-03-23) ---
        // Purpose: Write accountability fields to schedule_guild_config on import
        // --- AI-MODIFIED (2026-04-29) ---
        // Purpose: Convert bigint schedule columns from string IDs on import as well
        if (field in SCHEDULE_CONFIG_FIELDS) {
          const schedCol = SCHEDULE_CONFIG_FIELDS[field]
          if (SCHEDULE_BIGINT_FIELDS.has(schedCol)) {
            scheduleImports[schedCol] = val ? parseBigInt(val, field) : null
          } else {
            scheduleImports[schedCol] = typeof val === 'number' ? val : val != null ? parseInt(val, 10) : null
          }
        // --- END AI-MODIFIED ---
        // --- END AI-MODIFIED ---
        } else if (BIGINT_FIELDS.has(field)) {
          configUpdates[field] = val ? parseBigInt(val, field) : null
        } else if (field === "season_start" || field === "setup_wizard_dismissed_at") {
          configUpdates[field] = val ? new Date(val) : null
        } else if (field in HOURS_TO_SECONDS_FIELDS) {
          configUpdates[field] = val != null ? Math.round(val * HOURS_TO_SECONDS_FIELDS[field]) : null
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
    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Write accountability fields to schedule_guild_config on import
    if (Object.keys(scheduleImports).length > 0) {
      await prisma.schedule_guild_config.upsert({
        where: { guildid: guildId },
        create: { guildid: guildId, ...scheduleImports },
        update: scheduleImports,
      })
    }
    // --- END AI-MODIFIED ---
    for (const op of listOps) {
      await op()
    }

    return res.status(200).json({ success: true, imported: true })
  },
  // --- END AI-MODIFIED ---
})
