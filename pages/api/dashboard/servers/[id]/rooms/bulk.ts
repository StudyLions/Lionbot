// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Bulk actions on multiple rooms -- close all, adjust
//          balance on all selected rooms. Each action is audit-logged.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { action, channelIds, amount } = req.body
    if (!Array.isArray(channelIds) || channelIds.length === 0) {
      return res.status(400).json({ error: "channelIds must be a non-empty array" })
    }
    if (channelIds.length > 100) {
      return res.status(400).json({ error: "Maximum 100 rooms per bulk action" })
    }

    const channelBigints = channelIds.map((id: string) => BigInt(id))

    const rooms = await prisma.rented_rooms.findMany({
      where: { channelid: { in: channelBigints }, guildid: guildId },
      select: { channelid: true, coin_balance: true, name: true, ownerid: true, deleted_at: true },
    })

    if (rooms.length === 0) {
      return res.status(404).json({ error: "No matching rooms found in this server" })
    }

    switch (action) {
      case "close": {
        const active = rooms.filter((r) => !r.deleted_at)
        if (active.length === 0) return res.status(400).json({ error: "No active rooms to close" })

        await prisma.rented_rooms.updateMany({
          where: { channelid: { in: active.map((r) => r.channelid) } },
          data: { deleted_at: new Date() },
        })

        await prisma.room_admin_log.createMany({
          data: active.map((r) => ({
            channelid: r.channelid,
            guildid: guildId,
            adminid: auth.userId,
            action: "force_close",
            details: { roomName: r.name, ownerId: r.ownerid.toString(), bulk: true },
          })),
        })

        return res.status(200).json({ success: true, affected: active.length })
      }

      case "adjust_balance": {
        if (typeof amount !== "number" || !Number.isFinite(amount)) {
          return res.status(400).json({ error: "amount must be a number" })
        }
        const active = rooms.filter((r) => !r.deleted_at)
        if (active.length === 0) return res.status(400).json({ error: "No active rooms to adjust" })

        for (const r of active) {
          const newBalance = Math.max(0, r.coin_balance + amount)
          await prisma.rented_rooms.update({
            where: { channelid: r.channelid },
            data: { coin_balance: newBalance },
          })
        }

        await prisma.room_admin_log.createMany({
          data: active.map((r) => ({
            channelid: r.channelid,
            guildid: guildId,
            adminid: auth.userId,
            action: "adjust_balance",
            details: { adjustment: amount, oldBalance: r.coin_balance, bulk: true },
          })),
        })

        return res.status(200).json({ success: true, affected: active.length })
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` })
    }
  },
})
