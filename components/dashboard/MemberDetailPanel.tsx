// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Slide-out member detail panel with Overview, Sessions,
//          Records, and Economy tabs for server admin management
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: UX polish - clear text, contextual resolve labels, refund buttons
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/dashboard/ui"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock, Coins, Dumbbell, TrendingUp, CheckSquare, CalendarCheck,
  Headphones, MessageSquare, AlertTriangle, FileText, Ban, CheckCircle2,
  ShieldAlert, Copy, Home, Save, RotateCcw, Info,
  // --- AI-MODIFIED (2026-04-17) ---
  // Purpose: Icons for the new Blacklist History tab + DM composer
  History, Video, MonitorSmartphone, Loader2, ArrowRight, Send, X,
  // --- END AI-MODIFIED ---
} from "lucide-react"
// --- AI-MODIFIED (2026-04-17) ---
// Purpose: useEffect for the lazy-loaded blacklist history fetch
import { useEffect, useState } from "react"
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Add Link and useRouter for room history cross-link
import Link from "next/link"
import { useRouter } from "next/router"
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---

interface MemberDetail {
  member: {
    userId: string; displayName: string | null; avatarUrl?: string
    trackedTimeHours: number; coins: number; workoutCount: number
    firstJoined: string | null; lastLeft: string | null; lastActive: string | null
    videoWarned: boolean; revisionMuteCount: number
  }
  ranks: { currentXpRankId: string | null; currentVoiceRankId: string | null; currentMsgRankId: string | null } | null
  seasonStats: { voiceStats: number; xpStats: number; messageStats: number } | null
  recentSessions: Array<{ type: "voice" | "text"; startTime: string; duration: number; channelId: string | null; tag: string | null }>
  records: Array<{
    ticketId: number; type: string; state: string; createdAt: string | null
    content: string | null; moderatorId: string; duration: number | null
    expiry: string | null; pardonedBy: string | null; pardonedAt: string | null; pardonedReason: string | null
  }>
  restrictionEscalation: { priorRestrictions: number; nextDuration: string }
  recentTransactions: Array<{
    id: number; type: string; amount: number; bonus: number
    createdAt: string; fromAccount: string | null; toAccount: string | null
  }>
  inventory: Array<{ inventoryId: number; itemId: number; itemType: string; roleId: string | null; price: number }>
  schedule: { totalBooked: number; totalAttended: number; totalMissed: number; attendanceRate: number }
  room: { channelId: string; name: string | null; coinBalance: number; createdAt: string | null } | null
  taskStats: { totalCreated: number; totalCompleted: number; completionRate: number }
  savedRolesCount: number
}

interface Props {
  open: boolean
  onClose: () => void
  data: MemberDetail | null
  loading: boolean
  onWarn: () => void
  onNote: () => void
  onRestrict: () => void
  onResolve: (ticketIds: number[]) => void
  onAdjustCoins: () => void
  onRefund?: (transactionId: number) => void
  // --- AI-MODIFIED (2026-04-17) ---
  // Purpose: Bumped by the parent after a successful action so the
  //          lazy-loaded Blacklist History tab can refetch.
  refreshNonce?: number
  // --- END AI-MODIFIED ---
}

// --- AI-MODIFIED (2026-04-17) ---
// Purpose: Types for the lazy-loaded /blacklist-history API response
type BlacklistKind = "STUDY_BAN" | "SCREEN_BAN"

interface LadderTier {
  tier: number
  durationSeconds: number | null
  label: string
}

interface ByTypeEntry {
  label: string
  total: number
  active: number
  pardoned: number
  ladder: LadderTier[]
  nextTier: LadderTier | null
  atPermanentTier: boolean
  currentBlacklist: { ticketId: number; expiry: string | null; isPermanent: boolean } | null
}

interface BlacklistRecentTicket {
  ticketId: number
  type: BlacklistKind
  state: string
  createdAt: string | null
  content: string | null
  moderatorId: string
  duration: number | null
  expiry: string | null
  pardonedBy: string | null
  pardonedAt: string | null
  pardonedReason: string | null
  auto: boolean
  offenseNumber: number | null
  totalTiers: number | null
}

interface BlacklistHistoryResponse {
  user: { userId: string; displayName: string | null }
  byType: Record<BlacklistKind, ByTypeEntry>
  recentTickets: BlacklistRecentTicket[]
  monthly: { month: string; studyBans: number; screenBans: number }[]
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-17) ---
// Purpose: Add SCREEN_BAN label for the new Screen Blacklist support
const typeLabels: Record<string, { label: string; variant: "warning" | "info" | "error" | "default" }> = {
  WARNING: { label: "Bot Warning", variant: "warning" },
  NOTE: { label: "Admin Note", variant: "info" },
  STUDY_BAN: { label: "Video Blacklist", variant: "error" },
  SCREEN_BAN: { label: "Screen Blacklist", variant: "error" },
}
// --- END AI-MODIFIED ---

const stateLabels: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" }> = {
  OPEN: { label: "Active", variant: "error" },
  EXPIRING: { label: "Expiring", variant: "warning" },
  EXPIRED: { label: "Expired", variant: "default" },
  PARDONED: { label: "Resolved", variant: "success" },
}

// --- AI-MODIFIED (2026-04-17) ---
// Purpose: Add SCREEN_BAN resolve label for the new Screen Blacklist support
const resolveLabels: Record<string, { label: string; description: string }> = {
  STUDY_BAN: { label: "End Video Blacklist Early", description: "Stops the blacklist -- member can earn coins/XP in voice again" },
  SCREEN_BAN: { label: "End Screen Blacklist Early", description: "Stops the blacklist -- member can stream again" },
  WARNING: { label: "Dismiss Warning", description: "Marks this warning as resolved in the member's history" },
  NOTE: { label: "Archive Note", description: "Archives this note (it stays in the history)" },
}
// --- END AI-MODIFIED ---

const txTypeLabels: Record<string, string> = {
  VOICE_SESSION: "Voice Session",
  TEXT_SESSION: "Text Session",
  SHOP_PURCHASE: "Shop Purchase",
  ADMIN: "Admin Adjustment",
  TASKS: "Task Reward",
  SCHEDULE_BOOK: "Session Booking",
  SCHEDULE_REWARD: "Session Reward",
  TRANSFER: "Transfer",
  REFUND: "Refund",
  OTHER: "Other",
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted/50 rounded-lg ${className}`} />
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "--"
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "--"
  return new Date(dateStr).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function SectionInfo({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 p-2.5 bg-muted/20 rounded-lg text-[11px] text-muted-foreground/70 leading-relaxed">
      <Info size={12} className="flex-shrink-0 mt-0.5 opacity-60" />
      {text}
    </div>
  )
}

// --- AI-MODIFIED (2026-04-17) ---
// Purpose: Helpers + sub-components for the new Blacklist History tab.

function formatExpiryRelative(expiry: string | null, isPermanent: boolean): string {
  if (isPermanent) return "Permanent"
  if (!expiry) return "--"
  const target = new Date(expiry).getTime()
  const now = Date.now()
  const diff = target - now
  if (diff <= 0) return "Expired"
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const mins = Math.floor((diff % 3_600_000) / 60_000)
  if (days >= 1) return `${days}d ${hours}h left`
  if (hours >= 1) return `${hours}h ${mins}m left`
  return `${mins}m left`
}

function MonthlySparkline({ monthly }: { monthly: BlacklistHistoryResponse["monthly"] }) {
  const totals = monthly.map((m) => m.studyBans + m.screenBans)
  const max = Math.max(1, ...totals)
  const w = 280
  const h = 36
  const barW = w / monthly.length
  const gap = 2
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block">
      {monthly.map((m, i) => {
        const total = m.studyBans + m.screenBans
        const studyH = (m.studyBans / max) * (h - 4)
        const screenH = (m.screenBans / max) * (h - 4)
        const x = i * barW + gap / 2
        const innerW = Math.max(1, barW - gap)
        return (
          <g key={m.month}>
            {total === 0 ? (
              <rect x={x} y={h - 1} width={innerW} height={1} className="fill-muted-foreground/30" />
            ) : (
              <>
                <rect x={x} y={h - studyH - screenH} width={innerW} height={studyH} className="fill-red-400/80" />
                <rect x={x} y={h - screenH} width={innerW} height={screenH} className="fill-amber-400/80" />
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

interface TierLadderProps {
  ladder: LadderTier[]
  activeOffenseCount: number
  atPermanentTier: boolean
}

function TierLadder({ ladder, activeOffenseCount, atPermanentTier }: TierLadderProps) {
  if (ladder.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground/70 italic">
        No escalation ladder configured -- next offense applies the server default duration.
      </p>
    )
  }
  return (
    <div className="flex items-center flex-wrap gap-1">
      {ladder.map((tier, i) => {
        const isReached = i < activeOffenseCount
        const isCurrent = i === activeOffenseCount - 1 && activeOffenseCount > 0
        const isNext = i === activeOffenseCount && !atPermanentTier
        return (
          <div key={tier.tier} className="flex items-center gap-1">
            <div
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                isCurrent
                  ? "bg-red-500/20 text-red-300 border-red-500/40"
                  : isNext
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : isReached
                  ? "bg-muted/50 text-muted-foreground/70 border-border line-through opacity-60"
                  : "bg-muted/20 text-muted-foreground border-border/60"
              }`}
              title={
                isCurrent
                  ? `Tier ${tier.tier} (current): ${tier.label}`
                  : isNext
                  ? `Tier ${tier.tier} (next): ${tier.label}`
                  : `Tier ${tier.tier}: ${tier.label}`
              }
            >
              T{tier.tier} {tier.label}
            </div>
            {i < ladder.length - 1 && <ArrowRight size={10} className="text-muted-foreground/40" />}
          </div>
        )
      })}
      {atPermanentTier && (
        <span className="ml-1 text-[10px] uppercase tracking-wider text-red-400 font-bold">
          Next offense: Permanent
        </span>
      )}
    </div>
  )
}

interface BlacklistTypeCardProps {
  kind: BlacklistKind
  entry: ByTypeEntry
  onResolveActive: (ticketId: number) => void
}

function BlacklistTypeCard({ kind, entry, onResolveActive }: BlacklistTypeCardProps) {
  const isVideo = kind === "STUDY_BAN"
  const Icon = isVideo ? Video : MonitorSmartphone
  const accent = isVideo ? "red" : "amber"
  const accentMap: Record<string, { iconText: string; border: string; bg: string }> = {
    red: { iconText: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5" },
    amber: { iconText: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" },
  }
  const a = accentMap[accent]
  const current = entry.currentBlacklist
  return (
    <div className={`rounded-xl border ${a.border} ${a.bg} p-3 space-y-3`}>
      <div className="flex items-center gap-2">
        <Icon size={14} className={a.iconText} />
        <span className="text-sm font-semibold text-foreground">{entry.label}</span>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <span><span className="font-bold text-foreground">{entry.total}</span> total</span>
          <span className="opacity-30">|</span>
          <span><span className="font-bold text-red-400">{entry.active}</span> active</span>
          <span className="opacity-30">|</span>
          <span><span className="font-bold text-emerald-400">{entry.pardoned}</span> resolved</span>
        </div>
      </div>

      {current && (
        <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-red-500/10 border border-red-500/25">
          <div className="min-w-0">
            <p className="text-[11px] text-red-300 font-semibold flex items-center gap-1.5">
              <Ban size={11} /> Currently blacklisted
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatExpiryRelative(current.expiry, current.isPermanent)}
              {!current.isPermanent && current.expiry && (
                <span className="opacity-60"> -- expires {formatDateTime(current.expiry)}</span>
              )}
            </p>
          </div>
          <button
            onClick={() => onResolveActive(current.ticketId)}
            className="text-[10px] px-2 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors flex items-center gap-1 flex-shrink-0"
          >
            <CheckCircle2 size={10} /> End early
          </button>
        </div>
      )}

      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">Escalation ladder</p>
        <TierLadder
          ladder={entry.ladder}
          activeOffenseCount={entry.active}
          atPermanentTier={entry.atPermanentTier}
        />
      </div>

      {entry.nextTier && entry.active > 0 && (
        <p className="text-[10px] text-amber-400/80">
          Next offense escalates to Tier {entry.nextTier.tier}: <span className="font-mono">{entry.nextTier.label}</span>
        </p>
      )}
    </div>
  )
}

// --- END AI-MODIFIED ---

export default function MemberDetailPanel({ open, onClose, data, loading, onWarn, onNote, onRestrict, onResolve, onAdjustCoins, onRefund, refreshNonce }: Props) {
  const [copiedId, setCopiedId] = useState(false)
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Get serverId from router for room history cross-link
  const router = useRouter()
  const serverId = router.query.id as string
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-04-17) ---
  // Purpose: Controlled Tabs + lazy-loaded Blacklist History tab + DM composer
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [blacklistData, setBlacklistData] = useState<BlacklistHistoryResponse | null>(null)
  const [blacklistLoading, setBlacklistLoading] = useState(false)
  const [blacklistError, setBlacklistError] = useState<string | null>(null)
  const [blacklistFetchKey, setBlacklistFetchKey] = useState(0)
  const [dmComposer, setDmComposer] = useState<{ open: boolean; ticketId: number | null; includeContext: boolean }>({
    open: false,
    ticketId: null,
    includeContext: true,
  })
  const [dmContent, setDmContent] = useState("")
  const [dmSending, setDmSending] = useState(false)
  const [dmError, setDmError] = useState<string | null>(null)
  const [dmSuccess, setDmSuccess] = useState<string | null>(null)

  const currentUserId = data?.member.userId ?? null

  useEffect(() => {
    setActiveTab("overview")
    setBlacklistData(null)
    setBlacklistError(null)
    setDmComposer({ open: false, ticketId: null, includeContext: true })
    setDmContent("")
    setDmError(null)
    setDmSuccess(null)
  }, [currentUserId])

  const openDmComposer = (ticketId: number | null) => {
    setDmComposer({ open: true, ticketId, includeContext: ticketId != null })
    setDmError(null)
    setDmSuccess(null)
  }
  const closeDmComposer = () => {
    setDmComposer({ open: false, ticketId: null, includeContext: true })
    setDmContent("")
    setDmError(null)
  }
  const sendDm = async () => {
    if (!serverId || !currentUserId) return
    const trimmed = dmContent.trim()
    if (trimmed.length === 0) {
      setDmError("Type a message before sending.")
      return
    }
    setDmSending(true)
    setDmError(null)
    try {
      const r = await fetch(
        `/api/dashboard/servers/${serverId}/members/${currentUserId}/blacklist-dm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: trimmed,
            ticketId: dmComposer.ticketId,
            includeContext: dmComposer.includeContext,
          }),
        }
      )
      const body = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(body.error || `HTTP ${r.status}`)
      setDmSuccess("DM delivered. A note was added to the audit trail.")
      setDmContent("")
      setBlacklistFetchKey((k) => k + 1)
      setTimeout(() => {
        closeDmComposer()
      }, 1500)
    } catch (err) {
      setDmError(err instanceof Error ? err.message : "Failed to send DM")
    } finally {
      setDmSending(false)
    }
  }
  // --- END AI-MODIFIED ---

  useEffect(() => {
    if (activeTab !== "blacklist") return
    if (!serverId || !currentUserId) return
    let cancelled = false
    setBlacklistLoading(true)
    setBlacklistError(null)
    fetch(`/api/dashboard/servers/${serverId}/members/${currentUserId}/blacklist-history`)
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text().catch(() => "")
          throw new Error(text || `HTTP ${r.status}`)
        }
        return (await r.json()) as BlacklistHistoryResponse
      })
      .then((json) => { if (!cancelled) setBlacklistData(json) })
      .catch((err: Error) => { if (!cancelled) setBlacklistError(err.message || "Failed to load") })
      .finally(() => { if (!cancelled) setBlacklistLoading(false) })
    return () => { cancelled = true }
  }, [activeTab, serverId, currentUserId, blacklistFetchKey, refreshNonce])
  // --- END AI-MODIFIED ---

  const handleCopyId = () => {
    if (data?.member.userId) {
      navigator.clipboard.writeText(data.member.userId).catch(() => {})
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  // --- AI-MODIFIED (2026-04-17) ---
  // Purpose: Pass-through. Parent bumps refreshNonce after the resolve
  //          modal completes, which triggers our blacklist refetch.
  const handleResolveAndRefresh = (ticketIds: number[]) => {
    onResolve(ticketIds)
  }
  // --- END AI-MODIFIED ---

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {loading || !data ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-2 gap-3 mt-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
              <Skeleton className="h-32 mt-4" />
            </div>
          ) : (
            <>
              {/* Header */}
              <SheetHeader className="p-6 pb-4 border-b border-border">
                <div className="flex items-start gap-3 pr-8">
                  {/* --- AI-MODIFIED (2026-03-24) ---
                      Purpose: Changed avatar from rounded-xl to rounded-full for consistency with other dashboard pages */}
                  {data.member.avatarUrl ? (
                    <img src={data.member.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" loading="lazy" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-border/50">
                  {/* --- END AI-MODIFIED --- */}
                      <span className="text-lg font-bold text-foreground/80">{(data.member.displayName || "?").charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <SheetTitle className="text-lg truncate">
                      {data.member.displayName || `User ...${data.member.userId.slice(-4)}`}
                    </SheetTitle>
                    <button onClick={handleCopyId} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5">
                      <span className="font-mono">{data.member.userId}</span>
                      <Copy size={11} />
                      {copiedId && <span className="text-emerald-400 text-[10px]">Copied</span>}
                    </button>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {data.member.firstJoined && <span>Joined {formatDate(data.member.firstJoined)}</span>}
                      {data.member.lastActive && (
                        <><span className="opacity-30">|</span><span>Active {formatDate(data.member.lastActive)}</span></>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">LionBot member data -- not Discord server data</p>
                  </div>
                </div>
              </SheetHeader>

              {/* Tabs */}
              {/* --- AI-MODIFIED (2026-04-17) ---
                  Purpose: Controlled tabs + new Blacklist tab trigger */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <div className="px-6 pt-4">
                  <TabsList className="w-full bg-muted/50 border border-border">
                    <TabsTrigger value="overview" className="flex-1 text-[11px] px-2">Overview</TabsTrigger>
                    <TabsTrigger value="sessions" className="flex-1 text-[11px] px-2">Sessions</TabsTrigger>
                    <TabsTrigger value="records" className="flex-1 text-[11px] px-2">Records</TabsTrigger>
                    <TabsTrigger value="blacklist" className="flex-1 text-[11px] px-2">Blacklist</TabsTrigger>
                    <TabsTrigger value="economy" className="flex-1 text-[11px] px-2">Economy</TabsTrigger>
                  </TabsList>
                </div>
              {/* --- END AI-MODIFIED --- */}

                {/* ====== OVERVIEW ====== */}
                <TabsContent value="overview" className="px-6 pb-6 space-y-4">
                  <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">Bot Activity Stats</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-emerald-400/70 mb-1"><Clock size={12} /><span className="text-[10px] uppercase tracking-wider">Study Time</span></div>
                      <p className="text-lg font-bold text-foreground">{data.member.trackedTimeHours}h</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-amber-400/70 mb-1"><Coins size={12} /><span className="text-[10px] uppercase tracking-wider">Coins</span></div>
                      <p className="text-lg font-bold text-foreground">{data.member.coins.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-purple-400/70 mb-1"><Dumbbell size={12} /><span className="text-[10px] uppercase tracking-wider">Workouts</span></div>
                      <p className="text-lg font-bold text-foreground">{data.member.workoutCount}</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-blue-400/70 mb-1"><TrendingUp size={12} /><span className="text-[10px] uppercase tracking-wider">Season XP</span></div>
                      <p className="text-lg font-bold text-foreground">{data.seasonStats?.xpStats?.toLocaleString() ?? 0}</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-cyan-400/70 mb-1"><CheckSquare size={12} /><span className="text-[10px] uppercase tracking-wider">Tasks Done</span></div>
                      <p className="text-lg font-bold text-foreground">{data.taskStats.totalCompleted}<span className="text-xs text-muted-foreground ml-1">/ {data.taskStats.totalCreated}</span></p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-indigo-400/70 mb-1"><CalendarCheck size={12} /><span className="text-[10px] uppercase tracking-wider">Attendance</span></div>
                      <p className="text-lg font-bold text-foreground">{data.schedule.attendanceRate}%</p>
                    </div>
                  </div>

                  {/* --- AI-MODIFIED (2026-03-22) --- */}
                  {/* Purpose: Add "View Room History" link to room info row */}
                  {data.room && (
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/30 rounded-xl text-sm">
                      <Home size={14} className="text-indigo-400 flex-shrink-0" />
                      <span className="text-foreground font-medium truncate">{data.room.name || "Private Room"}</span>
                      <span className="text-warning font-mono text-xs">{data.room.coinBalance} coins</span>
                      <Link href={`/dashboard/servers/${serverId}/rooms?search=${data.member.userId}`}>
                        <a className="ml-auto text-[10px] text-primary hover:text-primary/80 whitespace-nowrap">Room History →</a>
                      </Link>
                    </div>
                  )}
                  {/* --- END AI-MODIFIED --- */}

                  {data.savedRolesCount > 0 && (
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/30 rounded-xl text-sm">
                      <Save size={14} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{data.savedRolesCount} saved role{data.savedRolesCount !== 1 ? "s" : ""} (restored on rejoin)</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium mb-2">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={onWarn} className="flex flex-col px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400 hover:bg-amber-500/15 transition-colors">
                        <span className="flex items-center gap-2"><AlertTriangle size={14} /> Add Warning</span>
                        <span className="text-[10px] text-amber-400/50 mt-0.5">Adds a bot warning record</span>
                      </button>
                      <button onClick={onNote} className="flex flex-col px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-400 hover:bg-indigo-500/15 transition-colors">
                        <span className="flex items-center gap-2"><FileText size={14} /> Add Note</span>
                        <span className="text-[10px] text-indigo-400/50 mt-0.5">Private admin-only note</span>
                      </button>
                      <button onClick={onAdjustCoins} className="flex flex-col px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400 hover:bg-amber-500/15 transition-colors">
                        <span className="flex items-center gap-2"><Coins size={14} /> Adjust Coins</span>
                        <span className="text-[10px] text-amber-400/50 mt-0.5">Add, set, or reset balance</span>
                      </button>
                      <button onClick={onRestrict} className="flex flex-col px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 hover:bg-red-500/15 transition-colors">
                        <span className="flex items-center gap-2"><Ban size={14} /> Study Restriction</span>
                        <span className="text-[10px] text-red-400/50 mt-0.5">Block voice coin/XP earning</span>
                      </button>
                    </div>
                  </div>
                </TabsContent>

                {/* ====== SESSIONS ====== */}
                <TabsContent value="sessions" className="px-6 pb-6 space-y-3">
                  <SectionInfo text="Recent voice and text study sessions tracked by LionBot in this server." />
                  {data.recentSessions.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground"><Headphones size={32} className="mx-auto mb-2 opacity-40" /><p>No recent sessions</p></div>
                  ) : (
                    <div className="space-y-1.5">
                      {data.recentSessions.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                          {s.type === "voice" ? <Headphones size={14} className="text-emerald-400 flex-shrink-0" /> : <MessageSquare size={14} className="text-blue-400 flex-shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-foreground">{formatDateTime(s.startTime)}</p>
                            {s.tag && <p className="text-[10px] text-indigo-400 truncate">{s.tag}</p>}
                          </div>
                          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{formatDuration(s.duration)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* ====== RECORDS ====== */}
                <TabsContent value="records" className="px-6 pb-6 space-y-4">
                  <SectionInfo text="LionBot moderation records for this member. These are bot records, not Discord server moderation." />

                  {data.restrictionEscalation.priorRestrictions > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm">
                      <ShieldAlert size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-300 font-medium">
                          {data.restrictionEscalation.priorRestrictions} prior restriction{data.restrictionEscalation.priorRestrictions !== 1 ? "s" : ""}
                        </p>
                        <p className="text-red-400/60 text-xs">
                          Next auto-escalation: {data.restrictionEscalation.nextDuration} (based on server rules)
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button onClick={onWarn} className="text-xs px-2.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/15 transition-colors">+ Warning</button>
                    <button onClick={onNote} className="text-xs px-2.5 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/15 transition-colors">+ Note</button>
                    <button onClick={onRestrict} className="text-xs px-2.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/15 transition-colors">+ Restriction</button>
                  </div>

                  {data.records.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground"><FileText size={32} className="mx-auto mb-2 opacity-40" /><p>No records</p></div>
                  ) : (
                    <div className="space-y-2">
                      {data.records.map((r) => {
                        const tl = typeLabels[r.type] || { label: r.type, variant: "default" as const }
                        const sl = stateLabels[r.state] || { label: r.state, variant: "default" as const }
                        const rl = resolveLabels[r.type] || { label: "Resolve", description: "Marks this record as resolved" }
                        const isActive = r.state === "OPEN" || r.state === "EXPIRING"
                        const isExpired = r.state === "EXPIRED"
                        return (
                          <div key={r.ticketId} className={`p-3 rounded-xl border ${isActive ? "border-red-500/20 bg-red-500/5" : "border-border bg-muted/20"}`}>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <Badge variant={tl.variant} size="sm">{tl.label}</Badge>
                              <Badge variant={sl.variant} size="sm" dot>{sl.label}</Badge>
                              <span className="text-[10px] text-muted-foreground ml-auto">{formatDateTime(r.createdAt)}</span>
                            </div>
                            {r.content && <p className="text-sm text-foreground/80 mb-1">{r.content}</p>}
                            {/* --- AI-MODIFIED (2026-04-17) ---
                                Purpose: Add Screen Blacklist explanatory copy alongside Video Blacklist */}
                            {r.type === "STUDY_BAN" && isActive && (
                              <p className="text-[10px] text-red-400/60 mb-1">This prevents the member from earning coins/XP in voice channels</p>
                            )}
                            {r.type === "SCREEN_BAN" && isActive && (
                              <p className="text-[10px] text-red-400/60 mb-1">This prevents the member from streaming/screensharing in voice channels</p>
                            )}
                            {/* --- END AI-MODIFIED --- */}
                            {r.expiry && isActive && (
                              <p className="text-[10px] text-muted-foreground">Expires: {formatDateTime(r.expiry)}</p>
                            )}
                            {r.pardonedReason && r.state === "PARDONED" && (
                              <p className="text-[10px] text-muted-foreground">Resolved: {r.pardonedReason}</p>
                            )}
                            {isActive && (
                              <div className="mt-2">
                                <button
                                  onClick={() => handleResolveAndRefresh([r.ticketId])}
                                  className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                                    r.type === "STUDY_BAN" || r.type === "SCREEN_BAN"
                                      ? "bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25"
                                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15"
                                  }`}
                                >
                                  <CheckCircle2 size={12} /> {rl.label}
                                </button>
                                <p className="text-[9px] text-muted-foreground/50 mt-1">{rl.description}</p>
                              </div>
                            )}
                            {isExpired && (
                              <p className="mt-2 text-[10px] text-muted-foreground/50">Already expired -- no action needed</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* ====== BLACKLIST HISTORY ====== */}
                {/* --- AI-MODIFIED (2026-04-17) ---
                    Purpose: Dedicated Blacklist History tab with ladder, sparkline,
                              quick actions, per-type breakdowns, and an inline
                              DM-the-member composer. Lazy-loaded. */}
                <TabsContent value="blacklist" className="px-6 pb-6 space-y-4">
                  <SectionInfo text="Blacklist (auto-restriction) history for video and screen sharing. Auto-escalates each time a member ignores a warning." />

                  {dmComposer.open && (
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                          <Send size={12} />
                          DM this member
                          {dmComposer.ticketId != null && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                              re: ticket #{dmComposer.ticketId}
                            </span>
                          )}
                        </p>
                        <button
                          onClick={closeDmComposer}
                          className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                          title="Close composer"
                          disabled={dmSending}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <textarea
                        value={dmContent}
                        onChange={(e) => setDmContent(e.target.value.slice(0, 1500))}
                        placeholder="Write a polite, helpful message. They will see it as an embed from the bot."
                        className="w-full bg-background border border-border rounded-md px-2.5 py-2 text-sm resize-none focus:outline-none focus:border-indigo-500/40 min-h-[100px]"
                        disabled={dmSending}
                      />
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dmComposer.includeContext}
                            onChange={(e) => setDmComposer((s) => ({ ...s, includeContext: e.target.checked }))}
                            disabled={dmSending || dmComposer.ticketId == null}
                            className="accent-indigo-500"
                          />
                          <span className={dmComposer.ticketId == null ? "opacity-40" : ""}>
                            Include ticket context (type, status, expiry)
                          </span>
                        </label>
                        <span>{dmContent.length}/1500</span>
                      </div>
                      {dmError && <p className="text-[11px] text-red-400">{dmError}</p>}
                      {dmSuccess && <p className="text-[11px] text-emerald-400">{dmSuccess}</p>}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={sendDm}
                          disabled={dmSending || dmContent.trim().length === 0}
                          className="text-xs px-3 py-1.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {dmSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          {dmSending ? "Sending..." : "Send DM"}
                        </button>
                        <p className="text-[10px] text-muted-foreground/60">
                          A note will be added to the audit trail.
                        </p>
                      </div>
                    </div>
                  )}

                  {blacklistLoading && (
                    <div className="flex items-center justify-center py-10 text-muted-foreground">
                      <Loader2 size={18} className="animate-spin mr-2" />
                      <span className="text-sm">Loading blacklist history...</span>
                    </div>
                  )}

                  {blacklistError && !blacklistLoading && (
                    <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-sm">
                      <p className="text-red-300 font-medium">Couldn't load blacklist history</p>
                      <p className="text-red-400/60 text-xs mt-1">{blacklistError}</p>
                      <button
                        onClick={() => setBlacklistFetchKey((k) => k + 1)}
                        className="mt-2 text-xs px-2 py-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!blacklistLoading && !blacklistError && blacklistData && (() => {
                    const bd = blacklistData
                    const totalAll = bd.byType.STUDY_BAN.total + bd.byType.SCREEN_BAN.total
                    const activeAll = bd.byType.STUDY_BAN.active + bd.byType.SCREEN_BAN.active
                    const activeIds = bd.recentTickets
                      .filter((t) => t.state === "OPEN" || t.state === "EXPIRING")
                      .map((t) => t.ticketId)
                    const visibleTickets = bd.recentTickets.slice(0, 10)
                    return (
                      <>
                        {totalAll === 0 ? (
                          <div className="text-center py-10 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                            <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-400/80" />
                            <p className="text-sm text-emerald-300 font-medium">Clean record</p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              This member has never been auto-blacklisted on this server.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={activeAll > 0 ? "error" : "default"} size="md" dot={activeAll > 0}>
                                {activeAll > 0 ? `${activeAll} active` : "No active blacklist"}
                              </Badge>
                              <Badge variant="default" size="md">{`${totalAll} total offenses`}</Badge>
                              {activeIds.length > 1 && (
                                <button
                                  onClick={() => handleResolveAndRefresh(activeIds)}
                                  className="ml-auto text-xs px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25 flex items-center gap-1.5"
                                  title="End all currently-active blacklists for this member"
                                >
                                  <CheckCircle2 size={12} /> End all ({activeIds.length})
                                </button>
                              )}
                            </div>

                            <div className="space-y-3">
                              <BlacklistTypeCard
                                kind="STUDY_BAN"
                                entry={bd.byType.STUDY_BAN}
                                onResolveActive={(id) => handleResolveAndRefresh([id])}
                              />
                              <BlacklistTypeCard
                                kind="SCREEN_BAN"
                                entry={bd.byType.SCREEN_BAN}
                                onResolveActive={(id) => handleResolveAndRefresh([id])}
                              />
                            </div>

                            <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                                  Last 12 months
                                </p>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400/80" />Video</span>
                                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400/80" />Screen</span>
                                </div>
                              </div>
                              <MonthlySparkline monthly={bd.monthly} />
                              <div className="flex justify-between text-[9px] text-muted-foreground/40 -mt-1 font-mono">
                                <span>{bd.monthly[0]?.month ?? ""}</span>
                                <span>{bd.monthly[bd.monthly.length - 1]?.month ?? ""}</span>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium flex items-center gap-1.5">
                                  <History size={12} /> Recent offenses
                                </p>
                                {bd.recentTickets.length > visibleTickets.length && (
                                  <span className="text-[10px] text-muted-foreground/50">
                                    Showing {visibleTickets.length} of {bd.recentTickets.length}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                {visibleTickets.map((t) => {
                                  const tl = typeLabels[t.type] || { label: t.type, variant: "default" as const }
                                  const sl = stateLabels[t.state] || { label: t.state, variant: "default" as const }
                                  const isActive = t.state === "OPEN" || t.state === "EXPIRING"
                                  return (
                                    <div
                                      key={t.ticketId}
                                      className={`p-2.5 rounded-lg border text-sm ${
                                        isActive ? "border-red-500/20 bg-red-500/5" : "border-border bg-muted/20"
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                        {t.offenseNumber != null && t.totalTiers != null && (
                                          <span
                                            className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-muted/40 text-muted-foreground"
                                            title={`Offense ${t.offenseNumber} of ${t.totalTiers} tiers`}
                                          >
                                            #{t.offenseNumber}/{t.totalTiers}
                                          </span>
                                        )}
                                        <Badge variant={tl.variant} size="sm">{tl.label}</Badge>
                                        <Badge variant={sl.variant} size="sm" dot>{sl.label}</Badge>
                                        <span className="text-[10px] text-muted-foreground ml-auto">
                                          {formatDate(t.createdAt)}
                                        </span>
                                      </div>
                                      {t.content && (
                                        <p className="text-[12px] text-foreground/80 leading-snug">{t.content}</p>
                                      )}
                                      {isActive && t.expiry && (
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                          {formatExpiryRelative(t.expiry, t.expiry === null)}
                                        </p>
                                      )}
                                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                        {isActive && (
                                          <button
                                            onClick={() => handleResolveAndRefresh([t.ticketId])}
                                            className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25 flex items-center gap-1"
                                          >
                                            <CheckCircle2 size={10} /> End early
                                          </button>
                                        )}
                                        <button
                                          onClick={() => openDmComposer(t.ticketId)}
                                          className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/25 flex items-center gap-1"
                                          title="DM this member about this offense"
                                        >
                                          <Send size={10} /> DM
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </>
                        )}

                        <div className="pt-2 border-t border-border space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => openDmComposer(null)}
                              disabled={dmComposer.open}
                              className="text-xs px-3 py-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/15 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Send size={12} /> DM Member
                            </button>
                            <button
                              onClick={onRestrict}
                              className="text-xs px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/15 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Ban size={12} /> + Blacklist
                            </button>
                          </div>
                          <p className="text-[10px] text-muted-foreground/50 text-center">
                            DMs are sent through the bot and logged as a note.
                          </p>
                        </div>
                      </>
                    )
                  })()}
                </TabsContent>
                {/* --- END AI-MODIFIED --- */}

                {/* ====== ECONOMY ====== */}
                <TabsContent value="economy" className="px-6 pb-6 space-y-4">
                  <SectionInfo text="LionCoins balance and transaction history. Admin adjustments are logged below." />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</p>
                      <p className="text-3xl font-bold text-warning">{data.member.coins.toLocaleString()}</p>
                    </div>
                    <button onClick={onAdjustCoins} className="px-3 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-sm hover:bg-amber-500/15 transition-colors flex items-center gap-2">
                      <Coins size={14} /> Adjust
                    </button>
                  </div>

                  {data.inventory.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium mb-2">Shop Inventory</p>
                      <div className="space-y-1.5">
                        {data.inventory.map((item) => (
                          <div key={item.inventoryId} className="flex items-center justify-between px-3 py-2 bg-muted/20 rounded-lg text-sm">
                            <span className="text-foreground">{item.itemType === "COLOUR_ROLE" ? "Colour Role" : item.itemType}</span>
                            <span className="text-muted-foreground font-mono text-xs">{item.price} coins</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium mb-2">Schedule Attendance</p>
                    <div className="flex items-center gap-4 px-3 py-2.5 bg-muted/20 rounded-lg text-sm">
                      <span><span className="font-bold text-foreground">{data.schedule.totalAttended}</span> <span className="text-muted-foreground">attended</span></span>
                      <span><span className="font-bold text-foreground">{data.schedule.totalMissed}</span> <span className="text-muted-foreground">missed</span></span>
                      <span className="ml-auto font-bold text-foreground">{data.schedule.attendanceRate}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium mb-2">Recent Transactions</p>
                    {data.recentTransactions.length === 0 ? (
                      <p className="text-center py-6 text-muted-foreground text-sm">No transactions</p>
                    ) : (
                      <div className="space-y-1">
                        {data.recentTransactions.map((t) => {
                          const isIncoming = t.toAccount === data.member.userId
                          const isRefundable = t.type !== "REFUND" && onRefund
                          return (
                            <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors group">
                              <span className={`text-xs font-mono font-bold ${isIncoming ? "text-emerald-400" : "text-red-400"}`}>
                                {isIncoming ? "+" : "-"}{t.amount}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">{txTypeLabels[t.type] || t.type}</span>
                              {isRefundable && (
                                <button
                                  onClick={() => onRefund!(t.id)}
                                  className="text-[10px] text-muted-foreground/40 hover:text-amber-400 transition-colors lg:opacity-0 lg:group-hover:opacity-100 flex items-center gap-1"
                                  title="Refund this transaction"
                                >
                                  <RotateCcw size={10} /> Refund
                                </button>
                              )}
                              <span className="text-[10px] text-muted-foreground/60 ml-auto whitespace-nowrap">{formatDate(t.createdAt)}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
