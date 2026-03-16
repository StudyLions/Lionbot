// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Redesigned donate page with LionHeart subscription tiers,
//          full subscription management (upgrade/downgrade/cancel via
//          Stripe Customer Portal), and existing gem packages.
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { signIn, useSession } from "next-auth/react";
import {
  Diamond,
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
} from "@/constants/SubscriptionData";

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

function PurchaseModal({
  item,
  onClose,
}: {
  item: (typeof DonationsData)[0];
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await createPaymentSession(item.id, quantity);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-gray-400 hover:text-white transition-colors"
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
          <h2 className="text-2xl font-bold text-white text-center">
            {numberWithCommas(item.tokens * quantity)} LionGems
          </h2>
          {item.tokens_bonus > 0 && (
            <p className="text-sm text-blue-400 text-center mt-1">
              +{numberWithCommas(item.tokens_bonus * quantity)} bonus
            </p>
          )}

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-400">
              Quantity
            </label>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="w-10 h-10 rounded-lg border border-gray-600 text-white hover:bg-gray-700 transition-colors font-medium"
              >
                -
              </button>
              <span className="w-12 text-center text-lg font-semibold text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-gray-600 text-white hover:bg-gray-700 transition-colors font-medium"
              >
                +
              </button>
              <span className="ml-auto text-2xl font-bold text-white">
                &euro;{(item.amount * quantity).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            {session ? (
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Purchase"}
              </button>
            ) : (
              <button
                onClick={() => signIn("discord")}
                className="w-full py-3 rounded-lg bg-[#5865F2] text-white font-medium hover:bg-[#4752C4] transition-colors"
              >
                Sign in to Purchase
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionManagementBanner({
  subStatus,
  onManage,
  portalLoading,
}: {
  subStatus: SubscriptionStatus;
  onManage: () => void;
  portalLoading: boolean;
}) {
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
              <h3 className="text-white font-semibold">Payment Failed</h3>
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
              <h3 className="text-white font-semibold">
                {subStatus.tierName || subStatus.tier}{" "}
                <span className="text-orange-400 text-sm font-normal ml-1">
                  Cancelling
                </span>
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
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
              <h3 className="text-white font-semibold">
                {subStatus.tierName || subStatus.tier}
                <span
                  className="text-xs font-medium ml-2 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  Active
                </span>
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                ${subStatus.tierPrice}/month
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition-colors whitespace-nowrap disabled:opacity-50"
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

function SubscriptionCard({
  tierId,
  subStatus,
  onSubscribe,
  onManage,
  featured,
  subscribing,
  portalLoading,
}: {
  tierId: SubscriptionTier;
  subStatus: SubscriptionStatus | null;
  onSubscribe: (tier: SubscriptionTier) => void;
  onManage: () => void;
  featured?: boolean;
  subscribing: boolean;
  portalLoading: boolean;
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

  const tierIcons: Record<string, string> = {
    LIONHEART: "\u{1F981}",
    LIONHEART_PLUS: "\u{1F31F}",
    LIONHEART_PLUS_PLUS: "\u{1F451}",
  };

  const perks = [
    {
      label: `${numberWithCommas(tier.monthlyGems)} gems/month`,
      icon: Diamond,
    },
    { label: `${tier.gemsPerVote} gems per vote`, icon: Star },
    { label: `${tier.lionCoinBoost}x vote bonus`, icon: TrendingUp },
    { label: `+${tier.dropRateBonus * 100}% drop rates`, icon: Sparkles },
    { label: `${tier.farmGrowthSpeed}x farm growth`, icon: Sprout },
    ...(tier.deathTimerHours === null
      ? [{ label: "Plants never die!", icon: Shield }]
      : [{ label: `${tier.deathTimerHours}h death timer`, icon: Shield }]),
    { label: `${tier.uprootRefund * 100}% uproot refund`, icon: Zap },
  ];

  const renderButton = () => {
    if (isCurrentTier) {
      return (
        <div
          className="w-full py-3 rounded-xl text-center font-semibold text-sm"
          style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
        >
          Current Plan
        </div>
      );
    }

    if (!session) {
      return (
        <button
          onClick={() => signIn("discord")}
          className="w-full py-3 rounded-xl bg-[#5865F2] text-white font-semibold text-sm hover:bg-[#4752C4] transition-colors"
        >
          Sign in to Subscribe
        </button>
      );
    }

    if (isUpgrade) {
      return (
        <button
          onClick={onManage}
          disabled={portalLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
          }}
        >
          {portalLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
          Upgrade
        </button>
      );
    }

    if (isDowngrade) {
      return (
        <button
          onClick={onManage}
          disabled={portalLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {portalLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          Downgrade
        </button>
      );
    }

    return (
      <button
        onClick={() => onSubscribe(tierId)}
        disabled={subscribing}
        className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
        }}
      >
        {subscribing ? "Processing..." : "Subscribe Now"}
      </button>
    );
  };

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-300 ${
        featured
          ? "border-pink-500/50 bg-gradient-to-b from-pink-500/10 to-gray-800 shadow-xl shadow-pink-500/10 scale-[1.02]"
          : "border-gray-700 bg-gray-800/80 hover:border-gray-600"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full text-xs font-bold bg-pink-500 text-white uppercase tracking-wide">
            <Star className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <span className="text-3xl">{tierIcons[tierId]}</span>
        <h3 className="text-xl font-bold text-white mt-2">{tier.name}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold text-white">${tier.price}</span>
          <span className="text-gray-400">/month</span>
        </div>
      </div>

      <div
        className="w-full h-1 rounded-full mb-6"
        style={{
          background: `linear-gradient(90deg, ${tier.color}80, ${tier.color})`,
        }}
      />

      <ul className="space-y-3 flex-1 mb-6">
        {perks.map((perk, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${tier.color}20` }}
            >
              <Check className="h-3 w-3" style={{ color: tier.color }} />
            </div>
            <span className="text-gray-300">{perk.label}</span>
          </li>
        ))}
        <li className="flex items-center gap-3 text-sm">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${tier.color}20` }}
          >
            <Check className="h-3 w-3" style={{ color: tier.color }} />
          </div>
          <span className="text-gray-300">
            Animated glowing cards
            <span
              className="ml-1 text-xs font-semibold"
              style={{ color: tier.color }}
            >
              ({tier.name} glow)
            </span>
          </span>
        </li>
      </ul>

      {renderButton()}
    </div>
  );
}

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
  ];

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-sm border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">
              Perk
            </th>
            <th className="py-3 px-3 text-gray-400 font-medium text-center">
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
              className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-3 px-4 text-gray-300 font-medium">
                {row.label}
              </td>
              <td className="py-3 px-3 text-gray-500 text-center">
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

export default function Donate() {
  const { t } = useTranslation("donate");
  const { data: session } = useSession();
  const [selectedItem, setSelectedItem] = useState<
    (typeof DonationsData)[0] | null
  >(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
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

  const handleSubscribe = useCallback(
    async (tier: SubscriptionTier) => {
      if (subscribing) return;
      setSubscribing(true);
      setPortalError(null);
      try {
        const res = await fetch("/api/subscription/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier }),
        });
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
    [subscribing]
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
      <div className="bg-gray-900 min-h-screen">
        {/* Hero */}
        <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(91,141,239,0.08),_transparent_50%)]" />
          <div className="relative max-w-6xl mx-auto px-4 lg:px-6">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                Support{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400">
                  LionBot
                </span>
              </h1>
              <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Become a LionHeart supporter to unlock exclusive perks, boost
                your farm, and get animated glowing profile cards!
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-8 justify-center">
                <a
                  href="#tiers"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:brightness-110 transition-all shadow-lg shadow-blue-500/25"
                >
                  <Crown className="h-4 w-4" />
                  View Plans
                </a>
                <a
                  href="#gems"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-700 text-white font-semibold hover:bg-gray-800 transition-colors"
                >
                  <Diamond className="h-4 w-4" />
                  Buy LionGems
                </a>
              </div>
            </div>
          </div>
        </section>

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
        <section id="tiers" className="py-16 lg:py-20 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">
                LionHeart Subscriptions
              </h2>
              <p className="text-gray-400 mt-2">
                Choose the plan that fits you best
              </p>
            </div>

            {/* Subscription management banner */}
            {hasActiveSub && subStatus && (
              <div className="mb-8">
                <SubscriptionManagementBanner
                  subStatus={subStatus}
                  onManage={handleManageSubscription}
                  portalLoading={portalLoading}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                />
              ))}
            </div>

            {/* Comparison Toggle */}
            <div className="mt-10 text-center">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowRight
                  className={`h-4 w-4 transition-transform ${
                    showComparison ? "rotate-90" : ""
                  }`}
                />
                {showComparison ? "Hide" : "View"} Full Comparison
              </button>
            </div>

            {showComparison && (
              <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800/50 p-6">
                <ComparisonTable />
              </div>
            )}
          </div>
        </section>

        {/* Server Premium Banner */}
        <section className="py-12 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 text-center">
              <Shield className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white">Server Premium</h3>
              <p className="text-gray-400 mt-2 max-w-lg mx-auto">
                Premium servers now include LionGotchi bonuses:{" "}
                <span className="text-blue-400 font-semibold">+15% Gold</span>{" "}
                and{" "}
                <span className="text-blue-400 font-semibold">
                  +15% Drop Rate
                </span>{" "}
                for all members. Purchase with LionGems using{" "}
                <code className="text-sm bg-gray-700 px-2 py-0.5 rounded">
                  /premium
                </code>{" "}
                in Discord.
              </p>
            </div>
          </div>
        </section>

        {/* Gem Packages */}
        <section
          id="gems"
          className="py-16 lg:py-20 border-t border-gray-800 scroll-mt-20"
        >
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white">
                LionGem Packages
              </h2>
              <p className="text-gray-400 mt-2">
                One-time purchases — use gems for skins, server premium, and
                more
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DonationsData.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="rounded-xl border border-gray-700 bg-gray-800/80 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 hover:translate-y-[-2px] transition-all duration-200 p-5 text-left group"
                >
                  <div className="flex items-center justify-center h-36 mb-4">
                    <Image
                      src={item.image}
                      alt={`${item.tokens} LionGems`}
                      width={140}
                      height={140}
                      objectFit="contain"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {numberWithCommas(item.tokens)}
                    </div>
                    {item.tokens_bonus > 0 && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        +{numberWithCommas(item.tokens_bonus)} bonus
                      </div>
                    )}
                    <div className="mt-2 text-lg font-semibold text-white">
                      &euro;{item.amount}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 lg:py-16 border-t border-gray-800">
          <div className="max-w-2xl mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              {t("faq.title")}
            </h2>
            <Accordion type="single" collapsible>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <AccordionItem key={i} value={`q${i}`}>
                  <AccordionTrigger className="text-white">
                    {t(`faq.q${i}`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400">
                    {t(`faq.a${i}`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>

      {selectedItem && (
        <PurchaseModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
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
