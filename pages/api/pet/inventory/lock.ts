// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-23
// Purpose: Toggle the is_locked flag on a single inventory row.
//          Locked items are hidden from the sell picker and blocked
//          from gift / enhance / other destructive actions across
//          the website. Authenticated; ownership is enforced before
//          mutating the row.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { checkRateLimit } from "@/utils/rateLimit"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const { inventoryId: rawInventoryId, locked: rawLocked } = req.body as {
      inventoryId?: number | string
      locked?: boolean
    }

    const inventoryId = Math.floor(Number(rawInventoryId))
    if (!Number.isFinite(inventoryId) || inventoryId < 1) {
      return res.status(400).json({ error: "inventoryId must be a positive integer" })
    }
    if (typeof rawLocked !== "boolean") {
      return res.status(400).json({ error: "locked must be true or false" })
    }

    if (!checkRateLimit(`lock:${auth.discordId}`, 500)) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment." })
    }

    const existing = await prisma.lg_user_inventory.findFirst({
      where: { inventoryid: inventoryId, userid: userId },
      select: { inventoryid: true, is_locked: true },
    })
    if (!existing) {
      return res.status(404).json({ error: "Item not found in your inventory" })
    }

    if (existing.is_locked === rawLocked) {
      return res.status(200).json({
        success: true,
        inventoryId,
        isLocked: rawLocked,
        unchanged: true,
      })
    }

    const updated = await prisma.lg_user_inventory.update({
      where: { inventoryid: inventoryId },
      data: { is_locked: rawLocked },
      select: { inventoryid: true, is_locked: true },
    })

    return res.status(200).json({
      success: true,
      inventoryId: updated.inventoryid,
      isLocked: updated.is_locked,
    })
  },
})
