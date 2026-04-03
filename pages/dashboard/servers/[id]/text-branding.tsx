// @ts-nocheck
// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-01
// Updated: 2026-04-01
// Purpose: Text Branding dashboard -- premium feature for
//          customizing all bot text strings per server.
//          Features: Start Here curated grid, color-graded type
//          badges, inline placeholder highlighting, Discord
//          context mockups, safety indicators, breadcrumbs.
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
import { SectionCard, PageHeader, toast, ConfirmModal } from "@/components/dashboard/ui"
import DiscordContextMockup from "@/components/dashboard/ui/DiscordContextMockup"
import { useDashboard } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  Type, Search, ChevronDown, ChevronRight, RotateCcw,
  Download, Upload, Save, Sparkles, AlertTriangle,
  X, Shield, Star, Heart, Image, Hash,
  MessageSquare, SquareMousePointer, ListFilter, Cog,
  Bell, FileText, ChevronUp,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// ── Types ────────────────────────────────────────────────────

interface StringEntry {
  key: string
  default: string
  default_plural?: string
  category: string
  has_plural: boolean
  string_type: string
  safety: string
  breadcrumb: string
  context_type: string
  context_region: string
  popular?: boolean
  placeholders?: { name: string; required: boolean }[]
}

interface DomainData {
  display_name: string
  count: number
  strings: StringEntry[]
}

interface CatalogData {
  version: string
  total_strings: number
  total_domains: number
  domains: Record<string, DomainData>
}

interface Override {
  text_key: string
  domain: string
  custom_text: string
  custom_text_plural?: string | null
  updated_at?: string | null
  updated_by?: string | null
}

interface OverridesResponse {
  overrides: Override[]
  count: number
  isPremium: boolean
  maxOverrides: number
}

// ── Color System ─────────────────────────────────────────────

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; label: string; icon: typeof MessageSquare }> = {
  gui:          { bg: "bg-fuchsia-500/15", text: "text-fuchsia-400", border: "border-fuchsia-500/20", label: "Card Image", icon: Image },
  embed:        { bg: "bg-violet-500/15",  text: "text-violet-400",  border: "border-violet-500/20",  label: "Embed",      icon: Hash },
  button:       { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/20", label: "Button",     icon: SquareMousePointer },
  select:       { bg: "bg-teal-500/15",    text: "text-teal-400",    border: "border-teal-500/20",    label: "Menu",       icon: ListFilter },
  modal:        { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/20",   label: "Form",       icon: FileText },
  command:      { bg: "bg-blue-500/15",    text: "text-blue-400",    border: "border-blue-500/20",    label: "Response",   icon: MessageSquare },
  notification: { bg: "bg-orange-500/15",  text: "text-orange-400",  border: "border-orange-500/20",  label: "Log Entry",  icon: Bell },
  setting:      { bg: "bg-sky-500/15",     text: "text-sky-400",     border: "border-sky-500/20",     label: "Setting",    icon: Cog },
  text:         { bg: "bg-slate-500/15",   text: "text-slate-400",   border: "border-slate-500/20",   label: "Message",    icon: MessageSquare },
}

function TypeBadge({ type }: { type: string }) {
  const c = TYPE_COLORS[type] || TYPE_COLORS.text
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 ${c.bg} ${c.text} border ${c.border} text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap`}>
      <Icon size={10} />
      {c.label}
    </span>
  )
}

// ── Placeholder Highlighting ─────────────────────────────────

function HighlightedText({ text, truncate }: { text: string; truncate?: number }) {
  let display = text
  if (truncate && display.length > truncate) {
    display = display.slice(0, truncate) + "..."
  }
  const parts = display.split(/(\{[^}]+\})/)
  return (
    <span className="text-xs text-muted-foreground font-mono leading-relaxed">
      {parts.map((part, i) =>
        part.startsWith("{") && part.endsWith("}") ? (
          <span key={i} className="bg-cyan-500/20 text-cyan-300 rounded px-1 py-0.5 border border-cyan-500/20 text-[11px]">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

// ── Feature Groups ───────────────────────────────────────────

const FEATURE_GROUPS: Record<string, { label: string; icon: typeof Star; domains: string[] }> = {
  ranks:       { label: "Rank Notifications",   icon: Star,    domains: ["ranks"] },
  welcome:     { label: "Welcome & Goodbye",    icon: Heart,   domains: ["config", "member_admin"] },
  economy:     { label: "Economy & Shop",       icon: Hash,    domains: ["economy", "shop"] },
  schedule:    { label: "Study Sessions",       icon: Cog,     domains: ["schedule", "voice-tracker"] },
  reminders:   { label: "Reminders",            icon: Bell,    domains: ["reminders"] },
  tasks:       { label: "Tasks & To-Do",        icon: FileText, domains: ["tasklist"] },
  pomodoro:    { label: "Pomodoro Timer",        icon: Cog,     domains: ["Pomodoro", "timer-gui"] },
  moderation:  { label: "Moderation",            icon: Shield,  domains: ["moderation"] },
  profile:     { label: "Profile & Statistics",  icon: Image,   domains: ["statistics", "profile-gui", "stats-gui", "weekly-gui", "monthly-gui"] },
  leaderboard: { label: "Leaderboard",           icon: Star,    domains: ["leaderboard-gui", "leaderboard_autopost"] },
  rooms:       { label: "Private Rooms",         icon: Hash,    domains: ["rooms"] },
  rolemenus:   { label: "Role Menus",            icon: ListFilter, domains: ["rolemenus"] },
  language:    { label: "Language Settings",     icon: Type,    domains: ["babel"] },
  liongotchi:  { label: "LionGotchi Pet",        icon: Heart,   domains: ["liongotchi"] },
  ui:          { label: "Buttons & UI",          icon: SquareMousePointer, domains: ["utils", "settings_base"] },
  permissions: { label: "Permissions",           icon: Shield,  domains: ["wards"] },
  video:       { label: "Video Channels",        icon: Image,   domains: ["video", "screen"] },
  meta:        { label: "Help & Commands",       icon: MessageSquare, domains: ["meta"] },
  core:        { label: "Core Bot",              icon: Cog,     domains: ["lion-core", "text-tracker"] },
  goals:       { label: "Goals Cards",           icon: Star,    domains: ["goals-gui"] },
  topgg:       { label: "Voting & Top.gg",       icon: Star,    domains: ["topgg"] },
  sticky:      { label: "Sticky Messages",       icon: FileText, domains: ["sticky_messages"] },
  shared:      { label: "Shared Task Boards",    icon: FileText, domains: ["shared_tasklist"] },
  userconf:    { label: "User Settings",         icon: Cog,     domains: ["user_config"] },
}

// ── Start Here Curations ─────────────────────────────────────

const START_HERE_CARDS = [
  { key: "guildset:greeting_message|default", title: "Welcome Message", desc: "What new members see when joining", icon: Heart },
  { key: "guildset:returning_message|default", title: "Returning Member", desc: "Message for returning members", icon: Heart },
  { key: "event:rank_update|embed:notify", title: "Rank Notification", desc: "When someone earns a new rank", icon: Star },
  { key: "timer|status|stage:focus|statusline", title: "Focus Timer Start", desc: "Posted when focus stage begins", icon: Cog },
  { key: "skin:leaderboard|mode:study|header_text", title: "Leaderboard Title", desc: "Header on the leaderboard card", icon: Image },
  { key: "cmd:economy_balance|embed:single|desc", title: "Balance Check", desc: "When checking someone's coins", icon: Hash },
  { key: "skin:profile|header:achievements", title: "Profile Header", desc: "Achievement section on profile card", icon: Image },
  { key: "skin:stats|mode:study|header:col2", title: "Stats Streak", desc: "Study streak header on stats card", icon: Image },
  { key: "timer|status|warningline", title: "Timer Warning", desc: "Warning to inactive timer users", icon: Bell },
  { key: "cmd:tasks_edit|resp:success|desc", title: "Task Updated", desc: "Confirmation after editing a task", icon: FileText },
  { key: "timer|status|stage:break|statusline", title: "Break Timer Start", desc: "Posted when break stage begins", icon: Cog },
  { key: "ui:reminderlist|button:new|modal|title", title: "New Reminder", desc: "Title of the reminder popup", icon: Bell },
]

// ── String Editor ────────────────────────────────────────────

function StringEditor({
  entry,
  domain,
  override,
  serverId,
  onSaved,
  isPremium,
  overrideCount,
  maxOverrides,
}: {
  entry: StringEntry
  domain: string
  override?: Override
  serverId: string
  onSaved: () => void
  isPremium: boolean
  overrideCount: number
  maxOverrides: number
}) {
  const [expanded, setExpanded] = useState(false)
  const [text, setText] = useState(override?.custom_text || "")
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setText(override?.custom_text || "")
  }, [override?.custom_text])

  const isModified = !!override
  const isDirty = text.trim() !== "" && text !== entry.default && text !== (override?.custom_text || "")
  const missingPlaceholders = useMemo(() => {
    if (!entry.placeholders || !text.trim()) return []
    return entry.placeholders.filter(p => p.required && !text.includes(`{${p.name}}`))
  }, [text, entry.placeholders])

  const insertPlaceholder = useCallback((name: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = text.slice(0, start)
    const after = text.slice(end)
    const inserted = `{${name}}`
    setText(before + inserted + after)
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + inserted.length
    })
  }, [text])

  const handleSave = async () => {
    if (!text.trim() || text === entry.default) return
    if (missingPlaceholders.length > 0) {
      toast.error(`Missing required placeholders: ${missingPlaceholders.map(p => `{${p.name}}`).join(", ")}`)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${serverId}/text-overrides`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text_key: entry.key, domain, custom_text: text }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.requiresPremium) {
          toast.error("Upgrade to premium for unlimited customizations!")
        } else if (data.error === "missing_placeholders") {
          toast.error(data.message)
        } else {
          toast.error(data.error || "Failed to save")
        }
        return
      }
      toast.success("Saved!")
      onSaved()
    } catch {
      toast.error("Network error")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    setSaving(true)
    try {
      await fetch(`/api/dashboard/servers/${serverId}/text-overrides`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text_key: entry.key }),
      })
      setText("")
      toast.success("Reset to default")
      onSaved()
    } catch {
      toast.error("Failed to reset")
    } finally {
      setSaving(false)
    }
  }

  const typeColor = TYPE_COLORS[entry.string_type] || TYPE_COLORS.text

  return (
    <div className={`border-b border-border/30 last:border-b-0 transition-colors ${expanded ? "bg-card/30" : "hover:bg-card/20"}`}>
      {/* Collapsed row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
      >
        <div className="pt-0.5 flex-shrink-0">
          {expanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={entry.string_type} />
            <span className="text-[10px] text-muted-foreground/50">{entry.breadcrumb}</span>
            {entry.safety === "restricted" && (
              <span className="text-orange-400" title="Many required placeholders">
                <Shield size={12} />
              </span>
            )}
            {entry.safety === "caution" && (
              <span className="text-yellow-400/60" title="Has required placeholders">
                <AlertTriangle size={10} />
              </span>
            )}
          </div>
          <div className="pr-4">
            <HighlightedText text={entry.default} truncate={120} />
          </div>
        </div>
        <div className="flex-shrink-0 pt-1">
          {isModified && (
            <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
              Modified
            </span>
          )}
        </div>
      </button>

      {/* Expanded editor */}
      {expanded && (
        <div className="px-4 pb-4 pt-1">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
            {/* Left: editor */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Default</p>
                <div className="bg-muted/30 rounded-lg px-3 py-2 border border-border/50">
                  <HighlightedText text={entry.default} />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Your Version</p>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={entry.default}
                  rows={Math.max(2, Math.ceil(entry.default.length / 70))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/30 resize-y focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              {entry.placeholders && entry.placeholders.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Placeholders (click to insert)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.placeholders.map((ph) => (
                      <button
                        key={ph.name}
                        onClick={() => insertPlaceholder(ph.name)}
                        className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 text-[11px] font-mono px-2 py-0.5 rounded hover:bg-cyan-500/25 transition-colors cursor-pointer"
                      >
                        {`{${ph.name}}`}
                        {ph.required && <span className="text-red-400 ml-0.5">*</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {missingPlaceholders.length > 0 && text.trim() && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-300 text-[11px]">
                    Missing required: {missingPlaceholders.map(p => `{${p.name}}`).join(", ")}. The bot needs these to work correctly.
                  </p>
                </div>
              )}

              {entry.safety === "restricted" && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
                  <Shield size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-orange-300 text-[11px]">
                    This message uses {entry.placeholders?.length || 0} dynamic values. Make sure to include all highlighted placeholders or the bot may show errors.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                {isModified && (
                  <button
                    onClick={handleReset}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/30 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || !isDirty || missingPlaceholders.length > 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                >
                  <Save size={12} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* Right: Discord mockup */}
            <div className="hidden lg:block">
              <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Where this appears</p>
              <DiscordContextMockup
                contextType={entry.context_type as any}
                contextRegion={entry.context_region}
                text={text || entry.default}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────

export default function TextBrandingPage() {
  const router = useRouter()
  const { id } = router.query
  const guildId = typeof id === "string" ? id : ""
  const { data: dashData } = useDashboard<{ serverName: string; isAdmin: boolean; isMod: boolean }>(guildId, "overview")
  const serverName = dashData?.serverName || "Server"
  const isAdmin = dashData?.isAdmin ?? false

  const [catalog, setCatalog] = useState<CatalogData | null>(null)
  const [overridesData, setOverridesData] = useState<OverridesResponse | null>(null)
  const [search, setSearch] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [startHereCollapsed, setStartHereCollapsed] = useState(false)

  useEffect(() => {
    fetch("/string-catalog.json")
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => toast.error("Failed to load string catalog"))
  }, [])

  const loadOverrides = useCallback(() => {
    if (!guildId) return
    fetch(`/api/dashboard/servers/${guildId}/text-overrides`)
      .then((r) => r.json())
      .then(setOverridesData)
      .catch(() => {})
  }, [guildId])

  useEffect(() => { loadOverrides() }, [loadOverrides])

  const overrideMap = useMemo(() => {
    const m = new Map<string, Override>()
    if (overridesData?.overrides) {
      for (const o of overridesData.overrides) {
        m.set(o.text_key, o)
      }
    }
    return m
  }, [overridesData])

  const allStrings = useMemo(() => {
    if (!catalog) return []
    const result: Array<{ entry: StringEntry; domain: string }> = []
    for (const [domain, domData] of Object.entries(catalog.domains)) {
      for (const entry of domData.strings) {
        result.push({ entry, domain })
      }
    }
    return result
  }, [catalog])

  const featureGroupData = useMemo(() => {
    if (!catalog) return []
    return Object.entries(FEATURE_GROUPS).map(([key, group]) => {
      const strings: Array<{ entry: StringEntry; domain: string }> = []
      for (const domain of group.domains) {
        const domData = catalog.domains[domain]
        if (domData) {
          for (const entry of domData.strings) {
            strings.push({ entry, domain })
          }
        }
      }
      const modified = strings.filter(s => overrideMap.has(s.entry.key)).length
      return { key, ...group, strings, total: strings.length, modified }
    }).filter(g => g.total > 0)
  }, [catalog, overrideMap])

  const searchResults = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return allStrings.filter(({ entry }) =>
      entry.default.toLowerCase().includes(q) ||
      entry.breadcrumb.toLowerCase().includes(q) ||
      entry.key.toLowerCase().includes(q) ||
      overrideMap.get(entry.key)?.custom_text?.toLowerCase().includes(q)
    ).slice(0, 80)
  }, [search, allStrings, overrideMap])

  const groupStrings = useMemo(() => {
    if (!selectedGroup) return null
    const group = FEATURE_GROUPS[selectedGroup]
    if (!group || !catalog) return null
    const strings: Array<{ entry: StringEntry; domain: string }> = []
    for (const domain of group.domains) {
      const domData = catalog.domains[domain]
      if (domData) {
        for (const entry of domData.strings) {
          strings.push({ entry, domain })
        }
      }
    }
    const typeOrder = ["gui", "embed", "command", "button", "select", "modal", "notification", "setting", "text"]
    strings.sort((a, b) => typeOrder.indexOf(a.entry.string_type) - typeOrder.indexOf(b.entry.string_type))
    return strings
  }, [selectedGroup, catalog])

  const popularStrings = useMemo(() => {
    return allStrings.filter(s => s.entry.popular)
  }, [allStrings])

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/dashboard/servers/${guildId}/text-overrides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export" }),
      })
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `text-branding-${guildId}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Exported!")
    } catch {
      toast.error("Export failed")
    }
  }

  const handleImport = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        const res = await fetch(`/api/dashboard/servers/${guildId}/text-overrides`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "import", overrides: data.overrides || [] }),
        })
        const result = await res.json()
        if (!res.ok) {
          if (result.requiresPremium) toast.error("Import requires premium.")
          else toast.error(result.error || "Import failed")
          return
        }
        toast.success(`Imported ${result.imported} strings${result.skipped ? `, ${result.skipped} skipped` : ""}`)
        loadOverrides()
      } catch {
        toast.error("Invalid file")
      }
    }
    input.click()
  }

  const handleResetAll = async () => {
    try {
      await fetch(`/api/dashboard/servers/${guildId}/text-overrides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-all" }),
      })
      toast.success("All customizations reset!")
      loadOverrides()
    } catch {
      toast.error("Reset failed")
    }
    setShowResetConfirm(false)
  }

  if (!catalog) {
    return (
      <Layout SEO={{ title: "Text Branding - LionBot", description: "Customize bot text" }}>
        <AdminGuard>
          <ServerGuard requiredLevel="admin">
            <DashboardShell wide nav={<ServerNav serverId={guildId} serverName={serverName} isAdmin={isAdmin} isMod />}>
              <div className="space-y-4 max-w-4xl">
                <div className="h-10 bg-muted/30 rounded-lg animate-pulse" />
                <div className="h-64 bg-muted/20 rounded-xl animate-pulse" />
              </div>
            </DashboardShell>
          </ServerGuard>
        </AdminGuard>
      </Layout>
    )
  }

  const isPremium = overridesData?.isPremium ?? false
  const overrideCount = overridesData?.count ?? 0
  const maxOverrides = overridesData?.maxOverrides ?? 3

  const renderStringList = (strings: Array<{ entry: StringEntry; domain: string }>) => (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-card/20">
      {strings.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">No strings found</p>
      ) : (
        strings.map(({ entry, domain }) => (
          <StringEditor
            key={entry.key}
            entry={entry}
            domain={domain}
            override={overrideMap.get(entry.key)}
            serverId={guildId}
            onSaved={loadOverrides}
            isPremium={isPremium}
            overrideCount={overrideCount}
            maxOverrides={maxOverrides}
          />
        ))
      )}
    </div>
  )

  return (
    <Layout SEO={{ title: "Text Branding - LionBot", description: "Customize every message Leo sends" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
          <DashboardShell wide nav={<ServerNav serverId={guildId} serverName={serverName} isAdmin={isAdmin} isMod />}>
            <div className="space-y-6 max-w-5xl">

              {/* Header */}
              <PageHeader
                title="Text Branding"
                description="Make Leo speak your language. Customize every message, embed, button, and card text the bot sends in your server."
              />

              {/* Premium banner + stats */}
              <div className={`rounded-xl border px-5 py-4 flex items-center justify-between flex-wrap gap-3 ${
                isPremium
                  ? "bg-emerald-500/[0.04] border-emerald-500/20"
                  : "bg-gradient-to-r from-amber-500/[0.04] via-rose-500/[0.04] to-violet-500/[0.04] border-amber-500/20"
              }`}>
                <div className="flex items-center gap-3">
                  {isPremium ? (
                    <Sparkles size={18} className="text-emerald-400" />
                  ) : (
                    <Sparkles size={18} className="text-amber-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {isPremium ? "Premium Active" : "Free Tier"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {overrideCount} customized{!isPremium && ` (${overrideCount}/${maxOverrides} free)`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/30 transition-colors">
                    <Download size={12} /> Export
                  </button>
                  <button onClick={handleImport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/30 transition-colors">
                    <Upload size={12} /> Import
                  </button>
                  {overrideCount > 0 && (
                    <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                      <RotateCcw size={12} /> Reset All
                    </button>
                  )}
                </div>
              </div>

              {/* Start Here */}
              <div>
                <button
                  onClick={() => setStartHereCollapsed(!startHereCollapsed)}
                  className="flex items-center gap-2 mb-3 group"
                >
                  <h2 className="text-lg font-semibold text-foreground">Start Here</h2>
                  <span className="text-xs text-muted-foreground/60">Most popular customizations</span>
                  {startHereCollapsed ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronUp size={14} className="text-muted-foreground" />}
                </button>
                {!startHereCollapsed && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {START_HERE_CARDS.map((card) => {
                      const match = popularStrings.find(s => s.entry.key === card.key)
                      if (!match) return null
                      const isCustomized = overrideMap.has(card.key)
                      const Icon = card.icon
                      const typeColor = TYPE_COLORS[match.entry.string_type] || TYPE_COLORS.text

                      return (
                        <button
                          key={card.key}
                          onClick={() => {
                            setSearch(card.key)
                            setSelectedGroup(null)
                          }}
                          className={`text-left rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all p-4 space-y-2 ${isCustomized ? "ring-1 ring-amber-500/20" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg ${typeColor.bg} flex items-center justify-center`}>
                                <Icon size={14} className={typeColor.text} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{card.title}</p>
                                <p className="text-[10px] text-muted-foreground">{card.desc}</p>
                              </div>
                            </div>
                            {isCustomized && (
                              <span className="bg-amber-500/15 text-amber-400 text-[9px] px-1.5 py-0.5 rounded-full border border-amber-500/20">
                                Modified
                              </span>
                            )}
                          </div>
                          <div className="bg-[#2f3136] rounded-lg px-2.5 py-1.5">
                            <p className="text-[10px] text-[#dcddde] line-clamp-2 font-mono">
                              {isCustomized ? overrideMap.get(card.key)?.custom_text : match.entry.default}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedGroup(null) }}
                  placeholder="What do you want to customize? Try 'welcome', 'rank', 'timer'..."
                  className="w-full pl-10 pr-10 py-3 bg-card/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Search results */}
              {searchResults && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">{searchResults.length} results</p>
                  {renderStringList(searchResults)}
                </div>
              )}

              {/* Group detail view */}
              {!searchResults && selectedGroup && groupStrings && (
                <div>
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline mb-3"
                  >
                    <ChevronRight size={12} className="rotate-180" />
                    Back to all features
                  </button>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    {FEATURE_GROUPS[selectedGroup]?.label}
                    <span className="text-muted-foreground font-normal ml-2 text-sm">({groupStrings.length})</span>
                  </h3>
                  {renderStringList(groupStrings)}
                </div>
              )}

              {/* Feature group browser */}
              {!searchResults && !selectedGroup && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">Browse by Feature</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {featureGroupData.map((group) => {
                      const Icon = group.icon
                      return (
                        <button
                          key={group.key}
                          onClick={() => setSelectedGroup(group.key)}
                          className="text-left rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all px-4 py-3 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{group.label}</p>
                              <p className="text-[10px] text-muted-foreground">{group.total} strings</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {group.modified > 0 && (
                              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                                {group.modified} customized
                              </span>
                            )}
                            <ChevronRight size={14} className="text-muted-foreground" />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>

            <ConfirmModal
              open={showResetConfirm}
              onClose={() => setShowResetConfirm(false)}
              onConfirm={handleResetAll}
              title="Reset All Customizations"
              description={`This will delete all ${overrideCount} custom text overrides and restore every message to default. This cannot be undone.`}
              confirmLabel="Reset Everything"
              destructive
            />
          </DashboardShell>
        </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
