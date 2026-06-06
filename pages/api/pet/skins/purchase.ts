// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Purchase a gameboy skin with gold or gems.
//          Deducts currency, records ownership, and auto-equips.
//
// --- AI-MODIFIED (2026-06-04) ---
// Logic (SELECT … FOR UPDATE balance lock + deduct + grant + auto-equip +
// gem audit) moved to lib/pet/skinService.purchaseSkin so the Anki bearer
// route (pages/api/anki/pet/skins.ts, action="purchase") shares one
// validated path. Thin NextAuth adapter; response unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { purchaseSkin } from "@/lib/pet/skinService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    try {
      return res.status(200).json(await purchaseSkin(BigInt(auth.discordId), req.body?.skinId))
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
