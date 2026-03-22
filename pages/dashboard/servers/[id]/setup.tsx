// ============================================================
// AI-GENERATED FILE (rewritten)
// Created: 2026-03-13 | Rewritten: 2026-03-22
// Purpose: "Leo's Welcome Tour" -- full-screen animated setup
//          wizard with Leo mascot, live Discord previews, and
//          confetti celebration
// ============================================================
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wand2, Globe, BookOpen, Trophy, Coins, ChevronLeft, ChevronRight,
  Check, ShoppingBag, ListChecks, Video, Sparkles,
  Gamepad2, Users, Briefcase, ArrowRight, X,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import confetti from "canvas-confetti"

import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import { useDashboard } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import LeoMascot from "@/components/setup/LeoMascot"
import {
  GreetingPreview,
  RewardPreview,
  RankUpPreview,
  FeatureMiniCard,
  FEATURE_CARDS,
} from "@/components/setup/DiscordPreview"
import { NextSeo } from "next-seo"

// ── Constants ─────────────────────────────────────────────────

const TOTAL_SCENES = 6

const TIMEZONE_OPTIONS = [
  "US/Eastern", "US/Central", "US/Mountain", "US/Pacific",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Istanbul",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
  "Australia/Sydney", "Pacific/Auckland", "America/Sao_Paulo",
  "America/Mexico_City", "Africa/Cairo", "Asia/Jerusalem", "UTC",
]

const LOCALE_OPTIONS = [
  { value: "en_GB", label: "English" },
  { value: "pt_BR", label: "Português" },
  { value: "he_IL", label: "עברית" },
  { value: "tr", label: "Türkçe" },
]

const RANK_TYPES = [
  { value: "XP", label: "Combined XP", description: "Voice time + text activity combined. Best overall.", icon: <Sparkles size={20} /> },
  { value: "VOICE", label: "Voice Time", description: "Only voice study hours count. Ideal for study servers.", icon: <BookOpen size={20} /> },
  { value: "MESSAGE", label: "Messages", description: "Based on message count. Great for chatty communities.", icon: <Users size={20} /> },
]

const TEMPLATES: Record<string, {
  title: string; icon: React.ReactNode; description: string
  bullets: string[]; config: Record<string, any>
}> = {
  study: {
    title: "Study Community",
    icon: <BookOpen size={28} />,
    description: "Optimized for study groups and academic communities",
    bullets: ["Higher voice rewards (150/hr)", "Voice-based ranks", "Camera bonus enabled"],
    config: { study_hourly_reward: 150, study_hourly_live_bonus: 50, daily_study_cap: null, rank_type: "VOICE", dm_ranks: true, xp_per_period: 5, starting_funds: 0, allow_transfers: true, coins_per_centixp: 50 },
  },
  gaming: {
    title: "Gaming Server",
    icon: <Gamepad2 size={28} />,
    description: "Economy-focused with shop and message progression",
    bullets: ["Message-based ranks", "Members start with 100 coins", "Shop emphasis"],
    config: { study_hourly_reward: 50, study_hourly_live_bonus: 10, daily_study_cap: null, rank_type: "MESSAGE", dm_ranks: true, xp_per_period: 3, starting_funds: 100, allow_transfers: true, coins_per_centixp: 100 },
  },
  general: {
    title: "General / Social",
    icon: <Users size={28} />,
    description: "Balanced defaults for any type of community",
    bullets: ["Combined XP ranking", "Moderate rewards (100/hr)", "Easy to customize later"],
    config: { study_hourly_reward: 100, study_hourly_live_bonus: 25, daily_study_cap: null, rank_type: "XP", dm_ranks: true, xp_per_period: 5, starting_funds: 0, allow_transfers: true, coins_per_centixp: 50 },
  },
  work: {
    title: "Work / Professional",
    icon: <Briefcase size={28} />,
    description: "Task management and accountability for teams",
    bullets: ["Task & schedule focus", "Minimal economy", "Transfers disabled"],
    config: { study_hourly_reward: 75, study_hourly_live_bonus: 20, daily_study_cap: null, rank_type: "XP", dm_ranks: false, xp_per_period: 5, starting_funds: 0, allow_transfers: false, coins_per_centixp: 25 },
  },
}

const DEFAULTS: Record<string, any> = {
  timezone: "UTC", locale: "en_GB", greeting_message: null,
  study_hourly_reward: 100, study_hourly_live_bonus: 25, daily_study_cap: null,
  rank_type: "XP", dm_ranks: true, xp_per_period: 5,
  starting_funds: 0, allow_transfers: true, coins_per_centixp: 50,
}

const LEO_MESSAGES: Record<number, string> = {
  0: "Hey there! I just joined your server and I'm SO excited! Let me show you everything I can do — it only takes 2 minutes!",
  1: "Pick the one that matches your vibe! I'll set everything up with the best defaults for you.",
  2: "I auto-detected your timezone! Tweak these numbers to control how your members earn coins.",
  3: "Nothing motivates people like seeing themselves level up! Choose how your rank system works.",
  4: "I have WAY more features! You can configure all of these from your dashboard anytime.",
  5: "Your server is ready to go! Your members can start earning rewards right now!",
}

type LeoPose = "waving" | "pointing" | "thumbsUp" | "starEyed" | "mindBlown" | "celebrating"
const LEO_POSES: Record<number, LeoPose> = {
  0: "waving", 1: "pointing", 2: "thumbsUp", 3: "starEyed", 4: "mindBlown", 5: "celebrating",
}

// ── Scene transition variants ──────────────────────────────

const sceneVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

// ── Main Component ─────────────────────────────────────────

function SetupWizardInner() {
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  const [scene, setScene] = useState(0)
  const [direction, setDirection] = useState(1)
  const [config, setConfig] = useState<Record<string, any> | null>(null)
  const [saving, setSaving] = useState(false)
  const [detectedTz, setDetectedTz] = useState("UTC")
  const [tzConfirmed, setTzConfirmed] = useState(false)
  const [showTzPicker, setShowTzPicker] = useState(false)
  const [celebrationDone, setCelebrationDone] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  const { data: configData, isLoading, mutate } = useDashboard<Record<string, any>>(
    id ? `/api/dashboard/servers/${id}/config` : null
  )

  useEffect(() => {
    if (configData) setConfig(configData)
  }, [configData])

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz) setDetectedTz(tz)
    } catch { /* keep UTC */ }
  }, [])

  const set = useCallback((key: string, value: any) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
  }, [])

  const saveFields = async (updates: Record<string, any>) => {
    if (!id || Object.keys(updates).length === 0) return true
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
      toast.error("Failed to save. Check your admin permissions.")
      return false
    } finally {
      setSaving(false)
    }
  }

  const goTo = (target: number) => {
    setDirection(target > scene ? 1 : -1)
    setScene(target)
  }

  const handleNext = async () => {
    if (!config) return

    if (scene === 2) {
      const ok = await saveFields({
        timezone: config.timezone || detectedTz,
        locale: config.locale || "en_GB",
        greeting_message: config.greeting_message ?? null,
        study_hourly_reward: config.study_hourly_reward ?? DEFAULTS.study_hourly_reward,
        study_hourly_live_bonus: config.study_hourly_live_bonus ?? DEFAULTS.study_hourly_live_bonus,
        daily_study_cap: config.daily_study_cap ?? null,
      })
      if (!ok) return
      toast.success("Settings saved!")
    }

    if (scene === 3) {
      const ok = await saveFields({
        rank_type: config.rank_type || "XP",
        dm_ranks: config.dm_ranks ?? true,
        xp_per_period: config.xp_per_period ?? 5,
      })
      if (!ok) return
      toast.success("Rank settings saved!")
    }

    if (scene < TOTAL_SCENES - 1) goTo(scene + 1)
  }

  const handleBack = () => {
    if (scene > 0) goTo(scene - 1)
  }

  const handleTemplate = async (templateId: string) => {
    const template = TEMPLATES[templateId]
    if (!template || !id) return
    const updates = { ...template.config, timezone: detectedTz, locale: "en_GB" }
    setConfig((prev) => (prev ? { ...prev, ...updates } : prev))
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error()
      mutate()
      toast.success(`${template.title} template applied!`)
      goTo(TOTAL_SCENES - 1)
    } catch {
      toast.error("Failed to apply template.")
    } finally {
      setSaving(false)
    }
  }

  const handleQuickSetup = () => handleTemplate("general")

  useEffect(() => {
    if (scene === TOTAL_SCENES - 1 && !celebrationDone) {
      setCelebrationDone(true)
      const end = Date.now() + 2500
      const colors = ["#DDB21D", "#f57c00", "#5865F2", "#43b581"]
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60 + Math.random() * 60,
          spread: 60,
          origin: { x: Math.random(), y: Math.random() * 0.4 },
          colors,
          disableForReducedMotion: true,
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [scene, celebrationDone])

  const serverName = config?.name || "Your Server"
  const progress = ((scene + 1) / TOTAL_SCENES) * 100

  if (isLoading || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            className="w-20 h-20 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={48} className="text-primary mx-auto" />
          </motion.div>
          <p className="text-muted-foreground">Loading your server...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <NextSeo title={`Setup - ${serverName} - LionBot`} description="Set up LionBot for your server" />

      <div className="min-h-screen bg-background flex flex-col">
        {/* ── Top bar ── */}
        <div className="flex-shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wand2 size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Setting up</p>
                <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">{serverName}</p>
              </div>
            </div>
            <Link href={`/dashboard/servers/${guildId}`}>
              <a className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <X size={14} />
                <span className="hidden sm:inline">Skip to dashboard</span>
              </a>
            </Link>
          </div>
          {/* Progress bar */}
          <div className="h-[3px] bg-muted/30">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-r-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 lg:py-10 flex flex-col lg:flex-row gap-6 lg:gap-10">
            {/* Leo column */}
            <div className="lg:w-56 flex-shrink-0 flex lg:flex-col items-center lg:items-start lg:sticky lg:top-24 lg:self-start">
              <LeoMascot
                pose={LEO_POSES[scene]}
                message={LEO_MESSAGES[scene].replace("[Server Name]", serverName).replace("your server", serverName)}
                compact={false}
              />
            </div>

            {/* Scene content */}
            <div className="flex-1 min-w-0 relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={scene}
                  custom={direction}
                  variants={sceneVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full"
                >
                  {/* ── Scene 0: Welcome ── */}
                  {scene === 0 && (
                    <div className="text-center lg:text-left space-y-8 py-4">
                      <div>
                        <motion.h1
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-3xl lg:text-4xl font-bold text-foreground"
                        >
                          Let&apos;s set up{" "}
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                            {serverName}
                          </span>
                        </motion.h1>
                        <motion.p
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="mt-3 text-muted-foreground"
                        >
                          Configure LionBot for your server in under 2 minutes, or apply a template with one click.
                        </motion.p>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                      >
                        <button
                          onClick={handleQuickSetup}
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg hover:from-amber-400 hover:to-orange-400 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-amber-500/20"
                        >
                          <Wand2 size={20} />
                          Quick Setup
                        </button>
                        <button
                          onClick={() => goTo(1)}
                          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border text-foreground font-medium hover:bg-card transition-all"
                        >
                          Let&apos;s customize!
                          <ArrowRight size={18} />
                        </button>
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xs text-muted-foreground/60"
                      >
                        Quick Setup applies balanced defaults. You can always change everything later.
                      </motion.p>
                    </div>
                  )}

                  {/* ── Scene 1: Template selection ── */}
                  {scene === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">What kind of community is this?</h2>
                        <p className="text-sm text-muted-foreground mt-1">Choose a template for the best defaults, or skip to customize manually.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(TEMPLATES).map(([key, t], i) => (
                          <motion.button
                            key={key}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            onClick={() => handleTemplate(key)}
                            disabled={saving}
                            className="flex flex-col items-start gap-3 p-5 rounded-xl bg-card border border-border hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all text-left group disabled:opacity-50"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <span className="text-primary/70 group-hover:text-amber-400 transition-colors flex-shrink-0">
                                {t.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-foreground">{t.title}</div>
                                <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                              </div>
                            </div>
                            <ul className="space-y-1 w-full">
                              {t.bullets.map((b, bi) => (
                                <li key={bi} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <Check size={12} className="text-amber-500/60 flex-shrink-0 mt-0.5" />
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Or click <strong>Next</strong> below to customize everything yourself.
                      </p>
                    </div>
                  )}

                  {/* ── Scene 2: Basics + Rewards ── */}
                  {scene === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Basics &amp; Study Rewards</h2>
                        <p className="text-sm text-muted-foreground mt-1">Set your timezone and configure how members earn coins.</p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Settings column */}
                        <div className="space-y-5">
                          {/* Timezone */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Timezone</label>
                            {!showTzPicker ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground">
                                  <Globe size={14} className="text-muted-foreground" />
                                  {config.timezone || detectedTz}
                                  {!tzConfirmed && <span className="text-[10px] text-amber-400 font-medium">auto-detected</span>}
                                </span>
                                <button
                                  onClick={() => setShowTzPicker(true)}
                                  className="text-xs text-primary hover:underline"
                                >
                                  Change
                                </button>
                                {!tzConfirmed && (
                                  <button
                                    onClick={() => { set("timezone", detectedTz); setTzConfirmed(true) }}
                                    className="text-xs text-amber-400 hover:underline"
                                  >
                                    Confirm
                                  </button>
                                )}
                              </div>
                            ) : (
                              <select
                                value={config.timezone || detectedTz}
                                onChange={(e) => { set("timezone", e.target.value); setShowTzPicker(false); setTzConfirmed(true) }}
                                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                              >
                                {TIMEZONE_OPTIONS.map((tz) => (
                                  <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* Language */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Language</label>
                            <div className="grid grid-cols-2 gap-2">
                              {LOCALE_OPTIONS.map((loc) => (
                                <button
                                  key={loc.value}
                                  onClick={() => set("locale", loc.value)}
                                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                    (config.locale || "en_GB") === loc.value
                                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                                      : "border-border bg-card text-foreground hover:border-border"
                                  }`}
                                >
                                  {loc.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Hourly reward */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-foreground">Hourly Reward</label>
                              <span className="text-sm font-bold text-amber-400">
                                {config.study_hourly_reward ?? 100} coins/hr
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={500}
                              step={10}
                              value={config.study_hourly_reward ?? 100}
                              onChange={(e) => set("study_hourly_reward", Number(e.target.value))}
                              className="w-full accent-amber-500 h-2 rounded-lg cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground">Coins earned per hour in voice channels</p>
                          </div>

                          {/* Camera bonus */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-foreground">Camera Bonus</label>
                              <span className="text-sm font-bold text-emerald-400">
                                +{config.study_hourly_live_bonus ?? 25} coins/hr
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={200}
                              step={5}
                              value={config.study_hourly_live_bonus ?? 25}
                              onChange={(e) => set("study_hourly_live_bonus", Number(e.target.value))}
                              className="w-full accent-emerald-500 h-2 rounded-lg cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground">Extra coins for studying with camera on</p>
                          </div>

                          {/* Welcome message */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Welcome Message <span className="text-muted-foreground font-normal">(optional)</span></label>
                            <textarea
                              value={config.greeting_message || ""}
                              onChange={(e) => set("greeting_message", e.target.value || null)}
                              placeholder="Welcome to {server_name}, {mention}!"
                              maxLength={2000}
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                            />
                          </div>

                          <p className="text-xs text-muted-foreground/60 italic">You can always change these later from Settings.</p>
                        </div>

                        {/* Preview column */}
                        <div className="space-y-4">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</p>
                          <RewardPreview
                            hourlyReward={config.study_hourly_reward ?? 100}
                            cameraBonus={config.study_hourly_live_bonus ?? 25}
                            dailyCap={config.daily_study_cap ?? null}
                          />
                          {config.greeting_message && (
                            <GreetingPreview
                              message={config.greeting_message}
                              serverName={serverName}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Scene 3: Ranks ── */}
                  {scene === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Ranks &amp; Progression</h2>
                        <p className="text-sm text-muted-foreground mt-1">Give your members goals to chase. Choose how they rank up.</p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Settings */}
                        <div className="space-y-5">
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground">Rank Type</label>
                            <div className="space-y-2">
                              {RANK_TYPES.map((rt) => (
                                <button
                                  key={rt.value}
                                  onClick={() => set("rank_type", rt.value)}
                                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                                    (config.rank_type || "XP") === rt.value
                                      ? "border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/10"
                                      : "border-border bg-card hover:border-border"
                                  }`}
                                >
                                  <span className={`flex-shrink-0 ${(config.rank_type || "XP") === rt.value ? "text-amber-400" : "text-muted-foreground"}`}>
                                    {rt.icon}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-foreground">{rt.label}</div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{rt.description}</p>
                                  </div>
                                  {(config.rank_type || "XP") === rt.value && (
                                    <Check size={18} className="text-amber-400 flex-shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* DM toggle */}
                          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                            <div>
                              <p className="text-sm font-medium text-foreground">DM Rank Notifications</p>
                              <p className="text-xs text-muted-foreground mt-0.5">DM members when they reach a new rank</p>
                            </div>
                            <button
                              onClick={() => set("dm_ranks", !(config.dm_ranks ?? true))}
                              className={`relative w-11 h-6 rounded-full transition-colors ${
                                config.dm_ranks ?? true ? "bg-amber-500" : "bg-muted"
                              }`}
                            >
                              <motion.div
                                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                                animate={{ left: config.dm_ranks ?? true ? "calc(100% - 22px)" : "2px" }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            </button>
                          </div>

                          <p className="text-xs text-muted-foreground/60 italic">You can always change these later from Settings.</p>
                        </div>

                        {/* Preview */}
                        <div className="space-y-4">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</p>
                          <RankUpPreview
                            serverName={serverName}
                            rankType={config.rank_type || "XP"}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Scene 4: Feature Showcase ── */}
                  {scene === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Everything Else I Can Do</h2>
                        <p className="text-sm text-muted-foreground mt-1">These features are already active. Configure them anytime from your dashboard.</p>
                      </div>
                      <div className="relative">
                        <div
                          ref={carouselRef}
                          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none"
                          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                          {FEATURE_CARDS.map((f, i) => (
                            <FeatureMiniCard key={f.id} feature={f} index={i} />
                          ))}
                        </div>
                        {/* Scroll hint */}
                        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground/50">
                          <ChevronLeft size={12} />
                          <span>Scroll to explore</span>
                          <ChevronRight size={12} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Scene 5: Celebration ── */}
                  {scene === 5 && (
                    <div className="text-center space-y-8 py-4">
                      {/* Animated checkmark */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
                      >
                        <motion.div
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          <Check size={40} className="text-white" strokeWidth={3} />
                        </motion.div>
                      </motion.div>

                      <div>
                        <motion.h1
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-3xl lg:text-4xl font-bold"
                        >
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                            {serverName}
                          </span>{" "}
                          is ready!
                        </motion.h1>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="mt-2 text-muted-foreground"
                        >
                          Your members can start earning rewards right now.
                        </motion.p>
                      </div>

                      {/* Summary grid */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto"
                      >
                        {[
                          { label: "Timezone", value: config.timezone || detectedTz },
                          { label: "Language", value: LOCALE_OPTIONS.find((l) => l.value === config.locale)?.label || "English" },
                          { label: "Hourly Reward", value: `${config.study_hourly_reward ?? 100} coins` },
                          { label: "Rank Type", value: config.rank_type || "XP" },
                          { label: "Camera Bonus", value: `+${config.study_hourly_live_bonus ?? 25}` },
                          { label: "DM Ranks", value: (config.dm_ranks ?? true) ? "On" : "Off" },
                        ].map((item, i) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + i * 0.08 }}
                            className="p-3 rounded-xl bg-card border border-border text-center"
                          >
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Next steps */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="space-y-4"
                      >
                        <p className="text-sm font-medium text-foreground">What&apos;s next?</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto">
                          {[
                            { href: "ranks", icon: <Trophy size={18} />, label: "Set up Ranks" },
                            { href: "shop", icon: <ShoppingBag size={18} />, label: "Add Shop Items" },
                            { href: "rolemenus", icon: <ListChecks size={18} />, label: "Role Menus" },
                            { href: "videochannels", icon: <Video size={18} />, label: "Video Channels" },
                          ].map((link) => (
                            <Link key={link.href} href={`/dashboard/servers/${guildId}/${link.href}`}>
                              <a className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-amber-500/30 hover:bg-card transition-all text-center">
                                <span className="text-primary">{link.icon}</span>
                                <span className="text-xs text-foreground">{link.label}</span>
                              </a>
                            </Link>
                          ))}
                        </div>

                        <Link href={`/dashboard/servers/${guildId}`}>
                          <a className="inline-flex items-center justify-center gap-2 w-full max-w-md mx-auto py-4 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg hover:from-amber-400 hover:to-orange-400 transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20">
                            Go to Dashboard
                            <ArrowRight size={20} />
                          </a>
                        </Link>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Bottom nav bar ── */}
          {scene < TOTAL_SCENES - 1 && (
            <div className="flex-shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-sm sticky bottom-0 z-30 safe-area-bottom">
              <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={scene === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === scene ? "w-6 bg-amber-500" : i < scene ? "w-1.5 bg-amber-500/50" : "w-1.5 bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Next"}
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function SetupWizard() {
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
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
