// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Animated mini-demo panels for homepage feature rows
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import { BarChart3, Trophy, Timer, Coins } from "lucide-react";

function useInView(threshold = 0.3) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

const PANEL =
  "w-full max-w-xs lg:max-w-sm rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-lg overflow-hidden select-none";

// ---------------------------------------------------------------------------
// 1. Statistics Demo — animated bar chart
// ---------------------------------------------------------------------------
const BAR_DATA = [
  { day: "M", pct: 65 },
  { day: "T", pct: 45 },
  { day: "W", pct: 80 },
  { day: "T", pct: 55 },
  { day: "F", pct: 92 },
  { day: "S", pct: 35 },
  { day: "S", pct: 70 },
];

export function StatisticsDemo() {
  const { ref, inView } = useInView(0.25);

  return (
    <div ref={ref} className={PANEL}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-foreground">
            Study Stats
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">This Week</span>
      </div>

      <div className="px-4 pb-1 text-right">
        <span className="text-lg font-bold text-blue-400">24.5</span>
        <span className="text-xs text-muted-foreground ml-0.5">hrs</span>
      </div>

      <div className="flex items-end justify-between gap-1.5 px-4 pb-2 h-28">
        {BAR_DATA.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative rounded-t-sm overflow-hidden bg-blue-500/10 flex-1">
              <div
                className="absolute bottom-0 w-full rounded-t-sm bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-700 ease-out"
                style={{
                  height: inView ? `${bar.pct}%` : "0%",
                  transitionDelay: `${i * 80}ms`,
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground leading-none">
              {bar.day}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-2 flex justify-between text-[10px] text-muted-foreground">
        <span>Avg 3.5h / day</span>
        <span className="text-green-400">+12% vs last week</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Leaderboard Demo — animated rows
// ---------------------------------------------------------------------------
const LB_ENTRIES = [
  { rank: 1, name: "Alex", hours: "142h", color: "bg-amber-400", medal: "🥇" },
  { rank: 2, name: "Sarah", hours: "128h", color: "bg-gray-300", medal: "🥈" },
  { rank: 3, name: "Mike", hours: "115h", color: "bg-amber-600", medal: "🥉" },
  { rank: 4, name: "Emma", hours: "98h", color: "bg-blue-400", medal: "" },
];

export function LeaderboardDemo() {
  const { ref, inView } = useInView(0.25);

  return (
    <div ref={ref} className={PANEL}>
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <Trophy className="h-4 w-4 text-amber-400" />
        <span className="text-xs font-semibold text-foreground">
          Study Time Leaderboard
        </span>
      </div>

      <div className="px-3 pb-3 space-y-1">
        {LB_ENTRIES.map((entry, i) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-500 ease-out ${
              i === 0 ? "bg-amber-500/10" : "bg-muted/30"
            }`}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(12px)",
              transitionDelay: `${i * 100}ms`,
            }}
          >
            <span className="text-xs w-5 text-center">
              {entry.medal || entry.rank}
            </span>
            <div
              className={`w-6 h-6 rounded-full ${entry.color} flex items-center justify-center text-[10px] font-bold text-gray-900`}
            >
              {entry.name[0]}
            </div>
            <span className="text-xs text-foreground flex-1 font-medium">
              {entry.name}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {entry.hours}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Pomodoro Demo — circular timer ring
// ---------------------------------------------------------------------------
const POMO_TOTAL = 25 * 60;
const RING_R = 40;
const RING_C = 2 * Math.PI * RING_R;

export function PomodoroDemo() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => (e + 1) % POMO_TOTAL);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = POMO_TOTAL - elapsed;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = elapsed / POMO_TOTAL;
  const dashOffset = RING_C * (1 - progress);

  return (
    <div className={PANEL}>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Timer className="h-4 w-4 text-rose-400" />
        <span className="text-xs font-semibold text-foreground">
          Pomodoro Timer
        </span>
      </div>

      <div className="flex flex-col items-center py-4">
        <span className="text-[10px] uppercase tracking-widest text-rose-400 font-semibold mb-2">
          Focus
        </span>
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={RING_R}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-rose-500/10"
            />
            <circle
              cx="50"
              cy="50"
              r={RING_R}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={dashOffset}
              className="text-rose-400 transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground font-mono tabular-nums">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 flex justify-center gap-4 text-[10px] text-muted-foreground">
        <span>Session 3 of 4</span>
        <span className="text-rose-400">25 min focus</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Economy Demo — coin balance + mini shop
// ---------------------------------------------------------------------------
export function EconomyDemo() {
  const { ref, inView } = useInView(0.25);
  const [balance, setBalance] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const target = 2450;
    const duration = 1500;
    const start = performance.now();
    let frame: number;
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setBalance(Math.floor(eased * target));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  return (
    <div ref={ref} className={PANEL}>
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-foreground">
            Economy
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
            {balance.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground">coins</span>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div
          className="rounded-lg border border-border bg-muted/30 p-3 transition-all duration-500 ease-out"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(8px)",
            transitionDelay: "300ms",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs font-medium text-foreground">
                VIP Role
              </span>
            </div>
            <span className="text-[10px] text-purple-400 font-medium">
              Cosmetic
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Coins className="h-3 w-3 text-emerald-400" />
              500 coins
            </span>
            <button className="px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-default">
              Purchase
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div
          className="rounded-lg border border-border bg-muted/30 p-3 transition-all duration-500 ease-out"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(8px)",
            transitionDelay: "450ms",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-foreground">
                Gold Badge
              </span>
            </div>
            <span className="text-[10px] text-amber-400 font-medium">
              Rank
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Coins className="h-3 w-3 text-emerald-400" />
              1,200 coins
            </span>
            <button className="px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-default">
              Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
