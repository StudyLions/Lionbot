// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 7 -- Schedule & Accountability sessions config
// ============================================================
import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Coins, ChevronDown, ChevronUp } from "lucide-react"
import StepLayout from "../StepLayout"
import { getLeoMessage } from "../leoMessages"

interface StepScheduleProps {
  config: Record<string, any>
  serverName: string
  onUpdate: (key: string, value: any) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  saving: boolean
  direction: number
}

function Slider({ label, value, min, max, step, onChange, suffix = "", description }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; suffix?: string; description?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-sm font-mono font-semibold text-[#DDB21D]">{value}{suffix}</span>
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#DDB21D] bg-gray-700"
      />
    </div>
  )
}

const DEMO_SESSIONS = [
  { time: "Mon 09:00", label: "Morning Study", slots: 4, filled: 3, price: 50 },
  { time: "Wed 14:00", label: "Afternoon Grind", slots: 6, filled: 6, price: 50 },
  { time: "Fri 20:00", label: "Night Owls", slots: 8, filled: 5, price: 50 },
]

export default function StepSchedule({
  config, serverName, onUpdate, onNext, onBack, onSkip, saving, direction,
}: StepScheduleProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const price = config.accountability_price ?? 50
  const reward = config.accountability_reward ?? 100
  const bonus = config.accountability_bonus ?? 25

  return (
    <StepLayout
      title="Schedule & Accountability"
      subtitle="Members bet coins they'll show up -- or lose them"
      leoPose="pointing"
      leoMessage={getLeoMessage("schedule", "intro", serverName)}
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      saving={saving}
      direction={direction}
    >
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Calendar className="w-4 h-4 text-[#DDB21D]" />
          Accountability Sessions
        </div>
        <p className="text-xs text-gray-400">
          Admins create scheduled study sessions. Members pay coins to reserve a spot.
          Show up? Get rewarded. Ghost? You lose your deposit. It&apos;s beautiful.
        </p>

        <Slider
          label="Booking price"
          value={price}
          min={0}
          max={500}
          step={10}
          onChange={(v) => onUpdate("accountability_price", v)}
          suffix=" coins"
          description="How many coins members pay to book a session"
        />

        <Slider
          label="Attendance reward"
          value={reward}
          min={0}
          max={500}
          step={10}
          onChange={(v) => onUpdate("accountability_reward", v)}
          suffix=" coins"
          description="Coins earned for actually showing up"
        />

        <Slider
          label="Bonus reward"
          value={bonus}
          min={0}
          max={200}
          step={5}
          onChange={(v) => onUpdate("accountability_bonus", v)}
          suffix=" coins"
          description="Extra bonus for completing the full session"
        />
      </div>

      {/* Demo Schedule */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">How scheduled sessions look:</p>
        <div className="bg-[#36393f] rounded-lg p-4 space-y-3 max-w-md w-full">
          {DEMO_SESSIONS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between bg-[#2f3136] rounded-lg px-3 py-2.5"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-white">{s.label}</p>
                <p className="text-[10px] text-gray-500">{s.time}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Coins className="w-3 h-3 text-[#DDB21D]" />
                  <span className="text-[10px] text-[#DDB21D]">{price}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  s.filled >= s.slots
                    ? "bg-red-500/20 text-red-400"
                    : "bg-[#43b581]/20 text-[#43b581]"
                }`}>
                  {s.filled}/{s.slots}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Profit breakdown */}
      <div className="bg-gradient-to-r from-[#43b581]/10 to-[#DDB21D]/10 border border-[#43b581]/20 rounded-xl p-4">
        <p className="text-xs text-gray-300">
          <span className="font-medium text-white">How it works:</span> Member pays <span className="text-[#DDB21D] font-bold">{price}</span> coins to book →
          Shows up → Gets deposit back + <span className="text-[#43b581] font-bold">{reward}</span> reward + <span className="text-[#DDB21D] font-bold">{bonus}</span> bonus =
          <span className="text-white font-bold"> {reward + bonus} coins profit!</span>
          {price > 0 && <> If they ghost: <span className="text-red-400 font-bold">-{price} coins</span>.</>}
        </p>
      </div>

      {/* Advanced */}
      <div className="border border-gray-700/50 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-5 py-3 bg-gray-800/40 hover:bg-gray-800/60 transition-colors"
        >
          <span className="text-sm font-medium text-gray-400">Advanced Schedule Settings</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="px-5 py-4 space-y-4 bg-gray-800/30"
          >
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Schedule Category ID</label>
              <input
                type="text"
                value={config.accountability_category || ""}
                onChange={(e) => onUpdate("accountability_category", e.target.value || null)}
                placeholder="Category for schedule voice channels"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Schedule Lobby Channel ID</label>
              <input
                type="text"
                value={config.accountability_lobby || ""}
                onChange={(e) => onUpdate("accountability_lobby", e.target.value || null)}
                placeholder="Lobby channel for scheduled sessions"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 outline-none"
              />
            </div>
          </motion.div>
        )}
      </div>
    </StepLayout>
  )
}
