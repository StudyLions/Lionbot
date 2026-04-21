// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Friend profile page - full GameboyFrame pet view,
//          care interactions, gift panel, farm view with
//          watering, block/unfriend management
// ============================================================
import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout/Layout"
import PetShell from "@/components/pet/PetShell"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, dashboardMutate, invalidatePrefix } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import dynamic from "next/dynamic"

import PixelCard from "@/components/pet/ui/PixelCard"
import PixelTabBar from "@/components/pet/ui/PixelTabBar"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBar from "@/components/pet/ui/PixelBar"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: PetVisualData no longer used -- API returns flat fields
// --- END AI-MODIFIED ---
import type { FarmPlot } from "@/components/pet/farm/FarmScene"

const GameboyFrame = dynamic(() => import("@/components/pet/GameboyFrame"), { ssr: false })
const RoomCanvas = dynamic(() => import("@/components/pet/room/RoomCanvas"), { ssr: false })
const FarmScene = dynamic(() => import("@/components/pet/farm/FarmScene"), { ssr: false })

import { mergeLayout } from "@/utils/roomConstraints"
// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Import xpForLevel to compute XP progress bar max value
import { xpForLevel } from "@/utils/gameConstants"
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Match actual API shape from fetchPetVisualData -- flat fields (roomPrefix, furniture,
//          roomLayout, gameboySkinPath, equipment, farmPlots), pet.xp is string, gold is string
interface FriendProfileData {
  discordId: string
  discordName: string
  avatarHash?: string | null
  isFriend: boolean
  isBlocked?: boolean
  pet: {
    name: string
    level: number
    xp: string
    expression: string
    food: number
    bath: number
    sleep: number
    life: number
    fullscreenMode: boolean
    createdAt: string
  }
  gold: string
  gems: number
  roomPrefix: string
  furniture: Record<string, string>
  roomLayout: Record<string, any>
  gameboySkinPath: string | null
  equipment: Record<string, { name: string; category: string; rarity: string; assetPath: string; glowTier: string; glowIntensity: number }>
  farmPlots: FarmPlot[]
  todayInteractions: {
    feed: boolean
    bathe: boolean
    sleep: boolean
    waterPlots: number[]
  }
  inventory?: Array<{
    inventoryId: number
    itemId: number
    name: string
    category: string
    rarity: string
    quantity: number
  }>
}
// --- END AI-MODIFIED ---

function avatarUrl(discordId: string, hash?: string | null): string {
  if (hash) return `https://cdn.discordapp.com/avatars/${discordId}/${hash}.png?size=128`
  const idx = Number((BigInt(discordId) >> BigInt(22)) % BigInt(6))
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`
}

export default function FriendProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { userId } = router.query

  const { data, isLoading, error, mutate } = useDashboard<FriendProfileData>(
    userId ? `/api/pet/friends/${userId}` : null
  )

  const [careLoading, setCareLoading] = useState<string | null>(null)
  const [showGiftPanel, setShowGiftPanel] = useState(false)
  const [giftTab, setGiftTab] = useState<"gold" | "item">("gold")
  const [goldAmount, setGoldAmount] = useState("")
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  // --- AI-MODIFIED (2026-04-19) ---
  // Purpose: Ticket #0014 — track how many of the selected stack to gift.
  // Empty string means "send all" (default, preserves prior behavior). The
  // input only appears for items with quantity > 1.
  const [itemSendQuantity, setItemSendQuantity] = useState<string>("")
  // --- END AI-MODIFIED ---
  const [giftLoading, setGiftLoading] = useState(false)
  const [confirmUnfriend, setConfirmUnfriend] = useState(false)
  const [farmWatering, setFarmWatering] = useState(false)

  // --- AI-MODIFIED (2026-04-03) ---
  // Purpose: Match backend tax formula (Math.floor) -- was Math.ceil which showed
  //          a higher tax than actually deducted for small amounts
  const goldTax = useMemo(() => {
    const amount = parseInt(goldAmount) || 0
    return Math.floor(amount * 5 / 100)
  }, [goldAmount])
  // --- END AI-MODIFIED ---

  const wateredPlots = useMemo(
    () => new Set(data?.todayInteractions.waterPlots ?? []),
    [data?.todayInteractions.waterPlots]
  )

  const handleCare = useCallback(async (type: "FEED" | "BATHE" | "SLEEP") => {
    if (!userId || careLoading) return
    setCareLoading(type)
    try {
      await dashboardMutate("POST", "/api/pet/friends/interact", {
        targetUserId: userId,
        type,
      })
      const labels = { FEED: "Fed!", BATHE: "Cleaned!", SLEEP: "Rested!" }
      toast.success(labels[type])
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed")
    } finally {
      setCareLoading(null)
    }
  }, [userId, careLoading, mutate])

  const handleSendGold = useCallback(async () => {
    const amount = parseInt(goldAmount)
    if (!amount || amount <= 0 || !userId) return
    setGiftLoading(true)
    try {
      // --- AI-MODIFIED (2026-03-24) ---
      // Purpose: API expects uppercase "GOLD" not lowercase "gold"
      await dashboardMutate("POST", "/api/pet/friends/gift", {
        targetUserId: userId,
        type: "GOLD",
        amount,
      })
      // --- END AI-MODIFIED ---
      toast.success(`Sent ${amount}G to ${data?.pet.name}!`)
      setGoldAmount("")
      setShowGiftPanel(false)
      mutate()
      invalidatePrefix("/api/pet/overview")
    } catch (err: any) {
      toast.error(err.message || "Failed to send gold")
    } finally {
      setGiftLoading(false)
    }
  }, [goldAmount, userId, data?.pet.name, mutate])

  // --- AI-MODIFIED (2026-04-10) ---
  // Purpose: Use == null to guard against both null and undefined selectedItem
  const handleSendItem = useCallback(async () => {
    if (selectedItem == null || !userId) return
    setGiftLoading(true)
    try {
      // --- AI-MODIFIED (2026-04-19) ---
      // Purpose: Ticket #0014 — pass `quantity` so users can send a partial
      // stack instead of always shipping the whole thing. Empty string or
      // missing quantity sends the full stack (preserves prior behavior).
      const qtyRaw = itemSendQuantity.trim()
      const parsedQty = qtyRaw === "" ? null : parseInt(qtyRaw, 10)
      const selected = data?.inventory?.find((i) => i.inventoryId === selectedItem)
      const stackSize = selected?.quantity ?? 1
      if (parsedQty !== null) {
        if (Number.isNaN(parsedQty) || parsedQty < 1) {
          toast.error("Quantity must be a positive number")
          setGiftLoading(false)
          return
        }
        if (parsedQty > stackSize) {
          toast.error(`You only have ${stackSize} of this item`)
          setGiftLoading(false)
          return
        }
      }
      await dashboardMutate("POST", "/api/pet/friends/gift", {
        targetUserId: userId,
        type: "ITEM",
        inventoryId: selectedItem,
        ...(parsedQty !== null ? { quantity: parsedQty } : {}),
      })
      // --- END AI-MODIFIED ---
      toast.success("Item sent!")
      setSelectedItem(null)
      setItemSendQuantity("")
      setShowGiftPanel(false)
      mutate()
      invalidatePrefix("/api/pet/inventory")
    } catch (err: any) {
      toast.error(err.message || "Failed to send item")
    } finally {
      setGiftLoading(false)
    }
  }, [selectedItem, itemSendQuantity, userId, data?.inventory, mutate])
  // --- END AI-MODIFIED ---

  const handleWaterPlot = useCallback(async (plotId: number) => {
    if (!userId) return
    setFarmWatering(true)
    try {
      await dashboardMutate("POST", "/api/pet/friends/interact", {
        targetUserId: userId,
        type: "WATER",
        plotId,
      })
      toast.success("Watered!")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed")
    } finally {
      setFarmWatering(false)
    }
  }, [userId, mutate])

  const handleWaterAll = useCallback(async () => {
    if (!userId) return
    setFarmWatering(true)
    try {
      await dashboardMutate("POST", "/api/pet/friends/interact", {
        targetUserId: userId,
        type: "WATER_ALL",
      })
      toast.success("Watered all plots!")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed")
    } finally {
      setFarmWatering(false)
    }
  }, [userId, mutate])

  const handleUnfriend = useCallback(async () => {
    if (!userId) return
    try {
      await dashboardMutate("POST", "/api/pet/friends/remove", { targetUserId: userId })
      toast.success("Unfriended")
      invalidatePrefix("/api/pet/friends")
      router.push("/pet/friends")
    } catch (err: any) {
      toast.error(err.message || "Failed")
    }
  }, [userId, router])

  const handleBlock = useCallback(async () => {
    if (!userId) return
    try {
      await dashboardMutate("POST", "/api/pet/friends/block", {
        targetUserId: userId,
        action: "block",
      })
      toast.success("User blocked")
      invalidatePrefix("/api/pet/friends")
      router.push("/pet/friends")
    } catch (err: any) {
      toast.error(err.message || "Failed")
    }
  }, [userId, router])

  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: request API expects { query } not { targetUserId }
  const handleAddFriend = useCallback(async () => {
    if (!userId) return
    try {
      await dashboardMutate("POST", "/api/pet/friends/request", { query: userId as string })
      toast.success("Friend request sent!")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed")
    }
  }, [userId, mutate])
  // --- END AI-MODIFIED ---

  const pet = data?.pet
  const isFriend = data?.isFriend ?? false
  const interactions = data?.todayInteractions

  return (
    <Layout SEO={{ title: pet ? `${pet.name} - LionGotchi` : "Friend - LionGotchi", description: "View a friend's LionGotchi" }}>
      <AdminGuard variant="pet">
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to PetShell for consistent layout */}
        {/* --- Original code (commented out for rollback) ---
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
        --- End original code --- */}
        <PetShell>
        {/* --- END AI-REPLACED --- */}

              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-[500px]" />
                    <Skeleton className="h-[400px]" />
                  </div>
                </div>
              ) : error ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">
                    {(error as Error).message}
                  </p>
                </PixelCard>
              ) : data && pet ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarUrl(data.discordId, data.avatarHash)}
                        alt=""
                        className="w-12 h-12 rounded-full border-2 border-[#2a3a5c] flex-shrink-0"
                      />
                      <div>
                        <h1 className="font-pixel text-xl text-[var(--pet-text,#e2e8f0)]">
                          {pet.name}
                        </h1>
                        <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                          {data.discordName} · Lv.{pet.level}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFriend ? (
                        <>
                          {confirmUnfriend ? (
                            <div className="flex items-center gap-2">
                              <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
                                Are you sure?
                              </span>
                              <PixelButton variant="danger" size="sm" onClick={handleUnfriend}>
                                Yes, Unfriend
                              </PixelButton>
                              <PixelButton variant="ghost" size="sm" onClick={() => setConfirmUnfriend(false)}>
                                Cancel
                              </PixelButton>
                            </div>
                          ) : (
                            <PixelButton variant="ghost" size="sm" onClick={() => setConfirmUnfriend(true)}>
                              Unfriend
                            </PixelButton>
                          )}
                          <PixelButton variant="ghost" size="sm" onClick={handleBlock}>
                            Block
                          </PixelButton>
                        </>
                      ) : (
                        <>
                          <PixelButton variant="primary" size="sm" onClick={handleAddFriend}>
                            Add Friend
                          </PixelButton>
                          <PixelButton variant="ghost" size="sm" onClick={handleBlock}>
                            Block
                          </PixelButton>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--pet-border,#2a3a5c)] to-transparent" />

                  {/* Two-column layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Left Column - Pet View */}
                    <div className="space-y-4">
                      {/* GameboyFrame + RoomCanvas */}
                      <PixelCard className="p-4 space-y-3" corners>
                        <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a2a3c]">
                          <span className="font-pixel text-[14px]">🏠</span>
                          <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
                            {pet.name}&apos;s Room
                          </span>
                        </div>
                        {/* --- AI-REPLACED (2026-04-21) --- */}
                        {/* Reason: window.innerWidth was read once at render and never updated
                                    on resize. RoomCanvas size was tied to that stale width. */}
                        {/* What the new code does better: container max-width drives sizing,
                                    fluid RoomCanvas fills its parent automatically. */}
                        <div className="flex justify-center w-full">
                          <div className="w-full max-w-[400px]">
                            <GameboyFrame
                              isFullscreen={false}
                              skinAssetPath={data.gameboySkinPath ?? undefined}
                              width={400}
                            >
                              <RoomCanvas
                                roomPrefix={data.roomPrefix}
                                furniture={data.furniture}
                                layout={mergeLayout(data.roomLayout as any)}
                                equipment={data.equipment}
                                expression={pet.expression}
                                animated
                              />
                            </GameboyFrame>
                          </div>
                        </div>
                        {/* --- END AI-REPLACED --- */}
                      </PixelCard>

                      {/* Pet Info Card */}
                      <PixelCard className="p-4 space-y-3" corners>
                        <div className="flex items-center justify-between pb-2 border-b-2 border-[#1a2a3c]">
                          <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">Pet Info</span>
                          <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
                            Created {new Date(pet.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">Level</span>
                            <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">{pet.level}</span>
                          </div>
                          {/* --- AI-MODIFIED (2026-03-23) --- */}
                          {/* Purpose: Compute xpToNext from polynomial curve instead of missing API field */}
                          {/* --- AI-MODIFIED (2026-03-24) --- */}
                          {/* Purpose: pet.xp is string from API, parse to number */}
                          <PixelBar value={parseInt(pet.xp as any) || 0} max={xpForLevel(pet.level)} label="XP" color="gold" />
                          {/* --- END AI-MODIFIED --- */}
                          {/* --- END AI-MODIFIED --- */}
                        </div>

                        {/* --- AI-MODIFIED (2026-03-24) --- */}
                        {/* Purpose: gold is a string from API, parse to number */}
                        <div className="flex items-center gap-4 pt-1">
                          <GoldDisplay amount={parseInt(data.gold) || 0} size="md" />
                          <div className="w-px h-5 bg-[#2a3a5c]" />
                          <GoldDisplay amount={data.gems} size="md" type="gem" />
                        </div>
                        {/* --- END AI-MODIFIED --- */}

                        <div className="space-y-2 pt-1">
                          <PixelBar value={pet.food} max={8} label="Hunger" color="gold" />
                          <PixelBar value={pet.bath} max={8} label="Clean" color="blue" />
                          <PixelBar value={pet.sleep} max={8} label="Energy" color="blue" />
                        </div>
                      </PixelCard>

                      {/* Care Buttons (friends only) */}
                      {isFriend && interactions && (
                        <PixelCard className="p-4 space-y-3" corners>
                          <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a2a3c]">
                            <span className="font-pixel text-[14px]">💝</span>
                            <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
                              Care for {pet.name}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {([
                              { type: "FEED" as const, label: "Feed", emoji: "🍖", stat: pet.food, done: interactions.feed, color: "#f0c040" },
                              { type: "BATHE" as const, label: "Bathe", emoji: "🧼", stat: pet.bath, done: interactions.bathe, color: "#4080f0" },
                              { type: "SLEEP" as const, label: "Rest", emoji: "💤", stat: pet.sleep, done: interactions.sleep, color: "#8060c0" },
                            ]).map(({ type, label, emoji, stat, done, color }) => (
                              <button
                                key={type}
                                onClick={() => handleCare(type)}
                                disabled={done || careLoading !== null}
                                className={cn(
                                  "font-pixel text-xs py-3 border-2 transition-all flex flex-col items-center gap-1",
                                  "hover:brightness-125 active:translate-y-px disabled:opacity-50",
                                  "bg-[#0c1020]"
                                )}
                                style={{ borderColor: color, color }}
                              >
                                {careLoading === type ? (
                                  <span>...</span>
                                ) : done ? (
                                  <span className="text-[10px]">Done today</span>
                                ) : (
                                  <>
                                    <span>{emoji} {label}</span>
                                    <span className="text-[10px] opacity-70">{stat}/8</span>
                                  </>
                                )}
                              </button>
                            ))}
                          </div>
                        </PixelCard>
                      )}

                      {/* Gift Panel (friends only) */}
                      {isFriend && (
                        <PixelCard className="p-4 space-y-3" corners>
                          <div className="flex items-center justify-between pb-2 border-b-2 border-[#1a2a3c]">
                            <div className="flex items-center gap-2">
                              <span className="font-pixel text-[14px]">🎁</span>
                              <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
                                Send Gift
                              </span>
                            </div>
                            {!showGiftPanel && (
                              <PixelButton variant="gold" size="sm" onClick={() => setShowGiftPanel(true)}>
                                Open
                              </PixelButton>
                            )}
                          </div>

                          {showGiftPanel && (
                            <>
                              {/* --- AI-REPLACED (2026-03-24) --- */}
                              {/* Reason: Migrated gift tab toggle to shared PixelTabBar component */}
                              {/* --- Original code (commented out for rollback) ---
                              <div className="flex gap-1.5">
                                <button onClick={() => setGiftTab("gold")}
                                  className={cn("font-pixel text-[12px] px-3 py-1.5 border-2 transition-all",
                                    giftTab === "gold" ? "border-[var(--pet-gold,#f0c040)] bg-[var(--pet-gold,#f0c040)]/15 text-[var(--pet-gold,#f0c040)]"
                                      : "border-[var(--pet-border,#2a3a5c)] text-[#8899aa] hover:text-[#c0d0e0]")}>Gold</button>
                                <button onClick={() => setGiftTab("item")}
                                  className={cn("font-pixel text-[12px] px-3 py-1.5 border-2 transition-all",
                                    giftTab === "item" ? "border-[var(--pet-blue,#4080f0)] bg-[var(--pet-blue,#4080f0)]/15 text-[var(--pet-blue,#4080f0)]"
                                      : "border-[var(--pet-border,#2a3a5c)] text-[#8899aa] hover:text-[#c0d0e0]")}>Item</button>
                              </div>
                              --- End original code --- */}
                              <PixelTabBar
                                tabs={[{ key: "gold", label: "Gold" }, { key: "item", label: "Item" }]}
                                active={giftTab}
                                onChange={(k) => setGiftTab(k as "gold" | "item")}
                              />

                              {giftTab === "gold" ? (
                                <div className="space-y-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={goldAmount}
                                    onChange={(e) => setGoldAmount(e.target.value)}
                                    placeholder="Amount..."
                                    className={cn(
                                      "w-full font-pixel text-[13px] px-3 py-2",
                                      "bg-[#080c18] border-2 border-[#2a3a5c] text-[var(--pet-text,#e2e8f0)]",
                                      "placeholder:text-[#3a4a5c] focus:outline-none focus:border-[var(--pet-gold,#f0c040)]"
                                    )}
                                  />
                                  {parseInt(goldAmount) > 0 && (
                                    <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
                                      5% tax: {goldTax}G · They receive: {(parseInt(goldAmount) || 0) - goldTax}G
                                    </p>
                                  )}
                                  <PixelButton
                                    variant="gold"
                                    size="sm"
                                    onClick={handleSendGold}
                                    loading={giftLoading}
                                    disabled={!parseInt(goldAmount) || parseInt(goldAmount) <= 0}
                                    className="w-full"
                                  >
                                    Send Gold
                                  </PixelButton>
                                </div>
                              ) : (
                                // --- AI-MODIFIED (2026-04-10) ---
                                // Purpose: Fix mobile UX -- add checkmark for selected items, clearer
                                //          disabled state text, and touch-action for reliable mobile taps
                                <div className="space-y-2">
                                  {data.inventory && data.inventory.length > 0 ? (
                                    <>
                                      <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
                                        Tap an item to select it:
                                      </p>
                                      <div className="max-h-48 overflow-y-auto space-y-1" style={{ touchAction: "pan-y" }}>
                                        {data.inventory.map((item) => {
                                          const isSelected = selectedItem === item.inventoryId
                                          return (
                                            <button
                                              key={item.inventoryId}
                                              // --- AI-MODIFIED (2026-04-19) ---
                                              // Purpose: Ticket #0014 — reset the quantity input
                                              // when the user picks a different item so the previous
                                              // value doesn't carry over.
                                              onClick={() => {
                                                setSelectedItem(item.inventoryId)
                                                setItemSendQuantity("")
                                              }}
                                              // --- END AI-MODIFIED ---
                                              style={{ touchAction: "manipulation" }}
                                              className={cn(
                                                "w-full flex items-center gap-2 px-3 py-2 border-2 text-left transition-all",
                                                isSelected
                                                  ? "border-[var(--pet-blue,#4080f0)] bg-[var(--pet-blue,#4080f0)]/15 ring-1 ring-[var(--pet-blue,#4080f0)]"
                                                  : "border-[#1a2a3c] bg-[#080c18] hover:border-[#3a4a5c]"
                                              )}
                                            >
                                              <div className={cn(
                                                "w-5 h-5 flex-shrink-0 flex items-center justify-center border-2 transition-all",
                                                isSelected
                                                  ? "border-[var(--pet-blue,#4080f0)] bg-[var(--pet-blue,#4080f0)]/30 text-[var(--pet-blue,#4080f0)]"
                                                  : "border-[#2a3a5c] bg-transparent"
                                              )}>
                                                {isSelected && <span className="text-[10px]">✓</span>}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] truncate">
                                                  {item.name}
                                                </p>
                                                <p className="font-pixel text-[10px] text-[#4a5a6a]">
                                                  {item.category} · x{item.quantity}
                                                </p>
                                              </div>
                                            </button>
                                          )
                                        })}
                                      </div>
                                    </>
                                  ) : (
                                    <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] text-center py-3">
                                      No items to send
                                    </p>
                                  )}
                                  {/* --- AI-MODIFIED (2026-04-19) --- */}
                                  {/* Purpose: Ticket #0014 — quantity selector. Only renders for
                                      stacks > 1 since single items always send 1. Empty input means
                                      "send the whole stack" (default), matching the API's behavior. */}
                                  {(() => {
                                    if (selectedItem == null) return null
                                    const sel = data.inventory?.find((i) => i.inventoryId === selectedItem)
                                    if (!sel || sel.quantity <= 1) return null
                                    const parsed = itemSendQuantity.trim() === ""
                                      ? sel.quantity
                                      : parseInt(itemSendQuantity, 10)
                                    const isInvalid = !Number.isNaN(parsed) && (parsed < 1 || parsed > sel.quantity)
                                    return (
                                      <div className="space-y-1 pt-1">
                                        <div className="flex items-center justify-between gap-2">
                                          <label className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
                                            How many to send?
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => setItemSendQuantity(String(sel.quantity))}
                                            className="font-pixel text-[10px] text-[var(--pet-blue,#4080f0)] hover:underline"
                                          >
                                            All ({sel.quantity})
                                          </button>
                                        </div>
                                        <input
                                          type="number"
                                          inputMode="numeric"
                                          min={1}
                                          max={sel.quantity}
                                          step={1}
                                          value={itemSendQuantity}
                                          onChange={(e) => setItemSendQuantity(e.target.value)}
                                          placeholder={`Default: all ${sel.quantity}`}
                                          className={cn(
                                            "w-full px-3 py-2 bg-[#080c18] border-2 font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)]",
                                            "focus:outline-none focus:border-[var(--pet-blue,#4080f0)]",
                                            isInvalid
                                              ? "border-[var(--pet-red,#f04040)]"
                                              : "border-[#1a2a3c] hover:border-[#3a4a5c]",
                                          )}
                                        />
                                        {isInvalid && (
                                          <p className="font-pixel text-[10px] text-[var(--pet-red,#f04040)]">
                                            Must be between 1 and {sel.quantity}
                                          </p>
                                        )}
                                      </div>
                                    )
                                  })()}
                                  {/* --- END AI-MODIFIED --- */}
                                  <PixelButton
                                    variant="info"
                                    size="sm"
                                    onClick={handleSendItem}
                                    loading={giftLoading}
                                    disabled={selectedItem == null}
                                    className="w-full"
                                  >
                                    {/* --- AI-MODIFIED (2026-04-19) --- */}
                                    {/* Ticket #0014 — surface partial-send count in the button label. */}
                                    {selectedItem == null
                                      ? "Select an item first"
                                      : (() => {
                                          const sel = data.inventory?.find((i) => i.inventoryId === selectedItem)
                                          const stackSize = sel?.quantity ?? 1
                                          const qtyTrim = itemSendQuantity.trim()
                                          const parsedQty = qtyTrim === "" ? stackSize : parseInt(qtyTrim, 10)
                                          if (Number.isNaN(parsedQty) || parsedQty < 1 || parsedQty > stackSize) {
                                            return "Send Item"
                                          }
                                          return parsedQty < stackSize
                                            ? `Send ${parsedQty} of ${stackSize}`
                                            : stackSize > 1 ? `Send all ${stackSize}` : "Send Item"
                                        })()}
                                    {/* --- END AI-MODIFIED --- */}
                                  </PixelButton>
                                </div>
                                /* --- END AI-MODIFIED --- */
                              )}

                              <button
                                onClick={() => { setShowGiftPanel(false); setSelectedItem(null); setItemSendQuantity(""); setGoldAmount("") }}
                                className="font-pixel text-[11px] text-[#4a5a6a] hover:text-[#8899aa] transition-colors"
                              >
                                Close
                              </button>
                            </>
                          )}
                        </PixelCard>
                      )}

                      {/* Add Friend (non-friends) */}
                      {/* --- AI-MODIFIED (2026-03-24) --- */}
                      {/* Purpose: isBlocked is optional in API response */}
                      {!isFriend && !data.isBlocked && (
                        <PixelCard className="p-4 text-center space-y-3" corners>
                          <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                            Add as a friend to care for their pet and water their farm
                          </p>
                          <PixelButton variant="primary" onClick={handleAddFriend}>
                            Add Friend
                          </PixelButton>
                        </PixelCard>
                      )}
                    </div>

                    {/* Right Column - Farm View */}
                    <div className="space-y-4">
                      <PixelCard className="p-4 space-y-3" corners>
                        <div className="flex items-center justify-between pb-2 border-b-2 border-[#1a2a3c]">
                          <div className="flex items-center gap-2">
                            <span className="font-pixel text-[14px]">🌿</span>
                            <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
                              {pet.name}&apos;s Farm
                            </span>
                          </div>
                          {/* --- AI-MODIFIED (2026-03-24) --- */}
                          {/* Purpose: API returns farmPlots at top level, not farm.plots */}
                          {isFriend && data.farmPlots.some((p: any) => !p.empty && !p.dead) && (
                            <PixelButton
                              variant="info"
                              size="sm"
                              onClick={handleWaterAll}
                              loading={farmWatering}
                            >
                              Water All
                            </PixelButton>
                          )}
                        </div>

                        {/* --- AI-MODIFIED (2026-03-24) --- */}
                        {/* Purpose: Use farmPlots and flat gameboySkinPath */}
                        {/* --- AI-MODIFIED (2026-04-21) --- */}
                        {/* Purpose: Responsive container instead of stale window.innerWidth read. */}
                        {data.farmPlots.length > 0 ? (
                          <div className="flex justify-center w-full">
                            <div className="w-full max-w-[400px]">
                              <GameboyFrame
                                isFullscreen={false}
                                skinAssetPath={data.gameboySkinPath ?? undefined}
                                width={400}
                              >
                                <FarmScene
                                  plots={data.farmPlots}
                                  selectedPlot={null}
                                  onSelectPlot={(plotId) => {
                                    if (isFriend && !wateredPlots.has(plotId)) {
                                      handleWaterPlot(plotId)
                                    }
                                  }}
                                />
                              </GameboyFrame>
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                              No farm plots yet
                            </p>
                          </div>
                        )}
                        {/* --- END AI-MODIFIED (2026-04-21) --- */}

                        {/* --- END AI-MODIFIED --- */}
                        {isFriend && data.farmPlots.length > 0 && (
                          <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] text-center">
                            Click a plot to water it
                          </p>
                        )}
                      </PixelCard>
                    </div>
                  </div>
                </>
              ) : null}

        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Original closing: </div></div></div> */}
        </PetShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
