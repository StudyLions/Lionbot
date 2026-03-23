// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Consistent wrapper for each setup wizard step --
//          handles title, Leo mascot, content area, and
//          back/next/skip navigation buttons
// ============================================================
import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, SkipForward, Loader2, Wrench } from "lucide-react"
import LeoMascot from "./LeoMascot"

type LeoPose = "waving" | "pointing" | "thumbsUp" | "starEyed" | "mindBlown" | "celebrating"

interface StepLayoutProps {
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
  saving?: boolean
  showBack?: boolean
  showSkip?: boolean
  direction?: number
  hasExistingConfig?: boolean
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 300 : -300,
    opacity: 0,
  }),
}

export default function StepLayout({
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
  saving = false,
  showBack = true,
  showSkip = true,
  direction = 1,
  hasExistingConfig = false,
}: StepLayoutProps) {
  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Scroll the content container to top when a new step mounts
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [])
  // --- END AI-MODIFIED ---

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col h-full"
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-400">{subtitle}</p>
            )}
          </div>

          {hasExistingConfig && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#DDB21D]/10 border border-[#DDB21D]/20 rounded-lg">
              <Wrench className="w-4 h-4 text-[#DDB21D] flex-shrink-0" />
              <p className="text-xs text-gray-300">
                These settings were already configured. Review or adjust below.
              </p>
            </div>
          )}

          <LeoMascot pose={leoPose} message={leoMessage} hintMessage={leoHintMessage} compact />

          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-gray-700/50 px-4 py-3 sm:px-6 lg:px-8 bg-gray-900/80 backdrop-blur-sm mb-14 lg:mb-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            {showBack && onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800"
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
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors rounded-lg"
              >
                Skip
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-[#DDB21D] hover:bg-[#C4961A] text-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {nextLabel}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
