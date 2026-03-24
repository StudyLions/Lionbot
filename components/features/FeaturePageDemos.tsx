// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Dynamic UI demo elements for the /features page,
//          replacing placeholder images with animated mini-UIs
// ============================================================
import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  Mic,
  Video,
  Coins,
  Trophy,
  Shield,
  Crown,
  Star,
  Sparkles,
  Heart,
  Zap,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  UserCheck,
} from "lucide-react"

function useInView(threshold = 0.3) {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true)
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useCountUp(target: number, active: boolean, duration = 1200): number {
  const [value, setValue] = useState(0)
  const animated = useRef(false)
  useEffect(() => {
    if (!active || animated.current) return
    animated.current = true
    const start = performance.now()
    let frame: number
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.floor(eased * target))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [active, target, duration])
  return value
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
}

// ---------------------------------------------------------------------------
// 1. Study Tracking Demo
// ---------------------------------------------------------------------------
const CHANNEL_MEMBERS = [
  { name: "Alex", avatar: "A", color: "bg-blue-500", camera: true },
  { name: "Sarah", avatar: "S", color: "bg-emerald-500", camera: true },
  { name: "Mike", avatar: "M", color: "bg-violet-500", camera: false },
]

function StudyTrackingDemo() {
  const { ref, inView } = useInView(0.2)
  const [tick, setTick] = useState(0)
  const coins = useCountUp(47, inView, 1500)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const baseTimes = [2 * 3600 + 34 * 60 + 17, 1 * 3600 + 12 * 60 + 45, 45 * 60 + 22]
  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  return (
    <motion.div
      ref={ref}
      className="w-full h-full flex flex-col p-4"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={fadeUp} className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-blue-400">
          <Mic className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">General Study</span>
        </div>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[10px] text-green-400 font-medium">Live</span>
        </span>
      </motion.div>

      <div className="flex-1 space-y-1.5">
        {CHANNEL_MEMBERS.map((m, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]"
          >
            <div
              className={`w-7 h-7 rounded-full ${m.color} flex items-center justify-center text-[10px] font-bold text-white`}
            >
              {m.avatar}
            </div>
            <span className="text-xs text-foreground font-medium flex-1">{m.name}</span>
            <div className="flex items-center gap-2">
              {m.camera && <Video className="h-3 w-3 text-blue-400/70" />}
              <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                {formatTime(baseTimes[i] + tick)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={fadeUp}
        className="mt-3 p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[10px] text-muted-foreground">Session Earnings</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-blue-400 font-mono tabular-nums">+{coins}</span>
            <span className="text-[10px] text-muted-foreground">coins</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1 rounded-full bg-blue-500/10 overflow-hidden">
            <motion.div
              className="h-full bg-blue-400/60 rounded-full"
              initial={{ width: 0 }}
              animate={inView ? { width: "62%" } : {}}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground">+8 camera bonus</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// 2. Ranks & Leaderboards Demo
// ---------------------------------------------------------------------------
function RanksLeaderboardDemo() {
  const { ref, inView } = useInView(0.2)

  return (
    <motion.div
      ref={ref}
      className="w-full h-full flex flex-col p-4"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        variants={fadeUp}
        className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-3"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-400">Gold Scholar</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-[9px] font-semibold text-amber-400">
                Lv. 24
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">142h studied this month</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-amber-500/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={inView ? { width: "78%" } : {}}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
          </div>
          <span className="text-[9px] text-amber-400/70 font-mono">78%</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-muted-foreground">Next: Diamond Scholar</span>
          <span className="text-[9px] text-muted-foreground">2,340 / 3,000 XP</span>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="h-3 w-3 text-amber-400" />
          <span className="text-[10px] font-semibold text-foreground">Top Members</span>
        </div>
        <div className="space-y-1">
          {[
            { rank: 1, name: "Alex", hours: "142h", badge: "\u{1F947}" },
            { rank: 2, name: "Sarah", hours: "128h", badge: "\u{1F948}" },
            { rank: 3, name: "Mike", hours: "115h", badge: "\u{1F949}" },
          ].map((e) => (
            <motion.div
              key={e.rank}
              variants={fadeUp}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03]"
            >
              <span className="text-xs">{e.badge}</span>
              <span className="text-[11px] text-foreground font-medium flex-1">{e.name}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{e.hours}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-2">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
          <span className="text-[10px] text-amber-400 font-mono font-semibold w-5">#12</span>
          <span className="text-[11px] text-amber-400 font-semibold flex-1">You</span>
          <span className="text-[10px] text-muted-foreground font-mono">42h</span>
          <div className="flex items-center gap-0.5 text-green-400">
            <ArrowUpRight className="h-2.5 w-2.5" />
            <span className="text-[9px] font-semibold">+3</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// 3. Economy & Shop Demo
// ---------------------------------------------------------------------------
function EconomyShopDemo() {
  const { ref, inView } = useInView(0.2)
  const balance = useCountUp(2450, inView, 1500)

  const shopItems = [
    { name: "VIP Role", dotColor: "bg-purple-500", price: 500, tag: "Role" },
    { name: "Ocean Blue", dotColor: "bg-cyan-500", price: 200, tag: "Color" },
    { name: "Private Room", dotColor: "bg-amber-500", price: 800, tag: "Channel" },
  ]

  return (
    <motion.div
      ref={ref}
      className="w-full h-full flex flex-col p-4"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              {balance.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground ml-1">coins</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-emerald-400">
          <ArrowUpRight className="h-3 w-3" />
          <span className="text-[10px] font-semibold">+820 this week</span>
        </div>
      </motion.div>

      <div className="flex-1 space-y-1.5">
        {shopItems.map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04]"
          >
            <div className={`w-4 h-4 rounded-full ${item.dotColor}`} />
            <span className="text-xs font-medium text-foreground flex-1">{item.name}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.05] text-muted-foreground">
              {item.tag}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">{item.price}</span>
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeUp} className="mt-3 border-t border-white/[0.05] pt-2.5">
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">
          Recent
        </span>
        <div className="space-y-1 mt-1.5">
          {[
            { sign: "+", amount: 120, desc: "Voice (2h)", color: "text-emerald-400" },
            { sign: "\u2212", amount: 200, desc: "Ocean Blue", color: "text-red-400" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              <span className={`font-mono font-semibold ${t.color}`}>
                {t.sign}
                {t.amount}
              </span>
              <span className="text-muted-foreground">{t.desc}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// 4. Pomodoro Focus Demo
// ---------------------------------------------------------------------------
const POMO_TOTAL = 25 * 60
const RING_R = 36
const RING_C = 2 * Math.PI * RING_R

function PomodoroFocusDemo() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => (e + 1) % POMO_TOTAL), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = POMO_TOTAL - elapsed
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const progress = elapsed / POMO_TOTAL
  const dashOffset = RING_C * (1 - progress)

  return (
    <motion.div
      className="w-full h-full flex flex-col items-center justify-center p-4"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={fadeUp} className="flex items-center gap-1.5 mb-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-rose-400 font-semibold">
          Focus Mode
        </span>
        <span className="relative flex h-1.5 w-1.5 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-400" />
        </span>
      </motion.div>

      <motion.div variants={fadeUp} className="relative w-32 h-32 mb-4">
        <div
          className="absolute inset-0 rounded-full blur-lg transition-opacity"
          style={{
            background: `radial-gradient(circle, rgba(244,63,94,${
              0.06 + progress * 0.1
            }) 0%, transparent 70%)`,
          }}
        />
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 relative">
          <circle
            cx="50"
            cy="50"
            r={RING_R}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-rose-500/10"
          />
          <circle
            cx="50"
            cy="50"
            r={RING_R}
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={dashOffset}
            className="text-rose-400 transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground font-mono tabular-nums">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <span className="text-[9px] text-muted-foreground mt-0.5">remaining</span>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
        {[0, 1, 2, 3].map((c) => (
          <div key={c} className="flex flex-col items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full border-2 transition-all ${
                c < 2
                  ? "bg-rose-400 border-rose-500 shadow-sm shadow-rose-400/30"
                  : c === 2
                  ? "bg-rose-400/40 border-rose-400/50 animate-pulse"
                  : "bg-transparent border-white/10"
              }`}
            />
            <span className="text-[7px] text-muted-foreground">{c < 2 ? "\u2713" : ""}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="flex items-center gap-4 text-[10px] text-muted-foreground"
      >
        <span>
          Session <span className="text-rose-400 font-semibold">3</span> of 4
        </span>
        <span className="w-px h-3 bg-white/10" />
        <span>
          <span className="text-rose-400 font-semibold">25 min</span> focus
        </span>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// 5. LionGotchi Pet Demo
// ---------------------------------------------------------------------------
const PET_STATS = [
  { label: "Health", value: 82, color: "bg-red-400", Icon: Heart },
  { label: "Hunger", value: 64, color: "bg-amber-400", Icon: Zap },
  { label: "Happiness", value: 91, color: "bg-emerald-400", Icon: Sparkles },
]

function LionGotchiDemo() {
  const { ref, inView } = useInView(0.2)

  return (
    <motion.div
      ref={ref}
      className="w-full h-full flex flex-col p-4"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <span className="text-xl">{"\u{1F981}"}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">Leo Jr.</span>
            <span className="px-1.5 py-0.5 rounded-md bg-orange-500/15 text-[9px] font-bold text-orange-400">
              Lv. 12
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 h-1.5 rounded-full bg-orange-500/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                initial={{ width: 0 }}
                animate={inView ? { width: "45%" } : {}}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              />
            </div>
            <span className="text-[8px] text-muted-foreground font-mono">450/1000 XP</span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-2 flex-1">
        {PET_STATS.map((stat, i) => (
          <motion.div key={i} variants={fadeUp} className="flex items-center gap-2">
            <stat.Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-[10px] text-muted-foreground w-16">{stat.label}</span>
            <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                className={`h-full ${stat.color} rounded-full`}
                initial={{ width: 0 }}
                animate={inView ? { width: `${stat.value}%` } : {}}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 + i * 0.15 }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground font-mono w-7 text-right">
              {stat.value}%
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={fadeUp}
        className="mt-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]"
      >
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Equipment</span>
        <div className="flex items-center gap-2 mt-1.5">
          {[
            { icon: "\u2694\uFE0F", stat: "+15 ATK", active: true },
            { icon: "\uD83D\uDEE1\uFE0F", stat: "+10 DEF", active: true },
            { icon: "\uD83D\uDC8D", stat: "Empty", active: false },
          ].map((eq, i) => (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center gap-1 p-1.5 rounded-lg ${
                eq.active
                  ? "bg-orange-500/5 border border-orange-500/15"
                  : "bg-white/[0.02] border border-dashed border-white/[0.08]"
              }`}
            >
              <span className="text-sm">{eq.icon}</span>
              <span
                className={`text-[8px] font-mono ${
                  eq.active ? "text-orange-400" : "text-muted-foreground/50"
                }`}
              >
                {eq.stat}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-2 flex gap-2">
        {["Feed", "Bathe", "Play"].map((action) => (
          <button
            key={action}
            className="flex-1 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] font-medium text-orange-400 cursor-default hover:bg-orange-500/15 transition-colors"
          >
            {action}
          </button>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// 6. Server Management Demo
// ---------------------------------------------------------------------------
const SELF_ROLES = [
  { label: "\uD83D\uDCDA Student", active: true },
  { label: "\uD83D\uDCBB Developer", active: false },
  { label: "\uD83C\uDFA8 Artist", active: true },
  { label: "\uD83C\uDFAE Gamer", active: false },
]

function ServerManagementDemo() {
  const { ref } = useInView(0.2)

  return (
    <motion.div
      ref={ref}
      className="w-full h-full flex flex-col p-4"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={fadeUp} className="mb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <UserCheck className="h-3 w-3 text-violet-400" />
          <span className="text-[10px] font-semibold text-foreground">Self-Assign Roles</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {SELF_ROLES.map((role, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`px-2.5 py-2 rounded-lg text-[11px] font-medium text-center cursor-default transition-all ${
                role.active
                  ? "bg-violet-500/15 border border-violet-500/30 text-violet-300"
                  : "bg-white/[0.03] border border-white/[0.06] text-muted-foreground"
              }`}
            >
              {role.label}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="p-3 rounded-xl border border-violet-500/15 bg-violet-500/5 mb-3"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Calendar className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-foreground">Morning Study</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Mon\u2013Fri, 9:00 AM</span>
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              {["bg-blue-500", "bg-emerald-500", "bg-amber-500"].map((c, i) => (
                <div key={i} className={`w-4 h-4 rounded-full ${c} border-2 border-card`} />
              ))}
            </div>
            <span className="text-[9px] text-muted-foreground ml-1">+9</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <Shield className="h-3 w-3 text-violet-400" />
          <span className="text-[10px] font-semibold text-foreground">Mod Actions</span>
        </div>
        <div className="space-y-1.5">
          {[
            {
              Icon: AlertTriangle,
              text: "Warning issued to user_42",
              time: "2m ago",
              iconColor: "text-amber-400",
            },
            {
              Icon: CheckCircle2,
              text: "Ticket #847 resolved",
              time: "15m ago",
              iconColor: "text-emerald-400",
            },
          ].map((entry, i) => (
            <div key={i} className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03]">
              <entry.Icon className={`h-3 w-3 ${entry.iconColor} flex-shrink-0 mt-0.5`} />
              <span className="text-[10px] text-foreground/80 flex-1">{entry.text}</span>
              <span className="text-[8px] text-muted-foreground flex-shrink-0">{entry.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// 7. Premium & Customization Demo
// ---------------------------------------------------------------------------
function PremiumDemo() {
  const { ref, inView } = useInView(0.2)
  const gems = useCountUp(350, inView, 1200)

  return (
    <motion.div
      ref={ref}
      className="w-full h-full flex flex-col p-4"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={fadeUp} className="relative p-3 rounded-xl overflow-hidden mb-3">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10" />
        <div className="absolute inset-0 border border-pink-500/20 rounded-xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground">Alex</span>
              <Crown className="h-3.5 w-3.5 text-pink-400" />
            </div>
            <span className="text-[10px] text-muted-foreground">
              Level 42 &middot; 142h studied
            </span>
          </div>
        </div>
        <div className="relative mt-2.5 flex items-center justify-between">
          <span className="text-[9px] text-pink-400/80 font-medium">
            {"\u2728"} &ldquo;Neon Galaxy&rdquo; skin
          </span>
          <div className="flex gap-1">
            {[true, false, false].map((active, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${active ? "bg-pink-400" : "bg-white/10"}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] mb-3"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-cyan-400 font-mono tabular-nums">{gems}</span>
            <span className="text-[10px] text-muted-foreground">LionGems</span>
          </div>
          <span className="text-[9px] text-muted-foreground">Vote on top.gg for free gems!</span>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="p-3 rounded-xl border border-pink-500/15 bg-pink-500/5 flex-1"
      >
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-3.5 w-3.5 text-pink-400" />
          <span className="text-xs font-semibold text-foreground">LionHeart</span>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-pink-500/15 text-[8px] font-bold text-pink-400 uppercase tracking-wider">
            Active
          </span>
        </div>
        <div className="space-y-1.5">
          {["Custom server branding", "Unlimited role menu slots", "Priority support"].map(
            (perk, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-2.5 w-2.5 text-pink-400 flex-shrink-0" />
                <span className="text-[10px] text-foreground/70">{perk}</span>
              </div>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Mapping: feature ID -> demo component
// ---------------------------------------------------------------------------
export const FEATURE_DEMOS: Record<string, React.ComponentType> = {
  study: StudyTrackingDemo,
  ranks: RanksLeaderboardDemo,
  economy: EconomyShopDemo,
  pomodoro: PomodoroFocusDemo,
  liongotchi: LionGotchiDemo,
  management: ServerManagementDemo,
  premium: PremiumDemo,
}
