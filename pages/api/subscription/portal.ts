// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Stripe Customer Portal session for managing
//          LionHeart subscriptions (plan switching, cancellation,
//          payment methods, invoice history).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getToken } from "next-auth/jwt";

import { prisma } from "@/utils/prisma";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

const secret = process.env.SECRET;

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
    const token = await getToken({ req, secret });
    const discordId = (token?.discordId ?? token?.sub) as string | undefined;

    if (!discordId) {
      return res.status(401).json({
        error: "Not authenticated. Please sign in with Discord.",
      });
    }

    const customerId = await findStripeCustomerByDiscordId(discordId);

    if (!customerId) {
      return res.status(404).json({
        error: "No subscription found. Subscribe to a LionHeart plan first.",
        code: "NO_CUSTOMER",
      });
    }

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
