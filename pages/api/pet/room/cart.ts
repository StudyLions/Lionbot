// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Batch purchase furniture items from cart - deducts
//          gold/gems and upserts into lg_user_furniture
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const VALID_SLOTS = ["wall", "floor", "mat", "table", "chair", "bed", "lamp", "picture", "window"]

interface CartItem {
  slot: string
  assetPath: string
  price: number
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

    for (const item of items) {
      if (!item.slot || !VALID_SLOTS.includes(item.slot)) {
        return res.status(400).json({ error: `Invalid slot "${item.slot}". Must be one of: ${VALID_SLOTS.join(", ")}` })
      }
      if (!item.assetPath || typeof item.assetPath !== "string") {
        return res.status(400).json({ error: "Each item must have a valid assetPath" })
      }
      if (typeof item.price !== "number" || item.price < 0) {
        return res.status(400).json({ error: "Each item must have a non-negative price" })
      }
      if (item.currency !== "gold" && item.currency !== "gems") {
        return res.status(400).json({ error: 'Each item currency must be "gold" or "gems"' })
      }
    }

    let totalGold = 0
    let totalGems = 0
    for (const item of items) {
      if (item.currency === "gold") totalGold += item.price
      else totalGems += item.price
    }

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

      for (const item of items) {
        await tx.$queryRawUnsafe(
          `INSERT INTO lg_user_furniture (userid, slot, asset_path) VALUES ($1, $2, $3) ON CONFLICT (userid, slot) DO UPDATE SET asset_path = $3`,
          userId,
          item.slot,
          item.assetPath
        )
      }
    })

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
