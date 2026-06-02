// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Equip/unequip pet equipment from inventory.
//
// --- AI-MODIFIED (2026-06-02) ---
// Logic moved to lib/pet/inventoryService.equipItem so the Anki bearer
// route (pages/api/anki/pet/inventory/equip.ts) shares one validated
// path. Thin NextAuth adapter; response unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { equipItem } from "@/lib/pet/inventoryService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    try {
      const result = await equipItem(BigInt(auth.discordId), req.body || {})
      return res.status(200).json(result)
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
