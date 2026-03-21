// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Step-by-step server setup wizard with dedicated shareable URL
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader,
  SectionCard,
  SettingRow,
  Toggle,
  NumberInput,
  SearchSelect,
  Badge,
  TextInput,
  toast,
} from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Wand2, Globe, BookOpen, Trophy, Coins, ChevronLeft, ChevronRight, Check,
  ArrowLeft, ShoppingBag, ListChecks, Timer, Calendar, Video, Pencil,
  Gamepad2, Users, Briefcase, Eye, ChevronDown, Sparkles, Clock,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Updated to 7 steps with new Server Type template step at the beginning
const TOTAL_STEPS = 7
const STEP_LABELS = ["Server Type", "Basics", "Study Rewards", "Ranks", "Economy", "Optional Features", "Summary"]

const STEP_DESCRIPTIONS: Record<number, string> = {
  1: "Choose a template that matches your server to get the best defaults. You can customize everything in the next steps.",
  2: "Set your server's timezone, language, and welcome message so new members feel at home.",
  3: "Configure how members earn coins from studying. These rewards drive engagement in your study channels.",
  4: "Choose how members rank up. Ranks reward activity and give members goals to work toward.",
  5: "Control the economy: starting coins, transfers, and XP-to-coin conversion.",
  6: "Explore optional features like the shop, role menus, and video channels. You can configure these later.",
  7: "Review your configuration and finish setup.",
}
// --- END AI-MODIFIED ---

const TIMEZONE_OPTIONS = [
  "US/Eastern",
  "US/Central",
  "US/Mountain",
  "US/Pacific",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
  "America/Sao_Paulo",
  "America/Mexico_City",
  "Africa/Cairo",
  "Asia/Jerusalem",
  "UTC",
].map((tz) => ({ value: tz, label: tz.replace(/_/g, " ") }))

const LOCALE_OPTIONS = [
  { value: "en_GB", label: "English" },
  { value: "pt_BR", label: "Portuguese (Brazil)" },
  { value: "he_IL", label: "Hebrew" },
  { value: "tr", label: "Turkish" },
]

const RANK_TYPE_OPTIONS = [
  { value: "XP", label: "XP (Combined)" },
  { value: "VOICE", label: "Voice Time" },
  { value: "MESSAGE", label: "Messages" },
]

const RANK_DESCRIPTIONS: Record<string, string> = {
  XP: "Combines voice study time and text activity. Best for servers that want to reward both.",
  VOICE: "Only counts time spent in voice study channels. Ideal for study-focused servers.",
  MESSAGE: "Based on message count. Good for chatty communities.",
}

const OPTIONAL_FEATURES = [
  {
    id: "shop",
    title: "Shop",
    description: "Let members spend coins on roles, custom items, and more.",
    href: "shop",
    icon: <ShoppingBag size={20} />,
  },
  {
    id: "rolemenus",
    title: "Role Menus",
    description: "Let members self-assign roles via interactive menus.",
    href: "rolemenus",
    icon: <ListChecks size={20} />,
  },
  {
    id: "pomodoro",
    title: "Pomodoro",
    description: "Configure focus timers and break reminders for study channels.",
    href: "pomodoro",
    icon: <Timer size={20} />,
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Set up weekly accountability sessions and recurring events.",
    href: "schedule",
    icon: <Calendar size={20} />,
  },
  {
    id: "videochannels",
    title: "Video Channels",
    description: "Require camera-on for designated study channels.",
    href: "videochannels",
    icon: <Video size={20} />,
  },
]

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Server type templates for quick one-click configuration
const TEMPLATES: Record<string, {
  title: string
  icon: React.ReactNode
  description: string
  bullets: string[]
  config: Record<string, any>
}> = {
  study: {
    title: "Study Community",
    icon: <BookOpen size={24} />,
    description: "Optimized for study groups, tutoring servers, and academic communities",
    bullets: [
      "Higher hourly voice rewards (150 coins/hr)",
      "Ranks based on voice study time",
      "Pomodoro timers and video channels ready",
      "Camera bonus for accountability",
    ],
    config: {
      study_hourly_reward: 150,
      study_hourly_live_bonus: 50,
      daily_study_cap: null,
      rank_type: "VOICE",
      dm_ranks: true,
      xp_per_period: 5,
      starting_funds: 0,
      allow_transfers: true,
      coins_per_centixp: 50,
    },
  },
  gaming: {
    title: "Gaming Server",
    icon: <Gamepad2 size={24} />,
    description: "Economy-focused with shop, role menus, and message-based progression",
    bullets: [
      "Ranks based on message activity",
      "Members start with 100 coins",
      "Higher coin conversion for shopping",
      "Shop and role menus emphasis",
    ],
    config: {
      study_hourly_reward: 50,
      study_hourly_live_bonus: 10,
      daily_study_cap: null,
      rank_type: "MESSAGE",
      dm_ranks: true,
      xp_per_period: 3,
      starting_funds: 100,
      allow_transfers: true,
      coins_per_centixp: 100,
    },
  },
  general: {
    title: "General / Social",
    icon: <Users size={24} />,
    description: "Balanced defaults that work well for any type of community",
    bullets: [
      "Combined XP ranking (voice + text)",
      "Moderate hourly rewards (100 coins/hr)",
      "Good defaults for all features",
      "Easy to customize later",
    ],
    config: {
      study_hourly_reward: 100,
      study_hourly_live_bonus: 25,
      daily_study_cap: null,
      rank_type: "XP",
      dm_ranks: true,
      xp_per_period: 5,
      starting_funds: 0,
      allow_transfers: true,
      coins_per_centixp: 50,
    },
  },
  work: {
    title: "Work / Professional",
    icon: <Briefcase size={24} />,
    description: "Task management, scheduling, and accountability for professional teams",
    bullets: [
      "Task and schedule emphasis",
      "Combined XP ranking",
      "Minimal economy distractions",
      "Transfers disabled for simplicity",
    ],
    config: {
      study_hourly_reward: 75,
      study_hourly_live_bonus: 20,
      daily_study_cap: null,
      rank_type: "XP",
      dm_ranks: false,
      xp_per_period: 5,
      starting_funds: 0,
      allow_transfers: false,
      coins_per_centixp: 25,
    },
  },
}

const PREVIEW_IMAGES: Record<string, { src: string; alt: string; description: string }> = {
  welcome: {
    src: "",
    alt: "Welcome message preview",
    description: "This is what your members will see when they join your server.",
  },
  stats: {
    src: "",
    alt: "Stats card preview",
    description: "Members can view their study stats, coin earnings, and activity with /me.",
  },
  ranks: {
    src: "",
    alt: "Rank notification preview",
    description: "Members receive a notification when they reach a new rank tier.",
  },
  economy: {
    src: "",
    alt: "Shop interface preview",
    description: "Members can browse and purchase colour roles and items from the shop.",
  },
}
// --- END AI-MODIFIED ---

const DEFAULTS: Record<string, any> = {
  timezone: "UTC",
  locale: "en_GB",
  greeting_message: null,
  study_hourly_reward: 100,
  study_hourly_live_bonus: 25,
  daily_study_cap: null,
  rank_type: "XP",
  dm_ranks: true,
  xp_per_period: 5,
  starting_funds: 0,
  allow_transfers: true,
  coins_per_centixp: 50,
}

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Collapsible feature preview component for setup wizard steps
function FeaturePreview({ previewKey }: { previewKey: string }) {
  const [open, setOpen] = useState(false)
  const preview = PREVIEW_IMAGES[previewKey]
  if (!preview) return null

  return (
    <div className="mt-4 border border-border/50 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
      >
        <Eye size={15} />
        <span>Preview: What this looks like</span>
        <ChevronDown size={15} className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground mb-3">{preview.description}</p>
          <div className="relative aspect-video bg-muted/20 rounded-lg overflow-hidden flex items-center justify-center border border-border/30">
            {preview.src ? (
              <img src={preview.src} alt={preview.alt} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <Eye size={32} className="mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground/60">Preview image coming soon</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
// --- END AI-MODIFIED ---

export default function SetupWizard() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<Record<string, any> | null>(null)
  const [perms, setPerms] = useState<{ isAdmin: boolean; isModerator: boolean }>({ isAdmin: false, isModerator: false })
  const [saving, setSaving] = useState(false)
  const [detectedTimezone, setDetectedTimezone] = useState<string>("UTC")
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (tz) setDetectedTimezone(tz)
      } catch {
        setDetectedTimezone("UTC")
      }
    }
  }, [])

  const { data: configData, isLoading: configLoading, mutate } = useDashboard<Record<string, any>>(
    id && session ? `/api/dashboard/servers/${id}/config` : null
  )
  const { data: permData, isLoading: permLoading } = useDashboard<{ isAdmin: boolean; isModerator: boolean }>(
    id && session ? `/api/dashboard/servers/${id}/permissions` : null
  )
  const loading = configLoading || permLoading

  useEffect(() => {
    if (configData) setConfig(configData)
  }, [configData])

  useEffect(() => {
    if (permData) setPerms({ isAdmin: permData.isAdmin, isModerator: permData.isModerator })
  }, [permData])

  const set = useCallback((key: string, value: any) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
  }, [])

  const saveStep = async (updates: Record<string, any>) => {
    if (!id || Object.keys(updates).length === 0) return true
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error("Save failed")
      toast.success("Settings saved")
      return true
    } catch {
      toast.error("Failed to save. Check your admin permissions.")
      return false
    } finally {
      setSaving(false)
    }
  }

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Shifted step numbers by +1 to accommodate new Server Type step
  const handleNext = async () => {
    if (!config) return

    const stepUpdates: Record<number, Record<string, any>> = {
      2: {
        timezone: config.timezone || DEFAULTS.timezone,
        locale: config.locale || DEFAULTS.locale,
        greeting_message: config.greeting_message ?? DEFAULTS.greeting_message,
      },
      3: {
        study_hourly_reward: config.study_hourly_reward ?? DEFAULTS.study_hourly_reward,
        study_hourly_live_bonus: config.study_hourly_live_bonus ?? DEFAULTS.study_hourly_live_bonus,
        daily_study_cap: config.daily_study_cap ?? DEFAULTS.daily_study_cap,
      },
      4: {
        rank_type: config.rank_type || DEFAULTS.rank_type,
        dm_ranks: config.dm_ranks ?? DEFAULTS.dm_ranks,
        xp_per_period: config.xp_per_period ?? DEFAULTS.xp_per_period,
      },
      5: {
        starting_funds: config.starting_funds ?? DEFAULTS.starting_funds,
        allow_transfers: config.allow_transfers ?? DEFAULTS.allow_transfers,
        coins_per_centixp: config.coins_per_centixp ?? DEFAULTS.coins_per_centixp,
      },
    }

    const updates = stepUpdates[step]
    if (updates && step >= 2 && step <= 5) {
      const ok = await saveStep(updates)
      if (!ok) return
      mutate()
    }

    if (step < TOTAL_STEPS) setStep(step + 1)
  }
  // --- END AI-MODIFIED ---

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const goToStep = (s: number) => {
    if (s >= 1 && s <= TOTAL_STEPS) setStep(s)
  }

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Apply a server type template's config values and skip to Summary
  const handleApplyTemplate = async (templateId: string) => {
    if (!id) return
    const template = TEMPLATES[templateId]
    if (!template) return

    const updates = {
      ...template.config,
      timezone: detectedTimezone,
      locale: "en_GB",
    }
    setConfig((prev) => (prev ? { ...prev, ...updates } : prev))
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error("Save failed")
      mutate()
      toast.success(`${template.title} template applied! Review your settings below.`)
      setStep(TOTAL_STEPS)
    } catch {
      toast.error("Failed to apply template. Check your admin permissions.")
    } finally {
      setSaving(false)
    }
  }

  const handleQuickSetup = async () => {
    await handleApplyTemplate("general")
  }
  // --- END AI-MODIFIED ---

  const guildId = id as string

  return (
    <Layout SEO={{ title: `Setup - ${config?.name || "Server"} - LionBot`, description: "Server setup wizard" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-3xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName={config?.name || "..."} isAdmin={perms.isAdmin} isMod={perms.isModerator} />
            <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-6">
              <PageHeader
                title="Setup Wizard"
                description="Configure your server step by step. Each step saves when you click Next."
              />
              <Link href={`/dashboard/servers/${id}`}>
                <a className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  <ArrowLeft size={14} />
                  Skip to dashboard
                </a>
              </Link>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between gap-1 mb-2">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => step >= s && goToStep(s)}
                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      s === step ? "bg-primary text-foreground ring-2 ring-primary ring-offset-2 ring-offset-background" : s < step ? "bg-primary/60 text-foreground" : "bg-muted text-muted-foreground"
                    } ${step >= s ? "cursor-pointer hover:bg-primary/90" : "cursor-default"}`}
                    title={STEP_LABELS[s - 1]}
                  >
                    {s < step ? <Check size={16} /> : s}
                  </button>
                ))}
              </div>
              {/* --- AI-MODIFIED (2026-03-21) --- */}
              {/* Purpose: Hide step labels on mobile, show only current step */}
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                {STEP_LABELS.map((label, i) => (
                  <span key={i} className={`flex-1 text-center truncate ${i === step - 1 ? "text-primary font-medium" : "hidden sm:inline"}`} style={{ maxWidth: "5rem" }}>
                    {label}
                  </span>
                ))}
              {/* --- END AI-MODIFIED --- */}
              </div>
            </div>

            {loading ? (
              <div className="bg-card/50 border border-border rounded-xl p-8 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/3 mb-6" />
                <div className="space-y-4">
                  <div className="h-12 bg-muted rounded" />
                  <div className="h-12 bg-muted rounded w-2/3" />
                </div>
              </div>
            ) : !config ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock size={28} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Setting things up...</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-1">
                  If you just added LionBot to your server, it can take a minute or two for everything to sync up.
                </p>
                <p className="text-sm text-muted-foreground/70 mb-6">
                  Refresh this page shortly and you&apos;ll be all set.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-foreground font-medium transition-colors"
                  >
                    <ArrowLeft size={16} className="rotate-[225deg]" />
                    Refresh Page
                  </button>
                  <Link href={`/dashboard/servers/${id}`}>
                    <a className="px-5 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-sm">
                      Go to dashboard
                    </a>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* --- AI-MODIFIED (2026-03-20) --- */}
                {/* Purpose: New Step 1 - Server Type template selection */}
                {step === 1 && (
                  <SectionCard title="Choose Your Server Type" description={STEP_DESCRIPTIONS[1]} icon={<Sparkles size={18} />} defaultOpen>
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={handleQuickSetup}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-medium border border-primary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Wand2 size={18} />
                        Quick Setup
                      </button>
                      <p className="text-xs text-muted-foreground mt-1.5">Apply balanced defaults and skip to Summary</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {Object.entries(TEMPLATES).map(([key, template]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleApplyTemplate(key)}
                          disabled={saving}
                          className="flex flex-col items-start gap-3 p-5 rounded-xl bg-muted/20 hover:bg-muted/40 border border-border hover:border-primary/40 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-primary/80 group-hover:text-primary transition-colors flex-shrink-0">
                              {template.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-foreground">{template.title}</div>
                              <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                            </div>
                          </div>
                          <ul className="space-y-1 w-full">
                            {template.bullets.map((bullet, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <Check size={12} className="text-primary/60 flex-shrink-0 mt-0.5" />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Or click <strong>Next</strong> below to skip templates and customize everything manually.
                    </p>
                  </SectionCard>
                )}
                {/* --- END AI-MODIFIED --- */}

                {/* Step 2: Basics (was Step 1) */}
                {step === 2 && (
                  <SectionCard title="Basics" description={STEP_DESCRIPTIONS[2]} icon={<Globe size={18} />} defaultOpen>
                    <SettingRow label="Timezone" description="Server timezone for schedules and time displays">
                      <SearchSelect options={TIMEZONE_OPTIONS} value={config.timezone || null} onChange={(v) => set("timezone", v)} placeholder="Select timezone" />
                    </SettingRow>
                    <SettingRow label="Language" description="Bot language for this server">
                      <SearchSelect options={LOCALE_OPTIONS} value={config.locale || null} onChange={(v) => set("locale", v)} placeholder="Select language" />
                    </SettingRow>
                    <SettingRow label="Welcome Message" description="Sent when a new member joins. Use: {mention}, {user_name}, {server_name}">
                      <TextInput value={config.greeting_message || ""} onChange={(v) => set("greeting_message", v || null)} multiline rows={4} placeholder="Welcome to {server_name}, {mention}!" maxLength={2000} />
                    </SettingRow>
                    <FeaturePreview previewKey="welcome" />
                  </SectionCard>
                )}

                {/* Step 3: Study Rewards (was Step 2) */}
                {step === 3 && (
                  <SectionCard title="Study Rewards" description={STEP_DESCRIPTIONS[3]} icon={<BookOpen size={18} />} defaultOpen>
                    <SettingRow label="Hourly Reward" description="Coins earned per hour of study in voice channels" defaultBadge={String(DEFAULTS.study_hourly_reward)}>
                      <NumberInput value={config.study_hourly_reward} onChange={(v) => set("study_hourly_reward", v)} unit="coins/hr" min={0} defaultValue={DEFAULTS.study_hourly_reward} allowNull />
                    </SettingRow>
                    <SettingRow label="Camera Bonus" description="Extra coins per hour when studying with camera on" defaultBadge={String(DEFAULTS.study_hourly_live_bonus)}>
                      <NumberInput value={config.study_hourly_live_bonus} onChange={(v) => set("study_hourly_live_bonus", v)} unit="coins/hr" min={0} defaultValue={DEFAULTS.study_hourly_live_bonus} allowNull />
                    </SettingRow>
                    <SettingRow label="Daily Cap" description="Max hours of study that earn rewards per day. Leave empty for no limit." defaultBadge="No limit">
                      <NumberInput value={config.daily_study_cap} onChange={(v) => set("daily_study_cap", v)} unit="hours" min={1} placeholder="No limit" allowNull />
                    </SettingRow>
                    <FeaturePreview previewKey="stats" />
                  </SectionCard>
                )}

                {/* Step 4: Ranks (was Step 3) */}
                {step === 4 && (
                  <SectionCard title="Ranks" description={STEP_DESCRIPTIONS[4]} icon={<Trophy size={18} />} defaultOpen>
                    <SettingRow label="Rank Type" description={RANK_DESCRIPTIONS[config.rank_type || "XP"] || ""}>
                      <SearchSelect options={RANK_TYPE_OPTIONS} value={config.rank_type || null} onChange={(v) => set("rank_type", v)} placeholder="Select rank type" />
                    </SettingRow>
                    <SettingRow label="DM Notifications" description="Send members a DM when they reach a new rank">
                      <Toggle checked={config.dm_ranks ?? true} onChange={(v) => set("dm_ranks", v)} />
                    </SettingRow>
                    <SettingRow label="XP per Period" description="Voice XP earned per tracking interval" defaultBadge={String(DEFAULTS.xp_per_period)}>
                      <NumberInput value={config.xp_per_period} onChange={(v) => set("xp_per_period", v)} unit="XP" min={0} defaultValue={DEFAULTS.xp_per_period} allowNull />
                    </SettingRow>
                    <FeaturePreview previewKey="ranks" />
                  </SectionCard>
                )}

                {/* Step 5: Economy (was Step 4) */}
                {step === 5 && (
                  <SectionCard title="Economy" description={STEP_DESCRIPTIONS[5]} icon={<Coins size={18} />} defaultOpen>
                    <SettingRow label="Starting Coins" description="Coins given to new members when they join" defaultBadge={String(DEFAULTS.starting_funds)}>
                      <NumberInput value={config.starting_funds} onChange={(v) => set("starting_funds", v)} unit="coins" min={0} defaultValue={DEFAULTS.starting_funds} allowNull />
                    </SettingRow>
                    <SettingRow label="Allow Transfers" description="Let members send coins to each other">
                      <Toggle checked={config.allow_transfers ?? true} onChange={(v) => set("allow_transfers", v)} />
                    </SettingRow>
                    <SettingRow label="Coins per 100 XP" description="Conversion rate between XP and coins" defaultBadge={String(DEFAULTS.coins_per_centixp)}>
                      <NumberInput value={config.coins_per_centixp} onChange={(v) => set("coins_per_centixp", v)} unit="coins" min={0} defaultValue={DEFAULTS.coins_per_centixp} allowNull />
                    </SettingRow>
                    <FeaturePreview previewKey="economy" />
                  </SectionCard>
                )}

                {/* Step 6: Optional Features (was Step 5) */}
                {step === 6 && (
                  <SectionCard title="Optional Features" description={STEP_DESCRIPTIONS[6]} icon={<Wand2 size={18} />} defaultOpen>
                    <div className="pt-4 space-y-3">
                      {OPTIONAL_FEATURES.map((feat) => (
                        <Link key={feat.id} href={`/dashboard/servers/${id}/${feat.href}`}>
                          <span className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border hover:border-border transition-all cursor-pointer">
                            <span className="text-muted-foreground flex-shrink-0">{feat.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground">{feat.title}</div>
                              <p className="text-sm text-muted-foreground mt-0.5">{feat.description}</p>
                            </div>
                            <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Step 7: Summary (was Step 6) */}
                {step === 7 && (
                  <SectionCard title="All Set!" description={STEP_DESCRIPTIONS[7]} icon={<Check size={18} />} defaultOpen>
                    <div className="pt-4 space-y-6">
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Basics</span>
                        <button type="button" onClick={() => goToStep(2)} className="flex items-center gap-1 text-primary hover:text-primary text-sm cursor-pointer">
                          <Pencil size={14} /> Edit
                        </button>
                      </div>
                      <div className="text-sm text-foreground/80 space-y-1">
                        <p>Timezone: {config.timezone || "UTC"}</p>
                        <p>Language: {LOCALE_OPTIONS.find((o) => o.value === config.locale)?.label || "English"}</p>
                        <p>Welcome: {config.greeting_message ? "Set" : "Not set"}</p>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Study Rewards</span>
                        <button type="button" onClick={() => goToStep(3)} className="flex items-center gap-1 text-primary hover:text-primary text-sm cursor-pointer">
                          <Pencil size={14} /> Edit
                        </button>
                      </div>
                      <div className="text-sm text-foreground/80 space-y-1">
                        <p>Hourly: {config.study_hourly_reward ?? 100} coins, Camera: +{config.study_hourly_live_bonus ?? 25}, Cap: {config.daily_study_cap ?? "None"}</p>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Ranks</span>
                        <button type="button" onClick={() => goToStep(4)} className="flex items-center gap-1 text-primary hover:text-primary text-sm cursor-pointer">
                          <Pencil size={14} /> Edit
                        </button>
                      </div>
                      <div className="text-sm text-foreground/80 space-y-1">
                        <p>Type: {config.rank_type || "XP"}, DM: {config.dm_ranks ?? true ? "Yes" : "No"}, XP/period: {config.xp_per_period ?? 5}</p>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Economy</span>
                        <button type="button" onClick={() => goToStep(5)} className="flex items-center gap-1 text-primary hover:text-primary text-sm cursor-pointer">
                          <Pencil size={14} /> Edit
                        </button>
                      </div>
                      <div className="text-sm text-foreground/80 space-y-1">
                        <p>Starting: {config.starting_funds ?? 0} coins, Transfers: {config.allow_transfers ?? true ? "Yes" : "No"}, Coins/100 XP: {config.coins_per_centixp ?? 50}</p>
                      </div>

                      <Link href={`/dashboard/servers/${id}/settings`}>
                        <a className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                          Full settings page &rarr;
                        </a>
                      </Link>

                      <div className="pt-4 border-t border-border">
                        <p className="text-sm font-medium text-foreground mb-3">What&apos;s Next?</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Link href={`/dashboard/servers/${id}/ranks`}>
                            <a className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border transition-colors text-sm">
                              <Trophy size={16} className="text-primary" />
                              Set up ranks
                            </a>
                          </Link>
                          <Link href={`/dashboard/servers/${id}/shop`}>
                            <a className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border transition-colors text-sm">
                              <ShoppingBag size={16} className="text-primary" />
                              Add shop items
                            </a>
                          </Link>
                          <Link href={`/dashboard/servers/${id}/rolemenus`}>
                            <a className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border transition-colors text-sm">
                              <ListChecks size={16} className="text-primary" />
                              Create role menus
                            </a>
                          </Link>
                          <Link href={`/dashboard/servers/${id}/videochannels`}>
                            <a className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border transition-colors text-sm">
                              <Video size={16} className="text-primary" />
                              Configure video channels
                            </a>
                          </Link>
                        </div>
                      </div>

                      <Link href={`/dashboard/servers/${id}`}>
                        <a className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary/90 text-foreground font-semibold text-lg transition-colors">
                          Go to Dashboard
                          <ArrowLeft size={20} className="rotate-180" />
                        </a>
                      </Link>
                    </div>
                  </SectionCard>
                )}

                {/* Back / Next */}
                {step < TOTAL_STEPS && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft size={18} />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? "Saving..." : step === TOTAL_STEPS - 1 ? "Finish" : "Next"}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        </div>
      </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
