// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Purchase a gameboy skin with gold or gems.
//          Deducts currency, records ownership, and auto-equips.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { skinId } = req.body
    if (typeof skinId !== "number") {
      return res.status(400).json({ error: "skinId (number) required" })
    }

    const userId = BigInt(auth.discordId)

    const [skin, pet, userConfig, alreadyOwned] = await Promise.all([
      prisma.lg_gameboy_skins.findUnique({ where: { skin_id: skinId } }),
      prisma.lg_pets.findUnique({
        where: { userid: userId },
        select: { level: true },
      }),
      prisma.user_config.findUnique({
        where: { userid: userId },
        select: { gold: true, gems: true },
      }),
      prisma.lg_user_gameboy_skins.findUnique({
        where: { userid_skin_id: { userid: userId, skin_id: skinId } },
      }),
    ])

    if (!skin) return res.status(404).json({ error: "Skin not found" })
    if (!pet) return res.status(400).json({ error: "You don't have a pet yet" })

    const unlockType = String(skin.unlock_type)

    if (unlockType === "FREE") {
      return res.status(400).json({ error: "This skin is free -- just equip it" })
    }
    if (unlockType === "LEVEL") {
      return res.status(400).json({ error: "This skin unlocks at a certain level -- just equip it if eligible" })
    }
    if (alreadyOwned) {
      return res.status(400).json({ error: "You already own this skin" })
    }

    const gold = Number(userConfig?.gold ?? BigInt(0))
    const gems = userConfig?.gems ?? 0

    if (unlockType === "GOLD") {
      const price = skin.gold_price ?? 0
      if (gold < price) {
        return res.status(400).json({ error: `Not enough gold. Need ${price - gold} more.` })
      }

      await prisma.$transaction([
        prisma.user_config.update({
          where: { userid: userId },
          data: { gold: { decrement: price } },
        }),
        prisma.lg_gold_transactions.create({
          data: {
            transaction_type: "SHOP_PURCHASE",
            actorid: userId,
            from_account: userId,
            amount: price,
            description: `Purchased gameboy skin: ${skin.theme} ${skin.color}`,
          },
        }),
        prisma.lg_user_gameboy_skins.create({
          data: { userid: userId, skin_id: skinId },
        }),
        prisma.lg_pets.update({
          where: { userid: userId },
          data: { active_gameboy_skin_id: skinId },
        }),
      ])

      const updated = await prisma.user_config.findUnique({
        where: { userid: userId },
        select: { gold: true, gems: true },
      })

      return res.status(200).json({
        success: true,
        newGold: (updated?.gold ?? BigInt(0)).toString(),
        newGems: updated?.gems ?? 0,
        activeSkinId: skinId,
      })
    }

    if (unlockType === "GEMS") {
      const price = skin.gem_price ?? 0
      if (gems < price) {
        return res.status(400).json({ error: `Not enough gems. Need ${price - gems} more.` })
      }

      await prisma.$transaction([
        prisma.user_config.update({
          where: { userid: userId },
          data: { gems: { decrement: price } },
        }),
        prisma.gem_transactions.create({
          data: {
            transaction_type: "PURCHASE",
            actorid: userId,
            from_account: userId,
            amount: price,
            description: `Purchased gameboy skin: ${skin.theme} ${skin.color}`,
          },
        }),
        prisma.lg_user_gameboy_skins.create({
          data: { userid: userId, skin_id: skinId },
        }),
        prisma.lg_pets.update({
          where: { userid: userId },
          data: { active_gameboy_skin_id: skinId },
        }),
      ])

      const updated = await prisma.user_config.findUnique({
        where: { userid: userId },
        select: { gold: true, gems: true },
      })

      return res.status(200).json({
        success: true,
        newGold: (updated?.gold ?? BigInt(0)).toString(),
        newGems: updated?.gems ?? 0,
        activeSkinId: skinId,
      })
    }

    return res.status(400).json({ error: "Invalid skin unlock type" })
  },
})
