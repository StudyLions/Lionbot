// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Shared utilities for server premium management --
//          recalculating guild premium_until from all sources
//          (paid subscriptions + LionHeart++ grants).
// ============================================================
import { prisma } from "@/utils/prisma"

/**
 * Recalculates premium_guilds.premium_until for a guild by checking all
 * active premium sources (paid server premium subscriptions and
 * LionHeart++ included grants). Sets premium_until to the latest
 * expiry among all sources, or to NOW() if no active sources remain.
 */
export async function recalculateGuildPremium(
  guildId: bigint,
  tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<void> {
  const db = tx || prisma

  const [paidSubs, lhGrant] = await Promise.all([
    db.server_premium_subscriptions.findMany({
      where: {
        guildid: guildId,
        status: { in: ["ACTIVE", "CANCELLING"] },
      },
      select: { current_period_end: true },
    }),
    db.lionheart_server_premium.findFirst({
      where: { guildid: guildId },
      select: { userid: true },
    }),
  ])

  let latestExpiry: Date | null = null

  for (const sub of paidSubs) {
    if (sub.current_period_end && (!latestExpiry || sub.current_period_end > latestExpiry)) {
      latestExpiry = sub.current_period_end
    }
  }

  if (lhGrant) {
    const userSub = await db.user_subscriptions.findUnique({
      where: { userid: lhGrant.userid },
      select: { tier: true, status: true, current_period_end: true },
    })
    if (
      userSub &&
      userSub.tier === "LIONHEART_PLUS_PLUS" &&
      (userSub.status === "ACTIVE" || userSub.status === "CANCELLING") &&
      userSub.current_period_end
    ) {
      if (!latestExpiry || userSub.current_period_end > latestExpiry) {
        latestExpiry = userSub.current_period_end
      }
    }
  }

  const existing = await db.premium_guilds.findUnique({
    where: { guildid: guildId },
  })

  if (!existing && latestExpiry) {
    await db.premium_guilds.create({
      data: {
        guildid: guildId,
        premium_since: new Date(),
        premium_until: latestExpiry,
      },
    })
  } else if (existing) {
    await db.premium_guilds.update({
      where: { guildid: guildId },
      data: { premium_until: latestExpiry || new Date() },
    })
  }
}
