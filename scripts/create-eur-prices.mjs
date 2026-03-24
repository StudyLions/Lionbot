// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: One-time script to create EUR Stripe Price objects
//          for all subscription products. Run once, then add
//          the output Price IDs as Vercel env vars.
//
// Usage:
//   set STRIPE_SECRET_KEY=sk_live_xxx
//   node scripts/create-eur-prices.mjs
// ============================================================

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("ERROR: Set STRIPE_SECRET_KEY environment variable before running.");
  console.error("  You can get it from Vercel env vars or Stripe dashboard.");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2020-08-27" });

const USD_PRICES = [
  {
    name: "LIONHEART",
    envVar: "STRIPE_PRICE_LIONHEART_EUR",
    priceId: "price_1TBgSYAJ9zOg7wY9L8C9IEt5",
    eurAmountCents: 499,
    interval: "month",
  },
  {
    name: "LIONHEART_PLUS",
    envVar: "STRIPE_PRICE_LIONHEART_PLUS_EUR",
    priceId: "price_1TBgSZAJ9zOg7wY9Z55T26ae",
    eurAmountCents: 999,
    interval: "month",
  },
  {
    name: "LIONHEART_PLUS_PLUS",
    envVar: "STRIPE_PRICE_LIONHEART_PLUS_PLUS_EUR",
    priceId: "price_1TBgSbAJ9zOg7wY9wmMbpVd3",
    eurAmountCents: 1999,
    interval: "month",
  },
];

const SERVER_PREMIUM_PRICES = [
  {
    name: "SERVER_PREMIUM_MONTHLY",
    envVar: "STRIPE_PRICE_SERVER_PREMIUM_MONTHLY_EUR",
    envVarUsd: "STRIPE_PRICE_SERVER_PREMIUM_MONTHLY",
    eurAmountCents: 999,
    interval: "month",
  },
  {
    name: "SERVER_PREMIUM_YEARLY",
    envVar: "STRIPE_PRICE_SERVER_PREMIUM_YEARLY_EUR",
    envVarUsd: "STRIPE_PRICE_SERVER_PREMIUM_YEARLY",
    eurAmountCents: 9999,
    interval: "year",
  },
];

async function main() {
  console.log("Creating EUR Stripe prices...\n");

  const results = [];

  for (const item of USD_PRICES) {
    const usdPriceId = process.env[`STRIPE_PRICE_${item.name}`] || item.priceId;
    console.log(`Fetching USD price for ${item.name}: ${usdPriceId}`);

    const usdPrice = await stripe.prices.retrieve(usdPriceId);
    const productId = typeof usdPrice.product === "string" ? usdPrice.product : usdPrice.product.id;

    console.log(`  Product: ${productId}, creating EUR price at ${item.eurAmountCents} cents...`);

    const eurPrice = await stripe.prices.create({
      product: productId,
      currency: "eur",
      unit_amount: item.eurAmountCents,
      recurring: { interval: item.interval },
      metadata: { tier: item.name, created_by: "create-eur-prices script" },
    });

    console.log(`  Created: ${eurPrice.id}\n`);
    results.push({ envVar: item.envVar, priceId: eurPrice.id });
  }

  for (const item of SERVER_PREMIUM_PRICES) {
    const usdPriceId = process.env[item.envVarUsd];
    if (!usdPriceId) {
      console.log(`WARNING: ${item.envVarUsd} not set. Skipping ${item.name}.`);
      console.log(`  You'll need to create this price manually or set the env var and re-run.\n`);
      continue;
    }

    console.log(`Fetching USD price for ${item.name}: ${usdPriceId}`);
    const usdPrice = await stripe.prices.retrieve(usdPriceId);
    const productId = typeof usdPrice.product === "string" ? usdPrice.product : usdPrice.product.id;

    console.log(`  Product: ${productId}, creating EUR price at ${item.eurAmountCents} cents...`);

    const eurPrice = await stripe.prices.create({
      product: productId,
      currency: "eur",
      unit_amount: item.eurAmountCents,
      recurring: { interval: item.interval },
      metadata: { plan: item.name, created_by: "create-eur-prices script" },
    });

    console.log(`  Created: ${eurPrice.id}\n`);
    results.push({ envVar: item.envVar, priceId: eurPrice.id });
  }

  console.log("=".repeat(60));
  console.log("Add these env vars to Vercel (staging + production):\n");
  for (const r of results) {
    console.log(`  ${r.envVar}=${r.priceId}`);
  }
  console.log("\n" + "=".repeat(60));
}

main().catch((err) => {
  console.error("Script failed:", err.message);
  process.exit(1);
});
