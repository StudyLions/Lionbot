// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET/PATCH user profile settings
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"

const EDITABLE_FIELDS = ["timezone", "show_global_stats", "locale"] as const

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  if (req.method === "GET") {
    const profile = await prisma.user_config.findUnique({
      where: { userid: auth.userId },
    })

    if (!profile) {
      return res.status(200).json({
        userId: auth.discordId,
        name: null,
        timezone: null,
        locale: null,
        showGlobalStats: null,
        gems: 0,
        firstSeen: null,
        lastSeen: null,
      })
    }

    return res.status(200).json({
      userId: profile.userid.toString(),
      name: profile.name,
      timezone: profile.timezone,
      locale: profile.locale,
      showGlobalStats: profile.show_global_stats,
      gems: profile.gems ?? 0,
      firstSeen: profile.first_seen?.toISOString() || null,
      lastSeen: profile.last_seen?.toISOString() || null,
    })
  }

  if (req.method === "PATCH") {
    const updates: Record<string, any> = {}
    const body = req.body

    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    if (updates.timezone !== undefined && updates.timezone !== null) {
      if (typeof updates.timezone !== "string" || updates.timezone.length > 50) {
        return res.status(400).json({ error: "Invalid timezone" })
      }
    }

    await prisma.user_config.upsert({
      where: { userid: auth.userId },
      update: updates,
      create: { userid: auth.userId, ...updates },
    })

    return res.status(200).json({ success: true, updated: Object.keys(updates) })
  }

  return res.status(405).json({ error: "Method not allowed" })
}
