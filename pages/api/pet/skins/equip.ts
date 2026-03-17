// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Equip an owned/eligible gameboy skin (set as active)
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

    const [skin, pet] = await Promise.all([
      prisma.lg_gameboy_skins.findUnique({ where: { skin_id: skinId } }),
      prisma.lg_pets.findUnique({
        where: { userid: userId },
        select: { level: true, active_gameboy_skin_id: true },
      }),
    ])

    if (!skin) return res.status(404).json({ error: "Skin not found" })
    if (!pet) return res.status(400).json({ error: "You don't have a pet yet" })

    const unlockType = String(skin.unlock_type)

    if (unlockType === "FREE") {
      // Always allowed
    } else if (unlockType === "LEVEL") {
      if (pet.level < (skin.unlock_level ?? 999)) {
        return res.status(400).json({
          error: `Your pet needs to be level ${skin.unlock_level} to use this skin (currently level ${pet.level})`,
        })
      }
    } else {
      const owned = await prisma.lg_user_gameboy_skins.findUnique({
        where: { userid_skin_id: { userid: userId, skin_id: skinId } },
      })
      if (!owned) {
        return res.status(400).json({ error: "You don't own this skin. Purchase it first." })
      }
    }

    await prisma.lg_pets.update({
      where: { userid: userId },
      data: { active_gameboy_skin_id: skinId },
    })

    return res.status(200).json({
      success: true,
      activeSkinId: skinId,
      assetPath: skin.asset_path,
    })
  },
})
