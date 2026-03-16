// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki item detail API - full encyclopedia data for
//          one item: stats, ownership, recipes, leaderboard,
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

    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: Include set_id and set name in item queries
    const item = await prisma.lg_items.findUnique({
      where: { itemid: itemId },
      select: {
        itemid: true, name: true, category: true, slot: true, rarity: true,
        asset_path: true, gold_price: true, gem_price: true, tradeable: true,
        description: true, copyright_flag: true, set_id: true,
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

    const usedInRecipes = await prisma.lg_recipe_ingredients.findMany({
      where: { itemid: itemId },
      select: {
        quantity: true,
        lg_crafting_recipes: {
          select: {
            recipeid: true, result_quantity: true, gold_cost: true,
            lg_items: { select: { itemid: true, name: true, rarity: true, category: true, asset_path: true } },
          },
        },
      },
    })

    const craftedFrom = await prisma.lg_crafting_recipes.findFirst({
      where: { result_itemid: itemId },
      select: {
        recipeid: true, result_quantity: true, gold_cost: true, description: true,
        lg_recipe_ingredients: {
          select: {
            quantity: true,
            lg_items: { select: { itemid: true, name: true, rarity: true, category: true, asset_path: true } },
          },
        },
      },
    })

    let scrollProperties = null
    if (item.category === "SCROLL") {
      scrollProperties = await prisma.lg_scroll_properties.findUnique({
        where: { itemid: itemId },
        select: { success_rate: true, destroy_rate: true, target_slot: true },
      })
    }

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

    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: Prioritize set members in related items when item belongs to a set
    let setMembers: Array<{ itemid: number; name: string; rarity: string; category: string; asset_path: string | null; gold_price: number | null }> = []
    if (item.set_id) {
      setMembers = await prisma.lg_items.findMany({
        where: { set_id: item.set_id, itemid: { not: itemId } },
        select: { itemid: true, name: true, rarity: true, category: true, asset_path: true, gold_price: true },
        orderBy: { rarity: "desc" },
      })
    }
    const remainingSlots = 6 - setMembers.length
    const setMemberIds = setMembers.map((s) => s.itemid)
    const categoryRelated = remainingSlots > 0
      ? await prisma.lg_items.findMany({
          where: { category: item.category, itemid: { notIn: [itemId, ...setMemberIds] } },
          select: { itemid: true, name: true, rarity: true, category: true, asset_path: true, gold_price: true },
          orderBy: { rarity: "desc" },
          take: remainingSlots,
        })
      : []
    const related = [...setMembers, ...categoryRelated]
    // --- END AI-MODIFIED ---

    const isEquipment = EQUIP_CATEGORIES.includes(item.category)
    const maxEnhancement = isEquipment ? (GAME_CONSTANTS.MAX_ENHANCEMENT_BY_RARITY[item.rarity] ?? 5) : null
    const dropTier = item.category === "MATERIAL" ? (GAME_CONSTANTS.MATERIAL_DROP_WEIGHTS[item.rarity] ?? null) : null

    return res.status(200).json({
      item: {
        id: item.itemid, name: item.name, category: item.category, slot: item.slot,
        rarity: item.rarity, assetPath: item.asset_path, goldPrice: item.gold_price,
        gemPrice: item.gem_price, tradeable: item.tradeable, description: item.description,
        setName: item.item_set?.name ?? null,
      },
      ownership: { count: ownerCount, tier: getOwnershipTier(ownerCount), userOwned },
      usedInRecipes: usedInRecipes.map((r) => ({
        recipeId: r.lg_crafting_recipes.recipeid,
        quantityNeeded: r.quantity,
        resultItem: {
          id: r.lg_crafting_recipes.lg_items.itemid,
          name: r.lg_crafting_recipes.lg_items.name,
          rarity: r.lg_crafting_recipes.lg_items.rarity,
          category: r.lg_crafting_recipes.lg_items.category,
          assetPath: r.lg_crafting_recipes.lg_items.asset_path,
        },
        resultQuantity: r.lg_crafting_recipes.result_quantity,
        goldCost: r.lg_crafting_recipes.gold_cost,
      })),
      craftedFrom: craftedFrom
        ? {
            recipeId: craftedFrom.recipeid,
            resultQuantity: craftedFrom.result_quantity,
            goldCost: craftedFrom.gold_cost,
            description: craftedFrom.description,
            ingredients: craftedFrom.lg_recipe_ingredients.map((ing) => ({
              quantity: ing.quantity,
              item: {
                id: ing.lg_items.itemid, name: ing.lg_items.name,
                rarity: ing.lg_items.rarity, category: ing.lg_items.category,
                assetPath: ing.lg_items.asset_path,
              },
            })),
          }
        : null,
      scrollProperties,
      enhancementLeaderboard,
      enhancement: isEquipment
        ? {
            maxLevel: maxEnhancement,
            goldBonusPerLevel: GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS,
            xpBonusPerLevel: GAME_CONSTANTS.ENHANCEMENT_XP_BONUS,
            maxGoldBonus: (maxEnhancement ?? 0) * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS,
            maxXpBonus: (maxEnhancement ?? 0) * GAME_CONSTANTS.ENHANCEMENT_XP_BONUS,
          }
        : null,
      dropInfo: item.category === "MATERIAL"
        ? { dropTierPercent: dropTier, voiceChance: GAME_CONSTANTS.MATERIAL_DROP_CHANCE_VOICE, textChance: GAME_CONSTANTS.MATERIAL_DROP_CHANCE_TEXT }
        : null,
      related: related.map((r) => ({
        id: r.itemid, name: r.name, rarity: r.rarity, category: r.category,
        assetPath: r.asset_path, goldPrice: r.gold_price,
      })),
      gameConstants: GAME_CONSTANTS,
    })
  },
})
