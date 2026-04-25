// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Replaces the bottom TierComparison block with three
//          context-aware variants:
//            1. Non-supporters: full 3-tier carousel
//            2. Mid-tier supporters: mini-carousel showing only
//               the higher tier(s) with deltas highlighted
//            3. Top-tier supporters: thank-you celebration card
// ============================================================
import Link from "next/link";
import { Crown, Heart, Sparkles, ArrowUpRight, Gem, Sprout, Coins, Lock, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SUBSCRIPTION_TIERS,
  TIER_ORDER,
  getSubscriptionPrice,
  type SubscriptionTier,
} from "@/constants/SubscriptionData";
import { useCurrency } from "@/hooks/useCurrency";
import { tierPalette } from "./types";

interface UpgradeMiniCarouselProps {
  currentTier: string;
}

interface DeltaPillProps {
  icon: React.ReactNode;
  text: string;
  positive?: boolean;
  accent: string;
}

function DeltaPill({ icon, text, positive, accent }: DeltaPillProps) {
  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{
        background: positive ? `${accent}25` : "rgba(255,255,255,0.05)",
        color: positive ? accent : "rgb(180,180,190)",
        border: positive ? `1px solid ${accent}55` : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {icon}
      {text}
    </div>
  );
}

function tierFromString(t: string | SubscriptionTier | null): SubscriptionTier | null {
  if (!t || !(t in SUBSCRIPTION_TIERS)) return null;
  return t as SubscriptionTier;
}

function buildDeltas(target: SubscriptionTier, current: SubscriptionTier | null) {
  const t = SUBSCRIPTION_TIERS[target];
  const c = current ? SUBSCRIPTION_TIERS[current] : null;
  const deltas: { icon: React.ReactNode; text: string; positive: boolean }[] = [];

  const dGems = t.monthlyGems - (c?.monthlyGems ?? 0);
  if (dGems > 0) deltas.push({
    icon: <Gem size={9} />,
    text: `+${dGems.toLocaleString()} gems/mo`,
    positive: true,
  });

  const dGrowth = t.farmGrowthSpeed - (c?.farmGrowthSpeed ?? 1);
  if (dGrowth > 0.001) deltas.push({
    icon: <Sprout size={9} />,
    text: `+${dGrowth.toFixed(2)}\u00d7 farm growth`,
    positive: true,
  });

  const dDrop = t.dropRateBonus - (c?.dropRateBonus ?? 0);
  if (dDrop > 0.001) deltas.push({
    icon: <Sparkles size={9} />,
    text: `+${Math.round(dDrop * 100)}% drop rate`,
    positive: true,
  });

  const dCoin = t.lionCoinBoost - (c?.lionCoinBoost ?? 1);
  if (dCoin > 0.001) deltas.push({
    icon: <Coins size={9} />,
    text: `+${dCoin.toFixed(2)}\u00d7 coin boost`,
    positive: true,
  });

  if (t.includesServerPremium && !(c?.includesServerPremium ?? false)) {
    deltas.push({
      icon: <Server size={9} />,
      text: "Server premium included",
      positive: true,
    });
  }

  if (t.deathTimerHours === null) {
    deltas.push({
      icon: <Heart size={9} />,
      text: "Pet never dies",
      positive: true,
    });
  }

  return deltas.slice(0, 5);
}

function UpgradeCard({
  target,
  current,
}: {
  target: SubscriptionTier;
  current: SubscriptionTier | null;
}) {
  const { currency, symbol } = useCurrency();
  const tier = SUBSCRIPTION_TIERS[target];
  const palette = tierPalette(target);
  const deltas = buildDeltas(target, current);
  const price = getSubscriptionPrice(target, currency as "eur" | "usd");

  return (
    <div
      className="relative rounded-2xl border p-5 flex flex-col h-full overflow-hidden backdrop-blur-sm"
      style={{
        borderColor: `${palette.hex}55`,
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        boxShadow: `0 16px 40px -16px ${palette.hex}55`,
      }}
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 h-32 w-32 rounded-full pointer-events-none blur-2xl"
        style={{ background: palette.soft }}
      />

      <div className="relative flex items-center gap-2 mb-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{
            background: palette.gradient,
            boxShadow: `0 8px 22px -10px ${palette.hex}`,
          }}
        >
          <Crown size={18} className="text-white drop-shadow" />
        </div>
        <div>
          <div className="text-base font-black text-foreground leading-tight">{tier.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {symbol}
            {price}
            <span className="text-muted-foreground/70">/mo</span>
          </div>
        </div>
      </div>

      <div className="relative space-y-1.5 mb-4 flex-1">
        {deltas.map((d, i) => (
          <DeltaPill key={i} {...d} accent={palette.hex} />
        ))}
      </div>

      <Link href="/donate" className="relative">
        <Button
          className="w-full text-white shadow-lg"
          size="sm"
          style={{
            background: palette.gradient,
            boxShadow: `0 10px 28px -8px ${palette.hex}99`,
          }}
        >
          {current ? "Upgrade" : "Subscribe"}
          <ArrowUpRight size={14} className="ml-1" />
        </Button>
      </Link>
    </div>
  );
}

function ThankYouCard() {
  const palette = tierPalette("LIONHEART_PLUS_PLUS");
  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-7 sm:p-8"
      style={{
        borderColor: `${palette.hex}55`,
        background:
          "linear-gradient(135deg, rgba(255, 215, 0, 0.10) 0%, rgba(245, 158, 11, 0.06) 50%, rgba(255, 215, 0, 0.10) 100%)",
        boxShadow: `0 24px 50px -20px ${palette.hex}66`,
      }}
    >
      <style jsx>{`
        @keyframes ty-float {
          0% { transform: translateY(60px) scale(0.6); opacity: 0; }
          15% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-30px) scale(1); opacity: 0; }
        }
        @keyframes ty-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes ty-spin-slow {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {[
          { left: "12%", delay: "0s", glyph: "\u2764", size: 18 },
          { left: "28%", delay: "1.2s", glyph: "\u2728", size: 14 },
          { left: "48%", delay: "0.5s", glyph: "\u{1F451}", size: 16 },
          { left: "68%", delay: "2.0s", glyph: "\u2728", size: 14 },
          { left: "85%", delay: "0.8s", glyph: "\u2764", size: 18 },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute bottom-0 font-bold opacity-60"
            style={{
              left: p.left,
              fontSize: `${p.size}px`,
              color: palette.hex,
              filter: `drop-shadow(0 0 6px ${palette.hex})`,
              animation: `ty-float 5s ease-out ${p.delay} infinite`,
            }}
          >
            {p.glyph}
          </span>
        ))}
      </div>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative flex-shrink-0">
          <div
            className="absolute -inset-3 rounded-3xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${palette.soft} 0%, transparent 70%)`,
              animation: "ty-pulse 3s ease-in-out infinite",
            }}
          />
          <div
            className="relative h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{
              background: palette.gradient,
              boxShadow: `0 14px 30px -10px ${palette.hex}, inset 0 0 24px rgba(255,255,255,0.25)`,
            }}
          >
            <Crown size={30} className="text-white drop-shadow" />
            <div
              aria-hidden
              className="absolute -inset-1 rounded-2xl border opacity-60"
              style={{
                borderColor: palette.hex,
                animation: "ty-spin-slow 14s linear infinite",
              }}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2"
            style={{
              background: palette.gradient,
              color: "white",
              boxShadow: `0 4px 14px -4px ${palette.hex}`,
            }}
          >
            Top tier supporter
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground leading-tight">
            You&apos;re on LionHeart++ — thank you.
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Your support keeps the bot running, the servers warm and the new features
            shipping. Every animation in your card is a tiny thank-you we drew for you.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UpgradeMiniCarousel({ currentTier }: UpgradeMiniCarouselProps) {
  const current = tierFromString(currentTier);

  if (current === "LIONHEART_PLUS_PLUS") {
    return <ThankYouCard />;
  }

  const tiersToShow = current
    ? TIER_ORDER.filter((t) => SUBSCRIPTION_TIERS[t].price > SUBSCRIPTION_TIERS[current].price)
    : TIER_ORDER;

  if (tiersToShow.length === 0) return null;

  const heading = current ? "Upgrade your tier" : "Pick your tier";
  const subhead = current
    ? "What you&apos;d gain on top of what you already have."
    : "All tiers unlock the full card studio. Pick the boost level that fits.";

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">{heading}</h3>
        <p
          className="text-xs text-muted-foreground mt-0.5"
          dangerouslySetInnerHTML={{ __html: subhead }}
        />
      </div>

      <div
        className={`grid gap-4 ${tiersToShow.length === 1 ? "grid-cols-1" : tiersToShow.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}
      >
        {tiersToShow.map((tier) => (
          <UpgradeCard key={tier} target={tier} current={current} />
        ))}
      </div>

      {!current && (
        <div className="flex items-start gap-2 mt-3 px-3 py-2.5 rounded-lg bg-muted/30 border border-border/40">
          <Lock size={13} className="text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Subscribing unlocks the live preview, all 12 curated looks, the full studio of
            sliders, and your monthly gem allowance starts the same day.
          </p>
        </div>
      )}
    </div>
  );
}
