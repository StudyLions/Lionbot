// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Send friend request -- look up user by Discord
//          username or ID, validate limits, insert request
//
// --- AI-MODIFIED (2026-06-04) ---
// Logic moved to lib/pet/friendsService.sendFriendRequest so the Anki
// bearer route (pages/api/anki/pet/friends.ts) shares one validated path.
// Thin NextAuth adapter; response unchanged (now also returns targetName).
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { sendFriendRequest } from "@/lib/pet/friendsService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    try {
      return res.status(200).json(await sendFriendRequest(BigInt(auth.discordId), req.body?.query))
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
