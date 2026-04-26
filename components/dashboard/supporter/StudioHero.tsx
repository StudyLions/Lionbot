// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Hero header for the LionHeart Studio. Tier-colored
//          ambient blob, shimmering tier badge, animated boost
//          shelf, and an action toolbar (Manage / Surprise me /
//          Reset). For non-supporters it switches to a teaser
//          state with a "see plans" CTA.
// ============================================================
import { useState } from "react";
import Link from "next/link";
import {
  Crown,
  ExternalLink,
  Shuffle,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/dashboard/ui";
import { dashboardMutate } from "@/hooks/useDashboard";
import { useCurrency } from "@/hooks/useCurrency";
import {
  getSubscriptionPrice,
  type SubscriptionTier,
} from "@/constants/SubscriptionData";
import BoostShelf from "./BoostShelf";
import type { SubscriptionData } from "./types";
import { tierPalette } from "./types";

interface StudioHeroProps {
  sub: SubscriptionData;
  isSupporter: boolean;
  onSurpriseMe: () => void;
  onReset: () => void;
}

export default function StudioHero({
  sub,
  isSupporter,
  onSurpriseMe,
  onReset,
}: StudioHeroProps) {
  const { currency, symbol } = useCurrency();
  const [portalLoading, setPortalLoading] = useState(false);
  const palette = tierPalette(sub.tier);

  const renewalDate = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const result = await dashboardMutate("POST", "/api/subscription/portal");
      if (result.url) window.open(result.url, "_blank");
    } catch (e: unknown) {
      const msg = (e as Error)?.message || "Failed to open subscription management";
      if (msg.includes("test mode")) {
        toast.error("Subscription management is only available in production.");
      } else {
        toast.error(msg);
      }
    }
    setPortalLoading(false);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-sm">
      <style jsx>{`
        @keyframes hero-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes hero-shimmer {
          0%, 100% { transform: translateX(-150%) skewX(-12deg); opacity: 0; }
          25% { opacity: 0.8; }
          50% { transform: translateX(150%) skewX(-12deg); opacity: 0; }
        }
        @keyframes hero-spin-slow {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isSupporter
            ? `radial-gradient(circle at 12% 20%, ${palette.soft} 0%, transparent 55%), radial-gradient(circle at 90% 80%, ${palette.soft} 0%, transparent 60%)`
            : `radial-gradient(circle at 18% 30%, rgba(91, 141, 239, 0.10) 0%, transparent 55%), radial-gradient(circle at 82% 70%, rgba(168, 85, 247, 0.10) 0%, transparent 60%)`,
          animation: "hero-pulse 8s ease-in-out infinite",
        }}
      />

      <div className="relative p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            {isSupporter ? (
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="relative h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: palette.gradient,
                    boxShadow: `0 12px 32px -10px ${palette.hex}, inset 0 0 18px rgba(255,255,255,0.18)`,
                  }}
                >
                  <Crown size={22} className="text-white drop-shadow" />
                  <div
                    aria-hidden
                    className="absolute -inset-1 rounded-2xl border opacity-60"
                    style={{
                      borderColor: palette.hex,
                      animation: "hero-spin-slow 14s linear infinite",
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div
                    className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full overflow-hidden"
                    style={{
                      background: palette.gradient,
                      boxShadow: `0 6px 18px -6px ${palette.hex}`,
                    }}
                  >
                    <Crown size={11} className="text-white" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      {sub.tierName}
                    </span>
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
                        animation: "hero-shimmer 3.6s ease-in-out infinite",
                      }}
                    />
                  </div>
                  {sub.cancelAtPeriodEnd && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-400">
                      <AlertTriangle size={10} />
                      Cancelling
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="relative h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(91, 141, 239, 0.7) 0%, rgba(168, 85, 247, 0.7) 100%)",
                    boxShadow: "0 12px 32px -10px rgba(168, 85, 247, 0.5)",
                  }}
                >
                  <Crown size={22} className="text-white" />
                </div>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isSupporter ? "Welcome to the Studio" : "Become a LionHeart"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-lg leading-relaxed">
              {isSupporter ? (
                sub.cancelAtPeriodEnd && renewalDate ? (
                  <>Access until {renewalDate}. Renew any time from Stripe.</>
                ) : renewalDate ? (
                  <>
                    Renews {renewalDate}
                    {sub.tier && sub.tier !== "NONE" && (
                      <>
                        {" "}
                        · {symbol}
                        {getSubscriptionPrice(
                          sub.tier as SubscriptionTier,
                          currency as "eur" | "usd"
                        )}
                        /month
                      </>
                    )}
                    . Tweak the look of your card on the right — saves automatically.
                  </>
                ) : (
                  <>Active subscription. Tweak the look of your card on the right — saves automatically.</>
                )
              ) : (
                <>
                  Unlock animated profile effects, monthly gems, farm boosts and a full
                  card-design studio. Support LionBot while getting awesome perks.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            {isSupporter ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openPortal}
                  disabled={portalLoading}
                >
                  <ExternalLink size={14} className="mr-1.5" />
                  {portalLoading ? "Opening\u2026" : "Manage subscription"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSurpriseMe}
                    title="Apply a random curated look"
                  >
                    <Shuffle size={14} className="mr-1.5" />
                    Surprise me
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    title="Reset all card effects to default"
                  >
                    <RotateCcw size={14} className="mr-1.5" />
                    Reset
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/donate">
                <Button
                  className="text-white shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)",
                    boxShadow: "0 14px 30px -10px rgba(168, 85, 247, 0.6)",
                  }}
                >
                  View plans
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <BoostShelf sub={sub} isSupporter={isSupporter} />
      </div>
    </div>
  );
}
