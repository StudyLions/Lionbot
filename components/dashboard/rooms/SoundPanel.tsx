// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Sound bot rental panel for private room detail view.
//          Supports renting, extending, and cancelling ambient
//          sound bots with visual time-remaining indicators.
// ============================================================
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Volume2, Music, StopCircle, Coins } from "lucide-react"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import { SOUND_OPTIONS } from "./types"
import type { SoundRentalData } from "./types"

export default function SoundPanel({
  channelId,
  onMutate,
}: {
  channelId: string
  onMutate: () => void
}) {
  const {
    data,
    isLoading,
    mutate: mutateSoundRental,
  } = useDashboard<SoundRentalData>(`/api/dashboard/rooms/${channelId}/sound-rental`, {
    refreshInterval: 30000,
  })
  const [renting, setRenting] = useState(false)
  const [selectedSound, setSelectedSound] = useState("rain")
  const [hours, setHours] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleRent = useCallback(async () => {
    setLoading(true)
    try {
      const result = await dashboardMutate(
        "POST",
        `/api/dashboard/rooms/${channelId}/sound-rental`,
        { sound_type: selectedSound, hours }
      )
      toast.success(
        `Sound bot rented! Bot #${result.bot_number} will join shortly. Cost: ${result.total_cost} coins.`
      )
      setRenting(false)
      mutateSoundRental()
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to rent sound bot")
    } finally {
      setLoading(false)
    }
  }, [channelId, selectedSound, hours, mutateSoundRental, onMutate])

  const handleExtend = useCallback(
    async (extendHours: number) => {
      setLoading(true)
      try {
        const result = await dashboardMutate(
          "PATCH",
          `/api/dashboard/rooms/${channelId}/sound-rental`,
          { hours: extendHours }
        )
        toast.success(
          `Extended! New expiry: ${new Date(result.new_expires_at).toLocaleTimeString()}. Cost: ${result.extend_cost} coins.`
        )
        mutateSoundRental()
        onMutate()
      } catch (err: any) {
        toast.error(err.message || "Failed to extend rental")
      } finally {
        setLoading(false)
      }
    },
    [channelId, mutateSoundRental, onMutate]
  )

  const handleCancel = useCallback(async () => {
    setLoading(true)
    try {
      await dashboardMutate("DELETE", `/api/dashboard/rooms/${channelId}/sound-rental`, {})
      toast.success("Sound bot rental cancelled.")
      mutateSoundRental()
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel rental")
    } finally {
      setLoading(false)
    }
  }, [channelId, mutateSoundRental, onMutate])

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-8 bg-muted rounded w-full" />
      </div>
    )
  }

  if (!data || !data.rentalEnabled) return null

  const rental = data.rental
  const soundLabel = (st: string) =>
    SOUND_OPTIONS.find((s) => s.value === st)?.label ?? st

  if (rental) {
    const remaining = Math.max(0, new Date(rental.expires_at).getTime() - Date.now())
    const hoursLeft = Math.floor(remaining / 3600_000)
    const minsLeft = Math.floor((remaining % 3600_000) / 60_000)
    const pct = Math.min(100, (remaining / (24 * 3600_000)) * 100)
    const barColor =
      hoursLeft >= 2 ? "bg-emerald-500" : hoursLeft >= 1 ? "bg-amber-500" : "bg-red-500"
    const textColor =
      hoursLeft >= 2 ? "text-emerald-400" : hoursLeft >= 1 ? "text-amber-400" : "text-red-400"

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Volume2 size={14} className="text-indigo-400" /> Sound Bot
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            Active
          </span>
        </h4>

        <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Music size={14} className="text-indigo-300" />
              <span className="text-foreground font-medium">
                {soundLabel(rental.sound_type)}
              </span>
              <span className="text-xs text-muted-foreground">Bot #{rental.bot_number}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {rental.total_cost} coins spent
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={textColor}>
                {hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m remaining` : `${minsLeft}m remaining`}
              </span>
              <span className="text-muted-foreground">
                Expires{" "}
                {new Date(rental.expires_at).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", barColor)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            {[1, 2, 4].map((h) => (
              <button
                key={h}
                disabled={loading}
                onClick={() => handleExtend(h)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20 transition-colors disabled:opacity-50"
              >
                +{h}h
                <span className="ml-1 text-muted-foreground">({data.hourlyRate * h})</span>
              </button>
            ))}
            <button
              disabled={loading}
              onClick={handleCancel}
              className="ml-auto px-2.5 py-1 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <StopCircle size={10} /> Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (renting) {
    const totalCost = data.hourlyRate * hours
    const selectedOption = SOUND_OPTIONS.find((s) => s.value === selectedSound)

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Volume2 size={14} className="text-indigo-400" /> Rent Sound Bot
        </h4>
        <div className="space-y-3 p-3 rounded-lg bg-card/50 border border-border/50">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Sound</label>
            <select
              value={selectedSound}
              onChange={(e) => setSelectedSound(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border text-foreground focus:border-indigo-500/50 focus:outline-none"
            >
              {SOUND_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {selectedOption && (
              <p className="text-[11px] text-muted-foreground mt-1">{selectedOption.description}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Duration</label>
            <div className="flex gap-2">
              {[1, 2, 4, 8].map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={cn(
                    "flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                    hours === h
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      : "bg-muted text-muted-foreground border-border hover:bg-accent"
                  )}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
            <span className="text-muted-foreground">
              {data.hourlyRate}/hr &times; {hours}h
            </span>
            <span className="text-amber-300 font-medium flex items-center gap-1">
              <Coins size={12} /> {totalCost} LionCoins
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRent}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              Rent Sound Bot
            </button>
            <button
              onClick={() => setRenting(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-muted text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Volume2 size={14} className="text-indigo-400" /> Sound Bot
      </h4>
      <button
        onClick={() => setRenting(true)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20 transition-colors"
      >
        <Music size={12} /> Rent a Sound Bot
      </button>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Add ambient sounds or LoFi music to your room. {data.hourlyRate} coins/hour.
      </p>
    </div>
  )
}
