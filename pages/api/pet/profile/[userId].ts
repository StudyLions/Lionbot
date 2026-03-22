// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Public read-only endpoint returning any pet owner's
//          visual data for rendering their gameboy/room/farm.
// ============================================================
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { fetchPetVisualData } from "@/utils/petProfile"

export default apiHandler({
  async GET(req, res) {
    const userId = parseBigInt(req.query.userId, "userId")
    const data = await fetchPetVisualData(userId)

    if (!data) {
      return res.status(404).json({ error: "User does not have a pet" })
    }

    return res.status(200).json(data)
  },
})
