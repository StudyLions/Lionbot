// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: One-time admin endpoint to configure the Stripe
//          Customer Portal for LionHeart and Server Premium
//          subscription management. Enables plan switching,
//          cancellation, payment method updates, and invoice
//          history. Manages two separate portal configurations:
//            1. LionHeart (default) — only LionHeart products
//            2. Server Premium      — only Server Premium product
//          They are kept separate so customers cannot switch
//          across product lines (which would break the webhook
//          because LionHeart subs and server-premium subs live
//          in different DB tables).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

const SITE_URL = "https://lionbot.org";
const PRIVACY_URL = `${SITE_URL}/privacy-policy`;
const TERMS_URL = `${SITE_URL}/terms-and-conditions`;

// --- AI-MODIFIED (2026-04-23) ---
// Purpose: Strip the literal "\r\n" suffix that vercel env pull writes,
//          on top of regular .trim() for plain whitespace.
function clean(v: string | undefined): string {
  return (v ?? "").replace(/\\r/g, "").replace(/\\n/g, "").trim();
}

function pickPrices(...envValues: (string | undefined)[]): string[] {
  return envValues.map(clean).filter((v) => v.length > 0);
}
// --- END AI-MODIFIED ---

// --- AI-REPLACED (2026-04-23) ---
// Reason: Old config only listed the legacy $4.99/$9.99/$19.99 USD prices,
//         so customers using the portal saw outdated prices and could not
//         switch to the current ($5.99/$11.99/$23.99 USD or €4.99/€9.99/€19.99 EUR) tiers.
// What the new code does better: pulls every active LionHeart price from env vars
//         (with .clean() to handle CRLF in Vercel env exports) and exposes both USD
//         and EUR prices per product so customers can switch plans in either currency.
//         Legacy prices are intentionally excluded so the portal does not advertise
//         them as switch-to options for new plan changes.
// --- Original code (commented out for rollback) ---
// const LIONHEART_PRODUCTS = [
//   {
//     product: "prod_UA0T7WlatnGOeC",
//     prices: ["price_1TBgSYAJ9zOg7wY9L8C9IEt5"],
//   },
//   {
//     product: "prod_UA0TptwDtKKVvz",
//     prices: ["price_1TBgSZAJ9zOg7wY9Z55T26ae"],
//   },
//   {
//     product: "prod_UA0TE8fT13ESfo",
//     prices: ["price_1TBgSbAJ9zOg7wY9wmMbpVd3"],
//   },
// ];
// --- End original code ---

const LIONHEART_PRODUCTS = [
  {
    product: "prod_UA0T7WlatnGOeC",
    prices: pickPrices(
      process.env.STRIPE_PRICE_LIONHEART_USD,
      process.env.STRIPE_PRICE_LIONHEART_EUR,
    ),
  },
  {
    product: "prod_UA0TptwDtKKVvz",
    prices: pickPrices(
      process.env.STRIPE_PRICE_LIONHEART_PLUS_USD,
      process.env.STRIPE_PRICE_LIONHEART_PLUS_EUR,
    ),
  },
  {
    product: "prod_UA0TE8fT13ESfo",
    prices: pickPrices(
      process.env.STRIPE_PRICE_LIONHEART_PLUS_PLUS_USD,
      process.env.STRIPE_PRICE_LIONHEART_PLUS_PLUS_EUR,
    ),
  },
];
// --- END AI-REPLACED ---

// --- AI-MODIFIED (2026-04-23) ---
// Purpose: Mirror LIONHEART_PRODUCTS for the second portal configuration so
//          server-premium subscribers can switch monthly ↔ yearly in either
//          currency without ever being shown LionHeart prices.
const SERVER_PREMIUM_PRODUCTS = [
  {
    product: "prod_UCJxhcqdl2hNrF",
    prices: pickPrices(
      process.env.STRIPE_PRICE_SERVER_PREMIUM_MONTHLY,
      process.env.STRIPE_PRICE_SERVER_PREMIUM_MONTHLY_EUR,
      process.env.STRIPE_PRICE_SERVER_PREMIUM_YEARLY,
      process.env.STRIPE_PRICE_SERVER_PREMIUM_YEARLY_EUR,
    ),
  },
];
// --- END AI-MODIFIED ---

const COMMON_FEATURES: any = {
  customer_update: {
    enabled: true,
    allowed_updates: ["email", "name", "address", "phone", "tax_id"],
  },
  payment_method_update: { enabled: true },
  invoice_history: { enabled: true },
  subscription_pause: { enabled: false },
};

const COMMON_BUSINESS_PROFILE = {
  privacy_policy_url: PRIVACY_URL,
  terms_of_service_url: TERMS_URL,
};

const COMMON_CANCEL = {
  enabled: true,
  mode: "at_period_end",
  proration_behavior: "none",
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
};

// --- AI-MODIFIED (2026-04-26) ---
// Purpose: Switch LionHeart subscription_update from "create_prorations" (defer
//          proration to the next invoice) to "always_invoice" (charge the
//          prorated delta IMMEDIATELY on tier change).
//
//          Why: the previous behavior let users exploit the gem system -- they
//          could subscribe to LionHeart ($5.99), upgrade to LionHeart++ (the
//          webhook credits the +2500 gem tier delta), then cancel before the
//          next invoice and walk away with 2500 gems for $5.99. With
//          "always_invoice", Stripe generates and charges the proration
//          invoice at upgrade time, so if the card declines the subscription
//          goes past_due and handleSubscriptionCreatedOrUpdated declines to
//          credit the gem delta (status != ACTIVE).
//
//          After deploying this change, run POST /api/admin/setup-stripe-portal
//          to push the new configuration to Stripe. Existing deferred-proration
//          line items on in-flight subscriptions are unaffected -- they will
//          still appear on the next invoice as scheduled.
// --- Original code (commented out for rollback) ---
// const lionHeartPayload: any = {
//   business_profile: {
//     headline: "LionBot — Manage your LionHeart subscription",
//     ...COMMON_BUSINESS_PROFILE,
//   },
//   default_return_url: `${SITE_URL}/donate?portal=returned`,
//   features: {
//     ...COMMON_FEATURES,
//     subscription_cancel: COMMON_CANCEL,
//     subscription_update: {
//       enabled: true,
//       default_allowed_updates: ["price"],
//       proration_behavior: "create_prorations",
//       products: LIONHEART_PRODUCTS,
//     },
//   },
//   metadata: { managed_by: "lionbot-website", scope: "lionheart" },
// };
// --- End original code ---
const lionHeartPayload: any = {
  business_profile: {
    headline: "LionBot — Manage your LionHeart subscription",
    ...COMMON_BUSINESS_PROFILE,
  },
  default_return_url: `${SITE_URL}/donate?portal=returned`,
  features: {
    ...COMMON_FEATURES,
    subscription_cancel: COMMON_CANCEL,
    subscription_update: {
      enabled: true,
      default_allowed_updates: ["price"],
      proration_behavior: "always_invoice",
      products: LIONHEART_PRODUCTS,
    },
  },
  metadata: { managed_by: "lionbot-website", scope: "lionheart" },
};
// --- END AI-MODIFIED ---

const serverPremiumPayload: any = {
  business_profile: {
    headline: "LionBot — Manage your Server Premium subscription",
    ...COMMON_BUSINESS_PROFILE,
  },
  default_return_url: `${SITE_URL}/dashboard?portal=returned`,
  features: {
    ...COMMON_FEATURES,
    subscription_cancel: COMMON_CANCEL,
    subscription_update: {
      enabled: true,
      default_allowed_updates: ["price"],
      proration_behavior: "create_prorations",
      products: SERVER_PREMIUM_PRODUCTS,
    },
  },
  metadata: { managed_by: "lionbot-website", scope: "server_premium" },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Use dedicated ADMIN_API_KEY instead of reusing STRIPE_WEBHOOK_SECRET.
  //          The webhook secret should only be used for stripe.webhooks.constructEvent().
  // --- Original code (commented out for rollback) ---
  // const authHeader = req.headers.authorization;
  // if (authHeader !== `Bearer ${process.env.STRIPE_WEBHOOK_SECRET}`) {
  //   return res.status(403).json({ error: "Forbidden" });
  // }
  // --- End original code ---
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return res.status(500).json({ error: "Admin API key not configured" });
  }
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${adminKey}`) {
    return res.status(403).json({ error: "Forbidden" });
  }
  // --- END AI-MODIFIED ---

  try {
    // --- AI-MODIFIED (2026-04-23) ---
    // Purpose: Fail clearly if any product is missing all of its price env vars.
    for (const tier of [...LIONHEART_PRODUCTS, ...SERVER_PREMIUM_PRODUCTS]) {
      if (tier.prices.length === 0) {
        return res.status(500).json({
          error: `No prices configured for product ${tier.product}. Set the matching STRIPE_PRICE_* env vars.`,
        });
      }
    }
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-04-23) ---
    // Purpose: Manage two portal configurations side-by-side, identifying each
    //          one by metadata.scope. Falls back to the default config for the
    //          LionHeart scope (so the long-standing default config is reused
    //          rather than orphaned).
    const existing = await (stripe.billingPortal.configurations as any).list({
      limit: 100,
    });

    const upsert = async (
      scope: "lionheart" | "server_premium",
      payload: any,
      preferDefaultIfMissing: boolean,
    ): Promise<any> => {
      const byMeta = existing.data.find(
        (c: any) => c.metadata?.scope === scope,
      );
      if (byMeta) {
        return await (stripe.billingPortal.configurations as any).update(
          byMeta.id,
          payload,
        );
      }
      if (preferDefaultIfMissing) {
        const def = existing.data.find((c: any) => c.is_default);
        if (def) {
          return await (stripe.billingPortal.configurations as any).update(
            def.id,
            payload,
          );
        }
      }
      return await (stripe.billingPortal.configurations as any).create(payload);
    };

    const lionHeartConfig = await upsert("lionheart", lionHeartPayload, true);
    const serverPremiumConfig = await upsert(
      "server_premium",
      serverPremiumPayload,
      false,
    );

    return res.status(200).json({
      success: true,
      lionHeart: {
        configurationId: lionHeartConfig.id,
        isDefault: lionHeartConfig.is_default,
      },
      serverPremium: {
        configurationId: serverPremiumConfig.id,
        isDefault: serverPremiumConfig.is_default,
      },
    });
    // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Don't leak Stripe error details (message, type, code) to client
  } catch (err: any) {
    console.error("Setup portal error:", err?.message || err);
    return res.status(500).json({
      error: "Failed to configure portal",
    });
  }
  // --- END AI-MODIFIED ---
}
