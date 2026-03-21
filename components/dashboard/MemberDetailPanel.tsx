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
} from "lucide-react"
import { useState } from "react"
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
}

const typeLabels: Record<string, { label: string; variant: "warning" | "info" | "error" | "default" }> = {
  WARNING: { label: "Bot Warning", variant: "warning" },
  NOTE: { label: "Admin Note", variant: "info" },
  STUDY_BAN: { label: "Study Restriction", variant: "error" },
}

const stateLabels: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" }> = {
  OPEN: { label: "Active", variant: "error" },
  EXPIRING: { label: "Expiring", variant: "warning" },
  EXPIRED: { label: "Expired", variant: "default" },
  PARDONED: { label: "Resolved", variant: "success" },
}

const resolveLabels: Record<string, { label: string; description: string }> = {
  STUDY_BAN: { label: "End Restriction Early", description: "Stops the restriction -- member can earn coins/XP again" },
  WARNING: { label: "Dismiss Warning", description: "Marks this warning as resolved in the member's history" },
  NOTE: { label: "Archive Note", description: "Archives this note (it stays in the history)" },
}

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

export default function MemberDetailPanel({ open, onClose, data, loading, onWarn, onNote, onRestrict, onResolve, onAdjustCoins, onRefund }: Props) {
  const [copiedId, setCopiedId] = useState(false)

  const handleCopyId = () => {
    if (data?.member.userId) {
      navigator.clipboard.writeText(data.member.userId).catch(() => {})
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

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
                  {data.member.avatarUrl ? (
                    <img src={data.member.avatarUrl} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-border/50">
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
              <Tabs defaultValue="overview" className="flex-1">
                <div className="px-6 pt-4">
                  <TabsList className="w-full bg-muted/50 border border-border">
                    <TabsTrigger value="overview" className="flex-1 text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="sessions" className="flex-1 text-xs">Sessions</TabsTrigger>
                    <TabsTrigger value="records" className="flex-1 text-xs">Records</TabsTrigger>
                    <TabsTrigger value="economy" className="flex-1 text-xs">Economy</TabsTrigger>
                  </TabsList>
                </div>

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

                  {data.room && (
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/30 rounded-xl text-sm">
                      <Home size={14} className="text-indigo-400 flex-shrink-0" />
                      <span className="text-foreground font-medium truncate">{data.room.name || "Private Room"}</span>
                      <span className="ml-auto text-warning font-mono text-xs">{data.room.coinBalance} coins</span>
                    </div>
                  )}

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
                            {r.type === "STUDY_BAN" && isActive && (
                              <p className="text-[10px] text-red-400/60 mb-1">This prevents the member from earning coins/XP in voice channels</p>
                            )}
                            {r.expiry && isActive && (
                              <p className="text-[10px] text-muted-foreground">Expires: {formatDateTime(r.expiry)}</p>
                            )}
                            {r.pardonedReason && r.state === "PARDONED" && (
                              <p className="text-[10px] text-muted-foreground">Resolved: {r.pardonedReason}</p>
                            )}
                            {isActive && (
                              <div className="mt-2">
                                <button
                                  onClick={() => onResolve([r.ticketId])}
                                  className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                                    r.type === "STUDY_BAN"
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
