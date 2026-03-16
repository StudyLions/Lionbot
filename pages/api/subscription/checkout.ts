// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: API route for creating Stripe Checkout sessions for
//          LionHeart subscriptions. Requires Discord auth.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getToken } from "next-auth/jwt";

import { prisma } from "@/utils/prisma";
import { NavigationPaths } from "@/constants/types";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

const secret = process.env.SECRET;

const VALID_TIERS = ["LIONHEART", "LIONHEART_PLUS", "LIONHEART_PLUS_PLUS"] as const;
type SubscriptionTier = (typeof VALID_TIERS)[number];

const PRICE_ENV_MAP: Record<SubscriptionTier, string> = {
  LIONHEART: process.env.STRIPE_PRICE_LIONHEART ?? "price_1TBgSYAJ9zOg7wY9L8C9IEt5",
  LIONHEART_PLUS: process.env.STRIPE_PRICE_LIONHEART_PLUS ?? "price_1TBgSZAJ9zOg7wY9Z55T26ae",
  LIONHEART_PLUS_PLUS: process.env.STRIPE_PRICE_LIONHEART_PLUS_PLUS ?? "price_1TBgSbAJ9zOg7wY9wmMbpVd3",
};

const rateLimits = new Map<string, { count: number; resetAt: number }>();

async function findOrCreateStripeCustomer(
  stripe: Stripe,
  discordId: string,
  discordName: string
): Promise<string> {
  const existing = await prisma.user_subscriptions.findUnique({
    where: { userid: BigInt(discordId) },
    select: { stripe_customer_id: true },
  });
  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const customers = await stripe.customers.list({ limit: 100 });
  const match = customers.data.find((c) => c.metadata?.discordId === discordId);
  if (match) return match.id;

  const customer = await stripe.customers.create({
    metadata: { discordId, discordName },
  });
  return customer.id;
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
    const token = await getToken({ req, secret });
    const discordId = (token?.discordId ?? token?.sub) as string | undefined;
    const discordName = (token?.name ?? "User") as string;

    if (!discordId) {
      return res.status(401).json({ error: "Not authenticated. Please sign in." });
    }

    const now = Date.now();
    const rl = rateLimits.get(discordId);
    if (rl && now < rl.resetAt && rl.count >= 10) {
      return res.status(429).json({ error: "Too many requests. Try again later." });
    }
    if (!rl || now >= rl.resetAt) {
      rateLimits.set(discordId, { count: 1, resetAt: now + 60000 });
    } else {
      rl.count++;
    }

    const { tier } = req.body ?? {};
    if (!tier || !VALID_TIERS.includes(tier)) {
      return res.status(400).json({
        error: "Invalid tier. Must be one of: LIONHEART, LIONHEART_PLUS, LIONHEART_PLUS_PLUS",
      });
    }

    const priceId = PRICE_ENV_MAP[tier];
    if (!priceId) {
      return res.status(500).json({ error: "Subscription price not configured." });
    }

    const subscription = await prisma.user_subscriptions.findUnique({
      where: { userid: BigInt(discordId) },
    });

    if (subscription?.status === "ACTIVE") {
      return res.status(409).json({
        error: "You already have an active subscription. Manage it at /donate.",
      });
    }

    const customerId = await findOrCreateStripeCustomer(
      stripe,
      discordId,
      discordName
    );

    const baseUrl =
      req.headers.origin ||
      process.env.NEXTAUTH_URL ||
      "https://lionbot-website.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { discordId, discordName, tier },
      success_url: `${baseUrl}${NavigationPaths.donate}?subscription=success`,
      cancel_url: `${baseUrl}${NavigationPaths.donate}?subscription=cancelled`,
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err: unknown) {
    console.error("Subscription checkout error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
