// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Deposit coins into a private room. Supports both
//          direct coin amount and day-based presets.
// ============================================================
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      include: { rented_members: { select: { userid: true } } },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }
    if (room.deleted_at) {
      return res.status(400).json({ error: "This room has expired" })
    }

    const isOwner = room.ownerid === auth.userId
    const isMember = room.rented_members.some((m) => m.userid === auth.userId)
    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "You are not a member of this room" })
    }

    const guildConfig = await prisma.guild_config.findUnique({
      where: { guildid: room.guildid },
      select: { renting_price: true },
    })
    const rentPrice = guildConfig?.renting_price ?? 1000

    const { amount, days } = req.body
    let depositAmount: number

    if (typeof days === "number" && days > 0) {
      depositAmount = Math.ceil(days * rentPrice)
    } else if (typeof amount === "number" && amount > 0) {
      depositAmount = Math.floor(amount)
    } else {
      return res.status(400).json({ error: "Provide a positive 'amount' or 'days'" })
    }

    if (depositAmount <= 0 || !Number.isFinite(depositAmount)) {
      return res.status(400).json({ error: "Invalid deposit amount" })
    }

    const member = await prisma.members.findUnique({
      where: {
        guildid_userid: { guildid: room.guildid, userid: auth.userId },
      },
      select: { coins: true },
    })

    if (!member) {
      return res.status(400).json({ error: "You are not a member of this server" })
    }

    if (member.coins < depositAmount) {
      return res.status(400).json({
        error: `Insufficient coins. You have ${member.coins} but need ${depositAmount}.`,
        balance: member.coins,
      })
    }

    await prisma.$transaction([
      prisma.members.update({
        where: {
          guildid_userid: { guildid: room.guildid, userid: auth.userId },
        },
        data: { coins: { decrement: depositAmount } },
      }),
      prisma.rented_rooms.update({
        where: { channelid: channelId },
        data: { coin_balance: { increment: depositAmount } },
      }),
    ])

    const updatedRoom = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { coin_balance: true },
    })

    const newBalance = updatedRoom?.coin_balance ?? room.coin_balance + depositAmount
    const newDaysRemaining = rentPrice > 0 ? Math.floor(newBalance / rentPrice) : 999

    res.status(200).json({
      success: true,
      deposited: depositAmount,
      newCoinBalance: newBalance,
      newDaysRemaining,
      yourRemainingCoins: member.coins - depositAmount,
    })
  },
})
