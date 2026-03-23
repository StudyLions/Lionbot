// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Transfer a paid server premium subscription from one
//          guild to another. Enforces 7-day cooldown, ownership
//          check, and ensures the target guild doesn't already
//          have an active subscription.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { requireAuth, requireAdmin } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"
import { recalculateGuildPremium } from "@/utils/premiumUtils"

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
})

const TRANSFER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { subscriptionId, newGuildId } = req.body ?? {}

    if (!subscriptionId || typeof subscriptionId !== "number") {
      return res.status(400).json({ error: "subscriptionId (number) is required" })
    }
    if (!newGuildId || typeof newGuildId !== "string") {
      return res.status(400).json({ error: "newGuildId is required" })
    }

    let newGuildIdBig: bigint
    try {
      newGuildIdBig = BigInt(newGuildId)
    } catch {
      return res.status(400).json({ error: "Invalid newGuildId format" })
    }

    const adminAuth = await requireAdmin(req, res, newGuildIdBig)
    if (!adminAuth) return

    const sub = await prisma.server_premium_subscriptions.findUnique({
      where: { id: subscriptionId },
    })

    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" })
    }

    if (sub.userid.toString() !== auth.discordId) {
      return res.status(403).json({ error: "You do not own this subscription" })
    }

    if (sub.status !== "ACTIVE" && sub.status !== "CANCELLING") {
      return res.status(400).json({
        error: "Only active or cancelling subscriptions can be transferred",
      })
    }

    if (sub.guildid === newGuildIdBig) {
      return res.status(400).json({ error: "Subscription is already on this server" })
    }

    if (sub.transferred_at) {
      const cooldownEnd = new Date(sub.transferred_at.getTime() + TRANSFER_COOLDOWN_MS)
      if (new Date() < cooldownEnd) {
        return res.status(429).json({
          error: "Transfer cooldown active. You can transfer again after the cooldown period.",
          cooldownEnds: cooldownEnd.toISOString(),
        })
      }
    }

    const existingOnTarget = await prisma.server_premium_subscriptions.findFirst({
      where: {
        guildid: newGuildIdBig,
        status: { in: ["ACTIVE", "CANCELLING", "PAST_DUE"] },
      },
    })
    if (existingOnTarget) {
      return res.status(409).json({
        error: "Target server already has an active premium subscription",
        code: "TARGET_ALREADY_PREMIUM",
      })
    }

    const oldGuildId = sub.guildid

    await prisma.$transaction(async (tx) => {
      await tx.server_premium_subscriptions.update({
        where: { id: sub.id },
        data: {
          guildid: newGuildIdBig,
          transferred_at: new Date(),
          updated_at: new Date(),
        },
      })

      await recalculateGuildPremium(oldGuildId, tx)

      const periodEnd = sub.current_period_end || new Date(Date.now() + 30 * 86400000)
      const existingTarget = await tx.premium_guilds.findUnique({
        where: { guildid: newGuildIdBig },
      })
      if (existingTarget) {
        const newUntil = existingTarget.premium_until > periodEnd
          ? existingTarget.premium_until
          : periodEnd
        await tx.premium_guilds.update({
          where: { guildid: newGuildIdBig },
          data: { premium_until: newUntil },
        })
      } else {
        await tx.premium_guilds.create({
          data: {
            guildid: newGuildIdBig,
            premium_since: new Date(),
            premium_until: periodEnd,
          },
        })
      }
    })

    if (sub.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          metadata: { guildId: newGuildId },
        })
      } catch (err) {
        console.error("Failed to update Stripe metadata for transfer:", err)
      }
    }

    console.log(
      `Server premium transferred: sub ${sub.id} from guild ${oldGuildId} to ${newGuildId} by user ${auth.discordId}`
    )

    return res.status(200).json({
      success: true,
      oldGuildId: oldGuildId.toString(),
      newGuildId,
    })
  } catch (err: unknown) {
    console.error("Server premium transfer error:", err)
    return res.status(500).json({ error: "Failed to transfer server premium" })
  }
}
