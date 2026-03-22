// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Ambient Sounds premium feature dashboard page.
//          Admins configure up to 5 generic sound bots, each
//          playing a chosen sound in a chosen voice channel.
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader, SectionCard, ChannelSelect, Toggle, SaveBar, toast,
} from "@/components/dashboard/ui"
import PremiumGate from "@/components/dashboard/PremiumGate"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import { useState, useCallback, useEffect } from "react"
import {
  Volume2, CloudRain, Flame, Waves, Wind, Radio,
  ExternalLink, CircleDot, AlertCircle,
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

// TODO: fill in after creating bot applications
const BOT_INVITE_URLS: Record<number, string> = {
  1: "",
  2: "",
  3: "",
  4: "",
  5: "",
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
  updated_at: string | null
}

interface ApiResponse {
  isPremium: boolean
  configs: BotSlotConfig[]
}

type LocalSlot = Omit<BotSlotConfig, "guildid" | "updated_at" | "status" | "error_msg"> & {
  status: string
  error_msg: string | null
}

// ── Helpers ───────────────────────────────────────────────

function statusBadge(status: string, errorMsg: string | null) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <CircleDot size={10} className="animate-pulse" /> Active
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

  const [slots, setSlots] = useState<LocalSlot[]>([])
  const [original, setOriginal] = useState<LocalSlot[]>([])
  const [saving, setSaving] = useState(false)

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

  const hasChanges = JSON.stringify(slots) !== JSON.stringify(original)

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const changed = slots.filter((s, i) => JSON.stringify(s) !== JSON.stringify(original[i]))
      for (const slot of changed) {
        await dashboardMutate("PATCH", `/api/dashboard/servers/${guildId}/ambient-sounds`, {
          bot_number: slot.bot_number,
          sound_type: slot.sound_type,
          channelid: slot.channelid,
          volume: slot.volume,
          enabled: slot.enabled,
        })
      }
      invalidate(apiUrl!)
      setOriginal(JSON.parse(JSON.stringify(slots)))
      toast.success(`Saved ${changed.length} sound bot configuration${changed.length > 1 ? "s" : ""}`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to save")
    }
    setSaving(false)
  }, [slots, original, guildId, apiUrl])

  // ── Render ────────────────────────────────────────────

  return (
    <Layout SEO={{ title: `Ambient Sounds - ${serverName} - LionBot`, description: "Configure ambient sound bots for your voice channels" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
          <div className="min-h-screen bg-background pt-6 pb-20 px-4">
            <div className="max-w-5xl mx-auto flex gap-8">
              <ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />
              <div className="flex-1 min-w-0">
                <PageHeader
                  title="Ambient Sounds"
                  description="Add relaxing background audio to your voice channels. Each bot can play one sound in one channel — invite multiple for more channels."
                />

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
                      Bots connect automatically when someone joins the configured voice channel and leave after 60 seconds of the channel being empty.
                      Users can adjust each bot's volume individually by right-clicking it in Discord.
                    </p>

                    {slots.map((slot) => {
                      const isAdded = slot.status !== "bot_not_in_guild"
                      const inviteUrl = BOT_INVITE_URLS[slot.bot_number]
                      const soundLabel = SOUNDS.find((s) => s.id === slot.sound_type)?.name

                      return (
                        <SectionCard key={slot.bot_number}>
                          {/* Card header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Volume2 size={16} className="text-primary" />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                  Sound Bot #{slot.bot_number}
                                  {soundLabel && isAdded && (
                                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                                      — {soundLabel}
                                    </span>
                                  )}
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {statusBadge(slot.status, slot.error_msg)}
                              {isAdded && (
                                <Toggle
                                  checked={slot.enabled}
                                  onChange={(v) => updateSlot(slot.bot_number, { enabled: v })}
                                />
                              )}
                            </div>
                          </div>

                          {/* Not added — show invite button */}
                          {!isAdded && inviteUrl && (
                            <a
                              href={inviteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                            >
                              <ExternalLink size={14} />
                              Add Sound Bot #{slot.bot_number} to Server
                            </a>
                          )}
                          {!isAdded && !inviteUrl && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              Invite URL not configured yet — contact support.
                            </p>
                          )}

                          {/* Added — show configuration */}
                          {isAdded && (
                            <div className="space-y-4">
                              {/* Sound picker */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">Sound</label>
                                <div className="flex flex-wrap gap-2">
                                  {SOUNDS.map(({ id: sid, name, Icon }) => (
                                    <button
                                      key={sid}
                                      onClick={() => updateSlot(slot.bot_number, { sound_type: sid })}
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
                                    updateSlot(slot.bot_number, { channelid: val })
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
                                      onClick={() => updateSlot(slot.bot_number, { volume: value })}
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
                            </div>
                          )}
                        </SectionCard>
                      )
                    })}
                  </div>
                )}

                {hasChanges && isPremium && (
                  <SaveBar
                    onSave={handleSave}
                    onDiscard={() => setSlots(JSON.parse(JSON.stringify(original)))}
                    saving={saving}
                  />
                )}
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
