// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: CRUD API for leaderboard auto-post configs
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

const MAX_CONFIGS_PER_GUILD = 10

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Premium-only gate for leaderboard autopost
async function isPremiumGuild(guildId: bigint): Promise<boolean> {
  const row = await prisma.premium_guilds.findUnique({
    where: { guildid: guildId },
    select: { premium_until: true },
  })
  return !!row && row.premium_until > new Date()
}
// --- END AI-MODIFIED ---

const BLOCKED_MENTION_RE = /@(everyone|here)/i

function validateTemplateField(value: string | null | undefined, fieldName: string, maxLen: number) {
  if (!value) return
  if (value.length > maxLen) {
    throw new ValidationError(`${fieldName} exceeds ${maxLen} character limit`)
  }
  if (BLOCKED_MENTION_RE.test(value)) {
    throw new ValidationError(`${fieldName} must not contain @everyone or @here`)
  }
}

function validateEmbedFields(fields: any) {
  if (!Array.isArray(fields)) return
  if (fields.length > 6) {
    throw new ValidationError("Maximum 6 embed fields allowed")
  }
  for (const f of fields) {
    validateTemplateField(f.name, "embed field name", 256)
    validateTemplateField(f.value, "embed field value", 1024)
  }
}

function serializeConfig(c: any) {
  return {
    configid: c.configid,
    guildid: c.guildid.toString(),
    config_name: c.config_name,
    enabled: c.enabled,
    lb_type: c.lb_type,
    messages_metric: c.messages_metric,
    frequency: c.frequency,
    seasonal_mode: c.seasonal_mode,
    week_starts_on: c.week_starts_on,
    top_count: c.top_count,
    post_channel: c.post_channel?.toString() ?? null,
    post_day: c.post_day,
    post_hour: c.post_hour,
    post_minute: c.post_minute,
    top1_roles: c.top1_roles ?? [],
    topn_roles: c.topn_roles ?? [],
    auto_remove_roles: c.auto_remove_roles,
    reward_tiers: c.reward_tiers,
    announce_content: c.announce_content,
    embed_title: c.embed_title,
    embed_description: c.embed_description,
    embed_footer: c.embed_footer,
    embed_color: c.embed_color,
    embed_url: c.embed_url,
    embed_author_name: c.embed_author_name,
    embed_author_url: c.embed_author_url,
    embed_fields: c.embed_fields,
    include_image: c.include_image,
    mention_winners: c.mention_winners,
    pin_post: c.pin_post,
    delete_previous: c.delete_previous,
    min_threshold: c.min_threshold,
    notify_public_post: c.notify_public_post,
    notify_dm_winners: c.notify_dm_winners,
    dm_scope: c.dm_scope,
    dm_template_title: c.dm_template_title,
    dm_template_body: c.dm_template_body,
    dm_stagger_seconds: c.dm_stagger_seconds,
    top1_dm_enabled: c.top1_dm_enabled,
    top1_dm_template_title: c.top1_dm_template_title,
    top1_dm_template_body: c.top1_dm_template_body,
    notify_mod_log: c.notify_mod_log,
    mod_log_channel: c.mod_log_channel?.toString() ?? null,
    skip_if_empty: c.skip_if_empty,
    skip_if_same_as_last: c.skip_if_same_as_last,
    continue_on_partial: c.continue_on_partial,
    max_coins_per_user: c.max_coins_per_user,
    last_posted_at: c.last_posted_at?.toISOString() ?? null,
    last_message_id: c.last_message_id?.toString() ?? null,
    last_winner_ids: c.last_winner_ids,
    created_at: c.created_at?.toISOString() ?? null,
  }
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Return premium status so the frontend can show/hide the feature
    const [configs, isPremium] = await Promise.all([
      prisma.leaderboard_autopost_config.findMany({
        where: { guildid: guildId },
        orderBy: { created_at: "asc" },
      }),
      isPremiumGuild(guildId),
    ])
    // --- END AI-MODIFIED ---

    const historyConfigId = req.query.history
      ? parseInt(req.query.history as string, 10)
      : null

    let history: any[] = []
    if (historyConfigId) {
      const rows = await prisma.leaderboard_autopost_history.findMany({
        where: { configid: historyConfigId, guildid: guildId },
        orderBy: { posted_at: "desc" },
        take: 10,
      })
      history = rows.map((h) => ({
        historyid: h.historyid,
        configid: h.configid,
        posted_at: h.posted_at.toISOString(),
        top_users: h.top_users,
        roles_added: h.roles_added,
        roles_removed: h.roles_removed,
        coins_awarded: h.coins_awarded,
        dms_sent: h.dms_sent,
        dms_failed: h.dms_failed,
        status: h.status,
        error_message: h.error_message,
      }))
    }

    return res.status(200).json({
      configs: configs.map(serializeConfig),
      history,
      isPremium,
    })
  },

  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Premium-only gate
    if (!(await isPremiumGuild(guildId))) {
      return res.status(403).json({ error: "Leaderboard auto-post requires a premium server subscription" })
    }
    // --- END AI-MODIFIED ---

    const existingCount = await prisma.leaderboard_autopost_config.count({
      where: { guildid: guildId },
    })
    if (existingCount >= MAX_CONFIGS_PER_GUILD) {
      throw new ValidationError(`Maximum ${MAX_CONFIGS_PER_GUILD} configs per server`)
    }

    const body = req.body

    validateTemplateField(body.announce_content, "content", 2000)
    validateTemplateField(body.embed_title, "embed_title", 256)
    validateTemplateField(body.embed_description, "embed_description", 4096)
    validateTemplateField(body.embed_footer, "embed_footer", 2048)
    validateTemplateField(body.embed_author_name, "embed_author_name", 256)
    validateTemplateField(body.dm_template_title, "dm_template_title", 256)
    validateTemplateField(body.dm_template_body, "dm_template_body", 4096)
    // --- AI-MODIFIED (2026-04-15) ---
    // Purpose: Validate Top 1 DM template fields
    validateTemplateField(body.top1_dm_template_title, "top1_dm_template_title", 256)
    validateTemplateField(body.top1_dm_template_body, "top1_dm_template_body", 4096)
    // --- END AI-MODIFIED ---
    if (body.embed_fields) validateEmbedFields(body.embed_fields)

    if (!body.post_channel) {
      throw new ValidationError("post_channel is required")
    }

    const config = await prisma.leaderboard_autopost_config.create({
      data: {
        guildid: guildId,
        config_name: body.config_name || "Leaderboard",
        enabled: body.enabled ?? true,
        lb_type: body.lb_type || "study",
        messages_metric: body.messages_metric || "count",
        frequency: body.frequency || "weekly",
        seasonal_mode: body.seasonal_mode || null,
        week_starts_on: body.week_starts_on || "monday",
        top_count: Math.min(Math.max(body.top_count || 10, 1), 25),
        post_channel: parseBigInt(body.post_channel, "post_channel"),
        post_day: body.post_day ?? 0,
        post_hour: Math.min(Math.max(body.post_hour ?? 20, 0), 23),
        post_minute: Math.min(Math.max(body.post_minute ?? 0, 0), 59),
        top1_roles: body.top1_roles ?? [],
        topn_roles: body.topn_roles ?? [],
        auto_remove_roles: body.auto_remove_roles ?? true,
        reward_tiers: body.reward_tiers ?? [],
        announce_content: body.announce_content || null,
        embed_title: body.embed_title || null,
        embed_description: body.embed_description || null,
        embed_footer: body.embed_footer || null,
        embed_color: body.embed_color ?? 16766720,
        embed_url: body.embed_url || null,
        embed_author_name: body.embed_author_name || null,
        embed_author_url: body.embed_author_url || null,
        embed_fields: body.embed_fields ?? [],
        include_image: body.include_image ?? true,
        mention_winners: body.mention_winners ?? false,
        pin_post: body.pin_post ?? false,
        delete_previous: body.delete_previous ?? false,
        min_threshold: body.min_threshold ?? 0,
        notify_public_post: body.notify_public_post ?? true,
        notify_dm_winners: body.notify_dm_winners ?? false,
        dm_scope: body.dm_scope || "top_n",
        dm_template_title: body.dm_template_title || null,
        dm_template_body: body.dm_template_body || null,
        dm_stagger_seconds: Math.min(Math.max(body.dm_stagger_seconds ?? 2, 1), 10),
        // --- AI-MODIFIED (2026-04-15) ---
        // Purpose: Top 1 DM fields
        top1_dm_enabled: body.top1_dm_enabled ?? false,
        top1_dm_template_title: body.top1_dm_template_title || null,
        top1_dm_template_body: body.top1_dm_template_body || null,
        // --- END AI-MODIFIED ---
        notify_mod_log: body.notify_mod_log ?? false,
        mod_log_channel: body.mod_log_channel
          ? parseBigInt(body.mod_log_channel, "mod_log_channel")
          : null,
        skip_if_empty: body.skip_if_empty ?? true,
        skip_if_same_as_last: body.skip_if_same_as_last ?? false,
        continue_on_partial: body.continue_on_partial ?? true,
        max_coins_per_user: body.max_coins_per_user ?? null,
        // Seed last_posted_at so the bot doesn't fire immediately for the
        // current period. First real post happens at the NEXT scheduled time.
        last_posted_at: new Date(),
      },
    })

    return res.status(201).json(serializeConfig(config))
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Premium-only gate
    if (!(await isPremiumGuild(guildId))) {
      return res.status(403).json({ error: "Leaderboard auto-post requires a premium server subscription" })
    }
    // --- END AI-MODIFIED ---

    const { configid, ...updates } = req.body
    if (!configid) {
      throw new ValidationError("configid is required")
    }

    const existing = await prisma.leaderboard_autopost_config.findFirst({
      where: { configid: parseInt(configid, 10), guildid: guildId },
    })
    if (!existing) {
      throw new ValidationError("Config not found", 404)
    }

    if (updates.announce_content !== undefined)
      validateTemplateField(updates.announce_content, "content", 2000)
    if (updates.embed_title !== undefined)
      validateTemplateField(updates.embed_title, "embed_title", 256)
    if (updates.embed_description !== undefined)
      validateTemplateField(updates.embed_description, "embed_description", 4096)
    if (updates.embed_footer !== undefined)
      validateTemplateField(updates.embed_footer, "embed_footer", 2048)
    if (updates.embed_author_name !== undefined)
      validateTemplateField(updates.embed_author_name, "embed_author_name", 256)
    if (updates.dm_template_title !== undefined)
      validateTemplateField(updates.dm_template_title, "dm_template_title", 256)
    if (updates.dm_template_body !== undefined)
      validateTemplateField(updates.dm_template_body, "dm_template_body", 4096)
    // --- AI-MODIFIED (2026-04-15) ---
    // Purpose: Validate Top 1 DM template fields on update
    if (updates.top1_dm_template_title !== undefined)
      validateTemplateField(updates.top1_dm_template_title, "top1_dm_template_title", 256)
    if (updates.top1_dm_template_body !== undefined)
      validateTemplateField(updates.top1_dm_template_body, "top1_dm_template_body", 4096)
    // --- END AI-MODIFIED ---
    if (updates.embed_fields !== undefined) validateEmbedFields(updates.embed_fields)

    const data: any = {}

    const stringFields = [
      "config_name", "lb_type", "messages_metric", "frequency",
      "seasonal_mode", "week_starts_on", "dm_scope",
      "announce_content", "embed_title", "embed_description", "embed_footer",
      "embed_url", "embed_author_name", "embed_author_url",
      "dm_template_title", "dm_template_body",
      "top1_dm_template_title", "top1_dm_template_body",
    ]
    for (const f of stringFields) {
      if (updates[f] !== undefined) data[f] = updates[f] || null
    }

    const boolFields = [
      "enabled", "auto_remove_roles",
      "include_image", "mention_winners", "pin_post", "delete_previous",
      "notify_public_post", "notify_dm_winners", "top1_dm_enabled", "notify_mod_log",
      "skip_if_empty", "skip_if_same_as_last", "continue_on_partial",
    ]
    for (const f of boolFields) {
      if (updates[f] !== undefined) data[f] = updates[f]
    }

    const intFields = [
      "top_count", "post_day", "post_hour", "post_minute",
      "embed_color", "min_threshold", "dm_stagger_seconds", "max_coins_per_user",
    ]
    for (const f of intFields) {
      if (updates[f] !== undefined) data[f] = updates[f]
    }

    if (updates.top1_roles !== undefined) data.top1_roles = updates.top1_roles
    if (updates.topn_roles !== undefined) data.topn_roles = updates.topn_roles

    const bigintFields = ["post_channel", "mod_log_channel"]
    for (const f of bigintFields) {
      if (updates[f] !== undefined) {
        data[f] = updates[f] ? parseBigInt(updates[f], f) : null
      }
    }

    if (updates.reward_tiers !== undefined) data.reward_tiers = updates.reward_tiers
    if (updates.embed_fields !== undefined) data.embed_fields = updates.embed_fields

    const updated = await prisma.leaderboard_autopost_config.update({
      where: { configid: existing.configid },
      data,
    })

    return res.status(200).json(serializeConfig(updated))
  },

  async DELETE(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const configid = parseInt(req.query.configid as string || req.body?.configid, 10)
    if (!configid || isNaN(configid)) {
      throw new ValidationError("configid is required")
    }

    const existing = await prisma.leaderboard_autopost_config.findFirst({
      where: { configid, guildid: guildId },
    })
    if (!existing) {
      throw new ValidationError("Config not found", 404)
    }

    await prisma.leaderboard_autopost_config.delete({
      where: { configid },
    })

    return res.status(200).json({ deleted: true })
  },
})
