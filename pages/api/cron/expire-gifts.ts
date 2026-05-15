// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Vercel Cron entrypoint that expires un-claimed LionHeart
//          user gifts.
//
//          A gift stays PENDING_CLAIM after the sender pays until
//          either: (a) the recipient clicks the claim link and signs
//          in, promoting the row to ACTIVE; or (b) 30 days pass with
//          no claim, at which point this cron runs the cleanup:
//            - cancels the Stripe subscription (Stripe automatically
//              prorates a refund for the unused period)
//            - marks the row EXPIRED
//            - logs to the Stripe audit channel
//
//          Schedule: daily at 03:00 UTC (`0 3 * * *`). Bounded work --
//          we only scan rows where status=PENDING_CLAIM AND
//          claim_expires_at < now, which is covered by the partial
//          index `lionheart_gifts_expiry_sweep`.
//
//          Manual smoke-test:
//              curl -H "Authorization: Bearer $CRON_SECRET" \
//                https://lionbot.org/api/cron/expire-gifts
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { prisma } from "@/utils/prisma"
import { sendStripeAuditLog } from "@/utils/discordAudit"
import { notifyUser } from "@/utils/notifyQueue"
// Note: GiftExpiringSoon email template is built but not wired here yet.
// The plan is to add separate T-7d / T-1d "expiring soon" reminders via a
// future cron tick that finds rows with claim_expires_at IN the warning
// window. For now, the Discord DM coverage on actual expiry is enough.

export const config = { maxDuration: 60 }

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
})

function isAuthorized(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.authorization
  if (header && header === `Bearer ${secret}`) return true
  if (typeof req.query.secret === "string" && req.query.secret === secret) return true
  return false
}

interface CronOutcome {
  ok: true
  scanned: number
  expired: number
  failed: number
  elapsedMs: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CronOutcome | { error: string }>,
) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const startedAt = Date.now()
  const now = new Date()

  const expired = await prisma.lionheart_gifts.findMany({
    where: {
      status: "PENDING_CLAIM",
      claim_expires_at: { lt: now },
    },
    select: {
      id: true,
      sender_userid: true,
      tier: true,
      stripe_subscription_id: true,
      claim_token: true,
    },
  })

  let expiredCount = 0
  let failedCount = 0

  for (const gift of expired) {
    try {
      // --- AI-MODIFIED (2026-05-15 v2) ---
      // Purpose: A row can have an empty stripe_subscription_id when the
      // sender clicked "Continue to checkout" (which pre-creates the row)
      // but then closed the Stripe Checkout page without paying. No Stripe
      // subscription exists to cancel, but the row still needs to be marked
      // EXPIRED so it doesn't sit in PENDING_CLAIM forever and so the
      // expiry-sweep index stays small. Skip the Stripe API call, just
      // mark the row.
      if (!gift.stripe_subscription_id || gift.stripe_subscription_id === "") {
        await prisma.lionheart_gifts.update({
          where: { id: gift.id },
          data: { status: "EXPIRED", updated_at: new Date() },
        })
        console.log(`expire-gifts: gift ${gift.id} abandoned at checkout, marked EXPIRED (no Stripe sub to cancel)`)
        expiredCount++
        continue
      }
      // --- END AI-MODIFIED ---

      // Cancel immediately. Stripe prorates the unused portion of the period.
      // `del` is the canonical method name on the 2020-08-27 SDK surface
      // (newer SDKs alias it as `cancel`); same behaviour either way.
      await stripe.subscriptions.del(gift.stripe_subscription_id)

      await prisma.lionheart_gifts.update({
        where: { id: gift.id },
        data: {
          status: "EXPIRED",
          updated_at: new Date(),
        },
      })

      sendStripeAuditLog({
        eventType: "customer.subscription.deleted",
        title: "LionHeart Gift Expired",
        description: `Gift id \`${gift.id}\` (sender <@${gift.sender_userid}>) was not claimed within 30 days; subscription cancelled.`,
        fields: [
          { name: "Tier", value: gift.tier, inline: true },
          { name: "Subscription", value: gift.stripe_subscription_id, inline: true },
          { name: "Claim Token", value: gift.claim_token, inline: false },
        ],
      })

      await notifyUser({
        userId: gift.sender_userid,
        payload: {
          category: "lionheart_gift_expired_sender",
          title: "Your gift expired",
          body: "Your LionHeart gift wasn't claimed within 30 days. The subscription has been cancelled and Stripe will refund the unused portion to your card.",
          link_url: "/dashboard/gifts",
          link_label: "View your gifts",
        },
        dedupKey: `lh_gift_expired_sender:${gift.id}`,
      })

      expiredCount++
    } catch (err) {
      console.error(`expire-gifts: failed to expire gift ${gift.id}:`, err)
      failedCount++
    }
  }

  const outcome: CronOutcome = {
    ok: true,
    scanned: expired.length,
    expired: expiredCount,
    failed: failedCount,
    elapsedMs: Date.now() - startedAt,
  }

  console.log(`expire-gifts: ${JSON.stringify(outcome)}`)
  return res.status(200).json(outcome)
}
