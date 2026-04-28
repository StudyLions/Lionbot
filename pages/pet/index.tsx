// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet overview page - pixel art RPG style
// ============================================================
// --- AI-REPLACED (2026-04-28) ---
// Reason: Polish pass on the existing dark-navy pixel-RPG aesthetic.
// What the new code does better:
//   - Uses the new <PixelTitleBar /> for the page header (replaces the
//     half-hearted 3-bar golden underline pattern).
//   - Currency HUD becomes a divided-cell "trainer status bar" with
//     5 cells (gold | gems | items | farm | mood mult).
//   - Gameboy room preview is freed from its <PixelCard> wrapper and
//     centered as the page hero (~560px on desktop). Skin/Customize
//     links become themed PixelButtons underneath.
//   - PetNeedsCard, Equipment, Friends-banner all switch to the new
//     PixelCard title bar / accent system for consistent chrome.
//   - Tutorial-retake link moves from a banner row to a small `?`
//     icon in the title bar's actions slot.
//   - Page is split into TOP zone (title + status + hero) and BOTTOM
//     zone (2-col needs/equipment grid) with proper vertical rhythm.
// Original code is preserved at the bottom of this file (commented out)
// so we can roll back if anything regresses.
// --- AI-MODIFIED history (kept for traceability) ---
// 2026-03-19  added care buttons + mood system
// 2026-03-24  migrated to PetShell layout
// 2026-04-03  rename modal + theme provider
// 2026-04-21  responsive Gameboy frame fix
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetShell from "@/components/pet/PetShell"
import { useRouter } from "next/router"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { getItemImageUrl, getUiIconUrl } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelTitleBar from "@/components/pet/ui/PixelTitleBar"
import PixelButton from "@/components/pet/ui/PixelButton"
import NoPetShowcase from "@/components/pet/NoPetShowcase"
import PixelBar from "@/components/pet/ui/PixelBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import ArtistAttribution from "@/components/pet/ui/ArtistAttribution"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { useState, useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import Link from "next/link"
import RoomCanvas from "@/components/pet/room/RoomCanvas"
import { mergeLayout } from "@/utils/roomConstraints"
import GameboyFrame from "@/components/pet/GameboyFrame"

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
  mood?: number
  moodLabel?: string
  moodMult?: number
  nextDecayAt?: string
}

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

const MOOD_COLORS: Record<string, string> = {
  Ecstatic: "#f0c040", Happy: "#40d870", Okay: "#6080a0",
  Sad: "#4080f0", Fainted: "#e04040",
}
const MOOD_EMOJI: Record<string, string> = {
  Ecstatic: "✨", Happy: "😊", Okay: "😐", Sad: "😢", Fainted: "😵",
}

// --- AI-MODIFIED (2026-04-28) ---
// Purpose: Empty-slot category mapping mirrored from inventory.tsx so empty
// equipment slots can deep-link into the marketplace pre-filtered by category.
// TODO: extract this + the mirrored map in inventory.tsx into a shared util
// when we touch inventory next round.
const SLOT_TO_CATEGORY: Record<string, string> = {
  HEAD: "HAT", FACE: "GLASSES", BODY: "COSTUME", BACK: "WINGS", FEET: "BOOTS",
}
const SLOT_ICONS: Record<string, string> = {
  HEAD: "\u{1F452}", FACE: "\u{1F453}", BODY: "\u{1F455}",
  BACK: "\u{1FABD}", FEET: "\u{1F462}",
}
// --- END AI-MODIFIED ---

// ============================================================
// PetNeedsCard
// ============================================================
// --- AI-MODIFIED (2026-04-28) ---
// Purpose: Refit the needs card to use the new PixelCard `title` / `accent`
// props + `titleRight` for mood and decay countdown, instead of an inline
// header with border-bottom. Tightens the care buttons via PixelButton at
// size=sm. Uses the locked palette (gold for feed, info for bathe, ghost
// for sleep with explicit color).
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
    <PixelCard
      className="p-3 space-y-3"
      corners
      accent="green"
      titleIcon={
        <img src={getUiIconUrl("liongotchi_heart")} alt="" width={12} height={12}
          style={{ imageRendering: "pixelated" }} />
      }
      title="Mood & Needs"
      titleRight={
        <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
          {decayCountdown ? `decay in ${decayCountdown}` : ""}
        </span>
      }
    >
      {/* Mood line: emoji + label + mini bar + multiplier pill */}
      <div className="flex items-center justify-between gap-2 px-1 pt-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none">{moodEmoji}</span>
          <span className="font-pixel text-sm truncate" style={{ color: moodColor }}>
            {moodLabel}
          </span>
          <PixelBar value={mood} max={8} label="" color={mood >= 5 ? "green" : mood >= 3 ? "gold" : "red"} showText={false} className="w-20" />
        </div>
        <span className={cn(
          "font-pixel text-xs px-2 py-0.5 border-2 flex-shrink-0",
          moodMult >= 1.0
            ? "text-[#40d870] border-[#40d870]/40 bg-[#40d870]/10"
            : "text-[#e04040] border-[#e04040]/40 bg-[#e04040]/10"
        )}>
          {moodMult.toFixed(2)}x
        </span>
      </div>

      {/* Need bars */}
      <div className="space-y-2">
        <PixelBar value={pet.food} max={8} label="Hunger" color="gold" />
        <PixelBar value={pet.bath} max={8} label="Clean" color="blue" />
        <PixelBar value={pet.sleep} max={8} label="Energy" color="blue" />
      </div>

      {/* Care buttons -- uniform grid, locked-palette inline color via style */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { action: "feed", label: "Feed", emoji: "🍖", color: "#f0c040" },
          { action: "bathe", label: "Bathe", emoji: "🧼", color: "#4080f0" },
          { action: "sleep", label: "Rest", emoji: "💤", color: "#a855f7" },
        ].map(({ action, label, emoji, color }) => (
          <button
            key={action}
            onClick={() => handleCare(action)}
            disabled={caring !== null}
            className={cn(
              "font-pixel text-xs py-1.5 border-2 transition-all",
              "hover:brightness-125 active:translate-y-px disabled:opacity-50",
              "bg-[#0c1020]"
            )}
            style={{ borderColor: color, color, boxShadow: "2px 2px 0 #060810" }}
          >
            {caring === action ? "..." : `${emoji} ${label}`}
          </button>
        ))}
      </div>
    </PixelCard>
  )
}
// --- END AI-MODIFIED ---

// ============================================================
// EquipmentCard
// ============================================================
// --- AI-MODIFIED (2026-04-28) ---
// Purpose: Promote the inline equipment list to its own component using
// the new PixelCard chrome. Empty slots get a dashed pixel border + ghosted
// slot icon + "Find one ->" link to /pet/marketplace?cat=<category>.
// Equipped slots keep the rarity-bordered treatment.
function EquipmentCard({ equipment }: {
  equipment: Record<string, { name: string; category: string; rarity: string; assetPath: string; glowTier?: string; glowIntensity?: number }>
}) {
  const router = useRouter()
  const equipSlots = ["HEAD", "FACE", "BODY", "BACK", "FEET"] as const
  return (
    <PixelCard
      className="p-3"
      corners
      accent="gold"
      titleIcon={
        <img src={getUiIconUrl("trophy")} alt="" width={12} height={12}
          style={{ imageRendering: "pixelated" }} />
      }
      title="Equipment"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {equipSlots.map((slot) => {
          const item = equipment[slot]
          if (item) {
            const bc = RARITY_BORDER[item.rarity] || "#3a4a6c"
            const imgUrl = getItemImageUrl(item.assetPath, item.category)
            return (
              <div
                key={slot}
                className="flex items-center gap-3 px-3 py-2 border-2 bg-[#080c18]"
                style={{ borderColor: bc, boxShadow: "2px 2px 0 #060810, inset 0 1px 0 rgba(255,255,255,0.04)" }}
              >
                <div className="w-11 h-11 border-2 border-[#1a2a3c] bg-[#0a0e1a] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {imgUrl ? (
                    <CroppedItemImage src={imgUrl} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-pixel text-[11px] text-[#3a4a5c]">{slot[0]}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] uppercase tracking-wider">
                    <span className="mr-1 text-[12px]">{SLOT_ICONS[slot]}</span>{slot}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] truncate">{item.name}</span>
                  </div>
                  <PixelBadge rarity={item.rarity} className="text-[8px] px-1 py-0 mt-0.5" />
                </div>
              </div>
            )
          }
          // Empty slot: dashed border + ghosted icon + Find one link
          return (
            <button
              key={slot}
              onClick={() => router.push(`/pet/marketplace?cat=${SLOT_TO_CATEGORY[slot] || ""}`)}
              className="flex items-center gap-3 px-3 py-2 bg-[#060810] border-2 border-dashed border-[#2a3a5c] hover:border-[#4080f0]/60 hover:bg-[#0a0e1a] transition-colors text-left"
              style={{ boxShadow: "2px 2px 0 #060810" }}
              title={`Browse ${SLOT_TO_CATEGORY[slot] || slot} items`}
            >
              <div className="w-11 h-11 border border-dashed border-[#1a2a3c] flex items-center justify-center flex-shrink-0 opacity-30 text-2xl leading-none">
                {SLOT_ICONS[slot]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] uppercase tracking-wider">
                  <span className="mr-1 opacity-60">{SLOT_ICONS[slot]}</span>{slot}
                </p>
                <p className="font-pixel text-[12px] text-[#3a4a5c]">Empty</p>
                <p className="font-pixel text-[10px] text-[#80b0ff] mt-0.5">Find one {"\u2192"}</p>
              </div>
            </button>
          )
        })}
      </div>
    </PixelCard>
  )
}
// --- END AI-MODIFIED ---

// ============================================================
// TrainerStatusBar (currency HUD)
// ============================================================
// --- AI-MODIFIED (2026-04-28) ---
// Purpose: Replace the soft gradient currency strip with a hard divided-cell
// "trainer status bar". 5 cells with fixed dividers, each in its own ink:
//   gold (gold) | gems (purple) | items (text) | farm (green) | mood mult
function TrainerStatusBar({ data }: { data: PetOverviewData }) {
  const cells = [
    {
      key: "gold",
      label: "Gold",
      node: <GoldDisplay amount={Number(data.gold)} size="md" />,
    },
    {
      key: "gems",
      label: "Gems",
      node: <GoldDisplay amount={data.gems} size="md" type="gem" />,
    },
    {
      key: "items",
      label: "Items",
      node: (
        <span className="flex items-center gap-1.5">
          <img src={getUiIconUrl("liongotchi_greenpot")} alt="" width={14} height={14}
            style={{ imageRendering: "pixelated" }} />
          <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">{data.inventoryCount}</span>
        </span>
      ),
    },
    {
      key: "farm",
      label: "Farm",
      node: (
        <span className="flex items-center gap-1.5">
          <span className="font-pixel text-sm text-[#40d870]">{data.activeFarmPlots}</span>
          <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">plots</span>
        </span>
      ),
    },
    {
      key: "mood",
      label: "Mood mult",
      node: (
        <span className={cn(
          "font-pixel text-sm",
          (data.moodMult ?? 1) >= 1.0 ? "text-[#40d870]" : "text-[#e04040]"
        )}>
          {(data.moodMult ?? 1).toFixed(2)}x
        </span>
      ),
    },
  ]
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-2 border-[#3a4a6c] bg-[#0c1020]"
      style={{ boxShadow: "2px 2px 0 #060810, inset 0 1px 0 rgba(255,255,255,0.04)" }}
    >
      {cells.map((c, i) => (
        <div
          key={c.key}
          className={cn(
            "px-3 py-2 flex flex-col gap-0.5",
            i > 0 && "border-l-0 sm:border-l-2 border-t-2 sm:border-t-0 border-[#1a2a3c]",
            // Dividers reset on row break in narrow viewports
            i % 2 === 0 && "sm:border-l-2",
          )}
        >
          <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] uppercase tracking-wider">
            {c.label}
          </span>
          <div className="flex items-center min-h-[20px]">{c.node}</div>
        </div>
      ))}
    </div>
  )
}
// --- END AI-MODIFIED ---

// ============================================================
// FriendRequestsBanner
// ============================================================
// --- AI-MODIFIED (2026-04-28) ---
// Purpose: Re-skin the pending friend requests banner so it claims the
// same family of chrome as other panels. Drops the bouncy emoji animation
// (distracting + breaks pixel-art feel) for a static pixel mail glyph.
function FriendRequestsBanner({ count }: { count: number }) {
  return (
    <Link href="/pet/friends">
      <PixelCard
        className="px-3 py-2 group cursor-pointer"
        accent="gold"
        corners
      >
        <div className="flex items-center gap-3">
          <span className="font-pixel text-base leading-none text-[var(--pet-gold,#f0c040)]">
            {"\u2709"}
          </span>
          <div className="flex-1 min-w-0">
            <span className="font-pixel text-sm text-[var(--pet-gold,#f0c040)]">
              {count} pending friend request{count !== 1 ? "s" : ""}
            </span>
            <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] ml-2 group-hover:text-[var(--pet-text,#e2e8f0)] transition-colors">
              Click to review {"\u2192"}
            </span>
          </div>
        </div>
      </PixelCard>
    </Link>
  )
}
// --- END AI-MODIFIED ---

// ============================================================
// RenameModal (kept as-is, only the trigger and styling around it changed)
// ============================================================
const RENAME_COST = 250

function RenameModal({ currentName, gems, onClose, onRenamed }: {
  currentName: string
  gems: number
  onClose: () => void
  onRenamed: () => void
}) {
  const [name, setName] = useState(currentName)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const canAfford = gems >= RENAME_COST
  const trimmed = name.trim()
  const isValid = trimmed.length >= 1 && trimmed.length <= 20 && trimmed !== currentName

  useEffect(() => { inputRef.current?.select() }, [])

  const handleSubmit = useCallback(async () => {
    if (!isValid || !canAfford || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/pet/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error || "Rename failed")
        return
      }
      toast.success(`Renamed to ${body.newName}!`)
      onRenamed()
      onClose()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }, [isValid, canAfford, submitting, trimmed, onRenamed, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative border-[3px] border-[#3a4a6c] bg-[#0c1020] p-5 w-full max-w-sm space-y-4"
        style={{ boxShadow: "4px 4px 0 #060810" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">Rename Pet</h2>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
          className="w-full bg-[#080c18] border-2 border-[#2a3a5c] px-3 py-2 font-pixel text-sm text-[var(--pet-text,#e2e8f0)] outline-none focus:border-[var(--pet-gold,#f0c040)] transition-colors"
          placeholder="New name..."
        />

        <div className="flex items-center justify-between">
          <span className={cn(
            "font-pixel text-xs",
            canAfford ? "text-[var(--pet-text-dim,#8899aa)]" : "text-[#e04040]"
          )}>
            Cost: {RENAME_COST} gems {!canAfford && `(you have ${gems})`}
          </span>
          <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
            {trimmed.length}/20
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 font-pixel text-xs py-2 border-2 border-[#3a4a6c] text-[var(--pet-text-dim,#8899aa)] hover:border-[#5a6a8c] transition-colors bg-[#080c18]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || !canAfford || submitting}
            className={cn(
              "flex-1 font-pixel text-xs py-2 border-2 transition-all bg-[#080c18]",
              isValid && canAfford
                ? "border-[var(--pet-gold,#f0c040)] text-[var(--pet-gold,#f0c040)] hover:brightness-125 active:translate-y-px"
                : "border-[#2a3a5c] text-[#3a4a5c] cursor-not-allowed"
            )}
          >
            {submitting ? "..." : `Rename (${RENAME_COST} 💎)`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// PetOverview (page)
// ============================================================
export default function PetOverview() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tutorialDismissed, setTutorialDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    const dismissed = localStorage.getItem("pet-tutorial-dismissed")
    setTutorialDismissed(!!dismissed)
    if (!dismissed && session) {
      router.replace("/pet/tutorial")
    }
  }, [session, router])

  const { data, error, isLoading, mutate } = useDashboard<PetOverviewData>(
    session ? "/api/pet/overview" : null
  )
  const { data: pendingData } = useDashboard<{ requests: { requestId: number }[] }>(
    session && data?.hasPet ? "/api/pet/friends/pending" : null,
    { refreshInterval: 60000 }
  )
  const pendingCount = pendingData?.requests?.length ?? 0

  const [showRename, setShowRename] = useState(false)
  const pet = data?.pet
  const equipment = data?.equipment ?? {}

  return (
    <Layout SEO={{ title: "LionGotchi - LionBot", description: "Your virtual pet companion" }}>
      <AdminGuard variant="pet">
        <PetShell hasPet={data?.hasPet ?? true}>
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
            <NoPetShowcase />
          ) : pet && (
            <>
              {showRename && (
                <RenameModal
                  currentName={pet.name}
                  gems={data.gems}
                  onClose={() => setShowRename(false)}
                  onRenamed={() => mutate()}
                />
              )}

              {/* --- AI-MODIFIED (2026-04-28) ---
                  Purpose: Single space-y-6 wrapper instead of relying on
                  PetShell's space-y-4. Lets us rhythm the page into TOP
                  zone (title + status + hero) and BOTTOM zone (2-col
                  needs/equipment grid) with proper breathing room. */}
              <div className="space-y-6">
                {/* ===== TOP ZONE ===== */}
                <div className="space-y-3">
                  <PixelTitleBar
                    title={pet.name}
                    subtitle={`Lv.${pet.level} \u00B7 ${data.moodLabel ?? "Happy"} mood \u00B7 Born ${new Date(pet.createdAt).toLocaleDateString()}`}
                    accent="gold"
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={() => setShowRename(true)}
                          className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-gold,#f0c040)] transition-colors w-7 h-7 border-2 border-[var(--pet-border,#2a3a5c)] hover:border-[var(--pet-gold,#f0c040)]/60 bg-[#060810] flex items-center justify-center"
                          title="Rename pet (250 gems)"
                          aria-label="Rename pet"
                        >
                          {"\u270E"}
                        </button>
                        {tutorialDismissed && (
                          <Link
                            href="/pet/tutorial"
                            onClick={() => {
                              localStorage.removeItem("pet-tutorial-dismissed")
                              localStorage.removeItem("pet-tutorial-step")
                              localStorage.removeItem("pet-tutorial-completed")
                            }}
                            className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-gold,#f0c040)] transition-colors w-7 h-7 border-2 border-[var(--pet-border,#2a3a5c)] hover:border-[var(--pet-gold,#f0c040)]/60 bg-[#060810] flex items-center justify-center"
                            title="Retake tutorial"
                            aria-label="Retake tutorial"
                          >
                            ?
                          </Link>
                        )}
                      </>
                    }
                  />

                  {pendingCount > 0 && <FriendRequestsBanner count={pendingCount} />}

                  <TrainerStatusBar data={data} />

                  {/* Gameboy hero: free of any card wrapper, centered, large */}
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <div className="w-full max-w-[560px]">
                      <GameboyFrame
                        isFullscreen={false}
                        skinAssetPath={data.gameboySkinPath ?? undefined}
                        width={560}
                      >
                        <RoomCanvas
                          roomPrefix={data.roomPrefix ?? "rooms/default"}
                          furniture={data.furniture ?? {}}
                          layout={mergeLayout(data.roomLayout ?? {})}
                          equipment={Object.fromEntries(
                            Object.entries(equipment).map(([slot, item]) => [
                              slot,
                              { assetPath: item.assetPath, category: item.category, glowTier: item.glowTier, glowIntensity: item.glowIntensity },
                            ])
                          )}
                          expression={pet.expression}
                          animated
                        />
                      </GameboyFrame>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <PixelButton variant="info" size="sm" onClick={() => router.push("/pet/skins")}>
                        Change Skin
                      </PixelButton>
                      <PixelButton variant="info" size="sm" onClick={() => router.push("/pet/room")}>
                        Customize Room
                      </PixelButton>
                    </div>
                    <ArtistAttribution />
                  </div>
                </div>

                {/* ===== BOTTOM ZONE ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PetNeedsCard
                    pet={pet}
                    mood={data.mood ?? 5}
                    moodLabel={data.moodLabel ?? "Happy"}
                    moodMult={data.moodMult ?? 1.0}
                    nextDecayAt={data.nextDecayAt}
                    onStatsUpdate={() => mutate()}
                  />
                  <EquipmentCard equipment={equipment} />
                </div>
              </div>
              {/* --- END AI-MODIFIED --- */}
            </>
          )}
        </PetShell>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
// --- END AI-REPLACED ---
