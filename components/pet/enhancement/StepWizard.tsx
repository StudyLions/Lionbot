// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Mobile step wizard for enhancement flow.
//          Step 1: pick equipment, Step 2: pick scroll,
//          Step 3: preview + enhance. Only used below lg breakpoint.
// ============================================================

import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export type WizardStep = 1 | 2 | 3

interface StepWizardProps {
  currentStep: WizardStep
  onStepChange: (step: WizardStep) => void
  hasEquipment: boolean
  hasScroll: boolean
  children: React.ReactNode
}

const STEPS = [
  { num: 1 as const, label: 'Equipment' },
  { num: 2 as const, label: 'Scroll' },
  { num: 3 as const, label: 'Enhance' },
]

export default function StepWizard({
  currentStep, onStepChange, hasEquipment, hasScroll, children,
}: StepWizardProps) {
  const canGoTo = (step: WizardStep): boolean => {
    if (step === 1) return true
    if (step === 2) return hasEquipment
    if (step === 3) return hasEquipment && hasScroll
    return false
  }

  return (
    <div className="lg:hidden">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-4 px-4">
        {STEPS.map((step, i) => {
          const isActive = currentStep === step.num
          const isCompleted = (step.num === 1 && hasEquipment) || (step.num === 2 && hasScroll)
          const isAccessible = canGoTo(step.num)

          return (
            <div key={step.num} className="flex items-center">
              {i > 0 && (
                <div
                  className="w-8 h-[2px]"
                  style={{
                    background: isCompleted || (step.num <= currentStep)
                      ? 'var(--pet-gold, #f0c040)'
                      : '#1a2a3c',
                  }}
                />
              )}
              <button
                onClick={() => isAccessible && onStepChange(step.num)}
                disabled={!isAccessible}
                className={cn(
                  'flex flex-col items-center gap-0.5 transition-all',
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 border-2 flex items-center justify-center font-pixel text-[11px] transition-all',
                    isActive
                      ? 'border-[var(--pet-gold)] bg-[var(--pet-gold)]/15 text-[var(--pet-gold)]'
                      : isCompleted
                      ? 'border-[var(--pet-green)] bg-[var(--pet-green)]/10 text-[var(--pet-green)]'
                      : 'border-[#3a4a6c] bg-[#0a0e1a] text-[var(--pet-text-dim)]'
                  )}
                >
                  {isCompleted && !isActive ? '\u2713' : step.num}
                </div>
                <span className={cn(
                  'font-pixel text-[9px]',
                  isActive ? 'text-[var(--pet-gold)]' : 'text-[var(--pet-text-dim)]'
                )}>
                  {step.label}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
