// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Animated mini-demo panels for homepage feature rows
// ============================================================
// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Major visual upgrade — Recharts bar chart, podium leaderboard,
//          amber pomodoro with cycle dots, economy area chart
import React, { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  BarChart3,
  Trophy,
  Timer,
  Coins,
  Crown,
  Medal,
  Award,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";

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

const panelEntrance: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const PANEL =
  "w-full max-w-xs lg:max-w-sm rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-lg overflow-hidden select-none";
// --- END AI-MODIFIED ---

// ---------------------------------------------------------------------------
// 1. Statistics Demo — Recharts bar chart with trend
// ---------------------------------------------------------------------------
const CHART_DATA = [
  { day: "Mon", hrs: 3.2 },
  { day: "Tue", hrs: 2.1 },
  { day: "Wed", hrs: 4.5 },
  { day: "Thu", hrs: 2.8 },
  { day: "Fri", hrs: 5.1 },
  { day: "Sat", hrs: 1.8 },
  { day: "Sun", hrs: 3.9 },
];

const STREAK_DAYS = [true, true, false, true, true, true, true, false, true, true, true, false, true, true];

export function StatisticsDemo() {
  const { ref, inView } = useInView(0.25);

  return (
    <motion.div
      ref={ref}
      className={PANEL}
      variants={panelEntrance}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-foreground">Study Stats</span>
        </div>
        <span className="text-[10px] text-muted-foreground">This Week</span>
      </div>

      <div className="px-4 pb-1 flex items-baseline justify-between">
        <div>
          <span className="text-xl font-bold text-blue-400">23.4</span>
          <span className="text-xs text-muted-foreground ml-1">hrs</span>
        </div>
        <div className="flex items-center gap-0.5 text-green-400">
          <ArrowUpRight className="h-3 w-3" />
          <span className="text-[11px] font-semibold">+12%</span>
        </div>
      </div>

      <div className="px-2 h-28">
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DATA} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id="homeBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(value: number) => [`${value}h`, "Study"]}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
              />
              <Bar dataKey="hrs" fill="url(#homeBarGrad)" radius={[3, 3, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mini streak row */}
      <div className="border-t border-border px-4 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground">Study Streak</span>
          <span className="text-[10px] font-semibold text-amber-400">🔥 7 days</span>
        </div>
        <div className="flex gap-1">
          {STREAK_DAYS.map((active, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${active ? "bg-blue-400" : "bg-muted/40"}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 2. Leaderboard Demo — podium layout
// ---------------------------------------------------------------------------
const LB_ENTRIES = [
  { rank: 1, name: "Alex", hours: "142h", color: "bg-amber-400", avatar: "A" },
  { rank: 2, name: "Sarah", hours: "128h", color: "bg-gray-300", avatar: "S" },
  { rank: 3, name: "Mike", hours: "115h", color: "bg-amber-600", avatar: "M" },
];
const LB_BELOW = [
  { rank: 4, name: "Emma", hours: "98h" },
  { rank: 5, name: "Jordan", hours: "87h" },
];

const PODIUM_CONFIG = [
  { idx: 1, height: "h-14", IconComp: Medal, iconColor: "text-gray-300", gradFrom: "from-gray-300/15" },
  { idx: 0, height: "h-20", IconComp: Crown, iconColor: "text-amber-400", gradFrom: "from-amber-400/20" },
  { idx: 2, height: "h-10", IconComp: Award, iconColor: "text-amber-600", gradFrom: "from-amber-600/15" },
];

export function LeaderboardDemo() {
  const { ref, inView } = useInView(0.25);

  return (
    <motion.div
      ref={ref}
      className={PANEL}
      variants={panelEntrance}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <Trophy className="h-4 w-4 text-amber-400" />
        <span className="text-xs font-semibold text-foreground">Study Leaderboard</span>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 px-4 pb-1">
        {PODIUM_CONFIG.map((pod) => {
          const entry = LB_ENTRIES[pod.idx];
          return (
            <motion.div
              key={pod.idx}
              className="flex flex-col items-center gap-1 flex-1"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: pod.idx * 0.12, ease: "easeOut" as const }}
            >
              <pod.IconComp className={`h-3.5 w-3.5 ${pod.iconColor}`} />
              <div className={`w-7 h-7 rounded-full ${entry.color} flex items-center justify-center text-[10px] font-bold text-gray-900`}>
                {entry.avatar}
              </div>
              <span className="text-[10px] font-medium text-foreground truncate max-w-[60px]">{entry.name}</span>
              <div className={`w-full ${pod.height} rounded-t-md bg-gradient-to-t ${pod.gradFrom} to-transparent border border-border/50 flex items-end justify-center pb-1`}>
                <span className="text-[9px] font-bold text-muted-foreground">{entry.hours}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Below top 3 */}
      <div className="px-3 py-2 space-y-1">
        {LB_BELOW.map((entry, i) => (
          <motion.div
            key={entry.rank}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/20"
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.1, ease: "easeOut" as const }}
          >
            <span className="text-[10px] text-muted-foreground w-4 text-center font-mono">{entry.rank}</span>
            <span className="text-[11px] text-foreground flex-1 font-medium">{entry.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{entry.hours}</span>
          </motion.div>
        ))}
      </div>

      {/* Your position */}
      <div className="border-t border-border px-3 py-2">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-primary/5 border border-primary/10">
          <span className="text-[10px] text-primary font-mono w-4 text-center">#12</span>
          <span className="text-[11px] text-primary font-semibold flex-1">You</span>
          <span className="text-[10px] text-muted-foreground font-mono">42h</span>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 3. Pomodoro Demo — amber ring with cycle dots
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
    <motion.div
      className={PANEL}
      variants={panelEntrance}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Timer className="h-4 w-4 text-amber-400" />
        <span className="text-xs font-semibold text-foreground">Pomodoro Timer</span>
      </div>

      <div className="flex flex-col items-center py-4">
        <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold mb-2">
          Focus
        </span>
        <div className="relative w-28 h-28">
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-full blur-md transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle, rgba(245,158,11,${0.08 + progress * 0.12}) 0%, transparent 70%)`,
            }}
          />
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 relative">
            <circle cx="50" cy="50" r={RING_R} fill="none" stroke="currentColor" strokeWidth="4" className="text-amber-500/10" />
            <circle
              cx="50" cy="50" r={RING_R} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={RING_C} strokeDashoffset={dashOffset}
              className="text-amber-400 transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground font-mono tabular-nums">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Cycle dots */}
        <div className="flex items-center gap-2 mt-3">
          {[0, 1, 2, 3].map((c) => (
            <div key={c} className="flex flex-col items-center gap-0.5">
              <div className={`w-2.5 h-2.5 rounded-full border ${
                c < 2 ? "bg-amber-400 border-amber-500" :
                c === 2 ? "bg-amber-400/50 border-amber-500/60 animate-pulse" :
                "bg-muted/30 border-border"
              }`} />
              <span className="text-[7px] text-muted-foreground">{c < 2 ? "✓" : ""}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 flex justify-center gap-4 text-[10px] text-muted-foreground">
        <span>Session 3 of 4</span>
        <span className="text-amber-400">25 min focus</span>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 4. Economy Demo — area chart + shop items
// ---------------------------------------------------------------------------
const ECON_DATA = [
  { day: "M", earned: 320, spent: 150 },
  { day: "T", earned: 180, spent: 80 },
  { day: "W", earned: 450, spent: 200 },
  { day: "T", earned: 280, spent: 350 },
  { day: "F", earned: 520, spent: 120 },
  { day: "S", earned: 200, spent: 180 },
  { day: "S", earned: 380, spent: 100 },
];

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
    <motion.div
      ref={ref}
      className={PANEL}
      variants={panelEntrance}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-foreground">Economy</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
            {balance.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground">coins</span>
        </div>
      </div>

      {/* Mini area chart */}
      <div className="px-2 h-20">
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ECON_DATA} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }} axisLine={false} tickLine={false} />
              <Area type="monotone" dataKey="earned" stroke="#10b981" strokeWidth={1.5} fill="url(#earnedGrad)" animationDuration={800} />
              <Area type="monotone" dataKey="spent" stroke="#ef4444" strokeWidth={1.5} fill="url(#spentGrad)" animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="px-4 py-1 flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-muted-foreground">Earned</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-muted-foreground">Spent</span>
        </div>
        <div className="ml-auto flex items-center gap-0.5 text-emerald-400">
          <TrendingUp className="h-2.5 w-2.5" />
          <span className="font-semibold">+820</span>
        </div>
      </div>

      {/* Shop item */}
      <div className="px-4 pb-3">
        <div className="rounded-lg border border-border bg-muted/30 p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs font-medium text-foreground">VIP Role</span>
            </div>
            <span className="text-[10px] text-purple-400 font-medium">Cosmetic</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Coins className="h-3 w-3 text-emerald-400" />
              500 coins
            </span>
            <button className="px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-medium text-emerald-400 cursor-default">
              Purchase
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
// --- END AI-MODIFIED ---
