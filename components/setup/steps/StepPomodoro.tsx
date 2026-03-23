// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 6 -- Pomodoro timer configuration and demo
// ============================================================
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Timer, Play, Pause } from "lucide-react"
import StepLayout from "../StepLayout"
import { getLeoMessage } from "../leoMessages"
import { ChannelSelect } from "@/components/dashboard/ui"

interface StepPomodoroProps {
  config: Record<string, any>
  serverName: string
  guildId: string
  onUpdate: (key: string, value: any) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  saving: boolean
  direction: number
}

function PomodoroDemo() {
  const [phase, setPhase] = useState<"focus" | "break">("focus")
  const [seconds, setSeconds] = useState(25 * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s - 60 <= 0) {
          setPhase((p) => (p === "focus" ? "break" : "focus"))
          return phase === "focus" ? 5 * 60 : 25 * 60
        }
        return s - 60
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [phase])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const progress = phase === "focus"
    ? ((25 * 60 - seconds) / (25 * 60)) * 100
    : ((5 * 60 - seconds) / (5 * 60)) * 100

  return (
    <div className="bg-[#36393f] rounded-lg p-6 max-w-sm w-full mx-auto text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <div className={`w-2 h-2 rounded-full ${phase === "focus" ? "bg-[#f57c00]" : "bg-[#43b581]"}`} />
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
          {phase === "focus" ? "Focus Time" : "Break Time"}
        </span>
      </div>
      <motion.div
        key={phase}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-4xl font-bold text-white font-mono"
      >
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </motion.div>
      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${phase === "focus" ? "bg-[#f57c00]" : "bg-[#43b581]"}`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <div className="flex justify-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <Play className="w-3.5 h-3.5 text-gray-300 ml-0.5" />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <Pause className="w-3.5 h-3.5 text-gray-300" />
        </div>
      </div>
      <p className="text-[10px] text-gray-500">
        Members study together with synchronized timers
      </p>
    </div>
  )
}

export default function StepPomodoro({
  config, serverName, guildId, onUpdate, onNext, onBack, onSkip, saving, direction,
}: StepPomodoroProps) {
  return (
    <StepLayout
      title="Pomodoro Timer"
      subtitle="Timed focus sessions -- 25 minutes of work, then a 5-minute break"
      leoPose="thumbsUp"
      leoMessage={getLeoMessage("pomodoro", "intro", serverName)}
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      saving={saving}
      direction={direction}
    >
      {/* Config */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Timer className="w-4 h-4 text-[#DDB21D]" />
          Pomodoro Channel
        </div>
        <p className="text-xs text-gray-400">
          Members type <code className="bg-gray-700 px-1 rounded text-[#DDB21D]">/pomodoro</code> in any Discord channel to start a focus session.
          The bot runs a timer: 25 minutes of focused work, then a 5-minute break, repeating until they stop.
          Pick a channel below where timer notifications (start, break, resume) will appear.
        </p>
        <ChannelSelect
          guildId={guildId}
          value={config.pomodoro_channel ?? null}
          onChange={(v) => onUpdate("pomodoro_channel", (v as string) || null)}
          channelTypes={[0, 5]}
          placeholder="Select a channel for Pomodoro notifications"
        />
      </div>

      {/* Demo */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Live demo -- how it looks:</p>
        <PomodoroDemo />
      </div>

      {/* Info */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 space-y-3">
        <h4 className="text-sm font-medium text-white">How it works</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { emoji: "1.", title: "Start", desc: "A member types /pomodoro in Discord to begin" },
            { emoji: "2.", title: "Focus", desc: "25 min of focused work -- the bot tracks who's active" },
            { emoji: "3.", title: "Break", desc: "5 min break, then repeat. LionCoins are earned each cycle!" },
          ].map((item) => (
            <div key={item.title} className="bg-gray-700/50 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium text-[#DDB21D]">{item.emoji} {item.title}</p>
              <p className="text-[11px] text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </StepLayout>
  )
}
