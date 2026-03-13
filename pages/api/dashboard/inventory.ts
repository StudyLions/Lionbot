// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET inventory and PATCH to toggle active skin
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  if (req.method === "GET") {
    const items = await prisma.user_skin_inventory.findMany({
      where: { userid: auth.userId },
      include: {
        customised_skins: {
          include: {
            global_available_skins: { select: { skin_name: true } },
          },
        },
      },
      orderBy: { acquired_at: "desc" },
    })

    return res.status(200).json({
      skins: items.map((item) => ({
        id: item.itemid,
        active: item.active,
        acquiredAt: item.acquired_at?.toISOString() || null,
        expiresAt: item.expires_at?.toISOString() || null,
        skinName: item.customised_skins?.global_available_skins?.skin_name || "Custom Skin",
        baseSkinId: item.customised_skins?.base_skin_id,
      })),
    })
  }

  if (req.method === "PATCH") {
    const { itemId, active } = req.body
    if (!itemId || typeof active !== "boolean") {
      return res.status(400).json({ error: "itemId and active (boolean) required" })
    }

    const item = await prisma.user_skin_inventory.findUnique({ where: { itemid: itemId } })
    if (!item || item.userid !== auth.userId) {
      return res.status(404).json({ error: "Item not found" })
    }

    if (active) {
      await prisma.$transaction([
        prisma.user_skin_inventory.updateMany({
          where: { userid: auth.userId, active: true },
          data: { active: false },
        }),
        prisma.user_skin_inventory.update({
          where: { itemid: itemId },
          data: { active: true },
        }),
      ])
    } else {
      await prisma.user_skin_inventory.update({
        where: { itemid: itemId },
        data: { active: false },
      })
    }

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: "Method not allowed" })
}
