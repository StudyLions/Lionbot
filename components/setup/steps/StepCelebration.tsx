// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 12 -- Celebration with confetti, config
//          summary, and next-step action cards
// ============================================================
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  PartyPopper, Check, X, ArrowRight, Trophy, ShoppingBag,
  Tag, Settings, BarChart3,
} from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"
import LeoMascot from "../LeoMascot"
import { getLeoMessage } from "../leoMessages"
import { WIZARD_STEPS } from "../WizardNav"

interface StepCelebrationProps {
  serverName: string
  guildId: string
  completedSteps: Set<number>
  onFinish: () => void
  direction: number
}

const NEXT_ACTIONS = [
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Ranks Editor",
    desc: "Customize rank tiers, names, and thresholds",
    href: (id: string) => `/dashboard/servers/${id}/ranks`,
    color: "#DDB21D",
  },
  {
    icon: <ShoppingBag className="w-5 h-5" />,
    title: "Shop Editor",
    desc: "Create items members can buy with coins",
    href: (id: string) => `/dashboard/servers/${id}/shop`,
    color: "#43b581",
  },
  {
    icon: <Tag className="w-5 h-5" />,
    title: "Role Menu Editor",
    desc: "Build self-assign role menus",
    href: (id: string) => `/dashboard/servers/${id}/rolemenus`,
    color: "#5865F2",
  },
  {
    icon: <Settings className="w-5 h-5" />,
    title: "Full Settings",
    desc: "Fine-tune every setting in detail",
    href: (id: string) => `/dashboard/servers/${id}/settings`,
    color: "#f57c00",
  },
]

export default function StepCelebration({
  serverName, guildId, completedSteps, onFinish, direction,
}: StepCelebrationProps) {
  const confettiFired = useRef(false)

  useEffect(() => {
    if (confettiFired.current) return
    confettiFired.current = true

    const duration = 3000
    const end = Date.now() + duration
    const colors = ["#DDB21D", "#f57c00", "#5865F2", "#43b581", "#ff6b6b"]

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  const configuredCount = completedSteps.size
  const totalConfigurable = WIZARD_STEPS.filter((s) => s.type === "config").length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-full px-4 py-8 space-y-8"
    >
      {/* Big checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
        className="w-20 h-20 rounded-full bg-[#43b581] flex items-center justify-center"
      >
        <Check className="w-10 h-10 text-white" strokeWidth={3} />
      </motion.div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          {serverName} is Ready!
        </h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          You configured {configuredCount} of {totalConfigurable} available sections.
          Everything else uses smart defaults that work great out of the box.
        </p>
      </div>

      <LeoMascot pose="celebrating" message={getLeoMessage("celebration", "intro", serverName)} />

      {/* Config Summary */}
      <div className="w-full max-w-lg">
        <p className="text-xs text-gray-500 font-medium mb-2">Setup summary:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {WIZARD_STEPS.slice(1, -1).map((step, i) => {
            const stepIndex = i + 1
            const done = completedSteps.has(stepIndex)
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  done
                    ? "bg-[#43b581]/10 text-[#43b581] border border-[#43b581]/20"
                    : "bg-gray-800/40 text-gray-500 border border-gray-700/30"
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {step.label}
              </div>
            )
          })}
        </div>
      </div>

      {/* Next Steps */}
      <div className="w-full max-w-lg space-y-3">
        <p className="text-xs text-gray-500 font-medium">Recommended next steps:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {NEXT_ACTIONS.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <Link
                href={action.href(guildId)}
                className="flex items-start gap-3 p-4 bg-gray-800/60 border border-gray-700/50 rounded-xl hover:border-gray-600 transition-all group"
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${action.color}15` }}>
                  <div style={{ color: action.color }}>{action.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-[#DDB21D] transition-colors">
                    {action.title}
                  </p>
                  <p className="text-[10px] text-gray-500">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors mt-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Go to Dashboard */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={onFinish}
        className="flex items-center gap-2 px-8 py-3.5 bg-[#DDB21D] hover:bg-[#C4961A] text-gray-900 font-semibold rounded-xl transition-colors text-base"
      >
        <BarChart3 className="w-5 h-5" />
        Go to Dashboard
      </motion.button>
    </motion.div>
  )
}
