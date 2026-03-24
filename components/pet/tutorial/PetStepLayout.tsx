// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Pet tutorial step wrapper -- pet-themed version of
//          StepLayout.tsx with PixelCard styling, font-pixel,
//          Leo mascot, and back/next/skip navigation
// ============================================================
import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react"
import LeoMascot from "@/components/setup/LeoMascot"

type LeoPose = "waving" | "pointing" | "thumbsUp" | "starEyed" | "mindBlown" | "celebrating"

interface PetStepLayoutProps {
  title: string
  subtitle?: string
  leoPose: LeoPose
  leoMessage: string
  leoHintMessage?: string
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  onSkip?: () => void
  nextLabel?: string
  showBack?: boolean
  showSkip?: boolean
  direction?: number
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
}

export default function PetStepLayout({
  title,
  subtitle,
  leoPose,
  leoMessage,
  leoHintMessage,
  children,
  onBack,
  onNext,
  onSkip,
  nextLabel = "Next",
  showBack = true,
  showSkip = true,
  direction = 1,
}: PetStepLayoutProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [])

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col h-full min-h-0"
    >
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-pixel text-xl sm:text-2xl text-[var(--pet-text,#e2e8f0)]">{title}</h2>
            {subtitle && (
              <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">{subtitle}</p>
            )}
          </div>

          <LeoMascot pose={leoPose} message={leoMessage} hintMessage={leoHintMessage} compact />

          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-[var(--pet-border,#2a3a5c)] px-4 py-3 sm:px-6 lg:px-8 bg-[var(--pet-bg,#0a0e1a)]/80 backdrop-blur-sm mb-14 lg:mb-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            {showBack && onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-4 py-2 font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)] transition-colors rounded hover:bg-[var(--pet-card,#0f1628)]"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {showSkip && onSkip && (
              <button
                onClick={onSkip}
                className="flex items-center gap-1.5 px-4 py-2 font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]/60 hover:text-[var(--pet-text-dim,#8899aa)] transition-colors rounded"
              >
                Skip
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="flex items-center gap-1.5 px-5 py-2.5 font-pixel text-[12px] bg-[var(--pet-gold,#f0c040)] hover:bg-[var(--pet-gold,#f0c040)]/80 text-[var(--pet-bg,#0a0e1a)] rounded transition-colors"
              >
                {nextLabel}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
