// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: LionHeart subscription tier definitions and Stripe
//          price mapping for the premium subscription system
// ============================================================

export type SubscriptionTier = "LIONHEART" | "LIONHEART_PLUS" | "LIONHEART_PLUS_PLUS";

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  stripePriceId: string;
  color: string;
  monthlyGems: number;
  gemsPerVote: number;
  lionCoinBoost: number;
  lgGoldBoost: number;
  dropRateBonus: number;
  farmGrowthSpeed: number;
  waterDurationMultiplier: number;
  dryPenalty: number;
  deathTimerHours: number | null;
  seedCostDiscount: number;
  harvestGoldBonus: number;
  uprootRefund: number;
  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: focus timer theme count per tier
  timerThemes: number;
  // --- END AI-MODIFIED ---
}

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Change all subscription currencies from USD to EUR

export const SERVER_PREMIUM_PLANS = {
  MONTHLY: { price: 9.99, currency: "eur" as const, period: "month" as const },
  YEARLY: { price: 99.99, currency: "eur" as const, period: "year" as const },
}

// --- END AI-MODIFIED ---

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
  LIONHEART: {
    id: "LIONHEART",
    name: "LionHeart",
    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Change currency from USD to EUR
    price: 4.99,
    currency: "eur",
    // --- END AI-MODIFIED ---
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIONHEART || "price_1TBgSYAJ9zOg7wY9L8C9IEt5",
    color: "#5B8DEF",
    monthlyGems: 500,
    gemsPerVote: 10,
    lionCoinBoost: 1.5,
    lgGoldBoost: 1.15,
    dropRateBonus: 0.15,
    farmGrowthSpeed: 1.2,
    waterDurationMultiplier: 1.5,
    dryPenalty: 0.65,
    deathTimerHours: 72,
    seedCostDiscount: 0.10,
    harvestGoldBonus: 0.15,
    uprootRefund: 0.75,
    timerThemes: 5,
  },
  LIONHEART_PLUS: {
    id: "LIONHEART_PLUS",
    name: "LionHeart+",
    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Change currency from USD to EUR
    price: 9.99,
    currency: "eur",
    // --- END AI-MODIFIED ---
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIONHEART_PLUS || "price_1TBgSZAJ9zOg7wY9Z55T26ae",
    color: "#FF69B4",
    monthlyGems: 1200,
    gemsPerVote: 15,
    lionCoinBoost: 1.75,
    lgGoldBoost: 1.25,
    dropRateBonus: 0.25,
    farmGrowthSpeed: 1.35,
    waterDurationMultiplier: 2.0,
    dryPenalty: 0.75,
    deathTimerHours: 96,
    seedCostDiscount: 0.20,
    harvestGoldBonus: 0.25,
    uprootRefund: 1.0,
    timerThemes: 8,
  },
  LIONHEART_PLUS_PLUS: {
    id: "LIONHEART_PLUS_PLUS",
    name: "LionHeart++",
    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Change currency from USD to EUR
    price: 19.99,
    currency: "eur",
    // --- END AI-MODIFIED ---
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIONHEART_PLUS_PLUS || "price_1TBgSbAJ9zOg7wY9wmMbpVd3",
    color: "#FFD700",
    monthlyGems: 3000,
    gemsPerVote: 30,
    lionCoinBoost: 2.0,
    lgGoldBoost: 1.5,
    dropRateBonus: 0.50,
    farmGrowthSpeed: 1.5,
    waterDurationMultiplier: 3.0,
    dryPenalty: 0.85,
    deathTimerHours: null,
    seedCostDiscount: 0.30,
    harvestGoldBonus: 0.50,
    uprootRefund: 1.0,
    timerThemes: 10,
  },
};

export const FREE_TIER = {
  name: "Base",
  gemsPerVote: 5,
  lionCoinBoost: 1.25,
  lgGoldBoost: 1.0,
  dropRateBonus: 0,
  farmGrowthSpeed: 1.0,
  waterDurationMultiplier: 1.0,
  dryPenalty: 0.5,
  deathTimerHours: 48,
  seedCostDiscount: 0,
  harvestGoldBonus: 0,
  uprootRefund: 0.5,
};

export const TIER_ORDER: SubscriptionTier[] = ["LIONHEART", "LIONHEART_PLUS", "LIONHEART_PLUS_PLUS"];

export function getTierByPriceId(priceId: string): TierConfig | undefined {
  return Object.values(SUBSCRIPTION_TIERS).find((t) => t.stripePriceId === priceId);
}

export const SERVER_PREMIUM_LG_GOLD_BONUS = 0.15;
export const SERVER_PREMIUM_LG_DROP_BONUS = 0.15;
