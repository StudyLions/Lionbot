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

    const sub = await prisma.server_premium_subscriptions.findUnique({
      where: { guildid: guildIdBig },
    })

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

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${baseUrl}/dashboard/servers/${guildId}/settings?portal=returned`,
    })

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
