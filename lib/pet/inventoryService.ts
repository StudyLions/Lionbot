// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-02
// Purpose: Shared, transport-agnostic inventory + equipment logic —
//          the ONE validated path used by BOTH the website
//          (pages/api/pet/inventory*.ts, NextAuth cookie) and the Anki
//          addon (pages/api/anki/pet/inventory*.ts, bearer). Pure
//          server-side, fully user-scoped (no IDOR): every query is
//          keyed by the passed userId.
//
//          listInventory(userId, filter) -> { items, counts }
//          equipItem(userId, params)      -> { success, equipment }
// ============================================================
import { prisma } from "@/utils/prisma"
import { PetServiceError } from "@/lib/pet/careService"
import { calcGlowTier, calcGlowIntensity, GAME_CONSTANTS } from "@/utils/gameConstants"

export const EQUIPMENT_CATEGORIES = ["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS"]

const CATEGORY_TO_SLOT: Record<string, string> = {
  HAT: "HEAD",
  GLASSES: "FACE",
  COSTUME: "BODY",
  SHIRT: "BODY",
  WINGS: "BACK",
  BOOTS: "FEET",
}

export type InventoryFilter = "all" | "equipment" | "scrolls" | "favorites"

export async function listInventory(userId: bigint, filter: string) {
  let categoryFilter: object | undefined
  if (filter === "equipment") {
    categoryFilter = { lg_items: { category: { in: EQUIPMENT_CATEGORIES as any } } }
  } else if (filter === "scrolls") {
    categoryFilter = { lg_items: { category: "SCROLL" as any } }
  } else if (filter === "favorites") {
    categoryFilter = { is_locked: true }
  }

  const items = await prisma.lg_user_inventory.findMany({
    where: { userid: userId, ...categoryFilter },
    select: {
      inventoryid: true,
      quantity: true,
      enhancement_level: true,
      source: true,
      acquired_at: true,
      is_locked: true,
      lg_items: {
        select: {
          itemid: true,
          name: true,
          category: true,
          slot: true,
          rarity: true,
          description: true,
          asset_path: true,
          tradeable: true,
        },
      },
      lg_enhancement_slots: {
        select: {
          slot_number: true,
          scroll_name: true,
          bonus_value: true,
          enhanced_at: true,
          scroll_itemid: true,
        },
        orderBy: { slot_number: "asc" },
      },
    },
    orderBy: [{ lg_items: { rarity: "desc" } }, { lg_items: { name: "asc" } }],
  })

  const scrollItemIds = new Set<number>()
  for (const inv of items) {
    for (const s of inv.lg_enhancement_slots) scrollItemIds.add(s.scroll_itemid)
  }
  const scrollProps =
    scrollItemIds.size > 0
      ? await prisma.lg_scroll_properties.findMany({
          where: { itemid: { in: Array.from(scrollItemIds) } },
          select: { itemid: true, success_rate: true, destroy_rate: true, bonus_value: true },
        })
      : []
  const scrollPropsMap = new Map(scrollProps.map((s) => [s.itemid, s]))

  const equipped = await prisma.lg_pet_equipment.findMany({
    where: { userid: userId },
    select: { slot: true, itemid: true },
  })
  const equippedItemIds = new Set(equipped.map((e) => e.itemid))

  const cosmetic = await prisma.lg_pet_cosmetics.findMany({
    where: { userid: userId },
    select: { slot: true, itemid: true },
  })
  const cosmeticItemIds = new Set(cosmetic.map((c) => c.itemid))

  const result = items.map((inv) => {
    const totalBonus = inv.lg_enhancement_slots.reduce((sum, s) => sum + s.bonus_value, 0)
    const maxLevel =
      GAME_CONSTANTS.MAX_ENHANCEMENT_BY_RARITY[inv.lg_items.rarity] ?? 5
    const slots = inv.lg_enhancement_slots.map((s) => ({
      slotNumber: s.slot_number,
      scrollName: s.scroll_name,
      bonusValue: s.bonus_value,
      enhancedAt: s.enhanced_at.toISOString(),
      successRate: scrollPropsMap.get(s.scroll_itemid)?.success_rate ?? null,
    }))
    return {
      inventoryId: inv.inventoryid,
      quantity: inv.quantity,
      enhancementLevel: inv.enhancement_level,
      maxLevel,
      source: inv.source,
      acquiredAt: inv.acquired_at.toISOString(),
      equipped: equippedItemIds.has(inv.lg_items.itemid),
      equippedAsCosmetic: cosmeticItemIds.has(inv.lg_items.itemid),
      totalBonus,
      glowTier: calcGlowTier(inv.enhancement_level, totalBonus),
      glowIntensity: calcGlowIntensity(inv.enhancement_level),
      slots,
      isLocked: inv.is_locked,
      item: {
        id: inv.lg_items.itemid,
        name: inv.lg_items.name,
        category: inv.lg_items.category,
        slot: inv.lg_items.slot,
        rarity: inv.lg_items.rarity,
        description: inv.lg_items.description,
        assetPath: inv.lg_items.asset_path,
        tradeable: inv.lg_items.tradeable,
      },
    }
  })

  const [equipment, scrolls, favorites] = await Promise.all([
    prisma.lg_user_inventory.count({
      where: { userid: userId, lg_items: { category: { in: EQUIPMENT_CATEGORIES as any } } },
    }),
    prisma.lg_user_inventory.count({
      where: { userid: userId, lg_items: { category: "SCROLL" as any } },
    }),
    prisma.lg_user_inventory.count({ where: { userid: userId, is_locked: true } }),
  ])

  return { items: result, counts: { equipment, scrolls, favorites } }
}

export interface EquipParams {
  inventoryId?: number
  action?: string
  slot?: string
}

export async function equipItem(userId: bigint, params: EquipParams) {
  const { inventoryId, action, slot: rawSlot } = params
  if (action !== "equip" && action !== "unequip") {
    throw new PetServiceError(400, "bad_action", "action (equip|unequip) required")
  }

  if (action === "unequip" && rawSlot && !inventoryId) {
    const existing = await prisma.lg_pet_equipment.findUnique({
      where: { userid_slot: { userid: userId, slot: rawSlot as any } },
    })
    if (!existing) {
      throw new PetServiceError(400, "nothing_equipped", "Nothing equipped in that slot")
    }
    await prisma.lg_pet_equipment.delete({
      where: { userid_slot: { userid: userId, slot: rawSlot as any } },
    })
  } else {
    if (!inventoryId) {
      throw new PetServiceError(400, "inventory_id_required", "inventoryId required")
    }
    const invItem = await prisma.lg_user_inventory.findFirst({
      where: { inventoryid: inventoryId, userid: userId },
      include: { lg_items: true },
    })
    if (!invItem) {
      throw new PetServiceError(404, "item_not_found", "Item not found in inventory")
    }
    if (!EQUIPMENT_CATEGORIES.includes(invItem.lg_items.category)) {
      throw new PetServiceError(400, "not_equipment", "Only equipment items can be equipped")
    }
    const slot = invItem.lg_items.slot || CATEGORY_TO_SLOT[invItem.lg_items.category]
    if (!slot) {
      throw new PetServiceError(400, "unknown_slot", "Unknown equipment slot for this item category")
    }
    if (action === "equip") {
      await prisma.lg_pet_equipment.upsert({
        where: { userid_slot: { userid: userId, slot: slot as any } },
        create: { userid: userId, slot: slot as any, itemid: invItem.lg_items.itemid },
        update: { itemid: invItem.lg_items.itemid },
      })
    } else {
      const current = await prisma.lg_pet_equipment.findUnique({
        where: { userid_slot: { userid: userId, slot: slot as any } },
      })
      if (!current || current.itemid !== invItem.lg_items.itemid) {
        throw new PetServiceError(400, "not_equipped", "This item is not currently equipped")
      }
      await prisma.lg_pet_equipment.delete({
        where: { userid_slot: { userid: userId, slot: slot as any } },
      })
    }
  }

  const equipment = await prisma.lg_pet_equipment.findMany({
    where: { userid: userId },
    select: {
      slot: true,
      lg_items: {
        select: { itemid: true, name: true, category: true, rarity: true, asset_path: true },
      },
    },
  })
  const equipmentMap: Record<string, unknown> = {}
  for (const e of equipment) {
    equipmentMap[e.slot] = {
      id: e.lg_items.itemid,
      name: e.lg_items.name,
      category: e.lg_items.category,
      rarity: e.lg_items.rarity,
      assetPath: e.lg_items.asset_path,
    }
  }
  return { success: true, equipment: equipmentMap }
}

// --- AI-MODIFIED (2026-06-04) ---
// Extracted from pages/api/pet/inventory/{equip-best,lock,cosmetic}.ts so
// the Anki bearer routes share the SAME validated, user-scoped logic.
// (The web routes are now thin adapters that delegate here.)

const RARITY_ORDER: Record<string, number> = {
  COMMON: 0, UNCOMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, MYTHICAL: 5,
}

/** Auto-equip the best item per slot (max total enhancement bonus, rarity
 *  tiebreak). Locked items are never auto-equipped, and a slot already
 *  filled by a locked item is left untouched. Server-authoritative. */
export async function equipBestItems(userId: bigint) {
  const invItems = await prisma.lg_user_inventory.findMany({
    where: { userid: userId, lg_items: { category: { in: EQUIPMENT_CATEGORIES as any } } },
    select: {
      inventoryid: true,
      is_locked: true,
      lg_items: {
        select: { itemid: true, name: true, category: true, slot: true, rarity: true, asset_path: true },
      },
      lg_enhancement_slots: { select: { bonus_value: true } },
    },
  })

  const currentEquipped = await prisma.lg_pet_equipment.findMany({
    where: { userid: userId },
    select: { slot: true, itemid: true },
  })
  const lockedItemIds = new Set(
    invItems.filter((inv) => inv.is_locked).map((inv) => inv.lg_items.itemid)
  )
  const lockedSlots = new Set(
    currentEquipped.filter((e) => lockedItemIds.has(e.itemid)).map((e) => String(e.slot))
  )

  const bestBySlot: Record<string, { itemid: number; totalBonus: number; rarityRank: number }> = {}
  for (const inv of invItems) {
    const slot = inv.lg_items.slot || CATEGORY_TO_SLOT[inv.lg_items.category]
    if (!slot) continue
    if (inv.is_locked) continue
    if (lockedSlots.has(slot)) continue
    const totalBonus = inv.lg_enhancement_slots.reduce((sum, s) => sum + s.bonus_value, 0)
    const rarityRank = RARITY_ORDER[inv.lg_items.rarity] ?? 0
    const current = bestBySlot[slot]
    if (
      !current ||
      totalBonus > current.totalBonus ||
      (totalBonus === current.totalBonus && rarityRank > current.rarityRank)
    ) {
      bestBySlot[slot] = { itemid: inv.lg_items.itemid, totalBonus, rarityRank }
    }
  }

  const slotsToEquip = Object.entries(bestBySlot)
  if (slotsToEquip.length === 0) {
    const message =
      lockedSlots.size > 0
        ? "No unlocked equipment to auto-equip — your locked items are protected."
        : "No equippable items found in inventory"
    throw new PetServiceError(400, "no_equippable", message)
  }

  await prisma.$transaction(
    slotsToEquip.map(([slot, { itemid }]) =>
      prisma.lg_pet_equipment.upsert({
        where: { userid_slot: { userid: userId, slot: slot as any } },
        create: { userid: userId, slot: slot as any, itemid },
        update: { itemid },
      })
    )
  )

  const equipment = await prisma.lg_pet_equipment.findMany({
    where: { userid: userId },
    select: {
      slot: true,
      lg_items: { select: { itemid: true, name: true, category: true, rarity: true, asset_path: true } },
    },
  })
  const equipmentMap: Record<string, unknown> = {}
  for (const e of equipment) {
    equipmentMap[e.slot] = {
      id: e.lg_items.itemid,
      name: e.lg_items.name,
      category: e.lg_items.category,
      rarity: e.lg_items.rarity,
      assetPath: e.lg_items.asset_path,
    }
  }
  return { success: true, equipped: slotsToEquip.length, equipment: equipmentMap }
}

/** Lock / unlock (favorite) a single inventory row. Locked items are hidden
 *  from sell pickers and blocked from gift/enhance. Ownership enforced. */
export async function setItemLock(
  userId: bigint,
  rawInventoryId: unknown,
  rawLocked: unknown
) {
  const inventoryId = Math.floor(Number(rawInventoryId))
  if (!Number.isFinite(inventoryId) || inventoryId < 1) {
    throw new PetServiceError(400, "bad_inventory_id", "inventoryId must be a positive integer")
  }
  if (typeof rawLocked !== "boolean") {
    throw new PetServiceError(400, "bad_locked", "locked must be true or false")
  }
  const existing = await prisma.lg_user_inventory.findFirst({
    where: { inventoryid: inventoryId, userid: userId },
    select: { inventoryid: true, is_locked: true },
  })
  if (!existing) {
    throw new PetServiceError(404, "item_not_found", "Item not found in your inventory")
  }
  if (existing.is_locked === rawLocked) {
    return { success: true, inventoryId, isLocked: rawLocked, unchanged: true }
  }
  // Re-scope the write to (inventoryid, userid) — defence-in-depth so the
  // mutation can never touch a row the caller doesn't own.
  await prisma.lg_user_inventory.updateMany({
    where: { inventoryid: inventoryId, userid: userId },
    data: { is_locked: rawLocked },
  })
  return { success: true, inventoryId, isLocked: rawLocked }
}

export interface CosmeticParams {
  inventoryId?: number
  action?: string
  slot?: string
}

/** Set / clear a cosmetic-overlay item per slot (lg_pet_cosmetics). NEVER
 *  touches stat-bearing lg_pet_equipment — purely visual, zero economy
 *  effect. Returns the full cosmetics map. */
export async function setCosmetic(userId: bigint, params: CosmeticParams) {
  const { inventoryId, action, slot: rawSlot } = params
  if (action !== "set" && action !== "clear") {
    throw new PetServiceError(400, "bad_action", "action (set|clear) required")
  }

  if (action === "clear" && rawSlot && !inventoryId) {
    const existing = await prisma.lg_pet_cosmetics.findUnique({
      where: { userid_slot: { userid: userId, slot: rawSlot as any } },
    })
    if (!existing) {
      throw new PetServiceError(400, "nothing_set", "No cosmetic set in that slot")
    }
    await prisma.lg_pet_cosmetics.delete({
      where: { userid_slot: { userid: userId, slot: rawSlot as any } },
    })
  } else {
    if (!inventoryId) {
      throw new PetServiceError(400, "inventory_id_required", "inventoryId required")
    }
    const invItem = await prisma.lg_user_inventory.findFirst({
      where: { inventoryid: inventoryId, userid: userId },
      include: { lg_items: true },
    })
    if (!invItem) {
      throw new PetServiceError(404, "item_not_found", "Item not found in inventory")
    }
    if (!EQUIPMENT_CATEGORIES.includes(invItem.lg_items.category)) {
      throw new PetServiceError(400, "not_equipment", "Only equipment items can be used as cosmetics")
    }
    const slot = invItem.lg_items.slot || CATEGORY_TO_SLOT[invItem.lg_items.category]
    if (!slot) {
      throw new PetServiceError(400, "unknown_slot", "Unknown equipment slot for this item category")
    }
    if (action === "set") {
      await prisma.lg_pet_cosmetics.upsert({
        where: { userid_slot: { userid: userId, slot: slot as any } },
        create: { userid: userId, slot: slot as any, itemid: invItem.lg_items.itemid },
        update: { itemid: invItem.lg_items.itemid, set_at: new Date() },
      })
    } else {
      const current = await prisma.lg_pet_cosmetics.findUnique({
        where: { userid_slot: { userid: userId, slot: slot as any } },
      })
      if (!current || current.itemid !== invItem.lg_items.itemid) {
        throw new PetServiceError(400, "not_cosmetic", "This item is not currently set as a cosmetic")
      }
      await prisma.lg_pet_cosmetics.delete({
        where: { userid_slot: { userid: userId, slot: slot as any } },
      })
    }
  }

  const cosmetics = await prisma.lg_pet_cosmetics.findMany({
    where: { userid: userId },
    select: {
      slot: true,
      lg_items: { select: { itemid: true, name: true, category: true, rarity: true, asset_path: true } },
    },
  })
  const cosmeticsMap: Record<string, unknown> = {}
  for (const c of cosmetics) {
    cosmeticsMap[c.slot] = {
      id: c.lg_items.itemid,
      name: c.lg_items.name,
      category: c.lg_items.category,
      rarity: c.lg_items.rarity,
      assetPath: c.lg_items.asset_path,
    }
  }
  return { success: true, cosmetics: cosmeticsMap }
}
// --- END AI-MODIFIED ---
