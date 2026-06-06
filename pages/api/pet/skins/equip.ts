// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Equip an owned/eligible gameboy skin (set as active)
//
// --- AI-MODIFIED (2026-06-04) ---
// Validation + mutation moved to lib/pet/skinService.equipSkin so the Anki
// bearer route (pages/api/anki/pet/skins.ts) shares one validated path.
// Thin NextAuth adapter; response unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { equipSkin } from "@/lib/pet/skinService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    try {
      const result = await equipSkin(BigInt(auth.discordId), req.body?.skinId)
      return res.status(200).json(result)
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
