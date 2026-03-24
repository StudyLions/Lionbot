// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Pet tutorial wizard navigation -- pixel-art themed
//          sidebar (desktop) + bottom sheet (mobile), mirrors
//          WizardNav.tsx but with pet styling
// ============================================================
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import {
  Sparkles, Heart, Home, Package, Palette, Sprout,
  Swords, BookOpen, Store, Users, Shield, PartyPopper,
  ChevronUp, ChevronDown, X, Check,
} from "lucide-react"

export interface TutorialStep {
  id: string
  label: string
  icon: React.ReactNode
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: "welcome", label: "Welcome", icon: <Sparkles className="w-4 h-4" /> },
  { id: "care", label: "Pet Care", icon: <Heart className="w-4 h-4" /> },
  { id: "room", label: "Your Room", icon: <Home className="w-4 h-4" /> },
  { id: "inventory", label: "Equipment", icon: <Package className="w-4 h-4" /> },
  { id: "skins", label: "Skins", icon: <Palette className="w-4 h-4" /> },
  { id: "farm", label: "Farm", icon: <Sprout className="w-4 h-4" /> },
  { id: "enhancement", label: "Enhancement", icon: <Swords className="w-4 h-4" /> },
  { id: "wiki", label: "Item Wiki", icon: <BookOpen className="w-4 h-4" /> },
  { id: "marketplace", label: "Marketplace", icon: <Store className="w-4 h-4" /> },
  { id: "social", label: "Friends", icon: <Users className="w-4 h-4" /> },
  { id: "family", label: "Family", icon: <Shield className="w-4 h-4" /> },
  { id: "complete", label: "Ready!", icon: <PartyPopper className="w-4 h-4" /> },
]

interface PetTutorialNavProps {
  currentStep: number
  completedSteps: Set<number>
  onStepClick: (index: number) => void
}

function StepDot({ completed, active }: { completed: boolean; active: boolean }) {
  if (completed) {
    return (
      <div className="w-5 h-5 rounded flex items-center justify-center bg-emerald-500/20 border border-emerald-500/40">
        <Check className="w-3 h-3 text-emerald-400" />
      </div>
    )
  }
  return (
    <div
      className={`w-5 h-5 rounded flex items-center justify-center border transition-all duration-300 ${
        active
          ? "bg-[var(--pet-gold,#f0c040)]/20 border-[var(--pet-gold,#f0c040)]/60"
          : "bg-[var(--pet-card,#0f1628)] border-[var(--pet-border,#2a3a5c)]"
      }`}
    >
      {active && <div className="w-2 h-2 rounded-sm bg-[var(--pet-gold,#f0c040)]" />}
    </div>
  )
}

export function PetTutorialNavDesktop({ currentStep, completedSteps, onStepClick }: PetTutorialNavProps) {
  return (
    <nav className="hidden lg:flex flex-col w-60 bg-[var(--pet-card,#0f1628)]/50 border-r border-[var(--pet-border,#2a3a5c)] p-3 gap-0.5 overflow-y-auto">
      <div className="px-3 py-2 mb-2">
        <h3 className="font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] uppercase tracking-wider">Tutorial</h3>
        <div className="mt-2 h-2 bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--pet-gold,#f0c040)] to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] mt-1">
          {currentStep + 1} of {TUTORIAL_STEPS.length}
        </p>
      </div>

      {TUTORIAL_STEPS.map((step, i) => {
        const isActive = i === currentStep
        const isCompleted = completedSteps.has(i)

        return (
          <button
            key={step.id}
            onClick={() => onStepClick(i)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-all duration-200 ${
              isActive
                ? "bg-[var(--pet-gold,#f0c040)]/10 border border-[var(--pet-gold,#f0c040)]/30"
                : isCompleted
                ? "text-emerald-400 hover:bg-[var(--pet-card,#0f1628)]/80 border border-transparent"
                : "text-[var(--pet-text-dim,#8899aa)] hover:bg-[var(--pet-card,#0f1628)]/80 hover:text-[var(--pet-text,#e2e8f0)] border border-transparent"
            }`}
          >
            <StepDot completed={isCompleted} active={isActive} />
            <span className={`font-pixel text-[11px] flex items-center gap-1.5 ${
              isActive ? "text-[var(--pet-gold,#f0c040)]" : ""
            }`}>
              {step.icon}
              <span className="truncate">{step.label}</span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export function PetTutorialNavMobile({ currentStep, completedSteps, onStepClick }: PetTutorialNavProps) {
  const [expanded, setExpanded] = useState(false)
  const step = TUTORIAL_STEPS[currentStep]

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--pet-card,#0f1628)] border-t border-[var(--pet-border,#2a3a5c)] pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex gap-1">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-sm transition-all ${
                  i === currentStep
                    ? "bg-[var(--pet-gold,#f0c040)] scale-125"
                    : completedSteps.has(i)
                    ? "bg-emerald-400"
                    : "bg-[var(--pet-border,#2a3a5c)]"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
              {currentStep + 1}/{TUTORIAL_STEPS.length}
            </span>
            <span className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] truncate max-w-[120px]">
              {step?.label}
            </span>
            {expanded ? <ChevronDown className="w-4 h-4 text-[var(--pet-text-dim,#8899aa)]" /> : <ChevronUp className="w-4 h-4 text-[var(--pet-text-dim,#8899aa)]" />}
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
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--pet-card,#0f1628)] border-t border-[var(--pet-border,#2a3a5c)] rounded-t-2xl max-h-[70vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--pet-border,#2a3a5c)]">
                <h3 className="font-pixel text-[12px] text-[var(--pet-gold,#f0c040)]">Tutorial Steps</h3>
                <button onClick={() => setExpanded(false)} className="p-1 text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2">
                {TUTORIAL_STEPS.map((s, i) => {
                  const isActive = i === currentStep
                  const isCompleted = completedSteps.has(i)

                  return (
                    <button
                      key={s.id}
                      onClick={() => { onStepClick(i); setExpanded(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition-all font-pixel text-[12px] ${
                        isActive
                          ? "bg-[var(--pet-gold,#f0c040)]/10 text-[var(--pet-gold,#f0c040)]"
                          : isCompleted
                          ? "text-emerald-400"
                          : "text-[var(--pet-text-dim,#8899aa)] active:bg-[var(--pet-card,#0f1628)]/80"
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
