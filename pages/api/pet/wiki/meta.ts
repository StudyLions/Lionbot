// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki meta API - global stats, category counts,
//          collection progress, and game constants
// ============================================================
import { prisma } from "@/utils/prisma"
import { getAuthContext } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { GAME_CONSTANTS } from "@/utils/gameConstants"

export default apiHandler({
  async GET(req, res) {
    const auth = await getAuthContext(req)
    const userId = auth ? BigInt(auth.discordId) : null

    const [
      categoryGroups,
      rarityGroups,
      totalItems,
      totalOwnedRaw,
      totalEnhancementsRaw,
      mostPopularRaw,
      rarestOwnedRaw,
    ] = await Promise.all([
      prisma.lg_items.groupBy({ by: ["category"], _count: { category: true }, orderBy: { category: "asc" } }),
      prisma.lg_items.groupBy({ by: ["rarity"], _count: { rarity: true }, orderBy: { rarity: "asc" } }),
      prisma.lg_items.count(),
      prisma.lg_user_inventory.aggregate({ _sum: { quantity: true } }),
      prisma.lg_user_inventory.aggregate({ _sum: { enhancement_level: true }, where: { enhancement_level: { gt: 0 } } }),
      prisma.$queryRaw<Array<{ itemid: number; cnt: bigint }>>`
        SELECT itemid, COUNT(DISTINCT userid) as cnt FROM lg_user_inventory GROUP BY itemid ORDER BY cnt DESC LIMIT 1`,
      prisma.$queryRaw<Array<{ itemid: number; cnt: bigint }>>`
        SELECT itemid, COUNT(DISTINCT userid) as cnt FROM lg_user_inventory GROUP BY itemid ORDER BY cnt ASC LIMIT 1`,
    ])

    let mostPopularItem = null
    if (mostPopularRaw.length > 0) {
      const item = await prisma.lg_items.findUnique({
        where: { itemid: mostPopularRaw[0].itemid },
        select: { itemid: true, name: true, rarity: true, category: true, asset_path: true },
      })
      if (item) mostPopularItem = { ...item, ownerCount: Number(mostPopularRaw[0].cnt) }
    }

    let rarestOwnedItem = null
    if (rarestOwnedRaw.length > 0) {
      const item = await prisma.lg_items.findUnique({
        where: { itemid: rarestOwnedRaw[0].itemid },
        select: { itemid: true, name: true, rarity: true, category: true, asset_path: true },
      })
      if (item) rarestOwnedItem = { ...item, ownerCount: Number(rarestOwnedRaw[0].cnt) }
    }

    let collectionProgress: Record<string, { owned: number; total: number }> | null = null
    if (userId) {
      const userOwnedGroups = await prisma.$queryRaw<Array<{ category: string; cnt: bigint }>>`
        SELECT i.category, COUNT(DISTINCT i.itemid) as cnt
        FROM lg_user_inventory inv JOIN lg_items i ON inv.itemid = i.itemid
        WHERE inv.userid = ${userId}
        GROUP BY i.category`

      collectionProgress = {}
      for (const cg of categoryGroups) {
        const owned = userOwnedGroups.find((u) => u.category === cg.category)
        collectionProgress[cg.category] = {
          owned: owned ? Number(owned.cnt) : 0,
          total: cg._count.category,
        }
      }
    }

    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: Also return scroll items with their properties for the Enhancement Guide tab
    const scrollItems = await prisma.lg_items.findMany({
      where: { category: "SCROLL" },
      select: { itemid: true, name: true, rarity: true },
      orderBy: { rarity: "asc" },
    })
    const scrollProps = await prisma.lg_scroll_properties.findMany({
      select: { itemid: true, success_rate: true, destroy_rate: true, target_slot: true },
    })
    const scrollPropMap: Record<number, typeof scrollProps[0]> = {}
    for (const sp of scrollProps) scrollPropMap[sp.itemid] = sp

    const scrollsWithProps = scrollItems.map((s) => ({
      itemId: s.itemid, name: s.name, rarity: s.rarity,
      successRate: scrollPropMap[s.itemid]?.success_rate ?? 0,
      destroyRate: scrollPropMap[s.itemid]?.destroy_rate ?? 0,
    }))
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Exclude MATERIAL category from wiki meta (materials removed from the game)
    return res.status(200).json({
      categories: categoryGroups
        .filter((c) => c.category !== "MATERIAL")
        .map((c) => ({ category: c.category, count: c._count.category })),
      rarities: rarityGroups.map((r) => ({ rarity: r.rarity, count: r._count.rarity })),
    // --- END AI-MODIFIED ---
      totalItems,
      totalOwned: Number(totalOwnedRaw._sum.quantity ?? 0),
      totalEnhancements: Number(totalEnhancementsRaw._sum.enhancement_level ?? 0),
      mostPopularItem,
      rarestOwnedItem,
      collectionProgress,
      gameConstants: GAME_CONSTANTS,
      scrolls: scrollsWithProps,
    })
  },
})
