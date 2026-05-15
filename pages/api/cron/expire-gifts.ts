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
      // Defensive: a freshly-created gift may not have its subscription_id
      // back-filled yet (webhook race). Skip; we'll catch it next run.
      if (!gift.stripe_subscription_id || gift.stripe_subscription_id === "") {
        console.warn(`expire-gifts: gift ${gift.id} has no stripe_subscription_id yet, skipping`)
        continue
      }

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
