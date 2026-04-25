// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: GET / PATCH the signed-in user's email preferences.
//          Backs the Email Notifications card on /dashboard/settings.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { getDiscordId, unauthorized } from "@/utils/dashboardAuth"
import { apiHandler } from "@/utils/apiHandler"
import { PREF_DESCRIPTIONS, type EmailPrefKey } from "@/utils/email/brand"
import { isEmailSendingEnabled } from "@/utils/email/send"

const PREF_KEYS: EmailPrefKey[] = [
  "email_pref_welcome",
  "email_pref_weekly_digest",
  "email_pref_lifecycle",
  "email_pref_announcements",
  "email_pref_premium",
]

export default apiHandler({
  async GET(req, res) {
    const discordId = await getDiscordId(req)
    if (!discordId) return unauthorized(res)
    const userid = BigInt(discordId)

    const row = await prisma.user_config.findUnique({
      where: { userid },
      select: {
        email: true,
        email_verified: true,
        email_unsubscribed_all: true,
        email_pref_welcome: true,
        email_pref_weekly_digest: true,
        email_pref_lifecycle: true,
        email_pref_announcements: true,
        email_pref_premium: true,
      },
    })

    return res.status(200).json({
      email: row?.email ?? null,
      emailVerified: row?.email_verified ?? null,
      unsubscribedAll: row?.email_unsubscribed_all ?? false,
      preferences: PREF_KEYS.reduce((acc, key) => {
        acc[key] = (row?.[key] as boolean | undefined) ?? true
        return acc
      }, {} as Record<EmailPrefKey, boolean>),
      descriptions: PREF_DESCRIPTIONS,
      // When false, the dashboard renders an honest banner so users
      // understand that their saved preferences will only take effect
      // once we turn email on for real.
      sendingEnabled: isEmailSendingEnabled(),
    })
  },

  async PATCH(req, res) {
    const discordId = await getDiscordId(req)
    if (!discordId) return unauthorized(res)
    const userid = BigInt(discordId)

    const body = (req.body ?? {}) as Record<string, unknown>
    const update: Partial<Record<EmailPrefKey | "email_unsubscribed_all", boolean>> = {}

    for (const key of PREF_KEYS) {
      if (typeof body[key] === "boolean") update[key] = body[key] as boolean
    }
    if (typeof body.unsubscribedAll === "boolean") {
      update.email_unsubscribed_all = body.unsubscribedAll as boolean
      // Hitting "Unsubscribe from all" should also flip every category
      // off so the UI does not show enabled categories with the master
      // switch off (which would be misleading).
      if (body.unsubscribedAll === true) {
        for (const key of PREF_KEYS) update[key] = false
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No preferences provided" })
    }

    // Use upsert so a user without a row yet still gets one created
    // (defensive — the signIn event normally creates it first).
    const row = await prisma.user_config.upsert({
      where: { userid },
      update,
      create: { userid, ...update },
      select: {
        email_unsubscribed_all: true,
        email_pref_welcome: true,
        email_pref_weekly_digest: true,
        email_pref_lifecycle: true,
        email_pref_announcements: true,
        email_pref_premium: true,
      },
    })

    return res.status(200).json({
      ok: true,
      unsubscribedAll: row.email_unsubscribed_all,
      preferences: PREF_KEYS.reduce((acc, key) => {
        acc[key] = row[key]
        return acc
      }, {} as Record<EmailPrefKey, boolean>),
    })
  },
})
