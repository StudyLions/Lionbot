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
