// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 1 -- Welcome hero with animated stats counters
// ============================================================
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { ArrowRight, Users, Clock, Globe, Zap } from "lucide-react"
import LeoMascot from "../LeoMascot"
import { getLeoMessage } from "../leoMessages"

interface StepWelcomeProps {
  serverName: string
  onNext: () => void
  onSkipWizard: () => void
}

function AnimCounter({ target, duration = 2000, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const interval = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(interval)
  }, [target, duration])
  return <span>{count.toLocaleString()}{suffix}</span>
}

const STATS = [
  { icon: <Globe className="w-5 h-5" />, value: 73803, label: "Servers", suffix: "" },
  { icon: <Users className="w-5 h-5" />, value: 10000, label: "Concurrent Voice Users", suffix: "+" },
  { icon: <Clock className="w-5 h-5" />, value: 7158, label: "Years of Study Tracked", suffix: "" },
  { icon: <Zap className="w-5 h-5" />, value: 99, label: "Uptime Percentage", suffix: ".9%" },
]

export default function StepWelcome({ serverName, onNext, onSkipWizard }: StepWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-full px-4 py-8 space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          Welcome to <span className="text-[#DDB21D]">LionBot</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
          The most comprehensive study & community bot on Discord.
          Let&apos;s set up <span className="text-white font-medium">{serverName}</span> together.
        </p>
        <p className="text-gray-500 text-xs max-w-lg mx-auto mt-1">
          This wizard walks you through every feature. You can skip any step and change settings later from the dashboard.
        </p>
      </motion.div>

      <LeoMascot
        pose="waving"
        message={getLeoMessage("welcome", "intro", serverName)}
        // --- AI-MODIFIED (2026-03-23) ---
        // Purpose: Pass welcome-step hint for LeoMascot post-intro cycling
        hintMessage={getLeoMessage("welcome", "hint", serverName)}
        // --- END AI-MODIFIED ---
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl"
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.15 }}
            className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 text-center"
          >
            <div className="flex justify-center text-[#DDB21D] mb-2">{stat.icon}</div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              <AnimCounter target={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col items-center gap-3"
      >
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3.5 bg-[#DDB21D] hover:bg-[#C4961A] text-gray-900 font-semibold rounded-xl transition-colors text-base"
        >
          Let&apos;s Set Up {serverName}
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={onSkipWizard}
          className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
        >
          Skip setup wizard &mdash; I&apos;ll configure manually
        </button>
      </motion.div>
    </motion.div>
  )
}
