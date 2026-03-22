// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Live Discord-style preview components for the setup
//          wizard -- greeting embed, reward stats, rank-up
//          notification, and feature mini-demos
// ============================================================
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import {
  Trophy, ShoppingBag, Timer, ListChecks, Calendar, Video,
  CheckSquare, Heart, BarChart3, Coins, Mic, MessageSquare,
  Zap,
} from "lucide-react"

function BotAvatar() {
  return (
    <div className="w-10 h-10 rounded-full bg-[#DDB21D] flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <circle cx="12" cy="10" r="6" />
        <ellipse cx="12" cy="20" rx="5" ry="4" />
        <circle cx="9" cy="9" r="1.2" fill="#DDB21D" />
        <circle cx="15" cy="9" r="1.2" fill="#DDB21D" />
      </svg>
    </div>
  )
}

function BotHeader({ timestamp }: { timestamp?: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm font-semibold text-[#DDB21D]">LionBot</span>
      <span className="text-[9px] bg-[#5865F2] text-white px-1 py-0.5 rounded font-semibold uppercase leading-none">Bot</span>
      <span className="text-[10px] text-[#72767d]">{timestamp || "Today at 12:00 PM"}</span>
    </div>
  )
}

// ────────────────────────────────────────
// Greeting embed preview
// ────────────────────────────────────────
interface GreetingPreviewProps {
  message: string
  serverName: string
}

export function GreetingPreview({ message, serverName }: GreetingPreviewProps) {
  const rendered = (message || "Welcome to {server_name}, {mention}! We're glad to have you here.")
    .replace(/\{mention\}/g, "@NewMember")
    .replace(/\{user_name\}/g, "NewMember")
    .replace(/\{server_name\}/g, serverName || "Your Server")

  return (
    <div className="bg-[#36393f] rounded-lg p-4 max-w-md w-full">
      <div className="flex gap-3">
        <BotAvatar />
        <div className="flex-1 min-w-0">
          <BotHeader />
          <div className="flex gap-1 mt-1">
            <div className="w-1 flex-shrink-0 rounded-full bg-[#f57c00]" />
            <div className="flex-1 min-w-0 pl-2">
              <AnimatePresence mode="wait">
                <motion.p
                  key={rendered.slice(0, 30)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#dcddde] text-xs leading-relaxed whitespace-pre-wrap break-words"
                >
                  {rendered}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────
// Reward / stats preview
// ────────────────────────────────────────
interface RewardPreviewProps {
  hourlyReward: number
  cameraBonus: number
  dailyCap: number | null
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    const diff = value - display
    if (diff === 0) return
    const steps = 12
    let step = 0
    const interval = setInterval(() => {
      step++
      setDisplay(Math.round(display + (diff * step) / steps))
      if (step >= steps) {
        setDisplay(value)
        clearInterval(interval)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [value])
  return <span>{display.toLocaleString()}{suffix}</span>
}

export function RewardPreview({ hourlyReward, cameraBonus, dailyCap }: RewardPreviewProps) {
  const fourHourEarnings = hourlyReward * 4
  const withCamera = (hourlyReward + cameraBonus) * 4
  return (
    <div className="bg-[#36393f] rounded-lg p-4 max-w-md w-full">
      <div className="flex gap-3">
        <BotAvatar />
        <div className="flex-1 min-w-0">
          <BotHeader timestamp="Today at 3:00 PM" />
          <div className="flex gap-1 mt-1">
            <div className="w-1 flex-shrink-0 rounded-full bg-[#f57c00]" />
            <div className="flex-1 min-w-0 pl-2 space-y-2">
              <p className="text-xs font-semibold text-[#f57c00]">Study Session Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-[#72767d]">Study Time</span>
                <span className="text-[#dcddde]">1h 00m</span>
                <span className="text-[#72767d]">Coins Earned</span>
                <motion.span
                  key={hourlyReward}
                  className="text-[#DDB21D] font-semibold"
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                >
                  <AnimatedNumber value={hourlyReward} suffix=" coins" />
                </motion.span>
                {cameraBonus > 0 && (
                  <>
                    <span className="text-[#72767d]">Camera Bonus</span>
                    <motion.span
                      key={cameraBonus}
                      className="text-[#43b581] font-semibold"
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                    >
                      +<AnimatedNumber value={cameraBonus} suffix=" coins" />
                    </motion.span>
                  </>
                )}
                {dailyCap && (
                  <>
                    <span className="text-[#72767d]">Daily Cap</span>
                    <span className="text-[#dcddde]">{dailyCap}h</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 px-3 py-2 bg-[#2f3136] rounded text-[10px] text-[#b9bbbe]">
            In a 4-hour session: <span className="text-[#DDB21D] font-semibold"><AnimatedNumber value={fourHourEarnings} /></span> coins
            {cameraBonus > 0 && (
              <> (or <span className="text-[#43b581] font-semibold"><AnimatedNumber value={withCamera} /></span> with camera)</>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────
// Rank-up notification preview
// ────────────────────────────────────────
interface RankUpPreviewProps {
  serverName: string
  rankType: string
}

const RANK_TIERS = [
  { name: "Beginner", hours: "0-100h", color: "#72767d" },
  { name: "Student", hours: "100-500h", color: "#43b581" },
  { name: "Scholar", hours: "500-1000h", color: "#5865F2" },
  { name: "Master", hours: "1000h+", color: "#DDB21D" },
]

const RANK_TYPE_LABELS: Record<string, { label: string; icon: typeof Mic }> = {
  VOICE: { label: "Voice Time", icon: Mic },
  MESSAGE: { label: "Messages", icon: MessageSquare },
  XP: { label: "Combined XP", icon: Zap },
}

export function RankUpPreview({ serverName, rankType }: RankUpPreviewProps) {
  const [highlightIdx, setHighlightIdx] = useState(1)
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIdx((prev) => (prev + 1) % RANK_TIERS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const rank = RANK_TIERS[highlightIdx]
  const rtInfo = RANK_TYPE_LABELS[rankType] || RANK_TYPE_LABELS.XP
  const RtIcon = rtInfo.icon

  return (
    <div className="space-y-4 max-w-md w-full">
      {/* Mock embed */}
      <div className="bg-[#36393f] rounded-lg p-4">
        <div className="flex gap-3">
          <BotAvatar />
          <div className="flex-1 min-w-0">
            <BotHeader />
            <div className="flex gap-1 mt-1">
              <div className="w-1 flex-shrink-0 rounded-full bg-[#f57c00]" />
              <div className="flex-1 min-w-0 pl-2">
                <p className="text-xs font-semibold text-[#f57c00] mb-1">New Activity Rank Attained!</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={rank.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-[#dcddde] text-xs"
                  >
                    Congratulations! You reached <span className="font-semibold" style={{ color: rank.color }}>{rank.name}</span> in <span className="font-semibold">{serverName || "Your Server"}</span>!
                  </motion.p>
                </AnimatePresence>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#72767d]">
                  <RtIcon size={10} />
                  <span>Based on: {rtInfo.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rank ladder */}
      <div className="flex items-end gap-2 justify-center">
        {RANK_TIERS.map((tier, i) => (
          <motion.div
            key={tier.name}
            className="flex flex-col items-center gap-1"
            animate={{ scale: i === highlightIdx ? 1.1 : 0.95, opacity: i === highlightIdx ? 1 : 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div
              className="rounded-md flex items-center justify-center text-white text-[9px] font-bold"
              style={{
                backgroundColor: tier.color,
                width: 20 + i * 8,
                height: 20 + i * 10,
                boxShadow: i === highlightIdx ? `0 0 12px ${tier.color}60` : "none",
              }}
            >
              {i + 1}
            </div>
            <span className="text-[9px] text-[#b9bbbe] whitespace-nowrap">{tier.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────
// Feature mini-demo cards
// ────────────────────────────────────────
interface FeatureCardData {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

export const FEATURE_CARDS: FeatureCardData[] = [
  {
    id: "economy",
    title: "Economy & Shop",
    description: "Members earn coins through activity and spend them in a customizable role shop.",
    icon: <Coins size={22} />,
    color: "#DDB21D",
  },
  {
    id: "pomodoro",
    title: "Pomodoro Timers",
    description: "Built-in focus timers with streaks, milestones, and voice channel integration.",
    icon: <Timer size={22} />,
    color: "#f57c00",
  },
  {
    id: "leaderboard",
    title: "Leaderboards",
    description: "Server-wide and global leaderboards that rank members by study time or XP.",
    icon: <BarChart3 size={22} />,
    color: "#5865F2",
  },
  {
    id: "rolemenus",
    title: "Role Menus",
    description: "Self-assign roles via interactive menus with categories and limits.",
    icon: <ListChecks size={22} />,
    color: "#43b581",
  },
  {
    id: "schedule",
    title: "Scheduled Sessions",
    description: "Plan group study sessions with RSVPs and accountability deposits.",
    icon: <Calendar size={22} />,
    color: "#7289da",
  },
  {
    id: "video",
    title: "Video Channels",
    description: "Require camera-on in designated study channels for accountability.",
    icon: <Video size={22} />,
    color: "#ff6b6b",
  },
  {
    id: "tasks",
    title: "Tasks & Reminders",
    description: "Personal to-do lists with rewards, weekly goals, and reminder notifications.",
    icon: <CheckSquare size={22} />,
    color: "#3ba0ff",
  },
  {
    id: "pet",
    title: "LionGotchi Pet",
    description: "Virtual pet companion with farming, equipment, crafting, and a marketplace.",
    icon: <Heart size={22} />,
    color: "#e91e8c",
  },
]

function PomodoroDemo() {
  const [seconds, setSeconds] = useState(25)
  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => (s <= 0 ? 25 : s - 1)), 120)
    return () => clearInterval(interval)
  }, [])
  const pct = seconds / 25
  return (
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="15" fill="none" stroke="#40444b" strokeWidth="3" />
        <motion.circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="#f57c00"
          strokeWidth="3"
          strokeDasharray={`${pct * 94.2} 94.2`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#dcddde]">
        {seconds}:00
      </span>
    </div>
  )
}

function LeaderboardDemo() {
  return (
    <div className="flex items-end gap-1 h-12">
      {[
        { h: "60%", color: "#c0c0c0", label: "2" },
        { h: "85%", color: "#DDB21D", label: "1" },
        { h: "45%", color: "#cd7f32", label: "3" },
      ].map((bar) => (
        <motion.div
          key={bar.label}
          className="w-4 rounded-t flex items-start justify-center"
          style={{ backgroundColor: bar.color }}
          initial={{ height: 0 }}
          animate={{ height: bar.h }}
          transition={{ duration: 0.8, delay: Number(bar.label) * 0.15, ease: "backOut" }}
        >
          <span className="text-[7px] font-bold text-[#36393f] mt-0.5">{bar.label}</span>
        </motion.div>
      ))}
    </div>
  )
}

function ShopDemo() {
  const colors = ["#ff6b6b", "#5865F2", "#43b581"]
  return (
    <div className="flex gap-1.5 items-center h-12">
      {colors.map((c, i) => (
        <motion.div
          key={c}
          className="w-8 h-8 rounded-full border-2"
          style={{ borderColor: c, backgroundColor: `${c}30` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.2, type: "spring", stiffness: 400 }}
        />
      ))}
    </div>
  )
}

function PetDemo() {
  return (
    <motion.div
      className="text-3xl"
      animate={{ y: [0, -4, 0], rotate: [0, 5, 0, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      🦁
    </motion.div>
  )
}

function RoleMenuDemo() {
  const [checks, setChecks] = useState([false, false, false])
  useEffect(() => {
    const timeouts = [
      setTimeout(() => setChecks([true, false, false]), 400),
      setTimeout(() => setChecks([true, true, false]), 900),
      setTimeout(() => setChecks([true, true, true]), 1400),
      setTimeout(() => setChecks([false, false, false]), 2400),
    ]
    const interval = setInterval(() => {
      timeouts.push(
        setTimeout(() => setChecks([true, false, false]), 400),
        setTimeout(() => setChecks([true, true, false]), 900),
        setTimeout(() => setChecks([true, true, true]), 1400),
        setTimeout(() => setChecks([false, false, false]), 2400),
      )
    }, 3000)
    return () => { clearInterval(interval); timeouts.forEach(clearTimeout) }
  }, [])
  return (
    <div className="flex flex-col gap-1">
      {checks.map((c, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-sm border transition-colors ${c ? "bg-[#43b581] border-[#43b581]" : "border-[#72767d]"}`} />
          <div className="w-8 h-1.5 rounded bg-[#40444b]" />
        </div>
      ))}
    </div>
  )
}

function CalendarDemo() {
  const [active, setActive] = useState(2)
  useEffect(() => {
    const interval = setInterval(() => setActive((a) => (a + 1) % 9), 800)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-sm"
          animate={{
            backgroundColor: i === active ? "#5865F2" : "#40444b",
            scale: i === active ? 1.2 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  )
}

const DEMO_MAP: Record<string, React.ComponentType> = {
  pomodoro: PomodoroDemo,
  leaderboard: LeaderboardDemo,
  economy: ShopDemo,
  pet: PetDemo,
  rolemenus: RoleMenuDemo,
  schedule: CalendarDemo,
}

export function FeatureMiniCard({ feature, index }: { feature: FeatureCardData; index: number }) {
  const Demo = DEMO_MAP[feature.id]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="flex-shrink-0 w-[200px] sm:w-[220px] bg-[#2f3136] rounded-xl border border-[#40444b] overflow-hidden hover:border-[#5865F2]/50 transition-colors group"
    >
      <div className="h-24 flex items-center justify-center bg-[#36393f] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(circle at 50% 50%, ${feature.color}, transparent 70%)` }}
        />
        <div className="relative">
          {Demo ? <Demo /> : (
            <motion.div
              style={{ color: feature.color }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {feature.icon}
            </motion.div>
          )}
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: feature.color }}>{feature.icon}</span>
          <h4 className="text-xs font-semibold text-[#dcddde]">{feature.title}</h4>
        </div>
        <p className="text-[10px] text-[#b9bbbe] leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  )
}
