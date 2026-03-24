// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Economy Command Center - comprehensive analytics,
//          leaderboard, transaction explorer, and admin tools
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: DashboardShell layout migration
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Link component for Private Rooms cross-link
import Link from "next/link"
// --- END AI-MODIFIED ---
import { PageHeader, Badge, toast, ConfirmModal } from "@/components/dashboard/ui"
import Pagination from "@/components/dashboard/ui/Pagination"
import MemberDetailPanel from "@/components/dashboard/MemberDetailPanel"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useCallback, useEffect } from "react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import TabBar from "@/components/dashboard/ui/TabBar"
import {
  Coins, TrendingUp, TrendingDown, Users, ArrowUpDown, Download,
  ShoppingBag, Settings, ExternalLink, AlertTriangle, CheckCircle,
  Lightbulb, Home, Search, RotateCcw,
  Wallet, BarChart3, Gift, Minus, RefreshCw, Info
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts"

// ---- Types ----

interface EconomyStats {
  summary: {
    totalCoins: number; memberCount: number; avgBalance: number
    activeMembers7d: number; coinsEarnedToday: number; coinsSpentToday: number
    coinsEarnedWeek: number; coinsSpentWeek: number
    coinsEarnedLastWeek: number; coinsSpentLastWeek: number
    netFlowWeek: number; activeRooms: number; coinsInRoomBanks: number
  }
  dailyFlow: Array<{ date: string; earned: number; spent: number; transactions: number }>
  incomeBreakdown: Array<{ type: string; total: number; count: number }>
  spendingBreakdown: Array<{ type: string; total: number; count: number }>
  distribution: { zero: number; low: number; medium: number; high: number; whale: number }
  topEarnersWeek: Array<{ userId: string; displayName: string; avatarUrl: string; earned: number }>
  shopAnalytics: {
    bestSellers: Array<{ itemId: number; itemType: string; price: number; purchaseCount: number; totalRevenue: number }>
    neverPurchased: number; totalShopRevenue30d: number
  }
  healthTips: string[]
}

interface TxResponse {
  transactions: Array<{
    id: number; type: string; amount: number; bonus: number
    actorId: string; actorName: string; actorAvatarUrl: string
    fromAccount: string | null; fromName: string | null
    toAccount: string | null; toName: string | null; createdAt: string
  }>
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

interface ServerConfig {
  study_hourly_reward: number | null; study_hourly_live_bonus: number | null
  starting_funds: number | null; allow_transfers: boolean | null
  coins_per_centixp: number | null; task_reward: number | null
  task_reward_limit: number | null
}

// ---- Constants ----

const TX_TYPE_CONFIG: Record<string, { label: string; color: string; variant: "default" | "success" | "warning" | "error" | "info" | "purple" }> = {
  VOICE_SESSION: { label: "Voice Study", color: "#22c55e", variant: "success" },
  TEXT_SESSION: { label: "Text Activity", color: "#3b82f6", variant: "info" },
  TASKS: { label: "Task Reward", color: "#8b5cf6", variant: "purple" },
  SCHEDULE_BOOK: { label: "Session Booking", color: "#f59e0b", variant: "warning" },
  SCHEDULE_REWARD: { label: "Attendance Reward", color: "#06b6d4", variant: "info" },
  SHOP_PURCHASE: { label: "Shop Purchase", color: "#ef4444", variant: "error" },
  TRANSFER: { label: "Member Transfer", color: "#a855f7", variant: "purple" },
  ADMIN: { label: "Admin Action", color: "#f97316", variant: "warning" },
  REFUND: { label: "Refund", color: "#6b7280", variant: "default" },
  OTHER: { label: "Other", color: "#9ca3af", variant: "default" },
}

const CHART_COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#f97316", "#a855f7", "#6b7280"]

const TX_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "VOICE_SESSION", label: "Voice Study" },
  { value: "TEXT_SESSION", label: "Text Activity" },
  { value: "TASKS", label: "Task Reward" },
  { value: "SHOP_PURCHASE", label: "Shop Purchase" },
  { value: "TRANSFER", label: "Member Transfer" },
  { value: "ADMIN", label: "Admin Action" },
  { value: "REFUND", label: "Refund" },
  { value: "SCHEDULE_BOOK", label: "Session Booking" },
  { value: "SCHEDULE_REWARD", label: "Attendance Reward" },
  { value: "OTHER", label: "Other" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "largest", label: "Largest Amount" },
  { value: "smallest", label: "Smallest Amount" },
]

// ---- Helpers ----

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted/50 rounded-lg ${className}`} />
}

function deltaPercent(current: number, previous: number): { text: string; positive: boolean } | null {
  if (previous === 0 && current === 0) return null
  if (previous === 0) return { text: "New", positive: current > 0 }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return null
  return { text: `${pct > 0 ? "+" : ""}${pct}%`, positive: pct > 0 }
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "--"
  return new Date(dateStr).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

// ---- Stat Card ----

function StatCard({ icon, label, value, subtitle, delta, color }: {
  icon: React.ReactNode; label: string; value: string; subtitle?: string
  delta?: { text: string; positive: boolean } | null; color?: string
}) {
  return (
    <div className="bg-card/50 border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
        </div>
        {delta && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            delta.positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}>
            {delta.positive ? <TrendingUp size={10} className="inline mr-0.5" /> : <TrendingDown size={10} className="inline mr-0.5" />}
            {delta.text}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${color || "text-foreground"}`}>{value}</p>
      {subtitle && <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ---- Custom Tooltip for charts ----

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

// ---- Main Component ----

export default function EconomyPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query

  const [tab, setTab] = useState<"overview" | "leaderboard" | "transactions" | "admin">("overview")

  // Transaction filters
  const [txType, setTxType] = useState("all")
  const [txSort, setTxSort] = useState("newest")
  const [txSearch, setTxSearch] = useState("")
  const [txSearchInput, setTxSearchInput] = useState("")
  const [txPage, setTxPage] = useState(1)

  // Bulk operations
  const [bulkOp, setBulkOp] = useState<"give" | "take" | "set" | "reset">("give")
  const [bulkTarget, setBulkTarget] = useState<"all" | "active" | "inactive">("all")
  const [bulkAmount, setBulkAmount] = useState("")
  const [bulkReason, setBulkReason] = useState("")
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  // Member panel
  const [panelUserId, setPanelUserId] = useState<string | null>(null)

  // Data fetching
  const statsKey = id && session ? `/api/dashboard/servers/${id}/economy-stats` : null
  const { data: stats, isLoading: statsLoading } = useDashboard<EconomyStats>(statsKey)

  const txParams = new URLSearchParams()
  if (txType !== "all") txParams.set("type", txType)
  if (txSearch) txParams.set("search", txSearch)
  txParams.set("sort", txSort)
  txParams.set("page", String(txPage))
  const txKey = id && session ? `/api/dashboard/servers/${id}/transactions?${txParams}` : null
  const { data: txData, isLoading: txLoading } = useDashboard<TxResponse>(
    tab === "transactions" || tab === "leaderboard" ? txKey : null
  )

  const configKey = id && session ? `/api/dashboard/servers/${id}/config` : null
  const { data: configData } = useDashboard<ServerConfig>(tab === "overview" ? configKey : null)

  const { data: serverData } = useDashboard(id && session ? `/api/dashboard/servers/${id}` : null)
  const { data: permsData } = useDashboard(id && session ? `/api/dashboard/servers/${id}/permissions` : null)

  const panelDetailKey = panelUserId && id ? `/api/dashboard/servers/${id}/members/${panelUserId}` : null
  const { data: panelData, isLoading: panelLoading, error: panelError } = useDashboard(panelDetailKey)

  useEffect(() => {
    if (panelError && panelUserId) {
      toast.error("Could not load member details. This user may not have a profile in this server.")
      setPanelUserId(null)
    }
  }, [panelError, panelUserId])

  const bulkCountKey = id && session && tab === "admin" ? `/api/dashboard/servers/${id}/economy-bulk?target=${bulkTarget}` : null
  const { data: bulkCountData } = useDashboard<{ count: number }>(bulkCountKey)

  // Leaderboard: reuse economy API for top holders
  const econKey = id && session ? `/api/dashboard/servers/${id}/economy` : null
  const { data: econData } = useDashboard(tab === "leaderboard" ? econKey : null)

  const serverName = (serverData as any)?.server?.name ?? "Server"
  const isAdmin = (permsData as any)?.isAdmin ?? false

  const handleTxSearch = () => { setTxSearch(txSearchInput); setTxPage(1) }

  const handleCsvExport = async () => {
    const params = new URLSearchParams()
    if (txType !== "all") params.set("type", txType)
    if (txSearch) params.set("search", txSearch)
    params.set("sort", txSort)
    params.set("format", "csv")
    const url = `/api/dashboard/servers/${id}/transactions?${params}`
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `transactions-${id}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
      toast.success("CSV exported")
    } catch {
      toast.error("Failed to export CSV")
    }
  }

  const handleBulkSubmit = async () => {
    setBulkLoading(true)
    try {
      const body: any = { operation: bulkOp, target: bulkTarget, reason: bulkReason }
      if (bulkOp !== "reset") body.amount = parseInt(bulkAmount)
      const result = await dashboardMutate("POST", `/api/dashboard/servers/${id}/economy-bulk`, body)
      toast.success(result.message || `Operation completed for ${result.affected} members`)
      setBulkConfirmOpen(false)
      setBulkAmount("")
      setBulkReason("")
      if (statsKey) invalidate(statsKey)
    } catch (err: any) {
      toast.error(err.message || "Bulk operation failed")
    } finally {
      setBulkLoading(false)
    }
  }

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "leaderboard" as const, label: "Leaderboard" },
    { key: "transactions" as const, label: "Transactions" },
    ...(isAdmin ? [{ key: "admin" as const, label: "Admin Tools" }] : []),
  ]

  const s = stats?.summary

  return (
    <Layout SEO={{ title: `Economy - ${serverName} - LionBot`, description: "Economy command center" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="moderator">
        {/* --- AI-REPLACED (2026-03-24) ---
            Reason: Migrate to DashboardShell for consistent layout
            --- Original code (commented out for rollback) ---
            <div className="min-h-screen bg-background pt-6 pb-20 px-4">
              <div className="max-w-6xl mx-auto flex gap-8">
                <ServerNav serverId={id as string} serverName={serverName} isAdmin={isAdmin} isMod={...} />
                <div className="flex-1 min-w-0 space-y-6">
            --- End original code --- */}
        <DashboardShell nav={<ServerNav serverId={id as string} serverName={serverName} isAdmin={isAdmin} isMod={(permsData as any)?.isModerator} />}>
              <PageHeader
                title="Economy"
                description="Track coin flow, analyze trends, manage balances, and keep your server's economy healthy. All data shown is from LionBot, not Discord."
              />

              {/* Tabs */}
              {/* --- AI-REPLACED (2026-03-24) ---
                  Reason: Migrated from custom inline tabs with amber underline to shared TabBar component
                  --- Original code (commented out for rollback) ---
                  <div className="flex gap-1 border-b border-border overflow-x-auto">
                    {tabs.map((t) => (
                      <button key={t.key} onClick={() => setTab(t.key)}
                        className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                          tab === t.key ? "text-amber-400" : "text-muted-foreground hover:text-foreground"
                        }`}>
                        {t.label}
                        {tab === t.key && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                  --- End original code --- */}
              <TabBar tabs={tabs} active={tab} onChange={setTab} variant="underline" />
              {/* --- END AI-REPLACED --- */}

              {/* ==================== OVERVIEW TAB ==================== */}
              {tab === "overview" && (
                <div className="space-y-6">
                  {statsLoading || !s ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28" />)}
                      </div>
                      <Skeleton className="h-64" />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard
                          icon={<Coins size={18} className="text-amber-400" />}
                          label="Total Coins"
                          value={formatNum(s.totalCoins)}
                          subtitle="in circulation"
                        />
                        <StatCard
                          icon={<Users size={18} className="text-blue-400" />}
                          label="Active Members"
                          value={s.activeMembers7d.toLocaleString()}
                          subtitle="transacted in 7 days"
                        />
                        <StatCard
                          icon={<TrendingUp size={18} className="text-emerald-400" />}
                          label="Earned This Week"
                          value={formatNum(s.coinsEarnedWeek)}
                          delta={deltaPercent(s.coinsEarnedWeek, s.coinsEarnedLastWeek)}
                          color="text-emerald-400"
                        />
                        <StatCard
                          icon={<TrendingDown size={18} className="text-red-400" />}
                          label="Spent This Week"
                          value={formatNum(s.coinsSpentWeek)}
                          delta={deltaPercent(s.coinsSpentWeek, s.coinsSpentLastWeek)}
                          color="text-red-400"
                        />
                        <StatCard
                          icon={<ArrowUpDown size={18} className={s.netFlowWeek > 0 ? "text-amber-400" : s.netFlowWeek < 0 ? "text-emerald-400" : "text-muted-foreground"} />}
                          label="Net Flow"
                          value={`${s.netFlowWeek >= 0 ? "+" : ""}${formatNum(s.netFlowWeek)}`}
                          subtitle={s.netFlowWeek > 0 ? "inflationary" : s.netFlowWeek < 0 ? "deflationary" : "balanced"}
                          color={s.netFlowWeek > 0 ? "text-amber-400" : s.netFlowWeek < 0 ? "text-emerald-400" : "text-foreground"}
                        />
                        <StatCard
                          icon={<Wallet size={18} className="text-purple-400" />}
                          label="Avg Balance"
                          value={formatNum(s.avgBalance)}
                          subtitle={`across ${s.memberCount} members`}
                        />
                      </div>

                      {/* Rooms Snapshot */}
                      {/* --- AI-MODIFIED (2026-03-22) --- */}
                      {/* Purpose: Add cross-link to Private Rooms admin panel */}
                      {(s.activeRooms > 0 || s.coinsInRoomBanks > 0) && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-card/30 border border-border rounded-lg text-sm text-muted-foreground">
                          <Home size={14} />
                          <span className="flex-1">
                            <strong className="text-foreground">{s.activeRooms}</strong> active room{s.activeRooms !== 1 ? "s" : ""} with{" "}
                            <strong className="text-amber-400">{s.coinsInRoomBanks.toLocaleString()}</strong> coins in room banks
                          </span>
                          <Link href={`/dashboard/servers/${router.query.id}/rooms`}>
                            <a className="text-xs text-primary hover:text-primary/80 font-medium whitespace-nowrap">View Rooms →</a>
                          </Link>
                        </div>
                      )}
                      {/* --- END AI-MODIFIED --- */}

                      {/* Health Tips */}
                      {stats.healthTips.length > 0 && (
                        <div className={`border rounded-xl p-4 space-y-2 ${
                          stats.healthTips[0].includes("healthy")
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-amber-500/30 bg-amber-500/5"
                        }`}>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            {stats.healthTips[0].includes("healthy")
                              ? <><CheckCircle size={16} className="text-emerald-400" /><span className="text-emerald-400">Economy Health</span></>
                              : <><Lightbulb size={16} className="text-amber-400" /><span className="text-amber-400">Economy Insights</span></>
                            }
                          </div>
                          {stats.healthTips.map((tip, i) => (
                            <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                              {tip}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Coin Flow Chart */}
                      <div className="bg-card/50 border border-border rounded-xl p-5">
                        <h3 className="text-lg font-bold text-foreground mb-1">Coin Flow</h3>
                        <p className="text-xs text-muted-foreground mb-4">Daily coins earned vs spent over the last 30 days</p>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.dailyFlow} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="#666" tick={{ fontSize: 11 }} />
                              <YAxis stroke="#666" tick={{ fontSize: 11 }} tickFormatter={formatNum} />
                              <RechartsTooltip content={<ChartTooltip />} />
                              <Area type="monotone" dataKey="earned" name="Earned" stroke="#22c55e" fill="url(#earnedGrad)" strokeWidth={2} />
                              <Area type="monotone" dataKey="spent" name="Spent" stroke="#ef4444" fill="url(#spentGrad)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Income vs Spending Breakdown */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PieSection
                          title="Income Sources"
                          subtitle="Where coins come from (30 days)"
                          data={stats.incomeBreakdown}
                        />
                        <PieSection
                          title="Spending Sinks"
                          subtitle="Where coins go (30 days)"
                          data={stats.spendingBreakdown}
                        />
                      </div>

                      {/* Balance Distribution */}
                      <div className="bg-card/50 border border-border rounded-xl p-5">
                        <h3 className="text-lg font-bold text-foreground mb-1">Balance Distribution</h3>
                        <p className="text-xs text-muted-foreground mb-4">How coins are distributed across members</p>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { range: "0", count: stats.distribution.zero, fill: "#6b7280" },
                              { range: "1-100", count: stats.distribution.low, fill: "#3b82f6" },
                              { range: "101-1K", count: stats.distribution.medium, fill: "#22c55e" },
                              { range: "1K-10K", count: stats.distribution.high, fill: "#f59e0b" },
                              { range: "10K+", count: stats.distribution.whale, fill: "#ef4444" },
                            ]} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="range" stroke="#666" tick={{ fontSize: 12 }} />
                              <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                              <RechartsTooltip content={<ChartTooltip />} />
                              <Bar dataKey="count" name="Members" radius={[4, 4, 0, 0]}>
                                {[
                                  { range: "0", fill: "#6b7280" },
                                  { range: "1-100", fill: "#3b82f6" },
                                  { range: "101-1K", fill: "#22c55e" },
                                  { range: "1K-10K", fill: "#f59e0b" },
                                  { range: "10K+", fill: "#ef4444" },
                                ].map((entry, index) => (
                                  <Cell key={index} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Shop Analytics + Settings Preview */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Shop Analytics */}
                        <div className="bg-card/50 border border-border rounded-xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <ShoppingBag size={18} className="text-amber-400" />
                                Shop Analytics
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
                            </div>
                            <button
                              onClick={() => router.push(`/dashboard/servers/${id}/shop`)}
                              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                            >
                              Edit Shop <ExternalLink size={12} />
                            </button>
                          </div>
                          {/* --- AI-MODIFIED (2026-03-21) --- */}
                          {/* Purpose: Stack shop analytics blocks on mobile */}
                          <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-1 bg-background/50 rounded-lg p-3 text-center">
                              <p className="text-lg font-bold text-amber-400">{formatNum(stats.shopAnalytics.totalShopRevenue30d)}</p>
                              <p className="text-xs text-muted-foreground">Revenue</p>
                            </div>
                            <div className="flex-1 bg-background/50 rounded-lg p-3 text-center">
                              <p className="text-lg font-bold text-foreground">{stats.shopAnalytics.bestSellers.length}</p>
                              <p className="text-xs text-muted-foreground">Items Sold</p>
                            </div>
                            <div className="flex-1 bg-background/50 rounded-lg p-3 text-center">
                          {/* --- END AI-MODIFIED --- */}
                              <p className={`text-lg font-bold ${stats.shopAnalytics.neverPurchased > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                                {stats.shopAnalytics.neverPurchased}
                              </p>
                              <p className="text-xs text-muted-foreground">Unsold</p>
                            </div>
                          </div>
                          {stats.shopAnalytics.bestSellers.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">Best Sellers</p>
                              {stats.shopAnalytics.bestSellers.map((item, i) => (
                                <div key={item.itemId} className="flex items-center justify-between py-1.5 text-sm">
                                  <span className="text-foreground">
                                    <span className="text-muted-foreground mr-2">#{i + 1}</span>
                                    {item.itemType} (ID: {item.itemId})
                                  </span>
                                  <span className="text-amber-400 font-mono">
                                    {item.purchaseCount} sold &middot; {item.totalRevenue.toLocaleString()} coins
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No shop purchases yet</p>
                          )}
                        </div>

                        {/* Settings Preview */}
                        <div className="bg-card/50 border border-border rounded-xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                              <Settings size={18} className="text-muted-foreground" />
                              Economy Settings
                            </h3>
                            <button
                              onClick={() => router.push(`/dashboard/servers/${id}/settings`)}
                              className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 flex items-center gap-1 transition-colors"
                            >
                              Edit <ExternalLink size={12} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <SettingPreviewItem label="Hourly Reward" value={configData?.study_hourly_reward ?? 100} unit="coins/hr" />
                            <SettingPreviewItem label="Camera Bonus" value={configData?.study_hourly_live_bonus ?? 25} unit="coins/hr" />
                            <SettingPreviewItem label="Coins per 100 XP" value={configData?.coins_per_centixp ?? 50} unit="coins" />
                            <SettingPreviewItem label="Starting Funds" value={configData?.starting_funds ?? 0} unit="coins" />
                            <SettingPreviewItem label="Task Reward" value={configData?.task_reward ?? 50} unit="coins" />
                            <SettingPreviewItem label="Task Limit" value={configData?.task_reward_limit ?? 10} unit="/day" />
                            <div className="col-span-2 flex items-center justify-between py-2 px-3 bg-background/50 rounded-lg">
                              <span className="text-xs text-muted-foreground">Transfers</span>
                              <Badge variant={configData?.allow_transfers !== false ? "success" : "error"}>
                                {configData?.allow_transfers !== false ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Top Earners This Week */}
                      {stats.topEarnersWeek.length > 0 && (
                        <div className="bg-card/50 border border-border rounded-xl p-5">
                          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                            <TrendingUp size={18} className="text-emerald-400" />
                            Top Earners This Week
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {stats.topEarnersWeek.map((earner, i) => (
                              <button
                                key={earner.userId}
                                onClick={() => setPanelUserId(earner.userId)}
                                className="flex items-center gap-3 p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors text-left"
                              >
                                <img
                                  src={earner.avatarUrl}
                                  alt=""
                                  className="w-8 h-8 rounded-full"
                                  onError={(e) => { (e.target as HTMLImageElement).src = `https://cdn.discordapp.com/embed/avatars/${i % 5}.png` }}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-foreground truncate">{earner.displayName}</p>
                                  <p className="text-xs text-emerald-400 font-mono">+{earner.earned.toLocaleString()}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ==================== LEADERBOARD TAB ==================== */}
              {tab === "leaderboard" && (
                <div className="space-y-6">
                  <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-border">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Coins size={20} className="text-amber-400" />
                        Top Coin Holders
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Members ranked by total balance</p>
                    </div>
                    {!econData ? (
                      <div className="p-4 space-y-3">
                        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {((econData as any).topHolders || []).map((holder: any, i: number) => (
                          <button
                            key={holder.userId}
                            onClick={() => setPanelUserId(holder.userId)}
                            className="w-full flex items-center gap-4 px-5 py-3 hover:bg-card/80 transition-colors text-left"
                          >
                            <span className={`font-bold w-8 text-right ${
                              i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-700" : "text-muted-foreground"
                            }`}>
                              #{i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {holder.displayName || `User ...${holder.userId.slice(-4)}`}
                              </p>
                            </div>
                            <span className="text-amber-400 font-mono font-medium">
                              {(holder.coins || 0).toLocaleString()} coins
                            </span>
                          </button>
                        ))}
                        {((econData as any).topHolders || []).length === 0 && (
                          <p className="text-center py-8 text-muted-foreground">No members with coins yet</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Top Earners */}
                  {stats?.topEarnersWeek && stats.topEarnersWeek.length > 0 && (
                    <div className="bg-card/50 border border-border rounded-xl p-5">
                      <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-400" />
                        Highest Earners This Week
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">Members who earned the most coins in the past 7 days</p>
                      <div className="divide-y divide-border">
                        {stats.topEarnersWeek.map((earner, i) => (
                          <button
                            key={earner.userId}
                            onClick={() => setPanelUserId(earner.userId)}
                            className="w-full flex items-center gap-4 py-3 hover:bg-card/80 transition-colors text-left"
                          >
                            <img
                              src={earner.avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full"
                              onError={(e) => { (e.target as HTMLImageElement).src = `https://cdn.discordapp.com/embed/avatars/${i % 5}.png` }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{earner.displayName}</p>
                            </div>
                            <span className="text-emerald-400 font-mono font-medium">
                              +{earner.earned.toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== TRANSACTIONS TAB ==================== */}
              {tab === "transactions" && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap gap-3 items-end">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Type</label>
                      <select
                        value={txType}
                        onChange={(e) => { setTxType(e.target.value); setTxPage(1) }}
                        className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                      >
                        {TX_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Sort</label>
                      <select
                        value={txSort}
                        onChange={(e) => { setTxSort(e.target.value); setTxPage(1) }}
                        className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                      >
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs text-muted-foreground block mb-1">Search member</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={txSearchInput}
                          onChange={(e) => setTxSearchInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleTxSearch()}
                          placeholder="Name or user ID..."
                          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                        />
                        <button onClick={handleTxSearch} className="bg-card border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors">
                          <Search size={16} className="text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleCsvExport}
                      className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Download size={14} />
                      CSV
                    </button>
                  </div>

                  {/* Transaction List */}
                  <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
                    {txLoading ? (
                      <div className="p-4 space-y-3">
                        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}
                      </div>
                    ) : !txData || txData.transactions.length === 0 ? (
                      <p className="text-center py-12 text-muted-foreground">No transactions found</p>
                    ) : (
                      <>
                        <div className="divide-y divide-border">
                          {txData.transactions.map((tx) => {
                            const cfg = TX_TYPE_CONFIG[tx.type] || TX_TYPE_CONFIG.OTHER
                            return (
                              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                                <button
                                  onClick={() => setPanelUserId(tx.actorId)}
                                  className="flex-shrink-0"
                                >
                                  <img
                                    src={tx.actorAvatarUrl}
                                    alt=""
                                    className="w-8 h-8 rounded-full hover:ring-2 hover:ring-primary/50 transition-all"
                                    onError={(e) => { (e.target as HTMLImageElement).src = `https://cdn.discordapp.com/embed/avatars/0.png` }}
                                  />
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                                    <button
                                      onClick={() => setPanelUserId(tx.actorId)}
                                      className="text-sm text-foreground hover:text-primary truncate transition-colors"
                                    >
                                      {tx.actorName}
                                    </button>
                                  </div>
                                  {(tx.fromName || tx.toName) && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                      {tx.fromName && `From: ${tx.fromName}`}
                                      {tx.fromName && tx.toName && " → "}
                                      {tx.toName && `To: ${tx.toName}`}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className={`font-mono font-medium ${tx.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    {tx.amount >= 0 ? "+" : ""}{tx.amount.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{formatDateTime(tx.createdAt)}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Pagination */}
                        {/* --- AI-REPLACED (2026-03-24) ---
                            Reason: Replaced custom transaction pagination with shared Pagination component
                            --- Original code (commented out for rollback) ---
                            {txData.pagination.totalPages > 1 && (
                              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                <p className="text-xs text-muted-foreground">{txData.pagination.total.toLocaleString()} transactions</p>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage <= 1} ...>
                                    <ChevronLeft size={16} />
                                  </button>
                                  <span>{txPage} / {txData.pagination.totalPages}</span>
                                  <button onClick={() => setTxPage(p => Math.min(txData.pagination.totalPages, p + 1))} disabled={txPage >= txData.pagination.totalPages} ...>
                                    <ChevronRight size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                            --- End original code --- */}
                        <Pagination page={txPage} totalPages={txData.pagination.totalPages} onChange={setTxPage} showLabel className="px-4 py-3 border-t border-border" />
                        {/* --- END AI-REPLACED --- */}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== ADMIN TOOLS TAB ==================== */}
              {tab === "admin" && isAdmin && (
                <div className="space-y-6">
                  {/* Bulk Operations */}
                  <div className="bg-card/50 border border-border rounded-xl p-5">
                    <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                      <BarChart3 size={18} className="text-amber-400" />
                      Bulk Operations
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Apply coin changes to multiple members at once. Every change creates an audit trail in the transaction history.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Operation</label>
                        <select
                          value={bulkOp}
                          onChange={(e) => setBulkOp(e.target.value as any)}
                          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                        >
                          <option value="give">Give Coins</option>
                          <option value="take">Take Coins</option>
                          <option value="set">Set Balance</option>
                          <option value="reset">Reset to Zero</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Target</label>
                        <select
                          value={bulkTarget}
                          onChange={(e) => setBulkTarget(e.target.value as any)}
                          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                        >
                          <option value="all">All Members</option>
                          <option value="active">Active (transacted in 30d)</option>
                          <option value="inactive">Inactive (no transactions in 30d)</option>
                        </select>
                      </div>
                    </div>

                    {bulkOp !== "reset" && (
                      <div className="mb-4">
                        <label className="text-xs text-muted-foreground block mb-1">Amount</label>
                        <input
                          type="number"
                          value={bulkAmount}
                          onChange={(e) => setBulkAmount(e.target.value)}
                          min={0}
                          placeholder="Number of coins"
                          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="text-xs text-muted-foreground block mb-1">Reason (for audit trail)</label>
                      <input
                        type="text"
                        value={bulkReason}
                        onChange={(e) => setBulkReason(e.target.value)}
                        placeholder="e.g. Weekly bonus, event reward, inflation control..."
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {bulkCountData && (
                      <p className="text-sm text-muted-foreground mb-4">
                        <Info size={14} className="inline mr-1" />
                        This will affect <strong className="text-foreground">{bulkCountData.count.toLocaleString()}</strong> members
                      </p>
                    )}

                    <button
                      onClick={() => setBulkConfirmOpen(true)}
                      disabled={bulkOp !== "reset" && (!bulkAmount || parseInt(bulkAmount) <= 0)}
                      className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {bulkOp === "give" && `Give ${bulkAmount || "..."} Coins`}
                      {bulkOp === "take" && `Take ${bulkAmount || "..."} Coins`}
                      {bulkOp === "set" && `Set Balance to ${bulkAmount || "..."}`}
                      {bulkOp === "reset" && "Reset All Balances to Zero"}
                    </button>
                  </div>

                  {/* Economy Health Check */}
                  {stats?.healthTips && (
                    <div className="bg-card/50 border border-border rounded-xl p-5">
                      <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        <Lightbulb size={18} className="text-amber-400" />
                        Economy Health Check
                      </h3>
                      <div className="space-y-3">
                        {stats.healthTips.map((tip, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-background/50 rounded-lg">
                            <div className={`w-1.5 rounded-full flex-shrink-0 ${
                              tip.includes("healthy") || tip.includes("balanced")
                                ? "bg-emerald-400"
                                : "bg-amber-400"
                            }`} />
                            <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => router.push(`/dashboard/servers/${id}/shop`)}
                      className="flex items-center gap-3 p-4 bg-card/50 border border-border rounded-xl hover:bg-card/80 transition-colors text-left"
                    >
                      <ShoppingBag size={20} className="text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Shop Editor</p>
                        <p className="text-xs text-muted-foreground">Add, edit, or remove shop items</p>
                      </div>
                      <ExternalLink size={14} className="ml-auto text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/servers/${id}/settings`)}
                      className="flex items-center gap-3 p-4 bg-card/50 border border-border rounded-xl hover:bg-card/80 transition-colors text-left"
                    >
                      <Settings size={20} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Economy Settings</p>
                        <p className="text-xs text-muted-foreground">Adjust rewards, transfers, and more</p>
                      </div>
                      <ExternalLink size={14} className="ml-auto text-muted-foreground" />
                    </button>
                  </div>
                </div>
              )}
        {/* --- AI-REPLACED (2026-03-24) --- Original: </div></div></div> --- */}
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}

        {/* Member Detail Panel */}
        <MemberDetailPanel
          open={!!panelUserId}
          onClose={() => setPanelUserId(null)}
          data={panelData as any}
          loading={panelLoading}
          onWarn={() => {}}
          onNote={() => {}}
          onRestrict={() => {}}
          onResolve={() => {}}
          onAdjustCoins={() => {}}
        />

        {/* Bulk Confirm Modal */}
        <ConfirmModal
          open={bulkConfirmOpen}
          onCancel={() => setBulkConfirmOpen(false)}
          onConfirm={handleBulkSubmit}
          loading={bulkLoading}
          title={`Confirm: ${bulkOp === "give" ? "Give" : bulkOp === "take" ? "Take" : bulkOp === "set" ? "Set" : "Reset"} Coins`}
          message={
            bulkOp === "reset"
              ? `This will set the balance to 0 for ${bulkCountData?.count?.toLocaleString() || "all"} ${bulkTarget} members. This cannot be undone.`
              : `This will ${bulkOp} ${bulkAmount} coins ${bulkOp === "give" ? "to" : "from"} ${bulkCountData?.count?.toLocaleString() || "all"} ${bulkTarget} members. Each change is logged as an Admin Action in the transaction history.`
          }
          confirmLabel={bulkOp === "reset" ? "Reset All Balances" : "Confirm"}
          variant={bulkOp === "reset" || bulkOp === "take" ? "danger" : "warning"}
        />
      </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

// ---- Pie Section Component ----

function PieSection({ title, subtitle, data }: {
  title: string; subtitle: string
  data: Array<{ type: string; total: number; count: number }>
}) {
  const total = data.reduce((sum, d) => sum + d.total, 0)
  const chartData = data.map((d, i) => ({
    name: TX_TYPE_CONFIG[d.type]?.label || d.type,
    value: d.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <div className="bg-card/50 border border-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-foreground mb-0.5">{title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>
      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-36 h-36 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground flex-1 truncate">{d.name}</span>
                <span className="text-foreground font-mono">{formatNum(d.value)}</span>
                <span className="text-muted-foreground w-10 text-right">
                  {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Settings Preview Item ----

function SettingPreviewItem({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-background/50 rounded-lg">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-mono text-foreground">
        {value?.toLocaleString() ?? "--"} <span className="text-muted-foreground text-xs">{unit}</span>
      </span>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
