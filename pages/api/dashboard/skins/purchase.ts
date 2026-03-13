// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Skin purchase API - buy skins with gems
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
const SKIN_PRICES: Record<string, number> = {
  obsidian: 1500,
  platinum: 750,
  boston_blue: 750,
  cotton_candy: 1500,
  blue_bayoux: 1500,
  bubblegum: 1500,
}

const VALID_SKIN_IDS = new Set(Object.keys(SKIN_PRICES))

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { skinId } = req.body
    if (!skinId || typeof skinId !== "string") {
      return res.status(400).json({ error: "skinId (string) required" })
    }

    const normalizedId = skinId.toLowerCase().trim()
    if (!VALID_SKIN_IDS.has(normalizedId)) {
      return res.status(400).json({ error: "Invalid skin ID" })
    }

    const price = SKIN_PRICES[normalizedId]
    const userId = auth.userId

    // Ensure user_config exists
    let userConfig = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gems: true },
    })

    if (!userConfig) {
      await prisma.user_config.create({
        data: { userid: userId, gems: 0 },
      })
      userConfig = { gems: 0 }
    }

    const currentGems = userConfig.gems ?? 0
    if (currentGems < price) {
      return res.status(400).json({
        error: `Not enough gems. You need ${price - currentGems} more.`,
      })
    }

    // Check if user already owns this skin (by base skin name)
    const existingInventory = await prisma.user_skin_inventory.findMany({
      where: { userid: userId },
      include: {
        customised_skins: {
          include: { global_available_skins: { select: { skin_name: true } } },
        },
      },
    })
    const ownedSkinNames = new Set(
      existingInventory
        .map((i) => i.customised_skins?.global_available_skins?.skin_name)
        .filter(Boolean)
    )
    if (ownedSkinNames.has(normalizedId)) {
      return res.status(400).json({ error: "You already own this skin" })
    }

    const skinName = normalizedId
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create global_available_skins
      let globalSkin = await tx.global_available_skins.findFirst({
        where: { skin_name: normalizedId },
      })
      if (!globalSkin) {
        globalSkin = await tx.global_available_skins.create({
          data: { skin_name: normalizedId },
        })
      }

      // 2. Create customised_skins
      const customSkin = await tx.customised_skins.create({
        data: { base_skin_id: globalSkin.skin_id },
      })

      // 3. Create gem_transaction first (needed for user_skin_inventory FK)
      const gemTx = await tx.gem_transactions.create({
        data: {
          transaction_type: "PURCHASE",
          actorid: userId,
          from_account: userId,
          to_account: null,
          amount: price,
          description: `Purchased skin: ${skinName}`,
        },
      })

      // 4. Create user_skin_inventory
      await tx.user_skin_inventory.create({
        data: {
          userid: userId,
          custom_skin_id: customSkin.custom_skin_id,
          transactionid: gemTx.transactionid,
          active: false,
        },
      })

      // 5. Deduct gems
      await tx.user_config.update({
        where: { userid: userId },
        data: { gems: { decrement: price } },
      })

      const updated = await tx.user_config.findUnique({
        where: { userid: userId },
        select: { gems: true },
      })
      return updated?.gems ?? currentGems - price
    })

    res.status(200).json({
      success: true,
      newBalance: result,
    })
  },
})
