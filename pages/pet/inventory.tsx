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
import PetShell from "@/components/pet/PetShell"
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
import PixelTabBar from "@/components/pet/ui/PixelTabBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import PixelButton from "@/components/pet/ui/PixelButton"
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

// --- AI-MODIFIED (2026-04-23) ---
// Purpose: Add favorites count to inventory data so the new "Favorites"
// tab can show its badge. The API returns it alongside equipment/scrolls.
interface InventoryData {
  items: InventoryItem[]
  counts: { equipment: number; scrolls: number; favorites?: number }
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-24) ---
// Purpose: Add cosmetic overlay shape (`cosmetics` per slot + master
// `cosmeticsEnabled` flag) so the inventory page can both render the
// merged visual layer AND surface stats-vs-visuals UI affordances.
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
  cosmetics?: Record<string, {
    name: string; category: string; rarity: string; assetPath: string
  }>
  cosmeticsEnabled?: boolean
  roomPrefix?: string
  furniture?: Record<string, string>
  roomLayout?: any
  gameboySkinPath?: string | null
}
// --- END AI-MODIFIED ---

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

const GLOW_BORDER: Record<GlowTier, string> = {
  none: "", bronze: "#cd7f32", silver: "#c0d2f0",
  gold: "#ffd700", diamond: "#64c8ff", celestial: "#c864ff",
}

// --- AI-MODIFIED (2026-04-23) ---
// Purpose: Add a "favorites" filter tab that shows only locked items
// (regardless of category). Backed client-side because the count is
// already returned by the inventory API.
type FilterTab = "equipment" | "scrolls" | "favorites"

const TABS: { key: FilterTab; label: string }[] = [
  { key: "equipment", label: "Equipment" },
  { key: "scrolls", label: "Scrolls" },
  { key: "favorites", label: "Favorites" },
]
// --- END AI-MODIFIED ---

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

// --- AI-MODIFIED (2026-04-10) ---
// Purpose: Reverse slot lookup for marketplace links from empty equipment slots
const SLOT_TO_CATEGORY: Record<string, string> = {
  HEAD: "HAT", FACE: "GLASSES", BODY: "COSTUME", BACK: "WINGS", FEET: "BOOTS",
}
// --- END AI-MODIFIED ---

export default function InventoryPage() {
  const { data: session } = useSession()
  const router = useRouter()
  // --- AI-MODIFIED (2026-04-23) ---
  // Purpose: Honor `?tab=favorites` deep-link from the sell page so the
  // "X locked items hidden — manage in Inventory" notice routes correctly.
  const initialFilter = ((): FilterTab => {
    const t = (router.query.tab as string | undefined) ?? ""
    return t === "scrolls" || t === "favorites" || t === "equipment"
      ? (t as FilterTab)
      : "equipment"
  })()
  const [filter, setFilter] = useState<FilterTab>(initialFilter)
  // --- END AI-MODIFIED ---
  const [equipping, setEquipping] = useState<number | null>(null)
  // --- AI-MODIFIED (2026-04-10) ---
  // Purpose: State for Equip Best loading and Try On preview
  const [equipBestLoading, setEquipBestLoading] = useState(false)
  const [previewItem, setPreviewItem] = useState<InventoryItem | null>(null)
  // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-04-23) ---
  // Purpose: Track which inventory row is mid-lock-toggle so we can disable
  // the padlock button while the request is in flight (prevents double-fire).
  const [lockToggling, setLockToggling] = useState<number | null>(null)
  // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-04-24) ---
  // Purpose: Mid-cosmetic-toggle inventory id (mirrors `equipping` /
  // `lockToggling` patterns) plus mid-master-toggle flag for the global
  // "Show cosmetics" switch.
  const [cosmeticToggling, setCosmeticToggling] = useState<number | null>(null)
  const [cosmeticsMasterPending, setCosmeticsMasterPending] = useState(false)
  // --- END AI-MODIFIED ---

  const { data: invData, error: invError, isLoading: invLoading, mutate: mutateInv } =
    useDashboard<InventoryData>(session ? `/api/pet/inventory?filter=${filter}` : null)

  const { data: overview, isLoading: overviewLoading, mutate: mutateOverview } =
    useDashboard<OverviewData>(session ? "/api/pet/overview" : null)

  // --- AI-MODIFIED (2026-04-10) ---
  // Purpose: Equip Best handler -- calls batch equip API and refreshes all data
  const handleEquipBest = useCallback(async () => {
    if (equipBestLoading) return
    setEquipBestLoading(true)
    try {
      const res = await fetch("/api/pet/inventory/equip-best", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error || "Failed to equip best items")
        return
      }
      toast.success(`Equipped best items in ${body.equipped} slot${body.equipped !== 1 ? "s" : ""}!`)
      setPreviewItem(null)
    } catch {
      toast.error("Something went wrong")
    } finally {
      mutateInv()
      mutateOverview()
      invalidate("/api/pet/inventory?filter=equipment")
      invalidate("/api/pet/inventory?filter=scrolls")
      setEquipBestLoading(false)
    }
  }, [equipBestLoading, mutateInv, mutateOverview])

  // Purpose: Compute preview equipment map for Try On feature
  // --- AI-MODIFIED (2026-04-24) ---
  // Purpose: Try On now layers on top of the cosmetic-merged base when the
  // pet has cosmetics enabled, so previewing one slot doesn't accidentally
  // strip cosmetics out of the other slots.
  const previewEquipment = useMemo(() => {
    if (!previewItem || !overview) return null
    const slot = resolveSlot(previewItem.item)
    if (!slot) return null
    const showCosmetics = overview.cosmeticsEnabled ?? true
    const base: Record<string, {
      name: string; category: string; rarity: string; assetPath: string
      glowTier?: string; glowIntensity?: number
    }> = { ...overview.equipment }
    if (showCosmetics && overview.cosmetics) {
      for (const [s, item] of Object.entries(overview.cosmetics)) {
        base[s] = {
          name: item.name,
          category: item.category,
          rarity: item.rarity,
          assetPath: item.assetPath,
          glowTier: "none",
          glowIntensity: 0,
        }
      }
    }
    base[slot] = {
      name: previewItem.item.name,
      category: previewItem.item.category,
      rarity: previewItem.item.rarity,
      assetPath: previewItem.item.assetPath,
      glowTier: previewItem.glowTier,
      glowIntensity: previewItem.glowIntensity,
    }
    return base
  }, [previewItem, overview])
  // --- END AI-MODIFIED ---
  // --- END AI-MODIFIED ---

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

  // --- AI-MODIFIED (2026-04-24) ---
  // Purpose: Cosmetic overlay handlers.
  //   - handleCosmeticToggle sets/clears an item as the visual override
  //     for its slot via /api/pet/inventory/cosmetic. Stats stay tied to
  //     whatever is in lg_pet_equipment.
  //   - handleCosmeticsMasterToggle flips the per-pet cosmetics_enabled
  //     flag via /api/pet/cosmetics-toggle so users can quickly preview
  //     their "true equipment view" without losing their picks.
  const handleCosmeticToggle = useCallback(
    async (inventoryId: number, action: "set" | "clear") => {
      if (cosmeticToggling) return
      setCosmeticToggling(inventoryId)

      const targetItem = invData?.items.find((i) => i.inventoryId === inventoryId)
      const targetSlot = targetItem ? resolveSlot(targetItem.item) : null

      const optimisticInv = invData ? {
        ...invData,
        items: invData.items.map((i) => {
          if (i.inventoryId === inventoryId) return { ...i, equippedAsCosmetic: action === "set" }
          if (action === "set" && targetSlot && resolveSlot(i.item) === targetSlot && i.equippedAsCosmetic) {
            return { ...i, equippedAsCosmetic: false }
          }
          return i
        }),
      } : undefined

      const optimisticOverview = overview && targetItem && targetSlot ? (() => {
        const newCos = { ...(overview.cosmetics ?? {}) }
        if (action === "set") {
          newCos[targetSlot] = {
            name: targetItem.item.name,
            category: targetItem.item.category,
            rarity: targetItem.item.rarity,
            assetPath: targetItem.item.assetPath,
          }
        } else {
          delete newCos[targetSlot]
        }
        return { ...overview, cosmetics: newCos }
      })() : undefined

      if (optimisticInv) mutateInv(optimisticInv, { revalidate: false })
      if (optimisticOverview) mutateOverview(optimisticOverview, { revalidate: false })

      try {
        const res = await fetch("/api/pet/inventory/cosmetic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inventoryId, action }),
        })
        const body = await res.json()
        if (!res.ok) {
          toast.error(body.error || "Failed to update cosmetic")
          mutateInv()
          mutateOverview()
          return
        }
        toast.success(action === "set" ? "Cosmetic set" : "Cosmetic cleared")
      } catch {
        toast.error("Something went wrong")
      } finally {
        mutateInv()
        mutateOverview()
        invalidate("/api/pet/inventory?filter=equipment")
        invalidate("/api/pet/inventory?filter=scrolls")
        invalidate("/api/pet/inventory?filter=favorites")
        setCosmeticToggling(null)
      }
    },
    [cosmeticToggling, invData, overview, mutateInv, mutateOverview]
  )

  const handleCosmeticsMasterToggle = useCallback(async () => {
    if (cosmeticsMasterPending) return
    setCosmeticsMasterPending(true)
    const next = !(overview?.cosmeticsEnabled ?? true)

    const optimisticOverview = overview ? { ...overview, cosmeticsEnabled: next } : undefined
    if (optimisticOverview) mutateOverview(optimisticOverview, { revalidate: false })

    try {
      const res = await fetch("/api/pet/cosmetics-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error || "Failed to update toggle")
        mutateOverview()
        return
      }
      toast.success(next ? "Showing cosmetics" : "Showing real equipment")
    } catch {
      toast.error("Something went wrong")
      mutateOverview()
    } finally {
      mutateOverview()
      setCosmeticsMasterPending(false)
    }
  }, [cosmeticsMasterPending, overview, mutateOverview])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-04-23) ---
  // Purpose: Toggle the lock / favorite state on an inventory row. Optimistic
  // update flips `isLocked` immediately, then we POST and revalidate. If the
  // server rejects, we fall back to the server's view via mutateInv() with
  // revalidate.
  const handleToggleLock = useCallback(async (inventoryId: number, nextLocked: boolean) => {
    if (lockToggling) return
    setLockToggling(inventoryId)

    const optimisticInv = invData ? {
      ...invData,
      items: invData.items.map((i) =>
        i.inventoryId === inventoryId ? { ...i, isLocked: nextLocked } : i
      ),
      counts: invData.counts ? {
        ...invData.counts,
        favorites: Math.max(
          0,
          (invData.counts.favorites ?? 0) + (nextLocked ? 1 : -1)
        ),
      } : invData.counts,
    } : undefined

    if (optimisticInv) mutateInv(optimisticInv, { revalidate: false })

    try {
      const res = await fetch("/api/pet/inventory/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId, locked: nextLocked }),
      })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error || "Failed to update lock")
        mutateInv()
        return
      }
      toast.success(nextLocked ? "Locked / favorited" : "Unlocked")
    } catch {
      toast.error("Something went wrong")
      mutateInv()
    } finally {
      mutateInv()
      invalidate("/api/pet/inventory?filter=equipment")
      invalidate("/api/pet/inventory?filter=scrolls")
      invalidate("/api/pet/inventory?filter=favorites")
      setLockToggling(null)
    }
  }, [lockToggling, invData, mutateInv])
  // --- END AI-MODIFIED ---

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
  // --- AI-MODIFIED (2026-04-24) ---
  // Purpose: Merge cosmetic overlay rows on top of equipment per slot when
  // the master cosmetics_enabled flag is on. This produces the visual layer
  // RoomCanvas consumes -- stats summaries should keep using `equipment`
  // directly so bonuses stay tied to the real gear (BonusSummary already
  // does this via `i.equipped`).
  const cosmeticsEnabled = overview?.cosmeticsEnabled ?? true
  const cosmetics = overview?.cosmetics ?? {}
  const renderedEquipment = useMemo(() => {
    if (!cosmeticsEnabled) return equipment
    const merged: typeof equipment = { ...equipment }
    for (const [slot, item] of Object.entries(cosmetics)) {
      merged[slot] = {
        name: item.name,
        category: item.category,
        rarity: item.rarity,
        assetPath: item.assetPath,
        glowTier: "none",
        glowIntensity: 0,
      }
    }
    return merged
  }, [equipment, cosmetics, cosmeticsEnabled])
  // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-04-10) ---
  // Purpose: When Try On preview is active, use merged equipment for the lion render
  // --- AI-MODIFIED (2026-04-24) ---
  // Purpose: Try On preview takes priority, then cosmetic-merged equipment,
  // then bare equipment. Order matters: previewEquipment is computed off
  // `equipment` and adds the trial item; cosmetic overlay then sits on top
  // of whatever's left in slots the preview didn't touch.
  const displayEquipment = previewEquipment ?? renderedEquipment
  // --- END AI-MODIFIED ---
  // --- END AI-MODIFIED ---
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
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to PetShell for consistent layout */}
        {/* --- Original code (commented out for rollback) ---
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
        --- End original code --- */}
        {/* --- AI-MODIFIED (2026-03-24) --- */}
        {/* Purpose: Pass hasPet so PetNav shows correct state */}
        <PetShell hasPet={overview?.hasPet ?? true}>
        {/* --- END AI-MODIFIED --- */}
        {/* --- END AI-REPLACED --- */}
              {/* --- AI-MODIFIED (2026-04-10) --- */}
              {/* Purpose: Title area with Equip Best and Browse Marketplace action buttons */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
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
                <div className="flex items-center gap-2 flex-shrink-0">
                  {filter === "equipment" && (invData?.counts?.equipment ?? 0) > 0 && (
                    <PixelButton
                      variant="gold"
                      size="sm"
                      loading={equipBestLoading}
                      onClick={handleEquipBest}
                    >
                      {"\u2B50"} Equip Best
                    </PixelButton>
                  )}
                  <PixelButton variant="info" size="sm" onClick={() => router.push("/pet/marketplace")}>
                    {"\u{1F6D2}"} Marketplace
                  </PixelButton>
                </div>
              </div>
              {/* --- END AI-MODIFIED --- */}

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
                    {/* --- AI-MODIFIED (2026-04-24) ---
                        Purpose: Master "Show cosmetics" toggle. Mirrors the
                        bot's per-pet `cosmetics_enabled` flag so users can
                        quickly flip between "true equipment view" (what
                        actually has stats) and "cosmetic overlay view"
                        (what they want to look like) without losing their
                        cosmetic picks. Only shown when at least one
                        cosmetic exists, so we never put a confusing toggle
                        in front of users who haven't opted in. */}
                    {Object.keys(cosmetics).length > 0 && (
                      <button
                        type="button"
                        onClick={handleCosmeticsMasterToggle}
                        disabled={cosmeticsMasterPending}
                        className={cn(
                          "w-full flex items-center justify-between gap-2 mb-2 px-2 py-1.5 border transition-colors",
                          "disabled:opacity-50",
                          cosmeticsEnabled
                            ? "border-[#d060f0]/40 bg-[#d060f0]/10 hover:bg-[#d060f0]/15"
                            : "border-[#3a4a6c] bg-[#0a0e1a] hover:bg-[#101830]"
                        )}
                        title={
                          cosmeticsEnabled
                            ? "Cosmetics are showing — click to hide and see your real equipped gear"
                            : "Cosmetics are hidden — click to show your cosmetic overlays"
                        }
                      >
                        <span
                          className={cn(
                            "font-pixel text-[10px] truncate",
                            cosmeticsEnabled ? "text-[#e0a0ff]" : "text-[var(--pet-text-dim,#8899aa)]"
                          )}
                        >
                          {"\u2728"} Show cosmetics
                          <span className="ml-1 opacity-70">
                            ({Object.keys(cosmetics).length})
                          </span>
                        </span>
                        <span
                          className={cn(
                            "font-pixel text-[9px] px-1.5 py-0.5 border flex-shrink-0",
                            cosmeticsEnabled
                              ? "border-[#d060f0] text-[#e0a0ff] bg-[#d060f0]/15"
                              : "border-[#3a4a6c] text-[var(--pet-text-dim,#8899aa)] bg-[#0a0e1a]"
                          )}
                        >
                          {cosmeticsMasterPending ? "..." : cosmeticsEnabled ? "ON" : "OFF"}
                        </span>
                      </button>
                    )}
                    {/* --- END AI-MODIFIED --- */}
                    {/* --- AI-MODIFIED (2026-04-10) --- */}
                    {/* Purpose: Try On preview banner above the lion render */}
                    {previewItem && (
                      <div className="flex items-center justify-between gap-2 mb-2 px-2 py-1.5 border border-[#d060f0]/30 bg-[#d060f0]/10">
                        <span className="font-pixel text-[10px] text-[#e0a0ff] truncate">
                          {"\u{1F457}"} Trying on: {previewItem.item.name}
                        </span>
                        <button
                          onClick={() => setPreviewItem(null)}
                          className="font-pixel text-[9px] text-[#ff8080] hover:text-[#ff6060] flex-shrink-0 border border-[#e04040]/30 px-1.5 py-0.5 bg-[#e04040]/10 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                    {/* --- END AI-MODIFIED --- */}
                    <div className="flex justify-center overflow-hidden">
                      {overviewLoading ? (
                        <Skeleton className="w-full max-w-[280px] aspect-square" />
                      ) : overview?.hasPet ? (
                        <GameboyFrame
                          isFullscreen={false}
                          skinAssetPath={overview.gameboySkinPath ?? undefined}
                          width={310}
                        >
                          {/* --- AI-MODIFIED (2026-04-10) --- */}
                          {/* Purpose: Use displayEquipment (which includes Try On preview item) */}
                          <RoomCanvas
                            roomPrefix={overview.roomPrefix ?? "rooms/default"}
                            furniture={overview.furniture ?? {}}
                            layout={{ ...layout, renderSequence: activeSequence, equipmentOffsets: activeOffsets }}
                            equipment={Object.fromEntries(
                              Object.entries(displayEquipment).map(([slot, item]) => [
                                slot,
                                { assetPath: item.assetPath, category: item.category, glowTier: item.glowTier, glowIntensity: item.glowIntensity },
                              ])
                            )}
                            expression={pet?.expression ?? "default"}
                            size={238}
                            animated
                          />
                          {/* --- END AI-MODIFIED --- */}
                        </GameboyFrame>
                      ) : (
                        <div className="w-full max-w-[280px] h-[200px] flex items-center justify-center">
                          <span className="font-pixel text-sm text-[var(--pet-text-dim)]">No pet yet</span>
                        </div>
                      )}
                    </div>
                  </PixelCard>

                  {/* --- AI-MODIFIED (2026-03-20) --- */}
                  {/* Purpose: Full render stack panel replacing the simple equipped list. Shows
                      interleaved lion layers + equipment with drag reorder and position offsets. */}
                  {/* --- AI-MODIFIED (2026-04-24) ---
                      Purpose: Pass renderedEquipment (cosmetic-merged) so the
                      panel rows match what's actually rendered on the lion,
                      plus cosmetics + equipmentRaw so each row can show a
                      "this slot is showing a cosmetic" badge with a tooltip
                      revealing both the visual and the stat-bearing item. */}
                  <RenderStackPanel
                    equipment={renderedEquipment}
                    equipmentRaw={equipment}
                    cosmetics={cosmetics}
                    cosmeticsEnabled={cosmeticsEnabled}
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
                  {/* --- END AI-MODIFIED --- */}

                  {/* Bonus Summary */}
                  <BonusSummary filter={filter} items={invData?.items} />
                </div>

                {/* Right Column: Inventory Grid */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* --- AI-REPLACED (2026-03-24) --- */}
                  {/* Reason: Migrated PixelButton tab row to shared PixelTabBar component */}
                  {/* --- Original code (commented out for rollback) ---
                  <div className="flex gap-2">
                    {TABS.map((tab) => (
                      <PixelButton key={tab.key} variant={filter === tab.key ? "primary" : "ghost"} size="sm"
                        onClick={() => setFilter(tab.key)}>
                        {tab.label}
                        {invData?.counts && (<span className="opacity-60 ml-1">({invData.counts[tab.key]})</span>)}
                      </PixelButton>
                    ))}
                  </div>
                  --- End original code --- */}
                  <PixelTabBar
                    tabs={TABS.map(t => ({ ...t, count: invData?.counts?.[t.key] }))}
                    active={filter}
                    onChange={(k) => setFilter(k as FilterTab)}
                  />

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
                    // --- AI-MODIFIED (2026-04-10) ---
                    // Purpose: Empty state with marketplace link
                    <PixelCard className="p-12 text-center" corners>
                      <p className="font-pixel text-base text-[var(--pet-text-dim,#8899aa)]">
                        No {filter} found.
                      </p>
                      <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)] mt-2">
                        Earn items from Discord activity or{" "}
                        <button
                          onClick={() => router.push("/pet/marketplace")}
                          className="text-[#80b0ff] hover:text-[#a0c0ff] underline underline-offset-2 transition-colors"
                        >
                          browse the Marketplace
                        </button>
                      </p>
                    </PixelCard>
                    // --- END AI-MODIFIED ---
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                      {invData.items.map((inv) => (
                        <InventoryItemCard
                          key={inv.inventoryId}
                          inv={inv}
                          equipping={equipping}
                          onEquip={handleEquip}
                          onTryOn={setPreviewItem}
                          isPreviewing={previewItem?.inventoryId === inv.inventoryId}
                          isEquipmentTab={filter === "equipment"}
                          isScrollsTab={filter === "scrolls"}
                          // --- AI-MODIFIED (2026-04-23) ---
                          // Purpose: Wire the new lock/favorite toggle into each card.
                          onToggleLock={handleToggleLock}
                          lockToggling={lockToggling === inv.inventoryId}
                          // --- END AI-MODIFIED ---
                          // --- AI-MODIFIED (2026-04-24) ---
                          // Purpose: Wire the new cosmetic-overlay toggle. The card
                          // shows a Set-as-cosmetic / Remove-cosmetic button in the
                          // equipment tab, plus a small badge when cosmetic is on.
                          onToggleCosmetic={handleCosmeticToggle}
                          cosmeticToggling={cosmeticToggling === inv.inventoryId}
                          cosmeticsEnabled={cosmeticsEnabled}
                          // --- END AI-MODIFIED ---
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Original closing: </div></div></div> */}
        </PetShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}

// --- AI-MODIFIED (2026-04-10) ---
// Purpose: Added onTryOn and isPreviewing props for Try On preview feature
// --- AI-MODIFIED (2026-04-23) ---
// Purpose: Added onToggleLock + lockToggling props so each card can render
// a padlock toggle (top-left of image) and a persistent LOCKED badge.
// --- AI-MODIFIED (2026-04-24) ---
// Purpose: Added onToggleCosmetic / cosmeticToggling / cosmeticsEnabled
// props so each equippable item can be set as the visual cosmetic overlay
// without changing the stat-bearing equipped item. The cosmetic action is
// only meaningful for equippable items, so it's gated to isEquipmentTab.
function InventoryItemCard({
  inv,
  equipping,
  onEquip,
  onTryOn,
  isPreviewing,
  isEquipmentTab,
  isScrollsTab,
  onToggleLock,
  lockToggling,
  onToggleCosmetic,
  cosmeticToggling,
  cosmeticsEnabled,
}: {
  inv: InventoryItem
  equipping: number | null
  onEquip: (id: number, action: "equip" | "unequip") => void
  onTryOn: (item: InventoryItem | null) => void
  isPreviewing: boolean
  isEquipmentTab: boolean
  isScrollsTab: boolean
  onToggleLock: (id: number, nextLocked: boolean) => void
  lockToggling: boolean
  onToggleCosmetic: (id: number, action: "set" | "clear") => void
  cosmeticToggling: boolean
  cosmeticsEnabled: boolean
}) {
  // --- END AI-MODIFIED ---
  // --- END AI-MODIFIED ---
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
        {/* --- AI-MODIFIED (2026-03-24) --- */}
        {/* Purpose: min-h + h-full for consistent card heights across grid */}
        <div
          className="flex flex-col min-h-[180px] h-full border-2 bg-[#0c1020] transition-all hover:bg-[#101830] group"
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
            {/* --- AI-MODIFIED (2026-04-24) ---
                Purpose: Persistent COS badge whenever this item is the
                cosmetic overlay for its slot. Sits just below the EQP pill
                so users can see at a glance that the same row has both
                roles or only one. Visually distinct (purple) so it never
                gets confused with the green "really equipped" pill. */}
            {inv.equippedAsCosmetic && (
              <span
                className={cn(
                  "absolute right-1 font-pixel text-[8px] px-1 py-0.5 border bg-[#2a1a3c]/90",
                  inv.equipped ? "top-[1.1rem]" : "top-1",
                  cosmeticsEnabled
                    ? "border-[#d060f0] text-[#e0a0ff]"
                    : "border-[#d060f0]/40 text-[#d060f0]/60"
                )}
                title={
                  cosmeticsEnabled
                    ? "Showing as cosmetic overlay (visual only)"
                    : "Set as cosmetic but display is OFF — toggle 'Show cosmetics' to see it"
                }
              >
                COS
              </span>
            )}
            {/* --- END AI-MODIFIED --- */}
            {/* --- AI-MODIFIED (2026-04-23) --- */}
            {/* Purpose: Padlock toggle (top-left). Locked items get a solid gold
                pill so the protection is unmistakable; unlocked items show a
                subtle ghost button that only pops on hover, so the inventory
                still reads at a glance. */}
            <button
              type="button"
              aria-label={inv.isLocked ? "Unlock item" : "Lock / favorite item"}
              title={
                inv.isLocked
                  ? "Locked / favorited — click to unlock\nLocked items can't be sold, gifted, or used to enhance."
                  : "Lock / favorite this item\nLocked items can't be accidentally sold, gifted, or enhanced."
              }
              onClick={(e) => {
                e.stopPropagation()
                if (lockToggling) return
                onToggleLock(inv.inventoryId, !inv.isLocked)
              }}
              disabled={lockToggling}
              className={cn(
                "absolute top-1 left-1 font-pixel text-[10px] leading-none px-1 py-0.5 border transition-all",
                "disabled:opacity-50",
                inv.isLocked
                  ? "border-[var(--pet-gold,#f0c040)] text-[var(--pet-gold,#f0c040)] bg-[#f0c040]/15 hover:bg-[#f0c040]/25"
                  : "border-[#3a4a6c]/60 text-[#5a6a7c] bg-[#0a0e1a]/70 opacity-0 group-hover:opacity-100 hover:text-[var(--pet-gold,#f0c040)] hover:border-[var(--pet-gold,#f0c040)]/60"
              )}
            >
              {inv.isLocked ? "\u{1F512}" : "\u{1F513}"}
            </button>
            {/* --- END AI-MODIFIED --- */}
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
              {/* --- AI-MODIFIED (2026-04-23) --- */}
              {/* Purpose: Persistent "Locked" pill so the protection state is
                  visible even without hover — mirrors the tooltip indicator. */}
              {inv.isLocked && (
                <span
                  className="font-pixel text-[8px] px-1 py-0 border border-[var(--pet-gold,#f0c040)]/60 text-[var(--pet-gold,#f0c040)] bg-[#f0c040]/10"
                  title="Locked — protected from sell / gift / enhance"
                >
                  Locked
                </span>
              )}
              {/* --- END AI-MODIFIED --- */}
            </div>
            {inv.totalBonus > 0 && (
              <div className="mt-0.5">
                <span className="font-pixel text-[8px] text-[var(--pet-gold,#f0c040)]">
                  +{(inv.totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100).toFixed(1)}% gold
                </span>
              </div>
            )}
          </div>

          {/* --- AI-MODIFIED (2026-04-10) --- */}
          {/* Purpose: Equip/Unequip + Try On buttons */}
          {isEquipmentTab && slot && (
            <div className="px-2 pb-1.5 mt-auto space-y-1">
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
              {!inv.equipped && (
                <button
                  className={cn(
                    "w-full font-pixel text-[9px] py-1 border transition-all",
                    "hover:brightness-125 active:translate-y-px",
                    isPreviewing
                      ? "border-[#d060f0] text-[#e0a0ff] bg-[#d060f0]/15"
                      : "border-[#d060f0]/40 text-[#d060f0]/70 bg-[#d060f0]/5 hover:bg-[#d060f0]/10 hover:text-[#e0a0ff]"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onTryOn(isPreviewing ? null : inv)
                  }}
                >
                  {isPreviewing ? "\u{1F457} Trying On..." : "\u{1F457} Try On"}
                </button>
              )}
              {/* --- AI-MODIFIED (2026-04-24) ---
                  Purpose: Cosmetic overlay action — set this item as the
                  visual layer for its slot (or clear it if it already is).
                  Visually distinct sparkle/purple styling so it never gets
                  confused with the green Equip / red Unequip stat actions.
                  Independent of equip state by design (a user can set a
                  cosmetic for a slot they have nothing equipped in). */}
              <button
                className={cn(
                  "w-full font-pixel text-[9px] py-1 border transition-all",
                  "hover:brightness-125 active:translate-y-px disabled:opacity-40",
                  inv.equippedAsCosmetic
                    ? "border-[#d060f0] text-[#e0a0ff] bg-[#d060f0]/15 hover:bg-[#d060f0]/25"
                    : "border-[#d060f0]/40 text-[#d060f0]/80 bg-[#d060f0]/5 hover:bg-[#d060f0]/10 hover:text-[#e0a0ff]"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  if (cosmeticToggling) return
                  onToggleCosmetic(
                    inv.inventoryId,
                    inv.equippedAsCosmetic ? "clear" : "set",
                  )
                }}
                disabled={cosmeticToggling}
                title={
                  inv.equippedAsCosmetic
                    ? "Remove as cosmetic — slot will show your equipped item again"
                    : "Set as cosmetic — slot will show this item visually while keeping your equipped item's stats"
                }
              >
                {cosmeticToggling
                  ? "..."
                  : inv.equippedAsCosmetic
                    ? "\u2728 Remove Cosmetic"
                    : `\u2728 Set as Cosmetic \u2192 ${slot}`}
              </button>
              {/* --- END AI-MODIFIED --- */}
            </div>
          )}
          {/* --- END AI-MODIFIED --- */}

          {/* Scroll "Use in Enhancement" Button */}
          {isScrollsTab && (
            <div className="px-2 pb-1.5 mt-auto">
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
        {/* --- END AI-MODIFIED --- */}
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
  // --- AI-MODIFIED (2026-04-24) ---
  // Purpose: Cosmetic overlay support — `equipment` is the merged display
  // map, `equipmentRaw` is the actual stat-bearing equipment, and
  // `cosmetics` is the per-slot visual override. `cosmeticsEnabled` mirrors
  // the per-pet master toggle.
  equipmentRaw,
  cosmetics,
  cosmeticsEnabled,
  // --- END AI-MODIFIED ---
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
  // --- AI-MODIFIED (2026-04-24) ---
  equipmentRaw?: Record<string, { name: string; category: string; rarity: string; assetPath: string; glowTier?: string; glowIntensity?: number }>
  cosmetics?: Record<string, { name: string; category: string; rarity: string; assetPath: string }>
  cosmeticsEnabled?: boolean
  // --- END AI-MODIFIED ---
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

      {/* --- AI-MODIFIED (2026-04-10) --- */}
      {/* Purpose: Empty equipment state with marketplace link */}
      {!hasEquipment ? (
        <div className="py-2 space-y-2">
          <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] italic">
            No equipment worn. Equip items to arrange their layers.
          </p>
          <button
            onClick={() => router.push("/pet/marketplace")}
            className="w-full font-pixel text-[9px] py-1 border border-[#4080f0]/30 text-[#80b0ff] bg-[#4080f0]/5 hover:bg-[#4080f0]/10 transition-colors"
          >
            Find items on Marketplace {"\u2192"}
          </button>
        </div>
      ) : (
      // --- END AI-MODIFIED ---
        <div className="space-y-1">
          {/* BACK is always behind the lion */}
          {backItem && (
            <div className="mb-1">
              <p className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] uppercase mb-0.5 flex items-center gap-1">
                <span>{"\u{1F512}"}</span> Behind Lion
              </p>
              {/* --- AI-MODIFIED (2026-04-24) ---
                  Purpose: Surface cosmetic overlay state on the BACK slot
                  too, since back items are the most visually prominent. */}
              <RenderStackRow
                slot="BACK"
                item={backItem}
                isSelected={selectedSlot === "BACK"}
                isDragging={false}
                isOver={false}
                locked
                onClick={() => onSelectSlot(selectedSlot === "BACK" ? null : "BACK")}
                onUnequip={() => onUnequipSlot("BACK")}
                isCosmetic={!!(cosmeticsEnabled && cosmetics?.["BACK"])}
                statItemName={equipmentRaw?.["BACK"]?.name}
              />
              {/* --- END AI-MODIFIED --- */}
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
                  {/* --- AI-MODIFIED (2026-04-24) ---
                      Purpose: Per-slot cosmetic indicator. The slot is
                      "showing a cosmetic" only if the master toggle is on
                      AND there's a cosmetic row for this slot. We pass
                      both flags so the row can render a small purple
                      sparkle badge with a tooltip explaining what's
                      visible vs what's giving stats. */}
                  <RenderStackRow
                    slot={slot}
                    item={item}
                    isSelected={selectedSlot === slot}
                    isDragging={dragIdx === idx}
                    isOver={overIdx === idx && dragIdx !== idx}
                    onClick={() => onSelectSlot(selectedSlot === slot ? null : slot)}
                    onUnequip={() => onUnequipSlot(slot)}
                    isCosmetic={!!(cosmeticsEnabled && cosmetics?.[slot])}
                    statItemName={equipmentRaw?.[slot]?.name}
                  />
                  {/* --- END AI-MODIFIED --- */}
                </div>
              )
            })}
          </div>

          {/* Direction legend */}
          <div className="flex items-center justify-between pt-1 text-[8px] font-pixel text-[#5a6a7c]">
            <span>{"\u2191"} Front</span>
            <span>{"\u2193"} Back</span>
          </div>

          {/* --- AI-MODIFIED (2026-04-10) --- */}
          {/* Purpose: Show marketplace link for empty equipment slots */}
          {Object.keys(equipment).length < 5 && (() => {
            const emptySlots = EQUIP_SLOTS.filter(s => !equipment[s])
            return (
              <div className="mt-2 pt-2 border-t border-[#1a2a3c]/50">
                <p className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] mb-1">
                  Empty: {emptySlots.map(s => `${SLOT_ICONS[s]} ${s}`).join(", ")}
                </p>
                <button
                  onClick={() => router.push(`/pet/marketplace?cat=${SLOT_TO_CATEGORY[emptySlots[0]] || ""}`)}
                  className="w-full font-pixel text-[9px] py-1 border border-[#4080f0]/30 text-[#80b0ff] bg-[#4080f0]/5 hover:bg-[#4080f0]/10 transition-colors"
                >
                  Find items on Marketplace {"\u2192"}
                </button>
              </div>
            )
          })()}
          {/* --- END AI-MODIFIED --- */}
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
  // --- AI-MODIFIED (2026-04-24) ---
  // Purpose: Cosmetic overlay indicator support. `isCosmetic` is true when
  // this slot's currently-rendered item comes from lg_pet_cosmetics rather
  // than lg_pet_equipment. `statItemName` is the underlying stat-bearing
  // item (if any) so the tooltip can spell out the visual-vs-stat split.
  isCosmetic,
  statItemName,
  // --- END AI-MODIFIED ---
}: {
  slot: string
  item: { name: string; category: string; rarity: string; assetPath: string }
  isSelected: boolean
  isDragging: boolean
  isOver: boolean
  locked?: boolean
  onClick: () => void
  onUnequip: () => void
  // --- AI-MODIFIED (2026-04-24) ---
  isCosmetic?: boolean
  statItemName?: string
  // --- END AI-MODIFIED ---
}) {
  const imgUrl = getItemImageUrl(item.assetPath, item.category)
  const accent = RARITY_ACCENT[item.rarity] || RARITY_ACCENT.COMMON
  // --- AI-MODIFIED (2026-04-24) ---
  // Purpose: Pre-compute the tooltip text so the JSX stays clean. Two
  // variants: stat slot is empty vs stat slot has a different item.
  const cosmeticTooltip = isCosmetic
    ? statItemName && statItemName !== item.name
      ? `Showing cosmetic: ${item.name}\nStats from: ${statItemName}`
      : `Showing cosmetic: ${item.name}\nNo stat item equipped in this slot`
    : undefined
  // --- END AI-MODIFIED ---

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
      <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center my-0.5 relative">
        {imgUrl ? (
          <CroppedItemImage src={imgUrl} alt={item.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-xs">{SLOT_ICONS[slot] || "\u{1F4E6}"}</span>
        )}
        {/* --- AI-MODIFIED (2026-04-24) ---
            Purpose: Tiny purple sparkle in the corner of the slot portrait
            so users can see at a glance which slots are wearing a cosmetic
            instead of their stat gear. The full text is on the row title
            below so screen readers don't repeat it. */}
        {isCosmetic && (
          <span
            className="absolute -top-0.5 -right-0.5 font-pixel text-[8px] text-[#e0a0ff] leading-none drop-shadow-[0_0_2px_rgba(208,96,240,0.8)] pointer-events-none"
            aria-hidden
          >
            {"\u2728"}
          </span>
        )}
        {/* --- END AI-MODIFIED --- */}
      </div>
      <div className="flex-1 min-w-0 py-1 pr-1" title={cosmeticTooltip}>
        <div className="flex items-center gap-1">
          <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">{SLOT_ICONS[slot]}</span>
          <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] uppercase">{slot}</span>
          {/* --- AI-MODIFIED (2026-04-24) ---
              Purpose: Inline COS pill on cosmetic-overlaid slots. Sits
              before the rarity badge so the visual-vs-stat split is the
              first thing the user sees on this row. */}
          {isCosmetic && (
            <span
              className="font-pixel text-[7px] px-1 py-0 border border-[#d060f0]/60 text-[#e0a0ff] bg-[#d060f0]/10"
              title={cosmeticTooltip}
            >
              COS
            </span>
          )}
          {/* --- END AI-MODIFIED --- */}
          <PixelBadge rarity={item.rarity} className="text-[7px] px-0.5 py-0 ml-auto" />
        </div>
        <p className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate">{item.name}</p>
        {/* --- AI-MODIFIED (2026-04-24) ---
            Purpose: When showing a cosmetic that's hiding a different
            stat item, surface the stat item name underneath in a dim
            font so users always know what's actually giving them stats
            without having to hover for the tooltip. */}
        {isCosmetic && statItemName && statItemName !== item.name && (
          <p className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] truncate">
            stats: {statItemName}
          </p>
        )}
        {/* --- END AI-MODIFIED --- */}
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
