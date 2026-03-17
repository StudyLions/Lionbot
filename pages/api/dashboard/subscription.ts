// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Dashboard API route returning the user's LionHeart
//          subscription status using the standard requireAuth
//          pattern (consistent with other dashboard APIs).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { requireAuth } from "@/utils/adminAuth";
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

  const auth = await requireAuth(req, res);
  if (!auth) return;

  try {
    const row = await prisma.user_subscriptions.findUnique({
      where: { userid: auth.userId },
    });

    if (!row || row.tier === "NONE" || row.status === "INACTIVE") {
      return res.status(200).json({
        tier: "NONE",
        status: "INACTIVE",
        tierName: null,
        tierPrice: null,
        tierColor: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: row?.stripe_customer_id ?? null,
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
        // non-critical
      }
    }

    const effectiveStatus = cancelAtPeriodEnd ? "CANCELLING" : row.status;

    return res.status(200).json({
      tier: row.tier,
      status: effectiveStatus,
      tierName: tierConfig?.name ?? row.tier,
      tierPrice: tierConfig?.price ?? null,
      tierColor: tierConfig?.color ?? null,
      monthlyGems: tierConfig?.monthlyGems ?? null,
      gemsPerVote: tierConfig?.gemsPerVote ?? null,
      lionCoinBoost: tierConfig?.lionCoinBoost ?? null,
      lgGoldBoost: tierConfig?.lgGoldBoost ?? null,
      dropRateBonus: tierConfig?.dropRateBonus ?? null,
      farmGrowthSpeed: tierConfig?.farmGrowthSpeed ?? null,
      seedCostDiscount: tierConfig?.seedCostDiscount ?? null,
      harvestGoldBonus: tierConfig?.harvestGoldBonus ?? null,
      uprootRefund: tierConfig?.uprootRefund ?? null,
      currentPeriodStart: row.current_period_start?.toISOString() ?? null,
      currentPeriodEnd: row.current_period_end?.toISOString() ?? null,
      cancelAtPeriodEnd,
      stripeCustomerId: row.stripe_customer_id ?? null,
    });
  } catch (err: unknown) {
    console.error("Dashboard subscription error:", err);
    return res.status(500).json({ error: "Failed to fetch subscription status" });
  }
}
