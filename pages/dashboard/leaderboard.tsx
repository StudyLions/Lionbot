// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Global leaderboard page with server picker, type tabs, period filter,
//          podium top 3, paginated table, search, and your position card
// ============================================================
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Layout from "@/components/Layout/Layout"
import DashboardNav from "@/components/dashboard/DashboardNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import SearchInput from "@/components/dashboard/ui/SearchInput"
import { PageHeader, DashboardShell } from "@/components/dashboard/ui"
import Pagination from "@/components/dashboard/ui/Pagination"
import { Skeleton } from "@/components/ui/skeleton"
import EmptyState from "@/components/dashboard/ui/EmptyState"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import TabBar from "@/components/dashboard/ui/TabBar"
import {
  Trophy, Clock, MessageSquare, Coins, Search,
  ChevronDown, Users,
  Crown, Medal, Award, ArrowRight, Loader2, CalendarRange,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

type LBType = "study" | "messages" | "coins"
type LBPeriod = "all" | "season" | "month" | "week" | "today" | "custom"

interface LBEntry {
  rank: number
  userId: string
  displayName: string | null
  avatarUrl: string | null
  value: number
  isYou: boolean
}

interface LBResponse {
  entries: LBEntry[]
  totalEntries: number
  totalPages: number
  page: number
  yourPosition: { rank: number; value: number } | null
  serverName: string
  seasonStart: string | null
}

interface ServerOption {
  id: string
  name: string
  iconUrl: string | null
  memberCount: number
}

const TYPE_OPTIONS: { value: LBType; label: string; icon: typeof Clock }[] = [
  { value: "study", label: "Study Time", icon: Clock },
  { value: "messages", label: "Messages", icon: MessageSquare },
  { value: "coins", label: "Coins", icon: Coins },
]

// --- AI-MODIFIED (2026-03-15) ---
// Purpose: added Custom period option for date range picker
const PERIOD_OPTIONS: { value: LBPeriod; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "season", label: "Season" },
  { value: "month", label: "This Month" },
  { value: "week", label: "This Week" },
  { value: "today", label: "Today" },
  { value: "custom", label: "Custom" },
]
// --- END AI-MODIFIED ---

function formatValue(value: number, type: LBType): string {
  if (type === "study") {
    if (value < 1) return `${Math.round(value * 60)}m`
    return `${value.toFixed(1)}h`
  }
  if (type === "messages") return value.toLocaleString()
  return value.toLocaleString()
}

function getTypeUnit(type: LBType): string {
  if (type === "study") return "hours"
  if (type === "messages") return "msgs"
  return "coins"
}

function getMedalColor(rank: number): string {
  if (rank === 1) return "text-yellow-400"
  if (rank === 2) return "text-gray-300"
  if (rank === 3) return "text-amber-600"
  return ""
}

function getPodiumBg(rank: number): string {
  if (rank === 1) return "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30"
  if (rank === 2) return "from-gray-300/15 to-gray-400/5 border-gray-400/25"
  if (rank === 3) return "from-amber-600/15 to-amber-700/5 border-amber-600/25"
  return ""
}

function getPodiumHeight(rank: number): string {
  if (rank === 1) return "h-28"
  if (rank === 2) return "h-20"
  if (rank === 3) return "h-16"
  return ""
}

function ServerPicker({
  servers,
  selected,
  onChange,
}: {
  servers: ServerOption[]
  selected: string
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = servers.find((s) => s.id === selected)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* --- AI-MODIFIED (2026-04-25) --- */}
      {/* Purpose: Add type=button + aria-haspopup/aria-expanded + focus-visible ring */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={current ? `Server: ${current.name}` : "Select server"}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all w-full sm:w-auto sm:min-w-[240px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
      {/* --- END AI-MODIFIED --- */}
        {current?.iconUrl ? (
          <img src={current.iconUrl} alt="" className="w-7 h-7 rounded-full" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {current?.name?.charAt(0) || "?"}
          </div>
        )}
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
            {current?.name || "Select server"}
          </p>
          <p className="text-xs text-muted-foreground">
            {current ? `${current.memberCount.toLocaleString()} members` : ""}
          </p>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div role="listbox" className="absolute top-full left-0 mt-1 w-full min-w-[280px] bg-card border border-border rounded-xl shadow-xl z-50 py-1 max-h-64 overflow-auto">
          {/* --- AI-MODIFIED (2026-04-25) --- */}
          {/* Purpose: role=option + focus-visible + type=button on each picker row */}
          {servers.map((s) => (
            <button
              type="button"
              role="option"
              aria-selected={s.id === selected}
              key={s.id}
              onClick={() => {
                onChange(s.id)
                setOpen(false)
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 w-full hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:bg-muted/50 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
                s.id === selected && "bg-primary/10"
              )}
            >
              {s.iconUrl ? (
                <img src={s.iconUrl} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {s.name.charAt(0)}
                </div>
              )}
              <span className="text-sm text-foreground truncate flex-1 text-left">
                {s.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {s.memberCount.toLocaleString()}
              </span>
            </button>
          ))}
          {/* --- END AI-MODIFIED --- */}
        </div>
      )}
    </div>
  )
}

function Podium({ entries, type }: { entries: LBEntry[]; type: LBType }) {
  const top3 = entries.filter((e) => e.rank <= 3)
  if (top3.length === 0) return null

  const ordered = [
    top3.find((e) => e.rank === 2),
    top3.find((e) => e.rank === 1),
    top3.find((e) => e.rank === 3),
  ].filter(Boolean) as LBEntry[]

  const MedalIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Crown size={22} className="text-yellow-400" />
    if (rank === 2) return <Medal size={20} className="text-gray-300" />
    return <Award size={20} className="text-amber-600" />
  }

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-2 py-6 px-4">
      {ordered.map((entry) => (
        <div
          key={entry.userId}
          className={cn(
            "flex flex-col items-center gap-2 transition-all",
            entry.rank === 1 ? "w-24 sm:w-28 md:w-36" : "w-20 sm:w-24 md:w-28"
          )}
        >
          {/* --- AI-MODIFIED (2025-03-15) ---
              Purpose: Move crown outside overflow-hidden so it isn't clipped by the PFP circle.
              Wrapper has no overflow; inner div clips avatar; crown overlays on wrapper. --- */}
          <div
            className={cn(
              "relative flex items-center justify-center rounded-full border-2 bg-gradient-to-b",
              entry.rank === 1
                ? "w-16 h-16 sm:w-14 sm:h-14 border-yellow-400/60"
                : "w-14 h-14 sm:w-12 sm:h-12 border-muted-foreground/30",
              entry.isYou && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-background"
            )}
          >
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {entry.avatarUrl ? (
                <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(entry.userId) % BigInt(5))}.png` }} />
              ) : (
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center text-lg font-bold",
                    entry.rank === 1 ? "text-yellow-400" : "text-muted-foreground"
                  )}
                >
                  {entry.displayName?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div className="absolute -top-2 -right-1 z-10">
              <MedalIcon rank={entry.rank} />
            </div>
          </div>
          {/* --- END AI-MODIFIED --- */}
          <div className="text-center">
            <p
              className={cn(
                "text-sm font-semibold truncate max-w-full",
                entry.isYou ? "text-indigo-400" : "text-foreground"
              )}
            >
              {entry.displayName || "Unknown"}
              {entry.isYou && " (you)"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatValue(entry.value, type)} {getTypeUnit(type)}
            </p>
          </div>
          <div
            className={cn(
              "w-full rounded-t-lg bg-gradient-to-b border-t border-x",
              getPodiumBg(entry.rank),
              getPodiumHeight(entry.rank)
            )}
          >
            <div className="flex items-center justify-center h-full">
              <span
                className={cn(
                  "text-2xl font-black",
                  getMedalColor(entry.rank)
                )}
              >
                #{entry.rank}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function LeaderboardTable({
  entries,
  type,
  page,
  totalPages,
  onPageChange,
  loading,
}: {
  entries: LBEntry[]
  type: LBType
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  loading: boolean
}) {
  const tableEntries = entries.filter((e) => e.rank > 3)

  return (
    <div>
      {loading ? (
        <div className="space-y-2 px-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : tableEntries.length === 0 && page === 1 ? null : (
        <div className="divide-y divide-border">
          {tableEntries.map((entry) => (
            <div
              key={entry.userId}
              className={cn(
                "flex items-center gap-4 px-4 py-3 transition-colors",
                entry.isYou
                  ? "bg-indigo-500/10 border-l-2 border-l-indigo-500"
                  : "hover:bg-muted/30"
              )}
            >
              <span className="w-10 text-sm font-mono text-muted-foreground text-right">
                #{entry.rank}
              </span>
              {entry.avatarUrl ? (
                <img src={entry.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" onError={(e) => { e.currentTarget.src = `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(entry.userId) % BigInt(5))}.png` }} />
              ) : (
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    entry.isYou
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {entry.displayName?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    entry.isYou ? "text-indigo-400" : "text-foreground"
                  )}
                >
                  {entry.displayName || "Unknown User"}
                  {entry.isYou && (
                    <span className="ml-2 text-xs text-indigo-400/70">(you)</span>
                  )}
                </p>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatValue(entry.value, type)}
              </span>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {getTypeUnit(type)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* --- AI-REPLACED (2026-03-24) ---
          Reason: Replaced custom leaderboard table pagination with shared Pagination component
          --- Original code (commented out for rollback) ---
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t border-border">
              <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} ...>
                <ChevronLeft size={18} />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} ...>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          --- End original code --- */}
      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} showLabel className="py-4 border-t border-border" />
      {/* --- END AI-REPLACED --- */}
    </div>
  )
}

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const [selectedServer, setSelectedServer] = useState<string>("")
  const [type, setType] = useState<LBType>("study")
  const [period, setPeriod] = useState<LBPeriod>("all")
  // --- AI-MODIFIED (2026-03-15) ---
  // Purpose: state for custom date range picker
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  // --- END AI-MODIFIED ---
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [selectedServer, type, period, debouncedSearch, customFrom, customTo])

  useEffect(() => {
    if (type === "coins") setPeriod("all")
  }, [type])

  const { data: serversData, isLoading: serversLoading } = useDashboard<{
    servers: ServerOption[]
  }>(session ? "/api/dashboard/leaderboard-servers" : null)

  useEffect(() => {
    if (serversData?.servers?.length && !selectedServer) {
      setSelectedServer(serversData.servers[0].id)
    }
  }, [serversData, selectedServer])

  // --- AI-MODIFIED (2026-03-15) ---
  // Purpose: pass from/to params for custom date range
  const apiUrl = useMemo(() => {
    if (!selectedServer) return null
    if (period === "custom" && !customFrom) return null
    const params = new URLSearchParams({
      guildId: selectedServer,
      type,
      period,
      page: String(page),
      pageSize: "25",
    })
    if (debouncedSearch) params.set("search", debouncedSearch)
    if (period === "custom") {
      if (customFrom) params.set("from", customFrom)
      if (customTo) params.set("to", customTo)
    }
    return `/api/dashboard/leaderboard?${params.toString()}`
  }, [selectedServer, type, period, page, debouncedSearch, customFrom, customTo])
  // --- END AI-MODIFIED ---

  const { data: lbData, isLoading: lbLoading } = useDashboard<LBResponse>(
    session ? apiUrl : null
  )

  const servers = serversData?.servers || []
  const hasSeason = !!lbData?.seasonStart
  const visiblePeriods = PERIOD_OPTIONS.filter((p) => {
    if (p.value === "season" && !hasSeason) return false
    return true
  })

  const jumpToYourRank = useCallback(() => {
    if (!lbData?.yourPosition) return
    const yourPage = Math.ceil(lbData.yourPosition.rank / 25)
    setPage(yourPage)
  }, [lbData])

  if (!session) return null

  return (
    <Layout
      SEO={{
        title: "Leaderboard - LionBot",
        description: "Server leaderboards and rankings",
      }}
    >
      <AdminGuard>
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to DashboardShell layout wrapper */}
        {/* Original: <div className="min-h-screen ..."><div className="max-w-6xl ..."><DashboardNav /><div className="flex-1 min-w-0 space-y-5"> */}
        <DashboardShell nav={<DashboardNav />} className="space-y-5">
              <PageHeader
                title="Leaderboard"
                description="See who's on top across your servers"
              />

              {serversLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-64 rounded-xl" />
                  <Skeleton className="h-10 w-96 rounded-lg" />
                  <Skeleton className="h-80 rounded-xl" />
                </div>
              ) : servers.length === 0 ? (
                <EmptyState
                  icon={<Users size={48} className="text-muted-foreground" />}
                  title="No servers found"
                  description="Join a server with LionBot to see leaderboards."
                />
              ) : (
                <>
                  {/* Controls Row */}
                  <div className="flex flex-col gap-4">
                    {/* Server Picker */}
                    <ServerPicker
                      servers={servers}
                      selected={selectedServer}
                      onChange={setSelectedServer}
                    />

                    {/* Type Tabs */}
                    {/* --- AI-REPLACED (2026-03-24) ---
                        Reason: Migrated from custom type tabs to shared TabBar component
                        --- Original code (commented out for rollback) ---
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 w-fit">
                          {TYPE_OPTIONS.map((opt) => {
                            const Icon = opt.icon
                            return (
                              <button key={opt.value} onClick={() => setType(opt.value)}
                                className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all", ...)}>
                                <Icon size={15} />
                                <span className="hidden sm:inline">{opt.label}</span>
                              </button>
                            )
                          })}
                        </div>
                        --- End original code --- */}
                    <TabBar
                      tabs={TYPE_OPTIONS.map((opt) => ({ key: opt.value, label: opt.label }))}
                      active={type}
                      onChange={(k) => setType(k as LBType)}
                      variant="pills"
                    />
                    {/* --- END AI-REPLACED --- */}

                    {/* Period Filter + Search Row */}
                    {/* --- AI-MODIFIED (2026-03-21) --- */}
                    {/* Purpose: Better wrapping for period pills on mobile */}
                    <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
                    {/* --- END AI-MODIFIED --- */}
                      {type !== "coins" && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* --- AI-REPLACED (2026-03-24) ---
                              Reason: Migrated period filter from custom pills to shared TabBar component
                              --- Original code (commented out for rollback) ---
                              {visiblePeriods.map((opt) => (
                                <button key={opt.value} onClick={() => setPeriod(opt.value)}
                                  className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all", ...)}>
                                  {opt.value === "custom" && <CalendarRange size={12} className="inline mr-1 -mt-0.5" />}
                                  {opt.label}
                                </button>
                              ))}
                              --- End original code --- */}
                          <TabBar
                            tabs={visiblePeriods.map((opt) => ({ key: opt.value, label: opt.label }))}
                            active={period}
                            onChange={(k) => setPeriod(k as LBPeriod)}
                            variant="pills"
                          />
                          {/* --- END AI-REPLACED --- */}
                          {/* --- AI-MODIFIED (2026-03-15) --- */}
                          {/* Purpose: date range picker for custom period */}
                          {period === "custom" && (
                            <div className="flex items-center gap-2 ml-1">
                              <input
                                type="date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="px-2 py-1 text-xs rounded-md bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                              />
                              <span className="text-xs text-muted-foreground">to</span>
                              <input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                min={customFrom || undefined}
                                className="px-2 py-1 text-xs rounded-md bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                              />
                            </div>
                          )}
                          {/* --- END AI-MODIFIED --- */}
                        </div>
                      )}
                      {/* --- AI-REPLACED (2026-03-24) ---
                          Reason: Replaced custom search input with shared SearchInput component
                          --- Original code (commented out for rollback) ---
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search members..."
                              className="pl-8 pr-3 py-1.5 text-sm rounded-lg bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/50 w-48 sm:w-40" />
                          </div>
                          --- End original code --- */}
                      <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search members..." className="w-48 sm:w-40" />
                      {/* --- END AI-REPLACED --- */}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {lbLoading ? (
                      <div className="p-6 space-y-3">
                        <div className="flex items-end justify-center gap-4 py-8">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                              <Skeleton className="w-14 h-14 rounded-full" />
                              <Skeleton className="w-20 h-4 rounded" />
                              <Skeleton
                                className={cn(
                                  "w-24 rounded-t-lg",
                                  i === 2 ? "h-24" : i === 1 ? "h-16" : "h-12"
                                )}
                              />
                            </div>
                          ))}
                        </div>
                        {Array.from({ length: 7 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 rounded-lg" />
                        ))}
                      </div>
                    ) : !lbData || lbData.totalEntries === 0 ? (
                      <EmptyState
                        icon={<Trophy size={48} className="text-muted-foreground" />}
                        title={
                          debouncedSearch
                            ? "No members found"
                            : "No activity yet"
                        }
                        description={
                          debouncedSearch
                            ? `No members matching "${debouncedSearch}"`
                            : `No ${type === "study" ? "study" : type === "messages" ? "message" : "coin"} activity in this server${period !== "all" ? " for this period" : ""}.`
                        }
                      />
                    ) : (
                      <>
                        {/* Podium */}
                        {page === 1 && !debouncedSearch && (
                          <Podium entries={lbData.entries} type={type} />
                        )}

                        {/* Your Position Card */}
                        {lbData.yourPosition && (
                          <div className="mx-4 mb-3 mt-2">
                            <div
                              className={cn(
                                "flex items-center justify-between gap-3 px-4 py-3 rounded-xl border",
                                lbData.yourPosition.rank <= 3
                                  ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-amber-500/20"
                                  : "bg-gradient-to-r from-indigo-500/10 to-purple-500/5 border-indigo-500/20"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                                    lbData.yourPosition.rank <= 3
                                      ? "bg-amber-500/20 text-amber-400"
                                      : "bg-indigo-500/20 text-indigo-400"
                                  )}
                                >
                                  #{lbData.yourPosition.rank}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    Your Position
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    #{lbData.yourPosition.rank.toLocaleString()} of{" "}
                                    {lbData.totalEntries.toLocaleString()} members
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-sm font-bold text-foreground tabular-nums">
                                    {formatValue(lbData.yourPosition.value, type)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {getTypeUnit(type)}
                                  </p>
                                </div>
                                {Math.ceil(lbData.yourPosition.rank / 25) !== page && (
                                  <button
                                    onClick={jumpToYourRank}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                  >
                                    Jump
                                    <ArrowRight size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Table */}
                        <LeaderboardTable
                          entries={lbData.entries}
                          type={type}
                          page={page}
                          totalPages={lbData.totalPages}
                          onPageChange={setPage}
                          loading={false}
                        />

                        {/* Also show the first 3 in the table if search is active */}
                        {debouncedSearch && lbData.entries.filter((e) => e.rank <= 3).length > 0 && (
                          <div className="divide-y divide-border">
                            {lbData.entries
                              .filter((e) => e.rank <= 3)
                              .map((entry) => (
                                <div
                                  key={entry.userId}
                                  className={cn(
                                    "flex items-center gap-4 px-4 py-3 transition-colors",
                                    entry.isYou
                                      ? "bg-indigo-500/10 border-l-2 border-l-indigo-500"
                                      : "hover:bg-muted/30"
                                  )}
                                >
                                  <span className="w-10 text-sm font-mono text-right">
                                    {entry.rank === 1 && (
                                      <Crown size={16} className="text-yellow-400 inline" />
                                    )}
                                    {entry.rank === 2 && (
                                      <Medal size={16} className="text-gray-300 inline" />
                                    )}
                                    {entry.rank === 3 && (
                                      <Award size={16} className="text-amber-600 inline" />
                                    )}
                                  </span>
                                  {entry.avatarUrl ? (
                                    <img src={entry.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" onError={(e) => { e.currentTarget.src = `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(entry.userId) % BigInt(5))}.png` }} />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                                      {entry.displayName?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-foreground">
                                      {entry.displayName || "Unknown User"}
                                    </p>
                                  </div>
                                  <span className="text-sm font-semibold text-foreground tabular-nums">
                                    {formatValue(entry.value, type)}
                                  </span>
                                  <span className="text-xs text-muted-foreground w-12 text-right">
                                    {getTypeUnit(type)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
