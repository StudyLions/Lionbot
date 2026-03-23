// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Purchase a gameboy skin with gold or gems.
//          Deducts currency, records ownership, and auto-equips.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Gem audit log for pet skin purchases
import { sendGemAuditLog } from "@/utils/discordAudit"
// --- END AI-MODIFIED ---

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { skinId } = req.body
    if (typeof skinId !== "number") {
      return res.status(400).json({ error: "skinId (number) required" })
    }

    const userId = BigInt(auth.discordId)

    // --- AI-REPLACED (2026-03-20) ---
    // Reason: Balance was checked outside transaction, allowing race condition
    //         where two concurrent purchases both pass the check and cause negative balance
    // What the new code does better: Non-financial checks outside, balance check + deduction
    //         inside a transaction with SELECT FOR UPDATE row locking
    // --- Original code (commented out for rollback) ---
    // const [skin, pet, userConfig, alreadyOwned] = await Promise.all([...])
    // const gold = Number(userConfig?.gold ?? BigInt(0))
    // const gems = userConfig?.gems ?? 0
    // if (unlockType === "GOLD") { if (gold < price) ... await prisma.$transaction([...]) }
    // if (unlockType === "GEMS") { if (gems < price) ... await prisma.$transaction([...]) }
    // --- End original code ---

    const [skin, pet, alreadyOwned] = await Promise.all([
      prisma.lg_gameboy_skins.findUnique({ where: { skin_id: skinId } }),
      prisma.lg_pets.findUnique({
        where: { userid: userId },
        select: { level: true },
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

    if (unlockType === "GOLD") {
      const price = skin.gold_price ?? 0

      const result = await prisma.$transaction(async (tx) => {
        const [locked] = await tx.$queryRawUnsafe<{ gold: bigint }[]>(
          `SELECT gold FROM user_config WHERE userid = $1 FOR UPDATE`,
          userId
        )
        if (!locked || Number(locked.gold) < price) {
          return { error: `Not enough gold. Need ${price - Number(locked?.gold ?? 0)} more.` }
        }

        const goldResult = await tx.$queryRawUnsafe<{ gold: bigint }[]>(
          `UPDATE user_config SET gold = gold - $2 WHERE userid = $1 AND gold >= $2 RETURNING gold`,
          userId,
          BigInt(price)
        )
        if (goldResult.length === 0) {
          return { error: "Insufficient gold (race condition)" }
        }

        await tx.lg_gold_transactions.create({
          data: {
            transaction_type: "SHOP_PURCHASE",
            actorid: userId,
            from_account: userId,
            amount: price,
            description: `Purchased gameboy skin: ${skin.theme} ${skin.color}`,
          },
        })
        await tx.lg_user_gameboy_skins.create({
          data: { userid: userId, skin_id: skinId },
        })
        await tx.lg_pets.update({
          where: { userid: userId },
          data: { active_gameboy_skin_id: skinId },
        })

        const updated = await tx.user_config.findUnique({
          where: { userid: userId },
          select: { gold: true, gems: true },
        })
        return {
          success: true,
          newGold: (updated?.gold ?? BigInt(0)).toString(),
          newGems: updated?.gems ?? 0,
          activeSkinId: skinId,
        }
      })

      if ("error" in result) return res.status(400).json(result)
      return res.status(200).json(result)
    }

    if (unlockType === "GEMS") {
      const price = skin.gem_price ?? 0

      const result = await prisma.$transaction(async (tx) => {
        const [locked] = await tx.$queryRawUnsafe<{ gems: number }[]>(
          `SELECT gems FROM user_config WHERE userid = $1 FOR UPDATE`,
          userId
        )
        if (!locked || locked.gems < price) {
          return { error: `Not enough gems. Need ${price - (locked?.gems ?? 0)} more.` }
        }

        const gemsResult = await tx.$queryRawUnsafe<{ gems: number }[]>(
          `UPDATE user_config SET gems = gems - $2 WHERE userid = $1 AND gems >= $2 RETURNING gems`,
          userId,
          price
        )
        if (gemsResult.length === 0) {
          return { error: "Insufficient gems (race condition)" }
        }

        await tx.gem_transactions.create({
          data: {
            transaction_type: "PURCHASE",
            actorid: userId,
            from_account: userId,
            amount: price,
            description: `Purchased gameboy skin: ${skin.theme} ${skin.color}`,
          },
        })
        await tx.lg_user_gameboy_skins.create({
          data: { userid: userId, skin_id: skinId },
        })
        await tx.lg_pets.update({
          where: { userid: userId },
          data: { active_gameboy_skin_id: skinId },
        })

        const updated = await tx.user_config.findUnique({
          where: { userid: userId },
          select: { gold: true, gems: true },
        })
        return {
          success: true,
          newGold: (updated?.gold ?? BigInt(0)).toString(),
          newGems: updated?.gems ?? 0,
          activeSkinId: skinId,
        }
      })

      if ("error" in result) return res.status(400).json(result)
      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Gem audit log for pet gameboy skin purchase
      sendGemAuditLog({
        transactionType: "PURCHASE",
        amount: price,
        actorId: auth.discordId,
        fromAccount: auth.discordId,
        toAccount: null,
        description: `Purchased gameboy skin: ${skin.theme} ${skin.color}`,
      })
      // --- END AI-MODIFIED ---
      return res.status(200).json(result)
    }

    return res.status(400).json({ error: "Invalid skin unlock type" })
    // --- END AI-REPLACED ---
  },
})
