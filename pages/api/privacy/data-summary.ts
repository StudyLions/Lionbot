// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-07
// Purpose: Returns a summary of data counts for the
//          authenticated user, used by the privacy dashboard.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"
import { getUserDataCounts } from "@/utils/gdpr-export"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).end("Method Not Allowed")
  }

  const auth = await requireAuth(req, res)
  if (!auth) return

  try {
    const counts = await getUserDataCounts(BigInt(auth.discordId))
    return res.status(200).json(counts)
  } catch (err) {
    console.error("Data summary failed:", err)
    return res.status(500).json({ error: "Failed to load data summary." })
  }
}
