// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Voice Time Editor admin API - GET/PATCH config + premium status
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

async function isPremiumGuild(guildId: bigint): Promise<boolean> {
  const row = await prisma.premium_guilds.findUnique({
    where: { guildid: guildId },
    select: { premium_until: true },
  })
  return !!row && row.premium_until > new Date()
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "server ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const [config, premium, usageThisMonth] = await Promise.all([
      prisma.guild_config.findUnique({
        where: { guildid: guildId },
        select: {
          manual_sessions_enabled: true,
          manual_sessions_limit: true,
          manual_sessions_until: true,
        },
      }),
      isPremiumGuild(guildId),
      prisma.manual_session_log.count({
        where: {
          guildid: guildId,
          created_at: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          action: { in: ["ADD", "EDIT"] },
        },
      }),
    ])

    return res.status(200).json({
      isPremium: premium,
      config: {
        manual_sessions_enabled: config?.manual_sessions_enabled ?? false,
        manual_sessions_limit: config?.manual_sessions_limit ?? 5,
        manual_sessions_until: config?.manual_sessions_until?.toISOString() ?? null,
      },
      stats: {
        totalEditsThisMonth: usageThisMonth,
      },
    })
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "server ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (!(await isPremiumGuild(guildId))) {
      return res.status(403).json({ error: "Voice Time Editor requires a premium subscription" })
    }

    const { manual_sessions_enabled, manual_sessions_limit, manual_sessions_until } = req.body
    const updates: Record<string, any> = {}

    if (typeof manual_sessions_enabled === "boolean") {
      updates.manual_sessions_enabled = manual_sessions_enabled
    }
    if (manual_sessions_limit !== undefined) {
      const limit = parseInt(manual_sessions_limit)
      if (isNaN(limit) || limit < 1 || limit > 50) {
        return res.status(400).json({ error: "Monthly limit must be between 1 and 50" })
      }
      updates.manual_sessions_limit = limit
    }
    if (manual_sessions_until !== undefined) {
      updates.manual_sessions_until = manual_sessions_until ? new Date(manual_sessions_until) : null
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    await prisma.guild_config.update({
      where: { guildid: guildId },
      data: updates,
    })

    return res.status(200).json({ success: true })
  },
})
