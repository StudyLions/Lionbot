// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server settings command center with navigation, search, presets,
//          import/export, visual change tracking, and live impact context
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Link component for rooms admin panel cross-link
import Link from "next/link"
// --- END AI-MODIFIED ---
import {
  SectionCard, SettingRow, Toggle, NumberInput, TextInput,
  SearchSelect, ChannelSelect, RoleSelect, SaveBar, PageHeader, toast,
  clearRoleCache, clearChannelCache, ConfirmModal, SettingsNav, DiscordEmbedPreview,
} from "@/components/dashboard/ui"
import type { NavSection } from "@/components/dashboard/ui"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import {
  BookOpen, Coins, CheckSquare, Lock, Users, Trophy,
  Shield, Globe, MessageSquare, Dumbbell, Hash, UserCog, Calendar,
  Download, Upload, Wand2, AlertTriangle, Eye, EyeOff, Volume2, Type,
  Bot, BarChart3, ChevronRight,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// ── Constants ──────────────────────────────────────────────────────

const TIMEZONE_OPTIONS = [
  "US/Eastern", "US/Central", "US/Mountain", "US/Pacific",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Istanbul",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
  "Australia/Sydney", "Pacific/Auckland", "America/Sao_Paulo",
  "America/Mexico_City", "Africa/Cairo", "Asia/Jerusalem", "UTC",
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

const DEFAULTS: Record<string, any> = {
  study_hourly_reward: 100,
  study_hourly_live_bonus: 25,
  daily_study_cap: null,
  starting_funds: 0,
  allow_transfers: true,
  coins_per_centixp: 50,
  max_tasks: 20,
  task_reward: 50,
  task_reward_limit: 10,
  renting_price: 1000,
  renting_cap: 25,
  renting_visible: true,
  renting_sync_perms: false,
  accountability_price: 100,
  accountability_reward: 200,
  accountability_bonus: 200,
  rank_type: "XP",
  dm_ranks: true,
  xp_per_period: 5,
  xp_per_centiword: null,
  video_studyban: true,
  video_grace_period: 90,
  persist_roles: false,
  timezone: "UTC",
  locale: "en_GB",
  force_locale: false,
  min_workout_length: 10,
  workout_reward: 50,
  greeting_message: null,
  returning_message: null,
  season_start: null,
}

interface Preset {
  name: string
  description: string
  icon: typeof BookOpen
  values: Record<string, any>
}

const PRESETS: Preset[] = [
  {
    name: "Study-Focused",
    description: "High rewards for studying, strict video enforcement, moderate task rewards",
    icon: BookOpen,
    values: {
      study_hourly_reward: 150,
      study_hourly_live_bonus: 50,
      daily_study_cap: 12,
      task_reward: 25,
      task_reward_limit: 5,
      video_studyban: true,
      video_grace_period: 60,
    },
  },
  {
    name: "Casual Community",
    description: "Low study rewards, generous starting funds, relaxed moderation",
    icon: Users,
    values: {
      study_hourly_reward: 50,
      study_hourly_live_bonus: 0,
      daily_study_cap: null,
      starting_funds: 500,
      allow_transfers: true,
      video_studyban: false,
    },
  },
  {
    name: "Economy-Heavy",
    description: "High task rewards, many tasks allowed, cheap rooms, active economy",
    icon: Coins,
    values: {
      study_hourly_reward: 100,
      study_hourly_live_bonus: 25,
      task_reward: 100,
      task_reward_limit: 20,
      max_tasks: 50,
      renting_price: 500,
      allow_transfers: true,
    },
  },
]

// Setting labels for diff preview
const SETTING_LABELS: Record<string, string> = {
  study_hourly_reward: "Hourly Reward",
  study_hourly_live_bonus: "Camera Bonus",
  daily_study_cap: "Daily Study Cap",
  starting_funds: "Starting Coins",
  allow_transfers: "Allow Transfers",
  coins_per_centixp: "Coins per 100 XP",
  max_tasks: "Max Tasks",
  task_reward: "Task Reward",
  task_reward_limit: "Daily Reward Limit",
  renting_price: "Daily Rent",
  renting_cap: "Max Room Members",
  renting_visible: "Rooms Visible",
  renting_sync_perms: "Sync Permissions",
  accountability_price: "Booking Cost",
  accountability_reward: "Attendance Reward",
  accountability_bonus: "Full Group Bonus",
  rank_type: "Rank Type",
  dm_ranks: "DM Rank-Ups",
  xp_per_period: "XP per Period",
  xp_per_centiword: "XP per Word",
  video_studyban: "Video Study Ban",
  video_grace_period: "Camera Grace Period",
  persist_roles: "Persist Roles",
  timezone: "Timezone",
  locale: "Language",
  force_locale: "Force Language",
  min_workout_length: "Min Workout Length",
  workout_reward: "Workout Reward",
  greeting_message: "Welcome Message",
  returning_message: "Returning Message",
  season_start: "Season Start",
}

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Add listKeys to SectionDef so list-only sections (tracking, autoroles, etc.)
// properly show modified counts and the save toast accurately reflects list changes.
// Which section each setting belongs to (for search and modified count)
interface SectionDef {
  id: string
  label: string
  icon: typeof BookOpen
  settings: string[]
  listKeys?: string[]
  searchTerms?: string[]
}

const SECTION_DEFS: SectionDef[] = [
  { id: "study-rewards", label: "Study Rewards", icon: BookOpen, settings: ["study_hourly_reward", "study_hourly_live_bonus", "daily_study_cap"], searchTerms: ["voice", "camera", "hourly", "study", "reward", "cap"] },
  { id: "economy", label: "Economy", icon: Coins, settings: ["starting_funds", "allow_transfers", "coins_per_centixp"], searchTerms: ["coins", "transfer", "xp", "starting"] },
  { id: "tasks", label: "Tasks", icon: CheckSquare, settings: ["max_tasks", "task_reward", "task_reward_limit"], searchTerms: ["task", "todo", "reward", "limit"] },
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Add new room settings to the Private Rooms section
  { id: "rooms", label: "Private Rooms", icon: Lock, settings: ["renting_price", "renting_cap", "renting_visible", "renting_sync_perms", "renting_max_per_user", "renting_name_limit", "renting_min_deposit", "renting_auto_extend", "renting_cooldown"], searchTerms: ["room", "rent", "private", "visible", "cooldown", "auto-extend", "deposit"] },
  // --- END AI-MODIFIED ---
  { id: "schedule", label: "Accountability", icon: Users, settings: ["accountability_price", "accountability_reward", "accountability_bonus"], searchTerms: ["schedule", "session", "booking", "accountability", "attendance"] },
  { id: "ranks", label: "Ranks", icon: Trophy, settings: ["rank_type", "dm_ranks", "xp_per_period"], searchTerms: ["rank", "level", "xp", "leaderboard"] },
  { id: "moderation", label: "Moderation", icon: Shield, settings: ["video_studyban", "video_grace_period", "persist_roles"], searchTerms: ["video", "ban", "moderate", "roles", "grace"] },
  { id: "general", label: "General", icon: Globe, settings: ["timezone", "locale", "force_locale"], searchTerms: ["timezone", "language", "locale", "region"] },
  { id: "welcome", label: "Welcome Messages", icon: MessageSquare, settings: ["greeting_message", "returning_message"], searchTerms: ["welcome", "greeting", "returning", "message", "join"] },
  { id: "workouts", label: "Workouts", icon: Dumbbell, settings: ["min_workout_length", "workout_reward"], searchTerms: ["workout", "exercise", "fitness", "gym"] },
  { id: "channels", label: "Channels", icon: Hash, settings: [], searchTerms: ["channel", "log", "event", "alert", "greeting"] },
  { id: "roles", label: "Roles", icon: UserCog, settings: [], searchTerms: ["role", "admin", "moderator", "permission"] },
  { id: "tracking", label: "Tracking", icon: EyeOff, settings: [], listKeys: ["untrackedVoiceChannels", "untrackedTextChannels"], searchTerms: ["untracked", "tracking", "exclude", "ignore"] },
  { id: "autoroles", label: "Auto-Roles", icon: Bot, settings: [], listKeys: ["autoroles", "botAutoroles"], searchTerms: ["autorole", "auto", "join", "new member", "bot"] },
  { id: "statistics", label: "Season & Stats", icon: Calendar, settings: ["season_start", "xp_per_centiword"], listKeys: ["unrankedRoles"], searchTerms: ["season", "stats", "leaderboard", "unranked", "xp", "word"] },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, settings: [], searchTerms: ["reset", "danger", "delete", "clear"] },
]
// --- END AI-MODIFIED ---

// ── Component ──────────────────────────────────────────────────────

export default function ServerSettings() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  // Data fetching
  const { data: configData, error, isLoading: loading, mutate } = useDashboard<Record<string, any>>(
    id && session ? `/api/dashboard/servers/${id}/config` : null
  )
  const { data: listsData, mutate: mutateLists } = useDashboard<Record<string, string[]>>(
    id && session ? `/api/dashboard/servers/${id}/config-lists` : null
  )
  const { data: contextData } = useDashboard<Record<string, number>>(
    id && session ? `/api/dashboard/servers/${id}/settings-context` : null,
    { revalidateOnFocus: false }
  )

  // State
  const [config, setConfig] = useState<Record<string, any> | null>(null)
  const [original, setOriginal] = useState<Record<string, any> | null>(null)
  const [lists, setLists] = useState<Record<string, string[]>>({})
  const [originalLists, setOriginalLists] = useState<Record<string, string[]>>({})
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPresets, setShowPresets] = useState(false)
  const [presetPreview, setPresetPreview] = useState<Preset | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importData, setImportData] = useState<Record<string, any> | null>(null)
  const [importDiff, setImportDiff] = useState<Array<{ key: string; from: any; to: any }>>([])
  const [showDangerConfirm, setShowDangerConfirm] = useState<"season" | "reset" | null>(null)
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detect browser timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz) setDetectedTimezone(tz)
    } catch { /* ignore */ }
  }, [])

  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Deep-link from command palette search -- scroll to section and briefly highlight
  useEffect(() => {
    const section = router.query.section as string
    if (section && !loading && config) {
      setTimeout(() => {
        const el = document.getElementById(section)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" })
          el.classList.add("ring-2", "ring-primary/50", "rounded-xl")
          setTimeout(() => el.classList.remove("ring-2", "ring-primary/50", "rounded-xl"), 2000)
        }
      }, 400)
    }
  }, [router.query.section, loading, config])
  // --- END AI-MODIFIED ---

  // Sync config data
  useEffect(() => {
    if (configData) {
      setConfig(configData)
      setOriginal({ ...configData })
    } else if (!loading && !configData) {
      setConfig(null)
      setOriginal(null)
    }
  }, [configData, loading])

  // Sync lists data
  useEffect(() => {
    if (listsData) {
      setLists(listsData)
      setOriginalLists({ ...listsData })
    }
  }, [listsData])

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (hasChanges) handleSave()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  })

  // Beforeunload warning
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  })

  // Helpers
  const set = useCallback((key: string, value: any) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
  }, [])

  const setList = useCallback((key: string, value: string[]) => {
    setLists((prev) => ({ ...prev, [key]: value }))
  }, [])

  const isModified = useCallback((key: string) => {
    if (!config || !original) return false
    return JSON.stringify(config[key]) !== JSON.stringify(original[key])
  }, [config, original])

  const resetField = useCallback((key: string) => {
    if (key in DEFAULTS) {
      set(key, DEFAULTS[key])
    }
  }, [set])

  const configHasChanges = config && original && JSON.stringify(config) !== JSON.stringify(original)
  const listsHaveChanges = JSON.stringify(lists) !== JSON.stringify(originalLists)
  const hasChanges = configHasChanges || listsHaveChanges

  // --- AI-MODIFIED (2026-03-21) ---
  // Purpose: Include list changes (untracked channels, autoroles, etc.) in modified counts
  const modifiedCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    if (!config || !original) return counts
    for (const section of SECTION_DEFS) {
      let count = section.settings.filter((key) =>
        JSON.stringify(config[key]) !== JSON.stringify(original[key])
      ).length
      if (section.listKeys) {
        count += section.listKeys.filter((key) =>
          JSON.stringify(lists[key]) !== JSON.stringify(originalLists[key])
        ).length
      }
      counts[section.id] = count
    }
    return counts
  }, [config, original, lists, originalLists])
  // --- END AI-MODIFIED ---

  // Diff for save preview
  const changeDiff = useMemo(() => {
    if (!config || !original) return []
    const diff: Array<{ key: string; from: any; to: any }> = []
    for (const key of Object.keys(config)) {
      if (key === "name" || key === "guildid") continue
      if (JSON.stringify(config[key]) !== JSON.stringify(original[key])) {
        diff.push({ key, from: original[key], to: config[key] })
      }
    }
    return diff
  }, [config, original])

  // Search filtering
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTION_DEFS.map((s) => s.id)
    const q = searchQuery.toLowerCase()
    return SECTION_DEFS
      .filter((s) => {
        if (s.label.toLowerCase().includes(q)) return true
        if (s.searchTerms?.some((t) => t.includes(q))) return true
        return s.settings.some((key) => {
          const label = SETTING_LABELS[key]
          return label && label.toLowerCase().includes(q)
        })
      })
      .map((s) => s.id)
  }, [searchQuery])

  const navSections: NavSection[] = SECTION_DEFS.map((s) => ({
    id: s.id,
    label: s.label,
    icon: <s.icon size={14} />,
    modifiedCount: modifiedCounts[s.id] || 0,
  }))

  // Save handler
  const handleSave = async () => {
    if (!config || !original || !hasChanges || !id) return
    setSaving(true)

    try {
      // Save config changes
      if (configHasChanges) {
        const changes: Record<string, any> = {}
        for (const key of Object.keys(config)) {
          if (key === "name" || key === "guildid") continue
          if (JSON.stringify(config[key]) !== JSON.stringify(original[key])) {
            changes[key] = config[key]
          }
        }
        await dashboardMutate("PATCH", `/api/dashboard/servers/${id}/config`, changes)
      }

      // Save list changes
      if (listsHaveChanges) {
        for (const key of Object.keys(lists)) {
          if (JSON.stringify(lists[key]) !== JSON.stringify(originalLists[key])) {
            const added = lists[key].filter((v) => !originalLists[key]?.includes(v))
            const removed = (originalLists[key] || []).filter((v) => !lists[key].includes(v))
            if (added.length > 0) {
              await dashboardMutate("PATCH", `/api/dashboard/servers/${id}/config-lists`, { list: key, action: "add", ids: added })
            }
            if (removed.length > 0) {
              await dashboardMutate("PATCH", `/api/dashboard/servers/${id}/config-lists`, { list: key, action: "remove", ids: removed })
            }
          }
        }
      }

      setOriginal({ ...config })
      setOriginalLists({ ...lists })
      mutate()
      mutateLists()
      clearRoleCache(guildId)
      clearChannelCache(guildId)

      // --- AI-MODIFIED (2026-03-21) ---
      // Purpose: Count both scalar config changes AND list changes in the success toast.
      // Previously only counted config changes, so list-only edits (e.g. untracked channels)
      // showed "Saved 0 settings" making users think nothing was saved.
      const listChangeCount = Object.keys(lists).filter(
        (key) => JSON.stringify(lists[key]) !== JSON.stringify(originalLists[key])
      ).length
      const changeCount = changeDiff.length + listChangeCount
      toast.success(`Saved ${changeCount} setting${changeCount !== 1 ? "s" : ""} successfully`)
      // --- END AI-MODIFIED ---
    } catch {
      toast.error("Failed to save. Check your permissions.")
    }
    setSaving(false)
  }

  const handleReset = () => {
    if (original) setConfig({ ...original })
    if (originalLists) setLists({ ...originalLists })
  }

  // Preset application
  const applyPreset = (preset: Preset) => {
    for (const [key, value] of Object.entries(preset.values)) {
      set(key, value)
    }
    setPresetPreview(null)
    setShowPresets(false)
    toast.success(`Applied "${preset.name}" preset. Review and save when ready.`)
  }

  // Export
  const handleExport = async () => {
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/config?format=export`)
      if (!res.ok) throw new Error("Export failed")
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${config?.name || "server"}-settings.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Settings exported")
    } catch {
      toast.error("Failed to export settings")
    }
  }

  // Import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        setImportData(data)

        const diff: Array<{ key: string; from: any; to: any }> = []
        for (const key of Object.keys(data)) {
          if (key === "name" || key === "guildid" || key === "_exportedAt" || key === "_version") continue
          if (config && JSON.stringify(config[key]) !== JSON.stringify(data[key]) && key in SETTING_LABELS) {
            diff.push({ key, from: config[key], to: data[key] })
          }
        }
        setImportDiff(diff)
        setShowImportModal(true)
      } catch {
        toast.error("Invalid JSON file")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const applyImport = () => {
    if (!importData || !config) return
    const newConfig = { ...config }
    for (const key of Object.keys(importData)) {
      if (key === "name" || key === "guildid" || key === "_exportedAt" || key === "_version") continue
      if (key in DEFAULTS || key in (original || {})) {
        newConfig[key] = importData[key]
      }
    }
    setConfig(newConfig)

    const listKeys = ["untrackedVoiceChannels", "untrackedTextChannels", "autoroles", "botAutoroles", "unrankedRoles"]
    for (const key of listKeys) {
      if (key in importData && Array.isArray(importData[key])) {
        setList(key, importData[key])
      }
    }

    setShowImportModal(false)
    setImportData(null)
    toast.success("Import applied. Review and save when ready.")
  }

  // Danger zone actions
  const handleDangerAction = async () => {
    if (showDangerConfirm === "season") {
      set("season_start", new Date().toISOString())
      toast.success("Season start set to now. Save to apply.")
    } else if (showDangerConfirm === "reset") {
      for (const [key, value] of Object.entries(DEFAULTS)) {
        set(key, value)
      }
      toast.success("All settings reset to defaults. Save to apply.")
    }
    setShowDangerConfirm(null)
  }

  // Format a value for display in diff
  const formatValue = (v: any) => {
    if (v === null || v === undefined) return "None"
    if (typeof v === "boolean") return v ? "On" : "Off"
    if (typeof v === "string" && v.length > 40) return v.slice(0, 40) + "..."
    return String(v)
  }

  const ctx = contextData || {} as Record<string, number>

  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: calculated impact previews, dependency warnings, and setup progress
  const calcPreviews = useMemo(() => {
    if (!config) return {} as Record<string, string>
    const hr = config.study_hourly_reward ?? DEFAULTS.study_hourly_reward
    const cam = config.study_hourly_live_bonus ?? DEFAULTS.study_hourly_live_bonus
    const cap = config.daily_study_cap
    const taskR = config.task_reward ?? DEFAULTS.task_reward
    const taskL = config.task_reward_limit ?? DEFAULTS.task_reward_limit
    const rent = config.renting_price ?? DEFAULTS.renting_price
    const accP = config.accountability_price ?? DEFAULTS.accountability_price
    const accR = config.accountability_reward ?? DEFAULTS.accountability_reward
    const funds = config.starting_funds ?? DEFAULTS.starting_funds
    const minW = config.min_workout_length ?? DEFAULTS.min_workout_length
    const wReward = config.workout_reward ?? DEFAULTS.workout_reward

    const p: Record<string, string> = {}
    if (hr > 0) p.study_hourly_reward = `3 hours of study earns ~${(hr * 3).toLocaleString()} coins (${((hr + cam) * 3).toLocaleString()} with camera)`
    if (cam > 0 && hr > 0) p.study_hourly_live_bonus = `Camera adds ${Math.round((cam / hr) * 100)}% bonus on top of base reward`
    p.daily_study_cap = cap != null && hr > 0 ? `Caps daily study earnings at ~${(cap * hr).toLocaleString()} coins` : "No limit on daily study earnings"
    if (taskR > 0 && taskL > 0) p.task_reward = `Members can earn up to ${(taskR * taskL).toLocaleString()} coins/day from tasks`
    if (rent > 0 && hr > 0) p.renting_price = `Room owners need ~${Math.ceil(rent / hr)}h of study to cover daily rent`
    if (accP > 0 || accR > 0) {
      const profit = accR - accP
      p.accountability_price = profit >= 0 ? `Members profit ${profit.toLocaleString()} coins if they attend` : `Members lose ${Math.abs(profit).toLocaleString()} coins even when attending`
    }
    if (funds > 0 && rent > 0) p.starting_funds = `New members can afford ${Math.floor(funds / rent)} day${Math.floor(funds / rent) !== 1 ? "s" : ""} of room rent`
    if (wReward > 0 && minW > 0) p.workout_reward = `A ${minW}-minute workout earns ${wReward} coins`
    return p
  }, [config])

  const warnings = useMemo(() => {
    if (!config) return [] as Array<{ sectionId: string; message: string }>
    const hr = config.study_hourly_reward ?? DEFAULTS.study_hourly_reward
    const taskR = config.task_reward ?? DEFAULTS.task_reward
    const accP = config.accountability_price ?? DEFAULTS.accountability_price
    const accR = config.accountability_reward ?? DEFAULTS.accountability_reward
    const rent = config.renting_price ?? DEFAULTS.renting_price
    const funds = config.starting_funds ?? DEFAULTS.starting_funds
    const w: Array<{ sectionId: string; message: string }> = []
    if (hr > 200 && config.daily_study_cap == null) w.push({ sectionId: "study-rewards", message: "High hourly reward with no daily cap could lead to rapid coin inflation." })
    if (taskR > hr && hr > 0) w.push({ sectionId: "tasks", message: "Task reward is higher than hourly study reward -- members may prefer spamming tasks over studying." })
    if (config.allow_transfers !== false && funds > 100) w.push({ sectionId: "economy", message: "Transfers enabled with high starting funds -- members could create alt accounts to funnel coins." })
    if (config.video_studyban === false && (ctx.videoChannelCount ?? 0) > 0) w.push({ sectionId: "moderation", message: `Video study ban is off but you have ${ctx.videoChannelCount} video-required channels -- violations won't be penalized.` })
    if (accP > accR && accR > 0) w.push({ sectionId: "schedule", message: `Booking cost (${accP}) exceeds attendance reward (${accR}) -- members lose coins even when they attend.` })
    if (rent > 0 && hr === 0) w.push({ sectionId: "rooms", message: "Room rent costs coins but hourly study reward is 0 -- members can't earn coins to pay rent." })
    return w
  }, [config, ctx])

  const getWarnings = useCallback((sectionId: string) => warnings.filter((w) => w.sectionId === sectionId), [warnings])

  const REQUIRED_SELECTORS: Record<string, string[]> = {
    channels: ["event_log_channel", "mod_log_channel"],
    roles: ["admin_role", "mod_role"],
  }

  const setupStatuses = useMemo(() => {
    if (!config) return {} as Record<string, "defaults" | "configured" | "partial">
    const s: Record<string, "defaults" | "configured" | "partial"> = {}
    for (const sec of SECTION_DEFS) {
      if (sec.id === "danger") continue
      const req = REQUIRED_SELECTORS[sec.id]
      if (req) {
        const anyNull = req.some((k) => config[k] == null)
        const anySet = req.some((k) => config[k] != null) || sec.settings.some((k) => k in DEFAULTS && JSON.stringify(config[k]) !== JSON.stringify(DEFAULTS[k]))
        s[sec.id] = anySet ? (anyNull ? "partial" : "configured") : "defaults"
      } else if (sec.settings.length === 0) {
        s[sec.id] = "configured"
      } else {
        s[sec.id] = sec.settings.some((k) => k in DEFAULTS && JSON.stringify(config[k]) !== JSON.stringify(DEFAULTS[k])) ? "configured" : "defaults"
      }
    }
    return s
  }, [config])

  function badgeProps(sectionId: string, modCount?: number): { badge?: string; badgeVariant?: "primary" | "gray" | "amber" | "green" } {
    if (modCount) return { badge: `${modCount} modified`, badgeVariant: "primary" }
    const st = setupStatuses[sectionId]
    if (st === "partial") return { badge: "Needs setup", badgeVariant: "amber" }
    if (st === "defaults") return { badge: "All defaults", badgeVariant: "gray" }
    if (st === "configured") return { badge: "Configured", badgeVariant: "green" }
    return {}
  }

  function combineImpact(ctxText: string | undefined, calcKey: string): string | undefined {
    const parts = [ctxText, calcPreviews[calcKey]].filter(Boolean)
    return parts.length > 0 ? parts.join(" · ") : undefined
  }

  function WarningBanners({ sectionId }: { sectionId: string }) {
    const sectionWarnings = getWarnings(sectionId)
    if (sectionWarnings.length === 0) return null
    return (
      <div className="space-y-2 mb-3">
        {sectionWarnings.map((w, i) => (
          <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/90 leading-relaxed">{w.message}</p>
          </div>
        ))}
      </div>
    )
  }
  // --- END AI-MODIFIED ---

  return (
    <Layout SEO={{ title: `Settings - ${config?.name || "Server"} - LionBot`, description: "Server settings" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName={config?.name || "..."} isAdmin isMod />

            <SettingsNav
              sections={navSections}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <div className="flex-1 min-w-0">
              <PageHeader
                title="Server Settings"
                description="Configure how LionBot works in your server. Changes are saved when you click Save. Hover over question mark icons for details."
              />

              {/* Action bar: presets, import, export */}
              {!loading && config && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setShowPresets(!showPresets)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-card border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Wand2 size={14} />
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-card border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Upload size={14} />
                    Import
                  </button>
                  <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                  <button
                    type="button"
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-card border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download size={14} />
                    Export
                  </button>

                  {changeDiff.length > 0 && (
                    <span className="ml-auto text-xs text-amber-400 font-medium">
                      {changeDiff.length} unsaved change{changeDiff.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}

              {/* Presets panel */}
              {showPresets && (
                <div className="mb-4 bg-card/50 border border-border rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Quick Presets</h3>
                  <p className="text-xs text-muted-foreground mb-3">Apply a preset to fill recommended values. You can still review and modify before saving.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setPresetPreview(preset)}
                        className="text-left p-3 rounded-lg border border-border hover:border-primary/40 bg-background/50 hover:bg-accent/10 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <preset.icon size={16} className="text-primary" />
                          <span className="text-sm font-medium text-foreground">{preset.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{preset.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse">
                      <div className="h-5 bg-muted rounded w-1/4 mb-4" />
                      <div className="space-y-3">
                        <div className="h-10 bg-muted rounded" />
                        <div className="h-10 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !config ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">Unable to load settings. You may not have admin permissions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Study Rewards */}
                  {filteredSections.includes("study-rewards") && (
                    <div id="study-rewards">
                      <SectionCard
                        title="Study Rewards"
                        description="Control how members earn coins from studying"
                        icon={<BookOpen size={18} />}
                        {...badgeProps("study-rewards", modifiedCounts["study-rewards"])}
                      >
                        <WarningBanners sectionId="study-rewards" />
                        <SettingRow
                          label="Hourly Reward"
                          description="How many coins a member earns for each hour of study time"
                          tooltip="Members receive this amount of coins for every hour they spend in a voice study channel. Higher values encourage more study time."
                          defaultBadge={String(DEFAULTS.study_hourly_reward)}
                          isModified={isModified("study_hourly_reward")}
                          onReset={() => resetField("study_hourly_reward")}
                          impactText={combineImpact(ctx.activeMembersWeek ? `${ctx.activeMembersWeek} members studied this week` : undefined, "study_hourly_reward")}
                        >
                          <NumberInput value={config.study_hourly_reward} onChange={(v) => set("study_hourly_reward", v)} unit="coins/hr" min={0} defaultValue={DEFAULTS.study_hourly_reward} allowNull placeholder={`Default: ${DEFAULTS.study_hourly_reward}`} />
                        </SettingRow>
                        <SettingRow
                          label="Camera Bonus"
                          description="Extra coins per hour when studying with camera on"
                          tooltip="Members who turn on their camera while studying earn this bonus on top of the hourly reward. Great for accountability."
                          defaultBadge={String(DEFAULTS.study_hourly_live_bonus)}
                          isModified={isModified("study_hourly_live_bonus")}
                          onReset={() => resetField("study_hourly_live_bonus")}
                          impactText={calcPreviews.study_hourly_live_bonus}
                        >
                          <NumberInput value={config.study_hourly_live_bonus} onChange={(v) => set("study_hourly_live_bonus", v)} unit="coins/hr" min={0} defaultValue={DEFAULTS.study_hourly_live_bonus} allowNull placeholder={`Default: ${DEFAULTS.study_hourly_live_bonus}`} />
                        </SettingRow>
                        <SettingRow
                          label="Daily Study Cap"
                          description="Maximum hours of study that earn rewards per day"
                          tooltip="After this many hours of study in a day, members stop earning coins. Leave empty for no limit. Prevents coin inflation."
                          defaultBadge="No limit"
                          isModified={isModified("daily_study_cap")}
                          onReset={() => resetField("daily_study_cap")}
                          impactText={combineImpact(ctx.avgDailyStudyHours ? `Members average ${ctx.avgDailyStudyHours}h/day of study` : undefined, "daily_study_cap")}
                        >
                          <NumberInput value={config.daily_study_cap} onChange={(v) => set("daily_study_cap", v)} unit="hours" min={1} placeholder="No limit" allowNull />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Economy */}
                  {filteredSections.includes("economy") && (
                    <div id="economy">
                      <SectionCard
                        title="Economy"
                        description="Manage the server's coin economy"
                        icon={<Coins size={18} />}
                        {...badgeProps("economy", modifiedCounts["economy"])}
                      >
                        <WarningBanners sectionId="economy" />
                        <SettingRow
                          label="Starting Coins"
                          description="Coins given to new members when they join"
                          tooltip="Every new member starts with this many coins. Set to 0 if you want members to earn everything from scratch."
                          defaultBadge={String(DEFAULTS.starting_funds)}
                          isModified={isModified("starting_funds")}
                          onReset={() => resetField("starting_funds")}
                          impactText={combineImpact(ctx.totalCoins ? `${ctx.totalCoins.toLocaleString()} total coins in circulation` : undefined, "starting_funds")}
                        >
                          <NumberInput value={config.starting_funds} onChange={(v) => set("starting_funds", v)} unit="coins" min={0} defaultValue={DEFAULTS.starting_funds} allowNull placeholder={`Default: ${DEFAULTS.starting_funds}`} />
                        </SettingRow>
                        <SettingRow
                          label="Allow Transfers"
                          description="Let members send coins to each other"
                          tooltip="When enabled, members can use the /transfer command to give coins to other members. Disable if you want a closed economy."
                          isModified={isModified("allow_transfers")}
                          onReset={() => resetField("allow_transfers")}
                          impactText={ctx.transfersThisWeek ? `${ctx.transfersThisWeek} transfers this week` : undefined}
                        >
                          <Toggle checked={config.allow_transfers ?? true} onChange={(v) => set("allow_transfers", v)} />
                        </SettingRow>
                        <SettingRow
                          label="Coins per 100 XP"
                          description="How many coins 100 XP is worth"
                          tooltip="This sets the conversion rate between XP and coins. Higher values make coins easier to earn. XP is earned through voice study and text activity."
                          defaultBadge={String(DEFAULTS.coins_per_centixp)}
                          isModified={isModified("coins_per_centixp")}
                          onReset={() => resetField("coins_per_centixp")}
                        >
                          <NumberInput value={config.coins_per_centixp} onChange={(v) => set("coins_per_centixp", v)} unit="coins" min={0} defaultValue={DEFAULTS.coins_per_centixp} allowNull placeholder={`Default: ${DEFAULTS.coins_per_centixp}`} />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Tasks */}
                  {filteredSections.includes("tasks") && (
                    <div id="tasks">
                      <SectionCard
                        title="Tasks"
                        description="Task completion rewards and limits"
                        icon={<CheckSquare size={18} />}
                        {...badgeProps("tasks", modifiedCounts["tasks"])}
                      >
                        <WarningBanners sectionId="tasks" />
                        <SettingRow label="Max Tasks" description="Maximum number of tasks a member can have at once" tooltip="Limits how many to-do items each member can create." defaultBadge={String(DEFAULTS.max_tasks)} isModified={isModified("max_tasks")} onReset={() => resetField("max_tasks")}>
                          <NumberInput value={config.max_tasks} onChange={(v) => set("max_tasks", v)} min={1} max={100} defaultValue={DEFAULTS.max_tasks} allowNull placeholder={`Default: ${DEFAULTS.max_tasks}`} />
                        </SettingRow>
                        <SettingRow label="Task Reward" description="Coins earned when a member completes a task" defaultBadge={String(DEFAULTS.task_reward)} isModified={isModified("task_reward")} onReset={() => resetField("task_reward")} impactText={combineImpact(ctx.taskRewardsToday ? `${ctx.taskRewardsToday} task rewards given today` : undefined, "task_reward")}>
                          <NumberInput value={config.task_reward} onChange={(v) => set("task_reward", v)} unit="coins" min={0} defaultValue={DEFAULTS.task_reward} allowNull placeholder={`Default: ${DEFAULTS.task_reward}`} />
                        </SettingRow>
                        <SettingRow label="Daily Reward Limit" description="Max task rewards a member can earn per day" tooltip="Prevents members from farming coins by creating and completing many small tasks." defaultBadge={String(DEFAULTS.task_reward_limit)} isModified={isModified("task_reward_limit")} onReset={() => resetField("task_reward_limit")}>
                          <NumberInput value={config.task_reward_limit} onChange={(v) => set("task_reward_limit", v)} min={0} defaultValue={DEFAULTS.task_reward_limit} allowNull placeholder={`Default: ${DEFAULTS.task_reward_limit}`} />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Private Rooms */}
                  {filteredSections.includes("rooms") && (
                    <div id="rooms">
                      <SectionCard
                        title="Private Rooms"
                        description="Settings for rentable private study rooms"
                        icon={<Lock size={18} />}
                        {...badgeProps("rooms", modifiedCounts["rooms"])}
                      >
                        <WarningBanners sectionId="rooms" />
                        <SettingRow label="Daily Rent" description="Coins it costs to rent a private room per day" tooltip="Members pay this amount daily to keep their private study room." defaultBadge={String(DEFAULTS.renting_price)} isModified={isModified("renting_price")} onReset={() => resetField("renting_price")} impactText={combineImpact(ctx.activeRooms ? `${ctx.activeRooms} active rooms using this price` : undefined, "renting_price")}>
                          <NumberInput value={config.renting_price} onChange={(v) => set("renting_price", v)} unit="coins/day" min={0} defaultValue={DEFAULTS.renting_price} allowNull placeholder={`Default: ${DEFAULTS.renting_price}`} />
                        </SettingRow>
                        <SettingRow label="Max Members" description="Maximum people allowed in a private room" defaultBadge={String(DEFAULTS.renting_cap)} isModified={isModified("renting_cap")} onReset={() => resetField("renting_cap")}>
                          <NumberInput value={config.renting_cap} onChange={(v) => set("renting_cap", v)} min={1} defaultValue={DEFAULTS.renting_cap} allowNull placeholder={`Default: ${DEFAULTS.renting_cap}`} />
                        </SettingRow>
                        <SettingRow label="Visible to Others" description="Non-members can see private rooms (but can't join)" isModified={isModified("renting_visible")} onReset={() => resetField("renting_visible")}>
                          <Toggle checked={config.renting_visible ?? true} onChange={(v) => set("renting_visible", v)} />
                        </SettingRow>
                        <SettingRow label="Room Category" description="Discord category where private rooms are created" tooltip="New private study rooms will be created as voice channels under this category.">
                          <ChannelSelect guildId={guildId} value={config.renting_category ?? null} onChange={(v) => set("renting_category", (v as string) || null)} channelTypes={[4]} placeholder="Select room category" />
                        </SettingRow>
                        <SettingRow label="Sync Permissions" description="Sync room permissions with the category" isModified={isModified("renting_sync_perms")} onReset={() => resetField("renting_sync_perms")}>
                          <Toggle checked={config.renting_sync_perms ?? false} onChange={(v) => set("renting_sync_perms", v)} />
                        </SettingRow>
                        {/* --- AI-MODIFIED (2026-03-22) --- */}
                        {/* Purpose: New advanced room settings + link to admin rooms panel */}
                        <SettingRow label="Max Rooms Per User" description="Limit how many rooms one user can own (empty = unlimited)" isModified={isModified("renting_max_per_user")} onReset={() => resetField("renting_max_per_user")}>
                          <NumberInput value={config.renting_max_per_user} onChange={(v) => set("renting_max_per_user", v)} min={1} allowNull placeholder="No limit" />
                        </SettingRow>
                        <SettingRow label="Name Character Limit" description="Max characters for room names (empty = no limit)" isModified={isModified("renting_name_limit")} onReset={() => resetField("renting_name_limit")}>
                          <NumberInput value={config.renting_name_limit} onChange={(v) => set("renting_name_limit", v)} min={1} allowNull placeholder="No limit" />
                        </SettingRow>
                        <SettingRow label="Minimum Initial Deposit" description="Coins required upfront when renting a room" isModified={isModified("renting_min_deposit")} onReset={() => resetField("renting_min_deposit")}>
                          <NumberInput value={config.renting_min_deposit} onChange={(v) => set("renting_min_deposit", v)} min={0} allowNull placeholder="0" />
                        </SettingRow>
                        <SettingRow label="Auto-Extend" description="Automatically deduct from owner balance when room runs out" isModified={isModified("renting_auto_extend")} onReset={() => resetField("renting_auto_extend")}>
                          <Toggle checked={config.renting_auto_extend ?? false} onChange={(v) => set("renting_auto_extend", v)} />
                        </SettingRow>
                        <SettingRow label="Creation Cooldown" description="Seconds between room creations per user (empty = no cooldown)" isModified={isModified("renting_cooldown")} onReset={() => resetField("renting_cooldown")}>
                          <NumberInput value={config.renting_cooldown} onChange={(v) => set("renting_cooldown", v)} min={0} allowNull placeholder="No cooldown" unit="seconds" />
                        </SettingRow>
                        <div className="flex items-center justify-center gap-2 py-3 border-t border-border">
                          <Link href={`/dashboard/servers/${guildId}/rooms`}>
                            <a className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5">
                              Manage rooms and view analytics →
                            </a>
                          </Link>
                        </div>
                        {/* --- END AI-MODIFIED --- */}
                      </SectionCard>
                    </div>
                  )}

                  {/* Accountability Sessions */}
                  {filteredSections.includes("schedule") && (
                    <div id="schedule">
                      <SectionCard title="Accountability Sessions" description="Settings for scheduled group study sessions" icon={<Users size={18} />} {...badgeProps("schedule", modifiedCounts["schedule"])}>
                        <WarningBanners sectionId="schedule" />
                        <SettingRow label="Booking Cost" description="Coins to book a study session" tooltip="Members pay this to schedule a session. They get it back (plus rewards) if they attend." defaultBadge={String(DEFAULTS.accountability_price)} isModified={isModified("accountability_price")} onReset={() => resetField("accountability_price")} impactText={calcPreviews.accountability_price}>
                          <NumberInput value={config.accountability_price} onChange={(v) => set("accountability_price", v)} unit="coins" min={0} defaultValue={DEFAULTS.accountability_price} allowNull placeholder={`Default: ${DEFAULTS.accountability_price}`} />
                        </SettingRow>
                        <SettingRow label="Attendance Reward" description="Coins earned for attending a booked session" defaultBadge={String(DEFAULTS.accountability_reward)} isModified={isModified("accountability_reward")} onReset={() => resetField("accountability_reward")}>
                          <NumberInput value={config.accountability_reward} onChange={(v) => set("accountability_reward", v)} unit="coins" min={0} defaultValue={DEFAULTS.accountability_reward} allowNull placeholder={`Default: ${DEFAULTS.accountability_reward}`} />
                        </SettingRow>
                        <SettingRow label="Full Group Bonus" description="Extra coins when every booked member shows up" tooltip="All members in the session get this bonus if 100% attendance is achieved." defaultBadge={String(DEFAULTS.accountability_bonus)} isModified={isModified("accountability_bonus")} onReset={() => resetField("accountability_bonus")}>
                          <NumberInput value={config.accountability_bonus} onChange={(v) => set("accountability_bonus", v)} unit="coins" min={0} defaultValue={DEFAULTS.accountability_bonus} allowNull placeholder={`Default: ${DEFAULTS.accountability_bonus}`} />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Ranks */}
                  {filteredSections.includes("ranks") && (
                    <div id="ranks">
                      <SectionCard title="Ranks" description="Configure activity-based rank progression" icon={<Trophy size={18} />} {...badgeProps("ranks", modifiedCounts["ranks"])}>
                        <SettingRow label="Rank Type" description="Which activity drives rank progression" tooltip="XP: combines voice and text activity. Voice: only study time counts. Messages: only text messages count." defaultBadge={DEFAULTS.rank_type} isModified={isModified("rank_type")} onReset={() => resetField("rank_type")} impactText={ctx.rankUpsThisWeek ? `${ctx.rankUpsThisWeek} members currently ranked` : undefined}>
                          <SearchSelect options={RANK_TYPE_OPTIONS} value={config.rank_type || null} onChange={(v) => set("rank_type", v)} placeholder="Select rank type" />
                        </SettingRow>
                        <SettingRow label="DM Rank-Up Notifications" description="Send members a DM when they reach a new rank" isModified={isModified("dm_ranks")} onReset={() => resetField("dm_ranks")}>
                          <Toggle checked={config.dm_ranks ?? true} onChange={(v) => set("dm_ranks", v)} />
                        </SettingRow>
                        <SettingRow label="XP per Period" description="Voice XP earned per tracking interval" tooltip="Every few minutes in a voice channel, members earn this much XP." defaultBadge={String(DEFAULTS.xp_per_period)} isModified={isModified("xp_per_period")} onReset={() => resetField("xp_per_period")}>
                          <NumberInput value={config.xp_per_period} onChange={(v) => set("xp_per_period", v)} unit="XP" min={0} defaultValue={DEFAULTS.xp_per_period} allowNull placeholder={`Default: ${DEFAULTS.xp_per_period}`} />
                        </SettingRow>
                        <SettingRow label="Rank-Up Channel" description="Fallback channel for rank-up announcements" tooltip="When DM notifications fail, rank-up messages are sent here instead.">
                          <ChannelSelect guildId={guildId} value={config.rank_channel ?? null} onChange={(v) => set("rank_channel", (v as string) || null)} channelTypes={[0, 5]} placeholder="Select rank-up channel" />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Moderation */}
                  {filteredSections.includes("moderation") && (
                    <div id="moderation">
                      <SectionCard title="Moderation" description="Moderation and enforcement settings" icon={<Shield size={18} />} {...badgeProps("moderation", modifiedCounts["moderation"])}>
                        <WarningBanners sectionId="moderation" />
                        <SettingRow label="Video Study Ban" description="Ban members from study channels for camera violations" tooltip="When enabled, members who repeatedly disable their camera in video-required channels get temporarily banned from those channels." isModified={isModified("video_studyban")} onReset={() => resetField("video_studyban")} impactText={ctx.videoChannelCount ? `${ctx.videoChannelCount} video-required channels` : undefined}>
                          <Toggle checked={config.video_studyban ?? true} onChange={(v) => set("video_studyban", v)} />
                        </SettingRow>
                        <SettingRow label="Camera Grace Period" description="Seconds before a member is kicked for no camera" tooltip="When a member joins a video-required channel without camera, they get this many seconds to turn it on." defaultBadge={`${DEFAULTS.video_grace_period}s`} isModified={isModified("video_grace_period")} onReset={() => resetField("video_grace_period")}>
                          <NumberInput value={config.video_grace_period} onChange={(v) => set("video_grace_period", v)} unit="seconds" min={10} defaultValue={DEFAULTS.video_grace_period} allowNull placeholder={`Default: ${DEFAULTS.video_grace_period}`} />
                        </SettingRow>
                        <SettingRow label="Persist Roles" description="Restore member roles when they rejoin the server" tooltip="When a member leaves and comes back, LionBot will reassign the roles they had before." isModified={isModified("persist_roles")} onReset={() => resetField("persist_roles")}>
                          <Toggle checked={config.persist_roles ?? false} onChange={(v) => set("persist_roles", v)} />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* General */}
                  {filteredSections.includes("general") && (
                    <div id="general">
                      <SectionCard title="General" description="Language, timezone, and regional settings" icon={<Globe size={18} />} {...badgeProps("general", modifiedCounts["general"])}>
                        <SettingRow label="Timezone" description="Server timezone for schedules and time displays" defaultBadge="UTC" isModified={isModified("timezone")} onReset={() => resetField("timezone")}>
                          <div className="space-y-2">
                            <SearchSelect
                              options={
                                detectedTimezone && !TIMEZONE_OPTIONS.some((o) => o.value === detectedTimezone)
                                  ? [{ value: detectedTimezone, label: detectedTimezone.replace(/_/g, " ") }, ...TIMEZONE_OPTIONS]
                                  : TIMEZONE_OPTIONS
                              }
                              value={config.timezone || null}
                              onChange={(v) => set("timezone", v)}
                              placeholder="Select timezone"
                            />
                            {(!config.timezone || config.timezone === "") && detectedTimezone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Detected: {detectedTimezone.replace(/_/g, " ")}</span>
                                <button type="button" onClick={() => set("timezone", detectedTimezone)} className="text-primary hover:text-primary/90 font-medium">Use this</button>
                              </div>
                            )}
                          </div>
                        </SettingRow>
                        <SettingRow label="Language" description="Bot language for this server" defaultBadge="English" isModified={isModified("locale")} onReset={() => resetField("locale")}>
                          <SearchSelect options={LOCALE_OPTIONS} value={config.locale || null} onChange={(v) => set("locale", v)} placeholder="Select language" />
                        </SettingRow>
                        <SettingRow label="Force Language" description="Override individual member language preferences" tooltip="When enabled, all members see the server language regardless of their personal setting." isModified={isModified("force_locale")} onReset={() => resetField("force_locale")}>
                          <Toggle checked={config.force_locale ?? false} onChange={(v) => set("force_locale", v)} />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Welcome Messages */}
                  {filteredSections.includes("welcome") && (
                    <div id="welcome">
                      <SectionCard title="Welcome Messages" description="Greet new and returning members automatically" icon={<MessageSquare size={18} />} {...badgeProps("welcome", modifiedCounts["welcome"])}>
                        <SettingRow label="Greeting Channel" description="Channel where welcome messages are sent" tooltip="When a new member joins, the welcome/returning message is sent here.">
                          <ChannelSelect guildId={guildId} value={config.greeting_channel ?? null} onChange={(v) => set("greeting_channel", (v as string) || null)} channelTypes={[0, 5]} placeholder="Select greeting channel" />
                        </SettingRow>
                        <SettingRow label="Welcome Message" description="Sent when a new member joins. Use: {mention}, {user_name}, {server_name}" isModified={isModified("greeting_message")} onReset={() => resetField("greeting_message")}>
                          <div className="space-y-2">
                            <TextInput value={config.greeting_message || ""} onChange={(v) => set("greeting_message", v || null)} multiline rows={3} placeholder="Welcome to {server_name}, {mention}! Start studying to earn coins." maxLength={2000} />
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => set("greeting_message", `Welcome to {server_name}, {mention}! We're glad you're here. Start studying to earn coins and climb the leaderboard!`)} className="text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">Friendly</button>
                              <button type="button" onClick={() => set("greeting_message", "Hey {mention}, welcome! Use /profile to see your stats.")} className="text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">Simple</button>
                              <button type="button" onClick={() => set("greeting_message", "{mention} just joined {server_name}! Ready to level up your study game? Join a voice channel to start tracking your progress.")} className="text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">Motivational</button>
                            </div>
                            <DiscordEmbedPreview message={config.greeting_message || ""} serverName={config.name || "Your Server"} />
                          </div>
                        </SettingRow>
                        <SettingRow label="Returning Member Message" description="Sent when a member who previously left rejoins" isModified={isModified("returning_message")} onReset={() => resetField("returning_message")}>
                          <div className="space-y-2">
                            <TextInput value={config.returning_message || ""} onChange={(v) => set("returning_message", v || null)} multiline rows={3} placeholder="Welcome back, {mention}! Good to see you again." maxLength={2000} />
                            {config.returning_message && (
                              <DiscordEmbedPreview message={config.returning_message} serverName={config.name || "Your Server"} userName="ReturningMember" />
                            )}
                          </div>
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Workouts */}
                  {filteredSections.includes("workouts") && (
                    <div id="workouts">
                      <SectionCard title="Workouts" description="Workout tracking and rewards" icon={<Dumbbell size={18} />} {...badgeProps("workouts", modifiedCounts["workouts"])}>
                        <SettingRow label="Minimum Length" description="Shortest workout that counts for a reward" defaultBadge={`${DEFAULTS.min_workout_length} min`} isModified={isModified("min_workout_length")} onReset={() => resetField("min_workout_length")}>
                          <NumberInput value={config.min_workout_length} onChange={(v) => set("min_workout_length", v)} unit="minutes" min={1} defaultValue={DEFAULTS.min_workout_length} allowNull placeholder={`Default: ${DEFAULTS.min_workout_length}`} />
                        </SettingRow>
                        <SettingRow label="Workout Reward" description="Coins earned per workout session" defaultBadge={String(DEFAULTS.workout_reward)} isModified={isModified("workout_reward")} onReset={() => resetField("workout_reward")} impactText={calcPreviews.workout_reward}>
                          <NumberInput value={config.workout_reward} onChange={(v) => set("workout_reward", v)} unit="coins" min={0} defaultValue={DEFAULTS.workout_reward} allowNull placeholder={`Default: ${DEFAULTS.workout_reward}`} />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Channels */}
                  {filteredSections.includes("channels") && (
                    <div id="channels">
                      <SectionCard title="Channels" description="Log and notification channels" icon={<Hash size={18} />} {...badgeProps("channels", modifiedCounts["channels"])}>
                        <SettingRow label="Event Log Channel" description="Channel for audit-style event logs" tooltip="LionBot logs server events (joins, leaves, rank changes, etc.) to this channel.">
                          <ChannelSelect guildId={guildId} value={config.event_log_channel ?? null} onChange={(v) => set("event_log_channel", (v as string) || null)} channelTypes={[0, 5]} placeholder="Select event log channel" />
                        </SettingRow>
                        <SettingRow label="Moderation Log Channel" description="Channel for moderation record logs">
                          <ChannelSelect guildId={guildId} value={config.mod_log_channel ?? null} onChange={(v) => set("mod_log_channel", (v as string) || null)} channelTypes={[0, 5]} placeholder="Select mod log channel" />
                        </SettingRow>
                        <SettingRow label="Alert Channel" description="Channel for bot alerts and warnings">
                          <ChannelSelect guildId={guildId} value={config.alert_channel ?? null} onChange={(v) => set("alert_channel", (v as string) || null)} channelTypes={[0, 5]} placeholder="Select alert channel" />
                        </SettingRow>
                        <SettingRow label="Pomodoro Channel" description="Default channel for pomodoro timer notifications">
                          <ChannelSelect guildId={guildId} value={config.pomodoro_channel ?? null} onChange={(v) => set("pomodoro_channel", (v as string) || null)} channelTypes={[0, 5]} placeholder="Select pomodoro channel" />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Roles */}
                  {filteredSections.includes("roles") && (
                    <div id="roles">
                      <SectionCard title="Roles" description="Admin and moderator role assignments" icon={<UserCog size={18} />} {...badgeProps("roles", modifiedCounts["roles"])}>
                        <SettingRow label="Admin Role" description="Role that grants admin access to LionBot" tooltip="Members with this role can access all admin commands and dashboard settings.">
                          <RoleSelect guildId={guildId} value={config.admin_role ?? null} onChange={(v) => set("admin_role", (v as string) || null)} placeholder="Select admin role" excludeManaged excludeEveryone />
                        </SettingRow>
                        <SettingRow label="Moderator Role" description="Role that grants moderator access to LionBot" tooltip="Members with this role can access moderation commands and view member data.">
                          <RoleSelect guildId={guildId} value={config.mod_role ?? null} onChange={(v) => set("mod_role", (v as string) || null)} placeholder="Select moderator role" excludeManaged excludeEveryone />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Tracking (new) */}
                  {filteredSections.includes("tracking") && (
                    <div id="tracking">
                      <SectionCard title="Tracking Exclusions" description="Channels excluded from study and XP tracking" icon={<EyeOff size={18} />} {...badgeProps("tracking", modifiedCounts["tracking"])}>
                        <SettingRow
                          label="Untracked Voice Channels"
                          description="Voice channels where study time is not counted"
                          tooltip="Members in these channels won't earn coins or XP from studying. Useful for social/music channels."
                          impactText={ctx.untrackedVoiceCount !== undefined ? `${ctx.untrackedVoiceCount} channel${ctx.untrackedVoiceCount !== 1 ? "s" : ""} currently excluded` : undefined}
                        >
                          <ChannelSelect guildId={guildId} value={lists.untrackedVoiceChannels || []} onChange={(v) => setList("untrackedVoiceChannels", (v as string[]) || [])} channelTypes={[2, 13]} placeholder="Select channels to exclude" multiple />
                        </SettingRow>
                        <SettingRow
                          label="Untracked Text Channels"
                          description="Text channels where message XP is not counted"
                          tooltip="Messages in these channels won't earn XP. Useful for bot command channels or off-topic."
                          impactText={ctx.untrackedTextCount !== undefined ? `${ctx.untrackedTextCount} channel${ctx.untrackedTextCount !== 1 ? "s" : ""} currently excluded` : undefined}
                        >
                          <ChannelSelect guildId={guildId} value={lists.untrackedTextChannels || []} onChange={(v) => setList("untrackedTextChannels", (v as string[]) || [])} channelTypes={[0, 5, 15]} placeholder="Select channels to exclude" multiple />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Auto-Roles (new) */}
                  {filteredSections.includes("autoroles") && (
                    <div id="autoroles">
                      <SectionCard title="Auto-Roles" description="Roles automatically assigned to new members and bots" icon={<Bot size={18} />} {...badgeProps("autoroles", modifiedCounts["autoroles"])}>
                        <SettingRow
                          label="Member Auto-Roles"
                          description="Roles automatically given to new human members when they join"
                          tooltip="These roles are assigned immediately when a new member joins. Great for giving default access or ping roles."
                          impactText={ctx.autoroleCount !== undefined ? `${ctx.autoroleCount} autorole${ctx.autoroleCount !== 1 ? "s" : ""} configured` : undefined}
                        >
                          <RoleSelect guildId={guildId} value={lists.autoroles || []} onChange={(v) => setList("autoroles", (v as string[]) || [])} placeholder="Select roles for new members" multiple excludeManaged excludeEveryone />
                        </SettingRow>
                        <SettingRow
                          label="Bot Auto-Roles"
                          description="Roles automatically given to new bots when they are added"
                          tooltip="Useful for restricting or identifying bots with specific roles on join."
                        >
                          <RoleSelect guildId={guildId} value={lists.botAutoroles || []} onChange={(v) => setList("botAutoroles", (v as string[]) || [])} placeholder="Select roles for new bots" multiple excludeEveryone />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Season & Stats (extended) */}
                  {filteredSections.includes("statistics") && (
                    <div id="statistics">
                      <SectionCard title="Season & Statistics" description="Season tracking, text XP, and leaderboard settings" icon={<BarChart3 size={18} />} {...badgeProps("statistics", modifiedCounts["statistics"])}>
                        <SettingRow label="Season Start Date" description="When the current ranking season started" tooltip="Leaderboards and rank progress are reset at the start of each season. Set a date to begin a new season, or leave empty for all-time tracking." isModified={isModified("season_start")} onReset={() => resetField("season_start")}>
                          <input
                            type="date"
                            value={config.season_start ? new Date(config.season_start).toISOString().split("T")[0] : ""}
                            onChange={(e) => set("season_start", e.target.value ? new Date(e.target.value).toISOString() : null)}
                            className="bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </SettingRow>
                        <SettingRow label="XP per Word" description="Text XP earned per word in messages" tooltip="Members earn this much XP for every word in their messages. Higher values make text activity more rewarding." isModified={isModified("xp_per_centiword")} onReset={() => resetField("xp_per_centiword")}>
                          <NumberInput value={config.xp_per_centiword} onChange={(v) => set("xp_per_centiword", v)} unit="XP/word" min={0} allowNull />
                        </SettingRow>
                        <SettingRow
                          label="Unranked Roles"
                          description="Roles hidden from the leaderboard"
                          tooltip="Members with any of these roles won't appear on the server leaderboard. Useful for moderators or bots."
                          impactText={ctx.unrankedRoleCount !== undefined ? `${ctx.unrankedRoleCount} role${ctx.unrankedRoleCount !== 1 ? "s" : ""} currently hidden` : undefined}
                        >
                          <RoleSelect guildId={guildId} value={lists.unrankedRoles || []} onChange={(v) => setList("unrankedRoles", (v as string[]) || [])} placeholder="Select roles to hide from leaderboard" multiple excludeEveryone />
                        </SettingRow>
                      </SectionCard>
                    </div>
                  )}

                  {/* Danger Zone */}
                  {filteredSections.includes("danger") && (
                    <div id="danger">
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-red-500/20">
                          <div className="flex items-center gap-3">
                            <AlertTriangle size={18} className="text-red-400" />
                            <div>
                              <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
                              <p className="text-xs text-muted-foreground">Destructive actions that cannot be easily undone</p>
                            </div>
                          </div>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                          <div className="flex items-center justify-between gap-4 py-3 border-b border-border/50">
                            <div>
                              <p className="text-sm font-medium text-foreground/90">Reset Season</p>
                              <p className="text-xs text-muted-foreground">Set the season start to now. Leaderboard rankings will be recalculated from this point.</p>
                              {ctx.totalMembers && (
                                <p className="text-[11px] text-red-400/60 mt-0.5">This affects {ctx.totalMembers} members</p>
                              )}
                            </div>
                            <button type="button" onClick={() => setShowDangerConfirm("season")} className="flex-shrink-0 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
                              Reset Season
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-foreground/90">Reset All Settings</p>
                              <p className="text-xs text-muted-foreground">Revert every setting on this page back to LionBot defaults. You must still click Save to apply.</p>
                            </div>
                            <button type="button" onClick={() => setShowDangerConfirm("reset")} className="flex-shrink-0 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
                              Reset All
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Save bar with diff summary */}
              <SaveBar
                show={!!hasChanges}
                onSave={handleSave}
                onReset={handleReset}
                saving={saving}
                label={changeDiff.length > 0
                  ? `${changeDiff.length} change${changeDiff.length !== 1 ? "s" : ""}: ${changeDiff.slice(0, 3).map((d) => `${SETTING_LABELS[d.key] || d.key} ${formatValue(d.from)} → ${formatValue(d.to)}`).join(", ")}${changeDiff.length > 3 ? ` +${changeDiff.length - 3} more` : ""}`
                  : listsHaveChanges ? "List settings changed" : undefined}
              />
            </div>
          </div>
        </div>

        {/* Preset preview modal */}
        <ConfirmModal
          open={!!presetPreview}
          onConfirm={() => presetPreview && applyPreset(presetPreview)}
          onCancel={() => setPresetPreview(null)}
          title={`Apply "${presetPreview?.name}" Preset`}
          message={presetPreview ? `This will change ${Object.keys(presetPreview.values).length} settings:\n\n${Object.entries(presetPreview.values).map(([k, v]) => `• ${SETTING_LABELS[k] || k}: ${formatValue(v)}`).join("\n")}\n\nYou can still review and modify before saving.` : ""}
          confirmLabel="Apply Preset"
          variant="info"
        />

        {/* Import diff modal */}
        <ConfirmModal
          open={showImportModal}
          onConfirm={applyImport}
          onCancel={() => { setShowImportModal(false); setImportData(null) }}
          title="Import Settings"
          message={importDiff.length > 0
            ? `This import will change ${importDiff.length} setting${importDiff.length !== 1 ? "s" : ""}:\n\n${importDiff.slice(0, 10).map((d) => `• ${SETTING_LABELS[d.key] || d.key}: ${formatValue(d.from)} → ${formatValue(d.to)}`).join("\n")}${importDiff.length > 10 ? `\n\n...and ${importDiff.length - 10} more` : ""}\n\nYou can still review and modify before saving.`
            : "No differences found between the import file and current settings."}
          confirmLabel="Apply Import"
          variant="info"
        />

        {/* Danger zone confirmation */}
        <ConfirmModal
          open={!!showDangerConfirm}
          onConfirm={handleDangerAction}
          onCancel={() => setShowDangerConfirm(null)}
          title={showDangerConfirm === "season" ? "Reset Season?" : "Reset All Settings?"}
          message={showDangerConfirm === "season"
            ? `This will set the season start to right now. Leaderboard rankings will be recalculated from this point forward.${ctx.totalMembers ? ` This affects ${ctx.totalMembers} members.` : ""} The change is not applied until you save.`
            : "This will revert every setting on this page back to LionBot defaults. The changes are not applied until you save, so you can review them first."}
          confirmLabel={showDangerConfirm === "season" ? "Reset Season" : "Reset All Settings"}
          variant="danger"
        />
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
