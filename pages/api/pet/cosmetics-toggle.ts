// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: Master toggle for the cosmetic overlay layer.
//
//          POST flips lg_pets.cosmetics_enabled for the signed-in user.
//          When TRUE the renderer overlays lg_pet_cosmetics rows on top
//          of lg_pet_equipment; when FALSE the cosmetics rows are kept
//          in the DB but ignored, so the user can quickly preview their
//          "true equipment view" without losing their picks.
//
//          Optional `enabled` boolean in the body sets the value
//          explicitly; omitting it flips the current value.
//
//          Migration: prisma/migrations/manual_2026_04_24_pet_cosmetics.sql
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { enabled } = (req.body ?? {}) as { enabled?: boolean }

    const pet = await prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: { cosmetics_enabled: true },
    })

    if (!pet) {
      return res.status(404).json({ error: "No pet found for this user" })
    }

    const newValue = typeof enabled === "boolean" ? enabled : !pet.cosmetics_enabled

    await prisma.lg_pets.update({
      where: { userid: userId },
      data: { cosmetics_enabled: newValue },
    })

    return res.status(200).json({ success: true, cosmeticsEnabled: newValue })
  },
})
