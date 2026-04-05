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

    // --- AI-MODIFIED (2026-04-05) ---
    // Purpose: Always derive URL from the request host, not NEXTAUTH_URL,
    // so the iCal link matches the domain the user is actually on (lionbot.org)
    const token = generateIcalToken(auth.discordId)
    const proto = (req.headers["x-forwarded-proto"] as string) || "https"
    const host = req.headers.host
    const icalUrl = `${proto}://${host}/api/dashboard/scheduled-sessions/ical?userId=${auth.discordId}&token=${token}`
    // --- END AI-MODIFIED ---

    return res.status(200).json({ token, icalUrl })
  },
})
