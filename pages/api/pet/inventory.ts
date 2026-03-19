// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet inventory API - list user items with filters
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
// --- AI-MODIFIED (2026-03-19) ---
// Purpose: Include glow tier calculation and game constants for max enhancement levels
import { calcGlowTier, calcGlowIntensity, GAME_CONSTANTS } from "@/utils/gameConstants"

const EQUIPMENT_CATEGORIES = ["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS"]
// --- END AI-MODIFIED ---

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const filter = (req.query.filter as string) || "all"

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Materials filter removed (materials no longer exist)
    let categoryFilter: object | undefined
    if (filter === "equipment") {
      categoryFilter = { lg_items: { category: { in: EQUIPMENT_CATEGORIES as any } } }
    } else if (filter === "scrolls") {
      categoryFilter = { lg_items: { category: "SCROLL" as any } }
    }
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-19) ---
    // Purpose: Include full enhancement slot trace with scroll properties for tooltip display
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
      for (const s of inv.lg_enhancement_slots) {
        scrollItemIds.add(s.scroll_itemid)
      }
    }
    const scrollProps = scrollItemIds.size > 0
      ? await prisma.lg_scroll_properties.findMany({
          where: { itemid: { in: Array.from(scrollItemIds) } },
          select: { itemid: true, success_rate: true, destroy_rate: true, bonus_value: true },
        })
      : []
    const scrollPropsMap = new Map(scrollProps.map((s) => [s.itemid, s]))
    // --- END AI-MODIFIED ---

    const equipped = await prisma.lg_pet_equipment.findMany({
      where: { userid: userId },
      select: { slot: true, itemid: true },
    })
    const equippedItemIds = new Set(equipped.map((e) => e.itemid))

    // --- AI-MODIFIED (2026-03-19) ---
    // Purpose: Include full scroll trace, glow tier, max level, and scroll success rates
    const result = items.map((inv) => {
      const totalBonus = inv.lg_enhancement_slots.reduce((sum, s) => sum + s.bonus_value, 0)
      const maxLevel = GAME_CONSTANTS.MAX_ENHANCEMENT_BY_RARITY[inv.lg_items.rarity] ?? 5

      const slots = inv.lg_enhancement_slots.map((s) => {
        const props = scrollPropsMap.get(s.scroll_itemid)
        return {
          slotNumber: s.slot_number,
          scrollName: s.scroll_name,
          bonusValue: s.bonus_value,
          enhancedAt: s.enhanced_at.toISOString(),
          successRate: props?.success_rate ?? null,
        }
      })

      return {
        inventoryId: inv.inventoryid,
        quantity: inv.quantity,
        enhancementLevel: inv.enhancement_level,
        maxLevel,
        source: inv.source,
        acquiredAt: inv.acquired_at.toISOString(),
        equipped: equippedItemIds.has(inv.lg_items.itemid),
        totalBonus,
        glowTier: calcGlowTier(inv.enhancement_level, totalBonus),
        glowIntensity: calcGlowIntensity(inv.enhancement_level),
        slots,
        item: {
          id: inv.lg_items.itemid,
          name: inv.lg_items.name,
          category: inv.lg_items.category,
          slot: inv.lg_items.slot,
          rarity: inv.lg_items.rarity,
          description: inv.lg_items.description,
          assetPath: inv.lg_items.asset_path,
        },
      }
    })
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Materials count removed (materials no longer exist)
    const counts = {
      equipment: await prisma.lg_user_inventory.count({
        where: { userid: userId, lg_items: { category: { in: EQUIPMENT_CATEGORIES as any } } },
      }),
      scrolls: await prisma.lg_user_inventory.count({
        where: { userid: userId, lg_items: { category: "SCROLL" as any } },
      }),
    }
    // --- END AI-MODIFIED ---

    return res.status(200).json({ items: result, counts })
  },
})
