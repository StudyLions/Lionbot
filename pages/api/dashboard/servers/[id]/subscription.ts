// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: GET server premium subscription status for a guild.
//          Returns plan, status, period dates, and who is paying.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Use findFirst with status filter (PK changed from guildid to auto-increment id)
    const [sub, premiumGuild] = await Promise.all([
      prisma.server_premium_subscriptions.findFirst({
        where: { guildid: guildId, status: { in: ["ACTIVE", "CANCELLING", "PAST_DUE"] } },
      }),
    // --- END AI-MODIFIED ---
      prisma.premium_guilds.findUnique({
        where: { guildid: guildId },
        select: { premium_since: true, premium_until: true },
      }),
    ])

    const now = new Date()
    const isPremium = !!premiumGuild && premiumGuild.premium_until > now

    if (!sub) {
      return res.status(200).json({
        hasSubscription: false,
        isPremium,
        premiumUntil: premiumGuild?.premium_until?.toISOString() ?? null,
        subscription: null,
      })
    }

    return res.status(200).json({
      hasSubscription: true,
      isPremium,
      premiumUntil: premiumGuild?.premium_until?.toISOString() ?? null,
      subscription: {
        plan: sub.plan,
        status: sub.status,
        payerId: sub.userid.toString(),
        isCurrentUser: sub.userid.toString() === auth.discordId,
        currentPeriodStart: sub.current_period_start?.toISOString() ?? null,
        currentPeriodEnd: sub.current_period_end?.toISOString() ?? null,
        createdAt: sub.created_at?.toISOString() ?? null,
      },
    })
  },
})
