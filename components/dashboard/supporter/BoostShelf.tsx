// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Horizontal "boost shelf" replacing the 9-card perks
//          grid on the LionHeart Studio hero. Each tile is an
//          animated metric (rolling counter, pulsing badge,
//          progress bar) that uses the user's tier color and
//          fires entrance animations when the strip enters view.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { Gem, Coins, Sprout, Heart, Sparkles, Timer, Lock } from "lucide-react";
import { FREE_TIER, SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/constants/SubscriptionData";
import type { SubscriptionData } from "./types";
import { hexToRgba, tierPalette } from "./types";

interface BoostShelfProps {
  sub: SubscriptionData;
  isSupporter: boolean;
}

function useInView<T extends HTMLElement>(): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useCounter(target: number, visible: boolean, durationMs = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let frame: number;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, visible, durationMs]);
  return val;
}

interface TileProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  accent: string;
  glow: string;
  delay?: number;
  visible: boolean;
  locked?: boolean;
}

function Tile({ icon, label, value, detail, accent, glow, delay = 0, visible, locked }: TileProps) {
  return (
    <div
      className="relative flex-shrink-0 w-[170px] sm:w-[180px] rounded-2xl border p-4 backdrop-blur-sm"
      style={{
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        borderColor: locked ? "rgba(255,255,255,0.08)" : `${accent}55`,
        boxShadow: locked ? "none" : `0 8px 24px -10px ${glow}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {!locked && (
        <div
          className="absolute -top-px left-4 right-4 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
          }}
        />
      )}

      <div className="flex items-center gap-2 mb-2">
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center"
          style={{
            background: locked
              ? "rgba(255,255,255,0.04)"
              : `linear-gradient(135deg, ${hexToRgba(accent, 0.22)}, ${hexToRgba(accent, 0.06)})`,
            color: locked ? "rgb(120, 120, 130)" : accent,
          }}
        >
          {locked ? <Lock size={14} /> : icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>

      <div
        className="text-xl font-black tabular-nums leading-none"
        style={{ color: locked ? "rgb(120, 120, 130)" : "white" }}
      >
        {value}
      </div>
      {detail && (
        <div className="text-[10px] mt-1.5" style={{ color: locked ? "rgb(100, 100, 110)" : `${accent}` }}>
          {detail}
        </div>
      )}
    </div>
  );
}

export default function BoostShelf({ sub, isSupporter }: BoostShelfProps) {
  const [ref, visible] = useInView<HTMLDivElement>();
  const palette = tierPalette(sub.tier);
  const accent = palette.hex;
  const glow = palette.soft;

  const tierConfig =
    sub.tier in SUBSCRIPTION_TIERS ? SUBSCRIPTION_TIERS[sub.tier as SubscriptionTier] : null;

  // Active supporter values with smooth count-ups
  const monthlyGems = useCounter(sub.monthlyGems ?? 0, visible);
  const gemsPerVote = useCounter(sub.gemsPerVote ?? 0, visible, 800);

  if (!isSupporter) {
    // Teaser state for non-supporters
    return (
      <div ref={ref} className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        <Tile
          locked
          icon={<Gem size={14} />}
          label="Monthly Gems"
          value="?"
          detail="Up to 3,000/mo"
          accent={accent}
          glow={glow}
          visible={visible}
        />
        <Tile
          locked
          icon={<Coins size={14} />}
          label="Coin Boost"
          value="?"
          detail="Up to 2.0x"
          accent={accent}
          glow={glow}
          visible={visible}
          delay={50}
        />
        <Tile
          locked
          icon={<Sprout size={14} />}
          label="Farm Growth"
          value="?"
          detail="Up to 1.5x"
          accent={accent}
          glow={glow}
          visible={visible}
          delay={100}
        />
        <Tile
          locked
          icon={<Sparkles size={14} />}
          label="Drop Rate"
          value="?"
          detail="Up to +50%"
          accent={accent}
          glow={glow}
          visible={visible}
          delay={150}
        />
        <Tile
          locked
          icon={<Heart size={14} />}
          label="Card Effects"
          value="?"
          detail="Full studio"
          accent={accent}
          glow={glow}
          visible={visible}
          delay={200}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
      <Tile
        icon={<Gem size={14} />}
        label="Monthly Gems"
        value={monthlyGems.toLocaleString()}
        detail={`+${gemsPerVote} per vote`}
        accent={accent}
        glow={glow}
        visible={visible}
      />
      <Tile
        icon={<Coins size={14} />}
        label="Coin Boost"
        value={`${sub.lionCoinBoost ?? 1}x`}
        detail={`vs ${FREE_TIER.lionCoinBoost}x base`}
        accent={accent}
        glow={glow}
        delay={70}
        visible={visible}
      />
      <Tile
        icon={<Sprout size={14} />}
        label="Farm Growth"
        value={`${sub.farmGrowthSpeed ?? 1}x`}
        detail={`-${Math.round((sub.seedCostDiscount ?? 0) * 100)}% seed cost`}
        accent={accent}
        glow={glow}
        delay={140}
        visible={visible}
      />
      <Tile
        icon={<Sparkles size={14} />}
        label="Drop Rate"
        value={`+${Math.round((sub.dropRateBonus ?? 0) * 100)}%`}
        detail={`+${Math.round((sub.harvestGoldBonus ?? 0) * 100)}% harvest`}
        accent={accent}
        glow={glow}
        delay={210}
        visible={visible}
      />
      <Tile
        icon={<Heart size={14} />}
        label="LionGotchi"
        value={`${sub.lgGoldBoost ?? 1}x`}
        detail={`${Math.round((sub.uprootRefund ?? 0) * 100)}% uproot refund`}
        accent={accent}
        glow={glow}
        delay={280}
        visible={visible}
      />
      <Tile
        icon={<Timer size={14} />}
        label="Timer Themes"
        value={tierConfig?.timerThemes ?? 0}
        detail="unlocked"
        accent={accent}
        glow={glow}
        delay={350}
        visible={visible}
      />
    </div>
  );
}
