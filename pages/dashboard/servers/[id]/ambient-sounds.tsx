// @ts-nocheck
// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Ambient Sounds premium feature dashboard page.
//          Admins configure up to 5 generic sound bots, each
//          playing a chosen sound in a chosen voice channel.
//          Includes: analytics, schedule editor, voting toggle,
//          and rental admin settings.
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader, SectionCard, ChannelSelect, toast,
} from "@/components/dashboard/ui"
import PremiumGate from "@/components/dashboard/PremiumGate"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import { useState, useCallback, useEffect } from "react"
import {
  Volume2, CloudRain, Flame, Waves, Wind, Radio,
  ExternalLink, CircleDot, AlertCircle, RefreshCw, WifiOff,
  Play, Square, Type, BarChart3, Clock, Vote, Coins,
  Plus, Trash2, Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// ── Constants ─────────────────────────────────────────────

const SOUNDS = [
  { id: "rain",        name: "Rain",        Icon: CloudRain },
  { id: "campfire",    name: "Campfire",     Icon: Flame },
  { id: "ocean",       name: "Ocean Waves",  Icon: Waves },
  { id: "brown_noise", name: "Brown Noise",  Icon: Wind },
  { id: "white_noise", name: "White Noise",  Icon: Radio },
] as const

const VOLUME_OPTIONS = [
  { value: 25,  label: "Low" },
  { value: 50,  label: "Medium" },
  { value: 100, label: "High" },
] as const

const BOT_INVITE_URLS: Record<number, string> = {
  1: "https://discord.com/oauth2/authorize?client_id=838178898764103741",
  2: "https://discord.com/oauth2/authorize?client_id=838309890858287125",
  3: "https://discord.com/oauth2/authorize?client_id=838309965055655946",
  4: "https://discord.com/oauth2/authorize?client_id=838310064904470588",
  5: "https://discord.com/oauth2/authorize?client_id=838310176845987870",
}

// ── Types ─────────────────────────────────────────────────

interface BotSlotConfig {
  guildid: string
  bot_number: number
  sound_type: string | null
  channelid: string | null
  volume: number
  enabled: boolean
  status: string
  error_msg: string | null
  nickname_template: string | null
  voting_enabled: boolean
  vote_cooldown_minutes: number
  updated_at: string | null
}

interface ApiResponse {
  isPremium: boolean
  configs: BotSlotConfig[]
  botStatus: Record<number, { online: boolean; username: string | null }>
}

type LocalSlot = Omit<BotSlotConfig, "guildid" | "updated_at" | "status" | "error_msg"> & {
  status: string
  error_msg: string | null
}

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Types for analytics, schedule, and rental features
interface AnalyticsData {
  totalHours: number
  allTimeHours: number
  peakListeners: number
  allTimePeakListeners: number
  soundBreakdown: { sound: string; hours: number }[]
  dailyBreakdown: { date: string; hours: number }[]
  sessionCount: number
  range: string
}

interface ScheduleSlot {
  schedule_id: number
  guildid: string
  bot_number: number
  sound_type: string
  start_time: string
  end_time: string
  days: number[]
}

interface RentalConfig {
  guildid: string
  room_rental_enabled: boolean
  room_rental_hourly_rate: number
}

interface ActiveRental {
  rental_id: number
  channelid: string
  userid: string
  bot_number: number
  sound_type: string
  started_at: string
  expires_at: string
  total_cost: number
}
// --- END AI-MODIFIED ---

const SOUND_EMOJIS: Record<string, string> = {
  rain: "\u{1F327}\u{FE0F}",
  campfire: "\u{1F525}",
  ocean: "\u{1F30A}",
  brown_noise: "\u{1F7E4}",
  white_noise: "\u26AA",
}

const DEFAULT_NICK_TEMPLATE = "{emoji} {sound}"

function previewNickname(template: string | null, soundId: string | null, botNumber: number): string {
  const t = template || DEFAULT_NICK_TEMPLATE
  const label = SOUNDS.find((s) => s.id === soundId)?.name ?? "Sound"
  const emoji = (soundId && SOUND_EMOJIS[soundId]) || "\u{1F3B5}"
  return t.replace("{emoji}", emoji).replace("{sound}", label).replace("{bot}", String(botNumber)).slice(0, 32)
}

// ── Helpers ───────────────────────────────────────────────

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Added bot_offline status and botOnline parameter for heartbeat detection
function statusBadge(status: string, errorMsg: string | null, botOnline?: boolean) {
  if (botOnline === false && status !== "bot_not_in_guild") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
        <WifiOff size={10} /> Bot offline
      </span>
    )
  }
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <CircleDot size={10} className="animate-pulse" /> Playing
        </span>
      )
    case "idle":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
          <CircleDot size={10} /> Waiting for users
        </span>
      )
    case "error":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400" title={errorMsg ?? ""}>
          <AlertCircle size={10} /> {errorMsg ? errorMsg.slice(0, 50) : "Error"}
        </span>
      )
    case "bot_not_in_guild":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <CircleDot size={10} /> Not added
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <CircleDot size={10} /> Pending
        </span>
      )
  }
}
// --- END AI-MODIFIED ---

// ── Component ─────────────────────────────────────────────

export default function AmbientSoundsPage() {
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  const apiUrl = id ? `/api/dashboard/servers/${id}/ambient-sounds` : null
  const { data: apiData, isLoading } = useDashboard<ApiResponse>(apiUrl)
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id ? `/api/dashboard/servers/${id}` : null,
  )
  const serverName = serverData?.server?.name || "Server"
  const isPremium = apiData?.isPremium ?? false
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Heartbeat-based bot online/offline detection + refresh
  const botStatus = apiData?.botStatus ?? {}
  const [refreshing, setRefreshing] = useState(false)
  // --- END AI-MODIFIED ---

  const [slots, setSlots] = useState<LocalSlot[]>([])
  const [original, setOriginal] = useState<LocalSlot[]>([])

  useEffect(() => {
    if (!apiData) return
    const allSlots: LocalSlot[] = []
    for (let n = 1; n <= 5; n++) {
      const existing = apiData.configs.find((c) => c.bot_number === n)
      allSlots.push({
        bot_number: n,
        sound_type: existing?.sound_type ?? null,
        channelid: existing?.channelid ?? null,
        volume: existing?.volume ?? 50,
        enabled: existing?.enabled ?? false,
        status: existing?.status ?? "bot_not_in_guild",
        error_msg: existing?.error_msg ?? null,
        nickname_template: existing?.nickname_template ?? null,
        voting_enabled: existing?.voting_enabled ?? false,
        vote_cooldown_minutes: existing?.vote_cooldown_minutes ?? 30,
      })
    }
    setSlots(allSlots)
    setOriginal(JSON.parse(JSON.stringify(allSlots)))
  }, [apiData])

  const updateSlot = useCallback((botNum: number, patch: Partial<LocalSlot>) => {
    setSlots((prev) =>
      prev.map((s) => (s.bot_number === botNum ? { ...s, ...patch } : s)),
    )
  }, [])

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Immediate save for a single slot — called by Start/Stop and live setting changes
  const [savingSlot, setSavingSlot] = useState<number | null>(null)

  const saveSlot = useCallback(async (slot: LocalSlot) => {
    setSavingSlot(slot.bot_number)
    try {
      await dashboardMutate("PATCH", `/api/dashboard/servers/${guildId}/ambient-sounds`, {
        bot_number: slot.bot_number,
        sound_type: slot.sound_type,
        channelid: slot.channelid,
        volume: slot.volume,
        enabled: slot.enabled,
        nickname_template: slot.nickname_template,
        voting_enabled: slot.voting_enabled,
        vote_cooldown_minutes: slot.vote_cooldown_minutes,
      })
      invalidate(apiUrl!)
      setOriginal((prev) =>
        prev.map((s) => (s.bot_number === slot.bot_number ? { ...slot } : s)),
      )
      toast.success(slot.enabled ? "Bot started — it will connect shortly" : "Bot stopped")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save")
    }
    setSavingSlot(null)
  }, [guildId, apiUrl])

  const updateAndSave = useCallback((botNum: number, patch: Partial<LocalSlot>) => {
    setSlots((prev) => {
      const updated = prev.map((s) => (s.bot_number === botNum ? { ...s, ...patch } : s))
      const slot = updated.find((s) => s.bot_number === botNum)
      if (slot && slot.enabled) {
        saveSlot(slot)
      }
      return updated
    })
  }, [saveSlot])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Fetch analytics, schedules, and rental config for expanded features
  const [analyticsRange, setAnalyticsRange] = useState<"7d" | "30d">("7d")
  const statsUrl = id ? `/api/dashboard/servers/${id}/ambient-sounds-stats?range=${analyticsRange}` : null
  const { data: statsData } = useDashboard<AnalyticsData>(statsUrl)

  const schedUrl = id ? `/api/dashboard/servers/${id}/ambient-sounds-schedule` : null
  const { data: schedData } = useDashboard<{ schedules: ScheduleSlot[] }>(schedUrl)
  const schedules = schedData?.schedules ?? []

  const rentalUrl = id ? `/api/dashboard/servers/${id}/ambient-sounds-rental-config` : null
  const { data: rentalData } = useDashboard<{ config: RentalConfig; activeRentals: ActiveRental[] }>(rentalUrl)

  const [newSlot, setNewSlot] = useState<{
    bot_number: number
    sound_type: string
    start_time: string
    end_time: string
    days: number[]
  }>({ bot_number: 1, sound_type: "rain", start_time: "09:00", end_time: "17:00", days: [0,1,2,3,4,5,6] })
  const [addingSlot, setAddingSlot] = useState(false)

  const addScheduleSlot = useCallback(async () => {
    setAddingSlot(true)
    try {
      await dashboardMutate("POST", `/api/dashboard/servers/${guildId}/ambient-sounds-schedule`, newSlot)
      invalidate(schedUrl!)
      toast.success("Schedule slot added")
    } catch (err: any) {
      toast.error(err?.message || "Failed to add slot")
    }
    setAddingSlot(false)
  }, [guildId, schedUrl, newSlot])

  const deleteScheduleSlot = useCallback(async (scheduleId: number) => {
    try {
      await dashboardMutate("DELETE", `/api/dashboard/servers/${guildId}/ambient-sounds-schedule`, { schedule_id: scheduleId })
      invalidate(schedUrl!)
      toast.success("Schedule slot removed")
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete slot")
    }
  }, [guildId, schedUrl])

  const [savingRental, setSavingRental] = useState(false)
  const saveRentalConfig = useCallback(async (patch: Partial<RentalConfig>) => {
    setSavingRental(true)
    try {
      await dashboardMutate("PATCH", `/api/dashboard/servers/${guildId}/ambient-sounds-rental-config`, patch)
      invalidate(rentalUrl!)
      toast.success("Rental settings saved")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save rental settings")
    }
    setSavingRental(false)
  }, [guildId, rentalUrl])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Refresh button handler to re-fetch status
  const handleRefresh = useCallback(async () => {
    if (!apiUrl) return
    setRefreshing(true)
    invalidate(apiUrl)
    if (statsUrl) invalidate(statsUrl)
    if (schedUrl) invalidate(schedUrl)
    if (rentalUrl) invalidate(rentalUrl)
    setTimeout(() => setRefreshing(false), 1000)
  }, [apiUrl, statsUrl, schedUrl, rentalUrl])
  // --- END AI-MODIFIED ---

  // ── Render ────────────────────────────────────────────

  return (
    <Layout SEO={{ title: `Ambient Sounds - ${serverName} - LionBot`, description: "Configure ambient sound bots for your voice channels" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
          <div className="min-h-screen bg-background pt-6 pb-20 px-4">
            <div className="max-w-5xl mx-auto flex gap-8">
              <ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />
              <div className="flex-1 min-w-0">
                {/* --- AI-MODIFIED (2026-03-22) --- */}
                {/* Purpose: Added refresh button next to page header */}
                <div className="flex items-start justify-between gap-4">
                  <PageHeader
                    title="Ambient Sounds"
                    description="Add relaxing background audio to your voice channels. Each bot can play one sound in one channel — invite multiple for more channels."
                  />
                  {isPremium && (
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="mt-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-800 transition-colors"
                      title="Refresh status"
                    >
                      <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    </button>
                  )}
                </div>
                {/* --- END AI-MODIFIED --- */}

                {isLoading ? (
                  <div className="space-y-4 mt-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-28 bg-gray-800/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : !isPremium ? (
                  <PremiumGate
                    title="Ambient Sounds"
                    subtitle="Fill your voice channels with relaxing background audio — rain, ocean waves, campfire, and more. Bots join automatically when someone enters and leave when the channel is empty."
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                      {SOUNDS.map(({ id, name, Icon }) => (
                        <div key={id} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border border-white/10">
                          <Icon size={24} className="text-amber-400/70" />
                          <span className="text-xs text-gray-300">{name}</span>
                        </div>
                      ))}
                    </div>
                  </PremiumGate>
                ) : (
                  <div className="space-y-4 mt-6">
                    <p className="text-sm text-muted-foreground">
                      Bots sit in the voice channel so members can see them waiting. Audio plays automatically when someone joins and pauses when the channel is empty.
                      Users can adjust each bot's volume individually by right-clicking it in Discord.
                    </p>

                    {/* --- AI-MODIFIED (2026-03-23) --- */}
                    {/* Purpose: Analytics section showing usage stats */}
                    {statsData && (statsData.sessionCount > 0 || statsData.allTimeHours > 0) && (
                      <SectionCard title="">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Analytics</h3>
                          </div>
                          <div className="flex gap-1">
                            {(["7d", "30d"] as const).map((r) => (
                              <button
                                key={r}
                                onClick={() => setAnalyticsRange(r)}
                                className={cn(
                                  "px-3 py-1 rounded text-xs font-medium transition-colors",
                                  analyticsRange === r
                                    ? "bg-primary/15 text-primary"
                                    : "text-muted-foreground hover:text-foreground",
                                )}
                              >
                                {r === "7d" ? "7 days" : "30 days"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Hours ({analyticsRange})</p>
                            <p className="text-lg font-bold text-foreground">{statsData.totalHours}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">All-time hours</p>
                            <p className="text-lg font-bold text-foreground">{statsData.allTimeHours}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Peak listeners</p>
                            <p className="text-lg font-bold text-foreground">{statsData.allTimePeakListeners}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sessions ({analyticsRange})</p>
                            <p className="text-lg font-bold text-foreground">{statsData.sessionCount}</p>
                          </div>
                        </div>

                        {statsData.soundBreakdown.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Sound Breakdown</p>
                            <div className="space-y-1.5">
                              {statsData.soundBreakdown
                                .sort((a, b) => b.hours - a.hours)
                                .map((s) => {
                                  const maxH = Math.max(...statsData.soundBreakdown.map((x) => x.hours))
                                  const pct = maxH > 0 ? (s.hours / maxH) * 100 : 0
                                  const label = SOUNDS.find((x) => x.id === s.sound)?.name ?? s.sound
                                  return (
                                    <div key={s.sound} className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
                                      <div className="flex-1 h-4 bg-gray-800/50 rounded overflow-hidden">
                                        <div
                                          className="h-full bg-primary/40 rounded"
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-foreground w-12 text-right">{s.hours}h</span>
                                    </div>
                                  )
                                })}
                            </div>
                          </div>
                        )}

                        {statsData.dailyBreakdown.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Daily Usage</p>
                            <div className="flex items-end gap-1 h-20">
                              {statsData.dailyBreakdown.map((d) => {
                                const maxH = Math.max(...statsData.dailyBreakdown.map((x) => x.hours))
                                const pct = maxH > 0 ? (d.hours / maxH) * 100 : 0
                                return (
                                  <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                                    <div
                                      className="w-full bg-primary/30 rounded-t min-h-[2px]"
                                      style={{ height: `${pct}%` }}
                                      title={`${d.date}: ${d.hours}h`}
                                    />
                                    <span className="text-[8px] text-muted-foreground">{d.date.slice(5)}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </SectionCard>
                    )}
                    {/* --- END AI-MODIFIED --- */}

                    {/* --- AI-MODIFIED (2026-03-22) --- */}
                    {/* Purpose: Dynamic guild_id in invite URLs, bot online/offline detection,
                        bot username display, dimmed cards when offline */}
                    {slots.map((slot) => {
                      const isAdded = slot.status !== "bot_not_in_guild"
                      const baseInviteUrl = BOT_INVITE_URLS[slot.bot_number]
                      const inviteUrl = baseInviteUrl
                        ? `${baseInviteUrl}&guild_id=${guildId}&disable_guild_select=true`
                        : null
                      const soundLabel = SOUNDS.find((s) => s.id === slot.sound_type)?.name
                      const hb = botStatus[slot.bot_number]
                      const botOnline = hb?.online ?? undefined
                      const botUsername = hb?.username ?? null
                      const isOffline = botOnline === false && isAdded

                      return (
                        <SectionCard key={slot.bot_number} title="">

                          <div className={cn(isOffline && "opacity-50 pointer-events-none")}>
                            {/* Card header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center",
                                  isOffline ? "bg-red-500/10" : "bg-primary/10",
                                )}>
                                  <Volume2 size={16} className={isOffline ? "text-red-400" : "text-primary"} />
                                </div>
                                <div>
                                  <h3 className="text-sm font-semibold text-foreground">
                                    {botUsername || `Sound Bot #${slot.bot_number}`}
                                    {soundLabel && isAdded && (
                                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                                        — {soundLabel}
                                      </span>
                                    )}
                                  </h3>
                                  {botUsername && (
                                    <p className="text-[10px] text-muted-foreground">
                                      Slot #{slot.bot_number}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {statusBadge(slot.status, slot.error_msg, botOnline)}
                              </div>
                            </div>
                          </div>

                          {/* Offline banner */}
                          {isOffline && (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                              <WifiOff size={14} className="text-red-400 shrink-0" />
                              <p className="text-xs text-red-300">
                                This bot&apos;s process is not running. Configuration is saved but the bot cannot connect to voice channels until it&apos;s back online.
                              </p>
                            </div>
                          )}

                          {/* Not added — show invite button */}
                          {!isAdded && inviteUrl && (
                            <a
                              href={inviteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                            >
                              <ExternalLink size={14} />
                              Add {botUsername || `Sound Bot #${slot.bot_number}`} to Server
                            </a>
                          )}
                          {!isAdded && !inviteUrl && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              Invite URL not configured yet — contact support.
                            </p>
                          )}

                          {/* Added — show configuration */}
                          {isAdded && !isOffline && (
                            <div className="space-y-4">
                              {/* Sound picker */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">Sound</label>
                                <div className="flex flex-wrap gap-2">
                                  {SOUNDS.map(({ id: sid, name, Icon }) => (
                                    <button
                                      key={sid}
                                      onClick={() => updateAndSave(slot.bot_number, { sound_type: sid })}
                                      className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                        slot.sound_type === sid
                                          ? "bg-primary/15 text-primary border-primary/30"
                                          : "bg-gray-800/50 text-muted-foreground border-transparent hover:bg-gray-800 hover:text-foreground",
                                      )}
                                    >
                                      <Icon size={12} />
                                      {name}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Channel selector */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">Voice Channel</label>
                                <ChannelSelect
                                  guildId={guildId}
                                  value={slot.channelid ? [slot.channelid] : []}
                                  onChange={(v) => {
                                    const val = Array.isArray(v) ? v[0] ?? null : v
                                    updateAndSave(slot.bot_number, { channelid: val })
                                  }}
                                  placeholder="Select a voice channel"
                                  channelTypes={[2]}
                                />
                              </div>

                              {/* Volume */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">Volume</label>
                                <div className="flex gap-2">
                                  {VOLUME_OPTIONS.map(({ value, label }) => (
                                    <button
                                      key={value}
                                      onClick={() => updateAndSave(slot.bot_number, { volume: value })}
                                      className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                        slot.volume === value
                                          ? "bg-primary/15 text-primary border-primary/30"
                                          : "bg-gray-800/50 text-muted-foreground border-transparent hover:bg-gray-800 hover:text-foreground",
                                      )}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* --- AI-MODIFIED (2026-03-23) --- */}
                              {/* Purpose: Customizable bot nickname template with live preview */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                  Bot Nickname
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={slot.nickname_template ?? ""}
                                    onChange={(e) => {
                                      const val = e.target.value || null
                                      updateAndSave(slot.bot_number, { nickname_template: val })
                                    }}
                                    placeholder={DEFAULT_NICK_TEMPLATE}
                                    maxLength={100}
                                    className="flex-1 bg-gray-800/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                                  />
                                </div>
                                <p className="mt-1.5 text-[11px] text-muted-foreground">
                                  Preview: <span className="text-foreground font-medium">{previewNickname(slot.nickname_template, slot.sound_type, slot.bot_number)}</span>
                                  <span className="ml-2 text-muted-foreground/60">
                                    — Use {"{emoji}"} {"{sound}"} {"{bot}"} as placeholders
                                  </span>
                                </p>
                              </div>
                              {/* --- END AI-MODIFIED --- */}

                              {/* --- AI-MODIFIED (2026-03-23) --- */}
                              {/* Purpose: Voting toggle and cooldown setting */}
                              <div className="border-t border-white/5 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Vote size={12} /> Sound Voting
                                  </label>
                                  <button
                                    onClick={() => updateAndSave(slot.bot_number, { voting_enabled: !slot.voting_enabled })}
                                    className={cn(
                                      "relative w-9 h-5 rounded-full transition-colors",
                                      slot.voting_enabled ? "bg-primary" : "bg-gray-700",
                                    )}
                                  >
                                    <span className={cn(
                                      "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                                      slot.voting_enabled ? "left-[18px]" : "left-0.5",
                                    )} />
                                  </button>
                                </div>
                                {slot.voting_enabled && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[11px] text-muted-foreground">Cooldown:</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={1440}
                                      value={slot.vote_cooldown_minutes}
                                      onChange={(e) => {
                                        const val = Math.max(1, Math.min(1440, parseInt(e.target.value) || 30))
                                        updateAndSave(slot.bot_number, { vote_cooldown_minutes: val })
                                      }}
                                      className="w-16 bg-gray-800/50 border border-white/10 rounded px-2 py-1 text-xs text-foreground"
                                    />
                                    <span className="text-[11px] text-muted-foreground">minutes between sound switches</span>
                                  </div>
                                )}
                                <p className="text-[10px] text-muted-foreground/60 mt-1">
                                  Members can vote for sounds via buttons in the VC text chat
                                </p>
                              </div>
                              {/* --- END AI-MODIFIED --- */}

                              {/* --- AI-MODIFIED (2026-03-23) --- */}
                              {/* Purpose: Schedule slots for this bot */}
                              <div className="border-t border-white/5 pt-4">
                                <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <Clock size={12} /> Sound Schedule
                                </label>
                                <p className="text-[10px] text-muted-foreground/60 mb-2">
                                  Set time slots to automatically switch sounds during the day (uses your server&apos;s timezone)
                                </p>

                                {schedules.filter((s) => s.bot_number === slot.bot_number).length > 0 && (
                                  <div className="space-y-1.5 mb-3">
                                    {schedules
                                      .filter((s) => s.bot_number === slot.bot_number)
                                      .map((s) => {
                                        const sLabel = SOUNDS.find((x) => x.id === s.sound_type)?.name ?? s.sound_type
                                        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                                        const dayStr = s.days.length === 7 ? "Every day" : s.days.map((d) => dayNames[d]).join(", ")
                                        return (
                                          <div key={s.schedule_id} className="flex items-center justify-between bg-gray-800/30 rounded-lg px-3 py-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-medium text-foreground">{sLabel}</span>
                                              <span className="text-[10px] text-muted-foreground">{s.start_time} – {s.end_time}</span>
                                              <span className="text-[10px] text-muted-foreground/60">{dayStr}</span>
                                            </div>
                                            <button
                                              onClick={() => deleteScheduleSlot(s.schedule_id)}
                                              className="p-1 text-red-400/60 hover:text-red-400 transition-colors"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        )
                                      })}
                                  </div>
                                )}

                                <div className="flex flex-wrap items-end gap-2 bg-gray-800/20 rounded-lg p-2.5">
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block mb-0.5">Sound</span>
                                    <select
                                      value={newSlot.bot_number === slot.bot_number ? newSlot.sound_type : "rain"}
                                      onChange={(e) => setNewSlot((p) => ({ ...p, bot_number: slot.bot_number, sound_type: e.target.value }))}
                                      className="bg-gray-800/50 border border-white/10 rounded px-2 py-1 text-xs text-foreground"
                                    >
                                      {SOUNDS.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block mb-0.5">Start</span>
                                    <input
                                      type="time"
                                      value={newSlot.bot_number === slot.bot_number ? newSlot.start_time : "09:00"}
                                      onChange={(e) => setNewSlot((p) => ({ ...p, bot_number: slot.bot_number, start_time: e.target.value }))}
                                      className="bg-gray-800/50 border border-white/10 rounded px-2 py-1 text-xs text-foreground"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block mb-0.5">End</span>
                                    <input
                                      type="time"
                                      value={newSlot.bot_number === slot.bot_number ? newSlot.end_time : "17:00"}
                                      onChange={(e) => setNewSlot((p) => ({ ...p, bot_number: slot.bot_number, end_time: e.target.value }))}
                                      className="bg-gray-800/50 border border-white/10 rounded px-2 py-1 text-xs text-foreground"
                                    />
                                  </div>
                                  <button
                                    onClick={() => {
                                      setNewSlot((p) => ({ ...p, bot_number: slot.bot_number }))
                                      addScheduleSlot()
                                    }}
                                    disabled={addingSlot}
                                    className="flex items-center gap-1 px-3 py-1 rounded bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors disabled:opacity-50"
                                  >
                                    <Plus size={10} />
                                    {addingSlot ? "Adding..." : "Add Slot"}
                                  </button>
                                </div>
                              </div>
                              {/* --- END AI-MODIFIED --- */}

                              {/* --- AI-MODIFIED (2026-03-23) --- */}
                              {/* Purpose: Start/Stop button that immediately saves to API */}
                              {slot.enabled ? (
                                <button
                                  onClick={() => {
                                    const updated = { ...slot, enabled: false }
                                    updateSlot(slot.bot_number, { enabled: false })
                                    saveSlot(updated)
                                  }}
                                  disabled={savingSlot === slot.bot_number}
                                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-600/15 hover:bg-red-600/25 text-red-400 text-sm font-medium transition-colors border border-red-500/20"
                                >
                                  <Square size={14} />
                                  {savingSlot === slot.bot_number ? "Saving..." : "Stop Playing"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (!slot.sound_type || !slot.channelid) return
                                    const updated = { ...slot, enabled: true }
                                    updateSlot(slot.bot_number, { enabled: true })
                                    saveSlot(updated)
                                  }}
                                  disabled={!slot.sound_type || !slot.channelid || savingSlot === slot.bot_number}
                                  className={cn(
                                    "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    slot.sound_type && slot.channelid
                                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                      : "bg-gray-800/50 text-muted-foreground cursor-not-allowed",
                                  )}
                                >
                                  <Play size={14} />
                                  {savingSlot === slot.bot_number
                                    ? "Saving..."
                                    : !slot.sound_type && !slot.channelid
                                      ? "Select a sound and channel to start"
                                      : !slot.sound_type
                                        ? "Select a sound to start"
                                        : !slot.channelid
                                          ? "Select a channel to start"
                                          : "Start Playing"}
                                </button>
                              )}
                              {/* --- END AI-MODIFIED --- */}
                            </div>
                          )}
                        </SectionCard>
                      )
                    })}
                    {/* --- END AI-MODIFIED --- */}

                    {/* --- AI-MODIFIED (2026-03-23) --- */}
                    {/* Purpose: Rental admin settings and active rentals view */}
                    <SectionCard title="">
                      <div className="flex items-center gap-2 mb-4">
                        <Coins size={16} className="text-amber-400" />
                        <h3 className="text-sm font-semibold text-foreground">Private Room Rentals</h3>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-4">
                        Allow members with private rooms to rent an available sound bot using LionCoins.
                        They can use the <code className="text-xs bg-gray-800 px-1 rounded">/room sound</code> command.
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground">Enable room rentals</span>
                        <button
                          onClick={() =>
                            saveRentalConfig({
                              room_rental_enabled: !(rentalData?.config?.room_rental_enabled ?? false),
                            })
                          }
                          disabled={savingRental}
                          className={cn(
                            "relative w-9 h-5 rounded-full transition-colors",
                            rentalData?.config?.room_rental_enabled ? "bg-primary" : "bg-gray-700",
                          )}
                        >
                          <span className={cn(
                            "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                            rentalData?.config?.room_rental_enabled ? "left-[18px]" : "left-0.5",
                          )} />
                        </button>
                      </div>

                      {rentalData?.config?.room_rental_enabled && (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-muted-foreground">Hourly rate:</span>
                            <input
                              type="number"
                              min={1}
                              max={10000}
                              defaultValue={rentalData.config.room_rental_hourly_rate}
                              onBlur={(e) => {
                                const val = Math.max(1, Math.min(10000, parseInt(e.target.value) || 10))
                                saveRentalConfig({ room_rental_hourly_rate: val })
                              }}
                              className="w-20 bg-gray-800/50 border border-white/10 rounded px-2 py-1 text-xs text-foreground"
                            />
                            <span className="text-xs text-muted-foreground">LionCoins / hour</span>
                          </div>

                          {(rentalData?.activeRentals?.length ?? 0) > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Active Rentals</p>
                              <div className="space-y-1.5">
                                {rentalData!.activeRentals.map((r) => {
                                  const sLabel = SOUNDS.find((s) => s.id === r.sound_type)?.name ?? r.sound_type
                                  const expiresAt = new Date(r.expires_at)
                                  const remaining = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 60000))
                                  return (
                                    <div key={r.rental_id} className="flex items-center justify-between bg-gray-800/30 rounded-lg px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-foreground">Bot #{r.bot_number}</span>
                                        <span className="text-[10px] text-muted-foreground">{sLabel}</span>
                                        <span className="text-[10px] text-muted-foreground/60">by {r.userid}</span>
                                      </div>
                                      <span className="text-[10px] text-amber-400">{remaining}m left • {r.total_cost} coins</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </SectionCard>
                    {/* --- END AI-MODIFIED --- */}
                  </div>
                )}

                {/* SaveBar removed — Start/Stop button and setting changes auto-save */}
              </div>
            </div>
          </div>
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
