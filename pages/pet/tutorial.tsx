// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Pet tutorial wizard orchestrator -- full-screen
//          12-step educational walkthrough with localStorage
//          persistence, keyboard nav, and dismiss logic
// ============================================================
import { useRouter } from "next/router"
import { Component, useEffect, useState, useCallback } from "react"
import type { ReactNode, ErrorInfo } from "react"
import { AnimatePresence } from "framer-motion"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { NextSeo } from "next-seo"
import { RefreshCw } from "lucide-react"

import AdminGuard from "@/components/dashboard/AdminGuard"
import {
  PetTutorialNavDesktop,
  PetTutorialNavMobile,
  TUTORIAL_STEPS,
} from "@/components/pet/tutorial/PetTutorialNav"
import PetStepLayout from "@/components/pet/tutorial/PetStepLayout"
import { getPetLeoMessage } from "@/components/pet/tutorial/petLeoMessages"

import StepWelcome from "@/components/pet/tutorial/steps/StepWelcome"
import StepCare from "@/components/pet/tutorial/steps/StepCare"
import StepRoom from "@/components/pet/tutorial/steps/StepRoom"
import StepInventory from "@/components/pet/tutorial/steps/StepInventory"
import StepSkins from "@/components/pet/tutorial/steps/StepSkins"
import StepFarm from "@/components/pet/tutorial/steps/StepFarm"
import StepEnhancement from "@/components/pet/tutorial/steps/StepEnhancement"
import StepWiki from "@/components/pet/tutorial/steps/StepWiki"
import StepMarketplace from "@/components/pet/tutorial/steps/StepMarketplace"
import StepSocial from "@/components/pet/tutorial/steps/StepSocial"
import StepFamily from "@/components/pet/tutorial/steps/StepFamily"
import StepComplete from "@/components/pet/tutorial/steps/StepComplete"

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Error boundary to catch and gracefully display step rendering crashes
//          instead of crashing the entire tutorial page
interface StepErrorBoundaryProps { children: ReactNode; stepName: string; onSkip?: () => void }
interface StepErrorBoundaryState { hasError: boolean; error?: Error }
class StepErrorBoundary extends Component<StepErrorBoundaryProps, StepErrorBoundaryState> {
  constructor(props: StepErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Tutorial] Step "${this.props.stepName}" crashed:`, error, info.componentStack)
  }
  componentDidUpdate(prevProps: StepErrorBoundaryProps) {
    if (prevProps.stepName !== this.props.stepName) {
      this.setState({ hasError: false, error: undefined })
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="text-4xl mb-4">😵</div>
          <h3 className="font-pixel text-lg text-[var(--pet-text,#e2e8f0)] mb-2">
            Oops! This step had an issue
          </h3>
          <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] mb-4 max-w-sm">
            Something went wrong loading the &quot;{this.props.stepName}&quot; step.
            You can skip it and continue the tutorial.
          </p>
          {this.props.onSkip && (
            <button
              onClick={this.props.onSkip}
              className="flex items-center gap-2 px-5 py-2 font-pixel text-[12px] bg-[var(--pet-gold,#f0c040)] text-[var(--pet-bg,#0a0e1a)] rounded transition-colors hover:opacity-80"
            >
              <RefreshCw className="w-4 h-4" />
              Skip to Next Step
            </button>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
// --- END AI-MODIFIED ---

const TOTAL_STEPS = TUTORIAL_STEPS.length
const LS_STEP_KEY = "pet-tutorial-step"
const LS_COMPLETED_KEY = "pet-tutorial-completed"
const LS_DISMISSED_KEY = "pet-tutorial-dismissed"

type LeoPose = "waving" | "pointing" | "thumbsUp" | "starEyed" | "mindBlown" | "celebrating"

const STEP_POSES: LeoPose[] = [
  "waving",       // welcome
  "pointing",     // care
  "thumbsUp",     // room
  "starEyed",     // inventory
  "pointing",     // skins
  "thumbsUp",     // farm
  "mindBlown",    // enhancement
  "pointing",     // wiki
  "starEyed",     // marketplace
  "waving",       // social
  "thumbsUp",     // family
  "celebrating",  // complete
]

function PetTutorialInner() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  useEffect(() => {
    const saved = localStorage.getItem(LS_STEP_KEY)
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (parsed > 0 && parsed < TOTAL_STEPS) setStep(parsed)
    }
    const savedCompleted = localStorage.getItem(LS_COMPLETED_KEY)
    if (savedCompleted) {
      try { setCompletedSteps(new Set(JSON.parse(savedCompleted))) } catch {}
    }
  }, [])

  useEffect(() => {
    if (step > 0) localStorage.setItem(LS_STEP_KEY, String(step))
  }, [step])

  useEffect(() => {
    if (completedSteps.size > 0)
      localStorage.setItem(LS_COMPLETED_KEY, JSON.stringify(Array.from(completedSteps)))
  }, [completedSteps])

  const goTo = useCallback((target: number) => {
    setDirection(target > step ? 1 : -1)
    setStep(target)
  }, [step])

  const markCompleteAndNext = useCallback(() => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      next.add(step)
      return next
    })
    if (step < TOTAL_STEPS - 1) goTo(step + 1)
  }, [step, goTo])

  const skipAndNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) goTo(step + 1)
  }, [step, goTo])

  const dismissTutorial = useCallback(() => {
    localStorage.setItem(LS_DISMISSED_KEY, "true")
    localStorage.removeItem(LS_STEP_KEY)
    localStorage.removeItem(LS_COMPLETED_KEY)
    router.push("/pet")
  }, [router])

  const handleSkipAll = useCallback(() => {
    if (window.confirm("Skip the tutorial? You can retake it anytime from the pet menu.")) {
      dismissTutorial()
    }
  }, [dismissTutorial])

  const handleFinish = useCallback(() => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      next.add(step)
      return next
    })
    dismissTutorial()
  }, [step, dismissTutorial])

  const handleRetake = useCallback(() => {
    setCompletedSteps(new Set())
    setStep(0)
    setDirection(-1)
    localStorage.removeItem(LS_STEP_KEY)
    localStorage.removeItem(LS_COMPLETED_KEY)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return
      if (e.key === "ArrowRight" && step < TOTAL_STEPS - 1) {
        e.preventDefault()
        markCompleteAndNext()
      } else if (e.key === "ArrowLeft" && step > 0) {
        e.preventDefault()
        goTo(step - 1)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [step, markCompleteAndNext, goTo])

  const stepId = TUTORIAL_STEPS[step]?.id || "welcome"
  const pose = STEP_POSES[step] || "pointing"

  const renderStep = () => {
    const stepName = TUTORIAL_STEPS[step]?.label || "Unknown"

    switch (step) {
      case 0:
        return (
          <StepErrorBoundary key="eb-welcome" stepName={stepName} onSkip={() => goTo(1)}>
            <StepWelcome
              key="welcome"
              onNext={() => goTo(1)}
              onSkipAll={handleSkipAll}
            />
          </StepErrorBoundary>
        )
      case 11:
        return (
          <StepErrorBoundary key="eb-complete" stepName={stepName}>
            <StepComplete
              key="complete"
              onFinish={handleFinish}
              onRetake={handleRetake}
            />
          </StepErrorBoundary>
        )
      default: {
        const stepContent: Record<number, { title: string; subtitle?: string; children: React.ReactNode }> = {
          1: { title: "Taking Care of Your Pet", subtitle: "Keep your pet happy to earn more gold", children: <StepCare /> },
          2: { title: "Your Room", subtitle: "Decorate your pet's home", children: <StepRoom /> },
          3: { title: "Inventory & Equipment", subtitle: "Gear up your pet with items", children: <StepInventory /> },
          4: { title: "Gameboy Skins", subtitle: "Customize your room's frame", children: <StepSkins /> },
          5: { title: "Your Farm", subtitle: "Grow crops for gold", children: <StepFarm /> },
          6: { title: "Enhancement", subtitle: "Upgrade your equipment", children: <StepEnhancement /> },
          7: { title: "Item Wiki", subtitle: "Your item encyclopedia", children: <StepWiki /> },
          8: { title: "Marketplace", subtitle: "Buy and sell with other players", children: <StepMarketplace /> },
          9: { title: "Friends & Social", subtitle: "Connect with other players", children: <StepSocial /> },
          10: { title: "Families", subtitle: "Team up for shared rewards", children: <StepFamily /> },
        }

        const s = stepContent[step]
        if (!s) return null

        return (
          <StepErrorBoundary key={`eb-${stepId}`} stepName={stepName} onSkip={skipAndNext}>
            <PetStepLayout
              key={stepId}
              title={s.title}
              subtitle={s.subtitle}
              leoPose={pose}
              leoMessage={getPetLeoMessage(stepId, "intro")}
              leoHintMessage={getPetLeoMessage(stepId, "hint")}
              onBack={step > 0 ? () => goTo(step - 1) : undefined}
              onNext={markCompleteAndNext}
              onSkip={skipAndNext}
              showBack={step > 0}
              showSkip
              direction={direction}
            >
              {s.children}
            </PetStepLayout>
          </StepErrorBoundary>
        )
      }
    }
  }

  return (
    <div className="pet-section pet-scanline flex h-screen overflow-hidden">
      <PetTutorialNavDesktop
        currentStep={step}
        completedSteps={completedSteps}
        onStepClick={goTo}
      />
      <div className="flex-1 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {renderStep()}
        </AnimatePresence>
      </div>
      <PetTutorialNavMobile
        currentStep={step}
        completedSteps={completedSteps}
        onStepClick={goTo}
      />
    </div>
  )
}

export default function PetTutorialPage() {
  return (
    <AdminGuard variant="pet">
      <NextSeo title="LionGotchi Tutorial" noindex />
      <PetTutorialInner />
    </AdminGuard>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
