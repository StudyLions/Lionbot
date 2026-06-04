// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Accept or decline a friend request -- validates
//          ownership, friend limits, creates friendship pair
//
// --- AI-MODIFIED (2026-06-04) ---
// Logic moved to lib/pet/friendsService.respondFriendRequest so the Anki
// bearer route shares one validated path. Thin NextAuth adapter; response
// unchanged (now also returns action).
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { respondFriendRequest } from "@/lib/pet/friendsService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    const { requestId, action } = req.body || {}
    try {
      return res.status(200).json(
        await respondFriendRequest(BigInt(auth.discordId), requestId, action)
      )
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
