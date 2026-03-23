// ============================================================
// AI-GENERATED FILE (rewritten)
// Created: 2026-03-13 | Rewritten: 2026-03-23
// Purpose: 12-step interactive setup wizard orchestrator with
//          Leo mascot, config persistence, localStorage resume,
//          and DB-backed dismiss tracking
// ============================================================
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { NextSeo } from "next-seo"

import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import { useDashboard } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import { WizardNavDesktop, WizardNavMobile, WIZARD_STEPS } from "@/components/setup/WizardNav"

import StepWelcome from "@/components/setup/steps/StepWelcome"
import StepBasics from "@/components/setup/steps/StepBasics"
import StepEconomy from "@/components/setup/steps/StepEconomy"
import StepRanks from "@/components/setup/steps/StepRanks"
import StepTasks from "@/components/setup/steps/StepTasks"
import StepPomodoro from "@/components/setup/steps/StepPomodoro"
import StepSchedule from "@/components/setup/steps/StepSchedule"
import StepCommunity from "@/components/setup/steps/StepCommunity"
import StepLionGotchi from "@/components/setup/steps/StepLionGotchi"
import StepPremium from "@/components/setup/steps/StepPremium"
import StepCommands from "@/components/setup/steps/StepCommands"
import StepCelebration from "@/components/setup/steps/StepCelebration"

const TOTAL_STEPS = WIZARD_STEPS.length

function SetupWizardInner() {
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [config, setConfig] = useState<Record<string, any> | null>(null)
  const [lgConfig, setLgConfig] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const { data: configData, mutate } = useDashboard<Record<string, any>>(
    id ? `/api/dashboard/servers/${id}/config` : null
  )
  const { data: lgData, mutate: lgMutate } = useDashboard<Record<string, any>>(
    id ? `/api/dashboard/servers/${id}/liongotchi-config` : null
  )

  useEffect(() => {
    if (configData) setConfig(configData)
  }, [configData])

  useEffect(() => {
    if (lgData) setLgConfig(lgData)
  }, [lgData])

  // Resume from localStorage
  useEffect(() => {
    if (!guildId) return
    const saved = localStorage.getItem(`wizard-step-${guildId}`)
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (parsed > 0 && parsed < TOTAL_STEPS) setStep(parsed)
    }
    const savedCompleted = localStorage.getItem(`wizard-completed-${guildId}`)
    if (savedCompleted) {
      try {
        setCompletedSteps(new Set(JSON.parse(savedCompleted)))
      } catch { /* ignore */ }
    }
  }, [guildId])

  // Persist step to localStorage
  useEffect(() => {
    if (guildId && step > 0) {
      localStorage.setItem(`wizard-step-${guildId}`, String(step))
    }
  }, [step, guildId])

  // Persist completed steps
  useEffect(() => {
    if (guildId && completedSteps.size > 0) {
      localStorage.setItem(`wizard-completed-${guildId}`, JSON.stringify(Array.from(completedSteps)))
    }
  }, [completedSteps, guildId])

  const serverName = config?.name || "Your Server"

  const set = useCallback((key: string, value: any) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
  }, [])

  const setLg = useCallback((key: string, value: any) => {
    setLgConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const saveConfigFields = async (fields?: string[]): Promise<boolean> => {
    if (!id || !config) return true
    const updates: Record<string, any> = {}
    const allFields = fields || Object.keys(config)
    for (const f of allFields) {
      if (f in config && f !== "name" && f !== "guildid") {
        updates[f] = config[f]
      }
    }
    if (Object.keys(updates).length === 0) return true
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error()
      mutate()
      return true
    } catch {
      toast.error("Failed to save settings. Check your admin permissions.")
      return false
    } finally {
      setSaving(false)
    }
  }

  const saveLgFields = async (): Promise<boolean> => {
    if (!id) return true
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/liongotchi-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lgConfig),
      })
      if (!res.ok) throw new Error()
      lgMutate()
      return true
    } catch {
      toast.error("Failed to save LionGotchi settings.")
      return false
    } finally {
      setSaving(false)
    }
  }

  const dismissWizard = async () => {
    if (!id) return
    try {
      await fetch(`/api/dashboard/servers/${id}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setup_wizard_dismissed_at: new Date().toISOString() }),
      })
      mutate()
      localStorage.removeItem(`wizard-step-${guildId}`)
      localStorage.removeItem(`wizard-completed-${guildId}`)
    } catch { /* ignore */ }
  }

  const goTo = (target: number) => {
    setDirection(target > step ? 1 : -1)
    setStep(target)
  }

  const markCompleteAndNext = async (saveFields?: string[]) => {
    const ok = saveFields ? await saveConfigFields(saveFields) : true
    if (!ok) return
    setCompletedSteps((prev) => { const next = new Set(Array.from(prev)); next.add(step); return next })
    goTo(Math.min(step + 1, TOTAL_STEPS - 1))
  }

  const skipAndNext = () => {
    goTo(Math.min(step + 1, TOTAL_STEPS - 1))
  }

  const goBack = () => {
    goTo(Math.max(step - 1, 0))
  }

  const handleSkipWizard = async () => {
    if (confirm("Skip the setup wizard? You can always access it from your server's navigation menu.")) {
      await dismissWizard()
      router.push(`/dashboard/servers/${guildId}`)
    }
  }

  const handleFinish = async () => {
    await dismissWizard()
    router.push(`/dashboard/servers/${guildId}`)
  }

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Reorder steps -- show "wow" features first, push admin plumbing later
  // New order: Welcome, Ranks, LionGotchi, Economy, Tasks, Pomodoro, Schedule, Basics, Community, Premium, Commands, Celebration
  const STEP_FIELDS: Record<number, string[]> = {
    1: ["rank_type", "dm_ranks", "xp_per_period", "xp_per_centiword", "rank_channel", "season_start"],
    3: ["study_hourly_reward", "study_hourly_live_bonus", "daily_study_cap", "starting_funds", "allow_transfers", "coins_per_centixp"],
    4: ["max_tasks", "task_reward", "task_reward_limit", "min_workout_length", "workout_reward"],
    5: ["pomodoro_channel"],
    6: ["accountability_price", "accountability_reward", "accountability_bonus", "accountability_category", "accountability_lobby"],
    7: ["timezone", "locale", "force_locale", "greeting_message", "returning_message", "greeting_channel", "admin_role", "mod_role", "event_log_channel", "mod_log_channel", "alert_channel"],
    8: ["renting_price", "renting_cap", "renting_visible", "renting_category", "renting_sync_perms", "renting_max_per_user", "renting_name_limit", "renting_min_deposit", "renting_auto_extend", "renting_cooldown", "video_studyban", "video_grace_period", "persist_roles"],
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <StepWelcome
            key="step-0"
            serverName={serverName}
            onNext={() => goTo(1)}
            onSkipWizard={handleSkipWizard}
          />
        )
      case 1:
        return (
          <StepRanks
            key="step-1"
            config={config!}
            serverName={serverName}
            guildId={guildId}
            onUpdate={set}
            onNext={() => markCompleteAndNext(STEP_FIELDS[1])}
            onBack={goBack}
            onSkip={skipAndNext}
            saving={saving}
            direction={direction}
          />
        )
      case 2:
        return (
          <StepLionGotchi
            key="step-2"
            lgConfig={lgConfig}
            serverName={serverName}
            guildId={guildId}
            onLgUpdate={setLg}
            onNext={async () => {
              const ok = await saveLgFields()
              if (ok) {
                setCompletedSteps((prev) => { const n = new Set(Array.from(prev)); n.add(step); return n })
                goTo(3)
              }
            }}
            onBack={goBack}
            onSkip={skipAndNext}
            saving={saving}
            direction={direction}
          />
        )
      case 3:
        return (
          <StepEconomy
            key="step-3"
            config={config!}
            serverName={serverName}
            guildId={guildId}
            onUpdate={set}
            onNext={() => markCompleteAndNext(STEP_FIELDS[3])}
            onBack={goBack}
            onSkip={skipAndNext}
            saving={saving}
            direction={direction}
          />
        )
      case 4:
        return (
          <StepTasks
            key="step-4"
            config={config!}
            serverName={serverName}
            onUpdate={set}
            onNext={() => markCompleteAndNext(STEP_FIELDS[4])}
            onBack={goBack}
            onSkip={skipAndNext}
            saving={saving}
            direction={direction}
          />
        )
      case 5:
        return (
          <StepPomodoro
            key="step-5"
            config={config!}
            serverName={serverName}
            guildId={guildId}
            onUpdate={set}
            onNext={() => markCompleteAndNext(STEP_FIELDS[5])}
            onBack={goBack}
            onSkip={skipAndNext}
            saving={saving}
            direction={direction}
          />
        )
      case 6:
        return (
          <StepSchedule
            key="step-6"
            config={config!}
            serverName={serverName}
            guildId={guildId}
            onUpdate={set}
            onNext={() => markCompleteAndNext(STEP_FIELDS[6])}
            onBack={goBack}
            onSkip={skipAndNext}
            saving={saving}
            direction={direction}
          />
        )
      case 7:
        return (
          <StepBasics
            key="step-7"
            config={config!}
            serverName={serverName}
            guildId={guildId}
            onUpdate={set}
            onNext={() => markCompleteAndNext(STEP_FIELDS[7])}
            onBack={goBack}
            onSkip={skipAndNext}
            saving={saving}
            direction={direction}
          />
        )
      case 8:
        return (
          <StepCommunity
            key="step-8"
            config={config!}
            serverName={serverName}
            guildId={guildId}
            onUpdate={set}
            onNext={() => markCompleteAndNext(STEP_FIELDS[8])}
            onBack={goBack}
            onSkip={skipAndNext}
            saving={saving}
            direction={direction}
          />
        )
      case 9:
        return (
          <StepPremium
            key="step-9"
            serverName={serverName}
            onNext={() => {
              setCompletedSteps((prev) => { const n = new Set(Array.from(prev)); n.add(step); return n })
              goTo(10)
            }}
            onBack={goBack}
            direction={direction}
          />
        )
      case 10:
        return (
          <StepCommands
            key="step-10"
            serverName={serverName}
            onNext={() => {
              setCompletedSteps((prev) => { const n = new Set(Array.from(prev)); n.add(step); return n })
              goTo(11)
            }}
            onBack={goBack}
            direction={direction}
          />
        )
      case 11:
        return (
          <StepCelebration
            key="step-11"
            serverName={serverName}
            guildId={guildId}
            completedSteps={completedSteps}
            onFinish={handleFinish}
            direction={direction}
          />
        )
      default:
        return null
    }
  }
  // --- END AI-MODIFIED ---

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="space-y-4 w-64">
          <div className="h-4 bg-gray-800 rounded animate-pulse" />
          <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-800 rounded animate-pulse w-1/2" />
        </div>
      </div>
    )
  }

  return (
    <>
      <NextSeo title={`Setup Wizard — ${serverName}`} noindex />
      <div className="flex h-screen bg-gray-900 overflow-hidden">
        <WizardNavDesktop
          currentStep={step}
          completedSteps={completedSteps}
          onStepClick={goTo}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {renderStep()}
          </AnimatePresence>
        </div>

        <WizardNavMobile
          currentStep={step}
          completedSteps={completedSteps}
          onStepClick={goTo}
        />
      </div>
    </>
  )
}

export default function SetupPage() {
  return (
    <AdminGuard>
      <ServerGuard requiredLevel="admin">
        <SetupWizardInner />
      </ServerGuard>
    </AdminGuard>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
