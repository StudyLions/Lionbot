// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: One-time admin endpoint to configure the Stripe
//          Customer Portal for LionHeart subscription management.
//          Enables plan switching, cancellation, payment method
//          updates, and invoice history.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

const LIONHEART_PRODUCTS = [
  {
    product: "prod_UA0T7WlatnGOeC",
    prices: ["price_1TBgSYAJ9zOg7wY9L8C9IEt5"],
  },
  {
    product: "prod_UA0TptwDtKKVvz",
    prices: ["price_1TBgSZAJ9zOg7wY9Z55T26ae"],
  },
  {
    product: "prod_UA0TE8fT13ESfo",
    prices: ["price_1TBgSbAJ9zOg7wY9wmMbpVd3"],
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.STRIPE_WEBHOOK_SECRET}`) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const existing = await (stripe.billingPortal.configurations as any).list({
      limit: 10,
    });

    const configPayload: any = {
      business_profile: {
        headline: "LionBot — Manage your LionHeart subscription",
      },
      features: {
        customer_update: {
          enabled: true,
          allowed_updates: ["email"],
        },
        payment_method_update: {
          enabled: true,
        },
        subscription_cancel: {
          enabled: true,
          mode: "at_period_end",
          cancellation_reason: {
            enabled: true,
            options: [
              "too_expensive",
              "missing_features",
              "switched_service",
              "unused",
              "other",
            ],
          },
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price"],
          proration_behavior: "create_prorations",
          products: LIONHEART_PRODUCTS,
        },
        invoice_history: {
          enabled: true,
        },
      },
    };

    let configuration: any;

    if (existing.data && existing.data.length > 0) {
      const defaultConfig = existing.data.find((c: any) => c.is_default) || existing.data[0];
      configuration = await (stripe.billingPortal.configurations as any).update(
        defaultConfig.id,
        configPayload
      );
    } else {
      configuration = await (stripe.billingPortal.configurations as any).create(
        configPayload
      );
    }

    return res.status(200).json({
      success: true,
      configurationId: configuration.id,
      isDefault: configuration.is_default,
    });
  } catch (err: any) {
    console.error("Setup portal error:", err);
    return res.status(500).json({
      error: err.message || "Failed to configure portal",
      type: err.type,
      code: err.code,
    });
  }
}
