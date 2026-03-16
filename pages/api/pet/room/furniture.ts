// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Swap or remove a single furniture item in a room slot
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const VALID_SLOTS = ["wall", "floor", "mat", "table", "chair", "bed", "lamp", "picture", "window"]

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { slot, assetPath } = req.body

    if (!slot || !VALID_SLOTS.includes(slot)) {
      return res.status(400).json({ error: `Invalid slot. Must be one of: ${VALID_SLOTS.join(", ")}` })
    }
    if (!assetPath || typeof assetPath !== "string") {
      return res.status(400).json({ error: "Missing or invalid assetPath" })
    }

    await prisma.$queryRawUnsafe(
      `INSERT INTO lg_user_furniture (userid, slot, asset_path) VALUES ($1, $2, $3) ON CONFLICT (userid, slot) DO UPDATE SET asset_path = $3`,
      userId,
      slot,
      assetPath
    )

    return res.status(200).json({ success: true })
  },

  async DELETE(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { slot } = req.body

    if (!slot || !VALID_SLOTS.includes(slot)) {
      return res.status(400).json({ error: `Invalid slot. Must be one of: ${VALID_SLOTS.join(", ")}` })
    }

    await prisma.$queryRawUnsafe(
      `DELETE FROM lg_user_furniture WHERE userid = $1 AND slot = $2`,
      userId,
      slot
    )

    return res.status(200).json({ success: true })
  },
})
