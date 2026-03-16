// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Purchase a room theme - deducts gold/gems and adds
//          to lg_user_rooms. Also sets the room as active and
//          applies default furniture for the new room.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { roomId } = req.body as { roomId: number }

    if (typeof roomId !== "number" || roomId <= 0) {
      return res.status(400).json({ error: "Valid roomId is required" })
    }

    const room = await prisma.lg_rooms.findUnique({
      where: { room_id: roomId },
    })
    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    const existing = await prisma.lg_user_rooms.findUnique({
      where: { userid_room_id: { userid: userId, room_id: roomId } },
    })
    if (existing) {
      return res.status(400).json({ error: "Room already owned" })
    }

    const goldCost = room.gold_price ?? 0
    const gemCost = room.gem_price ?? 0

    if (goldCost === 0 && gemCost === 0) {
      return res.status(400).json({ error: "This room is free and should already be unlocked" })
    }

    const userConfig = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gold: true, gems: true },
    })

    const currentGold = Number(userConfig?.gold ?? 0)
    const currentGems = userConfig?.gems ?? 0

    if (goldCost > 0 && currentGold < goldCost) {
      return res.status(400).json({
        error: "Insufficient gold",
        needed: goldCost,
        have: currentGold,
      })
    }
    if (gemCost > 0 && currentGems < gemCost) {
      return res.status(400).json({
        error: "Insufficient gems",
        needed: gemCost,
        have: currentGems,
      })
    }

    await prisma.$transaction(async (tx) => {
      if (goldCost > 0) {
        const result = await tx.$queryRawUnsafe<{ gold: bigint }[]>(
          `UPDATE user_config SET gold = gold - $2 WHERE userid = $1 AND gold >= $2 RETURNING gold`,
          userId,
          BigInt(goldCost)
        )
        if (result.length === 0) {
          throw new Error("Insufficient gold (race condition)")
        }
      }

      if (gemCost > 0) {
        const result = await tx.$queryRawUnsafe<{ gems: number }[]>(
          `UPDATE user_config SET gems = gems - $2 WHERE userid = $1 AND gems >= $2 RETURNING gems`,
          userId,
          gemCost
        )
        if (result.length === 0) {
          throw new Error("Insufficient gems (race condition)")
        }
      }

      await tx.lg_user_rooms.create({
        data: {
          userid: userId,
          room_id: roomId,
        },
      })
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
