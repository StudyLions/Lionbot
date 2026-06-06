// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-10
// Purpose: Auto-equip the best item per slot based on total
//          enhancement bonus, with rarity as tiebreaker.
//
// --- AI-MODIFIED (2026-06-04) ---
// Logic moved to lib/pet/inventoryService.equipBestItems so the Anki
// bearer route (pages/api/anki/pet/inventory/equip-best.ts) shares one
// validated path. Thin NextAuth adapter; response unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { equipBestItems } from "@/lib/pet/inventoryService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    try {
      const result = await equipBestItems(BigInt(auth.discordId))
      return res.status(200).json(result)
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
