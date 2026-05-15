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
import * as React from "react"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"
import { notifyUser } from "@/utils/notifyQueue"
import { sendEmail } from "@/utils/email/send"
import GiftReceived from "../../../emails/GiftReceived"

const TIER_PERK_LINE: Record<string, { label: string; perks: string }> = {
  LIONHEART: {
    label: "LionHeart",
    perks: "500 LionGems per month, faster pet growth, double voice coins.",
  },
  LIONHEART_PLUS: {
    label: "LionHeart+",
    perks: "1,200 LionGems per month, bigger farm boosts, longer water duration.",
  },
  LIONHEART_PLUS_PLUS: {
    label: "LionHeart++",
    perks: "3,000 LionGems per month and a free Server Premium slot of your choice.",
  },
}

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

    // --- AI-MODIFIED (2026-05-15 v2) ---
    // Purpose: Race-safe claim. The previous version did an unconditional
    // update inside the transaction, which would silently succeed twice if
    // two parallel requests both passed the PENDING_CLAIM check above. Use
    // updateMany with a status filter so the database itself enforces the
    // single-claim invariant -- count=0 means another request beat us to it.
    const claimed = await prisma.lionheart_gifts.updateMany({
      where: { id: gift.id, status: "PENDING_CLAIM" },
      data: {
        recipient_userid: claimantIdBig,
        claimed_at: new Date(),
        status: "ACTIVE",
        updated_at: new Date(),
      },
    })
    if (claimed.count === 0) {
      return res.status(409).json({
        error: "This gift was just claimed by someone else.",
        code: "RACE_LOST",
      })
    }
    // --- END AI-MODIFIED ---

    await prisma.$transaction(async (tx) => {
      // 1. (Gift row already moved to ACTIVE above.)

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

    // Notify sender that their gift was claimed (always, even if recipient is
    // anonymous on the sender side -- the sender knows whose link they sent).
    await notifyUser({
      userId: gift.sender_userid,
      payload: {
        category: "lionheart_gift_claimed_sender_ack",
        title: "Your gift was claimed",
        body: `<@${auth.discordId}> claimed the ${gift.tier.replace(/_/g, " ")} you gifted. Their perks are live now.`,
        link_url: "/dashboard/gifts",
        link_label: "View your gifts",
        context: {
          giftId: gift.id,
          recipientUserId: auth.discordId,
        },
      },
      dedupKey: `lh_gift_claimed_sender:${gift.id}`,
    })

    // Welcome the recipient via DM (mirrors the success-page experience they
    // just saw in-browser, plus a persistent message they can scroll back to).
    await notifyUser({
      userId: claimantIdBig,
      payload: {
        category: "lionheart_gift_claimed_by_recipient",
        title: "Premium activated",
        body:
          (gift.gift_is_anonymous
            ? "Someone gifted you"
            : `<@${gift.sender_userid}> gifted you`) +
          ` ${gift.tier.replace(/_/g, " ")} on LionBot. Perks are live across every server.${
            gemAmount > 0 ? ` ${gemAmount.toLocaleString()} LionGems just landed in your wallet.` : ""
          }`,
        link_url: "/dashboard",
        link_label: "Open dashboard",
      },
      dedupKey: `lh_gift_claimed_recipient_welcome:${gift.id}`,
    })

    // Email the recipient (fire-and-forget; sendEmail handles pref + kill-switch).
    const tierMeta = TIER_PERK_LINE[gift.tier] ?? { label: gift.tier, perks: "" }
    let senderDisplayName: string | null = null
    if (!gift.gift_is_anonymous) {
      const senderMember = await prisma.members.findFirst({
        where: { userid: gift.sender_userid, display_name: { not: null } },
        select: { display_name: true },
        orderBy: { first_joined: "desc" },
      })
      senderDisplayName = senderMember?.display_name ?? null
    }
    sendEmail({
      userid: claimantIdBig,
      template: "gift_received",
      subject: gift.gift_is_anonymous
        ? `You received ${tierMeta.label}`
        : `${senderDisplayName ?? "A friend"} gifted you ${tierMeta.label}`,
      react: React.createElement(GiftReceived, {
        kind: "lionheart_user",
        tierLabel: tierMeta.label,
        perkLine: tierMeta.perks,
        senderDisplayName,
        isAnonymous: gift.gift_is_anonymous,
        giftMessage: gift.gift_message,
        ctaHref: `${process.env.NEXTAUTH_URL || "https://lionbot.org"}/dashboard`,
        ctaLabel: "Open dashboard",
      }),
    }).catch((err) => {
      console.warn("gift-claim: sendEmail failed (non-fatal):", err)
    })

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
