// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Recipient-side claim endpoint for a LionHeart user gift.
//          Validates the claim token, ensures the claimant doesn't
//          already have an active LionHeart subscription, then:
//            (1) marks lionheart_gifts ACTIVE, links to recipient
//            (2) upserts a user_subscriptions row for recipient
//                with the SENDER's stripe_customer / stripe_subscription
//                IDs so monthly renewals route to the right gift row
//                in the webhook
//            (3) for LIONHEART_PLUS_PLUS, creates an empty
//                lionheart_server_premium slot the recipient can apply
//                later (existing flow handles the apply step)
//            (4) credits the immediate monthly gem allowance so the
//                recipient sees the perks the moment they claim
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

const MONTHLY_GEM_ALLOWANCE: Record<string, number> = {
  LIONHEART: 500,
  LIONHEART_PLUS: 1200,
  LIONHEART_PLUS_PLUS: 3000,
}

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

    const { token } = req.body ?? {}
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Claim token is required" })
    }

    const gift = await prisma.lionheart_gifts.findUnique({
      where: { claim_token: token },
    })

    if (!gift) {
      return res.status(404).json({
        error: "We couldn't find that gift. The link may be wrong.",
        code: "NOT_FOUND",
      })
    }

    if (gift.status !== "PENDING_CLAIM") {
      return res.status(409).json({
        error:
          gift.status === "EXPIRED"
            ? "This gift link has expired."
            : gift.claimed_at
            ? "This gift has already been claimed."
            : "This gift is no longer available.",
        code: gift.status,
      })
    }

    if (gift.claim_expires_at < new Date()) {
      return res.status(409).json({
        error: "This gift link has expired.",
        code: "EXPIRED",
      })
    }

    const claimantIdBig = BigInt(auth.discordId)

    if (gift.sender_userid === claimantIdBig) {
      return res.status(400).json({
        error: "This is your own gift. Share the link with someone else.",
        code: "SELF_CLAIM",
      })
    }

    // Reject if claimant already has an active LionHeart subscription. They
    // can come back when their current sub ends. The gift stays PENDING_CLAIM
    // and can be claimed later (within 30 days) or by someone else if the
    // sender forwards the link.
    const existingSub = await prisma.user_subscriptions.findUnique({
      where: { userid: claimantIdBig },
    })
    if (
      existingSub &&
      existingSub.tier !== "NONE" &&
      (existingSub.status === "ACTIVE" || existingSub.status === "CANCELLING")
    ) {
      return res.status(409).json({
        error: `You already have an active ${existingSub.tier} subscription. Forward this link to a friend, or hold onto it until your current subscription ends.`,
        code: "ALREADY_SUBSCRIBED",
      })
    }

    const periodEnd = gift.current_period_end ?? new Date(Date.now() + 30 * 86400000)
    const gemAmount = MONTHLY_GEM_ALLOWANCE[gift.tier] || 0

    await prisma.$transaction(async (tx) => {
      // 1. Mark the gift claimed
      await tx.lionheart_gifts.update({
        where: { id: gift.id },
        data: {
          recipient_userid: claimantIdBig,
          claimed_at: new Date(),
          status: "ACTIVE",
          updated_at: new Date(),
        },
      })

      // 2. Upsert recipient's user_subscriptions, linked to sender's Stripe IDs
      await tx.user_subscriptions.upsert({
        where: { userid: claimantIdBig },
        create: {
          userid: claimantIdBig,
          stripe_customer_id: gift.stripe_customer_id,
          stripe_subscription_id: gift.stripe_subscription_id,
          tier: gift.tier,
          status: "ACTIVE",
          current_period_end: periodEnd,
        },
        update: {
          stripe_customer_id: gift.stripe_customer_id,
          stripe_subscription_id: gift.stripe_subscription_id,
          tier: gift.tier,
          status: "ACTIVE",
          current_period_end: periodEnd,
          updated_at: new Date(),
        },
      })

      // 3. LIONHEART_PLUS_PLUS gets an empty server-premium slot to apply later
      if (gift.tier === "LIONHEART_PLUS_PLUS") {
        const existingGrant = await tx.lionheart_server_premium.findUnique({
          where: { userid: claimantIdBig },
        })
        if (!existingGrant) {
          await tx.lionheart_server_premium.create({
            data: { userid: claimantIdBig, guildid: null },
          })
        }
      }

      // 4. Credit immediate gem allowance (idempotent on reference)
      if (gemAmount > 0) {
        const reference = `gift_claim_gems_${gift.id}`
        const existingTx = await tx.gem_transactions.findFirst({
          where: { reference },
        })
        if (!existingTx) {
          await tx.user_config.upsert({
            where: { userid: claimantIdBig },
            create: { userid: claimantIdBig, gems: 0 },
            update: {},
          })

          await tx.$executeRaw`
            UPDATE user_config
            SET gems = COALESCE(gems, 0) + ${gemAmount}
            WHERE userid = ${claimantIdBig}
          `

          await tx.gem_transactions.create({
            data: {
              transaction_type: "AUTOMATIC",
              actorid: claimantIdBig,
              from_account: null,
              to_account: claimantIdBig,
              amount: gemAmount,
              description: `LionHeart gift claim: ${gemAmount} LionGems (${gift.tier})`,
              reference,
              note: `Gift id ${gift.id} from user ${gift.sender_userid}`,
            },
          })
        }
      }
    })

    console.log(
      `Gift claim: user ${auth.discordId} claimed gift id=${gift.id} (tier ${gift.tier}) from sender ${gift.sender_userid}`
    )

    return res.status(200).json({
      success: true,
      tier: gift.tier,
      currentPeriodEnd: periodEnd.toISOString(),
      isAnonymous: gift.gift_is_anonymous,
      senderUserid: gift.gift_is_anonymous ? null : gift.sender_userid.toString(),
      message: gift.gift_message,
      gemsCredited: gemAmount,
    })
  } catch (err: unknown) {
    console.error("Gift LionHeart claim error:", err)
    return res.status(500).json({ error: "Failed to claim gift" })
  }
}
