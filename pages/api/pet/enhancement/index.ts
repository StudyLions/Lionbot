// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet enhancement API - enhance equipment with scrolls
//          (MapleStory-style: success/destroy RNG, glow tiers, achievements)
//
// --- AI-MODIFIED (2026-06-04) ---
// All mechanics (the success/destroy RNG, scroll consumption, stack-split
// on success/destroy, glow-tier math, and achievement logging) moved to
// lib/pet/enhanceService.ts so the Anki bearer route
// (pages/api/anki/pet/enhance.ts) shares ONE validated, cheat-safe path.
// This route is now a thin NextAuth adapter; response shapes unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { getEnhanceView, applyEnhancement } from "@/lib/pet/enhanceService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    return res.status(200).json(await getEnhanceView(BigInt(auth.discordId)))
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    const { equipmentInventoryId, scrollInventoryId } = req.body || {}
    try {
      return res.status(200).json(
        await applyEnhancement(BigInt(auth.discordId), equipmentInventoryId, scrollInventoryId)
      )
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
