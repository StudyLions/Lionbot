// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: A slim sticky pricing bar that slides down from the top
//          once the user has scrolled past the tier cards. Shows the
//          recommended tier (LionHeart+ by default) with name, price
//          and Subscribe CTA. Includes a small dismiss button so it
//          never traps the user. Hides itself again when the user
//          scrolls back up to the tier cards. Uses IntersectionObserver
//          on a sentinel placed below the tiers section.
// ============================================================
import { useEffect, useState } from "react";
import { Crown, X as XIcon, Sparkles } from "lucide-react";
import { SUBSCRIPTION_TIERS } from "@/constants/SubscriptionData";

interface StickyPricingBarProps {
  recommendedTierId?: keyof typeof SUBSCRIPTION_TIERS;
  currency?: "eur" | "usd";
  symbol?: string;
  onSubscribe?: (tierId: keyof typeof SUBSCRIPTION_TIERS) => void;
  isCurrent?: boolean;
}

export default function StickyPricingBar({
  recommendedTierId = "LIONHEART_PLUS",
  currency = "eur",
  symbol = "€",
  onSubscribe,
  isCurrent = false,
}: StickyPricingBarProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const tier = SUBSCRIPTION_TIERS[recommendedTierId];
  const price = currency === "eur" ? tier.price : tier.priceUsd;

  useEffect(() => {
    const tiers = document.getElementById("tiers");
    if (!tiers) return;

    let bottomReached = false;
    let aboveStart = false;

    const handler = () => {
      const rect = tiers.getBoundingClientRect();
      bottomReached = rect.bottom < 100;
      aboveStart = rect.top > window.innerHeight;
      setVisible(bottomReached && !aboveStart);
    };

    handler();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe(recommendedTierId);
    } else {
      const tiersSection = document.getElementById("tiers");
      tiersSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (dismissed) return null;

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 pointer-events-none ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className={`pointer-events-auto`}>
        <div className="bg-background/95 backdrop-blur-md border-b border-border shadow-lg shadow-black/20">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-2.5 flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
              }}
            >
              <Crown className="h-3 w-3" />
              <span className="hidden sm:inline">Recommended</span>
              <Sparkles className="h-3 w-3 sm:hidden" />
            </span>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span
                className="text-sm font-bold truncate"
                style={{ color: tier.color }}
              >
                {tier.name}
              </span>
              <span className="text-sm text-foreground font-semibold whitespace-nowrap">
                {symbol}
                {price.toFixed(2)}
                <span className="text-muted-foreground font-normal"> /mo</span>
              </span>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={isCurrent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-bold text-white whitespace-nowrap transition-all hover:brightness-110 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              style={{
                background: isCurrent
                  ? `linear-gradient(135deg, ${tier.color}55, ${tier.color}33)`
                  : `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
                boxShadow: isCurrent
                  ? "none"
                  : `0 4px 14px -4px ${tier.color}66`,
              }}
            >
              {isCurrent ? "Your plan" : "Subscribe"}
            </button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
