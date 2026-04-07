// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-06
// Purpose: API route for Anti AFK System configuration.
//          GET returns config + premium status.
//          PATCH updates config (admin + premium only).
// ============================================================
import { prisma } from "@/utils/prisma"
// --- AI-MODIFIED (2026-04-07) ---
// Purpose: Import getGuildHasAfkChannel to validate move_afk action
import { requireAdmin, getGuildHasAfkChannel } from "@/utils/adminAuth"
// --- END AI-MODIFIED ---
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

const VALID_ACTIONS = ["kick", "pause", "move_afk"]
const MIN_CHECK_INTERVAL = 15
const MAX_CHECK_INTERVAL = 180
const MIN_GRACE_PERIOD = 2
const MAX_GRACE_PERIOD = 14
const MAX_WARNING_MESSAGE_LEN = 500

async function isPremiumGuild(guildId: bigint): Promise<boolean> {
  const row = await prisma.premium_guilds.findUnique({
    where: { guildid: guildId },
    select: { premium_until: true },
  })
  return !!row && row.premium_until > new Date()
}

function serializeConfig(c: any) {
  return {
    guildid: c.guildid.toString(),
    enabled: c.enabled,
    check_interval: c.check_interval,
    grace_period: c.grace_period,
    action: c.action,
    max_warnings: c.max_warnings,
    min_users: c.min_users,
    warning_message: c.warning_message,
    exempt_roles: parseJsonArray(c.exempt_roles),
    target_channels: parseJsonArray(c.target_channels),
    exclude_channels: parseJsonArray(c.exclude_channels),
    use_dms: c.use_dms,
    prompt_channelid: c.prompt_channelid?.toString() ?? null,
    fallback_channelid: c.fallback_channelid?.toString() ?? null,
    skip_streaming: c.skip_streaming,
    notify_on_action: c.notify_on_action,
    notification_channelid: c.notification_channelid?.toString() ?? null,
    max_actions_per_hour: c.max_actions_per_hour,
  }
}

function parseJsonArray(val: any): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.map(String)
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val)
      return Array.isArray(parsed) ? parsed.map(String) : []
    } catch {
      return []
    }
  }
  return []
}

const DEFAULT_CONFIG = {
  enabled: false,
  check_interval: 60,
  grace_period: 5,
  action: "kick",
  max_warnings: 1,
  min_users: 1,
  warning_message: "Are you still studying?",
  exempt_roles: "[]",
  target_channels: "[]",
  exclude_channels: "[]",
  use_dms: false,
  prompt_channelid: null,
  fallback_channelid: null,
  skip_streaming: true,
  notify_on_action: true,
  notification_channelid: null,
  max_actions_per_hour: 100,
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-04-07) ---
    // Purpose: Also check if guild has an AFK channel so frontend can disable move_afk
    const [config, isPremium, hasAfkChannel] = await Promise.all([
      prisma.anti_afk_config.findUnique({
        where: { guildid: guildId },
      }),
      isPremiumGuild(guildId),
      getGuildHasAfkChannel(guildId.toString()),
    ])

    if (config) {
      return res.status(200).json({
        config: serializeConfig(config),
        isPremium,
        hasAfkChannel,
      })
    }

    return res.status(200).json({
      config: serializeConfig({ guildid: guildId, ...DEFAULT_CONFIG }),
      isPremium,
      hasAfkChannel,
    })
    // --- END AI-MODIFIED ---
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (!(await isPremiumGuild(guildId))) {
      return res.status(403).json({
        error: "Anti AFK System requires a premium server subscription",
      })
    }

    const body = req.body
    const updateData: any = {}

    if (body.enabled !== undefined) {
      updateData.enabled = Boolean(body.enabled)
    }

    if (body.check_interval !== undefined) {
      const val = Number(body.check_interval)
      if (isNaN(val) || val < MIN_CHECK_INTERVAL || val > MAX_CHECK_INTERVAL) {
        throw new ValidationError(
          `Check interval must be between ${MIN_CHECK_INTERVAL} and ${MAX_CHECK_INTERVAL} minutes`
        )
      }
      updateData.check_interval = val
    }

    if (body.grace_period !== undefined) {
      const val = Number(body.grace_period)
      if (isNaN(val) || val < MIN_GRACE_PERIOD || val > MAX_GRACE_PERIOD) {
        throw new ValidationError(
          `Grace period must be between ${MIN_GRACE_PERIOD} and ${MAX_GRACE_PERIOD} minutes`
        )
      }
      updateData.grace_period = val
    }

    // --- AI-MODIFIED (2026-04-07) ---
    // Purpose: Reject move_afk when the guild has no AFK channel configured in Discord
    if (body.action !== undefined) {
      if (!VALID_ACTIONS.includes(body.action)) {
        throw new ValidationError(
          `Action must be one of: ${VALID_ACTIONS.join(", ")}`
        )
      }
      if (body.action === "move_afk") {
        const hasAfk = await getGuildHasAfkChannel(guildId.toString())
        if (!hasAfk) {
          throw new ValidationError(
            "Cannot use 'Move to AFK' — this server has no AFK channel configured in Discord Server Settings"
          )
        }
      }
      updateData.action = body.action
    }
    // --- END AI-MODIFIED ---

    if (body.max_warnings !== undefined) {
      const val = Number(body.max_warnings)
      if (isNaN(val) || val < 1 || val > 5) {
        throw new ValidationError("Max warnings must be between 1 and 5")
      }
      updateData.max_warnings = val
    }

    if (body.min_users !== undefined) {
      const val = Number(body.min_users)
      if (isNaN(val) || val < 1 || val > 10) {
        throw new ValidationError("Min users must be between 1 and 10")
      }
      updateData.min_users = val
    }

    if (body.warning_message !== undefined) {
      const msg = String(body.warning_message).trim()
      if (msg.length > MAX_WARNING_MESSAGE_LEN) {
        throw new ValidationError(
          `Warning message exceeds ${MAX_WARNING_MESSAGE_LEN} character limit`
        )
      }
      updateData.warning_message = msg || "Are you still studying?"
    }

    if (body.exempt_roles !== undefined) {
      if (!Array.isArray(body.exempt_roles)) {
        throw new ValidationError("exempt_roles must be an array")
      }
      updateData.exempt_roles = JSON.stringify(body.exempt_roles)
    }

    if (body.target_channels !== undefined) {
      if (!Array.isArray(body.target_channels)) {
        throw new ValidationError("target_channels must be an array")
      }
      updateData.target_channels = JSON.stringify(body.target_channels)
    }

    if (body.exclude_channels !== undefined) {
      if (!Array.isArray(body.exclude_channels)) {
        throw new ValidationError("exclude_channels must be an array")
      }
      updateData.exclude_channels = JSON.stringify(body.exclude_channels)
    }

    if (body.use_dms !== undefined) {
      updateData.use_dms = Boolean(body.use_dms)
    }

    // --- AI-MODIFIED (2026-04-07) ---
    // Purpose: Support custom channel delivery for Anti AFK prompts
    if (body.prompt_channelid !== undefined) {
      updateData.prompt_channelid = body.prompt_channelid
        ? BigInt(body.prompt_channelid)
        : null
    }
    // --- END AI-MODIFIED ---

    if (body.fallback_channelid !== undefined) {
      updateData.fallback_channelid = body.fallback_channelid
        ? BigInt(body.fallback_channelid)
        : null
    }

    if (body.skip_streaming !== undefined) {
      updateData.skip_streaming = Boolean(body.skip_streaming)
    }

    if (body.notify_on_action !== undefined) {
      updateData.notify_on_action = Boolean(body.notify_on_action)
    }

    if (body.notification_channelid !== undefined) {
      updateData.notification_channelid = body.notification_channelid
        ? BigInt(body.notification_channelid)
        : null
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError("No valid fields to update")
    }

    const config = await prisma.anti_afk_config.upsert({
      where: { guildid: guildId },
      update: updateData,
      create: {
        guildid: guildId,
        ...DEFAULT_CONFIG,
        ...updateData,
      },
    })

    return res.status(200).json({
      config: serializeConfig(config),
    })
  },
})
