// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: Set / clear a "cosmetic overlay" item per slot. Mirrors the
//          shape of pages/api/pet/inventory/equip.ts but writes to the
//          lg_pet_cosmetics table -- a parallel visual-only layer that
//          the renderer overlays on top of lg_pet_equipment.
//
//          IMPORTANT: this route NEVER touches stat-bearing equipment
//          rows. Bonuses still come exclusively from lg_pet_equipment +
//          lg_user_inventory + lg_enhancement_slots, so changing a
//          cosmetic has zero effect on gold/XP/drop multipliers.
//
//          Migration: prisma/migrations/manual_2026_04_24_pet_cosmetics.sql
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
      action: "set" | "clear"
      slot?: string
    }

    if (!["set", "clear"].includes(action)) {
      return res.status(400).json({ error: "action (set|clear) required" })
    }

    if (action === "clear" && rawSlot && !inventoryId) {
      const existing = await prisma.lg_pet_cosmetics.findUnique({
        where: { userid_slot: { userid: userId, slot: rawSlot as any } },
      })
      if (!existing) {
        return res.status(400).json({ error: "No cosmetic set in that slot" })
      }
      await prisma.lg_pet_cosmetics.delete({
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
        return res.status(400).json({ error: "Only equipment items can be used as cosmetics" })
      }

      const slot = invItem.lg_items.slot || CATEGORY_TO_SLOT[invItem.lg_items.category]
      if (!slot) {
        return res.status(400).json({ error: "Unknown equipment slot for this item category" })
      }

      if (action === "set") {
        await prisma.lg_pet_cosmetics.upsert({
          where: { userid_slot: { userid: userId, slot: slot as any } },
          create: {
            userid: userId,
            slot: slot as any,
            itemid: invItem.lg_items.itemid,
          },
          update: {
            itemid: invItem.lg_items.itemid,
            set_at: new Date(),
          },
        })
      } else {
        const current = await prisma.lg_pet_cosmetics.findUnique({
          where: { userid_slot: { userid: userId, slot: slot as any } },
        })

        if (!current || current.itemid !== invItem.lg_items.itemid) {
          return res.status(400).json({ error: "This item is not currently set as a cosmetic" })
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

    const cosmeticsMap: Record<string, any> = {}
    for (const c of cosmetics) {
      cosmeticsMap[c.slot] = {
        id: c.lg_items.itemid,
        name: c.lg_items.name,
        category: c.lg_items.category,
        rarity: c.lg_items.rarity,
        assetPath: c.lg_items.asset_path,
      }
    }

    return res.status(200).json({ success: true, cosmetics: cosmeticsMap })
  },
})
