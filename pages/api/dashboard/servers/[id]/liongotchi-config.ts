// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: GET/PATCH LionGotchi guild settings (admin only)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin, requireAuth, isModerator } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const LG_FIELDS = [
  'lg_enabled',
  'lg_drop_channel',
  'lg_guild_display_name',
  'lg_teaser_enabled',
  'lg_activity_role',
  'lg_drop_delete_after',
] as const

const BIGINT_FIELDS = new Set(['lg_drop_channel', 'lg_activity_role'])

const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9 ]*$/

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAuth(req, res)
    if (!auth) return

    const hasModPerms = await isModerator(auth, guildId)
    if (!hasModPerms) return res.status(403).json({ error: "Not a moderator of this server" })

    const config = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: {
        lg_enabled: true,
        lg_drop_channel: true,
        lg_guild_display_name: true,
        lg_teaser_enabled: true,
        lg_activity_role: true,
        lg_drop_delete_after: true,
      },
    })
    if (!config) return res.status(404).json({ error: "Server not found" })

    const safe: Record<string, any> = {}
    for (const field of LG_FIELDS) {
      const val = (config as any)[field]
      if (BIGINT_FIELDS.has(field) && val != null) {
        safe[field] = val.toString()
      } else {
        safe[field] = val
      }
    }

    return res.status(200).json(safe)
  },

  async PATCH(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const body = req.body
    const updates: Record<string, any> = {}

    for (const field of LG_FIELDS) {
      if (!(field in body)) continue
      const val = body[field]

      if (field === 'lg_guild_display_name') {
        if (val != null) {
          const str = String(val).trim()
          if (str.length > 12) {
            return res.status(400).json({ error: "Display name must be 12 characters or fewer" })
          }
          if (!DISPLAY_NAME_REGEX.test(str)) {
            return res.status(400).json({ error: "Display name may only contain English letters, numbers, and spaces" })
          }
          updates[field] = str || null
        } else {
          updates[field] = null
        }
      } else if (field === 'lg_drop_delete_after') {
        if (val != null) {
          const num = Number(val)
          if (!Number.isInteger(num) || num < 10 || num > 600) {
            return res.status(400).json({ error: "Auto-delete timer must be between 10 and 600 seconds" })
          }
          updates[field] = num
        } else {
          updates[field] = null
        }
      } else if (BIGINT_FIELDS.has(field)) {
        updates[field] = val ? BigInt(val) : null
      } else {
        updates[field] = val
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    await prisma.guild_config.update({
      where: { guildid: guildId },
      data: updates,
    })

    return res.status(200).json({ success: true, updated: Object.keys(updates) })
  },
})
