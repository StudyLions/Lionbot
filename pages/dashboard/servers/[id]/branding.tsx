// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Branding Command Center - comprehensive skin editor
//          with bot-rendered live previews for all 7 card types,
//          supporter-first UX, color harmony, undo/redo
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader,
  SectionCard,
  SaveBar,
  toast,
} from "@/components/dashboard/ui"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import {
  Paintbrush, Heart, Crown, Sparkles, User, BarChart3,
  CalendarDays, CalendarRange, Target, Trophy, LayoutList,
  RotateCcw, Undo2, Redo2, Copy, Palette, ChevronDown,
  ChevronRight, Eye, EyeOff, Loader2, AlertTriangle, X,
} from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"
import { getDefaultColor } from "@/lib/skinDefaults"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// ── Card type definitions ──

interface CardTypeDef {
  id: string
  label: string
  icon: React.ReactNode
  groups: PropertyGroup[]
}

interface PropertyGroup {
  id: string
  label: string
  properties: PropertyDef[]
}

interface PropertyDef {
  key: string
  label: string
  compound?: string[]
}

const CARD_TYPES: CardTypeDef[] = [
  {
    id: "profile",
    label: "Profile",
    icon: <User size={14} />,
    groups: [
      {
        id: "profile-titles",
        label: "Title Colours",
        properties: [
          { key: "header_colour_1", label: "Username" },
          { key: "header_colour_2", label: "Discriminator" },
          { key: "subheader_colour", label: "Column Header" },
        ],
      },
      {
        id: "profile-badges",
        label: "Badge Colours",
        properties: [
          { key: "badge_text_colour", label: "Badge Text" },
          { key: "badge_blob_colour", label: "Badge Background" },
        ],
      },
      {
        id: "profile-progress",
        label: "Progress Bar",
        properties: [
          { key: "rank_name_colour", label: "Current Rank" },
          { key: "rank_hours_colour", label: "Required Hours" },
          { key: "next_rank_colour", label: "Next Rank" },
          { key: "bar_full_colour", label: "Bar Full" },
          { key: "bar_empty_colour", label: "Bar Empty" },
        ],
      },
      {
        id: "profile-counters",
        label: "Counter Colours",
        properties: [
          { key: "counter_colour", label: "Text" },
          { key: "counter_bg_colour", label: "Background" },
        ],
      },
    ],
  },
  {
    id: "stats",
    label: "Stats",
    icon: <BarChart3 size={14} />,
    groups: [
      {
        id: "stats-text",
        label: "Text Colours",
        properties: [
          { key: "header_colour", label: "Titles" },
          { key: "stats_subheader_colour", label: "Sections" },
          { key: "stats_text_colour", label: "Statistics" },
          { key: "col2_date_colour", label: "Date" },
          { key: "col2_hours_colour", label: "Hours" },
        ],
      },
      {
        id: "stats-cal",
        label: "Calendar Colours",
        properties: [
          { key: "cal_weekday_colour", label: "Weekdays" },
          { key: "cal_number_colour", label: "Numbers" },
          { key: "cal_number_end_colour", label: "Streak Ends" },
          { key: "cal_streak_middle_colour", label: "Streak Background" },
          { key: "cal_streak_end_colour", label: "Streak End BG" },
        ],
      },
    ],
  },
  {
    id: "weekly_stats",
    label: "Weekly Stats",
    icon: <CalendarDays size={14} />,
    groups: [
      {
        id: "weekly-top",
        label: "Top Graph",
        properties: [
          { key: "top_hours_colour", label: "Hours" },
          { key: "top_weekday_colour", label: "Weekdays" },
          { key: "top_date_colour", label: "Dates" },
          { key: "top_this_colour", label: "This Week" },
          { key: "top_last_colour", label: "Last Week" },
        ],
      },
      {
        id: "weekly-bottom",
        label: "Bottom Graph",
        properties: [
          { key: "btm_weekday_colour", label: "Weekdays" },
          { key: "btm_day_colour", label: "Hours" },
          { key: "btm_this_colour", label: "This Week" },
          { key: "btm_last_colour", label: "Last Week" },
          { key: "btm_bar_horiz_colour", label: "Horizontal Bars" },
        ],
      },
      {
        id: "weekly-misc",
        label: "Miscellaneous",
        properties: [
          { key: "title_colour", label: "Title" },
          { key: "this_week_colour", label: "This Week Legend", compound: ["last_week_colour"] },
          { key: "footer_colour", label: "Footer" },
        ],
      },
    ],
  },
  {
    id: "monthly_stats",
    label: "Monthly Stats",
    icon: <CalendarRange size={14} />,
    groups: [
      {
        id: "monthly-top",
        label: "Top Graph",
        properties: [
          { key: "top_hours_colour", label: "Hours" },
          { key: "top_hours_bg_colour", label: "Hours BG" },
          { key: "top_date_colour", label: "Days" },
          { key: "top_line_colour", label: "Lines" },
        ],
      },
      {
        id: "monthly-hours",
        label: "Hours",
        properties: [
          { key: "top_this_colour", label: "This Month Bar" },
          { key: "top_this_hours_colour", label: "This Month Hours" },
          { key: "top_last_colour", label: "Last Month Bar" },
          { key: "top_last_hours_colour", label: "Last Month Hours" },
        ],
      },
      {
        id: "monthly-heatmap",
        label: "Heatmap",
        properties: [
          { key: "weekday_background_colour", label: "Weekday BG" },
          { key: "weekday_colour", label: "Weekdays" },
          { key: "month_background_colour", label: "Month BG" },
          { key: "month_colour", label: "Months" },
        ],
      },
      {
        id: "monthly-misc",
        label: "Miscellaneous",
        properties: [
          { key: "title_colour", label: "Title" },
          { key: "this_month_colour", label: "This Month Legend", compound: ["last_month_colour"] },
          { key: "stats_key_colour", label: "Statistics Key", compound: ["stats_value_colour"] },
          { key: "footer_colour", label: "Footer" },
        ],
      },
    ],
  },
  {
    id: "weekly_goals",
    label: "Weekly Goals",
    icon: <Target size={14} />,
    groups: [
      {
        id: "weeklygoal-profile",
        label: "Mini Profile",
        properties: [
          { key: "mini_profile_name_colour", label: "Username" },
          { key: "mini_profile_discrim_colour", label: "Discriminator" },
          { key: "mini_profile_badge_colour", label: "Badge BG" },
          { key: "mini_profile_badge_text_colour", label: "Badge Text" },
        ],
      },
      {
        id: "weeklygoal-progress",
        label: "Progress",
        properties: [
          { key: "progress_bg_colour", label: "Bar Background" },
          { key: "progress_colour", label: "Bar Fill" },
          { key: "attendance_colour", label: "Text", compound: ["task_done_colour", "studied_text_colour", "task_goal_colour"] },
          { key: "attendance_rate_colour", label: "Highlight Text", compound: ["task_count_colour", "studied_hour_colour"] },
          { key: "task_goal_number_colour", label: "Task Goal" },
        ],
      },
      {
        id: "weeklygoal-tasks",
        label: "Tasks",
        properties: [
          { key: "task_done_number_colour", label: "Checked Number" },
          { key: "task_undone_number_colour", label: "Unchecked Number" },
          { key: "task_done_text_colour", label: "Checked Text" },
          { key: "task_undone_text_colour", label: "Unchecked Text" },
        ],
      },
      {
        id: "weeklygoal-misc",
        label: "Miscellaneous",
        properties: [
          { key: "title_colour", label: "Title" },
          { key: "footer_colour", label: "Footer" },
        ],
      },
    ],
  },
  {
    id: "monthly_goals",
    label: "Monthly Goals",
    icon: <Target size={14} />,
    groups: [
      {
        id: "monthlygoal-profile",
        label: "Mini Profile",
        properties: [
          { key: "mini_profile_name_colour", label: "Username" },
          { key: "mini_profile_discrim_colour", label: "Discriminator" },
          { key: "mini_profile_badge_colour", label: "Badge BG" },
          { key: "mini_profile_badge_text_colour", label: "Badge Text" },
        ],
      },
      {
        id: "monthlygoal-progress",
        label: "Progress",
        properties: [
          { key: "progress_bg_colour", label: "Bar Background" },
          { key: "progress_colour", label: "Bar Fill" },
          { key: "attendance_colour", label: "Text", compound: ["task_done_colour", "studied_text_colour", "task_goal_colour"] },
          { key: "attendance_rate_colour", label: "Highlight Text", compound: ["task_count_colour", "studied_hour_colour"] },
          { key: "task_goal_number_colour", label: "Task Goal" },
        ],
      },
      {
        id: "monthlygoal-tasks",
        label: "Tasks",
        properties: [
          { key: "task_done_number_colour", label: "Checked Number" },
          { key: "task_undone_number_colour", label: "Unchecked Number" },
          { key: "task_done_text_colour", label: "Checked Text" },
          { key: "task_undone_text_colour", label: "Unchecked Text" },
        ],
      },
      {
        id: "monthlygoal-misc",
        label: "Miscellaneous",
        properties: [
          { key: "title_colour", label: "Title" },
          { key: "footer_colour", label: "Footer" },
        ],
      },
    ],
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: <Trophy size={14} />,
    groups: [
      {
        id: "leaderboard-top",
        label: "Top 3",
        properties: [
          { key: "top_position_colour", label: "Position" },
          { key: "top_name_colour", label: "Name" },
          { key: "top_hours_colour", label: "Hours" },
        ],
      },
      {
        id: "leaderboard-text",
        label: "Entry Text",
        properties: [
          { key: "entry_position_colour", label: "Position" },
          { key: "entry_position_highlight_colour", label: "Position (Highlight)" },
          { key: "entry_name_colour", label: "Name" },
          { key: "entry_hours_colour", label: "Hours" },
        ],
      },
      {
        id: "leaderboard-bg",
        label: "Entry Background",
        properties: [
          { key: "entry_bg_colour", label: "Regular" },
          { key: "entry_bg_highlight_colour", label: "Highlighted" },
        ],
      },
      {
        id: "leaderboard-misc",
        label: "Miscellaneous",
        properties: [
          { key: "header_text_colour", label: "Header" },
          { key: "subheader_name_colour", label: "Sub-Header Name", compound: ["subheader_value_colour"] },
        ],
      },
    ],
  },
]

const AVAILABLE_SKINS = [
  "original", "obsidian", "platinum", "boston_blue",
  "cotton_candy", "blue_bayoux", "bubblegum",
]

const SKIN_COLORS: Record<string, [string, string]> = {
  original: ["#1473A2", "#051822"],
  obsidian: ["#2D2D3F", "#1A1A2E"],
  platinum: ["#C0C0C0", "#808080"],
  boston_blue: ["#3B82C4", "#1E3A5F"],
  cotton_candy: ["#FFB6C1", "#E6A0B0"],
  blue_bayoux: ["#4F7B8A", "#2D4A54"],
  bubblegum: ["#FF69B4", "#CC5490"],
}

interface BrandingData {
  isPremium: boolean
  premiumUntil: string | null
  baseSkinName: string | null
  properties: Record<string, Record<string, string>>
  availableSkins: string[]
}

interface HistoryEntry {
  baseSkinName: string
  properties: Record<string, Record<string, string>>
}

const PREMIUM_PLANS = [
  { id: "monthly", name: "Monthly", gems: 1500, duration: "30 days" },
  { id: "quarterly", name: "Quarterly", gems: 4000, duration: "90 days", popular: true },
  { id: "yearly", name: "Yearly", gems: 12000, duration: "365 days", save: "17%" },
]

function generatePalette(accent: string): Record<string, string> {
  const hex = accent.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const lighten = (amt: number) => {
    const nr = Math.min(255, r + amt)
    const ng = Math.min(255, g + amt)
    const nb = Math.min(255, b + amt)
    return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`.toUpperCase()
  }
  const darken = (amt: number) => lighten(-amt)
  const complement = () => {
    return `#${(255 - r).toString(16).padStart(2, "0")}${(255 - g).toString(16).padStart(2, "0")}${(255 - b).toString(16).padStart(2, "0")}`.toUpperCase()
  }

  return {
    primary: accent.toUpperCase(),
    light: lighten(60),
    lighter: lighten(100),
    dark: darken(40),
    darker: darken(80),
    complement: complement(),
    muted: lighten(120),
  }
}

export default function BrandingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  const { data: brandingData, isLoading: brandingLoading, mutate } = useDashboard<BrandingData>(
    id && session ? `/api/dashboard/servers/${id}/branding` : null
  )
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const { data: permData } = useDashboard<{ isAdmin: boolean; isModerator: boolean }>(
    id && session ? `/api/dashboard/servers/${id}/permissions` : null
  )

  const serverName = serverData?.server?.name || "Server"
  const isAdmin = permData?.isAdmin ?? false

  const [activeCardType, setActiveCardType] = useState("profile")
  const [baseSkinName, setBaseSkinName] = useState("obsidian")
  const [properties, setProperties] = useState<Record<string, Record<string, string>>>({})
  const [original, setOriginal] = useState<HistoryEntry | null>(null)
  const [saving, setSaving] = useState(false)
  const [upsellOpen, setUpsellOpen] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [showBefore, setShowBefore] = useState(false)
  const [paletteAccent, setPaletteAccent] = useState("")
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [copyFrom, setCopyFrom] = useState("")

  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const historyTimer = useRef<NodeJS.Timeout | null>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const previewTimer = useRef<NodeJS.Timeout | null>(null)
  const previewAbort = useRef<AbortController | null>(null)

  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: persist draft designs in localStorage so non-supporters don't lose progress
  const draftKey = guildId ? `lionbot-branding-draft-${guildId}` : null

  const saveDraft = useCallback((skin: string, props: Record<string, Record<string, string>>) => {
    if (!draftKey) return
    try {
      localStorage.setItem(draftKey, JSON.stringify({ baseSkinName: skin, properties: props, savedAt: Date.now() }))
    } catch {}
  }, [draftKey])

  const loadDraft = useCallback((): HistoryEntry | null => {
    if (!draftKey) return null
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (parsed.baseSkinName && parsed.properties) return parsed
    } catch {}
    return null
  }, [draftKey])

  const clearDraft = useCallback(() => {
    if (!draftKey) return
    try { localStorage.removeItem(draftKey) } catch {}
  }, [draftKey])

  useEffect(() => {
    if (brandingData) {
      const serverBase = brandingData.baseSkinName || "obsidian"
      const serverProps = brandingData.properties || {}

      setOriginal({ baseSkinName: serverBase, properties: serverProps })

      const draft = loadDraft()
      if (draft && JSON.stringify(draft.properties) !== JSON.stringify(serverProps)) {
        setBaseSkinName(draft.baseSkinName)
        setProperties(draft.properties)
        setHistory([
          { baseSkinName: serverBase, properties: serverProps },
          { baseSkinName: draft.baseSkinName, properties: draft.properties },
        ])
        setHistoryIndex(1)
        toast.success("Restored your unsaved design from last visit")
      } else {
        setBaseSkinName(serverBase)
        setProperties(serverProps)
        setHistory([{ baseSkinName: serverBase, properties: serverProps }])
        setHistoryIndex(0)
      }
    }
  }, [brandingData])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: auto-save draft to localStorage on every change
  const draftSaveTimer = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (!original) return
    if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current)
    draftSaveTimer.current = setTimeout(() => {
      saveDraft(baseSkinName, properties)
    }, 1000)
    return () => { if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current) }
  }, [baseSkinName, properties, original, saveDraft])
  // --- END AI-MODIFIED ---

  const pushHistory = useCallback((newState: HistoryEntry) => {
    if (historyTimer.current) clearTimeout(historyTimer.current)
    historyTimer.current = setTimeout(() => {
      setHistory((prev) => {
        const truncated = prev.slice(0, historyIndex + 1)
        const next = [...truncated, { baseSkinName: newState.baseSkinName, properties: JSON.parse(JSON.stringify(newState.properties)) }]
        if (next.length > 50) next.shift()
        return next
      })
      setHistoryIndex((prev) => Math.min(prev + 1, 50))
    }, 500)
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const entry = history[historyIndex - 1]
      setBaseSkinName(entry.baseSkinName)
      setProperties(JSON.parse(JSON.stringify(entry.properties)))
      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const entry = history[historyIndex + 1]
      setBaseSkinName(entry.baseSkinName)
      setProperties(JSON.parse(JSON.stringify(entry.properties)))
      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo])

  const setProp = useCallback((cardId: string, key: string, value: string, compound?: string[]) => {
    setProperties((prev) => {
      const next = { ...prev, [cardId]: { ...prev[cardId], [key]: value } }
      if (compound) {
        for (const ck of compound) {
          next[cardId][ck] = value
        }
      }
      return next
    })
    pushHistory({ baseSkinName, properties: { ...properties, [cardId]: { ...properties[cardId], [key]: value } } })
  }, [baseSkinName, properties, pushHistory])

  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: reset individual property to base skin default
  const resetProp = useCallback((cardId: string, key: string, compound?: string[]) => {
    setProperties((prev) => {
      const next = { ...prev }
      if (next[cardId]) {
        next[cardId] = { ...next[cardId] }
        delete next[cardId][key]
        if (compound) {
          for (const ck of compound) delete next[cardId][ck]
        }
        if (Object.keys(next[cardId]).length === 0) delete next[cardId]
      }
      return next
    })
    const newProps = JSON.parse(JSON.stringify(properties))
    if (newProps[cardId]) {
      delete newProps[cardId][key]
      if (compound) {
        for (const ck of compound) delete newProps[cardId][ck]
      }
      if (Object.keys(newProps[cardId]).length === 0) delete newProps[cardId]
    }
    pushHistory({ baseSkinName, properties: newProps })
  }, [baseSkinName, properties, pushHistory])
  // --- END AI-MODIFIED ---

  const handleBaseSkinChange = useCallback((skin: string) => {
    setBaseSkinName(skin)
    pushHistory({ baseSkinName: skin, properties })
  }, [properties, pushHistory])

  const activeCard = CARD_TYPES.find((c) => c.id === activeCardType)!
  const cardProperties = properties[activeCardType] || {}

  const hasChanges = original && (
    baseSkinName !== original.baseSkinName ||
    JSON.stringify(properties) !== JSON.stringify(original.properties)
  )

  const cardChangeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const ct of CARD_TYPES) {
      const orig = original?.properties[ct.id] || {}
      const curr = properties[ct.id] || {}
      let count = 0
      const allKeys = Array.from(new Set([...Object.keys(orig), ...Object.keys(curr)]))
      for (const k of allKeys) {
        if (orig[k] !== curr[k]) count++
      }
      counts[ct.id] = count
    }
    return counts
  }, [properties, original])

  // ── Live preview rendering ──

  const fetchPreview = useCallback(async (cardType: string, skin: string, props: Record<string, string>) => {
    if (previewAbort.current) previewAbort.current.abort()
    const controller = new AbortController()
    previewAbort.current = controller

    setPreviewLoading(true)
    setPreviewError(false)

    try {
      const resp = await fetch("/api/dashboard/card-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: cardType, skin, properties: props }),
        signal: controller.signal,
      })

      if (!resp.ok) throw new Error("render failed")

      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)

      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
      setPreviewError(false)
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setPreviewError(true)
      }
    } finally {
      setPreviewLoading(false)
    }
  }, [])

  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current)
    previewTimer.current = setTimeout(() => {
      const props = showBefore ? {} : (properties[activeCardType] || {})
      fetchPreview(activeCardType, baseSkinName, props)
    }, 800)
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current)
    }
  }, [activeCardType, baseSkinName, properties, showBefore, fetchPreview])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [])

  // ── Actions ──

  const handleSave = async () => {
    if (!hasChanges) return
    if (!brandingData?.isPremium) {
      setUpsellOpen(true)
      return
    }
    setSaving(true)
    try {
      await dashboardMutate("PATCH", `/api/dashboard/servers/${id}/branding`, {
        baseSkinName,
        properties,
      })
      setOriginal({ baseSkinName, properties: JSON.parse(JSON.stringify(properties)) })
      clearDraft()
      mutate()
      toast.success("Branding saved! Changes will apply to new card renders.")
    } catch {
      toast.error("Failed to save branding")
    }
    setSaving(false)
  }

  const handleReset = () => {
    if (original) {
      setBaseSkinName(original.baseSkinName)
      setProperties(JSON.parse(JSON.stringify(original.properties)))
    }
  }

  const handleResetCardType = () => {
    setProperties((prev) => {
      const next = { ...prev }
      delete next[activeCardType]
      return next
    })
    pushHistory({ baseSkinName, properties: { ...properties, [activeCardType]: {} } })
  }

  const handleCopyFrom = (sourceCardId: string) => {
    const sourceProps = properties[sourceCardId] || {}
    setProperties((prev) => ({
      ...prev,
      [activeCardType]: { ...sourceProps },
    }))
    pushHistory({ baseSkinName, properties: { ...properties, [activeCardType]: { ...sourceProps } } })
    setCopyFrom("")
    toast.success(`Copied colors from ${CARD_TYPES.find((c) => c.id === sourceCardId)?.label}`)
  }

  const handleApplyPalette = (palette: Record<string, string>) => {
    const colors = Object.values(palette)
    const cardDef = activeCard
    let idx = 0
    const newProps: Record<string, string> = { ...cardProperties }
    for (const group of cardDef.groups) {
      for (const prop of group.properties) {
        newProps[prop.key] = colors[idx % colors.length]
        if (prop.compound) {
          for (const ck of prop.compound) {
            newProps[ck] = colors[idx % colors.length]
          }
        }
        idx++
      }
    }
    setProperties((prev) => ({ ...prev, [activeCardType]: newProps }))
    pushHistory({ baseSkinName, properties: { ...properties, [activeCardType]: newProps } })
    setPaletteOpen(false)
    toast.success("Palette applied!")
  }

  const handlePurchase = async (plan: string) => {
    setPurchasing(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/premium`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Purchase failed")
      setUpsellOpen(false)
      mutate()
      invalidate(`/api/dashboard/servers/${id}/branding`)
      invalidate("/api/dashboard/gems")
      toast.success(`Thank you for supporting LionBot! Premium active until ${new Date(data.premiumUntil).toLocaleDateString()}`)
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Purchase failed")
    } finally {
      setPurchasing(false)
    }
  }

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  // ── Loading state ──

  if (brandingLoading && !brandingData) {
    return (
      <Layout SEO={{ title: "Branding - LionBot", description: "Server branding editor" }}>
        <AdminGuard>
          <ServerGuard requiredLevel="admin">
          <div className="min-h-screen bg-background pt-6 pb-20 px-4">
            <div className="max-w-7xl mx-auto flex gap-8">
              <ServerNav serverId={guildId} serverName={serverName} isAdmin={isAdmin} isMod />
              <div className="flex-1 min-w-0">
                <div className="h-8 bg-muted rounded w-48 animate-pulse mb-4" />
                <div className="h-12 bg-muted/50 rounded-xl animate-pulse mb-6" />
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
                  <div className="space-y-4">
                    <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
                    <div className="h-48 bg-muted/50 rounded-xl animate-pulse" />
                  </div>
                  <div className="h-[500px] bg-muted/30 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          </ServerGuard>
        </AdminGuard>
      </Layout>
    )
  }

  // ── Main render ──

  return (
    <Layout
      SEO={{
        title: `Branding - ${serverName} - LionBot`,
        description: "Customize your server's card colors and themes",
      }}
    >
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-7xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName={serverName} isAdmin={isAdmin} isMod />
            <div className="flex-1 min-w-0">
              <PageHeader
                title="Server Branding"
                description="Customize all card types your members see -- profile, stats, leaderboards, and more."
              />

              {/* Supporter status banner */}
              <div
                className={cn(
                  "mb-6 px-5 py-4 rounded-xl border",
                  brandingData?.isPremium
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-violet-500/5 border-amber-500/20"
                )}
              >
                {brandingData?.isPremium ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <Heart size={16} className="text-emerald-400 fill-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Thank you for supporting LionBot!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your custom branding is active until {brandingData.premiumUntil ? new Date(brandingData.premiumUntil).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center">
                        <Sparkles size={16} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Design your custom look freely below
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Custom branding is a supporter perk that helps keep LionBot free for everyone. All bot features are free forever.
                        </p>
                      </div>
                    </div>
                    <Link href="/dashboard/gems">
                      <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                        <Heart size={14} className="mr-1.5" />
                        Support LionBot
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Card type tabs */}
              <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 scrollbar-thin bg-muted/30 rounded-xl p-1">
                {CARD_TYPES.map((ct) => {
                  const changeCount = cardChangeCounts[ct.id] || 0
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => setActiveCardType(ct.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative",
                        activeCardType === ct.id
                          ? "bg-background text-foreground shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {ct.icon}
                      {ct.label}
                      {changeCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">
                {/* Left: Editor panel */}
                <div className="space-y-4">
                  {/* Toolbar */}
                  {/* --- AI-MODIFIED (2026-03-21) --- */}
                  {/* Purpose: Tighter gap on mobile for toolbar density */}
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap rounded-lg border border-border bg-muted/30 p-1">
                  {/* --- END AI-MODIFIED --- */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      title="Undo (Ctrl+Z)"
                      className="h-7 px-2 text-xs"
                    >
                      <Undo2 size={12} className="mr-1" /> Undo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      title="Redo (Ctrl+Y)"
                      className="h-7 px-2 text-xs"
                    >
                      <Redo2 size={12} className="mr-1" /> Redo
                    </Button>
                    <div className="w-px h-4 bg-border" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetCardType}
                      title="Reset this card type to defaults"
                      className="h-7 px-2 text-xs"
                    >
                      <RotateCcw size={12} className="mr-1" /> Reset Card
                    </Button>

                    {/* Copy from dropdown */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCopyFrom(copyFrom ? "" : "open")}
                        className="h-7 px-2 text-xs"
                      >
                        <Copy size={12} className="mr-1" /> Copy from...
                      </Button>
                      {copyFrom === "open" && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setCopyFrom("")} />
                          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 py-1 min-w-[160px]">
                            {CARD_TYPES.filter((c) => c.id !== activeCardType).map((ct) => (
                              <button
                                key={ct.id}
                                type="button"
                                onClick={() => handleCopyFrom(ct.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-2"
                              >
                                {ct.icon} {ct.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="w-px h-4 bg-border" />

                    {/* Palette generator */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPaletteOpen(!paletteOpen)}
                      className="h-7 px-2 text-xs"
                    >
                      <Palette size={12} className="mr-1" /> Palette
                    </Button>
                  </div>

                  {/* Palette generator panel */}
                  {paletteOpen && (
                    <div className="rounded-xl border border-border bg-card/50 p-4">
                      <p className="text-sm font-medium text-foreground mb-2">Color Harmony Generator</p>
                      <p className="text-xs text-muted-foreground mb-3">Pick an accent color and apply a generated palette to all properties on this card.</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <ColorPicker
                          value={paletteAccent || "#6366f1"}
                          onChange={setPaletteAccent}
                          compact
                        />
                        <Button
                          size="sm"
                          onClick={() => handleApplyPalette(generatePalette(paletteAccent || "#6366f1"))}
                        >
                          Apply to {activeCard.label}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setPaletteOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                      {paletteAccent && (
                        <div className="flex gap-1.5 mt-3">
                          {Object.entries(generatePalette(paletteAccent)).map(([name, color]) => (
                            <div key={name} className="flex flex-col items-center gap-1">
                              <div className="w-8 h-8 rounded-md border border-input" style={{ backgroundColor: color }} />
                              <span className="text-[10px] text-muted-foreground">{name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Base skin selector */}
                  <div className="rounded-xl border border-border bg-card/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Base Skin</p>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_SKINS.map((skinId) => {
                        const colors = SKIN_COLORS[skinId] || ["#444", "#222"]
                        return (
                          <button
                            key={skinId}
                            type="button"
                            onClick={() => handleBaseSkinChange(skinId)}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs",
                              baseSkinName === skinId
                                ? "border-primary bg-primary/15 text-foreground font-medium shadow-sm"
                                : "border-transparent hover:bg-accent text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <div
                              className="w-4 h-4 rounded shrink-0 shadow-sm"
                              style={{
                                background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                              }}
                            />
                            <span className="capitalize">
                              {skinId.replace(/_/g, " ")}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Property groups */}
                  {activeCard.groups.map((group) => {
                    const isCollapsed = collapsedGroups.has(group.id)
                    const editedCount = group.properties.filter((p) => !!cardProperties[p.key]).length
                    return (
                      <div key={group.id} className="rounded-xl border border-border bg-card/50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.id)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
                        >
                          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                          {group.label}
                          <span className="ml-auto flex items-center gap-2">
                            {editedCount > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">
                                {editedCount} edited
                              </span>
                            )}
                            <span className="text-[11px] text-muted-foreground">
                              {group.properties.length}
                            </span>
                          </span>
                        </button>
                        {!isCollapsed && (
                          <div className="px-4 pb-3 space-y-1">
                            {group.properties.map((prop) => {
                              const customValue = cardProperties[prop.key]
                              const defaultColor = getDefaultColor(baseSkinName, activeCardType, prop.key)
                              const displayValue = customValue || defaultColor
                              const isCustomized = !!customValue
                              return (
                                <div key={prop.key} className="flex items-center gap-1 group/prop">
                                  <div className="flex-1 min-w-0">
                                    <ColorPicker
                                      compact
                                      label={prop.label + (prop.compound ? " *" : "")}
                                      value={displayValue}
                                      onChange={(v) => setProp(activeCardType, prop.key, v, prop.compound)}
                                    />
                                  </div>
                                  {isCustomized ? (
                                    <button
                                      type="button"
                                      onClick={() => resetProp(activeCardType, prop.key, prop.compound)}
                                      className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-destructive/20 transition-all opacity-0 group-hover/prop:opacity-100"
                                      title="Reset to default"
                                    >
                                      <X size={10} />
                                    </button>
                                  ) : (
                                    <span className="w-5" />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Right: Live preview panel */}
                <div className="xl:sticky xl:top-6 self-start">
                  <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                    {/* Preview header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        Live Preview
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowBefore(!showBefore)}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                          showBefore
                            ? "bg-amber-500/15 text-amber-400"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                        title={showBefore ? "Showing default (base skin only)" : "Showing your custom colors"}
                      >
                        {showBefore ? <EyeOff size={12} /> : <Eye size={12} />}
                        {showBefore ? "Default" : "Custom"}
                      </button>
                    </div>

                    {/* Preview image */}
                    <div className="relative flex items-center justify-center p-4 min-h-[300px] bg-gray-950/50">
                      {previewLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/30 backdrop-blur-sm z-10 rounded-b-xl">
                          <Loader2 size={24} className="text-primary animate-spin" />
                        </div>
                      )}
                      {previewError && !previewLoading && (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <AlertTriangle size={24} />
                          <p className="text-sm">Preview unavailable</p>
                          <p className="text-xs text-muted-foreground/60">The render service may be temporarily down</p>
                        </div>
                      )}
                      {previewUrl && !previewError && (
                        <img
                          src={previewUrl}
                          alt={`${activeCard.label} card preview`}
                          className="max-w-full h-auto rounded-lg shadow-lg"
                          style={{ maxHeight: "600px" }}
                        />
                      )}
                      {!previewUrl && !previewError && !previewLoading && (
                        <div className="flex items-center justify-center text-muted-foreground">
                          <Loader2 size={20} className="animate-spin mr-2" />
                          Loading preview...
                        </div>
                      )}
                    </div>

                    {/* Preview footer */}
                    <div className="px-4 py-2 border-t border-border">
                      <p className="text-[11px] text-muted-foreground text-center">
                        {showBefore
                          ? `Default ${activeCard.label} card with ${baseSkinName.replace(/_/g, " ")} skin`
                          : `Your custom ${activeCard.label} card`
                        }
                        {" "}· Rendered by the actual bot engine
                      </p>
                      {hasChanges && (
                        <p className="text-[10px] text-emerald-400/60 text-center mt-0.5">
                          Your design progress is auto-saved
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <SaveBar
                show={!!hasChanges}
                onSave={handleSave}
                onReset={handleReset}
                saving={saving}
                label={brandingData?.isPremium
                  ? "You have unsaved branding changes"
                  : "Design complete! Support LionBot to apply"
                }
              />
            </div>
          </div>
        </div>

        {/* Supporter upsell dialog */}
        <Dialog open={upsellOpen} onOpenChange={setUpsellOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart size={18} className="text-rose-400" />
                Apply Your Custom Branding
              </DialogTitle>
              <DialogDescription>
                Supporting LionBot unlocks cosmetic customization for your server.
                Your support helps keep all bot features free for everyone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {PREMIUM_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    plan.popular ? "border-amber-500/40 bg-amber-500/5" : "border-border"
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{plan.name}</span>
                      {plan.popular && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">Popular</span>
                      )}
                      {plan.save && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Save {plan.save}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.duration}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-amber-400">{plan.gems.toLocaleString()} gems</span>
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(plan.id)}
                      disabled={purchasing}
                    >
                      Support
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Link href="/dashboard/gems">
                <a className="w-full block">
                  <Button variant="outline" className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                    <Sparkles size={14} className="mr-1.5" />
                    Get LionGems
                  </Button>
                </a>
              </Link>
              <Button variant="ghost" onClick={() => setUpsellOpen(false)} className="w-full">
                Maybe later
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
