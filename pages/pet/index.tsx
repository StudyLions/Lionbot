// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet overview page - pixel art RPG style
// ============================================================
// --- AI-MODIFIED (2026-03-19) ---
// Purpose: Added useState, useCallback, toast for care buttons
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { getItemImageUrl, getUiIconUrl } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelBar from "@/components/pet/ui/PixelBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import ArtistAttribution from "@/components/pet/ui/ArtistAttribution"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { useState, useCallback } from "react"
import { toast } from "sonner"
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Added imports for Room preview section on overview page
import Link from "next/link"
import RoomCanvas from "@/components/pet/room/RoomCanvas"
import { DEFAULT_LAYOUT, mergeLayout } from "@/utils/roomConstraints"
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Import GameboyFrame for wrapping the room preview with active skin
import GameboyFrame from "@/components/pet/GameboyFrame"
// --- END AI-MODIFIED ---

interface PetOverviewData {
  hasPet: boolean
  pet: {
    name: string
    expression: string
    level: number
    xp: string
    food: number
    bath: number
    sleep: number
    life: number
    lastDecayAt: string
    fullscreenMode: boolean
    createdAt: string
  } | null
  equipment: Record<string, { name: string; category: string; rarity: string; assetPath: string; glowTier?: string; glowIntensity?: number }>
  inventoryCount: number
  activeFarmPlots: number
  gold: string
  gems: number
  roomPrefix?: string
  furniture?: Record<string, string>
  roomLayout?: any
  gameboySkinPath?: string | null
  // --- AI-MODIFIED (2026-03-19) ---
  // Purpose: Mood system data
  mood?: number
  moodLabel?: string
  moodMult?: number
  nextDecayAt?: string
  // --- END AI-MODIFIED ---
}

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

// --- AI-MODIFIED (2026-03-19) ---
// Purpose: Mood indicator colors and care button component
const MOOD_COLORS: Record<string, string> = {
  Ecstatic: "#f0c040", Happy: "#40d870", Okay: "#6080a0",
  Sad: "#4080f0", Fainted: "#e04040",
}
const MOOD_EMOJI: Record<string, string> = {
  Ecstatic: "✨", Happy: "😊", Okay: "😐", Sad: "😢", Fainted: "😵",
}

function PetNeedsCard({ pet, mood, moodLabel, moodMult, nextDecayAt, onStatsUpdate }: {
  pet: NonNullable<PetOverviewData["pet"]>
  mood: number
  moodLabel: string
  moodMult: number
  nextDecayAt?: string
  onStatsUpdate: () => void
}) {
  const [caring, setCaring] = useState<string | null>(null)

  const handleCare = useCallback(async (action: string) => {
    if (caring) return
    setCaring(action)
    try {
      const res = await fetch("/api/pet/care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error || "Failed")
        return
      }
      const labels: Record<string, string> = { feed: "Fed!", bathe: "Cleaned!", sleep: "Rested!" }
      toast.success(labels[action] || "Done!")
      onStatsUpdate()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setCaring(null)
    }
  }, [caring, onStatsUpdate])

  const moodColor = MOOD_COLORS[moodLabel] ?? "#6080a0"
  const moodEmoji = MOOD_EMOJI[moodLabel] ?? "😐"

  const decayCountdown = nextDecayAt
    ? (() => {
        const diff = new Date(nextDecayAt).getTime() - Date.now()
        if (diff <= 0) return "now"
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
      })()
    : null

  return (
    <PixelCard className="p-4 space-y-3" corners>
      <div className="flex items-center justify-between pb-2 border-b-2 border-[#1a2a3c]">
        <div className="flex items-center gap-2">
          <img src={getUiIconUrl("liongotchi_heart")} alt="" width={16} height={16}
            style={{ imageRendering: "pixelated" }} />
          <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">Mood & Needs</span>
        </div>
        {decayCountdown && (
          <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
            Next decay in {decayCountdown}
          </span>
        )}
      </div>

      {/* Mood indicator */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{moodEmoji}</span>
          <span className="font-pixel text-sm" style={{ color: moodColor }}>
            {moodLabel}
          </span>
          <PixelBar value={mood} max={8} label="" color={mood >= 5 ? "green" : mood >= 3 ? "gold" : "red"} showText={false} className="w-24" />
        </div>
        <span className={cn(
          "font-pixel text-xs px-2 py-0.5 border",
          moodMult >= 1.0
            ? "text-[#40d870] border-[#40d870]/30 bg-[#40d870]/10"
            : "text-[#e04040] border-[#e04040]/30 bg-[#e04040]/10"
        )}>
          {moodMult.toFixed(2)}x Gold &amp; XP
        </span>
      </div>

      {/* Need bars */}
      <div className="space-y-2">
        <PixelBar value={pet.food} max={8} label="Hunger" color="gold" />
        <PixelBar value={pet.bath} max={8} label="Clean" color="blue" />
        <PixelBar value={pet.sleep} max={8} label="Energy" color="blue" />
      </div>

      {/* Care buttons */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { action: "feed", label: "Feed", emoji: "🍖", color: "#f0c040" },
          { action: "bathe", label: "Bathe", emoji: "🧼", color: "#4080f0" },
          { action: "sleep", label: "Rest", emoji: "💤", color: "#8060c0" },
        ].map(({ action, label, emoji, color }) => (
          <button
            key={action}
            onClick={() => handleCare(action)}
            disabled={caring !== null}
            className={cn(
              "font-pixel text-xs py-2 border-2 transition-all",
              "hover:brightness-125 active:translate-y-px disabled:opacity-50",
              "bg-[#0c1020]"
            )}
            style={{ borderColor: color, color }}
          >
            {caring === action ? "..." : `${emoji} ${label}`}
          </button>
        ))}
      </div>
    </PixelCard>
  )
}
// --- END AI-MODIFIED ---

export default function PetOverview() {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<PetOverviewData>(
    session ? "/api/pet/overview" : null
  )

  const pet = data?.pet
  const equipment = data?.equipment ?? {}
  const equipSlots = ["HEAD", "FACE", "BODY", "BACK", "FEET"]

  return (
    <Layout SEO={{ title: "LionGotchi - LionBot", description: "Your virtual pet companion" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-40" />
                  <Skeleton className="h-32" />
                </div>
              ) : error ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">{(error as Error).message}</p>
                </PixelCard>
              ) : !data?.hasPet ? (
                <PixelCard className="p-12 text-center space-y-4" corners>
                  <img src={getUiIconUrl("liongotchi_heart")} alt="" width={48} height={48}
                    className="mx-auto" style={{ imageRendering: "pixelated" }} />
                  <h2 className="font-pixel text-xl text-[var(--pet-text,#e2e8f0)]">No pet yet!</h2>
                  <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] max-w-sm mx-auto">
                    Use the /pet command in any Discord server with LionBot to create your LionGotchi.
                  </p>
                </PixelCard>
              ) : pet && (
                <>
                  {/* Hero */}
                  <div>
                    <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">{pet.name}</h1>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                      <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                      <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                    </div>
                    {/* --- AI-MODIFIED (2026-03-19) --- */}
                    {/* Purpose: Show derived mood label instead of raw expression */}
                    <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                      Level {pet.level} &middot; {data.moodLabel ?? "Happy"} mood &middot;
                      Created {new Date(pet.createdAt).toLocaleDateString()}
                    </p>
                    {/* --- END AI-MODIFIED --- */}
                  </div>

                  {/* Currency HUD Bar */}
                  <div
                    className="border-[3px] border-[#3a4a6c] bg-gradient-to-b from-[#111828] to-[#0c1020] px-4 py-3"
                    style={{ boxShadow: "3px 3px 0 #060810, inset 0 1px 0 rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <GoldDisplay amount={Number(data.gold)} size="lg" />
                      <div className="flex items-center gap-4">
                        <GoldDisplay amount={data.gems} size="md" type="gem" />
                        <div className="w-px h-6 bg-[#2a3a5c]" />
                        <div className="flex items-center gap-1.5">
                          <img src={getUiIconUrl("liongotchi_greenpot")} alt="" width={16} height={16}
                            style={{ imageRendering: "pixelated" }} />
                          <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">{data.inventoryCount}</span>
                          <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">items</span>
                        </div>
                        <div className="w-px h-6 bg-[#2a3a5c]" />
                        <div className="flex items-center gap-1.5">
                          <span className="font-pixel text-sm text-[#40d870]">{data.activeFarmPlots}</span>
                          <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">farm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- AI-MODIFIED (2026-03-17) --- */}
                  {/* Purpose: Room preview wrapped in GameboyFrame with active skin */}
                  <PixelCard className="p-4 space-y-3" corners>
                    <div className="flex items-center justify-between pb-2 border-b-2 border-[#1a2a3c]">
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-[14px]">🏠</span>
                        <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">Room</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link href="/pet/skins">
                          <span className="font-pixel text-[10px] text-[#d060f0] hover:text-[#e080ff] transition-colors cursor-pointer">
                            Change Skin
                          </span>
                        </Link>
                        <Link href="/pet/room">
                          <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)] hover:text-[#ffd860] transition-colors cursor-pointer">
                            Customize &rarr;
                          </span>
                        </Link>
                      </div>
                    </div>
                    <div className="flex justify-center overflow-x-auto">
                      <GameboyFrame
                        isFullscreen={false}
                        skinAssetPath={data.gameboySkinPath ?? undefined}
                        width={453}
                      >
                        <RoomCanvas
                          roomPrefix={data.roomPrefix ?? "rooms/default"}
                          furniture={data.furniture ?? {}}
                          layout={mergeLayout(data.roomLayout ?? {})}
                          equipment={Object.fromEntries(
                            Object.entries(equipment).map(([slot, item]) => [
                              slot, { assetPath: item.assetPath, category: item.category, glowTier: item.glowTier, glowIntensity: item.glowIntensity }
                            ])
                          )}
                          expression={pet.expression}
                          size={348}
                          animated
                        />
                      </GameboyFrame>
                    </div>
                  </PixelCard>
                  {/* --- END AI-MODIFIED --- */}

                  {/* --- AI-MODIFIED (2026-03-17) --- */}
                  {/* Purpose: Artist attribution note below the room preview */}
                  <ArtistAttribution />
                  {/* --- END AI-MODIFIED --- */}

                  {/* --- AI-REPLACED (2026-03-19) --- */}
                  {/* Reason: Stat redesign -- mood indicator + 3 needs + care buttons + decay countdown */}
                  <PetNeedsCard
                    pet={pet}
                    mood={data.mood ?? 5}
                    moodLabel={data.moodLabel ?? "Happy"}
                    moodMult={data.moodMult ?? 1.0}
                    nextDecayAt={data.nextDecayAt}
                    onStatsUpdate={() => mutate()}
                  />
                  {/* --- END AI-REPLACED --- */}

                  {/* Equipment */}
                  <PixelCard className="p-4" corners>
                    <div className="flex items-center gap-2 pb-2 mb-3 border-b-2 border-[#1a2a3c]">
                      <img src={getUiIconUrl("trophy")} alt="" width={16} height={16}
                        style={{ imageRendering: "pixelated" }} />
                      <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Equipment</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {equipSlots.map((slot) => {
                        const item = equipment[slot]
                        const bc = item ? (RARITY_BORDER[item.rarity] || "#3a4a6c") : "#1a2a3c"
                        const imgUrl = item ? getItemImageUrl(item.assetPath, item.category) : null
                        return (
                          <div
                            key={slot}
                            className="flex items-center gap-3 px-3 py-2 border-2 bg-[#080c18]"
                            style={{ borderColor: bc, boxShadow: "1px 1px 0 #060810" }}
                          >
                            <div className="w-11 h-11 border border-[#1a2a3c] bg-[#0a0e1a] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {imgUrl ? (
                                <CroppedItemImage src={imgUrl} alt={item?.name ?? ""} className="w-full h-full object-contain" />
                              ) : (
                                <span className="font-pixel text-[11px] text-[#3a4a5c]">{slot[0]}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] uppercase">{slot}</p>
                              {item ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] truncate">{item.name}</span>
                                  <PixelBadge rarity={item.rarity} />
                                </div>
                              ) : (
                                <p className="font-pixel text-[13px] text-[#3a4a5c]">Empty</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </PixelCard>
                </>
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
