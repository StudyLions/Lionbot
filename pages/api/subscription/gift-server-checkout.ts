// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Stripe Checkout for GIFTING Server Premium to a guild.
//          Any logged-in user who is a member of the target guild can
//          send a recurring monthly Server Premium subscription on
//          behalf of that guild. The sender owns the Stripe sub (and
//          therefore can cancel it via Stripe Portal); the recipient
//          guild gets premium auto-activated on payment via the
//          webhook handler (handleServerPremiumGiftCheckout in
//          /api/webhook/stripe.ts).
//
//          Recurring monthly only -- gift duration locked to monthly
//          per design. Sender's card is billed each month until they
//          cancel.
//
//          Sibling endpoint to /api/subscription/server-checkout, but
//          (1) requireAuth not requireAdmin (gifter doesn't admin the
//          target guild), (2) only MONTHLY plan, (3) writes gift
//          metadata so the webhook can distinguish.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
})

const MONTHLY_PRICE_USD = (process.env.STRIPE_PRICE_SERVER_PREMIUM_MONTHLY ?? "").trim()
const MONTHLY_PRICE_EUR = (process.env.STRIPE_PRICE_SERVER_PREMIUM_MONTHLY_EUR ?? "").trim()

const MAX_MESSAGE_LEN = 200

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
      guildId,
      currency: rawCurrency,
      message: rawMessage,
      anonymous: rawAnonymous,
    } = req.body ?? {}

    const currency = rawCurrency === "eur" ? "eur" : "usd"
    const anonymous = rawAnonymous === true

    if (!guildId || typeof guildId !== "string") {
      return res.status(400).json({ error: "guildId is required" })
    }

    let guildIdBig: bigint
    try {
      guildIdBig = BigInt(guildId)
    } catch {
      return res.status(400).json({ error: "Invalid guildId format" })
    }

    // Trim + length-limit the optional message
    const message =
      typeof rawMessage === "string" && rawMessage.trim().length > 0
        ? rawMessage.trim().slice(0, MAX_MESSAGE_LEN)
        : null

    const senderIdBig = BigInt(auth.discordId)

    // 1. Guild must exist (bot is installed)
    const guildExists = await prisma.guild_config.findUnique({
      where: { guildid: guildIdBig },
      select: { guildid: true, name: true },
    })
    if (!guildExists) {
      return res.status(404).json({
        error: "Server not found, or LionBot is not in this server.",
      })
    }

    // 2. Sender must be a member of the target guild (the bot has seen them).
    //    This is the gift-eligibility check -- "gift to a server you're in",
    //    not "to any server in the world".
    const isMember = await prisma.members.findFirst({
      where: { guildid: guildIdBig, userid: senderIdBig },
      select: { userid: true },
    })
    if (!isMember) {
      return res.status(403).json({
        error: "You can only gift premium to servers you're a member of.",
        code: "NOT_A_MEMBER",
      })
    }

    // 3. Sender hasn't already got an active gift sub for this guild
    //    (use Stripe Portal to manage existing gifts; don't double-buy)
    const existingGift = await prisma.server_premium_subscriptions.findFirst({
      where: {
        guildid: guildIdBig,
        gifted_by_userid: senderIdBig,
        status: { in: ["ACTIVE", "CANCELLING", "PAST_DUE"] },
      },
    })
    if (existingGift) {
      return res.status(409).json({
        error: "You already gift premium to this server. Manage it in your billing portal.",
        code: "ALREADY_GIFTING",
      })
    }

    const priceId = currency === "eur" ? MONTHLY_PRICE_EUR : MONTHLY_PRICE_USD
    if (!priceId) {
      return res.status(500).json({
        error: "Server premium price not configured for the selected currency.",
      })
    }

    const customerId = await findOrCreateStripeCustomer(auth.discordId)

    const baseUrl =
      req.headers.origin ||
      process.env.NEXTAUTH_URL ||
      "https://lionbot-website.vercel.app"

    // Pre-serialise the metadata so both the Checkout Session and the
    // resulting Subscription carry the gift discriminator. Stripe doesn't
    // forward session.metadata to the subscription by default; we have to
    // set subscription_data.metadata explicitly.
    const giftMetadata: Stripe.MetadataParam = {
      type: "SERVER_PREMIUM_GIFT",
      senderId: auth.discordId,
      recipientGuildId: guildId,
      gift_is_anonymous: anonymous ? "true" : "false",
      // Stripe metadata values must be strings; keep message under 500 chars
      // per Stripe's per-key limit. We cap to 200 above; this is safe.
      gift_message: message ?? "",
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: giftMetadata,
      subscription_data: { metadata: giftMetadata },
      // Ari files taxes manually; lock automatic tax off at the API layer.
      automatic_tax: { enabled: false },
      success_url: `${baseUrl}/dashboard/gifts?gift=sent&kind=server`,
      cancel_url: `${baseUrl}/donate?gift=cancelled`,
    })

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (err: unknown) {
    console.error("Gift server checkout error:", err)
    return res.status(500).json({ error: "Failed to create gift checkout session" })
  }
}
