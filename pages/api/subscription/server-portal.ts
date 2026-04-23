// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Stripe Billing Portal for managing server premium
//          subscriptions (cancellation, payment method updates).
//          Requires admin permission on the target guild.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { requireAdmin } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { guildId } = req.body ?? {}

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

    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Use findFirst with status filter (PK changed from guildid to auto-increment id)
    const sub = await prisma.server_premium_subscriptions.findFirst({
      where: {
        guildid: guildIdBig,
        status: { in: ["ACTIVE", "CANCELLING", "PAST_DUE"] },
      },
    })
    // --- END AI-MODIFIED ---

    if (!sub?.stripe_customer_id) {
      return res.status(404).json({
        error: "No active server premium subscription found.",
        code: "NO_SUBSCRIPTION",
      })
    }

    if (sub.stripe_customer_id.startsWith("cus_test")) {
      return res.status(400).json({
        error: "Subscription management is not available in test mode.",
        code: "TEST_MODE",
      })
    }

    const baseUrl =
      req.headers.origin ||
      process.env.NEXTAUTH_URL ||
      "https://lionbot-website.vercel.app"

    // --- AI-MODIFIED (2026-04-23) ---
    // Purpose: Pin Server Premium portal sessions to a dedicated portal
    //          configuration so customers can only switch between Server
    //          Premium prices (monthly ↔ yearly, USD or EUR) and never
    //          accidentally switch to a LionHeart price (which would
    //          break the webhook because LionHeart subs live in
    //          `user_subscriptions` while server premium subs live in
    //          `server_premium_subscriptions`). The .replace/.trim chain
    //          strips the literal CRLF that `vercel env pull` writes
    //          into the env value.
    const portalConfigId = (process.env.STRIPE_PORTAL_CONFIG_SERVER_PREMIUM ?? "")
      .replace(/\\r/g, "")
      .replace(/\\n/g, "")
      .trim()

    const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: sub.stripe_customer_id,
      return_url: `${baseUrl}/dashboard/servers/${guildId}/settings?portal=returned`,
    }
    if (portalConfigId) {
      sessionParams.configuration = portalConfigId
    }

    const session = await stripe.billingPortal.sessions.create(sessionParams)
    // --- END AI-MODIFIED ---

    return res.status(200).json({ url: session.url })
  } catch (err: any) {
    console.error("Server premium portal error:", err)

    if (err.type === "StripeInvalidRequestError") {
      if (err.message?.includes("configuration")) {
        return res.status(500).json({
          error: "The subscription portal is not configured yet. Please contact support.",
          code: "PORTAL_NOT_CONFIGURED",
        })
      }
      if (err.message?.includes("No such customer")) {
        return res.status(404).json({
          error: "Stripe customer account not found. Please contact support.",
          code: "CUSTOMER_NOT_FOUND",
        })
      }
    }

    return res.status(500).json({
      error: "Failed to open subscription management.",
      code: "UNKNOWN_ERROR",
    })
  }
}
