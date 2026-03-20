// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Modified: 2026-03-20
// Purpose: GET/PATCH endpoint for user focus timer preferences.
//          Validates theme access against the user's LionHeart tier.
//          Expanded for custom accent color and custom stage labels.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { getDiscordId, unauthorized } from "@/utils/dashboardAuth"
import { canAccessTheme, userTierFromSub, TIMER_THEMES } from "@/constants/TimerThemes"
import { isValidHexColor } from "@/constants/CardEffectPresets"

const MAX_LABEL_LEN = 20

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const discordId = await getDiscordId(req)
  if (!discordId) return unauthorized(res)

  const uid = BigInt(discordId)

  if (req.method === "GET") {
    const [prefs, sub] = await Promise.all([
      prisma.user_timer_preferences.findUnique({ where: { userid: uid } }),
      prisma.user_subscriptions.findUnique({ where: { userid: uid } }),
    ])

    const subTier = sub?.status === "ACTIVE" ? sub.tier : "NONE"
    const themeTier = userTierFromSub(subTier)
    const savedTheme = prefs?.theme ?? "classic"
    const effectiveTheme = canAccessTheme(savedTheme, themeTier) ? savedTheme : "classic"

    return res.status(200).json({
      theme: effectiveTheme,
      savedTheme,
      tier: subTier,
      themeTier,
      custom_accent_color: prefs?.custom_accent_color ?? null,
      focus_label: prefs?.focus_label ?? null,
      break_label: prefs?.break_label ?? null,
      session_label: prefs?.session_label ?? null,
    })
  }

  if (req.method === "PATCH") {
    const { theme, custom_accent_color, focus_label, break_label, session_label } = req.body

    const sub = await prisma.user_subscriptions.findUnique({ where: { userid: uid } })
    const subTier = sub?.status === "ACTIVE" ? sub.tier : "NONE"
    const themeTier = userTierFromSub(subTier)

    if (themeTier === "FREE") {
      return res.status(403).json({ error: "LionHeart subscription required" })
    }

    const data: Record<string, unknown> = { updated_at: new Date() }

    if (theme !== undefined) {
      if (!theme || typeof theme !== "string" || !TIMER_THEMES[theme]) {
        return res.status(400).json({ error: "Invalid theme" })
      }
      if (!canAccessTheme(theme, themeTier)) {
        return res.status(403).json({ error: "Your subscription tier does not include this theme" })
      }
      data.theme = theme
    }

    if (custom_accent_color !== undefined) {
      if (custom_accent_color !== null && !isValidHexColor(custom_accent_color)) {
        return res.status(400).json({ error: "Invalid accent color" })
      }
      data.custom_accent_color = custom_accent_color || null
    }

    for (const [key, val] of Object.entries({ focus_label, break_label, session_label })) {
      if (val !== undefined) {
        if (val !== null && (typeof val !== "string" || val.length > MAX_LABEL_LEN)) {
          return res.status(400).json({ error: `${key} must be ${MAX_LABEL_LEN} characters or fewer` })
        }
        data[key] = val ? val.slice(0, MAX_LABEL_LEN) : null
      }
    }

    await prisma.user_timer_preferences.upsert({
      where: { userid: uid },
      update: data,
      create: { userid: uid, ...data },
    })

    return res.status(200).json({ success: true })
  }

  res.setHeader("Allow", "GET, PATCH")
  return res.status(405).json({ error: "Method not allowed" })
}
