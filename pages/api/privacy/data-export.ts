// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-07
// Purpose: GDPR data export API endpoint. Authenticated users
//          can download all their personal data as a JSON file.
//          Rate limited to 1 export per 24 hours.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"
import { exportUserData } from "@/utils/gdpr-export"

const RATE_LIMIT_MS = 24 * 60 * 60 * 1000
const exportTimestamps = new Map<string, number>()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).end("Method Not Allowed")
  }

  const auth = await requireAuth(req, res)
  if (!auth) return

  const lastExport = exportTimestamps.get(auth.discordId)
  if (lastExport) {
    const elapsed = Date.now() - lastExport
    if (elapsed < RATE_LIMIT_MS) {
      const remainingMs = RATE_LIMIT_MS - elapsed
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000))
      return res.status(429).json({
        error: `You can only export your data once every 24 hours. Try again in ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}.`,
        retryAfterMs: remainingMs,
      })
    }
  }

  try {
    const data = await exportUserData(BigInt(auth.discordId))

    exportTimestamps.set(auth.discordId, Date.now())

    const filename = `lionbot-data-export-${auth.discordId}-${new Date().toISOString().split("T")[0]}.json`
    res.setHeader("Content-Type", "application/json")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    return res.status(200).send(JSON.stringify(data, null, 2))
  } catch (err) {
    console.error("Data export failed:", err)
    return res.status(500).json({ error: "Failed to export data. Please try again later." })
  }
}
