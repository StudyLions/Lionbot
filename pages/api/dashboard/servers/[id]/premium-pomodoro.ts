// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-18
// Purpose: Premium pomodoro configuration API - CRUD for premium
//          timer settings (themes, auto-role, session summaries, etc.)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

const THEMES = [
  "default", "neon", "forest", "ocean", "sunset",
  "midnight", "sakura", "retro", "minimal", "seasonal",
] as const

function serializeConfig(c: any) {
  return {
    guildid: c.guildid.toString(),
    focus_roleid: c.focus_roleid?.toString() ?? null,
    session_summary: c.session_summary,
    animated_timer: c.animated_timer,
    timer_theme: c.timer_theme ?? "default",
    group_goal_hours: c.group_goal_hours,
    coin_multiplier: c.coin_multiplier,
    golden_hour_start: c.golden_hour_start?.toISOString() ?? null,
    golden_hour_end: c.golden_hour_end?.toISOString() ?? null,
  }
}

async function isPremiumGuild(guildId: bigint): Promise<boolean> {
  const row = await prisma.premium_guilds.findUnique({
    where: { guildid: guildId },
    select: { premium_until: true },
  })
  return !!row && row.premium_until > new Date()
}

export default apiHandler({
  async GET(req, res) {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: validate guild id from query via parseBigInt (400 on invalid)
    const guildId = parseBigInt(req.query.id, "id")
    // --- END AI-MODIFIED ---
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const [config, premium] = await Promise.all([
      prisma.premium_pomodoro_config.findUnique({ where: { guildid: guildId } }),
      isPremiumGuild(guildId),
    ])

    return res.status(200).json({
      config: config ? serializeConfig(config) : null,
      isPremium: premium,
      themes: [...THEMES],
    })
  },

  async PATCH(req, res) {
    // --- AI-MODIFIED (2026-03-20) ---
    const guildId = parseBigInt(req.query.id, "id")
    // --- END AI-MODIFIED ---
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const premium = await isPremiumGuild(guildId)
    if (!premium) {
      return res.status(403).json({ error: "Premium subscription required" })
    }

    const {
      focus_roleid,
      session_summary,
      animated_timer,
      timer_theme,
      group_goal_hours,
      coin_multiplier,
      golden_hour_start,
      golden_hour_end,
    } = req.body

    const data: Record<string, unknown> = {}

    if ("focus_roleid" in req.body) {
      // --- AI-MODIFIED (2026-03-20) ---
      // Purpose: validate focus_roleid from body via parseBigInt when set
      data.focus_roleid = focus_roleid === null || focus_roleid === ""
        ? null
        : parseBigInt(focus_roleid, "focus_roleid")
      // --- END AI-MODIFIED ---
    }

    if ("session_summary" in req.body) {
      data.session_summary = !!session_summary
    }

    if ("animated_timer" in req.body) {
      data.animated_timer = !!animated_timer
    }

    if ("timer_theme" in req.body) {
      if (timer_theme !== null && !(THEMES as readonly string[]).includes(timer_theme)) {
        return res.status(400).json({
          error: `Invalid theme. Must be one of: ${THEMES.join(", ")}`,
        })
      }
      data.timer_theme = timer_theme ?? "default"
    }

    if ("group_goal_hours" in req.body) {
      if (group_goal_hours === null) {
        data.group_goal_hours = null
      } else {
        const num = typeof group_goal_hours === "number"
          ? group_goal_hours
          : parseInt(String(group_goal_hours), 10)
        if (isNaN(num) || num < 1) {
          return res.status(400).json({ error: "group_goal_hours must be a positive integer" })
        }
        data.group_goal_hours = num
      }
    }

    if ("coin_multiplier" in req.body) {
      data.coin_multiplier = !!coin_multiplier
    }

    if ("golden_hour_start" in req.body) {
      data.golden_hour_start = golden_hour_start ? new Date(golden_hour_start) : null
    }

    if ("golden_hour_end" in req.body) {
      data.golden_hour_end = golden_hour_end ? new Date(golden_hour_end) : null
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    const updated = await prisma.premium_pomodoro_config.upsert({
      where: { guildid: guildId },
      create: { guildid: guildId, ...data },
      update: data,
    })

    return res.status(200).json({ success: true, config: serializeConfig(updated) })
  },
})
