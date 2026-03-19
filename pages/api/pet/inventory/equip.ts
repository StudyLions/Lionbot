// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Equip/unequip pet equipment from inventory
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

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { inventoryId, action, slot: rawSlot } = req.body as {
      inventoryId?: number
      action: "equip" | "unequip"
      slot?: string
    }

    if (!["equip", "unequip"].includes(action)) {
      return res.status(400).json({ error: "action (equip|unequip) required" })
    }

    if (action === "unequip" && rawSlot && !inventoryId) {
      const existing = await prisma.lg_pet_equipment.findUnique({
        where: { userid_slot: { userid: userId, slot: rawSlot as any } },
      })
      if (!existing) {
        return res.status(400).json({ error: "Nothing equipped in that slot" })
      }
      await prisma.lg_pet_equipment.delete({
        where: { userid_slot: { userid: userId, slot: rawSlot as any } },
      })
    } else {
      if (!inventoryId) {
        return res.status(400).json({ error: "inventoryId required" })
      }

      const invItem = await prisma.lg_user_inventory.findFirst({
        where: { inventoryid: inventoryId, userid: userId },
        include: { lg_items: true },
      })

      if (!invItem) {
        return res.status(404).json({ error: "Item not found in inventory" })
      }

      if (!EQUIPMENT_CATEGORIES.includes(invItem.lg_items.category)) {
        return res.status(400).json({ error: "Only equipment items can be equipped" })
      }

      const slot = CATEGORY_TO_SLOT[invItem.lg_items.category]
      if (!slot) {
        return res.status(400).json({ error: "Unknown equipment slot for this item category" })
      }

      if (action === "equip") {
        await prisma.lg_pet_equipment.upsert({
          where: { userid_slot: { userid: userId, slot: slot as any } },
          create: {
            userid: userId,
            slot: slot as any,
            itemid: invItem.lg_items.itemid,
          },
          update: {
            itemid: invItem.lg_items.itemid,
          },
        })
      } else {
        const current = await prisma.lg_pet_equipment.findUnique({
          where: { userid_slot: { userid: userId, slot: slot as any } },
        })

        if (!current || current.itemid !== invItem.lg_items.itemid) {
          return res.status(400).json({ error: "This item is not currently equipped" })
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
          select: {
            itemid: true,
            name: true,
            category: true,
            rarity: true,
            asset_path: true,
          },
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

    return res.status(200).json({ success: true, equipment: equipmentMap })
  },
})
