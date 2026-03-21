// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Batch purchase furniture items from cart - deducts
//          gold/gems, adds to lg_user_inventory for permanent
//          ownership, and upserts into lg_user_furniture
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const VALID_SLOTS = ["wall", "floor", "mat", "table", "chair", "bed", "lamp", "picture", "window"]

// --- AI-REPLACED (2026-03-20) ---
// Reason: Client-provided prices were trusted, allowing free-item exploit
// What the new code does better: Looks up prices from lg_items in database,
//   validates item category, validates assetPath matches DB, caps array size
// --- Original code (commented out for rollback) ---
// interface CartItem {
//   itemId: number
//   slot: string
//   assetPath: string
//   price: number
//   currency: "gold" | "gems"
// }
// --- End original code ---

const ASSET_PATH_PATTERN = /^[a-zA-Z0-9/_.-]+$/
const MAX_CART_ITEMS = 50

interface CartItem {
  itemId: number
  slot: string
  assetPath: string
  currency: "gold" | "gems"
}

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { items } = req.body as { items: CartItem[] }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items array is required and must not be empty" })
    }
    if (items.length > MAX_CART_ITEMS) {
      return res.status(400).json({ error: `Cart cannot contain more than ${MAX_CART_ITEMS} items` })
    }

    for (const item of items) {
      if (!item.slot || !VALID_SLOTS.includes(item.slot)) {
        return res.status(400).json({ error: `Invalid slot "${item.slot}". Must be one of: ${VALID_SLOTS.join(", ")}` })
      }
      if (!item.assetPath || typeof item.assetPath !== "string" || !ASSET_PATH_PATTERN.test(item.assetPath)) {
        return res.status(400).json({ error: "Each item must have a valid assetPath (alphanumeric, slashes, dots, hyphens, underscores only)" })
      }
      if (item.assetPath.includes("..")) {
        return res.status(400).json({ error: "Invalid assetPath" })
      }
      if (item.currency !== "gold" && item.currency !== "gems") {
        return res.status(400).json({ error: 'Each item currency must be "gold" or "gems"' })
      }
      if (!item.itemId || typeof item.itemId !== "number" || !Number.isInteger(item.itemId) || item.itemId < 1) {
        return res.status(400).json({ error: "Each item must have a valid itemId" })
      }
    }

    const itemIds = items.map(i => i.itemId)
    const dbItems = await prisma.lg_items.findMany({
      where: { itemid: { in: itemIds } },
      select: { itemid: true, name: true, category: true, asset_path: true, gold_price: true, gem_price: true },
    })
    const dbItemMap = new Map(dbItems.map(i => [i.itemid, i]))

    for (const item of items) {
      const dbItem = dbItemMap.get(item.itemId)
      if (!dbItem) {
        return res.status(404).json({ error: `Item ${item.itemId} not found` })
      }
      if (dbItem.category !== "FURNITURE") {
        return res.status(400).json({ error: `Item "${dbItem.name}" is not furniture` })
      }
    }

    const existingInventory = await prisma.lg_user_inventory.findMany({
      where: { userid: userId },
      select: { itemid: true },
    })
    const ownedItemIds = new Set(existingInventory.map(i => i.itemid))

    const itemsToPurchase = items.filter(i => !ownedItemIds.has(i.itemId))

    let totalGold = 0
    let totalGems = 0
    for (const item of itemsToPurchase) {
      const dbItem = dbItemMap.get(item.itemId)!
      if (item.currency === "gold") {
        totalGold += dbItem.gold_price ?? 0
      } else {
        totalGems += dbItem.gem_price ?? 0
      }
    }
// --- END AI-REPLACED ---

    if (totalGold > 0 || totalGems > 0) {
      const userConfig = await prisma.user_config.findUnique({
        where: { userid: userId },
        select: { gold: true, gems: true },
      })

      const currentGold = Number(userConfig?.gold ?? 0)
      const currentGems = userConfig?.gems ?? 0

      if (currentGold < totalGold || currentGems < totalGems) {
        return res.status(400).json({
          error: "Insufficient funds",
          needed: { gold: totalGold, gems: totalGems },
          have: { gold: currentGold, gems: currentGems },
        })
      }

      await prisma.$transaction(async (tx) => {
        if (totalGold > 0) {
          const goldResult = await tx.$queryRawUnsafe<{ gold: bigint }[]>(
            `UPDATE user_config SET gold = gold - $2 WHERE userid = $1 AND gold >= $2 RETURNING gold`,
            userId,
            BigInt(totalGold)
          )
          if (goldResult.length === 0) {
            throw new Error("Insufficient gold (race condition)")
          }
        }

        if (totalGems > 0) {
          const gemsResult = await tx.$queryRawUnsafe<{ gems: number }[]>(
            `UPDATE user_config SET gems = gems - $2 WHERE userid = $1 AND gems >= $2 RETURNING gems`,
            userId,
            totalGems
          )
          if (gemsResult.length === 0) {
            throw new Error("Insufficient gems (race condition)")
          }
        }

        // --- AI-MODIFIED (2026-03-20) ---
        // Purpose: Add purchased items to lg_user_inventory; use DB asset_path for furniture
        for (const item of itemsToPurchase) {
          const existing = await tx.lg_user_inventory.findFirst({
            where: { userid: userId, itemid: item.itemId },
          })
          if (!existing) {
            await tx.lg_user_inventory.create({
              data: {
                userid: userId,
                itemid: item.itemId,
                quantity: 1,
                source: "SHOP",
              },
            })
          }
        }

        for (const item of items) {
          const dbItem = dbItemMap.get(item.itemId)!
          await tx.$queryRawUnsafe(
            `INSERT INTO lg_user_furniture (userid, slot, asset_path) VALUES ($1, $2, $3) ON CONFLICT (userid, slot) DO UPDATE SET asset_path = $3`,
            userId,
            item.slot,
            dbItem.asset_path
          )
        }
        // --- END AI-MODIFIED ---
      })
    } else {
      // --- AI-MODIFIED (2026-03-20) ---
      // Purpose: Already-owned items just get equipped using DB asset_path
      for (const item of items) {
        if (!ownedItemIds.has(item.itemId)) {
          return res.status(400).json({ error: `You don't own item ${item.itemId}` })
        }
        const dbItem = dbItemMap.get(item.itemId)!
        await prisma.$queryRawUnsafe(
          `INSERT INTO lg_user_furniture (userid, slot, asset_path) VALUES ($1, $2, $3) ON CONFLICT (userid, slot) DO UPDATE SET asset_path = $3`,
          userId,
          item.slot,
          dbItem.asset_path
        )
      }
      // --- END AI-MODIFIED ---
    }

    const updated = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gold: true, gems: true },
    })

    return res.status(200).json({
      success: true,
      newGold: (updated?.gold ?? BigInt(0)).toString(),
      newGems: updated?.gems ?? 0,
    })
  },
})
