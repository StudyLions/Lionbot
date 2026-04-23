// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-10
// Purpose: Auto-equip the best item per slot based on total
//          enhancement bonus, with rarity as tiebreaker.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const EQUIPMENT_CATEGORIES = ["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS"]

const CATEGORY_TO_SLOT: Record<string, string> = {
  HAT: "HEAD",
  GLASSES: "FACE",
  COSTUME: "BODY",
  SHIRT: "BODY",
  WINGS: "BACK",
  BOOTS: "FEET",
}

const RARITY_ORDER: Record<string, number> = {
  COMMON: 0, UNCOMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, MYTHICAL: 5,
}

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const invItems = await prisma.lg_user_inventory.findMany({
      where: {
        userid: userId,
        lg_items: { category: { in: EQUIPMENT_CATEGORIES as any } },
      },
      select: {
        inventoryid: true,
        // --- AI-MODIFIED (2026-04-23) ---
        // Purpose: Need is_locked to (a) skip locked unequipped items as
        // candidates and (b) detect when a locked item already occupies
        // the slot and should not be replaced.
        is_locked: true,
        // --- END AI-MODIFIED ---
        lg_items: {
          select: { itemid: true, name: true, category: true, slot: true, rarity: true, asset_path: true },
        },
        lg_enhancement_slots: {
          select: { bonus_value: true },
        },
      },
    })

    // --- AI-MODIFIED (2026-04-23) ---
    // Purpose: Determine which slots are currently occupied by a locked item.
    // We skip those slots entirely so Equip Best never swaps a locked item out.
    const currentEquipped = await prisma.lg_pet_equipment.findMany({
      where: { userid: userId },
      select: { slot: true, itemid: true },
    })
    const lockedItemIds = new Set(
      invItems.filter((inv) => inv.is_locked).map((inv) => inv.lg_items.itemid)
    )
    const lockedSlots = new Set(
      currentEquipped
        .filter((e) => lockedItemIds.has(e.itemid))
        .map((e) => String(e.slot))
    )
    // --- END AI-MODIFIED ---

    const bestBySlot: Record<string, { itemid: number; totalBonus: number; rarityRank: number }> = {}

    for (const inv of invItems) {
      const slot = inv.lg_items.slot || CATEGORY_TO_SLOT[inv.lg_items.category]
      if (!slot) continue
      // --- AI-MODIFIED (2026-04-23) ---
      // Purpose: Skip locked candidates (won't be auto-equipped) and skip
      // any slot already occupied by a locked item (won't be replaced).
      if (inv.is_locked) continue
      if (lockedSlots.has(slot)) continue
      // --- END AI-MODIFIED ---

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
      // --- AI-MODIFIED (2026-04-23) ---
      // Purpose: Slightly more helpful error when every candidate slot is
      // already filled by a locked item.
      const message = lockedSlots.size > 0
        ? "No unlocked equipment to auto-equip — your locked items are protected."
        : "No equippable items found in inventory"
      return res.status(400).json({ error: message })
      // --- END AI-MODIFIED ---
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
        lg_items: {
          select: { itemid: true, name: true, category: true, rarity: true, asset_path: true },
        },
      },
    })

    const equipmentMap: Record<string, any> = {}
    for (const e of equipment) {
      equipmentMap[e.slot] = {
        id: e.lg_items.itemid,
        name: e.lg_items.name,
        category: e.lg_items.category,
        rarity: e.lg_items.rarity,
        assetPath: e.lg_items.asset_path,
      }
    }

    return res.status(200).json({
      success: true,
      equipped: slotsToEquip.length,
      equipment: equipmentMap,
    })
  },
})
