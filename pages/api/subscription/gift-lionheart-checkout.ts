// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Stripe Checkout for GIFTING a LionHeart user subscription.
//          The recipient is determined at claim time, not checkout
//          time -- sender pays first, gets a one-time claim URL to
//          share. Recipient signs in with Discord and claims.
//
//          Recurring monthly only -- same rule as server gifts. The
//          subscription belongs to the sender's Stripe customer (so
//          sender manages cancellation via Portal); the LionHeart
//          tier benefits go to whoever claims the link.
//
//          Pre-creates a lionheart_gifts row in PENDING_CLAIM status
//          BEFORE redirecting to Stripe. The Stripe webhook
//          handleLionheartGiftCheckout then back-fills the row with
//          stripe_subscription_id, stripe_customer_id, and
//          current_period_end once payment completes.
//
//          Claim expiry default: 30 days. After that, the cron
//          /api/cron/expire-gifts cancels the Stripe sub and marks
//          the row EXPIRED.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { randomBytes } from "crypto"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
})

const VALID_TIERS = ["LIONHEART", "LIONHEART_PLUS", "LIONHEART_PLUS_PLUS"] as const
type GiftableTier = (typeof VALID_TIERS)[number]

const PRICE_USD_MAP: Record<GiftableTier, string> = {
  LIONHEART: (process.env.STRIPE_PRICE_LIONHEART_USD ?? "").trim(),
  LIONHEART_PLUS: (process.env.STRIPE_PRICE_LIONHEART_PLUS_USD ?? "").trim(),
  LIONHEART_PLUS_PLUS: (process.env.STRIPE_PRICE_LIONHEART_PLUS_PLUS_USD ?? "").trim(),
}
const PRICE_EUR_MAP: Record<GiftableTier, string> = {
  LIONHEART: (process.env.STRIPE_PRICE_LIONHEART_EUR ?? process.env.STRIPE_PRICE_LIONHEART ?? "").trim(),
  LIONHEART_PLUS: (process.env.STRIPE_PRICE_LIONHEART_PLUS_EUR ?? process.env.STRIPE_PRICE_LIONHEART_PLUS ?? "").trim(),
  LIONHEART_PLUS_PLUS: (process.env.STRIPE_PRICE_LIONHEART_PLUS_PLUS_EUR ?? process.env.STRIPE_PRICE_LIONHEART_PLUS_PLUS ?? "").trim(),
}

const MAX_MESSAGE_LEN = 200
const CLAIM_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

async function findOrCreateStripeCustomer(discordId: string): Promise<string> {
  const existing = await prisma.user_subscriptions.findUnique({
    where: { userid: BigInt(discordId) },
    select: { stripe_customer_id: true },
  })
  if (existing?.stripe_customer_id) return existing.stripe_customer_id

  const serverSub = await prisma.server_premium_subscriptions.findFirst({
    where: { userid: BigInt(discordId) },
    select: { stripe_customer_id: true },
  })
  if (serverSub?.stripe_customer_id) return serverSub.stripe_customer_id

  const customers = await stripe.customers.list({ limit: 100 })
  const match = customers.data.find((c) => c.metadata?.discordId === discordId)
  if (match) return match.id

  const customer = await stripe.customers.create({
    metadata: { discordId },
  })
  return customer.id
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

    const {
      tier,
      currency: rawCurrency,
      message: rawMessage,
      anonymous: rawAnonymous,
    } = req.body ?? {}

    if (!tier || !VALID_TIERS.includes(tier)) {
      return res.status(400).json({
        error: "Invalid tier. Must be LIONHEART, LIONHEART_PLUS, or LIONHEART_PLUS_PLUS.",
      })
    }

    const currency = rawCurrency === "eur" ? "eur" : "usd"
    const anonymous = rawAnonymous === true

    const message =
      typeof rawMessage === "string" && rawMessage.trim().length > 0
        ? rawMessage.trim().slice(0, MAX_MESSAGE_LEN)
        : null

    const priceId = currency === "eur" ? PRICE_EUR_MAP[tier as GiftableTier] : PRICE_USD_MAP[tier as GiftableTier]
    if (!priceId) {
      return res.status(500).json({
        error: "LionHeart price not configured for the selected currency.",
      })
    }

    // Generate a claim token before Stripe call so we can stamp it in
    // session metadata. 32 hex chars = 128 bits of entropy, which is
    // plenty for a non-guessable URL fragment.
    const claimToken = randomBytes(16).toString("hex")
    const claimExpiresAt = new Date(Date.now() + CLAIM_EXPIRY_MS)

    const customerId = await findOrCreateStripeCustomer(auth.discordId)

    // Pre-create the gift row in PENDING_CLAIM. The webhook
    // (handleLionheartGiftCheckout) will fill stripe_subscription_id +
    // stripe_customer_id + current_period_end once payment lands. The
    // row uses placeholder empty strings for stripe IDs because the
    // schema marks them NOT NULL; the webhook always runs after a
    // successful checkout, so the placeholder lifetime is seconds.
    const gift = await prisma.lionheart_gifts.create({
      data: {
        sender_userid: BigInt(auth.discordId),
        tier,
        stripe_subscription_id: "",
        stripe_customer_id: customerId,
        claim_token: claimToken,
        claim_expires_at: claimExpiresAt,
        gift_message: message,
        gift_is_anonymous: anonymous,
        status: "PENDING_CLAIM",
      },
    })

    const baseUrl =
      req.headers.origin ||
      process.env.NEXTAUTH_URL ||
      "https://lionbot-website.vercel.app"

    const giftMetadata: Stripe.MetadataParam = {
      type: "LIONHEART_GIFT",
      senderId: auth.discordId,
      giftId: String(gift.id),
      claim_token: claimToken,
      tier,
      gift_is_anonymous: anonymous ? "true" : "false",
      gift_message: message ?? "",
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: giftMetadata,
      // subscription_data.metadata is set so downstream subscription.* and
      // invoice.* events also carry the gift discriminator (Stripe doesn't
      // forward session.metadata to the underlying Subscription).
      subscription_data: { metadata: giftMetadata },
      automatic_tax: { enabled: false },
      success_url: `${baseUrl}/dashboard/gifts?gift=sent&kind=lionheart&token=${claimToken}`,
      cancel_url: `${baseUrl}/donate?gift=cancelled`,
    })

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      claimToken,
    })
  } catch (err: unknown) {
    console.error("Gift LionHeart checkout error:", err)
    return res.status(500).json({ error: "Failed to create gift checkout session" })
  }
}
