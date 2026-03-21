// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Skin purchase API - buy skins with gems
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
// --- AI-MODIFIED (2026-03-15) ---
// Purpose: use shared SkinCatalog as single source of truth for prices
import { SKIN_PRICES, SKIN_MAP } from "@/constants/SkinCatalog"

const VALID_SKIN_IDS = new Set(Object.keys(SKIN_PRICES))
// --- END AI-MODIFIED ---

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

    // --- AI-REPLACED (2026-03-20) ---
    // Reason: Balance was checked outside transaction, allowing race condition
    //         where two concurrent purchases both pass the check and cause negative gems
    // What the new code does better: Moves balance check + ownership check inside
    //         a transaction with SELECT FOR UPDATE row locking
    // --- Original code (commented out for rollback) ---
    // let userConfig = await prisma.user_config.findUnique({ ... })
    // const currentGems = userConfig.gems ?? 0
    // if (currentGems < price) { ... }
    // const existingInventory = await prisma.user_skin_inventory.findMany({ ... })
    // if (ownedSkinNames.has(normalizedId)) { ... }
    // const result = await prisma.$transaction(async (tx) => { ... deduct without re-check ... })
    // --- End original code ---

    const skinName = normalizedId
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")

    let purchaseError: string | null = null

    const result = await prisma.$transaction(async (tx) => {
      const [lockedUser] = await tx.$queryRawUnsafe<{ gems: number }[]>(
        `SELECT gems FROM user_config WHERE userid = $1 FOR UPDATE`,
        userId
      )

      if (!lockedUser) {
        await tx.user_config.create({ data: { userid: userId, gems: 0 } })
        purchaseError = `Not enough gems. You need ${price} more.`
        return 0
      }

      const currentGems = lockedUser.gems ?? 0
      if (currentGems < price) {
        purchaseError = `Not enough gems. You need ${price - currentGems} more.`
        return currentGems
      }

      const existingInventory = await tx.user_skin_inventory.findMany({
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
        purchaseError = "You already own this skin"
        return currentGems
      }

      let globalSkin = await tx.global_available_skins.findFirst({
        where: { skin_name: normalizedId },
      })
      if (!globalSkin) {
        globalSkin = await tx.global_available_skins.create({
          data: { skin_name: normalizedId },
        })
      }

      const customSkin = await tx.customised_skins.create({
        data: { base_skin_id: globalSkin.skin_id },
      })

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

      await tx.user_skin_inventory.create({
        data: {
          userid: userId,
          custom_skin_id: customSkin.custom_skin_id,
          transactionid: gemTx.transactionid,
          active: false,
        },
      })

      const gemsResult = await tx.$queryRawUnsafe<{ gems: number }[]>(
        `UPDATE user_config SET gems = gems - $2 WHERE userid = $1 AND gems >= $2 RETURNING gems`,
        userId,
        price
      )
      if (gemsResult.length === 0) {
        throw new Error("Insufficient gems (race condition)")
      }
      return gemsResult[0].gems
    })

    if (purchaseError) {
      return res.status(400).json({ error: purchaseError })
    }
    // --- END AI-REPLACED ---

    res.status(200).json({
      success: true,
      newBalance: result,
    })
  },
})
