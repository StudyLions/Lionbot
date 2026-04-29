// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Redesigned donate page with LionHeart subscription tiers,
//          full subscription management (upgrade/downgrade/cancel via
//          Stripe Customer Portal), and existing gem packages.
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { signIn, useSession } from "next-auth/react";
import {
  Crown,
  Zap,
  Star,
  X,
  Check,
  ExternalLink,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Shield,
  Sprout,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  RefreshCw,
  Loader2,
  Palette,
  Server,
  Type,
  Timer,
  Trophy,
  Volume2,
  Pin,
  Clock,
  EyeOff,
  MessageSquare,
  CloudRain,
  Flame,
  Waves,
  Wind,
  Radio,
  Music,
  Coins,
  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: Marketplace 2.0 -- icon for the new store / marketplace perks.
  Store,
  // --- END AI-MODIFIED ---
} from "lucide-react";
import Layout from "@/components/Layout/Layout";
import { DonationSEO } from "@/constants/SeoData";
import { DonationsData } from "@/constants/DonationsData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import createPaymentSession from "@/utils/createPaymentSession";
import numberWithCommas from "@/utils/numberWithCommas";
import {
  SUBSCRIPTION_TIERS,
  FREE_TIER,
  TIER_ORDER,
  SubscriptionTier,
  SERVER_PREMIUM_PLANS,
  getSubscriptionPrice,
  getServerPremiumPrice,
} from "@/constants/SubscriptionData";
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Import currency hook for EUR/USD toggle
import { useCurrency, type Currency } from "@/hooks/useCurrency";
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-04-24) ---
// Purpose: Import new donate page components for the conversion-focused redesign
import HeroShowcase from "@/components/donate/HeroShowcase";
import AudienceChooser from "@/components/donate/AudienceChooser";
import ValuePillars from "@/components/donate/ValuePillars";
import ComparisonGrid from "@/components/donate/ComparisonGrid";
import LossAversionStrip from "@/components/donate/LossAversionStrip";
import TrustBand from "@/components/donate/TrustBand";
import TierCarousel from "@/components/donate/TierCarousel";
import StickyPricingBar from "@/components/donate/StickyPricingBar";
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: LionGems icon from blob storage, replacing generic lucide Diamond
const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || "";
function GemIcon({ className = "h-4 w-4", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <img
      src={`${BLOB_BASE}/pet-assets/ui/icons/gem.png`}
      alt="LionGems"
      className={className}
      style={{ objectFit: "contain", ...style }}
    />
  );
}
// --- END AI-MODIFIED ---

interface SubscriptionStatus {
  tier: string;
  status: string;
  tierName: string | null;
  tierPrice: number | null;
  tierColor: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
}

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Accept currency/symbol props for dual-currency checkout
function PurchaseModal({
  item,
  onClose,
  currency,
  symbol,
}: {
  item: (typeof DonationsData)[0];
  onClose: () => void;
  currency: Currency;
  symbol: string;
}) {
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const unitPrice = currency === "usd" ? item.amount_usd : item.amount;

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await createPaymentSession(item.id, quantity, currency);
    } catch {
      setLoading(false);
    }
  };
// --- END AI-MODIFIED ---

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-md rounded-xl border border-border bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <Image
              src={item.image}
              alt={`${item.tokens} LionGems`}
              width={160}
              height={160}
              objectFit="contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground text-center flex items-center justify-center gap-2">
            <GemIcon className="h-6 w-6" />
            {numberWithCommas(item.tokens * quantity)} LionGems
          </h2>
          {item.tokens_bonus > 0 && (
            <p className="text-sm text-blue-400 text-center mt-1">
              +{numberWithCommas(item.tokens_bonus * quantity)} bonus
            </p>
          )}

          <div className="mt-6">
            <label className="text-sm font-medium text-muted-foreground">
              Quantity
            </label>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="w-10 h-10 rounded-lg border border-input text-foreground hover:bg-muted transition-colors font-medium"
              >
                -
              </button>
              <span className="w-12 text-center text-lg font-semibold text-foreground">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-input text-foreground hover:bg-muted transition-colors font-medium"
              >
                +
              </button>
              <span className="ml-auto text-2xl font-bold text-foreground">
                {symbol}{(unitPrice * quantity).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {session ? (
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    Pay {symbol}{(unitPrice * quantity).toFixed(2)} with Stripe
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => signIn("discord")}
                className="w-full py-3 rounded-lg bg-[#5865F2] text-white font-bold hover:bg-[#4752C4] transition-colors"
              >
                Sign in with Discord to checkout
              </button>
            )}
            <p className="text-[11px] text-muted-foreground text-center">
              Cancel anytime · Secure with Stripe · Instant gem delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Accept symbol prop for currency display
function SubscriptionManagementBanner({
  subStatus,
  onManage,
  portalLoading,
  symbol,
}: {
  subStatus: SubscriptionStatus;
  onManage: () => void;
  portalLoading: boolean;
  symbol: string;
}) {
// --- END AI-MODIFIED ---
  const isActive =
    subStatus.status === "ACTIVE" || subStatus.status === "CANCELLING";
  const isCancelling = subStatus.status === "CANCELLING" || subStatus.cancelAtPeriodEnd;
  const isPastDue = subStatus.status === "PAST_DUE";
  const tierConfig =
    subStatus.tier in SUBSCRIPTION_TIERS
      ? SUBSCRIPTION_TIERS[subStatus.tier as SubscriptionTier]
      : null;
  const color = tierConfig?.color || subStatus.tierColor || "#5B8DEF";
  const periodEnd = subStatus.currentPeriodEnd
    ? new Date(subStatus.currentPeriodEnd)
    : null;

  if (isPastDue) {
    return (
      <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-foreground font-semibold">Payment Failed</h3>
              <p className="text-sm text-yellow-300/80 mt-0.5">
                Your {subStatus.tierName || subStatus.tier} subscription payment
                could not be processed. Update your payment method to keep your
                perks.
              </p>
            </div>
          </div>
          <button
            onClick={onManage}
            disabled={portalLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {portalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Update Payment
          </button>
        </div>
      </div>
    );
  }

  if (isCancelling) {
    return (
      <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}20` }}
            >
              <Crown className="h-5 w-5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-foreground font-semibold">
                {subStatus.tierName || subStatus.tier}{" "}
                <span className="text-orange-400 text-sm font-normal ml-1">
                  Cancelling
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your subscription will end on{" "}
                <span className="text-orange-300 font-medium">
                  {periodEnd?.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) || "your billing date"}
                </span>
                . You keep your perks until then.
              </p>
            </div>
          </div>
          <button
            onClick={onManage}
            disabled={portalLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white transition-colors whitespace-nowrap disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            }}
          >
            {portalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Reactivate
          </button>
        </div>
      </div>
    );
  }

  if (isActive) {
    return (
      <div
        className="rounded-xl border p-5"
        style={{
          borderColor: `${color}30`,
          background: `linear-gradient(135deg, ${color}08, ${color}04)`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}20` }}
            >
              <Crown className="h-5 w-5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-foreground font-semibold">
                {subStatus.tierName || subStatus.tier}
                <span
                  className="text-xs font-medium ml-2 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  Active
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {symbol}{subStatus.tierPrice}/month
                {periodEnd && (
                  <>
                    {" · "}Next billing:{" "}
                    {periodEnd.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onManage}
              disabled={portalLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-foreground/85 font-medium hover:bg-card hover:text-foreground transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {portalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Manage Billing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// --- AI-REPLACED (2026-04-24) ---
// Reason: Conversion-focused redesign of subscription tier cards
// What the new code does better:
//   1. LionHeart+ "Most Popular" gets dominant treatment (animated gradient border, pulse halo, scale-up, raised z-index)
//   2. Each card opens with an animated tier-themed mini-visual instead of a plain emoji
//   3. "Everything in [previous tier], plus..." copy pattern with delta highlights instead of repeating perks
//   4. Gem-equivalent value line ("Includes ~€X of gems / month") anchors monetary value
//   5. Risk-reversal microcopy under every CTA ("Cancel anytime · Secure with Stripe · Instant activation")
//   6. Action-and-outcome conversion micro-copy ("Start with LionHeart+", "Unlock LionHeart++")
// --- Original code (commented out for rollback) ---
// function SubscriptionCard({ tierId, subStatus, onSubscribe, onManage, featured, subscribing, portalLoading, currency, symbol })
//   ... ~290 lines: standard card with emoji header, two gem stat boxes, full perk list per tier,
//   shimmer animated card preview, optional server-premium-included block for LionHeart++,
//   "Subscribe Now" / "Upgrade" / "Downgrade" / "Sign in to Subscribe" / "Current Plan" buttons.
// --- End original code ---

// Median gem-pack rate ((4500 + 600) gems for 14.99 EUR / 17.99 USD)
// = ~2.94 EUR per 1000 gems / ~3.53 USD per 1000 gems.
function gemValueInCurrency(gems: number, currency: Currency): number {
  const ratePerGem = currency === "eur" ? 14.99 / 5100 : 17.99 / 5100;
  return Math.round(gems * ratePerGem * 100) / 100;
}

// "Everything in X, plus..." delta perks per tier so we never repeat the same list 3 times.
// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 Phase 1 -- add the new marketplace / personal-store
// perks per tier so the donate page advertises them. Numbers are mirrored
// from utils/subscription.ts and StudyLion's marketplace_perks.py.
function getDeltaPerks(
  tierId: SubscriptionTier
): Array<{ label: string; icon: typeof TrendingUp; highlight?: boolean }> {
  if (tierId === "LIONHEART") {
    return [
      { label: "500 LionGems every month", icon: Sparkles, highlight: true },
      { label: "Custom marketplace store name + longer speech bubble", icon: Store, highlight: true },
      { label: "Custom store URL + 1 featured listing slot", icon: Store, highlight: true },
      { label: "Premium store themes & background animations", icon: Store },
      { label: "Marketplace fee 5% \u2192 4%", icon: Coins },
      { label: "Listings last 14 days (vs 7) and up to 50 active", icon: Store },
      { label: "1.5x LionCoins from every vote", icon: TrendingUp },
      { label: "+15% bonus drop rate on items", icon: Zap },
      { label: "1.2x farm growth speed", icon: Sprout },
      { label: "72h plant death timer (vs 48h)", icon: Shield },
      { label: "Animated glowing profile card", icon: Sparkles },
    ];
  }
  if (tierId === "LIONHEART_PLUS") {
    return [
      { label: "2.4x more gems (1,200/month)", icon: Sparkles, highlight: true },
      { label: "Marketplace fee just 3% and 21-day listings", icon: Coins, highlight: true },
      { label: "Up to 75 active listings + 3 featured listing slots", icon: Store, highlight: true },
      { label: "1.75x vote boost (up from 1.5x)", icon: TrendingUp },
      { label: "+25% drop rate (up from 15%)", icon: Zap },
      { label: "1.35x farm growth", icon: Sprout },
      { label: "2x water duration", icon: Shield },
      { label: "8 Pomodoro themes (up from 5)", icon: Sparkles },
    ];
  }
  return [
    { label: "6x more gems (3,000/month)", icon: Sparkles, highlight: true },
    { label: "Plants never die. Period.", icon: Shield, highlight: true },
    { label: "1 free Server Premium slot", icon: Server, highlight: true },
    { label: "Marketplace fee just 2% and 30-day listings", icon: Coins, highlight: true },
    { label: "Up to 100 active listings + 10 featured listing slots", icon: Store, highlight: true },
    { label: "2x vote boost (max tier)", icon: TrendingUp },
    { label: "+50% drop rate", icon: Zap },
    { label: "All 10 Pomodoro themes", icon: Sparkles },
  ];
}
// --- END AI-MODIFIED ---

const TIER_TAGLINES: Record<SubscriptionTier, string> = {
  LIONHEART: "Start enjoying real perks",
  LIONHEART_PLUS: "Best balance of value & power",
  LIONHEART_PLUS_PLUS: "Everything LionBot has to offer",
};

const TIER_PREVIOUS_NAME: Record<SubscriptionTier, string | null> = {
  LIONHEART: null,
  LIONHEART_PLUS: "LionHeart",
  LIONHEART_PLUS_PLUS: "LionHeart+",
};

const TIER_CTA_COPY: Record<SubscriptionTier, string> = {
  LIONHEART: "Start with LionHeart",
  LIONHEART_PLUS: "Get LionHeart+",
  LIONHEART_PLUS_PLUS: "Unlock LionHeart++",
};

function TierMiniVisual({ tierId, color }: { tierId: SubscriptionTier; color: string }) {
  if (tierId === "LIONHEART_PLUS_PLUS") {
    return (
      <div className="relative h-16 w-16">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
            boxShadow: `0 12px 28px ${color}55, inset 0 0 18px ${color}80`,
          }}
        />
        <div
          className="absolute inset-1 rounded-xl flex items-center justify-center text-2xl"
          style={{
            background: `linear-gradient(180deg, ${color}cc, ${color}66)`,
          }}
        >
          {"\u{1F451}"}
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-yellow-200"
            style={{
              top: `${20 + Math.sin(i * 1.5) * 30}%`,
              left: `${20 + Math.cos(i * 1.5) * 30}%`,
              animation: `tier-sparkle 2s ease-in-out ${i * 0.4}s infinite`,
              boxShadow: "0 0 8px rgba(255, 215, 0, 0.9)",
            }}
          />
        ))}
      </div>
    );
  }
  if (tierId === "LIONHEART_PLUS") {
    return (
      <div className="relative h-16 w-16">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${color}, #a855f7)`,
            boxShadow: `0 10px 24px ${color}55, inset 0 0 16px ${color}80`,
          }}
        />
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
          style={{
            background: `linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)`,
            animation: "tier-shimmer 2.4s ease-in-out infinite",
          }}
        />
        <div className="absolute inset-1 rounded-xl flex items-center justify-center text-2xl">
          {"\u{2728}"}
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-16 w-16">
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}99)`,
          boxShadow: `0 8px 20px ${color}45, inset 0 0 14px ${color}70`,
        }}
      />
      <div
        className="absolute -inset-0.5 rounded-2xl border opacity-50 pointer-events-none"
        style={{
          borderColor: color,
          animation: "tier-pulse 2.6s ease-in-out infinite",
        }}
      />
      <div className="absolute inset-1 rounded-xl flex items-center justify-center text-2xl">
        {"\u{1F981}"}
      </div>
    </div>
  );
}

// --- AI-MODIFIED (2026-04-24) ---
// Purpose: Conversion-focused redesigned subscription card
function SubscriptionCard({
  tierId,
  subStatus,
  onSubscribe,
  onManage,
  featured,
  subscribing,
  portalLoading,
  currency,
  symbol,
}: {
  tierId: SubscriptionTier;
  subStatus: SubscriptionStatus | null;
  onSubscribe: (tier: SubscriptionTier) => void;
  onManage: () => void;
  featured?: boolean;
  subscribing: boolean;
  portalLoading: boolean;
  currency: Currency;
  symbol: string;
}) {
  const tier = SUBSCRIPTION_TIERS[tierId];
  const { data: session } = useSession();

  const currentTier =
    subStatus &&
    (subStatus.status === "ACTIVE" || subStatus.status === "CANCELLING")
      ? subStatus.tier
      : "NONE";

  const isCurrentTier = currentTier === tierId;
  const hasActiveSub = currentTier !== "NONE";

  const currentTierIndex = hasActiveSub
    ? TIER_ORDER.indexOf(currentTier as SubscriptionTier)
    : -1;
  const thisTierIndex = TIER_ORDER.indexOf(tierId);
  const isUpgrade = hasActiveSub && thisTierIndex > currentTierIndex;
  const isDowngrade = hasActiveSub && thisTierIndex < currentTierIndex;

  const previousTierName = TIER_PREVIOUS_NAME[tierId];
  const deltaPerks = getDeltaPerks(tierId);
  const tagline = TIER_TAGLINES[tierId];
  const ctaCopy = TIER_CTA_COPY[tierId];
  const gemValue = gemValueInCurrency(tier.monthlyGems, currency);
  const tierPrice = getSubscriptionPrice(tierId, currency);

  const renderRiskReversal = () => (
    <p className="mt-2.5 text-center text-[10.5px] leading-snug text-muted-foreground/80">
      Cancel anytime &middot; Secure with Stripe &middot; Instant activation
    </p>
  );

  const renderButton = () => {
    if (isCurrentTier) {
      return (
        <div
          className="w-full py-3 rounded-xl text-center font-semibold text-sm border"
          style={{
            backgroundColor: `${tier.color}1a`,
            color: tier.color,
            borderColor: `${tier.color}40`,
          }}
        >
          <Check className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          You're on {tier.name}
        </div>
      );
    }

    if (!session) {
      return (
        <button
          onClick={() => signIn("discord")}
          className="w-full py-3 rounded-xl bg-[#5865F2] text-white font-semibold text-sm hover:bg-[#4752C4] transition-colors flex items-center justify-center gap-2"
        >
          Sign in with Discord to subscribe
        </button>
      );
    }

    if (isUpgrade) {
      return (
        <button
          onClick={onManage}
          disabled={portalLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:brightness-110 hover:translate-y-[-1px] flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
            boxShadow: `0 8px 20px ${tier.color}40`,
          }}
        >
          {portalLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
          Upgrade to {tier.name}
        </button>
      );
    }

    if (isDowngrade) {
      return (
        <button
          onClick={onManage}
          disabled={portalLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm border border-input text-foreground/85 hover:bg-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {portalLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          Switch to {tier.name}
        </button>
      );
    }

    return (
      <button
        onClick={() => onSubscribe(tierId)}
        disabled={subscribing}
        className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:brightness-110 hover:translate-y-[-1px] disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
          boxShadow: `0 8px 20px ${tier.color}40`,
        }}
      >
        {subscribing ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Processing...
          </span>
        ) : (
          ctaCopy
        )}
      </button>
    );
  };

  return (
    <div
      className={`relative flex flex-col transition-all duration-300 ${
        featured ? "lg:scale-[1.05] z-10" : "z-0"
      }`}
    >
      {featured && (
        <>
          <div
            className="absolute -inset-px rounded-[1.05rem] pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, #f472b6, #a855f7, #f59e0b, #f472b6)",
              backgroundSize: "300% 300%",
              animation: "tier-border 6s ease-in-out infinite",
              padding: "2px",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
          <div
            className="absolute -inset-6 -z-10 rounded-[2rem] blur-3xl pointer-events-none opacity-60"
            style={{
              background:
                "radial-gradient(circle, rgba(244, 114, 182, 0.45) 0%, transparent 65%)",
              animation: "tier-halo 4s ease-in-out infinite",
            }}
          />
        </>
      )}

      <div
        className={`relative rounded-2xl p-6 flex flex-col h-full ${
          featured
            ? "bg-gradient-to-b from-pink-500/[0.08] via-card to-card shadow-2xl shadow-pink-500/20"
            : "border border-border bg-card/80 hover:border-input transition-colors"
        }`}
      >
        {featured && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black text-white uppercase tracking-widest"
              style={{
                background:
                  "linear-gradient(135deg, #f472b6, #a855f7)",
                boxShadow:
                  "0 8px 20px rgba(244, 114, 182, 0.5), 0 0 0 1px rgba(244, 114, 182, 0.6)",
              }}
            >
              <Star className="h-3 w-3 fill-white" />
              Most Popular
            </span>
          </div>
        )}

        <div className="flex items-start gap-4 mb-5">
          <TierMiniVisual tierId={tierId} color={tier.color} />
          <div className="min-w-0 flex-1 pt-1">
            <h3
              className={`font-bold text-foreground ${
                featured ? "text-2xl" : "text-xl"
              }`}
            >
              {tier.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
              {tagline}
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-1">
          <span
            className={`font-black text-foreground ${
              featured ? "text-5xl" : "text-4xl"
            }`}
          >
            {symbol}
            {tierPrice}
          </span>
          <span className="text-muted-foreground text-sm">/month</span>
        </div>
        <p className="text-[11.5px] text-muted-foreground/80 mb-5">
          Includes <span className="text-foreground/90 font-semibold">~{symbol}{gemValue.toFixed(2)}</span> of LionGems every month
        </p>

        <div
          className="rounded-xl p-3 mb-4 flex items-center gap-2.5"
          style={{
            background: `linear-gradient(135deg, ${tier.color}18, ${tier.color}06)`,
            border: `1px solid ${tier.color}30`,
          }}
        >
          <GemIcon className="h-5 w-5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-base font-black text-foreground tabular-nums leading-none">
              {numberWithCommas(tier.monthlyGems)} gems
              <span
                className="ml-1 text-xs font-semibold"
                style={{ color: tier.color }}
              >
                / month
              </span>
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">
              Plus {tier.gemsPerVote} gems every Top.gg vote
            </div>
          </div>
        </div>

        {previousTierName ? (
          <p className="text-xs font-semibold text-foreground/80 mb-3">
            Everything in{" "}
            <span style={{ color: tier.color }}>{previousTierName}</span>, plus:
          </p>
        ) : (
          <p className="text-xs font-semibold text-foreground/80 mb-3">
            Your starter pack of premium perks:
          </p>
        )}

        <ul className="space-y-2.5 flex-1 mb-5">
          {deltaPerks.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <li
                key={i}
                className={`flex items-start gap-2.5 text-sm ${
                  perk.highlight ? "" : ""
                }`}
              >
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md mt-px"
                  style={{
                    background: perk.highlight
                      ? `linear-gradient(135deg, ${tier.color}, ${tier.color}aa)`
                      : `${tier.color}1f`,
                  }}
                >
                  <Icon
                    className="h-3 w-3"
                    style={{ color: perk.highlight ? "#fff" : tier.color }}
                  />
                </span>
                <span
                  className={
                    perk.highlight
                      ? "text-foreground font-semibold"
                      : "text-foreground/85"
                  }
                >
                  {perk.label}
                </span>
              </li>
            );
          })}
        </ul>

        {renderButton()}
        {renderRiskReversal()}
      </div>
    </div>
  );
}
// --- END AI-MODIFIED ---
// --- END AI-REPLACED ---

// --- AI-REPLACED (2026-04-24) ---
// Reason: Replaced by always-visible ComparisonGrid component.
// What the new code does better: Card grid layout instead of crammed
// table, visible by default (no toggle), Most-Popular emphasis on
// LionHeart+, category groupings, and color-coded check / cross / dash.
// ComparisonTable kept here in case we want to roll back.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ComparisonTable() {
  const rows = [
    {
      label: "Monthly Gems",
      free: "\u2014",
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        numberWithCommas(t.monthlyGems),
    },
    {
      label: "Gems per Vote",
      free: String(FREE_TIER.gemsPerVote),
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        String(t.gemsPerVote),
    },
    {
      label: "Vote LionCoin Boost",
      free: `${FREE_TIER.lionCoinBoost}x`,
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        `${t.lionCoinBoost}x`,
    },
    {
      label: "Drop Rate Bonus",
      free: "\u2014",
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        `+${t.dropRateBonus * 100}%`,
    },
    {
      label: "Farm Growth Speed",
      free: `${FREE_TIER.farmGrowthSpeed}x`,
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        `${t.farmGrowthSpeed}x`,
    },
    {
      label: "Water Duration",
      free: `${FREE_TIER.waterDurationMultiplier}x`,
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        `${t.waterDurationMultiplier}x`,
    },
    {
      label: "Dry Penalty",
      free: `${FREE_TIER.dryPenalty * 100}%`,
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        `${t.dryPenalty * 100}%`,
    },
    {
      label: "Death Timer",
      free: `${FREE_TIER.deathTimerHours}h`,
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        t.deathTimerHours === null ? "Never" : `${t.deathTimerHours}h`,
    },
    {
      label: "Seed Discount",
      free: "\u2014",
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        `${t.seedCostDiscount * 100}%`,
    },
    {
      label: "Harvest Gold Bonus",
      free: "\u2014",
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        `+${t.harvestGoldBonus * 100}%`,
    },
    {
      label: "Uproot Refund",
      free: `${FREE_TIER.uprootRefund * 100}%`,
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        `${t.uprootRefund * 100}%`,
    },
    {
      label: "Animated Cards",
      free: "\u2014",
      values: () => "\u2713",
    },
    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Server Premium row in comparison table
    {
      label: "Server Premium",
      free: "\u2014",
      values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
        t.includesServerPremium ? "1 server" : "\u2014",
    },
    // --- END AI-MODIFIED ---
  ];

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-sm border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">
              Perk
            </th>
            <th className="py-3 px-3 text-muted-foreground font-medium text-center">
              Free
            </th>
            {TIER_ORDER.map((tierId) => (
              <th
                key={tierId}
                className="py-3 px-3 font-bold text-center"
                style={{ color: SUBSCRIPTION_TIERS[tierId].color }}
              >
                {SUBSCRIPTION_TIERS[tierId].name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/60 hover:bg-card/50 transition-colors"
            >
              <td className="py-3 px-4 text-foreground/85 font-medium">
                {row.label}
              </td>
              <td className="py-3 px-3 text-muted-foreground/70 text-center">
                {row.free}
              </td>
              {TIER_ORDER.map((tierId) => (
                <td
                  key={tierId}
                  className="py-3 px-3 text-center font-medium"
                  style={{ color: SUBSCRIPTION_TIERS[tierId].color }}
                >
                  {row.values(SUBSCRIPTION_TIERS[tierId])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
// --- END AI-REPLACED ---

// --- AI-REPLACED (2026-04-01) ---
// Reason: Complete redesign of Server Premium showcase section
// What the new code does better: Full-width, demo-rich feature showcase with interactive visual demos
//   for every premium feature (6 tabbed demos + 4 feature cards), replacing the cramped branding-focused layout
// --- Original code (commented out for rollback) ---
// const DEMO_SKINS = [
//   { id: "obsidian", name: "Obsidian", accent: "#6366f1", swatches: [...] },
//   { id: "cotton_candy", name: "Cotton Candy", accent: "#FF69B4", swatches: [...] },
//   { id: "boston_blue", name: "Boston Blue", accent: "#3B82C4", swatches: [...] },
//   { id: "platinum", name: "Platinum", accent: "#A0A0B0", swatches: [...] },
// ];
// function ServerPremiumShowcase({ currency, symbol }) {
//   ... ~520 lines: Two-column layout with card carousel on left, fake branding editor +
//   checklist + pricing on right. Mock skin selector with color swatches. All features
//   crammed into 8-item checklist at 13px. Single card type (profile) shown.
//   My Server Premiums panel at the bottom.
// }
// --- End original code ---

const DEMO_SKINS = [
  { id: "obsidian", name: "Obsidian", accent: "#6366f1" },
  { id: "cotton_candy", name: "Cotton Candy", accent: "#FF69B4" },
  { id: "boston_blue", name: "Boston Blue", accent: "#3B82C4" },
  { id: "platinum", name: "Platinum", accent: "#A0A0B0" },
];

const DEMO_CARD_TYPES = ["profile", "stats", "leaderboard"];

const POMO_THEMES = [
  { id: "neon", color: "#22d3ee", label: "Neon", glow: "rgba(34,211,238,0.15)" },
  { id: "forest", color: "#22c55e", label: "Forest", glow: "rgba(34,197,94,0.15)" },
  { id: "ocean", color: "#3b82f6", label: "Ocean", glow: "rgba(59,130,246,0.15)" },
  { id: "sakura", color: "#f472b6", label: "Sakura", glow: "rgba(244,114,182,0.15)" },
  { id: "sunset", color: "#f97316", label: "Sunset", glow: "rgba(249,115,22,0.15)" },
  { id: "midnight", color: "#6366f1", label: "Midnight", glow: "rgba(99,102,241,0.15)" },
];

const AMBIENT_SOUNDS = [
  { id: "rain", name: "Rain", Icon: CloudRain },
  { id: "campfire", name: "Campfire", Icon: Flame },
  { id: "ocean", name: "Ocean Waves", Icon: Waves },
  { id: "brown_noise", name: "Brown Noise", Icon: Wind },
  { id: "white_noise", name: "White Noise", Icon: Radio },
  { id: "lofi", name: "LoFi", Icon: Music },
];

const FEATURE_GROUP_TAGS = [
  "Rank Notifications", "Welcome & Goodbye", "Economy & Coins",
  "Study Sessions", "Reminders", "Tasks & To-Do", "Pomodoro Timer",
  "Moderation", "Profile & Stats", "Leaderboard", "Role Menus",
  "LionGotchi Pet", "Button Labels", "Goals Cards",
];

const PREMIUM_TABS = [
  { id: "branding", label: "Visual Branding", Icon: Palette },
  { id: "text", label: "Text Branding", Icon: Type },
  { id: "pomodoro", label: "Pomodoro", Icon: Timer },
  { id: "leaderboard", label: "Leaderboards", Icon: Trophy },
  { id: "sounds", label: "Sounds", Icon: Volume2 },
  { id: "liongotchi", label: "LionGotchi", Icon: Sparkles },
] as const;

type PremiumTabId = typeof PREMIUM_TABS[number]["id"];

const POMO_RING_R = 42;
const POMO_RING_C = 2 * Math.PI * POMO_RING_R;
const POMO_TOTAL = 25 * 60;

interface AdminServer {
  guildId: string;
  guildName: string;
  iconUrl: string | null;
}

interface ServerPremiumInfo {
  id: number;
  guildId: string;
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  transferCooldownEnds: string | null;
}

interface LionheartPremiumInfo {
  guildId: string | null;
  isApplied: boolean;
  premiumUntil: string | null;
  transferCooldownEnds: string | null;
}

function ServerPremiumShowcase({ currency, symbol }: { currency: Currency; symbol: string }) {
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<PremiumTabId>("branding");
  const [tabPaused, setTabPaused] = useState(false);

  const [activeSkin, setActiveSkin] = useState(0);
  const [activeCardType, setActiveCardType] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const loadedCount = useRef(0);

  const [showCustomText, setShowCustomText] = useState(false);

  const [pomoTheme, setPomoTheme] = useState(0);
  const [pomoElapsed, setPomoElapsed] = useState(0);

  const [activeSound, setActiveSound] = useState(0);

  const [adminServers, setAdminServers] = useState<AdminServer[]>([]);
  const [allServers, setAllServers] = useState<AdminServer[]>([]);
  const [serversLoading, setServersLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [checkingOut, setCheckingOut] = useState(false);

  const [myPaidSubs, setMyPaidSubs] = useState<ServerPremiumInfo[]>([]);
  const [myLhPremium, setMyLhPremium] = useState<LionheartPremiumInfo | null>(null);
  const [premiumsLoading, setPremiumsLoading] = useState(false);

  useEffect(() => {
    if (tabPaused) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        const idx = PREMIUM_TABS.findIndex((t) => t.id === prev);
        return PREMIUM_TABS[(idx + 1) % PREMIUM_TABS.length].id;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [tabPaused]);

  useEffect(() => {
    if (activeTab !== "branding" || !imagesReady) return;
    const timer = setInterval(() => setActiveSkin((prev) => (prev + 1) % DEMO_SKINS.length), 4000);
    return () => clearInterval(timer);
  }, [activeTab, imagesReady]);

  useEffect(() => {
    if (activeTab !== "pomodoro") return;
    const timer = setInterval(() => setPomoElapsed((e) => (e + 1) % POMO_TOTAL), 1000);
    return () => clearInterval(timer);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "text") return;
    const timer = setInterval(() => setShowCustomText((p) => !p), 4000);
    return () => clearInterval(timer);
  }, [activeTab]);

  useEffect(() => {
    if (!session) return;
    setServersLoading(true);
    fetch("/api/dashboard/servers")
      .then((r) => (r.ok ? r.json() : { servers: [] }))
      .then((data: { servers: Array<{ guildId: string; guildName: string; iconUrl: string | null; role: string; botPresent: boolean }> }) => {
        const servers = data.servers || [];
        const admins = servers.filter((s) => s.role === "admin" && s.botPresent);
        setAllServers(servers.filter((s) => s.botPresent));
        setAdminServers(admins);
        if (admins.length > 0) setSelectedServer(admins[0].guildId);
      })
      .catch(() => setAdminServers([]))
      .finally(() => setServersLoading(false));

    setPremiumsLoading(true);
    fetch("/api/subscription/my-server-premiums")
      .then((r) => (r.ok ? r.json() : { paidSubscriptions: [], lionheartServerPremium: null }))
      .then((data: { paidSubscriptions: ServerPremiumInfo[]; lionheartServerPremium: LionheartPremiumInfo | null }) => {
        setMyPaidSubs(data.paidSubscriptions || []);
        setMyLhPremium(data.lionheartServerPremium || null);
      })
      .catch(() => {})
      .finally(() => setPremiumsLoading(false));
  }, [session]);

  const handleServerCheckout = async (plan: string) => {
    if (!selectedServer) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/subscription/server-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: selectedServer, plan, currency }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to start checkout");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleImageLoad = () => {
    loadedCount.current++;
    if (loadedCount.current >= 1) setImagesReady(true);
  };

  const pomoRemaining = POMO_TOTAL - pomoElapsed;
  const pomoMins = Math.floor(pomoRemaining / 60);
  const pomoSecs = pomoRemaining % 60;
  const pomoProgress = pomoElapsed / POMO_TOTAL;
  const pomoDashOffset = POMO_RING_C * (1 - pomoProgress);
  const currentPomoTheme = POMO_THEMES[pomoTheme];

  const streakRef = useRef<HTMLDivElement>(null);
  const [streakVisible, setStreakVisible] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  useEffect(() => {
    const el = streakRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStreakVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!streakVisible) return;
    const target = 7;
    let frame: number;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / 800, 1);
      setStreakCount(Math.floor(p * target));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [streakVisible]);

  const goldRef = useRef<HTMLDivElement>(null);
  const [goldVisible, setGoldVisible] = useState(false);
  const [goldCount, setGoldCount] = useState(100);
  useEffect(() => {
    const el = goldRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGoldVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!goldVisible) return;
    let frame: number;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setGoldCount(100 + Math.floor(eased * 15));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [goldVisible]);

  return (
    <section className="py-16 lg:py-24 border-t border-border/60" id="server-premium">
      <style>{`
        @keyframes sp-eq { 0%,100%{height:4px} 50%{height:var(--eq-h)} }
        @keyframes sp-marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes sp-float { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-40px)} }
        @keyframes sp-pulse-gold { 0%,100%{box-shadow:0 0 8px rgba(234,179,8,0.3)} 50%{box-shadow:0 0 20px rgba(234,179,8,0.6)} }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {/* --- AI-MODIFIED (2026-04-24) ---
            Purpose: Restyled Server Premium header with eyebrow + audience
            label "Admins / Server-wide" so the audience switch is obvious;
            heading + subline match the rest of the page's typography. */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Server className="h-3 w-3" />
            Admins · Server-wide
          </span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Server Premium
          </h2>
          <p className="text-muted-foreground mt-3 text-base lg:text-lg max-w-2xl mx-auto">
            10+ premium features that transform how your community studies,
            competes, and grows together.
          </p>
        </div>
        {/* --- END AI-MODIFIED --- */}

        <div
          className="rounded-2xl border border-border bg-card/50 overflow-hidden"
          onMouseEnter={() => setTabPaused(true)}
          onMouseLeave={() => setTabPaused(false)}
        >
          <div className="flex overflow-x-auto border-b border-border bg-background/40 scrollbar-none">
            {PREMIUM_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setTabPaused(true); }}
                className={`flex items-center gap-2 px-3 lg:px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex-shrink-0 ${
                  activeTab === tab.id
                    ? "text-blue-400 border-blue-400 bg-blue-500/5"
                    : "text-muted-foreground/70 border-transparent hover:text-foreground/85 hover:bg-card/50"
                }`}
              >
                <tab.Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[460px]">
            <div className="p-6 lg:p-8 flex flex-col justify-center">
              {activeTab === "branding" && (
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Custom Visual Branding</h3>
                  <p className="text-muted-foreground mb-4 text-sm">Custom skins and colors for all 7 card types, applied server-wide to every member.</p>
                  <div className="space-y-2 text-sm">
                    {["Profile, Stats, Weekly, Monthly, Goals & Leaderboard cards",
                      "7 premium base skins to choose from",
                      "Custom color overrides for every element",
                      "Applies automatically to all members",
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-foreground/85">
                        <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" /> {t}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    {DEMO_CARD_TYPES.map((ct, i) => (
                      <button
                        key={ct}
                        onClick={() => setActiveCardType(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          activeCardType === i
                            ? "bg-white/10 text-white border-white/20"
                            : "text-muted-foreground/70 border-transparent hover:text-foreground/85 hover:border-border"
                        }`}
                      >
                        {ct.charAt(0).toUpperCase() + ct.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "text" && (
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Text Branding</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Rewrite any of the bot&apos;s 2,372 messages to match your community&apos;s voice.
                  </p>
                  <div className="space-y-2 text-sm">
                    {["2,372 customizable strings across 35 categories",
                      "Export & import text bundles between servers",
                      "Smart placeholders for dynamic content",
                      "Up to 10,000 overrides (vs 3 for free)",
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-foreground/85">
                        <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "pomodoro" && (
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Premium Pomodoro</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Advanced focus tools with themed timers, streaks, and analytics for your community.
                  </p>
                  <div className="space-y-2 text-sm">
                    {["Focus roles assigned during sessions",
                      "10 timer themes (Neon, Forest, Ocean, Sakura...)",
                      "Streak tracking & milestone rewards",
                      "Session summaries & golden hour",
                      "Analytics dashboard with heatmaps",
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-foreground/85">
                        <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "leaderboard" && (
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Leaderboard Auto-Post</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Scheduled leaderboard posts that keep your community competitive and engaged.
                  </p>
                  <div className="space-y-2 text-sm">
                    {["Automated daily, weekly, or monthly posts",
                      "Role rewards for top performers",
                      "Coin prizes & winner DMs",
                      "Custom announcement text & channel",
                      "Include rendered leaderboard images",
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-foreground/85">
                        <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- AI-MODIFIED (2026-04-03) --- */}
              {/* Purpose: Updated to 10 bots, added LoFi mention and private room rental */}
              {activeTab === "sounds" && (
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Ambient Sound & LoFi Bots</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Background audio bots that create the perfect study atmosphere in voice channels.
                  </p>
                  <div className="space-y-2 text-sm">
                    {["Up to 10 simultaneous bot slots",
                      "Ambient sounds: rain, campfire, ocean, noise & more",
                      "LoFi music with curated playlists & Now Playing",
                      "Member voting for sound selection",
                      "Members can rent bots for private rooms",
                      "Managed from the dashboard",
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-foreground/85">
                        <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* --- END AI-MODIFIED --- */}

              {activeTab === "liongotchi" && (
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">LionGotchi Bonuses</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Boost the entire LionGotchi economy for every member in your server.
                  </p>
                  <div className="space-y-2 text-sm">
                    {["+15% gold from all activities server-wide",
                      "+15% drop rate on item drops for all members",
                      "Stacks with personal LionHeart bonuses",
                      "Applies automatically \u2014 no member action needed",
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-foreground/85">
                        <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative bg-background/60 border-t lg:border-t-0 lg:border-l border-border flex items-center justify-center p-6 lg:p-8 overflow-hidden min-h-[320px]">
              {activeTab === "branding" && (
                <div className="relative w-full h-full flex items-center justify-center min-h-[320px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.06),_transparent_70%)]" />
                  {!hasError && DEMO_SKINS.map((skin, i) => (
                    <img
                      key={`${skin.id}-${DEMO_CARD_TYPES[activeCardType]}`}
                      src={`/api/card-demo?type=${DEMO_CARD_TYPES[activeCardType]}&skin=${skin.id}`}
                      alt={`${skin.name} card`}
                      className="absolute max-w-[260px] w-full h-auto rounded-lg shadow-2xl"
                      style={{
                        opacity: i === activeSkin ? 1 : 0,
                        transform: i === activeSkin ? "scale(1) translateY(0)" : "scale(0.95) translateY(10px)",
                        transition: "opacity 0.7s ease, transform 0.7s ease",
                      }}
                      onLoad={handleImageLoad}
                      onError={() => setHasError(true)}
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  ))}
                  {hasError && (
                    <div className="text-center text-muted-foreground/70">
                      <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Card preview temporarily unavailable</p>
                    </div>
                  )}
                  {!imagesReady && !hasError && (
                    <div className="w-[240px] h-[310px] rounded-lg bg-muted/30 animate-pulse flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-muted-foreground/70 animate-spin" />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {DEMO_SKINS.map((skin, i) => (
                        <button key={skin.id} onClick={() => setActiveSkin(i)} className="p-0.5" aria-label={`Show ${skin.name} skin`}>
                          <div className={`h-1.5 rounded-full transition-all duration-300 ${i === activeSkin ? "bg-white w-5" : "bg-white/25 w-1.5 hover:bg-white/40"}`} />
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground/60">Rendered by LionBot</span>
                  </div>
                </div>
              )}

              {activeTab === "text" && (
                <div className="w-full max-w-sm">
                  <div className="flex gap-1.5 mb-3">
                    <button
                      onClick={() => setShowCustomText(false)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!showCustomText ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground/70 hover:text-foreground/85"}`}
                    >Default</button>
                    <button
                      onClick={() => setShowCustomText(true)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${showCustomText ? "bg-amber-500/20 text-amber-400" : "text-muted-foreground/70 hover:text-foreground/85"}`}
                    >Your Server</button>
                  </div>
                  <div className="rounded-lg border border-[#2b2d31] bg-[#313338] overflow-hidden">
                    <div className="px-3 py-2.5 flex gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">L</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-semibold text-xs text-[#f2f3f5]">Leo</span>
                          <span className="text-[8px] px-1 py-px rounded bg-[#5865f2] text-white font-medium leading-none">BOT</span>
                        </div>
                        <div className="mt-1 rounded border-l-[3px] bg-[#2b2d31] overflow-hidden" style={{ borderLeftColor: showCustomText ? "#f59e0b" : "#3b82f6", transition: "border-color 0.4s" }}>
                          <div className="p-2.5">
                            <div className="text-xs font-semibold text-white mb-1" style={{ transition: "all 0.4s" }}>
                              {showCustomText ? "\u{1f389} You just hit Gold Scholar!" : "Rank Up!"}
                            </div>
                            <div className="text-[11px] text-[#dbdee1] leading-relaxed" style={{ transition: "all 0.4s" }}>
                              {showCustomText
                                ? "Keep grinding, you beast! \u{1f525} Next stop: Diamond."
                                : "Congratulations! You have reached Gold Scholar. Keep studying to reach the next rank."}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden mt-4 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background/60 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/60 to-transparent z-10 pointer-events-none" />
                    <div className="flex gap-2" style={{ animation: "sp-marquee 25s linear infinite" }}>
                      {[...FEATURE_GROUP_TAGS, ...FEATURE_GROUP_TAGS].map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-card text-muted-foreground text-[10px] whitespace-nowrap border border-border/80">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground/60 mt-2">2,372 strings across 35 categories</p>
                </div>
              )}

              {activeTab === "pomodoro" && (
                <div className="flex flex-col items-center gap-4 w-full max-w-xs" ref={streakRef}>
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-xl transition-all duration-700" style={{ background: `radial-gradient(circle, ${currentPomoTheme.glow} 0%, transparent 70%)` }} />
                    <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90 relative">
                      <circle cx="50" cy="50" r={POMO_RING_R} fill="none" strokeWidth="3" className="stroke-border" />
                      <circle cx="50" cy="50" r={POMO_RING_R} fill="none" strokeWidth="3.5" strokeLinecap="round"
                        stroke={currentPomoTheme.color}
                        strokeDasharray={POMO_RING_C} strokeDashoffset={pomoDashOffset}
                        className="transition-[stroke-dashoffset] duration-1000 ease-linear" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-foreground font-mono tabular-nums">
                        {String(pomoMins).padStart(2, "0")}:{String(pomoSecs).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] text-muted-foreground/70 mt-0.5">remaining</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {POMO_THEMES.map((th, i) => (
                      <button key={th.id} onClick={() => setPomoTheme(i)} title={th.label}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${i === pomoTheme ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
                        style={{ backgroundColor: th.color }}
                      />
                    ))}
                  </div>
                  <div className="w-full rounded-lg bg-card/80 border border-border/80 p-3">
                    <p className="text-[9px] text-muted-foreground/70 uppercase tracking-wider mb-2 font-medium">Premium Analytics</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center">
                          <Zap className="h-3.5 w-3.5 text-orange-400" />
                        </div>
                        <div>
                          <span className="text-lg font-bold text-foreground tabular-nums">{streakCount}</span>
                          <span className="text-[9px] text-muted-foreground/70 block">Day Streak</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                          <Star className="h-3.5 w-3.5 text-yellow-400" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground">100 Sessions</span>
                          <span className="text-[9px] text-muted-foreground/70 block">Milestone</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end gap-1 mt-3 h-8">
                      {[40, 65, 50, 80, 70, 90, 55].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm transition-all duration-700"
                          style={{ height: streakVisible ? `${h}%` : "4px", backgroundColor: currentPomoTheme.color, opacity: 0.6 + (h / 100) * 0.4, transitionDelay: `${i * 80}ms` }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <span key={i} className="flex-1 text-center text-[8px] text-muted-foreground/60">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "leaderboard" && (
                <div className="w-full max-w-sm">
                  <div className="rounded-lg border border-[#2b2d31] bg-[#313338] overflow-hidden">
                    <div className="px-3 py-2.5 flex gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">L</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-semibold text-xs text-[#f2f3f5]">Leo</span>
                          <span className="text-[8px] px-1 py-px rounded bg-[#5865f2] text-white font-medium leading-none">BOT</span>
                        </div>
                        <div className="text-[11px] text-[#dbdee1] mb-1">{"\u{1f3c6}"} Weekly Study Leaderboard</div>
                        <div className="rounded border-l-[3px] border-blue-500 bg-[#2b2d31] overflow-hidden">
                          <div className="p-2.5">
                            <div className="text-xs font-semibold text-white mb-2">{"\u{1f4ca}"} Top Studiers This Week</div>
                            <div className="space-y-1.5 text-[11px]">
                              <div className="flex items-center gap-2"><span>{"\u{1f947}"}</span><span className="text-[#f2f3f5] font-medium">Sarah</span><span className="text-[#949ba4] ml-auto">42h 15m</span></div>
                              <div className="flex items-center gap-2"><span>{"\u{1f948}"}</span><span className="text-[#f2f3f5] font-medium">Alex</span><span className="text-[#949ba4] ml-auto">38h 42m</span></div>
                              <div className="flex items-center gap-2"><span>{"\u{1f949}"}</span><span className="text-[#f2f3f5] font-medium">Mike</span><span className="text-[#949ba4] ml-auto">35h 08m</span></div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-[#3f4147] text-[10px] text-[#949ba4]">
                              {"\u{1f3c5}"} Role: <span className="text-blue-400">@Weekly Champion</span> &bull; {"\u{1fa99}"} Prize: <span className="text-yellow-400">500 coins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sounds" && (
                <div className="w-full max-w-xs">
                  <div className="grid grid-cols-3 gap-2">
                    {AMBIENT_SOUNDS.map((sound, i) => {
                      const isActive = i === activeSound;
                      return (
                        <button
                          key={sound.id}
                          onClick={() => setActiveSound(i)}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                            isActive
                              ? "bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5"
                              : "bg-card/50 border-border/60 hover:border-input"
                          }`}
                        >
                          <sound.Icon className={`h-6 w-6 transition-colors ${isActive ? "text-blue-400" : "text-muted-foreground/70"}`} />
                          <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-blue-300" : "text-muted-foreground/70"}`}>{sound.name}</span>
                          {isActive && (
                            <div className="absolute top-2 right-2 flex items-end gap-px h-3">
                              {[10, 14, 8, 12].map((h, j) => (
                                <div key={j} className="w-[3px] bg-blue-400 rounded-full"
                                  style={{ animation: "sp-eq 0.8s ease-in-out infinite", animationDelay: `${j * 0.12}s`, ["--eq-h" as string]: `${h}px`, height: "3px" }} />
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Playing in #study-lounge
                  </div>
                </div>
              )}

              {activeTab === "liongotchi" && (
                <div className="flex flex-col items-center gap-6 w-full max-w-xs" ref={goldRef}>
                  <div className="flex gap-4 w-full">
                    <div className="flex-1 rounded-xl bg-card/80 border border-yellow-500/20 p-4 text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-yellow-500/15 flex items-center justify-center mb-2"
                        style={{ animation: goldVisible ? "sp-pulse-gold 2s ease-in-out infinite" : "none" }}>
                        <Coins className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div className="text-2xl font-bold text-foreground tabular-nums">{goldCount}</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">gold per session</div>
                      <div className="mt-2 inline-flex px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] font-bold">+15%</div>
                    </div>
                    <div className="flex-1 rounded-xl bg-card/80 border border-purple-500/20 p-4 text-center relative overflow-hidden">
                      <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/15 flex items-center justify-center mb-2">
                        <Sparkles className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">15%</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">bonus drop rate</div>
                      <div className="mt-2 w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full transition-all duration-1000 ease-out" style={{ width: goldVisible ? "100%" : "0%" }} />
                      </div>
                      {goldVisible && [0, 1, 2].map((j) => (
                        <div key={j} className="absolute text-sm"
                          style={{ left: `${25 + j * 25}%`, bottom: "60%", animation: `sp-float 2s ease-out ${j * 0.4 + 0.5}s both` }}>
                          {["\u{2694}\u{FE0F}", "\u{1f48e}", "\u{1f9ea}"][j]}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 text-center">Applied to every member automatically</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="rounded-xl bg-card/50 border border-border/60 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Pin className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Sticky Messages</div>
              <div className="text-[11px] text-muted-foreground/70 mt-0.5">Persistent announcements pinned to the bottom of any channel</div>
            </div>
          </div>
          <div className="rounded-xl bg-card/50 border border-border/60 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Voice Time Editor</div>
              <div className="text-[11px] text-muted-foreground/70 mt-0.5">Admin control to adjust member voice time stats</div>
            </div>
          </div>
          <div className="rounded-xl bg-card/50 border border-border/60 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <EyeOff className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">No Ads</div>
              <div className="text-[11px] text-muted-foreground/70 mt-0.5">Vote &amp; sponsor prompts removed from all bot messages</div>
            </div>
          </div>
          <div className="rounded-xl bg-card/50 border border-border/60 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Priority Features</div>
              <div className="text-[11px] text-muted-foreground/70 mt-0.5">Propose &amp; vote on what gets built next</div>
            </div>
          </div>
        </div>

        {/* --- AI-MODIFIED (2026-04-24) ---
            Purpose: Restyled commerce footer with cleaner hierarchy:
            - Top row: pricing + savings badge
            - Bottom row: server selector + dual buttons in equal slots
            - Risk-reversal microcopy under the buttons (matches LionHeart
              tier cards: "Cancel anytime · Secure with Stripe · Instant
              activation") for consistency. */}
        <div className="mt-8 rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
          <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-10 items-start">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                One server price
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                  {symbol}
                  {getServerPremiumPrice("MONTHLY", currency)}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">or</span>
                <span className="font-bold text-foreground">
                  {symbol}{getServerPremiumPrice("YEARLY", currency)}/year
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Save 17%
                </span>
              </div>
            </div>

            <div className="lg:border-l lg:border-border/60 lg:pl-10">
              {!session ? (
                <div className="space-y-2">
                  <button
                    onClick={() => signIn("discord")}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
                  >
                    Sign in with Discord to subscribe
                  </button>
                  <p className="text-[11px] text-muted-foreground text-center">
                    You'll select a server after signing in.
                  </p>
                </div>
              ) : serversLoading ? (
                <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading your servers…
                </div>
              ) : adminServers.length === 0 ? (
                <div className="rounded-xl border border-border bg-background/60 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    You need to be an admin of a server with LionBot to subscribe.{" "}
                    <a href="/invite" className="text-blue-400 hover:underline font-semibold">
                      Add LionBot
                    </a>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                    Apply to server
                  </label>
                  <select
                    value={selectedServer}
                    onChange={(e) => setSelectedServer(e.target.value)}
                    className="w-full rounded-xl bg-background border border-border text-foreground text-sm px-3 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {adminServers.map((s) => (
                      <option key={s.guildId} value={s.guildId}>
                        {s.guildName}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleServerCheckout("MONTHLY")}
                      disabled={checkingOut}
                      className="px-3 py-3 rounded-xl bg-background border border-border hover:border-blue-500/50 hover:bg-card text-foreground text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {checkingOut ? "…" : `Monthly · ${symbol}${getServerPremiumPrice("MONTHLY", currency)}`}
                    </button>
                    <button
                      onClick={() => handleServerCheckout("YEARLY")}
                      disabled={checkingOut}
                      className="px-3 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all disabled:opacity-50 relative overflow-hidden shadow-lg shadow-blue-500/20"
                    >
                      {checkingOut ? "…" : `Yearly · ${symbol}${getServerPremiumPrice("YEARLY", currency)}`}
                      <span className="absolute top-0 right-0 bg-emerald-500 text-[9px] text-white font-bold px-1.5 py-0.5 rounded-bl-md">
                        SAVE
                      </span>
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center mt-1">
                    Cancel anytime · Secure with Stripe · Instant activation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* --- END AI-MODIFIED --- */}
      </div>

      {session && !premiumsLoading && (myPaidSubs.filter(s => s.status === "ACTIVE" || s.status === "CANCELLING").length > 0 || myLhPremium) && (
        <div className="max-w-6xl mx-auto px-4 lg:px-6 mt-6">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm lg:text-base font-bold text-foreground flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-400" />
                My active Server Premiums
              </h3>
              <a href="/dashboard/subscriptions" className="text-xs lg:text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors font-semibold">
                Manage <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="space-y-2.5">
              {myPaidSubs
                .filter((s) => s.status === "ACTIVE" || s.status === "CANCELLING" || s.status === "PAST_DUE")
                .map((s) => {
                  const serverName = allServers.find((sv) => sv.guildId === s.guildId)?.guildName || `Server ${s.guildId}`;
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/60">
                      <div className="flex items-center gap-3">
                        <Server className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-foreground">{serverName}</div>
                          <div className="text-xs text-muted-foreground/70">
                            {s.plan === "YEARLY" ? "Yearly" : "Monthly"} &middot;{" "}
                            {s.currentPeriodEnd ? `Renews ${new Date(s.currentPeriodEnd).toLocaleDateString()}` : ""}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        s.status === "ACTIVE" ? "bg-green-500/20 text-green-400"
                        : s.status === "CANCELLING" ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                      }`}>
                        {s.status === "ACTIVE" ? "Active" : s.status === "CANCELLING" ? "Cancelling" : "Past Due"}
                      </span>
                    </div>
                  );
                })}
              {myLhPremium && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <Crown className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {myLhPremium.isApplied
                          ? allServers.find((sv) => sv.guildId === myLhPremium.guildId)?.guildName || `Server ${myLhPremium.guildId}`
                          : "Not applied yet"}
                      </div>
                      <div className="text-xs text-blue-400 font-medium">LionHeart++ included</div>
                    </div>
                  </div>
                  {myLhPremium.isApplied ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Active</span>
                  ) : (
                    <a href="/dashboard/subscriptions" className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">Apply Now</a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
// --- END AI-REPLACED ---

export default function Donate() {
  const { t } = useTranslation("donate");
  const { data: session } = useSession();
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Add currency hook for EUR/USD toggle
  const { currency, setCurrency, symbol } = useCurrency();
  // --- END AI-MODIFIED ---
  const [selectedItem, setSelectedItem] = useState<
    (typeof DonationsData)[0] | null
  >(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchSubscriptionStatus = useCallback(async () => {
    setSubLoading(true);
    try {
      const r = await fetch("/api/subscription/status");
      if (r.ok) {
        const data = await r.json();
        setSubStatus(data);
      }
    } catch {
      // Non-critical; user just won't see their sub status
    } finally {
      setSubLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchSubscriptionStatus();
    }
  }, [session, fetchSubscriptionStatus]);

  // Re-fetch status when returning from Stripe portal or after successful subscription
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscription") === "success") {
      setShowSuccess(true);
      fetchSubscriptionStatus();
    } else if (params.get("portal") === "returned") {
      fetchSubscriptionStatus();
    }
    if (params.has("portal") || params.has("subscription")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("portal");
      url.searchParams.delete("subscription");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [fetchSubscriptionStatus]);

  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Pass currency to subscription checkout
  const handleSubscribe = useCallback(
    async (tier: SubscriptionTier) => {
      if (subscribing) return;
      setSubscribing(true);
      setPortalError(null);
      try {
        const res = await fetch("/api/subscription/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier, currency }),
        });
  // --- END AI-MODIFIED ---
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else if (data.error) {
          setPortalError(data.error);
        }
      } catch {
        setPortalError("Something went wrong. Please try again.");
      } finally {
        setSubscribing(false);
      }
    },
    [subscribing, currency]
  );

  const handleManageSubscription = useCallback(async () => {
    if (portalLoading) return;
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/subscription/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setPortalError(data.error);
      }
    } catch {
      setPortalError("Could not open subscription management. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }, [portalLoading]);

  const hasActiveSub =
    subStatus &&
    (subStatus.status === "ACTIVE" ||
      subStatus.status === "CANCELLING" ||
      subStatus.status === "PAST_DUE");

  return (
    <Layout SEO={DonationSEO}>
      {/* --- AI-MODIFIED (2026-04-24) ---
          Purpose: Sticky pricing CTA bar slides in once the user has
          scrolled past the tier cards section. Removes the "I have to
          scroll back up to buy" friction and recovers conversion at
          the bottom of the page. */}
      <StickyPricingBar
        recommendedTierId="LIONHEART_PLUS"
        currency={currency}
        symbol={symbol}
        onSubscribe={(tierId) => handleSubscribe(tierId)}
        isCurrent={hasActiveSub && subStatus?.tier === "LIONHEART_PLUS"}
      />
      {/* --- END AI-MODIFIED --- */}
      <div className="bg-background min-h-screen">
        <style>{`
          @keyframes shimmerSweep {
            0%, 100% { transform: translateX(-100%); }
            40% { transform: translateX(100%); }
          }
          .shimmer-sweep {
            animation: shimmerSweep 4s ease-in-out infinite;
          }
          @keyframes tier-border {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes tier-halo {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.85; transform: scale(1.05); }
          }
          @keyframes tier-shimmer {
            0%, 100% { transform: translateX(-120%) skewX(-15deg); }
            50% { transform: translateX(120%) skewX(-15deg); }
          }
          @keyframes tier-pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.08); opacity: 0.85; }
          }
          @keyframes tier-sparkle {
            0%, 100% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>

        {/* --- AI-MODIFIED (2026-04-24) --- */}
        {/* Purpose: Redesigned hero -- split layout, animated showcase on the right,
            inline currency toggle (no more floating pill that overlapped content on mobile),
            micro-trust line under CTAs.
            --- Original code (commented out for rollback) ---
            // <div className="fixed bottom-6 right-6 z-50"> ... sticky floating EUR/USD pill ... </div>
            // <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden">
            //   <div className="text-center">
            //     <h1>Support LionBot</h1>
            //     <p>Become a LionHeart supporter to unlock exclusive perks...</p>
            //     <div>View Plans / Buy LionGems</div>
            //   </div>
            // </section>
            --- End original code --- */}
        <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-20 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 800px 500px at 30% 20%, rgba(244, 114, 182, 0.10), transparent 60%), radial-gradient(ellipse 700px 500px at 80% 60%, rgba(59, 130, 246, 0.08), transparent 60%), radial-gradient(ellipse 600px 400px at 60% 90%, rgba(168, 85, 247, 0.06), transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] items-center gap-10 lg:gap-12">
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-pink-300">
                  <Crown className="h-3 w-3" />
                  Premium that pays you back
                </span>
                <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-foreground tracking-tight leading-[1.05]">
                  Make your community feel{" "}
                  <span
                    className="text-transparent bg-clip-text"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #f472b6, #a855f7 50%, #f59e0b)",
                    }}
                  >
                    premium
                  </span>
                </h1>
                <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  LionHeart unlocks animated glowing profile cards, monthly LionGems, faster farms, and bonuses on everything you already do. Cancel anytime.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-7 justify-center lg:justify-start">
                  <a
                    href="#tiers"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .querySelector("#tiers")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold transition-all hover:translate-y-[-1px]"
                    style={{
                      background:
                        "linear-gradient(135deg, #f472b6, #a855f7)",
                      boxShadow:
                        "0 12px 32px rgba(244, 114, 182, 0.45), inset 0 -2px 0 rgba(0,0,0,0.15)",
                    }}
                  >
                    <Crown className="h-4 w-4" />
                    See LionHeart plans
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href="#gems"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .querySelector("#gems")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card/40 text-foreground font-semibold hover:bg-card hover:border-input transition-colors"
                  >
                    <GemIcon className="h-5 w-5" />
                    Buy LionGems
                  </a>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-green-400" />
                    Cancel anytime
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-blue-400" />
                    Secure with Stripe
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-yellow-400" />
                    30-second checkout
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-2 justify-center lg:justify-start">
                  <span className="text-[11px] text-muted-foreground/80 uppercase tracking-wider font-semibold">
                    Currency
                  </span>
                  <div className="inline-flex rounded-full border border-border bg-card/60 backdrop-blur-sm p-0.5">
                    <button
                      onClick={() => setCurrency("eur")}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        currency === "eur"
                          ? "bg-foreground text-background shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      &euro; EUR
                    </button>
                    <button
                      onClick={() => setCurrency("usd")}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        currency === "usd"
                          ? "bg-foreground text-background shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      $ USD
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative w-full max-w-[480px] mx-auto lg:max-w-none">
                <HeroShowcase />
              </div>
            </div>
          </div>
        </section>

        <AudienceChooser />

        <ValuePillars />
        {/* --- END AI-MODIFIED --- */}

        {/* Success banner */}
        {showSuccess && (
          <div className="max-w-6xl mx-auto px-4 lg:px-6 mb-8">
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-center justify-center gap-2 text-green-400">
              <Check className="h-5 w-5 flex-shrink-0" />
              <span>Your LionHeart subscription is now active! Welcome aboard!</span>
              <button
                onClick={() => setShowSuccess(false)}
                className="ml-3 text-green-400/60 hover:text-green-300 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Portal error banner */}
        {portalError && (
          <div className="max-w-6xl mx-auto px-4 lg:px-6 mb-6">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{portalError}</span>
              </div>
              <button
                onClick={() => setPortalError(null)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Subscription Tiers */}
        {/* --- AI-MODIFIED (2026-04-24) ---
            Purpose: Refreshed tiers section header, wider grid container so the featured
            LionHeart+ card has visual room to breathe at scale-1.05 on lg screens, larger
            gap so the animated halo doesn't bleed into neighbouring cards. */}
        <section id="tiers" className="relative py-16 lg:py-20 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Crown className="h-3 w-3" />
                LionHeart Plans
              </span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                Pick the LionHeart that fits you
              </h2>
              <p className="text-muted-foreground mt-3 text-base lg:text-lg max-w-xl mx-auto">
                Three tiers. Real perks. Every plan pays you back in monthly LionGems.
              </p>
            </div>

            {/* Subscription management banner */}
            {hasActiveSub && subStatus && (
              <div className="mb-10">
                <SubscriptionManagementBanner
                  subStatus={subStatus}
                  onManage={handleManageSubscription}
                  portalLoading={portalLoading}
                  symbol={symbol}
                />
              </div>
            )}

            {/* --- AI-MODIFIED (2026-04-24) ---
                Purpose: Desktop = 3-column grid (md+). Mobile = horizontal
                snap-scroll carousel via TierCarousel so LionHeart+ is
                centered on first paint instead of hidden between two
                stacked cards. Recovers mobile conversion. */}
            <div className="hidden md:grid grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {TIER_ORDER.map((tierId) => (
                <SubscriptionCard
                  key={tierId}
                  tierId={tierId}
                  subStatus={subStatus}
                  onSubscribe={handleSubscribe}
                  onManage={handleManageSubscription}
                  featured={tierId === "LIONHEART_PLUS"}
                  subscribing={subscribing}
                  portalLoading={portalLoading}
                  currency={currency}
                  symbol={symbol}
                />
              ))}
            </div>
            <div className="md:hidden">
              <TierCarousel
                centerIndex={TIER_ORDER.indexOf("LIONHEART_PLUS")}
                ariaLabel="LionHeart subscription tiers"
              >
                {TIER_ORDER.map((tierId) => (
                  <SubscriptionCard
                    key={tierId}
                    tierId={tierId}
                    subStatus={subStatus}
                    onSubscribe={handleSubscribe}
                    onManage={handleManageSubscription}
                    featured={tierId === "LIONHEART_PLUS"}
                    subscribing={subscribing}
                    portalLoading={portalLoading}
                    currency={currency}
                    symbol={symbol}
                  />
                ))}
              </TierCarousel>
            </div>
            {/* --- END AI-MODIFIED --- */}

          </div>
        </section>
        {/* --- END AI-MODIFIED --- */}

        {/* --- AI-MODIFIED (2026-04-24) ---
            Purpose: Replace hidden ComparisonTable with always-visible
            ComparisonGrid + loss-aversion strip directly after, so the
            user sees full feature parity AND the cost of staying on Free
            in one continuous reading flow. */}
        <ComparisonGrid currency={currency} symbol={symbol} />
        <LossAversionStrip />
        {/* --- END AI-MODIFIED --- */}

        <ServerPremiumShowcase currency={currency} symbol={symbol} />

        {/* Gem Packages */}
        {/* --- AI-MODIFIED (2026-04-24) ---
            Purpose: Redesigned gem packages section with:
            - "What you can do with gems" sidebar (4 icons, removes "what
              even are gems?" friction for non-LionHeart visitors)
            - 2-column responsive grid for the packs (sidebar on lg, full
              width below)
            - "Best Value" badge on the 99.99 pack (highest gems/€ ratio)
            - "Most Popular" badge on the 14.99 pack (sweet-spot price)
            - Per-pack gems-per-currency-unit micro line so the value
              comparison is obvious without doing math */}
        <section
          id="gems"
          className="py-16 lg:py-20 border-t border-border/60 scroll-mt-20"
        >
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <GemIcon className="h-3 w-3" />
                One-time purchase
              </span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                LionGem Packages
              </h2>
              <p className="text-muted-foreground mt-3 text-base lg:text-lg max-w-xl mx-auto">
                Top up your gem stash anytime. Use them for profile skins, gifts,
                premium pet items, and more.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 lg:gap-8">
              {/* Pack grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {DonationsData.map((item, idx) => {
                  const totalGems = item.tokens + item.tokens_bonus;
                  const price = currency === "usd" ? item.amount_usd : item.amount;
                  const gemsPerUnit = Math.round(totalGems / price);
                  const isBestValue = idx === DonationsData.length - 1;
                  const isPopular = idx === 2;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`relative rounded-2xl border bg-card/60 backdrop-blur-sm transition-all duration-300 p-5 text-left group hover:-translate-y-1 ${
                        isBestValue
                          ? "border-emerald-500/40 hover:border-emerald-500/70 shadow-[0_0_30px_-12px] shadow-emerald-500/30"
                          : isPopular
                          ? "border-pink-500/40 hover:border-pink-500/70 shadow-[0_0_30px_-12px] shadow-pink-500/30"
                          : "border-border hover:border-blue-500/40"
                      }`}
                    >
                      {isBestValue && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-500/40 whitespace-nowrap">
                          <Sparkles className="h-3 w-3" />
                          Best Value
                        </span>
                      )}
                      {isPopular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-pink-500/40 whitespace-nowrap">
                          Most Popular
                        </span>
                      )}
                      <div className="flex items-center justify-center h-32 mb-3">
                        <Image
                          src={item.image}
                          alt={`${item.tokens} LionGems`}
                          width={120}
                          height={120}
                          objectFit="contain"
                        />
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-blue-400">
                          <GemIcon className="h-5 w-5" />
                          {numberWithCommas(item.tokens)}
                        </div>
                        {item.tokens_bonus > 0 && (
                          <div className="text-xs text-emerald-400/90 mt-0.5 font-semibold">
                            +{numberWithCommas(item.tokens_bonus)} bonus gems
                          </div>
                        )}
                        <div className="mt-3 text-2xl font-bold text-foreground">
                          {symbol}
                          {price.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-muted-foreground/80 mt-1">
                          ≈ {gemsPerUnit.toLocaleString()} gems / {symbol}1
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* "What you can do with gems" sidebar */}
              <aside className="lg:sticky lg:top-24 self-start rounded-2xl border border-border bg-gradient-to-br from-card via-card/80 to-blue-500/5 backdrop-blur-sm p-5 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                    <GemIcon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    What gems unlock
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    {
                      icon: Palette,
                      title: "Profile skins",
                      sub: "Animated cards, themes, frames",
                      color: "text-pink-400",
                      bg: "bg-pink-500/10",
                    },
                    {
                      icon: Star,
                      title: "Gift to friends",
                      sub: "Send gems or skins as gifts",
                      color: "text-amber-400",
                      bg: "bg-amber-500/10",
                    },
                    {
                      icon: Sprout,
                      title: "Premium pet items",
                      sub: "Rare seeds, food, decor",
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/10",
                    },
                    {
                      icon: TrendingUp,
                      title: "XP & coin boosts",
                      sub: "Speed up your levels and farm",
                      color: "text-violet-400",
                      bg: "bg-violet-500/10",
                    },
                  ].map((it, i) => {
                    const Icon = it.icon;
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${it.bg} ${it.color} flex-shrink-0`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground leading-tight">
                            {it.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {it.sub}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-5 pt-5 border-t border-border/60 text-center">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Subscribers earn{" "}
                    <span className="text-foreground font-semibold">
                      up to 1,500 gems / month
                    </span>{" "}
                    automatically.
                  </p>
                  <a
                    href="#tiers"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("tiers")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    See LionHeart plans
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>
        {/* --- END AI-MODIFIED --- */}

        <TrustBand />

        {/* FAQ */}
        {/* --- AI-MODIFIED (2026-04-24) ---
            Purpose: Restyled FAQ header to match the rest of the page
            (eyebrow + larger heading) and migrated text-white to
            text-foreground for consistent theming. */}
        <section id="faq" className="py-16 lg:py-20 border-t border-border/60 scroll-mt-20">
          <div className="max-w-3xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Questions?
              </span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                {t("faq.title")}
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <AccordionItem
                  key={i}
                  value={`q${i}`}
                  className="rounded-xl border border-border bg-card/40 px-5 backdrop-blur-sm"
                >
                  <AccordionTrigger className="text-foreground font-semibold hover:no-underline">
                    {t(`faq.q${i}`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {t(`faq.a${i}`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
        {/* --- END AI-MODIFIED --- */}
      </div>

      {selectedItem && (
        <PurchaseModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          currency={currency}
          symbol={symbol}
        />
      )}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "donate"])),
  },
});
// --- END AI-MODIFIED ---
