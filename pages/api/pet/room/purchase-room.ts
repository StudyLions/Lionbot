// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Purchase a room theme - deducts gold/gems and adds
//          to lg_user_rooms.
//
// --- AI-MODIFIED (2026-06-04) ---
// Logic (affordability + atomic conditional deduct + grant ownership)
// moved to lib/pet/roomService.purchaseRoom so the Anki bearer route
// (pages/api/anki/pet/room.ts, action="purchase") shares one validated
// path. Thin NextAuth adapter; response unchanged. (Active-room switch
// remains a separate call, as before.)
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { purchaseRoom } from "@/lib/pet/roomService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    try {
      return res.status(200).json(await purchaseRoom(BigInt(auth.discordId), req.body?.roomId))
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
