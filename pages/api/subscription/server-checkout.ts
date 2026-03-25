// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Stripe Checkout session for server premium subscriptions.
//          Creates a recurring subscription (monthly or yearly) in EUR
//          tied to a specific Discord server. Requires admin permission.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { requireAdmin } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
})

const VALID_PLANS = ["MONTHLY", "YEARLY"] as const
type ServerPlan = (typeof VALID_PLANS)[number]

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Add EUR price map for dual-currency server premium checkout
const PRICE_USD_MAP: Record<ServerPlan, string> = {
  MONTHLY: (process.env.STRIPE_PRICE_SERVER_PREMIUM_MONTHLY ?? "").trim(),
  YEARLY: (process.env.STRIPE_PRICE_SERVER_PREMIUM_YEARLY ?? "").trim(),
}
const PRICE_EUR_MAP: Record<ServerPlan, string> = {
  MONTHLY: (process.env.STRIPE_PRICE_SERVER_PREMIUM_MONTHLY_EUR ?? "").trim(),
  YEARLY: (process.env.STRIPE_PRICE_SERVER_PREMIUM_YEARLY_EUR ?? "").trim(),
}
// --- END AI-MODIFIED ---

async function findOrCreateStripeCustomer(
  discordId: string
): Promise<string> {
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
    // --- AI-MODIFIED (2026-03-25) ---
    // Purpose: Accept currency parameter for dual-currency checkout (default USD)
    const { guildId, plan, currency: rawCurrency } = req.body ?? {}
    const currency = rawCurrency === "eur" ? "eur" : "usd"
    // --- END AI-MODIFIED ---

    if (!guildId || typeof guildId !== "string") {
      return res.status(400).json({ error: "guildId is required" })
    }

    let guildIdBig: bigint
    try {
      guildIdBig = BigInt(guildId)
    } catch {
      return res.status(400).json({ error: "Invalid guildId format" })
    }

    const auth = await requireAdmin(req, res, guildIdBig)
    if (!auth) return

    if (!plan || !VALID_PLANS.includes(plan)) {
      return res.status(400).json({
        error: "Invalid plan. Must be MONTHLY or YEARLY.",
      })
    }

    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Select Price ID based on currency choice
    const priceId = currency === "eur"
      ? PRICE_EUR_MAP[plan as ServerPlan]
      : PRICE_USD_MAP[plan as ServerPlan]
    if (!priceId) {
      return res.status(500).json({ error: "Server premium price not configured for selected currency." })
    }
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Use findFirst with status filter instead of findUnique (PK changed from guildid to auto-increment id)
    const existingSub = await prisma.server_premium_subscriptions.findFirst({
      where: {
        guildid: guildIdBig,
        status: { in: ["ACTIVE", "CANCELLING", "PAST_DUE"] },
      },
    })

    if (existingSub) {
      const payerId = existingSub.userid.toString()
      const isCurrentUser = payerId === auth.discordId
      return res.status(409).json({
        error: isCurrentUser
          ? "This server already has an active premium subscription. Use the manage button to change your plan."
          : "This server already has an active premium subscription from another user.",
        code: "ALREADY_SUBSCRIBED",
      })
    }
    // --- END AI-MODIFIED ---

    const customerId = await findOrCreateStripeCustomer(auth.discordId)

    const baseUrl =
      req.headers.origin ||
      process.env.NEXTAUTH_URL ||
      "https://lionbot-website.vercel.app"

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        discordId: auth.discordId,
        guildId,
        type: "SERVER_PREMIUM",
        plan,
      },
      success_url: `${baseUrl}/dashboard/servers/${guildId}/settings?premium=success`,
      cancel_url: `${baseUrl}/dashboard/servers/${guildId}/settings?premium=cancelled`,
    })

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (err: unknown) {
    console.error("Server premium checkout error:", err)
    return res.status(500).json({ error: "Failed to create checkout session" })
  }
}
