// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: Set / clear a "cosmetic overlay" item per slot. Mirrors the
//          shape of pages/api/pet/inventory/equip.ts but writes to the
//          lg_pet_cosmetics table -- a parallel visual-only layer that
//          the renderer overlays on top of lg_pet_equipment.
//
//          IMPORTANT: this route NEVER touches stat-bearing equipment
//          rows. Bonuses still come exclusively from lg_pet_equipment +
//          lg_user_inventory + lg_enhancement_slots, so changing a
//          cosmetic has zero effect on gold/XP/drop multipliers.
//
//          Migration: prisma/migrations/manual_2026_04_24_pet_cosmetics.sql
//
// --- AI-MODIFIED (2026-06-04) ---
// Logic moved to lib/pet/inventoryService.setCosmetic so the Anki bearer
// route (pages/api/anki/pet/inventory/cosmetic.ts) shares one validated
// path. Thin NextAuth adapter; response unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { setCosmetic } from "@/lib/pet/inventoryService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    try {
      const result = await setCosmetic(BigInt(auth.discordId), req.body || {})
      return res.status(200).json(result)
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
