// @ts-nocheck
// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-01
// Purpose: Text Branding dashboard page -- premium feature for
//          customizing all bot text strings per server
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
import {
  SectionCard, PageHeader, toast, ConfirmModal, Badge, EmptyState,
} from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  Type, Search, ChevronDown, ChevronRight, RotateCcw,
  Download, Upload, Save, Sparkles, Check, AlertTriangle,
  X, Filter, Eye, MessageSquare,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface StringEntry {
  key: string
  default: string
  default_plural?: string
  category: string
  has_plural: boolean
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

const FEATURE_GROUPS: Record<string, string[]> = {
  "Rank Notifications": ["ranks"],
  "Welcome & Goodbye": ["config"],
  "Economy & Coins": ["economy", "shop"],
  "Study Sessions & Schedule": ["schedule", "voice-tracker"],
  "Reminders": ["reminders"],
  "Tasks & To-Do": ["tasklist"],
  "Pomodoro Timer": ["Pomodoro", "timer-gui"],
  "Moderation": ["moderation"],
  "Profile & Statistics": ["statistics", "profile-gui", "stats-gui", "weekly-gui", "monthly-gui"],
  "Leaderboard": ["leaderboard-gui"],
  "Private Rooms": ["rooms"],
  "Role Menus": ["rolemenus"],
  "Language Settings": ["babel"],
  "LionGotchi Pet": ["liongotchi"],
  "Button Labels & UI": ["base", "utils", "settings_base"],
  "Permissions": ["wards"],
  "Video Channels": ["video", "screen"],
  "Bot Meta & Help": ["meta", "sysadmin", "exec"],
  "Core Bot": ["lion-core", "core_config", "text-tracker"],
  "Goals Cards": ["goals-gui"],
  "Voting & Top.gg": ["topgg"],
  "Sponsors": ["sponsors"],
  "Premium": ["premium", "customskins"],
  "Sticky Messages": ["sticky_messages"],
  "Leaderboard Autopost": ["leaderboard_autopost"],
  "Shared Task Boards": ["shared_tasklist"],
  "User Settings": ["user_config"],
  "Member Administration": ["member_admin"],
}

function PlaceholderChip({ name, onClick }: { name: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs
        bg-primary/15 text-primary border border-primary/20
        hover:bg-primary/25 transition-colors cursor-pointer font-mono"
    >
      {`{${name}}`}
    </button>
  )
}

function StringEditor({
  entry,
  override,
  onSave,
  onReset,
  isPremium,
  overrideCount,
  maxOverrides,
}: {
  entry: StringEntry
  override?: Override
  onSave: (text_key: string, domain: string, custom_text: string) => Promise<void>
  onReset: (text_key: string) => Promise<void>
  isPremium: boolean
  overrideCount: number
  maxOverrides: number
}) {
  const [expanded, setExpanded] = useState(false)
  const [text, setText] = useState(override?.custom_text || "")
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isModified = !!override
  const hasChanges = text !== (override?.custom_text || "")
  const isDirty = text !== "" && text !== entry.default

  const missingPlaceholders = useMemo(() => {
    if (!entry.placeholders || !text) return []
    return entry.placeholders
      .filter((p) => p.required && !text.includes(`{${p.name}}`))
      .map((p) => p.name)
  }, [entry.placeholders, text])

  const insertPlaceholder = (name: string) => {
    if (!textareaRef.current) return
    const ta = textareaRef.current
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const placeholder = `{${name}}`
    const newText = text.slice(0, start) + placeholder + text.slice(end)
    setText(newText)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + placeholder.length, start + placeholder.length)
    }, 0)
  }

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      const domain = Object.entries(FEATURE_GROUPS).find(([, domains]) =>
        domains.some((d) => {
          return true
        })
      )
      await onSave(entry.key, override?.domain || "", text)
      toast.success("Custom text saved!")
    } catch (err: any) {
      if (err?.requiresPremium) {
        toast.error("Upgrade to premium for unlimited text customizations!")
      } else {
        toast.error(err?.message || "Failed to save")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    setSaving(true)
    try {
      await onReset(entry.key)
      setText("")
      toast.success("Restored to default")
    } catch {
      toast.error("Failed to reset")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-card/50 transition-colors"
      >
        {expanded ? <ChevronDown size={14} className="text-muted-foreground shrink-0" /> : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
        <span className="flex-1 text-sm text-foreground truncate font-mono">
          {entry.default.slice(0, 100)}{entry.default.length > 100 ? "..." : ""}
        </span>
        {isModified ? (
          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 text-xs shrink-0">Modified</Badge>
        ) : (
          <span className="text-xs text-muted-foreground shrink-0">Default</span>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Default</label>
            <div className="mt-1 p-2 rounded bg-card text-sm text-muted-foreground font-mono whitespace-pre-wrap">
              {entry.default}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your version</label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={entry.default}
              rows={Math.max(2, Math.ceil(entry.default.length / 60))}
              className="mt-1 w-full p-2 rounded bg-background border border-border
                text-sm text-foreground font-mono resize-y
                focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {entry.placeholders && entry.placeholders.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Available placeholders <span className="normal-case">(click to insert)</span>
              </label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {entry.placeholders.map((p) => (
                  <PlaceholderChip key={p.name} name={p.name} onClick={() => insertPlaceholder(p.name)} />
                ))}
              </div>
            </div>
          )}

          {missingPlaceholders.length > 0 && (
            <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <span className="text-xs text-amber-300">
                Missing required placeholder{missingPlaceholders.length > 1 ? "s" : ""}:{" "}
                {missingPlaceholders.map((n) => `{${n}}`).join(", ")}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            {isModified && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
                  text-muted-foreground hover:text-foreground border border-border
                  hover:bg-card transition-colors disabled:opacity-50"
              >
                <RotateCcw size={12} /> Reset to default
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty || !text.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium
                bg-primary text-primary-foreground hover:bg-primary/90
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={12} /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TextBrandingPage() {
  const router = useRouter()
  const serverId = router.query.id as string

  const { data: serverData } = useDashboard(`/api/dashboard/servers/${serverId}/subscription`)
  const serverName = serverData?.name || "Server"

  const [catalog, setCatalog] = useState<CatalogData | null>(null)
  const [overridesData, setOverridesData] = useState<OverridesResponse | null>(null)
  const [search, setSearch] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [filterModified, setFilterModified] = useState(false)
  const [viewMode, setViewMode] = useState<"features" | "all">("features")
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    fetch("/string-catalog.json")
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => toast.error("Failed to load string catalog"))
  }, [])

  const loadOverrides = useCallback(async () => {
    if (!serverId) return
    try {
      const res = await fetch(`/api/dashboard/servers/${serverId}/text-overrides`)
      if (res.ok) {
        setOverridesData(await res.json())
      }
    } catch {
      toast.error("Failed to load overrides")
    }
  }, [serverId])

  useEffect(() => {
    loadOverrides()
  }, [loadOverrides])

  const overrideMap = useMemo(() => {
    const map = new Map<string, Override>()
    overridesData?.overrides.forEach((o) => map.set(o.text_key, o))
    return map
  }, [overridesData])

  const featureGroupData = useMemo(() => {
    if (!catalog) return []
    return Object.entries(FEATURE_GROUPS)
      .map(([groupName, domains]) => {
        const strings: (StringEntry & { domain: string })[] = []
        for (const domain of domains) {
          const domainData = catalog.domains[domain]
          if (!domainData) continue
          for (const s of domainData.strings) {
            strings.push({ ...s, domain })
          }
        }
        const modified = strings.filter((s) => overrideMap.has(s.key)).length
        return { groupName, strings, modified, total: strings.length }
      })
      .filter((g) => g.total > 0)
      .sort((a, b) => a.groupName.localeCompare(b.groupName))
  }, [catalog, overrideMap])

  const filteredStrings = useMemo(() => {
    if (!catalog) return []

    let strings: (StringEntry & { domain: string })[] = []

    if (viewMode === "features" && selectedGroup) {
      const group = featureGroupData.find((g) => g.groupName === selectedGroup)
      strings = group?.strings || []
    } else if (viewMode === "all") {
      for (const [domain, data] of Object.entries(catalog.domains)) {
        for (const s of data.strings) {
          strings.push({ ...s, domain })
        }
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      strings = strings.filter(
        (s) =>
          s.default.toLowerCase().includes(q) ||
          s.key.toLowerCase().includes(q) ||
          (overrideMap.get(s.key)?.custom_text || "").toLowerCase().includes(q)
      )
    }

    if (filterModified) {
      strings = strings.filter((s) => overrideMap.has(s.key))
    }

    return strings
  }, [catalog, viewMode, selectedGroup, search, filterModified, overrideMap, featureGroupData])

  const handleSave = async (text_key: string, domain: string, custom_text: string) => {
    const res = await fetch(`/api/dashboard/servers/${serverId}/text-overrides`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text_key, domain, custom_text }),
    })
    const data = await res.json()
    if (!res.ok) {
      const err = new Error(data.error)
      ;(err as any).requiresPremium = data.requiresPremium
      throw err
    }
    await loadOverrides()
  }

  const handleReset = async (text_key: string) => {
    await fetch(`/api/dashboard/servers/${serverId}/text-overrides`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text_key }),
    })
    await loadOverrides()
  }

  const handleResetAll = async () => {
    const res = await fetch(`/api/dashboard/servers/${serverId}/text-overrides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-all" }),
    })
    if (res.ok) {
      toast.success("All customizations reset to default")
      await loadOverrides()
    }
    setShowResetConfirm(false)
  }

  const handleExport = async () => {
    const res = await fetch(`/api/dashboard/servers/${serverId}/text-overrides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "export" }),
    })
    if (!res.ok) return toast.error("Export failed")
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `text-branding-${serverId}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${data.count} customizations`)
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
        const res = await fetch(`/api/dashboard/servers/${serverId}/text-overrides`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "import", overrides: data.overrides || [] }),
        })
        const result = await res.json()
        if (res.ok) {
          toast.success(`Imported ${result.imported} customizations`)
          await loadOverrides()
        } else {
          toast.error(result.error || "Import failed")
        }
      } catch {
        toast.error("Invalid JSON file")
      }
    }
    input.click()
  }

  const isPremium = overridesData?.isPremium ?? false
  const overrideCount = overridesData?.count ?? 0
  const maxOverrides = overridesData?.maxOverrides ?? 3
  const totalStrings = catalog?.total_strings ?? 0

  const pageContent = (
    <main className="max-w-4xl space-y-6">
      <PageHeader
        title="Text Branding"
        description="Customize every message Leo sends to match your community's voice"
        icon={<Type size={24} />}
      />

      {/* Stats bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
          <span className="text-xs text-muted-foreground">Customized</span>
          <span className="text-sm font-semibold text-foreground">{overrideCount}</span>
          <span className="text-xs text-muted-foreground">/ {totalStrings}</span>
        </div>
        {isPremium ? (
          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 gap-1">
            <Sparkles size={12} /> Premium
          </Badge>
        ) : (
          <Badge className="bg-card text-muted-foreground border-border gap-1">
            Free ({overrideCount}/{maxOverrides})
          </Badge>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={overrideCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
              border border-border text-muted-foreground hover:text-foreground
              hover:bg-card transition-colors disabled:opacity-50"
          >
            <Download size={12} /> Export
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
              border border-border text-muted-foreground hover:text-foreground
              hover:bg-card transition-colors"
          >
            <Upload size={12} /> Import
          </button>
          {overrideCount > 0 && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
                border border-red-500/30 text-red-400 hover:bg-red-500/10
                transition-colors"
            >
              <RotateCcw size={12} /> Reset All
            </button>
          )}
        </div>
      </div>

      {/* View mode tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border w-fit">
        <button
          type="button"
          onClick={() => { setViewMode("features"); setSelectedGroup(null) }}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            viewMode === "features"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          By Feature
        </button>
        <button
          type="button"
          onClick={() => setViewMode("all")}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            viewMode === "all"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Strings
        </button>
      </div>

      {/* Feature groups view */}
      {viewMode === "features" && !selectedGroup && (
        <div className="space-y-2">
          {featureGroupData.map((group) => (
            <button
              key={group.groupName}
              type="button"
              onClick={() => setSelectedGroup(group.groupName)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                bg-card border border-border hover:border-primary/30
                hover:bg-card/80 transition-all text-left group"
            >
              <MessageSquare size={16} className="text-muted-foreground group-hover:text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{group.groupName}</div>
                <div className="text-xs text-muted-foreground">{group.total} texts</div>
              </div>
              {group.modified > 0 && (
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 text-xs">
                  {group.modified} customized
                </Badge>
              )}
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {/* Selected group or All Strings view */}
      {(selectedGroup || viewMode === "all") && (
        <div className="space-y-4">
          {selectedGroup && (
            <button
              type="button"
              onClick={() => setSelectedGroup(null)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight size={12} className="rotate-180" /> Back to features
            </button>
          )}

          {/* Search and filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search texts..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-card border border-border
                  text-sm text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setFilterModified(!filterModified)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-colors ${
                filterModified
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <Filter size={12} /> Modified only
            </button>
          </div>

          {/* Heading */}
          {selectedGroup && (
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{selectedGroup}</h3>
              <span className="text-xs text-muted-foreground">
                {filteredStrings.length} text{filteredStrings.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* String list */}
          <div className="space-y-2">
            {filteredStrings.slice(0, 100).map((entry) => (
              <StringEditor
                key={entry.key}
                entry={entry}
                override={overrideMap.get(entry.key)}
                onSave={handleSave}
                onReset={handleReset}
                isPremium={isPremium}
                overrideCount={overrideCount}
                maxOverrides={maxOverrides}
              />
            ))}
            {filteredStrings.length > 100 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Showing first 100 of {filteredStrings.length} results. Use search to narrow down.
              </div>
            )}
            {filteredStrings.length === 0 && (
              <EmptyState
                icon={<Search size={24} />}
                title={search || filterModified ? "No matching texts" : "Select a feature category"}
                description={search ? "Try a different search term" : filterModified ? "No customized texts yet" : "Choose a feature to start customizing its text"}
              />
            )}
          </div>
        </div>
      )}

      {/* Reset all confirmation */}
      {showResetConfirm && (
        <ConfirmModal
          title="Reset all customizations?"
          description={`This will restore Leo's default text for all ${overrideCount} customized messages in your server. This cannot be undone.`}
          confirmLabel="Reset All"
          confirmVariant="destructive"
          onConfirm={handleResetAll}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </main>
  )

  return (
    <Layout SEO={{ title: "Text Branding", description: "Customize every message Leo sends in your server" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
          <DashboardShell nav={<ServerNav serverId={serverId} serverName={serverName} isAdmin isMod />}>
            {pageContent}
          </DashboardShell>
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
