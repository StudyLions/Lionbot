// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: GET/PATCH endpoint for user focus timer theme preferences.
//          Validates theme access against the user's LionHeart tier.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { getDiscordId, unauthorized } from "@/utils/dashboardAuth"
import { canAccessTheme, userTierFromSub, TIMER_THEMES } from "@/constants/TimerThemes"

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
    })
  }

  if (req.method === "PATCH") {
    const { theme } = req.body
    if (!theme || typeof theme !== "string" || !TIMER_THEMES[theme]) {
      return res.status(400).json({ error: "Invalid theme" })
    }

    const sub = await prisma.user_subscriptions.findUnique({ where: { userid: uid } })
    const subTier = sub?.status === "ACTIVE" ? sub.tier : "NONE"
    const themeTier = userTierFromSub(subTier)

    if (!canAccessTheme(theme, themeTier)) {
      return res.status(403).json({ error: "Your subscription tier does not include this theme" })
    }

    await prisma.user_timer_preferences.upsert({
      where: { userid: uid },
      update: { theme, updated_at: new Date() },
      create: { userid: uid, theme },
    })

    return res.status(200).json({ success: true, theme })
  }

  res.setHeader("Allow", "GET, PATCH")
  return res.status(405).json({ error: "Method not allowed" })
}
