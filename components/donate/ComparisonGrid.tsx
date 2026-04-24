// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: Always-visible 4-column comparison grid (Free / LionHeart /
//          LionHeart+ / LionHeart++) that replaces the hidden-by-default
//          ComparisonTable. Each row is a perk; each column shows the
//          value with a check / dash / number aligned vertically. The
//          Most Popular tier (LionHeart+) gets visual emphasis.
// ============================================================
import { Check, X as XIcon, Crown } from "lucide-react";
import {
  SUBSCRIPTION_TIERS,
  FREE_TIER,
  TIER_ORDER,
} from "@/constants/SubscriptionData";
import numberWithCommas from "@/utils/numberWithCommas";

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || "";

function GemIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <img
      src={`${BLOB_BASE}/pet-assets/ui/icons/gem.png`}
      alt=""
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

interface Row {
  label: string;
  category?: string;
  free: React.ReactNode;
  values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => React.ReactNode;
  highlight?: boolean;
}

const ROWS: Row[] = [
  // Rewards
  {
    label: "Monthly LionGems",
    category: "Rewards",
    free: <DashCell />,
    values: (t) => (
      <span className="inline-flex items-center gap-1 font-semibold">
        <GemIcon className="h-3.5 w-3.5" />
        {numberWithCommas(t.monthlyGems)}
      </span>
    ),
    highlight: true,
  },
  {
    label: "Gems per Top.gg vote",
    free: <span className="text-muted-foreground/80">{FREE_TIER.gemsPerVote}</span>,
    values: (t) => (
      <span className="font-semibold text-foreground">{t.gemsPerVote}</span>
    ),
  },
  {
    label: "LionCoin vote boost",
    free: <span className="text-muted-foreground/80">{FREE_TIER.lionCoinBoost}x</span>,
    values: (t) => (
      <span className="font-semibold text-foreground">{t.lionCoinBoost}x</span>
    ),
  },
  {
    label: "Drop-rate bonus",
    free: <DashCell />,
    values: (t) => (
      <span className="font-semibold text-emerald-400">
        +{Math.round(t.dropRateBonus * 100)}%
      </span>
    ),
  },
  // Pet
  {
    label: "Farm growth speed",
    category: "LionGotchi",
    free: <span className="text-muted-foreground/80">{FREE_TIER.farmGrowthSpeed}x</span>,
    values: (t) => (
      <span className="font-semibold text-emerald-400">{t.farmGrowthSpeed}x</span>
    ),
    highlight: true,
  },
  {
    label: "Watering duration",
    free: <span className="text-muted-foreground/80">{FREE_TIER.waterDurationMultiplier}x</span>,
    values: (t) => (
      <span className="font-semibold text-foreground">{t.waterDurationMultiplier}x</span>
    ),
  },
  {
    label: "Dry penalty",
    free: <span className="text-rose-400/90">{FREE_TIER.dryPenalty * 100}%</span>,
    values: (t) => (
      <span className="font-semibold text-foreground">{t.dryPenalty * 100}%</span>
    ),
  },
  {
    label: "Plant death timer",
    free: <span className="text-rose-400/90">{FREE_TIER.deathTimerHours}h</span>,
    values: (t) => (
      <span
        className={
          t.deathTimerHours === null
            ? "font-semibold text-emerald-400"
            : "font-semibold text-foreground"
        }
      >
        {t.deathTimerHours === null ? "Never dies" : `${t.deathTimerHours}h`}
      </span>
    ),
    highlight: true,
  },
  {
    label: "Seed cost discount",
    free: <DashCell />,
    values: (t) => (
      <span className="font-semibold text-emerald-400">
        -{Math.round(t.seedCostDiscount * 100)}%
      </span>
    ),
  },
  {
    label: "Harvest gold bonus",
    free: <DashCell />,
    values: (t) => (
      <span className="font-semibold text-emerald-400">
        +{Math.round(t.harvestGoldBonus * 100)}%
      </span>
    ),
  },
  {
    label: "Uproot refund",
    free: <span className="text-muted-foreground/80">{FREE_TIER.uprootRefund * 100}%</span>,
    values: (t) => (
      <span className="font-semibold text-foreground">{t.uprootRefund * 100}%</span>
    ),
  },
  // Style + extras
  {
    label: "Animated profile cards",
    category: "Style & extras",
    free: <CrossCell />,
    values: () => <CheckCell />,
    highlight: true,
  },
  {
    label: "Exclusive themes",
    free: <CrossCell />,
    values: () => <CheckCell />,
  },
  {
    label: "Server Premium included",
    free: <CrossCell />,
    values: (t) =>
      t.includesServerPremium ? (
        <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
          <Check className="h-3.5 w-3.5" /> 1 server
        </span>
      ) : (
        <DashCell />
      ),
    highlight: true,
  },
];

function CheckCell() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
      <Check className="h-3.5 w-3.5" />
    </span>
  );
}

function CrossCell() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10 text-rose-400/90">
      <XIcon className="h-3.5 w-3.5" />
    </span>
  );
}

function DashCell() {
  return <span className="text-muted-foreground/50">—</span>;
}

interface ComparisonGridProps {
  symbol?: string;
  currency?: "eur" | "usd";
}

export default function ComparisonGrid({ symbol = "€", currency = "eur" }: ComparisonGridProps = {}) {
  return (
    <section
      id="comparison"
      className="relative py-16 lg:py-20 border-t border-border/60 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Side-by-side
          </span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Compare every perk, plan by plan
          </h2>
          <p className="text-muted-foreground mt-3 text-base lg:text-lg max-w-xl mx-auto">
            No hidden table. Everything you get on every tier — laid out clearly.
          </p>
        </div>

        {/* Card grid header */}
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
          {/* Plan headers */}
          <div className="grid grid-cols-5 border-b border-border/60 text-xs lg:text-sm">
            <div className="p-4 lg:p-5 text-muted-foreground font-medium">
              Perk
            </div>
            <div className="p-4 lg:p-5 text-center border-l border-border/40">
              <div className="text-muted-foreground/80 font-semibold uppercase tracking-wider text-[10px] lg:text-xs">
                Free
              </div>
              <div className="mt-1 text-foreground/80 font-bold text-sm lg:text-base">
                {symbol}0
              </div>
            </div>
            {TIER_ORDER.map((tierId) => {
              const t = SUBSCRIPTION_TIERS[tierId];
              const isFeatured = tierId === "LIONHEART_PLUS";
              const price = currency === "eur" ? t.price : t.priceUsd;
              return (
                <div
                  key={tierId}
                  className={`p-4 lg:p-5 text-center border-l border-border/40 relative ${
                    isFeatured ? "bg-gradient-to-b from-pink-500/8 to-transparent" : ""
                  }`}
                >
                  {isFeatured && (
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg shadow-pink-500/30">
                      <Crown className="h-2.5 w-2.5" />
                      Popular
                    </span>
                  )}
                  <div
                    className="font-semibold uppercase tracking-wider text-[10px] lg:text-xs mt-1"
                    style={{ color: t.color }}
                  >
                    {t.name}
                  </div>
                  <div className="mt-1 text-foreground font-bold text-sm lg:text-base">
                    {symbol}
                    {price.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => {
            const showCategory =
              row.category &&
              (i === 0 || ROWS[i - 1].category !== row.category);
            return (
              <div key={`${row.label}-${i}`}>
                {showCategory && (
                  <div className="px-4 lg:px-5 py-2 bg-muted/30 border-b border-border/40 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {row.category}
                  </div>
                )}
                <div
                  className={`grid grid-cols-5 border-b border-border/30 last:border-b-0 text-xs lg:text-sm transition-colors hover:bg-muted/15 ${
                    row.highlight ? "bg-gradient-to-r from-transparent via-pink-500/[0.02] to-transparent" : ""
                  }`}
                >
                  <div className="p-3 lg:p-4 text-foreground/85 font-medium flex items-center">
                    {row.label}
                  </div>
                  <div className="p-3 lg:p-4 text-center border-l border-border/30 flex items-center justify-center">
                    {row.free}
                  </div>
                  {TIER_ORDER.map((tierId) => {
                    const isFeatured = tierId === "LIONHEART_PLUS";
                    return (
                      <div
                        key={tierId}
                        className={`p-3 lg:p-4 text-center border-l border-border/30 flex items-center justify-center ${
                          isFeatured ? "bg-gradient-to-b from-pink-500/[0.04] to-pink-500/[0.02]" : ""
                        }`}
                      >
                        {row.values(SUBSCRIPTION_TIERS[tierId])}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
