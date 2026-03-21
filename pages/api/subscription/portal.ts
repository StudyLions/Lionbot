// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Stripe Customer Portal session for managing
//          LionHeart subscriptions (plan switching, cancellation,
//          payment methods, invoice history).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Switch from raw getToken (no rate limit) to requireAuth (rate-limited)
import { requireAuth } from "@/utils/adminAuth";
// --- End original code ---
// import { getToken } from "next-auth/jwt";
// --- END AI-MODIFIED ---

import { prisma } from "@/utils/prisma";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

async function findStripeCustomerByDiscordId(
  discordId: string
): Promise<string | null> {
  const sub = await prisma.user_subscriptions.findUnique({
    where: { userid: BigInt(discordId) },
    select: { stripe_customer_id: true },
  });
  if (sub?.stripe_customer_id) return sub.stripe_customer_id;

  const customers = await stripe.customers.list({ limit: 100 });
  const match = customers.data.find(
    (c) => c.metadata?.discordId === discordId
  );
  return match?.id ?? null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Use requireAuth for rate limiting
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const discordId = auth.discordId;
    // --- END AI-MODIFIED ---

    const customerId = await findStripeCustomerByDiscordId(discordId);

    if (!customerId) {
      return res.status(404).json({
        error: "No subscription found. Subscribe to a LionHeart plan first.",
        code: "NO_CUSTOMER",
      });
    }

    // --- AI-MODIFIED (2026-03-17) ---
    // Purpose: Skip Stripe portal for test/fake customer IDs
    if (customerId.startsWith("cus_test")) {
      return res.status(400).json({
        error: "Subscription management is not available in test mode.",
        code: "TEST_MODE",
      });
    }
    // --- END AI-MODIFIED ---

    const baseUrl =
      req.headers.origin ||
      process.env.NEXTAUTH_URL ||
      "https://lionbot-website.vercel.app";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/donate?portal=returned`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("Subscription portal error:", err);

    if (err.type === "StripeInvalidRequestError") {
      if (err.message?.includes("configuration")) {
        return res.status(500).json({
          error:
            "The subscription portal is not configured yet. Please contact support.",
          code: "PORTAL_NOT_CONFIGURED",
        });
      }
      if (err.message?.includes("No such customer")) {
        return res.status(404).json({
          error: "Your Stripe customer account was not found. Please contact support.",
          code: "CUSTOMER_NOT_FOUND",
        });
      }
    }

    return res.status(500).json({
      error: "Failed to open subscription management. Please try again.",
      code: "UNKNOWN_ERROR",
    });
  }
}
