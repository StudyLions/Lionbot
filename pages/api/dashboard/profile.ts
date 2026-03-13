// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET/PATCH user profile settings
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const EDITABLE_FIELDS = ["timezone", "show_global_stats", "locale"] as const

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const profile = await prisma.user_config.findUnique({
      where: { userid: auth.userId },
    })

    if (!profile) {
      res.status(200).json({
        userId: auth.discordId,
        name: null,
        timezone: null,
        locale: null,
        showGlobalStats: null,
        gems: 0,
        firstSeen: null,
        lastSeen: null,
      })
      return
    }

    res.status(200).json({
      userId: profile.userid.toString(),
      name: profile.name,
      timezone: profile.timezone,
      locale: profile.locale,
      showGlobalStats: profile.show_global_stats,
      gems: profile.gems ?? 0,
      firstSeen: profile.first_seen?.toISOString() || null,
      lastSeen: profile.last_seen?.toISOString() || null,
    })
  },

  async PATCH(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const updates: Record<string, any> = {}
    const body = req.body

    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields to update" })
      return
    }

    if (updates.timezone !== undefined && updates.timezone !== null) {
      if (typeof updates.timezone !== "string" || updates.timezone.length > 50) {
        res.status(400).json({ error: "Invalid timezone" })
        return
      }
    }

    await prisma.user_config.upsert({
      where: { userid: auth.userId },
      update: updates,
      create: { userid: auth.userId, ...updates },
    })

    res.status(200).json({ success: true, updated: Object.keys(updates) })
  },
})
// --- END AI-MODIFIED ---
