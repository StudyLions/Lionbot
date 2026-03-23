// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Setup wizard navigation -- desktop sidebar with step
//          list and completion dots, mobile bottom sheet with
//          progress bar and swipe-up step picker
// ============================================================
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import {
  Sparkles, Settings, Coins, Trophy, ListChecks, Timer,
  Calendar, Users, Heart, Crown, Terminal, PartyPopper,
  ChevronUp, ChevronDown, X,
} from "lucide-react"

export interface WizardStep {
  id: string
  label: string
  icon: React.ReactNode
  type: "intro" | "config" | "showcase" | "celebration"
}

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Reorder steps -- show "wow" features (Ranks, LionGotchi) first, push admin plumbing (Basics) later
export const WIZARD_STEPS: WizardStep[] = [
  { id: "welcome", label: "Welcome", icon: <Sparkles className="w-4 h-4" />, type: "intro" },
  { id: "ranks", label: "Ranks & Profile", icon: <Trophy className="w-4 h-4" />, type: "config" },
  { id: "liongotchi", label: "LionGotchi", icon: <Heart className="w-4 h-4" />, type: "config" },
  { id: "economy", label: "LionCoins & Economy", icon: <Coins className="w-4 h-4" />, type: "config" },
  { id: "tasks", label: "Tasks & Workouts", icon: <ListChecks className="w-4 h-4" />, type: "config" },
  { id: "pomodoro", label: "Pomodoro", icon: <Timer className="w-4 h-4" />, type: "config" },
  { id: "schedule", label: "Schedule", icon: <Calendar className="w-4 h-4" />, type: "config" },
  { id: "basics", label: "The Basics", icon: <Settings className="w-4 h-4" />, type: "config" },
  { id: "community", label: "Community Tools", icon: <Users className="w-4 h-4" />, type: "config" },
  { id: "premium", label: "Premium & Support", icon: <Crown className="w-4 h-4" />, type: "showcase" },
  { id: "commands", label: "Commands", icon: <Terminal className="w-4 h-4" />, type: "showcase" },
  { id: "celebration", label: "All Set!", icon: <PartyPopper className="w-4 h-4" />, type: "celebration" },
]
// --- END AI-MODIFIED ---

interface WizardNavProps {
  currentStep: number
  completedSteps: Set<number>
  onStepClick: (index: number) => void
}

function StepDot({ completed, active }: { completed: boolean; active: boolean }) {
  return (
    <div
      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
        active
          ? "bg-[#DDB21D] ring-2 ring-[#DDB21D]/30 scale-125"
          : completed
          ? "bg-[#43b581]"
          : "bg-gray-600"
      }`}
    />
  )
}

export function WizardNavDesktop({ currentStep, completedSteps, onStepClick }: WizardNavProps) {
  return (
    <nav className="hidden lg:flex flex-col w-64 bg-gray-800/50 border-r border-gray-700/50 p-4 gap-1 overflow-y-auto">
      <div className="px-3 py-2 mb-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Setup Wizard</h3>
        <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#DDB21D] to-[#f57c00] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / WIZARD_STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          Step {currentStep + 1} of {WIZARD_STEPS.length}
        </p>
      </div>

      {WIZARD_STEPS.map((step, i) => {
        const isActive = i === currentStep
        const isCompleted = completedSteps.has(i)
        const isAccessible = i <= currentStep || completedSteps.has(i) || i === currentStep + 1

        return (
          <button
            key={step.id}
            onClick={() => isAccessible && onStepClick(i)}
            disabled={!isAccessible}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left group ${
              isActive
                ? "bg-[#DDB21D]/15 text-[#DDB21D] font-medium"
                : isCompleted
                ? "text-[#43b581] hover:bg-gray-700/50 cursor-pointer"
                : isAccessible
                ? "text-gray-400 hover:bg-gray-700/50 hover:text-gray-300 cursor-pointer"
                : "text-gray-600 cursor-not-allowed"
            }`}
          >
            <StepDot completed={isCompleted} active={isActive} />
            <span className="flex items-center gap-2">
              {step.icon}
              <span className="truncate">{step.label}</span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export function WizardNavMobile({ currentStep, completedSteps, onStepClick }: WizardNavProps) {
  const [expanded, setExpanded] = useState(false)
  const step = WIZARD_STEPS[currentStep]

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-800 border-t border-gray-700 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {WIZARD_STEPS.map((_, i) => (
                <StepDot key={i} completed={completedSteps.has(i)} active={i === currentStep} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-xs text-gray-400">
              {currentStep + 1}/{WIZARD_STEPS.length}
            </span>
            <span className="font-medium truncate max-w-[120px]">{step?.label}</span>
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setExpanded(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-800 rounded-t-2xl max-h-[70vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300">Setup Steps</h3>
                <button onClick={() => setExpanded(false)} className="p-1 text-gray-400 hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2">
                {WIZARD_STEPS.map((s, i) => {
                  const isActive = i === currentStep
                  const isCompleted = completedSteps.has(i)
                  const isAccessible = i <= currentStep || completedSteps.has(i) || i === currentStep + 1

                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (isAccessible) {
                          onStepClick(i)
                          setExpanded(false)
                        }
                      }}
                      disabled={!isAccessible}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                        isActive
                          ? "bg-[#DDB21D]/15 text-[#DDB21D] font-medium"
                          : isCompleted
                          ? "text-[#43b581]"
                          : isAccessible
                          ? "text-gray-400 active:bg-gray-700/50"
                          : "text-gray-600"
                      }`}
                    >
                      <StepDot completed={isCompleted} active={isActive} />
                      <span className="flex items-center gap-2">
                        {s.icon}
                        {s.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
