// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Redesigned donate page with LionHeart subscription tiers + existing gem packages
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { signIn, useSession } from "next-auth/react";
import { Diamond, Crown, Palette, Zap, Star, X, Check, ExternalLink, ArrowRight, Sparkles, Shield, Sprout, TrendingUp } from "lucide-react";
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
  currentPeriodEnd: string | null;
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
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
            <label className="text-sm font-medium text-gray-400">Quantity</label>
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

function SubscriptionCard({
  tierId,
  currentTier,
  onSubscribe,
  featured,
}: {
  tierId: SubscriptionTier;
  currentTier: string;
  onSubscribe: (tier: SubscriptionTier) => void;
  featured?: boolean;
}) {
  const tier = SUBSCRIPTION_TIERS[tierId];
  const isCurrentTier = currentTier === tierId;
  const { data: session } = useSession();

  const tierIcons: Record<string, string> = {
    LIONHEART: "🦁",
    LIONHEART_PLUS: "🌟",
    LIONHEART_PLUS_PLUS: "👑",
  };

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: add timer themes perk to subscription card
  const themeCountByTier: Record<string, number> = {
    LIONHEART: 5, LIONHEART_PLUS: 8, LIONHEART_PLUS_PLUS: 10,
  };
  const perks = [
    { label: `${numberWithCommas(tier.monthlyGems)} gems/month`, icon: Diamond },
    { label: `${tier.gemsPerVote} gems per vote`, icon: Star },
    { label: `${tier.lionCoinBoost}x vote bonus`, icon: TrendingUp },
    { label: `+${tier.dropRateBonus * 100}% drop rates`, icon: Sparkles },
    { label: `${tier.farmGrowthSpeed}x farm growth`, icon: Sprout },
    { label: `${themeCountByTier[tierId] ?? 1} focus timer themes`, icon: Palette },
    ...(tier.deathTimerHours === null
      ? [{ label: "Plants never die!", icon: Shield }]
      : [{ label: `${tier.deathTimerHours}h death timer`, icon: Shield }]),
    { label: `${tier.uprootRefund * 100}% uproot refund`, icon: Zap },
  ];
  // --- END AI-MODIFIED ---

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
        style={{ background: `linear-gradient(90deg, ${tier.color}80, ${tier.color})` }}
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
            <span className="ml-1 text-xs font-semibold" style={{ color: tier.color }}>
              ({tier.name} glow)
            </span>
          </span>
        </li>
      </ul>

      {isCurrentTier ? (
        <div
          className="w-full py-3 rounded-xl text-center font-semibold text-sm"
          style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
        >
          ✨ Current Plan
        </div>
      ) : session ? (
        <button
          onClick={() => onSubscribe(tierId)}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:brightness-110"
          style={{
            background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
          }}
        >
          Subscribe Now
        </button>
      ) : (
        <button
          onClick={() => signIn("discord")}
          className="w-full py-3 rounded-xl bg-[#5865F2] text-white font-semibold text-sm hover:bg-[#4752C4] transition-colors"
        >
          Sign in to Subscribe
        </button>
      )}
    </div>
  );
}

function ComparisonTable() {
  const rows = [
    { label: "Monthly Gems", free: "—", values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => numberWithCommas(t.monthlyGems) },
    { label: "Gems per Vote", free: String(FREE_TIER.gemsPerVote), values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => String(t.gemsPerVote) },
    { label: "Vote LionCoin Boost", free: `${FREE_TIER.lionCoinBoost}x`, values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => `${t.lionCoinBoost}x` },
    { label: "Drop Rate Bonus", free: "—", values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => `+${t.dropRateBonus * 100}%` },
    { label: "Farm Growth Speed", free: `${FREE_TIER.farmGrowthSpeed}x`, values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => `${t.farmGrowthSpeed}x` },
    { label: "Water Duration", free: `${FREE_TIER.waterDurationMultiplier}x`, values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => `${t.waterDurationMultiplier}x` },
    { label: "Dry Penalty", free: `${FREE_TIER.dryPenalty * 100}%`, values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => `${t.dryPenalty * 100}%` },
    { label: "Death Timer", free: `${FREE_TIER.deathTimerHours}h`, values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => t.deathTimerHours === null ? "Never" : `${t.deathTimerHours}h` },
    { label: "Seed Discount", free: "—", values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => `${t.seedCostDiscount * 100}%` },
    { label: "Harvest Gold Bonus", free: "—", values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => `+${t.harvestGoldBonus * 100}%` },
    { label: "Uproot Refund", free: `${FREE_TIER.uprootRefund * 100}%`, values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) => `${t.uprootRefund * 100}%` },
    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: timer themes row in comparison table
    { label: "Focus Timer Themes", free: "1", values: (t: typeof SUBSCRIPTION_TIERS.LIONHEART) =>
      t.id === "LIONHEART" ? "5" : t.id === "LIONHEART_PLUS" ? "8" : "10" },
    // --- END AI-MODIFIED ---
    { label: "Animated Cards", free: "—", values: () => "✓" },
  ];

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-sm border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Perk</th>
            <th className="py-3 px-3 text-gray-400 font-medium text-center">Free</th>
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
            <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
              <td className="py-3 px-4 text-gray-300 font-medium">{row.label}</td>
              <td className="py-3 px-3 text-gray-500 text-center">{row.free}</td>
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
  const [selectedItem, setSelectedItem] = useState<(typeof DonationsData)[0] | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (session) {
      fetch("/api/subscription/status")
        .then((r) => r.json())
        .then(setSubStatus)
        .catch(() => {});
    }
  }, [session]);

  const handleSubscribe = useCallback(async (tier: SubscriptionTier) => {
    if (subscribing) return;
    setSubscribing(true);
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
        alert(data.error);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  }, [subscribing]);

  const handleManageSubscription = useCallback(async () => {
    try {
      const res = await fetch("/api/subscription/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
  }, []);

  const currentTier = subStatus?.status === "ACTIVE" ? subStatus.tier : "NONE";

  return (
    <Layout SEO={DonationSEO}>
      <div className="bg-gray-900 min-h-screen">
        {/* Hero */}
        <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(91,141,239,0.08),_transparent_50%)]" />
          <div className="relative max-w-6xl mx-auto px-4 lg:px-6">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400">LionBot</span>
              </h1>
              <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Become a LionHeart supporter to unlock exclusive perks, boost your farm, and get animated glowing profile cards!
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

        {/* Success/Cancel Messages */}
        {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("subscription") === "success" && (
          <div className="max-w-6xl mx-auto px-4 lg:px-6 mb-8">
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center text-green-400">
              <Check className="h-5 w-5 inline mr-2" />
              Your LionHeart subscription is now active! Welcome aboard!
            </div>
          </div>
        )}

        {/* Subscription Tiers */}
        <section id="tiers" className="py-16 lg:py-20 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">LionHeart Subscriptions</h2>
              <p className="text-gray-400 mt-2">Choose the plan that fits you best</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TIER_ORDER.map((tierId) => (
                <SubscriptionCard
                  key={tierId}
                  tierId={tierId}
                  currentTier={currentTier}
                  onSubscribe={handleSubscribe}
                  featured={tierId === "LIONHEART_PLUS"}
                />
              ))}
            </div>

            {/* Manage Subscription */}
            {currentTier !== "NONE" && (
              <div id="manage" className="mt-8 text-center">
                <button
                  onClick={handleManageSubscription}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Manage Subscription
                </button>
                {subStatus?.currentPeriodEnd && (
                  <p className="text-sm text-gray-500 mt-2">
                    Next billing: {new Date(subStatus.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Comparison Toggle */}
            <div className="mt-10 text-center">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowRight className={`h-4 w-4 transition-transform ${showComparison ? "rotate-90" : ""}`} />
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
                Premium servers now include LionGotchi bonuses: <span className="text-blue-400 font-semibold">+15% Gold</span> and <span className="text-blue-400 font-semibold">+15% Drop Rate</span> for all members. Purchase with LionGems using <code className="text-sm bg-gray-700 px-2 py-0.5 rounded">/premium</code> in Discord.
              </p>
            </div>
          </div>
        </section>

        {/* Gem Packages */}
        <section id="gems" className="py-16 lg:py-20 border-t border-gray-800 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white">LionGem Packages</h2>
              <p className="text-gray-400 mt-2">
                One-time purchases — use gems for skins, server premium, and more
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
        <PurchaseModal item={selectedItem} onClose={() => setSelectedItem(null)} />
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
