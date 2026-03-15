// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet wiki API - browse all items and crafting recipes (public)
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const category = req.query.category as string | undefined
    const rarity = req.query.rarity as string | undefined
    const search = req.query.search as string | undefined
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = 50

    const where: any = {}
    if (category) where.category = category
    if (rarity) where.rarity = rarity
    if (search) where.name = { contains: search, mode: "insensitive" }

    const [items, totalItems] = await Promise.all([
      prisma.lg_items.findMany({
        where,
        select: {
          itemid: true,
          name: true,
          category: true,
          slot: true,
          rarity: true,
          asset_path: true,
          gold_price: true,
          gem_price: true,
          tradeable: true,
          description: true,
        },
        orderBy: [{ rarity: "desc" }, { category: "asc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lg_items.count({ where }),
    ])

    const recipes = await prisma.lg_crafting_recipes.findMany({
      select: {
        recipeid: true,
        result_quantity: true,
        gold_cost: true,
        description: true,
        lg_items: {
          select: { itemid: true, name: true, category: true, rarity: true },
        },
        lg_recipe_ingredients: {
          select: {
            quantity: true,
            lg_items: { select: { itemid: true, name: true, rarity: true } },
          },
        },
      },
      orderBy: { recipeid: "asc" },
    })

    const scrollProperties = await prisma.lg_scroll_properties.findMany({
      select: {
        itemid: true,
        success_rate: true,
        destroy_rate: true,
        target_slot: true,
      },
    })

    const categories = await prisma.lg_items.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { category: "asc" },
    })

    return res.status(200).json({
      items: items.map((i) => ({
        id: i.itemid,
        name: i.name,
        category: i.category,
        slot: i.slot,
        rarity: i.rarity,
        assetPath: i.asset_path,
        goldPrice: i.gold_price,
        gemPrice: i.gem_price,
        tradeable: i.tradeable,
        description: i.description,
      })),
      pagination: {
        page,
        pageSize,
        total: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
      recipes: recipes.map((r) => ({
        recipeId: r.recipeid,
        resultItem: { id: r.lg_items.itemid, name: r.lg_items.name, category: r.lg_items.category, rarity: r.lg_items.rarity },
        resultQuantity: r.result_quantity,
        goldCost: r.gold_cost,
        description: r.description,
        ingredients: r.lg_recipe_ingredients.map((ing) => ({
          item: { id: ing.lg_items.itemid, name: ing.lg_items.name, rarity: ing.lg_items.rarity },
          quantity: ing.quantity,
        })),
      })),
      scrollProperties: scrollProperties.map((sp) => ({
        itemId: sp.itemid,
        successRate: sp.success_rate,
        destroyRate: sp.destroy_rate,
        targetSlot: sp.target_slot,
      })),
      categories: categories.map((c) => ({ category: c.category, count: c._count.category })),
    })
  },
})
