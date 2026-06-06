// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Friend interaction -- care for a friend's pet
//          (feed/bathe/sleep) or water their farm plot.
//          One interaction per type per day (UTC). WATER also
//          grants 5 XP to the actor's pet.
//
// --- AI-MODIFIED (2026-06-04) ---
// Logic moved to lib/pet/friendsService.interactWithFriend so the Anki
// bearer route shares one validated, friendship-gated, daily-deduped path.
// Thin NextAuth adapter; response unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { interactWithFriend } from "@/lib/pet/friendsService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    const { targetUserId, type, plotId } = req.body || {}
    try {
      return res.status(200).json(
        await interactWithFriend(BigInt(auth.discordId), targetUserId, type, plotId)
      )
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
