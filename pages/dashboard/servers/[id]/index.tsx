// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server overview - tabbed layout with admin control panel,
//          real-time active users, premium banner, and leaderboard
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: full member hub redesign - rank progress, activity chart, goals, economy, sessions, attendance, messages, server info
import { relativeTime } from "@/utils/relativeTime"
import SearchInput from "@/components/dashboard/ui/SearchInput"
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: DashboardShell layout migration
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
// --- END AI-MODIFIED ---
import { PageHeader, Badge, toast } from "@/components/dashboard/ui"
import Pagination from "@/components/dashboard/ui/Pagination"
// --- AI-REPLACED (2026-03-24) ---
// Reason: Migrating from Radix Tabs to shared TabBar component
// --- Original code (commented out for rollback) ---
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
// --- End original code ---
import TabBar from "@/components/dashboard/ui/TabBar"
// --- END AI-REPLACED ---
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import {
  Clock, Coins, Crown, Trophy, Dumbbell, Settings, Users, Shield,
  Wallet, Wand2, CheckCircle2, XCircle, ChevronRight, Radio,
  AlertTriangle, Ban, ArrowRightLeft, TrendingUp, UserPlus,
  Sparkles, Zap, Palette, HeadphonesIcon,
  MessageSquare, Target, Calendar, Camera, Monitor, Info,
  ArrowUp, ArrowDown, Minus, Medal, ChevronUp,
  Search, Award, ArrowRight,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"
// --- END AI-MODIFIED ---

interface ServerData {
  server: {
    id: string
    name: string
    iconUrl: string | null
    bannerUrl: string | null
    settings: {
      studyHourlyReward: number | null
      rankType: string | null
      timezone: string | null
    } | null
  }
  you: {
    trackedTimeSeconds: number
    trackedTimeHours: number
    coins: number
    displayName: string | null
    workoutCount: number | null
    firstJoined: string | null
    ranks: any
  }
  leaderboard: Array<{
    rank: number
    userId: string
    displayName: string | null
    trackedTimeHours: number
    coins: number
    isYou: boolean
  }>
}

interface Permissions {
  isMember: boolean
  isModerator: boolean
  isAdmin: boolean
}

interface OverviewStats {
  activeNow: {
    count: number
    users: Array<{ userId: string; displayName: string; channelId: string | null; startTime: string | null }>
  }
  activity: { studiedToday: number; studiedThisWeek: number; newMembersThisWeek: number; totalMembers: number }
  moderation: { openTickets: number; recentWarnings: number; activeStudyBans: number }
  economy: {
    totalCoinsInCirculation: number
    transactionsToday: number
    topEarner: { userId: string; displayName: string; coins: number } | null
  }
}

interface SetupStatus {
  settings: boolean
  ranksCount: number
  shopCount: number
  roleMenusCount: number
}

interface MemberOverview {
  rankProgress: {
    rankType: string
    currentRank: { roleId: string; required: number } | null
    nextRank: { roleId: string; required: number } | null
    currentValue: number
    progress: number
  } | null
  leaderboardPosition: { rank: number; total: number }
  recentSessions: Array<{
    id: number
    startTime: string
    durationMinutes: number
    cameraMins: number
    streamMins: number
    tag: string | null
    rating: number | null
  }>
  ongoingSession: {
    startTime: string
    currentMinutes: number
    isCamera: boolean
    isStream: boolean
  } | null
  goals: {
    weekly: {
      studyGoal: number | null; studyProgress: number
      taskGoal: number | null; taskProgress: number
      messageGoal: number | null; messageProgress: number
    } | null
    monthly: {
      studyGoal: number | null; studyProgress: number
      taskGoal: number | null; taskProgress: number
      messageGoal: number | null; messageProgress: number
    } | null
  }
  economy: {
    coins: number
    rewardRate: number
    recentTransactions: Array<{
      id: number; type: string; amount: number; bonus: number; createdAt: string
    }>
    inventoryCount: number
  }
  messages: { totalMessages: number; totalWords: number; thisWeekMessages: number }
  attendance: {
    totalBooked: number
    totalAttended: number
    recent: Array<{ date: string; attended: boolean }>
  }
  activityChart: Array<{ date: string; minutes: number }>
  serverInfo: {
    rankType: string | null
    timezone: string | null
    studyReward: number | null
    liveBonus: number | null
    taskReward: number | null
    maxTasks: number | null
  }
}

function formatMinutes(minutes: number): string {
  if (minutes < 1) return "<1m"
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDuration(startTime: string | null): string {
  if (!startTime) return "just started"
  const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000)
  if (diff < 1) return "just started"
  if (diff < 60) return `${diff}m`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// --- AI-REPLACED (2026-03-24) ---
// Reason: Replaced local timeAgo with shared relativeTime from @/utils/relativeTime
// --- Original code (commented out for rollback) ---
// function relativeTime(iso: string): string {
//   const diff = Date.now() - new Date(iso).getTime()
//   const mins = Math.floor(diff / 60_000)
//   if (mins < 1) return "just now"
//   if (mins < 60) return `${mins}m ago`
//   const hrs = Math.floor(mins / 60)
//   if (hrs < 24) return `${hrs}h ago`
//   const days = Math.floor(hrs / 24)
//   if (days < 7) return `${days}d ago`
//   return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
// }
// --- End original code ---
// --- END AI-REPLACED ---

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted/50 rounded-lg ${className}`} />
}

function StatCard({ icon, label, value, color, href, sub }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; href?: string; sub?: string
}) {
  const content = (
    <div className={`bg-card rounded-2xl p-4 border border-border/50 ${href ? "hover:border-primary/30 transition-colors cursor-pointer group" : ""}`}>
      <div className={`flex items-center gap-2 ${color} mb-1`}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
  if (href) return <Link href={href}>{content}</Link>
  return content
}

function ServerIcon({ name, iconUrl, size = "lg" }: { name: string; iconUrl: string | null; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-14 h-14" : "w-10 h-10"
  const textSize = size === "lg" ? "text-xl" : "text-base"
  if (iconUrl) {
    return <img src={iconUrl} alt="" className={`${dim} rounded-2xl object-cover flex-shrink-0`} loading="lazy" />
  }
  return (
    <div className={`${dim} rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-border/50`}>
      <span className={`${textSize} font-bold text-foreground/80`}>{name.charAt(0).toUpperCase()}</span>
    </div>
  )
}

function RadialProgress({ value, max, size = 56, color }: { value: number; max: number; size?: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
        className="text-muted/30" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
        className={color} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="text-foreground font-bold">{formatMinutes(payload[0].value)}</p>
    </div>
  )
}

const txnLabels: Record<string, string> = {
  VOICE_SESSION: "Study reward",
  TEXT_SESSION: "Text reward",
  TASKS: "Task reward",
  SHOP_PURCHASE: "Shop purchase",
  TRANSFER: "Transfer",
  ADMIN: "Admin",
  REFUND: "Refund",
  SCHEDULE_BOOK: "Schedule booking",
  SCHEDULE_REWARD: "Schedule reward",
  OTHER: "Other",
}

export default function ServerDetail() {
  const { status } = useSession()
  const router = useRouter()
  const { id } = router.query

  const { data, error: fetchError, isLoading } = useDashboard<ServerData>(
    status === "authenticated" && id ? `/api/dashboard/servers/${id}` : null
  )
  const { data: permsData, error: permsError } = useDashboard<Permissions>(
    status === "authenticated" && id ? `/api/dashboard/servers/${id}/permissions` : null
  )
  const { data: serverStats } = useDashboard<{
    studyTime: { todayMinutes: number; thisWeekMinutes: number; thisMonthMinutes: number; allTimeMinutes: number }
  }>(
    status === "authenticated" && id ? `/api/dashboard/stats?guildId=${id}` : null
  )
  const { data: premiumData } = useDashboard<{ isPremium: boolean; premiumUntil: string | null }>(
    id && status === "authenticated" ? `/api/dashboard/servers/${id}/branding` : null
  )
  const { data: memberData } = useDashboard<MemberOverview>(
    status === "authenticated" && id ? `/api/dashboard/servers/${id}/member-overview` : null
  )

  const perms = permsData ?? { isMember: false, isModerator: false, isAdmin: false }
  const permsLoading = permsData === undefined && !permsError
  const { data: adminStats } = useDashboard<OverviewStats>(
    status === "authenticated" && id ? `/api/dashboard/servers/${id}/overview-stats` : null
  )

  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Do NOT auto-redirect admins to the setup wizard from server overview.
  //          Forced redirect caused a bad loop when setup_wizard_dismissed_at could not
  //          persist (e.g. missing column on live DB) or users expected the dashboard.
  //          Setup Wizard stays available from ServerNav → "Setup Wizard".
  // --- Original behavior (2026-03-23, removed): fetch /config and router.replace to /setup
  //     when setup_wizard_dismissed_at was null. See git history to restore.
  // --- END AI-MODIFIED ---

  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const loading = isLoading
  const error = fetchError?.message ?? null

  useEffect(() => {
    if (!perms.isAdmin || !id) return
    Promise.all([
      fetch(`/api/dashboard/servers/${id}/ranks`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/dashboard/servers/${id}/shop`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/dashboard/servers/${id}/rolemenus`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([ranksRes, shopRes, rolemenusRes]) => {
        const settingsConfigured =
          !!data?.server?.settings &&
          (data.server.settings.timezone != null ||
            data.server.settings.studyHourlyReward != null ||
            data.server.settings.rankType != null)
        setSetupStatus({
          settings: settingsConfigured,
          ranksCount: (ranksRes?.xpRanks?.length || 0) + (ranksRes?.voiceRanks?.length || 0) + (ranksRes?.msgRanks?.length || 0),
          shopCount: shopRes?.items?.length || 0,
          roleMenusCount: rolemenusRes?.menus?.length || 0,
        })
      })
      .catch(() => toast.error("Failed to load setup status"))
  }, [perms.isAdmin, id, data?.server?.settings])

  const [liveTimer, setLiveTimer] = useState(0)
  useEffect(() => {
    if (!memberData?.ongoingSession) return
    const update = () => {
      setLiveTimer(Math.floor((Date.now() - new Date(memberData.ongoingSession!.startTime).getTime()) / 60_000))
    }
    update()
    const iv = setInterval(update, 30_000)
    return () => clearInterval(iv)
  }, [memberData?.ongoingSession])

  const chartData = useMemo(() => {
    if (!memberData?.activityChart) return []
    return memberData.activityChart.map((d) => ({
      ...d,
      label: new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }))
  }, [memberData?.activityChart])

  const isMod = perms.isModerator || perms.isAdmin
  const userRank = memberData?.leaderboardPosition

  // --- AI-REPLACED (2026-03-24) ---
  // Reason: Radix Tabs replaced with TabBar + state-based tab switching
  // --- Original code (commented out for rollback) ---
  // (Tabs defaultValue="overview" was used below — now driven by this state)
  // --- End original code ---
  const [activeTab, setActiveTab] = useState("overview")
  // --- END AI-REPLACED ---

  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: leaderboard tab state + API
  type SLBType = "study" | "messages" | "coins"
  type SLBPeriod = "all" | "season" | "month" | "week" | "today"
  const [lbType, setLbType] = useState<SLBType>("study")
  const [lbPeriod, setLbPeriod] = useState<SLBPeriod>("all")
  const [lbPage, setLbPage] = useState(1)
  const [lbSearch, setLbSearch] = useState("")
  const [lbDebouncedSearch, setLbDebouncedSearch] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setLbDebouncedSearch(lbSearch), 400)
    return () => clearTimeout(t)
  }, [lbSearch])

  useEffect(() => { setLbPage(1) }, [lbType, lbPeriod, lbDebouncedSearch])
  useEffect(() => { if (lbType === "coins") setLbPeriod("all") }, [lbType])

  const lbApiUrl = useMemo(() => {
    if (!id) return null
    const params = new URLSearchParams({
      guildId: id as string,
      type: lbType,
      period: lbPeriod,
      page: String(lbPage),
      pageSize: "25",
    })
    if (lbDebouncedSearch) params.set("search", lbDebouncedSearch)
    return `/api/dashboard/leaderboard?${params.toString()}`
  }, [id, lbType, lbPeriod, lbPage, lbDebouncedSearch])

  const { data: lbData, isLoading: lbLoading } = useDashboard<{
    entries: Array<{ rank: number; userId: string; displayName: string | null; avatarUrl: string | null; value: number; isYou: boolean }>
    totalEntries: number; totalPages: number; page: number
    yourPosition: { rank: number; value: number } | null
    serverName: string; seasonStart: string | null
  }>(status === "authenticated" ? lbApiUrl : null)

  const lbHasSeason = !!lbData?.seasonStart
  const lbJumpToYou = useCallback(() => {
    if (!lbData?.yourPosition) return
    setLbPage(Math.ceil(lbData.yourPosition.rank / 25))
  }, [lbData])

  function lbFormatValue(value: number, type: SLBType): string {
    if (type === "study") return value < 1 ? `${Math.round(value * 60)}m` : `${value.toFixed(1)}h`
    return value.toLocaleString()
  }
  function lbUnit(type: SLBType): string {
    if (type === "study") return "hours"
    if (type === "messages") return "msgs"
    return "coins"
  }
  // --- END AI-MODIFIED ---

  return (
    <Layout
      SEO={{ title: `${data?.server.name || "Server"} - LionBot Dashboard`, description: "Server dashboard" }}
    >
      <AdminGuard>
        <ServerGuard requiredLevel="member">
        {/* --- AI-REPLACED (2026-03-24) ---
            Reason: Migrate to DashboardShell for consistent layout
            --- Original code (commented out for rollback) ---
            <div className="min-h-screen bg-background pt-6 pb-20 px-4">
              <div className="max-w-6xl mx-auto flex gap-8">
                <ServerNav serverId={id as string} serverName={...} isAdmin={perms.isAdmin} isMod={perms.isModerator} />
                <div className="flex-1 min-w-0">
            --- End original code --- */}
        <DashboardShell nav={
          <ServerNav
            serverId={id as string}
            serverName={data?.server.name || (loading ? "Loading..." : "Server")}
            isAdmin={perms.isAdmin}
            isMod={perms.isModerator}
          />
        }>
              {loading ? (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-border">
                    <Skeleton className="h-28 rounded-none" />
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-20" />)}
                  </div>
                  <Skeleton className="h-48" />
                  <Skeleton className="h-64" />
                </div>
              ) : error ? (
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
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-foreground font-medium transition-colors mx-auto"
                  >
                    <ArrowRight size={16} className="rotate-[225deg]" />
                    Refresh Page
                  </button>
                </div>
              ) : data ? (
                <>
                  {/* Hero Header */}
                  <div className="relative rounded-2xl overflow-hidden mb-6 border border-border">
                    {data.server.bannerUrl ? (
                      <div className="absolute inset-0">
                        <img src={data.server.bannerUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/70" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background" />
                    )}
                    {/* --- AI-MODIFIED (2026-03-21) --- */}
                    {/* Purpose: Add flex-wrap so hero header doesn't overflow on mobile */}
                    <div className="relative px-4 sm:px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
                    {/* --- END AI-MODIFIED --- */}
                      {/* --- AI-REPLACED (2026-03-24) --- */}
                      {/* Reason: Wired up the already-imported PageHeader component for consistency */}
                      {/* What the new code does better: Uses shared breadcrumb component instead of hand-rolled breadcrumbs */}
                      {/* --- Original code (commented out for rollback) --- */}
                      {/* <div className="flex items-center gap-4">
                        <ServerIcon name={data.server.name} iconUrl={data.server.iconUrl} size="lg" />
                        <div>
                          <h1 className="text-2xl font-bold text-foreground">{data.server.name}</h1>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>Dashboard</span>
                            <span className="opacity-40">/</span>
                            <Link href="/dashboard/servers">
                              <span className="hover:text-foreground transition-colors cursor-pointer">Servers</span>
                            </Link>
                            <span className="opacity-40">/</span>
                            <span className="text-foreground/70">{data.server.name}</span>
                          </div>
                        </div>
                      </div> */}
                      {/* --- End original code --- */}
                      <div className="flex items-center gap-4">
                        <ServerIcon name={data.server.name} iconUrl={data.server.iconUrl} size="lg" />
                        <div className="flex-1 [&>div]:mb-0">
                          <PageHeader
                            title={data.server.name}
                            breadcrumbs={[
                              { label: "Dashboard", href: "/dashboard" },
                              { label: "Servers", href: "/dashboard/servers" },
                              { label: data.server.name },
                            ]}
                          />
                        </div>
                      </div>
                      {/* --- END AI-REPLACED --- */}
                      {perms.isAdmin && (
                        <Link href={`/dashboard/servers/${id}/setup`}>
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors whitespace-nowrap">
                            <Wand2 size={16} />
                            Setup Wizard
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Tabs */}
                  {/* --- AI-REPLACED (2026-03-24) ---
                      Reason: Migrated from Radix Tabs to shared TabBar component with state-based content switching
                      --- Original code (commented out for rollback) ---
                      <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="bg-muted/50 border border-border">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="activity">Activity</TabsTrigger>
                          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="space-y-6">
                      --- End original code --- */}
                  <div className="space-y-6">
                    <TabBar
                      tabs={[
                        { key: "overview", label: "Overview" },
                        { key: "activity", label: "Activity" },
                        { key: "leaderboard", label: "Leaderboard" },
                      ]}
                      active={activeTab}
                      onChange={setActiveTab}
                      variant="pills"
                    />

                    {/* ====== OVERVIEW TAB ====== */}
                    {activeTab === "overview" && (<div className="space-y-6">
                  {/* --- END AI-REPLACED --- */}
                      {/* Ongoing Session Banner */}
                      {memberData?.ongoingSession && (
                        <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent p-5">
                          <div className="flex items-center gap-3">
                            <span className="relative flex h-3 w-3 flex-shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">You&apos;re studying right now!</p>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                Started {relativeTime(memberData.ongoingSession.startTime)} &middot; {formatMinutes(liveTimer)} so far
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {memberData.ongoingSession.isCamera && (
                                <span className="flex items-center gap-1 text-xs bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full">
                                  <Camera size={12} /> Camera
                                </span>
                              )}
                              {memberData.ongoingSession.isStream && (
                                <span className="flex items-center gap-1 text-xs bg-purple-500/15 text-purple-400 px-2.5 py-1 rounded-full">
                                  <Monitor size={12} /> Stream
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Premium Banner */}
                      {premiumData?.isPremium ? (
                        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-5">
                          <div className="flex items-center gap-3">
                            <Crown size={22} className="text-amber-400" />
                            <div>
                              <p className="font-semibold text-foreground">Premium Server</p>
                              <p className="text-sm text-muted-foreground">
                                {premiumData.premiumUntil
                                  ? `Active until ${new Date(premiumData.premiumUntil).toLocaleDateString()}`
                                  : "Premium features active"}
                              </p>
                            </div>
                            <Link href={`/dashboard/servers/${id}/branding`}>
                              <a className="ml-auto px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-sm font-medium transition-colors">
                                {/* --- AI-MODIFIED (2026-04-01) --- */}
                                {/* Purpose: Rename "Branding" to "Visual Branding" for text branding feature */}
                                Edit Visual Branding
                                {/* --- END AI-MODIFIED --- */}
                              </a>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/10 p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
                          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <Crown size={20} className="text-amber-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-lg">Upgrade to Premium</p>
                                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                  {/* --- AI-MODIFIED (2026-04-01) --- */}
                                  {/* Purpose: Rename "Branding" to "Visual Branding" for text branding feature */}
                                  <li className="flex items-center gap-2"><Palette size={14} className="text-amber-400/70" /> Custom visual branding &amp; skins</li>
                                  {/* --- END AI-MODIFIED --- */}
                                  <li className="flex items-center gap-2"><Sparkles size={14} className="text-amber-400/70" /> Exclusive premium features</li>
                                  <li className="flex items-center gap-2"><Zap size={14} className="text-amber-400/70" /> Priority support &amp; early access</li>
                                </ul>
                              </div>
                            </div>
                            {/* --- AI-MODIFIED (2026-03-22) --- */}
                            {/* Purpose: Changed upgrade link from branding to settings (where subscription management lives) */}
                            <Link href={`/dashboard/servers/${id}/settings`}>
                              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap">
                                <Crown size={16} />
                                Upgrade Now
                              </span>
                            </Link>
                            {/* --- END AI-MODIFIED --- */}
                          </div>
                        </div>
                      )}

                      {/* Admin Control Panel */}
                      {(isMod || permsLoading) && (
                        <div className="bg-card rounded-2xl border border-border overflow-hidden">
                          <div className="px-5 py-4 border-b border-border">
                            <h3 className="text-base font-bold text-foreground">Server Control Panel</h3>
                          </div>
                          {!adminStats ? (
                            <div className="p-5 space-y-4">
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[72px]" />)}
                              </div>
                              <Skeleton className="h-12" />
                              <Skeleton className="h-12" />
                            </div>
                          ) : (
                            <div className="p-5 space-y-4">
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="relative flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium">Studying Now</span>
                                  </div>
                                  <p className="text-xl font-bold text-foreground">{adminStats.activeNow.count}</p>
                                </div>
                                <div className="bg-card border border-border/50 rounded-xl p-3">
                                  <div className="flex items-center gap-2 text-blue-400/70 mb-1">
                                    <Users size={13} />
                                    <span className="text-[10px] uppercase tracking-wider font-medium">Studied Today</span>
                                  </div>
                                  <p className="text-xl font-bold text-foreground">{adminStats.activity.studiedToday}</p>
                                </div>
                                <div className="bg-card border border-border/50 rounded-xl p-3">
                                  <div className="flex items-center gap-2 text-indigo-400/70 mb-1">
                                    <TrendingUp size={13} />
                                    <span className="text-[10px] uppercase tracking-wider font-medium">This Week</span>
                                  </div>
                                  <p className="text-xl font-bold text-foreground">{adminStats.activity.studiedThisWeek}</p>
                                </div>
                                <div className="bg-card border border-border/50 rounded-xl p-3">
                                  <div className="flex items-center gap-2 text-purple-400/70 mb-1">
                                    <UserPlus size={13} />
                                    <span className="text-[10px] uppercase tracking-wider font-medium">New Members</span>
                                  </div>
                                  <p className="text-xl font-bold text-foreground">
                                    {adminStats.activity.newMembersThisWeek}
                                    <span className="text-xs text-muted-foreground ml-1.5 font-normal">/ {adminStats.activity.totalMembers} total</span>
                                  </p>
                                </div>
                              </div>
                              {/* --- AI-MODIFIED (2026-03-21) --- */}
                              {/* Purpose: Add flex-wrap so moderation stats wrap on mobile */}
                              <div className="flex items-center gap-2 sm:gap-4 px-4 py-3 bg-muted/30 rounded-xl text-sm flex-wrap">
                                <Shield size={16} className="text-rose-400 flex-shrink-0" />
                                <span className="text-muted-foreground font-medium mr-auto">Moderation</span>
                                <Link href={`/dashboard/servers/${id}/moderation`}>
                                  <span className="text-foreground hover:text-primary transition-colors cursor-pointer">
                                    <span className="font-bold">{adminStats.moderation.openTickets}</span>
                                    <span className="text-muted-foreground ml-1">open</span>
                                  </span>
                                </Link>
                                <span className="text-border">|</span>
                                <span><span className="font-bold text-foreground">{adminStats.moderation.recentWarnings}</span><span className="text-muted-foreground ml-1">warnings</span></span>
                                <span className="text-border">|</span>
                                <span><span className="font-bold text-foreground">{adminStats.moderation.activeStudyBans}</span><span className="text-muted-foreground ml-1">bans</span></span>
                              </div>
                              {/* --- AI-MODIFIED (2026-03-21) --- */}
                              {/* Purpose: Add flex-wrap so economy stats wrap on mobile */}
                              <div className="flex items-center gap-2 sm:gap-4 px-4 py-3 bg-muted/30 rounded-xl text-sm flex-wrap">
                              {/* --- END AI-MODIFIED --- */}
                                <Coins size={16} className="text-amber-400 flex-shrink-0" />
                                <span className="text-muted-foreground font-medium mr-auto">Economy</span>
                                <Link href={`/dashboard/servers/${id}/economy`}>
                                  <span className="text-foreground hover:text-primary transition-colors cursor-pointer">
                                    <span className="font-bold">{adminStats.economy.totalCoinsInCirculation.toLocaleString()}</span>
                                    <span className="text-muted-foreground ml-1">coins total</span>
                                  </span>
                                </Link>
                                <span className="text-border">|</span>
                                <span><span className="font-bold text-foreground">{adminStats.economy.transactionsToday}</span><span className="text-muted-foreground ml-1">txns today</span></span>
                                {adminStats.economy.topEarner && (
                                  <>
                                    <span className="text-border">|</span>
                                    <span className="truncate">
                                      <span className="text-warning font-bold">{adminStats.economy.topEarner.coins.toLocaleString()}</span>
                                      <span className="text-muted-foreground ml-1">{adminStats.economy.topEarner.displayName}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ====== MEMBER HUB SECTIONS ====== */}

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <StatCard icon={<Clock size={14} />} label="Study Time" value={`${data.you.trackedTimeHours}h`} color="text-emerald-400/70" sub={serverStats ? `${formatMinutes(serverStats.studyTime.thisWeekMinutes)} this week` : undefined} />
                        <StatCard icon={<Coins size={14} />} label="Coins" value={memberData?.economy.coins ?? data.you.coins} color="text-warning/70" sub={memberData?.economy.rewardRate ? `${memberData.economy.rewardRate} coins/hr` : undefined} />
                        <StatCard
                          icon={<Trophy size={14} />}
                          label="Leaderboard"
                          value={userRank ? `#${userRank.rank}` : "--"}
                          color={userRank && userRank.rank <= 3 ? "text-amber-400/70" : "text-cyan-400/70"}
                          sub={userRank ? `of ${userRank.total} members` : undefined}
                        />
                        <StatCard icon={<MessageSquare size={14} />} label="Messages" value={memberData?.messages.totalMessages ?? 0} color="text-blue-400/70" sub={memberData?.messages.thisWeekMessages ? `${memberData.messages.thisWeekMessages} this week` : undefined} />
                        <StatCard icon={<Dumbbell size={14} />} label="Workouts" value={data.you.workoutCount || 0} color="text-purple-400/70" />
                        {data.you.firstJoined && (
                          <StatCard
                            icon={<Calendar size={14} />}
                            label="Member Since"
                            value={new Date(data.you.firstJoined).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                            color="text-indigo-400/70"
                          />
                        )}
                      </div>

                      {/* Rank Progress */}
                      {memberData?.rankProgress ? (
                        <div className="bg-card rounded-2xl border border-border p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                              <Medal size={18} className="text-indigo-400" />
                              Rank Progress
                            </h3>
                            <Badge variant="info" size="sm">
                              {memberData.rankProgress.rankType === "VOICE" ? "Voice Hours" : memberData.rankProgress.rankType === "MESSAGE" ? "Messages" : "XP"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="relative flex-shrink-0">
                              <RadialProgress
                                value={memberData.rankProgress.progress}
                                max={100}
                                size={72}
                                color={memberData.rankProgress.progress >= 100 ? "text-emerald-500" : memberData.rankProgress.progress >= 50 ? "text-indigo-500" : "text-muted-foreground"}
                              />
                              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                                {memberData.rankProgress.progress}%
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">
                                  {memberData.rankProgress.currentRank ? "Current rank" : "No rank yet"}
                                </span>
                                {memberData.rankProgress.nextRank && (
                                  <span className="text-muted-foreground">Next rank</span>
                                )}
                              </div>
                              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    memberData.rankProgress.progress >= 100 ? "bg-emerald-500" : "bg-indigo-500"
                                  }`}
                                  style={{ width: `${memberData.rankProgress.progress}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                <span>
                                  {memberData.rankProgress.currentValue.toLocaleString()}{" "}
                                  {memberData.rankProgress.rankType === "VOICE" ? "hours" : memberData.rankProgress.rankType === "MESSAGE" ? "msgs" : "XP"}
                                </span>
                                {memberData.rankProgress.nextRank && (
                                  <span>{memberData.rankProgress.nextRank.required.toLocaleString()} needed</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : memberData && (
                        <div className="bg-card rounded-2xl border border-border p-5 text-center">
                          <Medal size={24} className="text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">This server hasn&apos;t set up ranks yet</p>
                        </div>
                      )}

                      {/* Activity Chart */}
                      {chartData.length > 0 && (
                        <div className="bg-card rounded-2xl border border-border p-5">
                          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-emerald-400" />
                            Study Activity
                            <span className="text-xs text-muted-foreground font-normal ml-auto">Last 30 days</span>
                          </h3>
                          <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                <defs>
                                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity={0.2} />
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                                <Bar dataKey="minutes" fill="url(#barGrad)" radius={[3, 3, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Goals Snapshot */}
                      {memberData?.goals && (memberData.goals.weekly || memberData.goals.monthly) && (
                        <div className="bg-card rounded-2xl border border-border p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                              <Target size={18} className="text-emerald-400" />
                              Goals This Week
                            </h3>
                            <Link href="/dashboard/goals">
                              <span className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1">
                                View all <ChevronRight size={12} />
                              </span>
                            </Link>
                          </div>
                          {/* --- AI-MODIFIED (2026-03-21) --- */}
                          {/* Purpose: Stack goals grid on mobile */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* --- END AI-MODIFIED --- */}
                            {(() => {
                              const g = memberData.goals.weekly || memberData.goals.monthly
                              if (!g) return null
                              const items = [
                                { label: "Study", goal: g.studyGoal, progress: g.studyProgress, unit: "h", color: "text-emerald-500" },
                                { label: "Tasks", goal: g.taskGoal, progress: g.taskProgress, unit: "", color: "text-blue-500" },
                                { label: "Messages", goal: g.messageGoal, progress: g.messageProgress, unit: "", color: "text-purple-500" },
                              ].filter((it) => it.goal && it.goal > 0)
                              if (items.length === 0) return (
                                <div className="col-span-3 text-center py-4 text-sm text-muted-foreground">
                                  No goals set for this server. Set them in Discord with <code className="bg-muted px-1 rounded text-xs">/goals</code>
                                </div>
                              )
                              return items.map((it) => (
                                <div key={it.label} className="text-center">
                                  <div className="relative inline-block">
                                    <RadialProgress value={it.progress} max={it.goal!} size={64} color={it.progress >= it.goal! ? "text-emerald-500" : it.color} />
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                                      {it.progress}{it.unit}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{it.label}</p>
                                  <p className="text-[10px] text-muted-foreground/60">{it.progress}{it.unit} / {it.goal}{it.unit}</p>
                                </div>
                              ))
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Two-column layout: Recent Sessions + Economy */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Recent Sessions */}
                        {memberData && memberData.recentSessions.length > 0 && (
                          <div className="bg-card rounded-2xl border border-border overflow-hidden">
                            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <HeadphonesIcon size={16} className="text-blue-400" />
                                Recent Sessions
                              </h3>
                              <Link href="/dashboard/history">
                                <span className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">View all</span>
                              </Link>
                            </div>
                            <div className="divide-y divide-border/30">
                              {memberData.recentSessions.slice(0, 5).map((s) => (
                                <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-foreground">{formatMinutes(s.durationMinutes)}</span>
                                      {s.cameraMins > 0 && (
                                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                          <Camera size={10} className="inline mr-0.5" />{formatMinutes(s.cameraMins)}
                                        </span>
                                      )}
                                      {s.streamMins > 0 && (
                                        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                                          <Monitor size={10} className="inline mr-0.5" />{formatMinutes(s.streamMins)}
                                        </span>
                                      )}
                                      {s.tag && (
                                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-[80px]">{s.tag}</span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">{relativeTime(s.startTime)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Economy */}
                        {memberData && (
                          <div className="bg-card rounded-2xl border border-border overflow-hidden">
                            <div className="px-5 py-4 border-b border-border">
                              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Coins size={16} className="text-amber-400" />
                                Economy
                              </h3>
                            </div>
                            <div className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-2xl font-bold text-warning">{memberData.economy.coins.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">coins</p>
                                </div>
                                <div className="text-right">
                                  {memberData.economy.rewardRate > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      Earn <span className="text-warning font-medium">{memberData.economy.rewardRate}</span> coins/hr studying
                                    </p>
                                  )}
                                  {memberData.economy.inventoryCount > 0 && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {memberData.economy.inventoryCount} item{memberData.economy.inventoryCount !== 1 ? "s" : ""} owned
                                    </p>
                                  )}
                                </div>
                              </div>
                              {memberData.economy.recentTransactions.length > 0 && (
                                <div className="space-y-1.5 mt-3">
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Recent</p>
                                  {memberData.economy.recentTransactions.slice(0, 5).map((t) => (
                                    <div key={t.id} className="flex items-center gap-2 text-xs">
                                      <span className={`font-mono font-bold ${t.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                        {t.amount >= 0 ? "+" : ""}{t.amount}
                                      </span>
                                      {t.bonus > 0 && <span className="text-amber-400/70 font-mono">+{t.bonus}</span>}
                                      <span className="text-muted-foreground truncate flex-1">{txnLabels[t.type] || t.type}</span>
                                      <span className="text-muted-foreground/50 whitespace-nowrap">{relativeTime(t.createdAt)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Attendance */}
                      {memberData && memberData.attendance.totalBooked > 0 && (
                        <div className="bg-card rounded-2xl border border-border p-5">
                          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Calendar size={16} className="text-indigo-400" />
                            Schedule Attendance
                          </h3>
                          <div className="flex items-center gap-4 mb-3">
                            <div>
                              <span className="text-2xl font-bold text-foreground">{memberData.attendance.totalAttended}</span>
                              <span className="text-muted-foreground text-sm"> / {memberData.attendance.totalBooked} sessions</span>
                            </div>
                            <div className="flex-1">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-indigo-500 transition-all"
                                  style={{ width: `${memberData.attendance.totalBooked > 0 ? (memberData.attendance.totalAttended / memberData.attendance.totalBooked) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {memberData.attendance.totalBooked > 0
                                ? Math.round((memberData.attendance.totalAttended / memberData.attendance.totalBooked) * 100)
                                : 0}%
                            </span>
                          </div>
                          {memberData.attendance.recent.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap">
                              {memberData.attendance.recent.map((a, i) => (
                                <span
                                  key={i}
                                  title={new Date(a.date).toLocaleDateString()}
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${
                                    a.attended
                                      ? "bg-emerald-500/15 text-emerald-400"
                                      : "bg-red-500/10 text-red-400"
                                  }`}
                                >
                                  {a.attended ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Server Info */}
                      {memberData?.serverInfo && (
                        <div className="bg-card rounded-2xl border border-border p-5">
                          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Info size={16} className="text-muted-foreground" />
                            Server Settings
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {memberData.serverInfo.rankType && (
                              <div className="bg-muted/30 rounded-xl px-3 py-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Rank Type</p>
                                <p className="text-sm font-medium text-foreground capitalize">{memberData.serverInfo.rankType.toLowerCase()}</p>
                              </div>
                            )}
                            {memberData.serverInfo.timezone && (
                              <div className="bg-muted/30 rounded-xl px-3 py-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Timezone</p>
                                <p className="text-sm font-medium text-foreground">{memberData.serverInfo.timezone}</p>
                              </div>
                            )}
                            {memberData.serverInfo.studyReward != null && (
                              <div className="bg-muted/30 rounded-xl px-3 py-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Study Reward</p>
                                <p className="text-sm font-medium text-warning">{memberData.serverInfo.studyReward} coins/hr</p>
                              </div>
                            )}
                            {memberData.serverInfo.liveBonus != null && memberData.serverInfo.liveBonus > 0 && (
                              <div className="bg-muted/30 rounded-xl px-3 py-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Camera Bonus</p>
                                <p className="text-sm font-medium text-emerald-400">+{memberData.serverInfo.liveBonus} coins/hr</p>
                              </div>
                            )}
                            {memberData.serverInfo.taskReward != null && memberData.serverInfo.taskReward > 0 && (
                              <div className="bg-muted/30 rounded-xl px-3 py-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Task Reward</p>
                                <p className="text-sm font-medium text-blue-400">{memberData.serverInfo.taskReward} coins</p>
                              </div>
                            )}
                            {memberData.serverInfo.maxTasks != null && (
                              <div className="bg-muted/30 rounded-xl px-3 py-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Max Tasks</p>
                                <p className="text-sm font-medium text-foreground">{memberData.serverInfo.maxTasks}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Setup Checklist (admin only) */}
                      {(perms.isAdmin || permsLoading) && (
                        <div className="bg-card rounded-2xl border border-border overflow-hidden">
                          <div className="p-5 border-b border-border">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                              <Settings size={18} />
                              Server Setup
                            </h3>
                          </div>
                          {!setupStatus ? (
                            <div className="p-5 space-y-3">
                              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14" />)}
                            </div>
                          ) : (
                            <div className="divide-y divide-border/50">
                              <SetupCheckItem configured={setupStatus.settings} label="Settings" detail={setupStatus.settings ? "Configured" : "Not configured"} href={`/dashboard/servers/${id}/settings`} />
                              <SetupCheckItem configured={setupStatus.ranksCount > 0} label="Ranks" detail={setupStatus.ranksCount > 0 ? `${setupStatus.ranksCount} tiers` : "Not set up"} href={`/dashboard/servers/${id}/ranks`} />
                              <SetupCheckItem configured={setupStatus.shopCount > 0} label="Shop" detail={setupStatus.shopCount > 0 ? `${setupStatus.shopCount} items` : "Empty"} href={`/dashboard/servers/${id}/shop`} />
                              <SetupCheckItem configured={setupStatus.roleMenusCount > 0} label="Role Menus" detail={setupStatus.roleMenusCount > 0 ? `${setupStatus.roleMenusCount} menus` : "None"} href={`/dashboard/servers/${id}/rolemenus`} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Admin Actions */}
                      {(isMod || permsLoading) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {(perms.isAdmin || permsLoading) && (
                            permsLoading ? <Skeleton className="h-[68px] rounded-2xl" /> : (
                              <button onClick={() => router.push(`/dashboard/servers/${id}/settings`)} className="bg-card rounded-2xl p-4 border border-border hover:border-indigo-500/50 transition-all text-left cursor-pointer flex items-start gap-3">
                                <Settings size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div><p className="text-foreground text-sm font-medium">Settings</p><p className="text-muted-foreground text-xs">Configure bot</p></div>
                              </button>
                            )
                          )}
                          <button onClick={() => router.push(`/dashboard/servers/${id}/members`)} className="bg-card rounded-2xl p-4 border border-border hover:border-blue-500/50 transition-all text-left cursor-pointer flex items-start gap-3">
                            <Users size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                            <div><p className="text-foreground text-sm font-medium">Members</p><p className="text-muted-foreground text-xs">View & manage</p></div>
                          </button>
                          <button onClick={() => router.push(`/dashboard/servers/${id}/moderation`)} className="bg-card rounded-2xl p-4 border border-border hover:border-rose-500/50 transition-all text-left cursor-pointer flex items-start gap-3">
                            <Shield size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
                            <div><p className="text-foreground text-sm font-medium">Moderation</p><p className="text-muted-foreground text-xs">Tickets & bans</p></div>
                          </button>
                          <button onClick={() => router.push(`/dashboard/servers/${id}/economy`)} className="bg-card rounded-2xl p-4 border border-border hover:border-amber-500/50 transition-all text-left cursor-pointer flex items-start gap-3">
                            <Wallet size={20} className="text-warning flex-shrink-0 mt-0.5" />
                            <div><p className="text-foreground text-sm font-medium">Economy</p><p className="text-muted-foreground text-xs">Coins & shop</p></div>
                          </button>
                        </div>
                      )}
                    {/* --- AI-REPLACED (2026-03-24) ---
                        Reason: TabsContent -> conditional rendering
                        --- Original code (commented out for rollback) ---
                        </TabsContent>
                        <TabsContent value="activity" className="space-y-6">
                        --- End original code --- */}
                    </div>)}

                    {/* ====== ACTIVITY TAB ====== */}
                    {activeTab === "activity" && (<div className="space-y-6">
                    {/* --- END AI-REPLACED --- */}
                      {/* Currently Studying (mod+) */}
                      {(isMod || permsLoading) && (
                        <div className="bg-card rounded-2xl border border-border overflow-hidden">
                          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                            </span>
                            <h3 className="text-base font-bold text-foreground">
                              {adminStats?.activeNow.count ?? 0} {(adminStats?.activeNow.count ?? 0) === 1 ? "user" : "users"} studying right now
                            </h3>
                          </div>
                          {!adminStats ? (
                            <div className="p-5 space-y-3">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <Skeleton className="w-8 h-8 rounded-full" />
                                  <Skeleton className="h-4 flex-1 max-w-[200px]" />
                                  <Skeleton className="h-4 w-16 ml-auto" />
                                </div>
                              ))}
                            </div>
                          ) : adminStats.activeNow.count === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                              <HeadphonesIcon size={32} className="mx-auto mb-2 opacity-40" />
                              <p>No one is currently studying</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-border/30">
                              {adminStats.activeNow.users.map((user) => (
                                <div key={user.userId} className="px-5 py-3 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                                    {user.displayName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{user.displayName}</p>
                                  </div>
                                  <span className="ml-auto text-xs text-emerald-400 font-mono whitespace-nowrap">
                                    {formatDuration(user.startTime)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Your Study Time */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatCard icon={<Clock size={14} />} label="Today" value={formatMinutes(serverStats?.studyTime.todayMinutes ?? 0)} color="text-emerald-400/70" />
                        <StatCard icon={<Clock size={14} />} label="This Week" value={formatMinutes(serverStats?.studyTime.thisWeekMinutes ?? 0)} color="text-blue-400/70" />
                        <StatCard icon={<Clock size={14} />} label="This Month" value={formatMinutes(serverStats?.studyTime.thisMonthMinutes ?? 0)} color="text-indigo-400/70" />
                        <StatCard icon={<Clock size={14} />} label="All Time" value={formatMinutes(serverStats?.studyTime.allTimeMinutes ?? 0)} color="text-purple-400/70" />
                      </div>

                      {/* Activity Chart */}
                      {chartData.length > 0 && (
                        <div className="bg-card rounded-2xl border border-border p-5">
                          <h3 className="text-base font-bold text-foreground mb-4">Daily Study Activity</h3>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                <defs>
                                  <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity={0.2} />
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                                <Bar dataKey="minutes" fill="url(#barGrad2)" radius={[3, 3, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Your Stats */}
                      <div className="bg-card rounded-2xl border border-border p-5">
                        <h3 className="text-base font-bold text-foreground mb-4">Your Stats in This Server</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Study Time</p>
                            <p className="text-lg font-bold text-emerald-400">{data.you.trackedTimeHours}h</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Coins</p>
                            <p className="text-lg font-bold text-warning">{data.you.coins.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Messages</p>
                            <p className="text-lg font-bold text-blue-400">{(memberData?.messages.totalMessages ?? 0).toLocaleString()}</p>
                          </div>
                          {data.you.firstJoined && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Joined</p>
                              <p className="text-lg font-bold text-foreground">
                                {new Date(data.you.firstJoined).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    {/* --- AI-REPLACED (2026-03-24) ---
                        Reason: TabsContent -> conditional rendering
                        --- Original code (commented out for rollback) ---
                        </TabsContent>
                        <TabsContent value="leaderboard" className="space-y-4">
                        --- End original code --- */}
                    </div>)}

                    {/* ====== LEADERBOARD TAB ====== */}
                    {/* --- AI-MODIFIED (2026-03-14) --- */}
                    {/* Purpose: enhanced leaderboard with type tabs, period filter, podium, pagination */}
                    {activeTab === "leaderboard" && (<div className="space-y-4">
                    {/* --- END AI-REPLACED --- */}
                      {/* Controls */}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 w-fit">
                          {(["study", "messages", "coins"] as SLBType[]).map((t) => {
                            const icons = { study: Clock, messages: MessageSquare, coins: Coins }
                            const labels = { study: "Study Time", messages: "Messages", coins: "Coins" }
                            const Icon = icons[t]
                            return (
                              <button key={t} onClick={() => setLbType(t)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  lbType === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                }`}>
                                <Icon size={15} />
                                <span className="hidden sm:inline">{labels[t]}</span>
                              </button>
                            )
                          })}
                        </div>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          {lbType !== "coins" && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {([
                                { v: "all" as SLBPeriod, l: "All Time" },
                                ...(lbHasSeason ? [{ v: "season" as SLBPeriod, l: "Season" }] : []),
                                { v: "month" as SLBPeriod, l: "This Month" },
                                { v: "week" as SLBPeriod, l: "This Week" },
                                { v: "today" as SLBPeriod, l: "Today" },
                              ]).map((p) => (
                                <button key={p.v} onClick={() => setLbPeriod(p.v)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    lbPeriod === p.v
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                                  }`}>
                                  {p.l}
                                </button>
                              ))}
                            </div>
                          )}
                          {/* --- AI-REPLACED (2026-03-24) ---
                              Reason: Replaced custom search input with shared SearchInput component
                              --- Original code (commented out for rollback) ---
                              <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input type="text" value={lbSearch} onChange={(e) => setLbSearch(e.target.value)}
                                  placeholder="Search members..."
                                  className="pl-8 pr-3 py-1.5 text-sm rounded-lg bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/50 w-48 sm:w-40" />
                              </div>
                              --- End original code --- */}
                          <SearchInput value={lbSearch} onChange={setLbSearch} placeholder="Search members..." className="w-48 sm:w-40" />
                          {/* --- END AI-REPLACED --- */}
                        </div>
                      </div>

                      {/* Your Position */}
                      {lbData?.yourPosition && (
                        <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${
                          lbData.yourPosition.rank <= 3
                            ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-amber-500/20"
                            : "bg-gradient-to-r from-indigo-500/10 to-purple-500/5 border-indigo-500/20"
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              lbData.yourPosition.rank <= 3 ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"
                            }`}>
                              #{lbData.yourPosition.rank}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">Your Position</p>
                              <p className="text-xs text-muted-foreground">
                                #{lbData.yourPosition.rank.toLocaleString()} of {lbData.totalEntries.toLocaleString()} members
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground tabular-nums">{lbFormatValue(lbData.yourPosition.value, lbType)}</p>
                              <p className="text-xs text-muted-foreground">{lbUnit(lbType)}</p>
                            </div>
                            {Math.ceil(lbData.yourPosition.rank / 25) !== lbPage && (
                              <button onClick={lbJumpToYou}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                Jump <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        {lbLoading ? (
                          <div className="p-6 space-y-3">
                            <div className="flex items-end justify-center gap-4 py-6">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                  <Skeleton className={`w-12 h-12 rounded-full`} />
                                  <Skeleton className="w-16 h-3 rounded" />
                                  <Skeleton className={`w-20 rounded-t-lg ${i === 2 ? "h-20" : i === 1 ? "h-14" : "h-10"}`} />
                                </div>
                              ))}
                            </div>
                            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                          </div>
                        ) : !lbData || lbData.totalEntries === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <Trophy size={32} className="mx-auto mb-2 opacity-40" />
                            <p>{lbDebouncedSearch ? `No members matching "${lbDebouncedSearch}"` : "No activity yet for this period"}</p>
                          </div>
                        ) : (
                          <>
                            {/* Podium top 3 */}
                            {lbPage === 1 && !lbDebouncedSearch && (() => {
                              const top3 = lbData.entries.filter((e) => e.rank <= 3)
                              if (top3.length === 0) return null
                              const ordered = [
                                top3.find((e) => e.rank === 2),
                                top3.find((e) => e.rank === 1),
                                top3.find((e) => e.rank === 3),
                              ].filter(Boolean)
                              return (
                                <div className="flex items-end justify-center gap-3 sm:gap-2 py-6 px-4">
                                  {ordered.map((entry) => {
                                    if (!entry) return null
                                    const medalColors = { 1: "text-yellow-400", 2: "text-gray-300", 3: "text-amber-600" }
                                    const podBg = {
                                      1: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30",
                                      2: "from-gray-300/15 to-gray-400/5 border-gray-400/25",
                                      3: "from-amber-600/15 to-amber-700/5 border-amber-600/25",
                                    }
                                    const podH = { 1: "h-24", 2: "h-16", 3: "h-12" }
                                    return (
                                      <div key={entry.userId} className={`flex flex-col items-center gap-2 ${entry.rank === 1 ? "w-32 sm:w-24" : "w-24 sm:w-20"}`}>
                                        {/* --- AI-MODIFIED (2025-03-15) ---
                                            Purpose: Move crown outside overflow-hidden so it isn't clipped by the PFP circle. --- */}
                                        <div className={`relative flex items-center justify-center rounded-full border-2 bg-gradient-to-b ${
                                          entry.rank === 1 ? "w-14 h-14 sm:w-12 sm:h-12 border-yellow-400/60" : "w-12 h-12 sm:w-10 sm:h-10 border-muted-foreground/30"
                                        } ${entry.isYou ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-background" : ""}`}>
                                          <div className="absolute inset-0 rounded-full overflow-hidden">
                                            {entry.avatarUrl ? (
                                              <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              <span className={`absolute inset-0 flex items-center justify-center text-base font-bold ${entry.rank === 1 ? "text-yellow-400" : "text-muted-foreground"}`}>
                                                {entry.displayName?.charAt(0)?.toUpperCase() || "?"}
                                              </span>
                                            )}
                                          </div>
                                          <div className="absolute -top-2 -right-1 z-10">
                                            {entry.rank === 1 ? <Crown size={18} className="text-yellow-400" /> :
                                             entry.rank === 2 ? <Medal size={16} className="text-gray-300" /> :
                                             <Award size={16} className="text-amber-600" />}
                                          </div>
                                        </div>
                                        {/* --- END AI-MODIFIED --- */}
                                        <div className="text-center">
                                          <p className={`text-xs font-semibold truncate max-w-full ${entry.isYou ? "text-indigo-400" : "text-foreground"}`}>
                                            {entry.displayName || "Unknown"}{entry.isYou && " (you)"}
                                          </p>
                                          <p className="text-[10px] text-muted-foreground">
                                            {lbFormatValue(entry.value, lbType)} {lbUnit(lbType)}
                                          </p>
                                        </div>
                                        <div className={`w-full rounded-t-lg bg-gradient-to-b border-t border-x ${podBg[entry.rank as 1 | 2 | 3]} ${podH[entry.rank as 1 | 2 | 3]}`}>
                                          <div className="flex items-center justify-center h-full">
                                            <span className={`text-xl font-black ${medalColors[entry.rank as 1 | 2 | 3]}`}>#{entry.rank}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })()}

                            {/* Table for rank 4+ */}
                            <div className="divide-y divide-border">
                              {lbData.entries.filter((e) => e.rank > 3 || lbDebouncedSearch).map((entry) => (
                                <div key={entry.userId}
                                  className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                                    entry.isYou ? "bg-indigo-500/10 border-l-2 border-l-indigo-500" : "hover:bg-muted/30"
                                  }`}>
                                  <span className="w-10 text-sm font-mono text-muted-foreground text-right">
                                    {entry.rank <= 3 ? (
                                      entry.rank === 1 ? <Crown size={16} className="text-yellow-400 inline" /> :
                                      entry.rank === 2 ? <Medal size={16} className="text-gray-300 inline" /> :
                                      <Award size={16} className="text-amber-600 inline" />
                                    ) : `#${entry.rank}`}
                                  </span>
                                  {entry.avatarUrl ? (
                                    <img src={entry.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                  ) : (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                      entry.isYou ? "bg-indigo-500/20 text-indigo-400" : "bg-muted text-muted-foreground"
                                    }`}>
                                      {entry.displayName?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${entry.isYou ? "text-indigo-400" : "text-foreground"}`}>
                                      {entry.displayName || "Unknown User"}
                                      {entry.isYou && <span className="ml-2 text-xs text-indigo-400/70">(you)</span>}
                                    </p>
                                  </div>
                                  <span className="text-sm font-semibold text-foreground tabular-nums">{lbFormatValue(entry.value, lbType)}</span>
                                  <span className="text-xs text-muted-foreground w-12 text-right">{lbUnit(lbType)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Pagination */}
                            {/* --- AI-REPLACED (2026-03-24) ---
                                Reason: Replaced custom leaderboard pagination with shared Pagination component
                                --- Original code (commented out for rollback) ---
                                {lbData.totalPages > 1 && (
                                  <div className="flex items-center justify-center gap-2 py-4 border-t border-border">
                                    <button onClick={() => setLbPage(lbPage - 1)} disabled={lbPage <= 1} ...>
                                      <ChevronLeft size={18} />
                                    </button>
                                    <span>Page {lbPage} of {lbData.totalPages}</span>
                                    <button onClick={() => setLbPage(lbPage + 1)} disabled={lbPage >= lbData.totalPages} ...>
                                      <ChevronRight size={18} />
                                    </button>
                                  </div>
                                )}
                                --- End original code --- */}
                            <Pagination page={lbPage} totalPages={lbData.totalPages} onChange={setLbPage} showLabel className="py-4 border-t border-border" />
                            {/* --- END AI-REPLACED --- */}
                          </>
                        )}
                      </div>
                    {/* --- AI-REPLACED (2026-03-24) ---
                        Reason: TabsContent + Tabs closing -> conditional rendering
                        --- Original code (commented out for rollback) ---
                        </TabsContent>
                        </Tabs>
                        --- End original code --- */}
                    </div>)}
                    {/* --- END AI-MODIFIED --- */}
                  </div>
                </>
              ) : null}
        {/* --- AI-REPLACED (2026-03-24) --- Original: </div></div></div> --- */}
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}
      </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

function SetupCheckItem({ configured, label, detail, href }: { configured: boolean; label: string; detail: string; href: string }) {
  return (
    <Link href={href}>
      <a className="flex items-center justify-between px-5 py-4 hover:bg-accent transition-colors">
        <div className="flex items-center gap-3">
          {configured ? <CheckCircle2 size={20} className="text-success flex-shrink-0" /> : <XCircle size={20} className="text-muted-foreground flex-shrink-0" />}
          <div>
            <p className="text-foreground font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">{detail}</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </a>
    </Link>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
// --- END AI-MODIFIED ---
