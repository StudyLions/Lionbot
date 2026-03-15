// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki global search API - cross-type search
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const q = (req.query.q as string) || ""
    if (q.length < 2) return res.status(200).json({ items: [], recipes: [] })

    const [items, recipes] = await Promise.all([
      prisma.lg_items.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { itemid: true, name: true, category: true, rarity: true, asset_path: true },
        orderBy: { rarity: "desc" },
        take: 8,
      }),
      prisma.lg_crafting_recipes.findMany({
        where: {
          OR: [
            { lg_items: { name: { contains: q, mode: "insensitive" } } },
            { lg_recipe_ingredients: { some: { lg_items: { name: { contains: q, mode: "insensitive" } } } } },
          ],
        },
        select: {
          recipeid: true,
          lg_items: { select: { itemid: true, name: true, rarity: true, category: true, asset_path: true } },
        },
        take: 4,
      }),
    ])

    return res.status(200).json({
      items: items.map((i) => ({
        id: i.itemid, name: i.name, category: i.category, rarity: i.rarity, assetPath: i.asset_path,
      })),
      recipes: recipes.map((r) => ({
        recipeId: r.recipeid,
        resultItem: {
          id: r.lg_items.itemid, name: r.lg_items.name, rarity: r.lg_items.rarity,
          category: r.lg_items.category, assetPath: r.lg_items.asset_path,
        },
      })),
    })
  },
})
