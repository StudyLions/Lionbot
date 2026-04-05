// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-04
// Purpose: Generate an iCal sync token for the authenticated user.
//          Uses HMAC-SHA256 so no DB storage is needed.
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { generateIcalToken } from "./ical"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const token = generateIcalToken(auth.discordId)
    const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.host}`
    const icalUrl = `${baseUrl}/api/dashboard/scheduled-sessions/ical?userId=${auth.discordId}&token=${token}`

    return res.status(200).json({ token, icalUrl })
  },
})
