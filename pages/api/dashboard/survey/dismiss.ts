// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-06
// Purpose: POST endpoint to dismiss the survey widget for 7 days
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const auth = await requireAuth(req, res)
  if (!auth) return

  await prisma.user_survey.upsert({
    where: { userid: auth.userId },
    update: { dismissed_at: new Date() },
    create: { userid: auth.userId, dismissed_at: new Date() },
  })

  return res.json({ status: "dismissed" })
}
