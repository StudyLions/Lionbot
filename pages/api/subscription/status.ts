// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: API route returning the user's LionHeart subscription
//          status with tier details for the donate page UI.
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
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/constants/SubscriptionData";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Use requireAuth for rate limiting
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const discordId = auth.discordId;
    // --- END AI-MODIFIED ---

    const row = await prisma.user_subscriptions.findUnique({
      where: { userid: BigInt(discordId) },
    });

    if (!row || row.tier === "NONE" || row.status === "INACTIVE") {
      return res.status(200).json({
        tier: "NONE",
        status: "INACTIVE",
        tierName: null,
        tierPrice: null,
        tierColor: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    }

    const tierConfig =
      row.tier in SUBSCRIPTION_TIERS
        ? SUBSCRIPTION_TIERS[row.tier as SubscriptionTier]
        : null;

    let cancelAtPeriodEnd = false;
    if (
      row.stripe_subscription_id &&
      (row.status === "ACTIVE" || row.status === "CANCELLING")
    ) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(
          row.stripe_subscription_id
        );
        cancelAtPeriodEnd = stripeSub.cancel_at_period_end === true;
      } catch {
        // Stripe API failure is non-critical here; use DB status
      }
    }

    const effectiveStatus = cancelAtPeriodEnd ? "CANCELLING" : row.status;

    return res.status(200).json({
      tier: row.tier,
      status: effectiveStatus,
      tierName: tierConfig?.name ?? row.tier,
      tierPrice: tierConfig?.price ?? null,
      tierColor: tierConfig?.color ?? null,
      currentPeriodStart: row.current_period_start?.toISOString() ?? null,
      currentPeriodEnd: row.current_period_end?.toISOString() ?? null,
      cancelAtPeriodEnd,
    });
  } catch (err: unknown) {
    console.error("Subscription status error:", err);
    return res.status(500).json({ error: "Failed to fetch subscription status" });
  }
}
