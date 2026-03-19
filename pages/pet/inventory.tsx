// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet inventory page - pixel art RPG style
// ============================================================
// --- AI-REPLACED (2026-03-19) ---
// Reason: Full redesign with lion preview, equipment slots, equip/unequip,
//         MapleStory-style tooltips, and bonus summary
// What the new code does better: Two-column layout with live lion preview,
//         clickable equip/unequip, rich item tooltips with scroll trace,
//         and total bonus stats summary
// --- Original code (commented out for rollback) ---
// (see git history for the original flat-list inventory page)
// --- End original code ---
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { useState, useCallback } from "react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { GAME_CONSTANTS, GLOW_LABELS, GLOW_TEXT_COLORS, type GlowTier } from "@/utils/gameConstants"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import ItemTooltip, { type InventoryItem } from "@/components/pet/inventory/ItemTooltip"
import RoomCanvas from "@/components/pet/room/RoomCanvas"
import GameboyFrame from "@/components/pet/GameboyFrame"
import { mergeLayout } from "@/utils/roomConstraints"
import { toast } from "sonner"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface InventoryData {
  items: InventoryItem[]
  counts: { equipment: number; scrolls: number }
}

interface OverviewData {
  hasPet: boolean
  pet: {
    name: string
    expression: string
    level: number
  } | null
  equipment: Record<string, {
    name: string; category: string; rarity: string; assetPath: string
    glowTier?: string; glowIntensity?: number
  }>
  roomPrefix?: string
  furniture?: Record<string, string>
  roomLayout?: any
  gameboySkinPath?: string | null
}

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

const GLOW_BORDER: Record<GlowTier, string> = {
  none: "", bronze: "#cd7f32", silver: "#c0d2f0",
  gold: "#ffd700", diamond: "#64c8ff", celestial: "#c864ff",
}

type FilterTab = "equipment" | "scrolls"

const TABS: { key: FilterTab; label: string }[] = [
  { key: "equipment", label: "Equipment" },
  { key: "scrolls", label: "Scrolls" },
]

const EQUIP_SLOTS = ["HEAD", "FACE", "BODY", "BACK", "FEET"] as const
const SLOT_ICONS: Record<string, string> = {
  HEAD: "\u{1F452}", FACE: "\u{1F453}", BODY: "\u{1F455}",
  BACK: "\u{1FABD}", FEET: "\u{1F462}",
}

export default function InventoryPage() {
  const { data: session } = useSession()
  const [filter, setFilter] = useState<FilterTab>("equipment")
  const [equipping, setEquipping] = useState<number | null>(null)

  const { data: invData, error: invError, isLoading: invLoading, mutate: mutateInv } =
    useDashboard<InventoryData>(session ? `/api/pet/inventory?filter=${filter}` : null)

  const { data: overview, isLoading: overviewLoading, mutate: mutateOverview } =
    useDashboard<OverviewData>(session ? "/api/pet/overview" : null)

  const handleEquip = useCallback(async (inventoryId: number, action: "equip" | "unequip") => {
    if (equipping) return
    setEquipping(inventoryId)
    try {
      const res = await fetch("/api/pet/inventory/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId, action }),
      })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error || "Failed")
        return
      }
      toast.success(action === "equip" ? "Equipped!" : "Unequipped!")
      mutateInv()
      mutateOverview()
      invalidate("/api/pet/inventory?filter=equipment")
      invalidate("/api/pet/inventory?filter=scrolls")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setEquipping(null)
    }
  }, [equipping, mutateInv, mutateOverview])

  const handleUnequipSlot = useCallback(async (slot: string) => {
    if (equipping) return
    setEquipping(-1)
    try {
      const res = await fetch("/api/pet/inventory/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, action: "unequip" }),
      })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error || "Failed")
        return
      }
      toast.success("Unequipped!")
      mutateInv()
      mutateOverview()
      invalidate("/api/pet/inventory?filter=equipment")
      invalidate("/api/pet/inventory?filter=scrolls")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setEquipping(null)
    }
  }, [equipping, mutateInv, mutateOverview])

  const equipment = overview?.equipment ?? {}
  const pet = overview?.pet

  return (
    <Layout SEO={{ title: "Inventory - LionGotchi", description: "Your pet inventory" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
              {/* Title */}
              <div>
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Inventory</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  Manage your equipment, view stats, and change gear
                </p>
              </div>

              {/* Two-column layout */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left Column: Lion Preview + Equipment Slots */}
                <div className="w-full lg:w-[340px] lg:flex-shrink-0 space-y-3">
                  {/* Lion Preview */}
                  <PixelCard className="p-3" corners>
                    <div className="flex items-center gap-2 pb-2 mb-2 border-b-2 border-[#1a2a3c]">
                      <span className="font-pixel text-[14px]">{"\u{1F981}"}</span>
                      <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">
                        {pet?.name ?? "Your Pet"}
                      </span>
                      {pet && (
                        <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] ml-auto">
                          Lv.{pet.level}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-center overflow-hidden">
                      {overviewLoading ? (
                        <Skeleton className="w-[280px] h-[280px]" />
                      ) : overview?.hasPet ? (
                        <GameboyFrame
                          isFullscreen={false}
                          skinAssetPath={overview.gameboySkinPath ?? undefined}
                          width={310}
                        >
                          <RoomCanvas
                            roomPrefix={overview.roomPrefix ?? "rooms/default"}
                            furniture={overview.furniture ?? {}}
                            layout={mergeLayout(overview.roomLayout ?? {})}
                            equipment={Object.fromEntries(
                              Object.entries(equipment).map(([slot, item]) => [
                                slot,
                                { assetPath: item.assetPath, category: item.category, glowTier: item.glowTier, glowIntensity: item.glowIntensity },
                              ])
                            )}
                            expression={pet?.expression ?? "default"}
                            size={238}
                            animated
                          />
                        </GameboyFrame>
                      ) : (
                        <div className="w-[280px] h-[200px] flex items-center justify-center">
                          <span className="font-pixel text-sm text-[var(--pet-text-dim)]">No pet yet</span>
                        </div>
                      )}
                    </div>
                  </PixelCard>

                  {/* Equipment Slots */}
                  <PixelCard className="p-3" corners>
                    <div className="flex items-center gap-2 pb-2 mb-2 border-b-2 border-[#1a2a3c]">
                      <span className="font-pixel text-[14px]">{"\u2694\uFE0F"}</span>
                      <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Equipped</span>
                    </div>
                    <div className="space-y-1.5">
                      {EQUIP_SLOTS.map((slot) => {
                        const item = equipment[slot]
                        const bc = item ? (RARITY_BORDER[item.rarity] || "#3a4a6c") : "#1a2a3c"
                        const imgUrl = item ? getItemImageUrl(item.assetPath, item.category) : null
                        return (
                          <div
                            key={slot}
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 border-2 bg-[#080c18] transition-colors",
                              item && "cursor-pointer hover:bg-[#0f1628]"
                            )}
                            style={{ borderColor: bc, boxShadow: "1px 1px 0 #060810" }}
                            onClick={() => item && handleUnequipSlot(slot)}
                            title={item ? "Click to unequip" : undefined}
                          >
                            <div className="w-8 h-8 border border-[#1a2a3c] bg-[#0a0e1a] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {imgUrl ? (
                                <CroppedItemImage src={imgUrl} alt={item?.name ?? ""} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-xs opacity-40">{SLOT_ICONS[slot]}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] uppercase">{slot}</p>
                              {item ? (
                                <p className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate">{item.name}</p>
                              ) : (
                                <p className="font-pixel text-[10px] text-[#3a4a5c]">Empty</p>
                              )}
                            </div>
                            {item && (
                              <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] flex-shrink-0 opacity-0 group-hover:opacity-100">
                                {"\u2716"}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </PixelCard>

                  {/* Bonus Summary */}
                  <BonusSummary filter={filter} items={invData?.items} />
                </div>

                {/* Right Column: Inventory Grid */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Tabs */}
                  <div className="flex gap-2">
                    {TABS.map((tab) => (
                      <PixelButton
                        key={tab.key}
                        variant={filter === tab.key ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => setFilter(tab.key)}
                      >
                        {tab.label}
                        {invData?.counts && (
                          <span className="opacity-60 ml-1">({invData.counts[tab.key]})</span>
                        )}
                      </PixelButton>
                    ))}
                  </div>

                  {/* Items Grid */}
                  {invLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-[140px]" />
                      ))}
                    </div>
                  ) : invError ? (
                    <PixelCard className="p-8 text-center" corners>
                      <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">
                        {(invError as Error).message}
                      </p>
                    </PixelCard>
                  ) : !invData?.items.length ? (
                    <PixelCard className="p-12 text-center" corners>
                      <p className="font-pixel text-base text-[var(--pet-text-dim,#8899aa)]">
                        No {filter} found. Earn items from Discord activity!
                      </p>
                    </PixelCard>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                      {invData.items.map((inv) => (
                        <InventoryItemCard
                          key={inv.inventoryId}
                          inv={inv}
                          equipping={equipping}
                          onEquip={handleEquip}
                          isEquipmentTab={filter === "equipment"}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

function InventoryItemCard({
  inv,
  equipping,
  onEquip,
  isEquipmentTab,
}: {
  inv: InventoryItem
  equipping: number | null
  onEquip: (id: number, action: "equip" | "unequip") => void
  isEquipmentTab: boolean
}) {
  const bc = RARITY_BORDER[inv.item.rarity] || "#3a4a6c"
  const glowBc = inv.glowTier !== "none" ? GLOW_BORDER[inv.glowTier] : null
  const effectiveBorder = glowBc || bc
  const imgUrl = getItemImageUrl(inv.item.assetPath, inv.item.category)
  const isEquipping = equipping === inv.inventoryId

  return (
    <ItemTooltip inv={inv}>
      <div
        className="flex flex-col border-2 bg-[#0c1020] transition-all hover:bg-[#101830] group"
        style={{
          borderColor: `${effectiveBorder}80`,
          boxShadow: `2px 2px 0 #060810${inv.glowTier !== "none" ? `, 0 0 8px ${effectiveBorder}30` : ""}`,
        }}
      >
        {/* Item Image */}
        <div className="relative flex items-center justify-center h-[72px] bg-[#080c18] border-b border-[#1a2a3c]">
          {imgUrl ? (
            <CroppedItemImage
              src={imgUrl}
              alt={inv.item.name}
              className="w-14 h-14 object-contain"
            />
          ) : (
            <span className="text-2xl">{getCategoryPlaceholder(inv.item.category)}</span>
          )}
          {inv.quantity > 1 && (
            <span className="absolute bottom-1 right-1 font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] bg-[#0a0e1a]/80 px-1">
              x{inv.quantity}
            </span>
          )}
          {inv.equipped && (
            <span className="absolute top-1 right-1 font-pixel text-[8px] px-1 py-0.5 border border-[var(--pet-green,#40d870)] text-[var(--pet-green,#40d870)] bg-[#1a3020]/90">
              EQP
            </span>
          )}
        </div>

        {/* Item Info */}
        <div className="px-2 py-1.5 flex-1 min-h-0">
          <div className="flex items-center gap-1">
            <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate">
              {inv.item.name}
            </span>
            {inv.enhancementLevel > 0 && (
              <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)] flex-shrink-0">
                +{inv.enhancementLevel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            <PixelBadge rarity={inv.item.rarity} className="text-[8px] px-1 py-0" />
            {inv.glowTier !== "none" && (
              <span className={cn("font-pixel text-[8px]", GLOW_TEXT_COLORS[inv.glowTier])}>
                {GLOW_LABELS[inv.glowTier]}
              </span>
            )}
          </div>
          {inv.totalBonus > 0 && (
            <div className="mt-0.5">
              <span className="font-pixel text-[8px] text-[var(--pet-gold,#f0c040)]">
                +{(inv.totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100).toFixed(1)}% gold
              </span>
            </div>
          )}
        </div>

        {/* Equip/Unequip Button */}
        {isEquipmentTab && inv.item.slot && (
          <div className="px-2 pb-1.5">
            <button
              className={cn(
                "w-full font-pixel text-[9px] py-1 border transition-all",
                "hover:brightness-125 active:translate-y-px disabled:opacity-40",
                inv.equipped
                  ? "border-[var(--pet-red,#e04040)] text-[var(--pet-red,#e04040)] bg-[#e04040]/5 hover:bg-[#e04040]/10"
                  : "border-[var(--pet-green,#40d870)] text-[var(--pet-green,#40d870)] bg-[#40d870]/5 hover:bg-[#40d870]/10"
              )}
              onClick={(e) => {
                e.stopPropagation()
                onEquip(inv.inventoryId, inv.equipped ? "unequip" : "equip")
              }}
              disabled={isEquipping}
            >
              {isEquipping ? "..." : inv.equipped ? "Unequip" : `Equip \u2192 ${inv.item.slot}`}
            </button>
          </div>
        )}
      </div>
    </ItemTooltip>
  )
}

function BonusSummary({ filter, items }: { filter: FilterTab; items?: InventoryItem[] }) {
  const equippedItems = items?.filter((i) => i.equipped) ?? []
  const totalBonus = equippedItems.reduce((sum, i) => sum + i.totalBonus, 0)

  if (filter !== "equipment" || equippedItems.length === 0) return null

  const goldMult = totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100
  const xpMult = totalBonus * GAME_CONSTANTS.ENHANCEMENT_XP_BONUS * 100
  const dropRate = totalBonus * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100

  const bestGlow = equippedItems.reduce<GlowTier>((best, item) => {
    const tiers: GlowTier[] = ["none", "bronze", "silver", "gold", "diamond", "celestial"]
    const currentIdx = tiers.indexOf(item.glowTier)
    const bestIdx = tiers.indexOf(best)
    return currentIdx > bestIdx ? item.glowTier : best
  }, "none")

  return (
    <PixelCard className="p-3" corners>
      <div className="flex items-center gap-2 pb-2 mb-2 border-b-2 border-[#1a2a3c]">
        <span className="font-pixel text-[14px]">{"\u2728"}</span>
        <span className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">Equipment Bonuses</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Gold Bonus</span>
          <span className="font-pixel text-[11px] text-[var(--pet-gold,#f0c040)]">+{goldMult.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">XP Bonus</span>
          <span className="font-pixel text-[11px] text-[#40d870]">+{xpMult.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Drop Rate</span>
          <span className="font-pixel text-[11px] text-[#4080f0]">+{dropRate.toFixed(2)}%</span>
        </div>
        {bestGlow !== "none" && (
          <div className="flex justify-between items-center pt-1 border-t border-[#1a2a3c]/50">
            <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Best Glow</span>
            <span className={cn("font-pixel text-[11px]", GLOW_TEXT_COLORS[bestGlow])}>
              {GLOW_LABELS[bestGlow]}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center pt-1 border-t border-[#1a2a3c]/50">
          <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Total Bonus Value</span>
          <span className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{totalBonus.toFixed(1)}</span>
        </div>
      </div>
    </PixelCard>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
// --- END AI-REPLACED ---
