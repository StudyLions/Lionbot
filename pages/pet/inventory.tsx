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
import { useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/router"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { GAME_CONSTANTS, GLOW_LABELS, GLOW_TEXT_COLORS, type GlowTier } from "@/utils/gameConstants"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import ItemTooltip, { type InventoryItem } from "@/components/pet/inventory/ItemTooltip"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import RoomCanvas from "@/components/pet/room/RoomCanvas"
import GameboyFrame from "@/components/pet/GameboyFrame"
import {
  mergeLayout, buildRenderSequence, clampEquipOffset,
  EQUIP_OFFSET_RANGE, type RenderStep, type RoomLayout,
} from "@/utils/roomConstraints"
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

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Category-to-slot fallback mapping, mirroring the API.
//          Used for optimistic updates and display when item.slot is null.
const CATEGORY_TO_SLOT: Record<string, string> = {
  HAT: "HEAD", GLASSES: "FACE", COSTUME: "BODY",
  SHIRT: "BODY", WINGS: "BACK", BOOTS: "FEET",
}
function resolveSlot(item: { slot: string | null; category: string }): string | null {
  return item.slot || CATEGORY_TO_SLOT[item.category] || null
}
// --- END AI-MODIFIED ---

export default function InventoryPage() {
  const { data: session } = useSession()
  const [filter, setFilter] = useState<FilterTab>("equipment")
  const [equipping, setEquipping] = useState<number | null>(null)

  const { data: invData, error: invError, isLoading: invLoading, mutate: mutateInv } =
    useDashboard<InventoryData>(session ? `/api/pet/inventory?filter=${filter}` : null)

  const { data: overview, isLoading: overviewLoading, mutate: mutateOverview } =
    useDashboard<OverviewData>(session ? "/api/pet/overview" : null)

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Optimistic SWR updates so equip/unequip reflects instantly in the UI.
  //          Fixes the "need to press twice" issue and makes item replacement feel seamless.
  const handleEquip = useCallback(async (inventoryId: number, action: "equip" | "unequip") => {
    if (equipping) return
    setEquipping(inventoryId)

    const targetItem = invData?.items.find((i) => i.inventoryId === inventoryId)
    const targetSlot = targetItem ? resolveSlot(targetItem.item) : null

    const optimisticInv = invData ? {
      ...invData,
      items: invData.items.map((i) => {
        if (i.inventoryId === inventoryId) return { ...i, equipped: action === "equip" }
        if (action === "equip" && targetSlot && resolveSlot(i.item) === targetSlot && i.equipped) {
          return { ...i, equipped: false }
        }
        return i
      }),
    } : undefined

    const optimisticOverview = overview && targetItem && targetSlot ? (() => {
      const newEquip = { ...overview.equipment }
      if (action === "equip") {
        newEquip[targetSlot] = {
          name: targetItem.item.name,
          category: targetItem.item.category,
          rarity: targetItem.item.rarity,
          assetPath: targetItem.item.assetPath,
          glowTier: targetItem.glowTier,
          glowIntensity: targetItem.glowIntensity,
        }
      } else {
        delete newEquip[targetSlot]
      }
      return { ...overview, equipment: newEquip }
    })() : undefined

    if (optimisticInv) mutateInv(optimisticInv, { revalidate: false })
    if (optimisticOverview) mutateOverview(optimisticOverview, { revalidate: false })

    try {
      const res = await fetch("/api/pet/inventory/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId, action }),
      })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error || "Failed")
        mutateInv()
        mutateOverview()
        return
      }
      toast.success(action === "equip" ? "Equipped!" : "Unequipped!")
    } catch {
      toast.error("Something went wrong")
    } finally {
      mutateInv()
      mutateOverview()
      invalidate("/api/pet/inventory?filter=equipment")
      invalidate("/api/pet/inventory?filter=scrolls")
      setEquipping(null)
    }
  }, [equipping, invData, overview, mutateInv, mutateOverview])

  const handleUnequipSlot = useCallback(async (slot: string) => {
    if (equipping) return
    setEquipping(-1)

    const optimisticOverview = overview ? (() => {
      const newEquip = { ...overview.equipment }
      delete newEquip[slot]
      return { ...overview, equipment: newEquip }
    })() : undefined

    const optimisticInv = invData ? {
      ...invData,
      items: invData.items.map((i) => {
        if (i.equipped && resolveSlot(i.item) === slot) return { ...i, equipped: false }
        return i
      }),
    } : undefined

    if (optimisticInv) mutateInv(optimisticInv, { revalidate: false })
    if (optimisticOverview) mutateOverview(optimisticOverview, { revalidate: false })

    try {
      const res = await fetch("/api/pet/inventory/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, action: "unequip" }),
      })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error || "Failed")
        mutateInv()
        mutateOverview()
        return
      }
      toast.success("Unequipped!")
    } catch {
      toast.error("Something went wrong")
    } finally {
      mutateInv()
      mutateOverview()
      invalidate("/api/pet/inventory?filter=equipment")
      invalidate("/api/pet/inventory?filter=scrolls")
      setEquipping(null)
    }
  }, [equipping, invData, overview, mutateInv, mutateOverview])
  // --- END AI-MODIFIED ---

  const equipment = overview?.equipment ?? {}
  const pet = overview?.pet

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Render stack state -- local edits to layer order and equipment offsets,
  //          with auto-save to the room layout API on change.
  const layout = useMemo(() => mergeLayout(overview?.roomLayout ?? {}), [overview?.roomLayout])
  const [localSequence, setLocalSequence] = useState<RenderStep[] | null>(null)
  const [localOffsets, setLocalOffsets] = useState<Record<string, [number, number]> | null>(null)
  const [selectedEquipSlot, setSelectedEquipSlot] = useState<string | null>(null)
  const [savingLayout, setSavingLayout] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const activeSequence = useMemo(
    () => localSequence ?? buildRenderSequence(Object.keys(equipment), layout.renderSequence),
    [localSequence, equipment, layout.renderSequence]
  )
  const activeOffsets = localOffsets ?? layout.equipmentOffsets

  const saveLayoutDebounced = useCallback((seq: RenderStep[], offsets: Record<string, [number, number]>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      setSavingLayout(true)
      try {
        const res = await fetch("/api/pet/room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            layout: { ...layout, renderSequence: seq, equipmentOffsets: offsets },
          }),
        })
        if (res.ok) mutateOverview()
      } catch { /* silent */ }
      finally { setSavingLayout(false) }
    }, 600)
  }, [layout, mutateOverview])

  const handleReorderSequence = useCallback((newSeq: RenderStep[]) => {
    setLocalSequence(newSeq)
    saveLayoutDebounced(newSeq, localOffsets ?? layout.equipmentOffsets)
  }, [saveLayoutDebounced, localOffsets, layout.equipmentOffsets])

  const handleOffsetChange = useCallback((slot: string, offset: [number, number]) => {
    const clamped = clampEquipOffset(offset)
    const newOffsets = { ...(localOffsets ?? layout.equipmentOffsets), [slot]: clamped }
    setLocalOffsets(newOffsets)
    saveLayoutDebounced(localSequence ?? buildRenderSequence(Object.keys(equipment), layout.renderSequence), newOffsets)
  }, [saveLayoutDebounced, localOffsets, localSequence, layout, equipment])
  // --- END AI-MODIFIED ---

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
                            layout={{ ...layout, renderSequence: activeSequence, equipmentOffsets: activeOffsets }}
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

                  {/* --- AI-MODIFIED (2026-03-20) --- */}
                  {/* Purpose: Full render stack panel replacing the simple equipped list. Shows
                      interleaved lion layers + equipment with drag reorder and position offsets. */}
                  <RenderStackPanel
                    equipment={equipment}
                    renderSequence={activeSequence}
                    equipmentOffsets={activeOffsets}
                    selectedSlot={selectedEquipSlot}
                    saving={savingLayout}
                    onReorder={handleReorderSequence}
                    onSelectSlot={setSelectedEquipSlot}
                    onOffsetChange={handleOffsetChange}
                    onUnequipSlot={handleUnequipSlot}
                  />
                  {/* --- END AI-MODIFIED --- */}

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
                          isScrollsTab={filter === "scrolls"}
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

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Use resolveSlot for button label, add scroll "Use in Enhancement" button
function InventoryItemCard({
  inv,
  equipping,
  onEquip,
  isEquipmentTab,
  isScrollsTab,
}: {
  inv: InventoryItem
  equipping: number | null
  onEquip: (id: number, action: "equip" | "unequip") => void
  isEquipmentTab: boolean
  isScrollsTab: boolean
}) {
  const router = useRouter()
  const bc = RARITY_BORDER[inv.item.rarity] || "#3a4a6c"
  const glowBc = inv.glowTier !== "none" ? GLOW_BORDER[inv.glowTier] : null
  const effectiveBorder = glowBc || bc
  const imgUrl = getItemImageUrl(inv.item.assetPath, inv.item.category)
  const isEquipping = equipping === inv.inventoryId
  const slot = resolveSlot(inv.item)

  return (
    <ItemTooltip inv={inv}>
      <ItemGlow rarity={inv.item.rarity} glowTier={inv.glowTier} glowIntensity={inv.glowIntensity}>
        <div
          className="flex flex-col border-2 bg-[#0c1020] transition-all hover:bg-[#101830] group"
          style={{
            borderColor: `${effectiveBorder}80`,
            boxShadow: `2px 2px 0 #060810`,
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
          {isEquipmentTab && slot && (
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
                {isEquipping ? "..." : inv.equipped ? "Unequip" : `Equip \u2192 ${slot}`}
              </button>
            </div>
          )}

          {/* Scroll "Use in Enhancement" Button */}
          {isScrollsTab && (
            <div className="px-2 pb-1.5">
              <button
                className="w-full font-pixel text-[9px] py-1 border transition-all hover:brightness-125 active:translate-y-px border-[var(--pet-gold,#f0c040)] text-[var(--pet-gold,#f0c040)] bg-[#f0c040]/5 hover:bg-[#f0c040]/10"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/pet/enhancement?scroll=${inv.inventoryId}`)
                }}
              >
                Enhance {"\u2192"}
              </button>
            </div>
          )}
        </div>
      </ItemGlow>
    </ItemTooltip>
  )
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Render stack panel for the inventory page. Shows the full interleaved
//          lion + equipment layer stack with drag-to-reorder and per-item position
//          offset sliders. Auto-saves changes to the room layout API.
const LION_LAYER_LABELS: Record<string, string> = {
  body: "Body", head: "Head", expression: "Expression", hair: "Mane",
}
const LION_LAYER_ICONS: Record<string, string> = {
  body: "\u{1F9B4}", head: "\u{1F981}", expression: "\u{1F60A}", hair: "\u{1F981}",
}
const RARITY_ACCENT: Record<string, string> = {
  COMMON: "#6b7280", UNCOMMON: "#3b82f6", RARE: "#ef4444",
  EPIC: "#eab308", LEGENDARY: "#ec4899", MYTHICAL: "#f43f5e",
}

function RenderStackPanel({
  equipment,
  renderSequence,
  equipmentOffsets,
  selectedSlot,
  saving,
  onReorder,
  onSelectSlot,
  onOffsetChange,
  onUnequipSlot,
}: {
  equipment: Record<string, { name: string; category: string; rarity: string; assetPath: string; glowTier?: string; glowIntensity?: number }>
  renderSequence: RenderStep[]
  equipmentOffsets: Record<string, [number, number]>
  selectedSlot: string | null
  saving: boolean
  onReorder: (seq: RenderStep[]) => void
  onSelectSlot: (slot: string | null) => void
  onOffsetChange: (slot: string, offset: [number, number]) => void
  onUnequipSlot: (slot: string) => void
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(idx))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null); setOverIdx(null); return
    }
    const seq = [...renderSequence]
    const [moved] = seq.splice(dragIdx, 1)
    seq.splice(targetIdx, 0, moved)
    onReorder(seq)
    setDragIdx(null); setOverIdx(null)
  }, [dragIdx, renderSequence, onReorder])

  const hasEquipment = Object.keys(equipment).length > 0
  const backItem = equipment["BACK"]
  const selectedItem = selectedSlot ? equipment[selectedSlot] : null
  const selectedOffset = selectedSlot ? (equipmentOffsets[selectedSlot] ?? [0, 0]) : [0, 0]

  const router = useRouter()

  return (
    <PixelCard className="p-3 border-[var(--pet-gold,#f0c040)]/30" corners>
      <div className="flex items-center gap-2 pb-2 mb-2 border-b-2 border-[var(--pet-gold,#f0c040)]/20">
        <span className="font-pixel text-[14px]">{"\u{1F4DA}"}</span>
        <span className="font-pixel text-xs text-[var(--pet-gold,#f0c040)]">Render Stack</span>
        {saving && (
          <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] ml-auto animate-pulse">
            saving...
          </span>
        )}
      </div>

      {/* Info box */}
      <div className="mb-2 px-2 py-1.5 border border-[#4080f0]/20 bg-[#4080f0]/5">
        <p className="font-pixel text-[9px] text-[#80b0ff] leading-relaxed">
          Items not aligned? Drag equipment between lion layers to change what renders in front or behind. Click an item to adjust its X/Y position.
        </p>
        <button
          onClick={() => router.push("/pet/room")}
          className="mt-1 w-full font-pixel text-[9px] py-1 border border-[#4080f0]/30 text-[#80b0ff] bg-[#4080f0]/5 hover:bg-[#4080f0]/10 transition-colors"
        >
          Open Full Room Editor {"\u2192"}
        </button>
      </div>

      {!hasEquipment ? (
        <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] italic py-2">
          No equipment worn. Equip items to arrange their layers.
        </p>
      ) : (
        <div className="space-y-1">
          {/* BACK is always behind the lion */}
          {backItem && (
            <div className="mb-1">
              <p className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] uppercase mb-0.5 flex items-center gap-1">
                <span>{"\u{1F512}"}</span> Behind Lion
              </p>
              <RenderStackRow
                slot="BACK"
                item={backItem}
                isSelected={selectedSlot === "BACK"}
                isDragging={false}
                isOver={false}
                locked
                onClick={() => onSelectSlot(selectedSlot === "BACK" ? null : "BACK")}
                onUnequip={() => onUnequipSlot("BACK")}
              />
            </div>
          )}

          {/* Separator */}
          {backItem && renderSequence.length > 0 && (
            <div className="flex items-center gap-1.5 py-0.5">
              <div className="flex-1 h-px bg-[#2a3a5c]" />
              <span className="font-pixel text-[8px] text-[#5a6a7c] uppercase tracking-wider">Lion Sprite</span>
              <div className="flex-1 h-px bg-[#2a3a5c]" />
            </div>
          )}

          {/* Interleaved stack */}
          <div className="flex flex-col gap-0.5">
            {renderSequence.map((step, idx) => {
              if (step.type === "lion") {
                return (
                  <div
                    key={`lion_${step.key}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setOverIdx(idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 transition-all border",
                      overIdx === idx && dragIdx !== null
                        ? "border-[var(--pet-gold,#f0c040)]/30 bg-[var(--pet-gold,#f0c040)]/5"
                        : "border-transparent"
                    )}
                  >
                    <span className="text-[11px] opacity-40">{LION_LAYER_ICONS[step.key] || "\u{1F981}"}</span>
                    <span className="font-pixel text-[9px] text-[#5a6a7c] uppercase tracking-wider flex-1">
                      {LION_LAYER_LABELS[step.key] || step.key}
                    </span>
                    <span className="font-pixel text-[7px] text-[#3a4a5c]">anchor</span>
                  </div>
                )
              }

              const slot = step.key
              const item = equipment[slot]
              if (!item) return null

              return (
                <div
                  key={`equip_${slot}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setOverIdx(idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
                >
                  <RenderStackRow
                    slot={slot}
                    item={item}
                    isSelected={selectedSlot === slot}
                    isDragging={dragIdx === idx}
                    isOver={overIdx === idx && dragIdx !== idx}
                    onClick={() => onSelectSlot(selectedSlot === slot ? null : slot)}
                    onUnequip={() => onUnequipSlot(slot)}
                  />
                </div>
              )
            })}
          </div>

          {/* Direction legend */}
          <div className="flex items-center justify-between pt-1 text-[8px] font-pixel text-[#5a6a7c]">
            <span>{"\u2191"} Front</span>
            <span>{"\u2193"} Back</span>
          </div>
        </div>
      )}

      {/* Position offsets for selected equipment */}
      {selectedSlot && selectedItem && (
        <div className="mt-2 pt-2 border-t-2 border-[#1a2a3c]">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="font-pixel text-[10px]">{SLOT_ICONS[selectedSlot] || "\u{1F4E6}"}</span>
            <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)] truncate">
              {selectedItem.name} — Position
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] w-4">X</span>
              <input
                type="range"
                min={-EQUIP_OFFSET_RANGE}
                max={EQUIP_OFFSET_RANGE}
                value={selectedOffset[0]}
                onChange={(e) => onOffsetChange(selectedSlot, [Number(e.target.value), selectedOffset[1]])}
                className="flex-1 h-1 appearance-none bg-[#2a3a5c] rounded cursor-pointer accent-[#4080f0]"
              />
              <span className="font-pixel text-[9px] text-[var(--pet-text,#e2e8f0)] w-6 text-right tabular-nums">
                {selectedOffset[0]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] w-4">Y</span>
              <input
                type="range"
                min={-EQUIP_OFFSET_RANGE}
                max={EQUIP_OFFSET_RANGE}
                value={selectedOffset[1]}
                onChange={(e) => onOffsetChange(selectedSlot, [selectedOffset[0], Number(e.target.value)])}
                className="flex-1 h-1 appearance-none bg-[#2a3a5c] rounded cursor-pointer accent-[#4080f0]"
              />
              <span className="font-pixel text-[9px] text-[var(--pet-text,#e2e8f0)] w-6 text-right tabular-nums">
                {selectedOffset[1]}
              </span>
            </div>
            <button
              onClick={() => onOffsetChange(selectedSlot, [0, 0])}
              className="w-full font-pixel text-[9px] py-1 border border-[#3a4a6c] bg-[#0a0e1a] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)] transition-colors"
            >
              Reset Position
            </button>
          </div>
        </div>
      )}
    </PixelCard>
  )
}

function RenderStackRow({
  slot,
  item,
  isSelected,
  isDragging,
  isOver,
  locked,
  onClick,
  onUnequip,
}: {
  slot: string
  item: { name: string; category: string; rarity: string; assetPath: string }
  isSelected: boolean
  isDragging: boolean
  isOver: boolean
  locked?: boolean
  onClick: () => void
  onUnequip: () => void
}) {
  const imgUrl = getItemImageUrl(item.assetPath, item.category)
  const accent = RARITY_ACCENT[item.rarity] || RARITY_ACCENT.COMMON

  return (
    <div
      className={cn(
        "relative flex items-center gap-1.5 bg-[#0a0e1a] border transition-all overflow-hidden cursor-pointer",
        locked
          ? "border-[#2a3a5c] opacity-70"
          : isDragging
            ? "border-[var(--pet-gold,#f0c040)]/50 opacity-50 scale-95"
            : isOver
              ? "border-[var(--pet-gold,#f0c040)] shadow-[0_0_8px_rgba(240,192,64,0.2)] scale-[1.01]"
              : isSelected
                ? "border-[#4080f0] shadow-[0_0_6px_rgba(64,128,240,0.25)]"
                : "border-[#2a3a5c] hover:border-[#4a5a7c]"
      )}
      onClick={onClick}
    >
      <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: accent }} />
      <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center my-0.5">
        {imgUrl ? (
          <CroppedItemImage src={imgUrl} alt={item.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-xs">{SLOT_ICONS[slot] || "\u{1F4E6}"}</span>
        )}
      </div>
      <div className="flex-1 min-w-0 py-1 pr-1">
        <div className="flex items-center gap-1">
          <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">{SLOT_ICONS[slot]}</span>
          <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] uppercase">{slot}</span>
          <PixelBadge rarity={item.rarity} className="text-[7px] px-0.5 py-0 ml-auto" />
        </div>
        <p className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate">{item.name}</p>
      </div>
      {!locked && (
        <button
          className="flex-shrink-0 pr-1.5 text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-red,#e04040)] text-[10px] transition-colors"
          onClick={(e) => { e.stopPropagation(); onUnequip() }}
          title="Unequip"
        >
          {"\u2716"}
        </button>
      )}
      {!locked && (
        <div className="flex-shrink-0 pr-1.5 text-[#5a6a7c] text-[10px] cursor-grab active:cursor-grabbing">
          {"\u2807"}
        </div>
      )}
    </div>
  )
}
// --- END AI-MODIFIED ---

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
