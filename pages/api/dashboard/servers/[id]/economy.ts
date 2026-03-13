// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET economy overview for a server (moderator+)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

  const guildId = BigInt(req.query.id as string)
  const auth = await requireModerator(req, res, guildId)
  if (!auth) return

  const [circulation, topHolders, recentTransactions, shopItems] = await Promise.all([
    prisma.members.aggregate({
      where: { guildid: guildId },
      _sum: { coins: true },
      _count: true,
    }),

    prisma.members.findMany({
      where: { guildid: guildId, coins: { gt: 0 } },
      orderBy: { coins: "desc" },
      take: 10,
      select: { userid: true, display_name: true, coins: true },
    }),

    prisma.coin_transactions.findMany({
      where: { guildid: guildId },
      orderBy: { created_at: "desc" },
      take: 20,
      select: {
        transactionid: true,
        transactiontype: true,
        actorid: true,
        amount: true,
        from_account: true,
        to_account: true,
        created_at: true,
      },
    }),

    prisma.shop_items.findMany({
      where: { guildid: guildId, deleted: false },
      select: {
        itemid: true,
        item_type: true,
        price: true,
        purchasable: true,
        shop_items_colour_roles: { select: { roleid: true } },
      },
    }),
  ])

  return res.status(200).json({
    overview: {
      totalCoins: circulation._sum.coins || 0,
      memberCount: circulation._count,
    },
    topHolders: topHolders.map((m) => ({
      userId: m.userid.toString(),
      displayName: m.display_name,
      coins: m.coins,
    })),
    recentTransactions: recentTransactions.map((t) => ({
      id: t.transactionid,
      type: t.transactiontype,
      actorId: t.actorid.toString(),
      amount: t.amount,
      fromAccount: t.from_account?.toString(),
      toAccount: t.to_account?.toString(),
      createdAt: t.created_at,
    })),
    shopItems: shopItems.map((s) => ({
      id: s.itemid,
      type: s.item_type,
      price: s.price,
      purchasable: s.purchasable,
      roleId: s.shop_items_colour_roles?.roleid?.toString(),
    })),
  })
}
