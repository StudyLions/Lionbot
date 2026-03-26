// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Ranks Command Center - stats, distribution chart,
//          visual ladder, simulator, health analysis, smart
//          suggestions, expandable member lists, inline config
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: DashboardShell layout migration
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
// --- END AI-MODIFIED ---
import {
  PageHeader, ConfirmModal, RoleSelect, EmptyState, toast,
  clearRoleCache, SearchSelect, ChannelSelect, Toggle, NumberInput,
} from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useRoles } from "@/hooks/useRoles"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useCallback, useMemo, useEffect } from "react"
import {
  Trophy, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Users, BarChart3,
  AlertTriangle, CheckCircle, Lightbulb, Calculator, Coins, ArrowUp,
  Download, Zap, Target, TrendingUp, MessageSquare, Info,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// ── Types ──────────────────────────────────────────────────

interface Rank {
  rankId: number
  roleId: string
  required: number
  reward: number
  message: string | null
}

// --- AI-MODIFIED (2026-03-25) ---
// Purpose: Added secondary rank type enabled flags for multi-rank support
interface RanksData {
  rankType: string | null
  rankChannel: string | null
  dmRanks: boolean
  voiceRanksEnabled: boolean
  msgRanksEnabled: boolean
  xpRanksEnabled: boolean
  xpRanks: Rank[]
  voiceRanks: Rank[]
  msgRanks: Rank[]
  memberCounts: Record<string, Record<number, number>>
}
// --- END AI-MODIFIED ---

interface StatsData {
  rankType: string | null
  totalMembers: number
  rankedMembers: number
  unrankedMembers: number
  distribution: Array<{
    rankId: number
    roleId: string
    required: number
    reward: number
    memberCount: number
    members: Array<{ userId: string; displayName: string; avatar: string | null }>
  }>
  nearNextRank: Array<{
    userId: string
    displayName: string
    avatar: string | null
    currentStat: number
    nextRequired: number
    percentComplete: number
  }>
  activityStats: {
    avgStatPerMember: number
    medianStat: number
    p25Stat: number
    p75Stat: number
    maxStat: number
    activeMembersCount: number
  } | null
}

type TabKey = "XP" | "VOICE" | "MESSAGE"

// ── Constants ──────────────────────────────────────────────

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Removed unused TAB_OPTIONS constant (dead code cleanup)
// --- END AI-MODIFIED ---

const RANK_TYPE_OPTIONS = [
  { value: "XP", label: "XP (combined activity)" },
  { value: "VOICE", label: "Voice (study hours)" },
  { value: "MESSAGE", label: "Messages (text count)" },
]

function unitForType(t: string | null) {
  if (t === "VOICE") return "hours"
  if (t === "MESSAGE") return "messages"
  return "XP"
}

function formatStat(value: number, rankType: string | null) {
  if (rankType === "VOICE") return `${(value / 3600).toFixed(1)}h`
  return value.toLocaleString()
}

function formatRequired(value: number, rankType: string | null) {
  if (rankType === "VOICE") {
    const hours = value / 3600
    return hours >= 1 ? `${Math.round(hours)} hours` : `${value} seconds`
  }
  return `${value.toLocaleString()} ${rankType === "MESSAGE" ? "messages" : "XP"}`
}

function inputRequiredValue(value: number, rankType: string | null): number {
  if (rankType === "VOICE") return Math.round(value / 3600)
  return value
}

function outputRequiredValue(value: number, rankType: string | null): number {
  if (rankType === "VOICE") return value * 3600
  return value
}

const TEMPLATE_VARS = [
  { key: "{user_mention}", label: "@User" },
  { key: "{user_name}", label: "Username" },
  { key: "{role_name}", label: "Role Name" },
  { key: "{role_mention}", label: "@Role" },
  { key: "{guild_name}", label: "Server Name" },
  { key: "{requires}", label: "Requirement" },
]

interface PresetTier { required: number; reward: number; name: string }

const PRESET_STARTER: PresetTier[] = [
  { required: 10, reward: 100, name: "Newcomer" },
  { required: 50, reward: 250, name: "Regular" },
  { required: 200, reward: 500, name: "Dedicated" },
  { required: 500, reward: 1000, name: "Expert" },
  { required: 1000, reward: 2000, name: "Master" },
]

const PRESET_STANDARD: PresetTier[] = [
  { required: 5, reward: 50, name: "Bronze I" },
  { required: 15, reward: 100, name: "Bronze II" },
  { required: 30, reward: 150, name: "Silver I" },
  { required: 60, reward: 200, name: "Silver II" },
  { required: 100, reward: 300, name: "Gold I" },
  { required: 200, reward: 500, name: "Gold II" },
  { required: 400, reward: 750, name: "Platinum I" },
  { required: 700, reward: 1000, name: "Platinum II" },
  { required: 1200, reward: 1500, name: "Diamond" },
  { required: 2000, reward: 3000, name: "Champion" },
]

const PRESET_HARDCORE: PresetTier[] = (() => {
  const names = ["Rookie", "Beginner", "Learner", "Apprentice", "Student", "Scholar", "Adept", "Expert", "Veteran", "Master", "Grandmaster", "Champion", "Legend", "Mythic", "Titan", "Sovereign", "Ascendant", "Transcendent", "Paragon", "Apex"]
  return names.map((name, i) => ({
    required: Math.round(5 * Math.pow(5000 / 5, i / 19)),
    reward: Math.round(100 + 2400 * Math.pow(i / 19, 0.9)),
    name,
  }))
})()

const PRESETS = [
  { id: "starter", name: "Starter (5 tiers)", tiers: PRESET_STARTER, description: "For small communities" },
  { id: "standard", name: "Standard (10 tiers)", tiers: PRESET_STANDARD, description: "For medium communities" },
  { id: "hardcore", name: "Hardcore (20 tiers)", tiers: PRESET_HARDCORE, description: "For large study communities" },
] as const

function scalePresetForTab(tiers: PresetTier[], tab: TabKey): PresetTier[] {
  const scale = tab === "VOICE" ? 0.1 : tab === "MESSAGE" ? 10 : 1
  return tiers.map((t) => ({ ...t, required: Math.round(t.required * scale) }))
}

// ── Component ──────────────────────────────────────────────

export default function RanksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  // --- AI-MODIFIED (2026-03-25) ---
  // Purpose: Moved activeTab state above hooks that reference it
  const [activeTab, setActiveTab] = useState<TabKey>("XP")
  const [initialTabSet, setInitialTabSet] = useState(false)
  // --- END AI-MODIFIED ---

  const { data, isLoading: loading, mutate } = useDashboard<RanksData>(
    id && session ? `/api/dashboard/servers/${id}/ranks` : null
  )
  // --- AI-MODIFIED (2026-03-25) ---
  // Purpose: Pass current tab type to rank-stats API for per-type analytics
  const { data: stats, mutate: mutateStats } = useDashboard<StatsData>(
    id && session ? `/api/dashboard/servers/${id}/rank-stats?type=${activeTab}` : null,
    { revalidateOnFocus: false }
  )
  // --- END AI-MODIFIED ---
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const { roleMap } = useRoles(guildId)
  const serverName = serverData?.server?.name || "Server"

  // --- AI-MODIFIED (2026-03-25) ---
  // Purpose: Set initial tab to guild's primary rank type when data first loads
  useEffect(() => {
    if (data?.rankType && !initialTabSet) {
      setActiveTab(data.rankType as TabKey)
      setInitialTabSet(true)
    }
  }, [data, initialTabSet])
  // --- END AI-MODIFIED ---

  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Rank | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editingRank, setEditingRank] = useState<Rank | null>(null)
  const [editForm, setEditForm] = useState({ required: 0, reward: 0, message: "" })
  const [addForm, setAddForm] = useState({ roleId: "", required: "", reward: "", message: "" })
  const [expandedRankIds, setExpandedRankIds] = useState<Set<number>>(new Set())
  const [expandedMembers, setExpandedMembers] = useState<Set<number>>(new Set())
  const [showSimulator, setShowSimulator] = useState(false)
  const [simPace, setSimPace] = useState(100)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showPresetDialog, setShowPresetDialog] = useState(false)
  const [presetConfirm, setPresetConfirm] = useState<typeof PRESETS[number] | null>(null)
  const [loadingPreset, setLoadingPreset] = useState(false)

  // --- AI-MODIFIED (2026-03-25) ---
  // Purpose: Unlock tabs for free switching between rank types
  // --- Original code (commented out for rollback) ---
  // const effectiveTab = (data?.rankType as TabKey) || activeTab
  // const currentTab = data?.rankType ? (data.rankType as TabKey) : activeTab
  // --- End original code ---
  const currentTab = activeTab
  const currentRanks = data ? (currentTab === "XP" ? data.xpRanks : currentTab === "VOICE" ? data.voiceRanks : data.msgRanks) : []
  const counts = data?.memberCounts?.[currentTab] || {}

  const isTypeEnabled = useCallback((tab: TabKey) => {
    if (!data) return false
    if (data.rankType === tab) return true
    if (tab === "VOICE") return data.voiceRanksEnabled
    if (tab === "MESSAGE") return data.msgRanksEnabled
    if (tab === "XP") return data.xpRanksEnabled
    return false
  }, [data])

  const toggleSecondaryType = useCallback(async (tab: TabKey) => {
    const fieldMap: Record<TabKey, string> = { VOICE: "voiceRanksEnabled", MESSAGE: "msgRanksEnabled", XP: "xpRanksEnabled" }
    const currentlyEnabled = tab === "VOICE" ? data?.voiceRanksEnabled : tab === "MESSAGE" ? data?.msgRanksEnabled : data?.xpRanksEnabled
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/ranks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldMap[tab]]: !currentlyEnabled }),
      })
      if (res.ok) { toast.success(`${tab} ranks ${currentlyEnabled ? "disabled" : "enabled"}`); mutate() }
      else toast.error("Failed to toggle")
    } catch { toast.error("Error toggling rank type") }
  }, [data, id, mutate])
  // --- END AI-MODIFIED ---

  // ── Inline Config ────────────────────────────────────────

  const patchConfig = useCallback(async (field: string, value: any) => {
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
      if (res.ok) {
        toast.success("Setting updated")
        mutate()
        mutateStats()
      } else toast.error("Failed to update")
    } catch { toast.error("Error updating setting") }
  }, [id, mutate, mutateStats])

  // ── CRUD ─────────────────────────────────────────────────

  const startEdit = (rank: Rank) => {
    setEditingRank(rank)
    setEditForm({
      required: inputRequiredValue(rank.required, currentTab),
      reward: rank.reward,
      message: rank.message || "",
    })
  }

  const saveEdit = async () => {
    if (!editingRank) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/ranks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rankType: currentTab,
          rankId: editingRank.rankId,
          required: outputRequiredValue(editForm.required, currentTab),
          reward: editForm.reward,
          message: editForm.message || null,
        }),
      })
      if (res.ok) { toast.success("Rank updated"); setEditingRank(null); mutate(); mutateStats() }
      else toast.error("Failed to update rank")
    } catch { toast.error("Error saving rank") }
    setSaving(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/ranks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankType: currentTab, rankId: deleteTarget.rankId }),
      })
      if (res.ok) { toast.success("Rank deleted"); mutate(); mutateStats() }
      else toast.error("Failed to delete")
    } catch { toast.error("Error deleting") }
    setDeleteTarget(null)
    setDeleting(false)
  }

  const addRank = async () => {
    if (!addForm.roleId || !addForm.required || !addForm.reward) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/ranks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rankType: currentTab,
          roleId: addForm.roleId,
          required: outputRequiredValue(parseInt(addForm.required), currentTab),
          reward: parseInt(addForm.reward),
          message: addForm.message || null,
        }),
      })
      if (res.ok) {
        toast.success("Rank added")
        setAddForm({ roleId: "", required: "", reward: "", message: "" })
        clearRoleCache(guildId)
        mutate()
        mutateStats()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to add rank")
      }
    } catch { toast.error("Error adding rank") }
    setSaving(false)
  }

  // ── Presets ──────────────────────────────────────────────

  const applyPreset = async () => {
    if (!presetConfirm || !id) return
    setLoadingPreset(true)
    const tab = currentTab
    const scaledTiers = scalePresetForTab(presetConfirm.tiers, tab)
    try {
      for (const rank of currentRanks) {
        await fetch(`/api/dashboard/servers/${id}/ranks`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rankType: tab, rankId: rank.rankId }),
        })
      }
      const roles = Object.entries(roleMap).filter(([, r]) => !r.managed && r.name !== "@everyone")
      const roleByName = new Map(roles.map(([rid, r]) => [r.name.toLowerCase(), rid]))
      const missing = scaledTiers.filter((t) => !roleByName.has(t.name.toLowerCase())).map((t) => t.name)
      if (missing.length > 0) {
        toast.error(`Create these roles first: ${missing.slice(0, 5).join(", ")}`)
        setLoadingPreset(false)
        setPresetConfirm(null)
        return
      }
      for (const tier of scaledTiers) {
        const roleId = roleByName.get(tier.name.toLowerCase())
        if (!roleId) continue
        await fetch(`/api/dashboard/servers/${id}/ranks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rankType: tab, roleId, required: tier.required, reward: tier.reward, message: null }),
        })
      }
      clearRoleCache(guildId)
      mutate()
      mutateStats()
      toast.success(`Loaded ${presetConfirm.name} preset`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to apply preset")
    }
    setLoadingPreset(false)
    setPresetConfirm(null)
  }

  // ── Health Analysis (useMemo) ────────────────────────────

  const healthInsights = useMemo(() => {
    if (!currentRanks.length) return []
    const sorted = [...currentRanks].sort((a, b) => a.required - b.required)
    const items: Array<{ type: "red" | "amber" | "green"; message: string }> = []

    for (const rank of sorted) {
      if (!roleMap[rank.roleId]) {
        items.push({ type: "red", message: `Role for rank at ${formatRequired(rank.required, currentTab)} was deleted from Discord or is inaccessible.` })
      }
    }

    const roleIds = sorted.map((r) => r.roleId)
    const dupes = roleIds.filter((id, i) => roleIds.indexOf(id) !== i)
    if (dupes.length > 0) {
      const dupeName = roleMap[dupes[0]]?.name || dupes[0]
      items.push({ type: "red", message: `Multiple ranks share the same role "${dupeName}". Each rank should use a unique role.` })
    }

    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].required - sorted[i - 1].required
      const prevGap = i > 1 ? sorted[i - 1].required - sorted[i - 2].required : gap
      if (gap > prevGap * 3 && gap > 10) {
        const nameA = roleMap[sorted[i - 1].roleId]?.name || `Rank ${i}`
        const nameB = roleMap[sorted[i].roleId]?.name || `Rank ${i + 1}`
        items.push({ type: "amber", message: `Large gap between ${nameA} and ${nameB} (${formatRequired(gap, currentTab)}) -- members may get stuck here.` })
      }
    }

    if (stats && stats.distribution.length > 0) {
      const first = stats.distribution[0]
      if (stats.rankedMembers > 0 && first.memberCount / stats.rankedMembers > 0.7) {
        items.push({ type: "amber", message: `${Math.round((first.memberCount / stats.rankedMembers) * 100)}% of ranked members are at the first rank -- consider adding lower tiers.` })
      }
      for (const d of stats.distribution) {
        if (d.memberCount === 0 && sorted.length > 2) {
          const name = roleMap[d.roleId]?.name || `Rank at ${formatRequired(d.required, currentTab)}`
          items.push({ type: "amber", message: `"${name}" has 0 members -- threshold may be too high.` })
        }
      }
    }

    if (items.length === 0 && sorted.length >= 3) {
      let gradual = true
      for (let i = 2; i < sorted.length; i++) {
        const gap = sorted[i].required - sorted[i - 1].required
        const prevGap = sorted[i - 1].required - sorted[i - 2].required
        if (gap < prevGap * 0.5) { gradual = false; break }
      }
      if (gradual) items.push({ type: "green", message: "Good pacing -- gaps increase gradually between ranks." })
    }

    return items
  }, [currentRanks, roleMap, stats, currentTab])

  // ── Simulator (useMemo) ──────────────────────────────────

  const simulatorResults = useMemo(() => {
    if (!showSimulator || !currentRanks.length || simPace <= 0) return []
    const sorted = [...currentRanks].sort((a, b) => a.required - b.required)
    const pacePerDay = currentTab === "VOICE" ? simPace * 3600 : simPace
    return sorted.map((rank) => {
      const days = Math.ceil(rank.required / pacePerDay)
      const name = roleMap[rank.roleId]?.name || `Rank ${rank.rankId}`
      return { name, days, required: rank.required }
    })
  }, [showSimulator, currentRanks, simPace, currentTab, roleMap])

  // ── Smart Suggestions (useMemo) ──────────────────────────

  const suggestions = useMemo(() => {
    if (!stats?.activityStats || stats.activityStats.activeMembersCount < 10) return null
    const s = stats.activityStats
    const tiers = [
      { label: "Entry Level", value: s.p25Stat, desc: "~25% of active members qualify" },
      { label: "Intermediate", value: s.medianStat, desc: "~50% qualify" },
      { label: "Advanced", value: s.p75Stat, desc: "~25% qualify" },
      { label: "Expert", value: Math.round(s.p75Stat * 1.5), desc: "top ~10%" },
      { label: "Master", value: Math.round(s.maxStat * 0.8), desc: "top ~2%" },
    ].filter((t) => t.value > 0)
    const deduped: typeof tiers = []
    for (const t of tiers) {
      if (deduped.length === 0 || t.value > deduped[deduped.length - 1].value * 1.2) deduped.push(t)
    }
    return { suggestions: deduped, avgStat: s.avgStatPerMember, activeCount: s.activeMembersCount }
  }, [stats])

  // ── Chart data ───────────────────────────────────────────

  const chartData = useMemo(() => {
    if (!stats?.distribution.length) return []
    return stats.distribution.map((d) => ({
      name: roleMap[d.roleId]?.name || `Rank ${d.rankId}`,
      members: d.memberCount,
      color: roleMap[d.roleId]?.colorHex || "#6366f1",
      rankId: d.rankId,
    }))
  }, [stats, roleMap])

  // ── Render ───────────────────────────────────────────────

  const sortedRanks = [...currentRanks].sort((a, b) => a.required - b.required)

  return (
    <Layout SEO={{ title: `Ranks - ${serverName} - LionBot`, description: "Rank command center" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
        {/* --- AI-REPLACED (2026-03-24) ---
            Reason: Migrate to DashboardShell for consistent layout
            --- Original code (commented out for rollback) ---
            <div className="min-h-screen bg-background pt-6 pb-20 px-4">
              <div className="max-w-5xl mx-auto flex gap-8">
                <ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />
                <div className="flex-1 min-w-0">
            --- End original code --- */}
        <DashboardShell nav={<ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />}>
        {/* --- END AI-REPLACED --- */}
              <PageHeader
                title="Ranks"
                description="Ranks reward members as they study. When a member reaches the required threshold, they automatically receive the role and a coin reward."
              />

              {/* --- AI-MODIFIED (2026-03-25) --- */}
              {/* Purpose: Added rank type tabs + secondary type toggles */}
              {/* ── Type Tabs ── */}
              {data && (
                <div className="flex items-center gap-1 mb-4 bg-card/30 border border-border rounded-xl p-1">
                  {(["VOICE", "XP", "MESSAGE"] as TabKey[]).map((tab) => {
                    const isPrimary = data.rankType === tab
                    const enabled = isTypeEnabled(tab)
                    const tabRanks = tab === "XP" ? data.xpRanks : tab === "VOICE" ? data.voiceRanks : data.msgRanks
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentTab === tab
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                        }`}
                      >
                        {tab === "VOICE" ? "Voice" : tab === "XP" ? "XP" : "Messages"}
                        {isPrimary && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">Primary</span>
                        )}
                        {!isPrimary && enabled && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">On</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">({tabRanks.length})</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* ── Secondary Type Toggle (if viewing a non-primary tab) ── */}
              {data && data.rankType !== currentTab && (
                <div className="flex items-center gap-3 mb-4 bg-card/50 border border-border rounded-xl px-4 py-3">
                  <Zap size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground flex-1">
                    {isTypeEnabled(currentTab)
                      ? `${currentTab} ranks are enabled as a secondary type. Members earn these roles alongside their primary ranks.`
                      : `${currentTab} ranks are not active. Enable to track and assign roles for this type independently.`}
                  </span>
                  <Toggle checked={isTypeEnabled(currentTab)} onChange={() => toggleSecondaryType(currentTab)} />
                </div>
              )}

              {/* ── Inline Config Bar ── */}
              {data && (
                <div className="bg-card/50 border border-border rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Primary Rank Type</label>
                      <SearchSelect
                        options={RANK_TYPE_OPTIONS}
                        value={data.rankType || null}
                        onChange={(v) => patchConfig("rank_type", v)}
                        placeholder="Select rank type"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rank-Up Channel</label>
                      <ChannelSelect
                        guildId={guildId}
                        value={data.rankChannel ?? null}
                        onChange={(v) => patchConfig("rank_channel", (v as string) || null)}
                        channelTypes={[0, 5]}
                        placeholder="Select channel"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-muted-foreground">DM Notifications</label>
                      <Toggle checked={data.dmRanks} onChange={(v) => patchConfig("dm_ranks", v)} />
                    </div>
                  </div>
                </div>
              )}
              {/* --- END AI-MODIFIED --- */}

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse h-20" />)}
                </div>
              ) : !data ? (
                <div className="text-center py-20 text-muted-foreground">Unable to load ranks data</div>
              ) : (
                <>
                  {/* ── Stats Cards ── */}
                  {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div className="bg-card/50 border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Trophy size={14} />
                          <span className="text-xs font-medium">Total Ranks</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{currentRanks.length}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{unitForType(currentTab)} based</p>
                      </div>
                      <div className="bg-card/50 border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Users size={14} />
                          <span className="text-xs font-medium">Ranked Members</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {stats.rankedMembers}
                          <span className="text-sm font-normal text-muted-foreground ml-1">/ {stats.totalMembers}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {stats.totalMembers > 0 ? `${Math.round((stats.rankedMembers / stats.totalMembers) * 100)}% ranked` : "No members"}
                        </p>
                      </div>
                      <div className="bg-card/50 border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Target size={14} />
                          <span className="text-xs font-medium">Unranked</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.unrankedMembers}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">haven't reached first rank</p>
                      </div>
                    </div>
                  )}

                  {/* ── Health Analysis ── */}
                  {healthInsights.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {healthInsights.map((h, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2.5 px-4 py-2.5 rounded-lg border ${
                            h.type === "red"
                              ? "bg-red-500/10 border-red-500/20"
                              : h.type === "amber"
                              ? "bg-amber-500/10 border-amber-500/20"
                              : "bg-emerald-500/10 border-emerald-500/20"
                          }`}
                        >
                          {h.type === "red" ? <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                            : h.type === "amber" ? <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                            : <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />}
                          <p className={`text-xs leading-relaxed ${
                            h.type === "red" ? "text-red-300/90" : h.type === "amber" ? "text-amber-300/90" : "text-emerald-300/90"
                          }`}>{h.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Distribution Chart ── */}
                  {chartData.length > 0 && (
                    <div className="bg-card/50 border border-border rounded-xl p-5 mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={16} className="text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">Member Distribution</h3>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                          <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", fontSize: "12px" }}
                            labelStyle={{ color: "#e5e7eb" }}
                            formatter={(value: number) => [`${value} members`, "Members"]}
                          />
                          <Bar dataKey="members" radius={[4, 4, 0, 0]}>
                            {chartData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* ── Visual Rank Ladder ── */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ArrowUp size={16} className="text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">Rank Ladder</h3>
                        <span className="text-xs text-muted-foreground">({currentRanks.length} tiers)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPresetDialog(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg hover:bg-accent/30 transition-colors"
                        >
                          <Download size={13} /> Load Preset
                        </button>
                      </div>
                    </div>

                    {sortedRanks.length === 0 ? (
                      <EmptyState
                        icon={<Trophy size={48} strokeWidth={1} />}
                        title={`No ${currentTab.toLowerCase()} ranks configured`}
                        description={`Add your first rank tier below. Members will earn this role when they reach the required ${unitForType(currentTab)}.`}
                      />
                    ) : (
                      <div className="relative pl-8">
                        {/* Vertical line */}
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-t from-border via-primary/30 to-primary/60 rounded-full" />

                        {[...sortedRanks].reverse().map((rank, idx) => {
                          const reverseIdx = sortedRanks.length - 1 - idx
                          const prevRank = reverseIdx > 0 ? sortedRanks[reverseIdx - 1] : null
                          const gap = prevRank ? rank.required - prevRank.required : rank.required
                          const role = roleMap[rank.roleId]
                          const memberCount = counts[rank.rankId] || 0
                          const isEditing = editingRank?.rankId === rank.rankId
                          const isExpanded = expandedRankIds.has(rank.rankId)
                          const membersExpanded = expandedMembers.has(rank.rankId)
                          const distEntry = stats?.distribution.find((d) => d.rankId === rank.rankId)

                          return (
                            <div key={rank.rankId} className="relative mb-1">
                              {/* Gap marker */}
                              {idx > 0 && (
                                <div className="flex items-center gap-2 ml-4 mb-1 -mt-1">
                                  <div className="text-[10px] text-muted-foreground/60 font-mono">
                                    +{formatRequired(gap, currentTab)} gap
                                  </div>
                                </div>
                              )}

                              {/* Node dot */}
                              <div
                                className="absolute left-[-20.5px] top-4 w-3 h-3 rounded-full border-2 border-background z-10"
                                style={{ backgroundColor: role?.colorHex || "#6366f1" }}
                              />

                              {/* Rank card */}
                              <div
                                className="bg-card/50 border border-border rounded-xl overflow-hidden transition-colors hover:border-border/80"
                                style={{ borderLeftColor: role?.colorHex || "#6366f1", borderLeftWidth: "3px" }}
                              >
                                <div className="px-4 py-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: role?.colorHex || "#6366f1" }}
                                      />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-sm text-foreground truncate">
                                            {role?.name || `Role ${rank.roleId}`}
                                          </span>
                                          <span className="text-xs text-muted-foreground font-mono">
                                            {formatRequired(rank.required, currentTab)}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5">
                                          {rank.reward > 0 && (
                                            <span className="flex items-center gap-1 text-xs text-amber-400">
                                              <Coins size={11} /> {rank.reward}
                                            </span>
                                          )}
                                          <button
                                            onClick={() => {
                                              const next = new Set(expandedMembers)
                                              next.has(rank.rankId) ? next.delete(rank.rankId) : next.add(rank.rankId)
                                              setExpandedMembers(next)
                                            }}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                          >
                                            <Users size={11} /> {memberCount} member{memberCount !== 1 ? "s" : ""}
                                          </button>
                                          {rank.message && (
                                            <button
                                              onClick={() => {
                                                const next = new Set(expandedRankIds)
                                                next.has(rank.rankId) ? next.delete(rank.rankId) : next.add(rank.rankId)
                                                setExpandedRankIds(next)
                                              }}
                                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                              <MessageSquare size={11} /> Message
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button onClick={() => startEdit(rank)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                                        <Pencil size={14} />
                                      </button>
                                      <button onClick={() => setDeleteTarget(rank)} className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Expanded message */}
                                  {isExpanded && rank.message && (
                                    <div className="mt-3 pt-3 border-t border-border/50">
                                      <p className="text-xs text-muted-foreground mb-1">Rank-up message:</p>
                                      <div className="bg-[#2f3136] rounded-md p-3 text-xs text-[#dcddde] leading-relaxed whitespace-pre-wrap">
                                        {rank.message
                                          .replace(/\{user_mention\}/g, "@NewMember")
                                          .replace(/\{user_name\}/g, "NewMember")
                                          .replace(/\{role_name\}/g, role?.name || "Role")
                                          .replace(/\{role_mention\}/g, `@${role?.name || "Role"}`)
                                          .replace(/\{guild_name\}/g, serverName)
                                          .replace(/\{requires\}/g, formatRequired(rank.required, currentTab))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Expanded members */}
                                  {membersExpanded && distEntry && (
                                    <div className="mt-3 pt-3 border-t border-border/50">
                                      {distEntry.members.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No members at this rank yet.</p>
                                      ) : (
                                        <div className="flex flex-wrap gap-2">
                                          {distEntry.members.map((m) => (
                                            <div key={m.userId} className="flex items-center gap-1.5 bg-background/50 rounded-full px-2 py-1">
                                              {m.avatar ? (
                                                <img src={m.avatar} alt="" className="w-4 h-4 rounded-full" />
                                              ) : (
                                                <div className="w-4 h-4 rounded-full bg-muted" />
                                              )}
                                              <span className="text-[11px] text-foreground/80">{m.displayName}</span>
                                            </div>
                                          ))}
                                          {memberCount > distEntry.members.length && (
                                            <span className="text-[11px] text-muted-foreground self-center">+{memberCount - distEntry.members.length} more</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Edit panel */}
                                {isEditing && (
                                  <div className="px-4 py-3 bg-primary/5 border-t border-primary/20">
                                    {/* --- AI-MODIFIED (2026-03-21) --- */}
                                    {/* Purpose: Stack edit panel grids on mobile */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                    {/* --- END AI-MODIFIED --- */}
                                      {/* --- AI-REPLACED (2026-03-24) ---
                                          Reason: Replace raw inputs with shared NumberInput component
                                          What the new code does better: Consistent styling, focus:ring-ring, built-in label + validation
                                          --- Original code (commented out for rollback) ---
                                          <div><label>Required (...)</label><input type="number" value={editForm.required} ... /></div>
                                          <div><label>Coin Reward</label><input type="number" value={editForm.reward} ... /></div>
                                          --- End original code --- */}
                                      <NumberInput
                                        label={`Required (${unitForType(currentTab)})`}
                                        value={editForm.required}
                                        onChange={(v) => setEditForm((f) => ({ ...f, required: v ?? 0 }))}
                                        min={0}
                                      />
                                      <NumberInput
                                        label="Coin Reward"
                                        value={editForm.reward}
                                        onChange={(v) => setEditForm((f) => ({ ...f, reward: v ?? 0 }))}
                                        min={0}
                                      />
                                      {/* --- END AI-REPLACED --- */}
                                    </div>
                                    <div className="mb-3">
                                      <label className="block text-xs font-medium text-muted-foreground mb-1">Rank-Up Message</label>
                                      <textarea
                                        value={editForm.message}
                                        onChange={(e) => setEditForm((f) => ({ ...f, message: e.target.value }))}
                                        placeholder="Congratulations {user_mention}! You've reached {role_name}!"
                                        rows={2}
                                        className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                      />
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {TEMPLATE_VARS.map((v) => (
                                          <button
                                            key={v.key}
                                            onClick={() => setEditForm((f) => ({ ...f, message: f.message + v.key }))}
                                            className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                                          >
                                            {v.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    {editForm.message && (
                                      <div className="mb-3">
                                        <p className="text-[10px] text-muted-foreground mb-1">Preview:</p>
                                        <div className="bg-[#2f3136] rounded-md p-2 text-xs text-[#dcddde] leading-relaxed whitespace-pre-wrap">
                                          {editForm.message
                                            .replace(/\{user_mention\}/g, "@NewMember")
                                            .replace(/\{user_name\}/g, "NewMember")
                                            .replace(/\{role_name\}/g, role?.name || "Role")
                                            .replace(/\{role_mention\}/g, `@${role?.name || "Role"}`)
                                            .replace(/\{guild_name\}/g, serverName)
                                            .replace(/\{requires\}/g, formatRequired(outputRequiredValue(editForm.required, currentTab), currentTab))}
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <button onClick={saveEdit} disabled={saving} className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-foreground text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
                                        {saving ? "Saving..." : "Save Changes"}
                                      </button>
                                      <button onClick={() => setEditingRank(null)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* ── Add Rank Form ── */}
                    <div className="bg-card/50 border border-border rounded-xl p-5 mt-4">
                      <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                        <Plus size={16} />
                        Add New Rank
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">Select the role members will receive and set the requirement threshold.</p>
                      {/* --- AI-MODIFIED (2026-03-21) --- */}
                      {/* Purpose: Stack add form on mobile */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      {/* --- END AI-MODIFIED --- */}
                        <RoleSelect
                          guildId={guildId}
                          value={addForm.roleId}
                          onChange={(v) => setAddForm((f) => ({ ...f, roleId: (v as string) || "" }))}
                          label="Role"
                          placeholder="Select a role..."
                        />
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-1">Required ({unitForType(currentTab)})</label>
                          <input
                            type="number"
                            value={addForm.required}
                            onChange={(e) => setAddForm((f) => ({ ...f, required: e.target.value }))}
                            placeholder={currentTab === "VOICE" ? "e.g. 10" : currentTab === "MESSAGE" ? "e.g. 500" : "e.g. 1000"}
                            className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-1">Coin Reward</label>
                          <input
                            type="number"
                            value={addForm.reward}
                            onChange={(e) => setAddForm((f) => ({ ...f, reward: e.target.value }))}
                            placeholder="e.g. 500"
                            className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-1">Rank-Up Message</label>
                          <input
                            type="text"
                            value={addForm.message}
                            onChange={(e) => setAddForm((f) => ({ ...f, message: e.target.value }))}
                            placeholder="Optional -- use {user_mention}, {role_name}..."
                            className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                      <button
                        onClick={addRank}
                        disabled={saving || !addForm.roleId || !addForm.required || !addForm.reward}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-foreground rounded-lg text-sm font-medium transition-all"
                      >
                        <Plus size={16} />
                        {saving ? "Adding..." : "Add Rank"}
                      </button>
                    </div>
                  </div>

                  {/* ── Rank Simulator ── */}
                  <div className="bg-card/50 border border-border rounded-xl overflow-hidden mb-6">
                    <button
                      onClick={() => setShowSimulator(!showSimulator)}
                      className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calculator size={16} className="text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Rank Simulator</span>
                        <span className="text-xs text-muted-foreground">How long to reach each rank?</span>
                      </div>
                      {showSimulator ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                    </button>
                    {showSimulator && (
                      <div className="px-5 pb-4 border-t border-border/50">
                        <div className="flex items-center gap-3 my-3">
                          <label className="text-xs text-muted-foreground whitespace-nowrap">Daily pace:</label>
                          <input
                            type="number"
                            value={simPace}
                            onChange={(e) => setSimPace(parseInt(e.target.value) || 0)}
                            className="w-24 bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <span className="text-xs text-muted-foreground">{unitForType(currentTab)}/day</span>
                        </div>
                        {simulatorResults.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {simulatorResults.map((r, i) => (
                              <div key={i} className="bg-background/50 rounded-lg px-3 py-2">
                                <p className="text-xs font-medium text-foreground truncate">{r.name}</p>
                                <p className="text-lg font-bold text-primary">
                                  {r.days === 1 ? "Day 1" : `Day ${r.days}`}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{formatRequired(r.required, currentTab)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Smart Suggestions ── */}
                  {suggestions && (
                    <div className="bg-card/50 border border-border rounded-xl overflow-hidden mb-6">
                      <button
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-accent/20 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb size={16} className="text-amber-400" />
                          <span className="text-sm font-semibold text-foreground">Suggested Thresholds</span>
                          <span className="text-xs text-muted-foreground">Based on {suggestions.activeCount} active members</span>
                        </div>
                        {showSuggestions ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                      </button>
                      {showSuggestions && (
                        <div className="px-5 pb-4 border-t border-border/50 pt-3">
                          <p className="text-xs text-muted-foreground mb-3">
                            Based on your members' activity (avg {formatStat(suggestions.avgStat, currentTab)} per member), we suggest these thresholds for a balanced distribution:
                          </p>
                          <div className="space-y-2 mb-4">
                            {suggestions.suggestions.map((s, i) => (
                              <div key={i} className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2">
                                <div>
                                  <span className="text-xs font-medium text-foreground">{s.label}</span>
                                  <span className="text-[10px] text-muted-foreground ml-2">{s.desc}</span>
                                </div>
                                <span className="text-sm font-mono text-primary">{formatStat(s.value, currentTab)}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Info size={10} /> These are suggestions only. Create matching roles in Discord and add ranks manually above.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Near Next Rank ── */}
                  {stats && stats.nearNextRank.length > 0 && (
                    <div className="bg-card/50 border border-border rounded-xl p-5 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={16} className="text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">Close to Ranking Up</h3>
                      </div>
                      <div className="space-y-2">
                        {stats.nearNextRank.map((m) => (
                          <div key={m.userId} className="flex items-center gap-3">
                            {m.avatar ? (
                              <img src={m.avatar} alt="" className="w-6 h-6 rounded-full flex-shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-medium text-foreground truncate">{m.displayName}</span>
                                <span className="text-[10px] text-muted-foreground">{m.percentComplete}%</span>
                              </div>
                              <div className="w-full bg-background rounded-full h-1.5">
                                <div
                                  className="bg-primary h-1.5 rounded-full transition-all"
                                  style={{ width: `${m.percentComplete}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {formatStat(m.currentStat, currentTab)} / {formatStat(m.nextRequired, currentTab)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
        {/* --- AI-REPLACED (2026-03-24) --- Original: </div></div></div> --- */}
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}

        {/* ── Modals ── */}
        <ConfirmModal
          open={!!deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          title="Delete Rank Tier"
          message="This will permanently remove this rank tier. Members who already have this role will keep it, but no new members will earn it."
          confirmLabel="Delete Rank"
          variant="danger"
          loading={deleting}
        />

        <ConfirmModal
          open={showPresetDialog}
          onConfirm={() => {}}
          onCancel={() => setShowPresetDialog(false)}
          title="Load Rank Preset"
          message={`Choose a preset to replace all current ${currentTab.toLowerCase()} ranks. Make sure matching roles exist in your Discord server first.`}
          confirmLabel=""
          customContent={
            <div className="space-y-2 py-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setShowPresetDialog(false); setPresetConfirm(p) }}
                  className="w-full text-left px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.description}</div>
                </button>
              ))}
            </div>
          }
        />

        <ConfirmModal
          open={!!presetConfirm}
          onConfirm={applyPreset}
          onCancel={() => setPresetConfirm(null)}
          title="Confirm Preset"
          message={presetConfirm ? `This will replace all current ${currentTab.toLowerCase()} ranks with the ${presetConfirm.name} preset. Continue?` : ""}
          confirmLabel="Load Preset"
          loading={loadingPreset}
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
