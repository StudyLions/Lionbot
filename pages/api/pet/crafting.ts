// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet crafting API - list recipes and craft items
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const recipes = await prisma.lg_crafting_recipes.findMany({
      select: {
        recipeid: true,
        result_quantity: true,
        gold_cost: true,
        description: true,
        lg_items: {
          select: { itemid: true, name: true, category: true, rarity: true, description: true, asset_path: true },
        },
        lg_recipe_ingredients: {
          select: {
            quantity: true,
            lg_items: { select: { itemid: true, name: true, rarity: true, category: true } },
          },
        },
      },
      orderBy: { recipeid: "asc" },
    })

    const userMaterials = await prisma.lg_user_inventory.findMany({
      where: { userid: userId, lg_items: { category: { in: ["MATERIAL", "SCROLL"] as any } } },
      select: { itemid: true, quantity: true },
    })
    const ownedMap: Record<number, number> = {}
    for (const m of userMaterials) {
      ownedMap[m.itemid] = (ownedMap[m.itemid] || 0) + m.quantity
    }

    const userGold = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gold: true },
    })

    const result = recipes.map((r) => ({
      recipeId: r.recipeid,
      resultItem: {
        id: r.lg_items.itemid,
        name: r.lg_items.name,
        category: r.lg_items.category,
        rarity: r.lg_items.rarity,
        description: r.lg_items.description,
        assetPath: r.lg_items.asset_path,
      },
      resultQuantity: r.result_quantity,
      goldCost: r.gold_cost,
      description: r.description,
      ingredients: r.lg_recipe_ingredients.map((ing) => ({
        item: {
          id: ing.lg_items.itemid,
          name: ing.lg_items.name,
          rarity: ing.lg_items.rarity,
        },
        required: ing.quantity,
        owned: ownedMap[ing.lg_items.itemid] || 0,
      })),
      canCraft:
        r.lg_recipe_ingredients.every(
          (ing) => (ownedMap[ing.lg_items.itemid] || 0) >= ing.quantity
        ) && Number(userGold?.gold ?? 0) >= r.gold_cost,
    }))

    return res.status(200).json({
      recipes: result,
      gold: (userGold?.gold ?? BigInt(0)).toString(),
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { recipeId } = req.body
    if (!recipeId) return res.status(400).json({ error: "recipeId required" })

    const recipe = await prisma.lg_crafting_recipes.findUnique({
      where: { recipeid: recipeId },
      include: {
        lg_items: true,
        lg_recipe_ingredients: { include: { lg_items: true } },
      },
    })
    if (!recipe) return res.status(404).json({ error: "Recipe not found" })

    const userGold = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gold: true },
    })
    if (Number(userGold?.gold ?? 0) < recipe.gold_cost) {
      return res.status(400).json({ error: "Not enough gold" })
    }

    for (const ing of recipe.lg_recipe_ingredients) {
      const owned = await prisma.lg_user_inventory.findFirst({
        where: { userid: userId, itemid: ing.itemid, enhancement_level: 0 },
        select: { inventoryid: true, quantity: true },
      })
      if (!owned || owned.quantity < ing.quantity) {
        return res.status(400).json({ error: `Not enough ${ing.lg_items.name}` })
      }
    }

    for (const ing of recipe.lg_recipe_ingredients) {
      const inv = await prisma.lg_user_inventory.findFirst({
        where: { userid: userId, itemid: ing.itemid, enhancement_level: 0 },
      })
      if (!inv) continue
      if (inv.quantity <= ing.quantity) {
        await prisma.lg_user_inventory.delete({ where: { inventoryid: inv.inventoryid } })
      } else {
        await prisma.lg_user_inventory.update({
          where: { inventoryid: inv.inventoryid },
          data: { quantity: inv.quantity - ing.quantity },
        })
      }
    }

    if (recipe.gold_cost > 0) {
      await prisma.user_config.update({
        where: { userid: userId },
        data: { gold: { decrement: recipe.gold_cost } },
      })
    }

    const isStackable = ["MATERIAL", "SCROLL"].includes(recipe.lg_items.category)
    if (isStackable) {
      const existing = await prisma.lg_user_inventory.findFirst({
        where: { userid: userId, itemid: recipe.result_itemid, enhancement_level: 0 },
      })
      if (existing) {
        await prisma.lg_user_inventory.update({
          where: { inventoryid: existing.inventoryid },
          data: { quantity: existing.quantity + recipe.result_quantity },
        })
      } else {
        await prisma.lg_user_inventory.create({
          data: {
            userid: userId,
            itemid: recipe.result_itemid,
            quantity: recipe.result_quantity,
            source: "CRAFT",
          },
        })
      }
    } else {
      await prisma.lg_user_inventory.create({
        data: {
          userid: userId,
          itemid: recipe.result_itemid,
          quantity: 1,
          source: "CRAFT",
        },
      })
    }

    return res.status(200).json({
      success: true,
      craftedItem: recipe.lg_items.name,
      quantity: recipe.result_quantity,
    })
  },
})
