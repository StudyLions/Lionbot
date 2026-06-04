// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Unfriend -- deletes the friendship row using
//          ordered pair (lower userid first)
//
// --- AI-MODIFIED (2026-06-04) ---
// Logic moved to lib/pet/friendsService.removeFriend so the Anki bearer
// route shares one validated path. Thin NextAuth adapter; response unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { removeFriend } from "@/lib/pet/friendsService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    try {
      return res.status(200).json(await removeFriend(BigInt(auth.discordId), req.body?.targetUserId))
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
