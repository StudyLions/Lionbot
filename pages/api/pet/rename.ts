// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Rename pet for 250 gems. Validates name, deducts gems
//          atomically with FOR UPDATE locking, records gem_transactions.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { sendGemAuditLog } from "@/utils/discordAudit"

const RENAME_COST = 250
const NAME_MIN_LENGTH = 1
const NAME_MAX_LENGTH = 20

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { name } = req.body
    if (typeof name !== "string") {
      return res.status(400).json({ error: "name (string) required" })
    }

    const trimmed = name.trim()
    if (trimmed.length < NAME_MIN_LENGTH || trimmed.length > NAME_MAX_LENGTH) {
      return res.status(400).json({
        error: `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`,
      })
    }

    const userId = BigInt(auth.discordId)

    const pet = await prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: { pet_name: true },
    })
    if (!pet) {
      return res.status(400).json({ error: "You don't have a pet yet" })
    }

    if (pet.pet_name === trimmed) {
      return res.status(400).json({ error: "That's already your pet's name" })
    }

    const result = await prisma.$transaction(async (tx) => {
      const [locked] = await tx.$queryRawUnsafe<{ gems: number }[]>(
        `SELECT gems FROM user_config WHERE userid = $1 FOR UPDATE`,
        userId
      )
      if (!locked || locked.gems < RENAME_COST) {
        return {
          error: `Not enough gems. You need ${RENAME_COST} but have ${locked?.gems ?? 0}.`,
        }
      }

      const gemsResult = await tx.$queryRawUnsafe<{ gems: number }[]>(
        `UPDATE user_config SET gems = gems - $2 WHERE userid = $1 AND gems >= $2 RETURNING gems`,
        userId,
        RENAME_COST
      )
      if (gemsResult.length === 0) {
        return { error: "Insufficient gems" }
      }

      await tx.gem_transactions.create({
        data: {
          transaction_type: "PURCHASE",
          actorid: userId,
          from_account: userId,
          amount: RENAME_COST,
          description: `Pet rename: "${pet.pet_name}" → "${trimmed}"`,
        },
      })

      await tx.lg_pets.update({
        where: { userid: userId },
        data: { pet_name: trimmed },
      })

      return { success: true, newName: trimmed, newGems: gemsResult[0].gems }
    })

    if ("error" in result) {
      return res.status(400).json(result)
    }

    sendGemAuditLog({
      transactionType: "PURCHASE",
      amount: RENAME_COST,
      actorId: auth.discordId,
      fromAccount: auth.discordId,
      toAccount: null,
      description: `Pet rename: "${pet.pet_name}" → "${trimmed}"`,
    })

    return res.status(200).json(result)
  },
})
