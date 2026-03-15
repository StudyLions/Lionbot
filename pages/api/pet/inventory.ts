// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet inventory API - list user items with filters
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const EQUIPMENT_CATEGORIES = ["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS"]

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const filter = (req.query.filter as string) || "all"

    let categoryFilter: object | undefined
    if (filter === "equipment") {
      categoryFilter = { lg_items: { category: { in: EQUIPMENT_CATEGORIES as any } } }
    } else if (filter === "materials") {
      categoryFilter = { lg_items: { category: "MATERIAL" as any } }
    } else if (filter === "scrolls") {
      categoryFilter = { lg_items: { category: "SCROLL" as any } }
    }

    const items = await prisma.lg_user_inventory.findMany({
      where: { userid: userId, ...categoryFilter },
      select: {
        inventoryid: true,
        quantity: true,
        enhancement_level: true,
        source: true,
        acquired_at: true,
        lg_items: {
          select: {
            itemid: true,
            name: true,
            category: true,
            slot: true,
            rarity: true,
            description: true,
            asset_path: true,
          },
        },
      },
      orderBy: [{ lg_items: { rarity: "desc" } }, { lg_items: { name: "asc" } }],
    })

    const equipped = await prisma.lg_pet_equipment.findMany({
      where: { userid: userId },
      select: { slot: true, itemid: true },
    })
    const equippedItemIds = new Set(equipped.map((e) => e.itemid))

    const result = items.map((inv) => ({
      inventoryId: inv.inventoryid,
      quantity: inv.quantity,
      enhancementLevel: inv.enhancement_level,
      source: inv.source,
      acquiredAt: inv.acquired_at.toISOString(),
      equipped: equippedItemIds.has(inv.lg_items.itemid),
      item: {
        id: inv.lg_items.itemid,
        name: inv.lg_items.name,
        category: inv.lg_items.category,
        slot: inv.lg_items.slot,
        rarity: inv.lg_items.rarity,
        description: inv.lg_items.description,
        assetPath: inv.lg_items.asset_path,
      },
    }))

    const counts = {
      equipment: await prisma.lg_user_inventory.count({
        where: { userid: userId, lg_items: { category: { in: EQUIPMENT_CATEGORIES as any } } },
      }),
      materials: await prisma.lg_user_inventory.count({
        where: { userid: userId, lg_items: { category: "MATERIAL" as any } },
      }),
      scrolls: await prisma.lg_user_inventory.count({
        where: { userid: userId, lg_items: { category: "SCROLL" as any } },
      }),
    }

    return res.status(200).json({ items: result, counts })
  },
})
