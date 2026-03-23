// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Returns all server premium subscriptions owned by
//          the authenticated user (both paid and LionHeart++
//          included), with transfer cooldown info.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

const TRANSFER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userIdBig = BigInt(auth.discordId)

    const [paidSubs, lhGrant, userSub] = await Promise.all([
      prisma.server_premium_subscriptions.findMany({
        where: { userid: userIdBig },
        orderBy: { created_at: "desc" },
      }),
      prisma.lionheart_server_premium.findUnique({
        where: { userid: userIdBig },
      }),
      prisma.user_subscriptions.findUnique({
        where: { userid: userIdBig },
        select: { tier: true, status: true, current_period_end: true },
      }),
    ])

    const isLhPlusPlus =
      userSub?.tier === "LIONHEART_PLUS_PLUS" &&
      (userSub.status === "ACTIVE" || userSub.status === "CANCELLING")

    const now = new Date()

    let lhTransferCooldownEnds: string | null = null
    if (lhGrant?.last_transferred_at) {
      const cd = new Date(lhGrant.last_transferred_at.getTime() + TRANSFER_COOLDOWN_MS)
      if (cd > now) lhTransferCooldownEnds = cd.toISOString()
    }

    const paidSubscriptions = paidSubs.map((s) => {
      let transferCooldownEnds: string | null = null
      if (s.transferred_at) {
        const cd = new Date(s.transferred_at.getTime() + TRANSFER_COOLDOWN_MS)
        if (cd > now) transferCooldownEnds = cd.toISOString()
      }
      return {
        id: s.id,
        guildId: s.guildid.toString(),
        plan: s.plan,
        status: s.status,
        currentPeriodStart: s.current_period_start?.toISOString() ?? null,
        currentPeriodEnd: s.current_period_end?.toISOString() ?? null,
        createdAt: s.created_at?.toISOString() ?? null,
        transferredAt: s.transferred_at?.toISOString() ?? null,
        transferCooldownEnds,
      }
    })

    const lionheartServerPremium = isLhPlusPlus
      ? {
          guildId: lhGrant?.guildid?.toString() ?? null,
          isApplied: lhGrant?.guildid != null,
          lastTransferredAt: lhGrant?.last_transferred_at?.toISOString() ?? null,
          transferCooldownEnds: lhTransferCooldownEnds,
          premiumUntil: userSub.current_period_end?.toISOString() ?? null,
        }
      : null

    const canApplyLionheart =
      isLhPlusPlus && (!lhGrant?.guildid || !lhTransferCooldownEnds)

    return res.status(200).json({
      paidSubscriptions,
      lionheartServerPremium,
      canApplyLionheart,
    })
  } catch (err: unknown) {
    console.error("My server premiums error:", err)
    return res.status(500).json({ error: "Failed to fetch server premiums" })
  }
}
