// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Step-by-step server setup wizard with dedicated shareable URL
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader,
  SectionCard,
  SettingRow,
  Toggle,
  NumberInput,
  SearchSelect,
  ChannelSelect,
  RoleSelect,
  Badge,
  TextInput,
  toast,
} from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Wand2,
  Globe,
  BookOpen,
  Trophy,
  Coins,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  ShoppingBag,
  ListChecks,
  Timer,
  Calendar,
  Video,
  Pencil,
} from "lucide-react"

const TOTAL_STEPS = 6
const STEP_LABELS = ["Basics", "Study Rewards", "Ranks", "Economy", "Optional Features", "Summary"]

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

export default function SetupWizard() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<Record<string, any> | null>(null)
  const [perms, setPerms] = useState<{ isAdmin: boolean; isModerator: boolean }>({ isAdmin: false, isModerator: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id && session) {
      Promise.all([
        fetch(`/api/dashboard/servers/${id}/config`).then((r) => {
          if (!r.ok) throw new Error(r.status === 403 ? "You're not a moderator of this server" : "Failed to load")
          return r.json()
        }),
        fetch(`/api/dashboard/servers/${id}/permissions`).then((r) =>
          r.ok ? r.json() : { isMember: true, isModerator: false, isAdmin: false }
        ),
      ])
        .then(([configData, permData]) => {
          setConfig(configData)
          setPerms({ isAdmin: permData.isAdmin, isModerator: permData.isModerator })
        })
        .catch(() => setConfig(null))
        .finally(() => setLoading(false))
    }
  }, [id, session])

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

  const handleNext = async () => {
    if (!config) return

    const stepUpdates: Record<number, Record<string, any>> = {
      1: {
        timezone: config.timezone || DEFAULTS.timezone,
        locale: config.locale || DEFAULTS.locale,
        greeting_message: config.greeting_message ?? DEFAULTS.greeting_message,
      },
      2: {
        study_hourly_reward: config.study_hourly_reward ?? DEFAULTS.study_hourly_reward,
        study_hourly_live_bonus: config.study_hourly_live_bonus ?? DEFAULTS.study_hourly_live_bonus,
        daily_study_cap: config.daily_study_cap ?? DEFAULTS.daily_study_cap,
      },
      3: {
        rank_type: config.rank_type || DEFAULTS.rank_type,
        dm_ranks: config.dm_ranks ?? DEFAULTS.dm_ranks,
        xp_per_period: config.xp_per_period ?? DEFAULTS.xp_per_period,
      },
      4: {
        starting_funds: config.starting_funds ?? DEFAULTS.starting_funds,
        allow_transfers: config.allow_transfers ?? DEFAULTS.allow_transfers,
        coins_per_centixp: config.coins_per_centixp ?? DEFAULTS.coins_per_centixp,
      },
    }

    const updates = stepUpdates[step]
    if (updates && step < 5) {
      const ok = await saveStep(updates)
      if (!ok) return
    }

    if (step < TOTAL_STEPS) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const goToStep = (s: number) => {
    if (s >= 1 && s <= TOTAL_STEPS) setStep(s)
  }

  const guildId = id as string

  return (
    <Layout SEO={{ title: `Setup - ${config?.name || "Server"} - LionBot`, description: "Server setup wizard" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <ServerNav serverId={guildId} serverName={config?.name || "..."} isAdmin={perms.isAdmin} isMod={perms.isModerator} />

            <div className="flex items-start justify-between gap-4 mb-6">
              <PageHeader
                title="Setup Wizard"
                description="Configure your server step by step. Each step saves when you click Next."
              />
              <Link
                href={`/dashboard/servers/${id}`}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                <ArrowLeft size={14} />
                Skip to dashboard
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
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all ${
                      s === step ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-900" : s < step ? "bg-indigo-600/60 text-white" : "bg-gray-700 text-gray-500"
                    } ${step >= s ? "cursor-pointer hover:bg-indigo-500" : "cursor-default"}`}
                    title={STEP_LABELS[s - 1]}
                  >
                    {s < step ? <Check size={16} /> : s}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-1">
                {STEP_LABELS.map((label, i) => (
                  <span key={i} className={`flex-1 text-center truncate ${i === step - 1 ? "text-indigo-400 font-medium" : ""}`} style={{ maxWidth: "4rem" }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-6" />
                <div className="space-y-4">
                  <div className="h-12 bg-gray-700 rounded" />
                  <div className="h-12 bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ) : !config ? (
              <div className="text-center py-20">
                <p className="text-gray-400">Unable to load settings. You may not have moderator permissions.</p>
                <Link href={`/dashboard/servers/${id}`} className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
                  Go to dashboard
                </Link>
              </div>
            ) : (
              <>
                {/* Step 1: Basics */}
                {step === 1 && (
                  <SectionCard title="Basics" description="Timezone, language, and welcome message" icon={<Globe size={18} />} defaultOpen>
                    <SettingRow label="Timezone" description="Server timezone for schedules and time displays">
                      <SearchSelect options={TIMEZONE_OPTIONS} value={config.timezone || null} onChange={(v) => set("timezone", v)} placeholder="Select timezone" />
                    </SettingRow>
                    <SettingRow label="Language" description="Bot language for this server">
                      <SearchSelect options={LOCALE_OPTIONS} value={config.locale || null} onChange={(v) => set("locale", v)} placeholder="Select language" />
                    </SettingRow>
                    <SettingRow label="Welcome Message" description="Sent when a new member joins. Use: {mention}, {user_name}, {server_name}">
                      <TextInput value={config.greeting_message || ""} onChange={(v) => set("greeting_message", v || null)} multiline rows={4} placeholder="Welcome to {server_name}, {mention}!" maxLength={2000} />
                    </SettingRow>
                  </SectionCard>
                )}

                {/* Step 2: Study Rewards */}
                {step === 2 && (
                  <SectionCard title="Study Rewards" description="How members earn coins from studying" icon={<BookOpen size={18} />} defaultOpen>
                    <SettingRow label="Hourly Reward" description="Coins earned per hour of study in voice channels" defaultBadge={String(DEFAULTS.study_hourly_reward)}>
                      <NumberInput value={config.study_hourly_reward} onChange={(v) => set("study_hourly_reward", v)} unit="coins/hr" min={0} defaultValue={DEFAULTS.study_hourly_reward} allowNull />
                    </SettingRow>
                    <SettingRow label="Camera Bonus" description="Extra coins per hour when studying with camera on" defaultBadge={String(DEFAULTS.study_hourly_live_bonus)}>
                      <NumberInput value={config.study_hourly_live_bonus} onChange={(v) => set("study_hourly_live_bonus", v)} unit="coins/hr" min={0} defaultValue={DEFAULTS.study_hourly_live_bonus} allowNull />
                    </SettingRow>
                    <SettingRow label="Daily Cap" description="Max hours of study that earn rewards per day. Leave empty for no limit." defaultBadge="No limit">
                      <NumberInput value={config.daily_study_cap} onChange={(v) => set("daily_study_cap", v)} unit="hours" min={1} placeholder="No limit" allowNull />
                    </SettingRow>
                  </SectionCard>
                )}

                {/* Step 3: Ranks */}
                {step === 3 && (
                  <SectionCard title="Ranks" description="Activity-based rank progression" icon={<Trophy size={18} />} defaultOpen>
                    <SettingRow label="Rank Type" description={RANK_DESCRIPTIONS[config.rank_type || "XP"] || ""}>
                      <SearchSelect options={RANK_TYPE_OPTIONS} value={config.rank_type || null} onChange={(v) => set("rank_type", v)} placeholder="Select rank type" />
                    </SettingRow>
                    <SettingRow label="DM Notifications" description="Send members a DM when they reach a new rank">
                      <Toggle checked={config.dm_ranks ?? true} onChange={(v) => set("dm_ranks", v)} />
                    </SettingRow>
                    <SettingRow label="XP per Period" description="Voice XP earned per tracking interval" defaultBadge={String(DEFAULTS.xp_per_period)}>
                      <NumberInput value={config.xp_per_period} onChange={(v) => set("xp_per_period", v)} unit="XP" min={0} defaultValue={DEFAULTS.xp_per_period} allowNull />
                    </SettingRow>
                  </SectionCard>
                )}

                {/* Step 4: Economy */}
                {step === 4 && (
                  <SectionCard title="Economy" description="Starting coins and transfer rules" icon={<Coins size={18} />} defaultOpen>
                    <SettingRow label="Starting Coins" description="Coins given to new members when they join" defaultBadge={String(DEFAULTS.starting_funds)}>
                      <NumberInput value={config.starting_funds} onChange={(v) => set("starting_funds", v)} unit="coins" min={0} defaultValue={DEFAULTS.starting_funds} allowNull />
                    </SettingRow>
                    <SettingRow label="Allow Transfers" description="Let members send coins to each other">
                      <Toggle checked={config.allow_transfers ?? true} onChange={(v) => set("allow_transfers", v)} />
                    </SettingRow>
                    <SettingRow label="Coins per 100 XP" description="Conversion rate between XP and coins" defaultBadge={String(DEFAULTS.coins_per_centixp)}>
                      <NumberInput value={config.coins_per_centixp} onChange={(v) => set("coins_per_centixp", v)} unit="coins" min={0} defaultValue={DEFAULTS.coins_per_centixp} allowNull />
                    </SettingRow>
                  </SectionCard>
                )}

                {/* Step 5: Optional Features */}
                {step === 5 && (
                  <SectionCard title="Optional Features" description="Configure these later for more control" icon={<Wand2 size={18} />} defaultOpen>
                    <div className="pt-4 space-y-3">
                      {OPTIONAL_FEATURES.map((feat) => (
                        <Link key={feat.id} href={`/dashboard/servers/${id}/${feat.href}`}>
                          <span className="flex items-center gap-4 p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 transition-all cursor-pointer">
                            <span className="text-gray-400 flex-shrink-0">{feat.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white">{feat.title}</div>
                              <p className="text-sm text-gray-400 mt-0.5">{feat.description}</p>
                            </div>
                            <ChevronRight size={18} className="text-gray-500 flex-shrink-0" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Step 6: Summary */}
                {step === 6 && (
                  <SectionCard title="All Set!" description="Review your configuration" icon={<Check size={18} />} defaultOpen>
                    <div className="pt-4 space-y-6">
                      <div className="flex items-center justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Basics</span>
                        <button type="button" onClick={() => goToStep(1)} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm cursor-pointer">
                          <Pencil size={14} /> Edit
                        </button>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>Timezone: {config.timezone || "UTC"}</p>
                        <p>Language: {LOCALE_OPTIONS.find((o) => o.value === config.locale)?.label || "English"}</p>
                        <p>Welcome: {config.greeting_message ? "Set" : "Not set"}</p>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Study Rewards</span>
                        <button type="button" onClick={() => goToStep(2)} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm cursor-pointer">
                          <Pencil size={14} /> Edit
                        </button>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>Hourly: {config.study_hourly_reward ?? 100} coins, Camera: +{config.study_hourly_live_bonus ?? 25}, Cap: {config.daily_study_cap ?? "None"}</p>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Ranks</span>
                        <button type="button" onClick={() => goToStep(3)} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm cursor-pointer">
                          <Pencil size={14} /> Edit
                        </button>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>Type: {config.rank_type || "XP"}, DM: {config.dm_ranks ?? true ? "Yes" : "No"}, XP/period: {config.xp_per_period ?? 5}</p>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Economy</span>
                        <button type="button" onClick={() => goToStep(4)} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm cursor-pointer">
                          <Pencil size={14} /> Edit
                        </button>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>Starting: {config.starting_funds ?? 0} coins, Transfers: {config.allow_transfers ?? true ? "Yes" : "No"}, Coins/100 XP: {config.coins_per_centixp ?? 50}</p>
                      </div>

                      <Link href={`/dashboard/servers/${id}/settings`} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white">
                        Full settings page →
                      </Link>

                      <Link
                        href={`/dashboard/servers/${id}`}
                        className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition-colors"
                      >
                        Go to Dashboard
                        <ArrowLeft size={20} className="rotate-180" />
                      </Link>
                    </div>
                  </SectionCard>
                )}

                {/* Back / Next */}
                {step < 6 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft size={18} />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? "Saving..." : step === 5 ? "Finish" : "Next"}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
