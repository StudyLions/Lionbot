// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki item detail API - full encyclopedia data for
//          one item: stats, ownership, drop info, leaderboard,
//          related items, scroll props, enhancement info
// ============================================================
import { prisma } from "@/utils/prisma"
import { getAuthContext } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { GAME_CONSTANTS, getOwnershipTier } from "@/utils/gameConstants"

// --- AI-MODIFIED (2026-03-15) ---
// Purpose: Add BOOTS to equipment categories
const EQUIP_CATEGORIES = ["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS"]
// --- END AI-MODIFIED ---

export default apiHandler({
  async GET(req, res) {
    const auth = await getAuthContext(req)
    const userId = auth ? BigInt(auth.discordId) : null
    const itemId = parseInt(req.query.itemId as string)
    if (isNaN(itemId)) return res.status(400).json({ error: "Invalid itemId" })

    // --- AI-MODIFIED (2026-03-17) ---
    // Purpose: Include set_id, set name, and tag in item queries
    const item = await prisma.lg_items.findUnique({
      where: { itemid: itemId },
      select: {
        itemid: true, name: true, category: true, slot: true, rarity: true,
        asset_path: true, gold_price: true, gem_price: true, tradeable: true,
        description: true, copyright_flag: true, set_id: true, tag: true, drop_weight: true,
        item_set: { select: { name: true } },
      },
    })
    // --- END AI-MODIFIED ---
    if (!item) return res.status(404).json({ error: "Item not found" })

    const ownerCountRaw = await prisma.$queryRaw<[{ cnt: bigint }]>`
      SELECT COUNT(DISTINCT userid) as cnt FROM lg_user_inventory WHERE itemid = ${itemId}`
    const ownerCount = Number(ownerCountRaw[0]?.cnt ?? 0)

    let userOwned = 0
    if (userId) {
      const inv = await prisma.lg_user_inventory.aggregate({
        where: { userid: userId, itemid: itemId },
        _sum: { quantity: true },
      })
      userOwned = inv._sum.quantity ?? 0
    }

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Crafting removed -- skip recipe queries, return empty
    const usedInRecipes: any[] = []
    const craftedFrom = null
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-17) ---
    // Purpose: Include bonus_value in scroll properties for wiki display
    let scrollProperties = null
    if (item.category === "SCROLL") {
      scrollProperties = await prisma.lg_scroll_properties.findUnique({
        where: { itemid: itemId },
        select: { success_rate: true, destroy_rate: true, target_slot: true, bonus_value: true },
      })
    }
    // --- END AI-MODIFIED ---

    let enhancementLeaderboard: Array<{ name: string; level: number }> = []
    if (EQUIP_CATEGORIES.includes(item.category)) {
      const topEnhanced = await prisma.$queryRaw<Array<{ userid: bigint; enhancement_level: number }>>`
        SELECT userid, enhancement_level FROM lg_user_inventory
        WHERE itemid = ${itemId} AND enhancement_level > 0
        ORDER BY enhancement_level DESC LIMIT 5`

      if (topEnhanced.length > 0) {
        const userIds = topEnhanced.map((r) => r.userid)
        const users = await prisma.user_config.findMany({
          where: { userid: { in: userIds } },
          select: { userid: true, name: true },
        })
        const nameMap: Record<string, string> = {}
        for (const u of users) nameMap[u.userid.toString()] = u.name ?? `Player ${u.userid.toString().slice(-4)}`

        enhancementLeaderboard = topEnhanced.map((r) => ({
          name: nameMap[r.userid.toString()] ?? `Player ${r.userid.toString().slice(-4)}`,
          level: r.enhancement_level,
        }))
      }
    }

    // --- AI-MODIFIED (2026-03-17) ---
    // Purpose: Rarity variants, deduplicated set/tag items for rarity-expanded item pool
    const relSelect = { itemid: true, name: true, rarity: true, category: true, asset_path: true, gold_price: true }

    const rarityVariants = await prisma.lg_items.findMany({
      where: { name: item.name, category: item.category, itemid: { not: itemId } },
      select: relSelect,
      orderBy: { rarity: "asc" },
    })
    const excludeNames = new Set([item.name])
    const excludeIds = [itemId, ...rarityVariants.map((r: any) => r.itemid)]

    let setItems: any[] = []
    if (item.set_id) {
      const allSetItems = await prisma.lg_items.findMany({
        where: { set_id: item.set_id, name: { not: item.name } },
        select: relSelect,
        orderBy: { rarity: "asc" },
      })
      const byName: Record<string, any> = {}
      for (const si of allSetItems) {
        if (!byName[si.name] || si.rarity === item.rarity) byName[si.name] = si
      }
      setItems = Object.values(byName)
      for (const si of allSetItems) {
        excludeIds.push(si.itemid)
        excludeNames.add(si.name)
      }
    }

    let tagItems: any[] = []
    if (item.tag) {
      tagItems = await prisma.lg_items.findMany({
        where: { tag: item.tag, itemid: { notIn: excludeIds }, name: { notIn: Array.from(excludeNames) } },
        select: relSelect,
        distinct: ["name"],
        orderBy: { rarity: "desc" },
        take: 12,
      })
    }
    // --- END AI-MODIFIED ---

    const isEquipment = EQUIP_CATEGORIES.includes(item.category)
    const maxEnhancement = isEquipment ? (GAME_CONSTANTS.MAX_ENHANCEMENT_BY_RARITY[item.rarity] ?? 5) : null
    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Materials no longer drop; drop info now applies to equipment/scrolls
    const isDroppable = isEquipment || item.category === "SCROLL"
    const dropTier = isDroppable ? (GAME_CONSTANTS.ITEM_DROP_WEIGHTS[item.rarity] ?? null) : null
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-17) ---
    // Purpose: Add marketplace summary stats (replaces gold/gem price cards on the frontend)
    const mpSince = new Date()
    mpSince.setDate(mpSince.getDate() - 30)

    const mpSales = await prisma.lg_marketplace_sales.findMany({
      where: { itemid: itemId, sold_at: { gte: mpSince } },
      select: { price_per_unit: true, quantity: true },
    })
    const mpTotalVolume = mpSales.reduce((sum, s) => sum + s.quantity, 0)
    const mpAvgPrice = mpSales.length > 0
      ? Math.round(mpSales.reduce((sum, s) => sum + s.price_per_unit, 0) / mpSales.length)
      : 0
    const mpActiveListings = await prisma.lg_marketplace_listings.count({
      where: { itemid: itemId, status: "ACTIVE" },
    })
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-17) ---
    // Purpose: Include tag, drop_weight, and tier-relative rarity in response
    let tierDropStats = null
    if (isDroppable && item.drop_weight !== undefined) {
      const itemsInTier = await prisma.lg_items.findMany({
        where: {
          rarity: item.rarity as any,
          category: isEquipment
            ? { in: EQUIP_CATEGORIES as any }
            : ("SCROLL" as any),
        },
        select: { itemid: true, drop_weight: true },
      })
      const totalWeight = itemsInTier.reduce((s, i) => s + (i.drop_weight ?? 1.0), 0)
      const thisWeight = item.drop_weight ?? 1.0
      tierDropStats = {
        itemsInTier: itemsInTier.length,
        totalWeight,
        relativeChance: totalWeight > 0 ? thisWeight / totalWeight : 0,
      }
    }

    return res.status(200).json({
      item: {
        id: item.itemid, name: item.name, category: item.category, slot: item.slot,
        rarity: item.rarity, assetPath: item.asset_path, goldPrice: item.gold_price,
        gemPrice: item.gem_price, tradeable: item.tradeable, description: item.description,
        setName: item.item_set?.name ?? null, tag: item.tag ?? null,
        dropWeight: item.drop_weight ?? 1.0,
      },
      ownership: { count: ownerCount, tier: getOwnershipTier(ownerCount), userOwned },
      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Crafting removed -- always return empty/null for recipe fields
      usedInRecipes: [],
      craftedFrom: null,
      // --- END AI-MODIFIED ---
      scrollProperties,
      enhancementLeaderboard,
      // --- AI-MODIFIED (2026-03-17) ---
      // Purpose: Scroll-aware enhancement data with min/max bonus ranges instead of fixed values
      enhancement: isEquipment
        ? {
            maxLevel: maxEnhancement,
            minBonusPerLevel: GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 1.0,
            maxBonusPerLevel: GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 7.0,
            dropBonusRate: GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS,
            safeBonus: (maxEnhancement ?? 0) * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 1.0,
            perfectBonus: (maxEnhancement ?? 0) * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 7.0,
          }
        : null,
      // --- END AI-MODIFIED ---
      // --- AI-MODIFIED (2026-03-17) ---
      // Purpose: Drop info with per-item weight and tier-relative rarity
      dropInfo: isDroppable
        ? {
            dropTierPercent: dropTier,
            voiceChance: GAME_CONSTANTS.ITEM_DROP_CHANCE_VOICE,
            textChance: GAME_CONSTANTS.ITEM_DROP_CHANCE_TEXT,
            dropWeight: item.drop_weight ?? 1.0,
            ...(tierDropStats ?? {}),
          }
        : null,
      // --- END AI-MODIFIED ---
      rarityVariants: rarityVariants.map((r: any) => ({
        id: r.itemid, name: r.name, rarity: r.rarity, category: r.category,
        assetPath: r.asset_path, goldPrice: r.gold_price,
      })),
      setItems: setItems.map((r: any) => ({
        id: r.itemid, name: r.name, rarity: r.rarity, category: r.category,
        assetPath: r.asset_path, goldPrice: r.gold_price,
      })),
      tagItems: tagItems.map((r: any) => ({
        id: r.itemid, name: r.name, rarity: r.rarity, category: r.category,
        assetPath: r.asset_path, goldPrice: r.gold_price,
      })),
      // --- END AI-MODIFIED ---
      // --- AI-MODIFIED (2026-03-17) ---
      // Purpose: Marketplace summary for stats grid (replaces gold/gem price cards)
      marketplaceSummary: {
        avgPrice: mpAvgPrice,
        totalVolume: mpTotalVolume,
        activeListings: mpActiveListings,
      },
      // --- END AI-MODIFIED ---
      gameConstants: GAME_CONSTANTS,
    })
  },
})
