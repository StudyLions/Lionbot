// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki recipes API - all crafting recipes with search
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const search = (req.query.search as string) || ""

    const recipes = await prisma.lg_crafting_recipes.findMany({
      select: {
        recipeid: true,
        result_quantity: true,
        gold_cost: true,
        description: true,
        lg_items: {
          select: { itemid: true, name: true, category: true, rarity: true, asset_path: true },
        },
        lg_recipe_ingredients: {
          select: {
            quantity: true,
            lg_items: { select: { itemid: true, name: true, rarity: true, category: true, asset_path: true } },
          },
        },
      },
      orderBy: { recipeid: "asc" },
    })

    let filtered = recipes
    if (search) {
      const q = search.toLowerCase()
      filtered = recipes.filter((r) =>
        r.lg_items.name.toLowerCase().includes(q) ||
        r.lg_recipe_ingredients.some((ing) => ing.lg_items.name.toLowerCase().includes(q))
      )
    }

    const result = filtered.map((r) => ({
      recipeId: r.recipeid,
      resultItem: {
        id: r.lg_items.itemid, name: r.lg_items.name,
        category: r.lg_items.category, rarity: r.lg_items.rarity,
        assetPath: r.lg_items.asset_path,
      },
      resultQuantity: r.result_quantity,
      goldCost: r.gold_cost,
      description: r.description,
      ingredients: r.lg_recipe_ingredients.map((ing) => ({
        quantity: ing.quantity,
        item: {
          id: ing.lg_items.itemid, name: ing.lg_items.name,
          rarity: ing.lg_items.rarity, category: ing.lg_items.category,
          assetPath: ing.lg_items.asset_path,
        },
      })),
    }))

    return res.status(200).json({ recipes: result })
  },
})
