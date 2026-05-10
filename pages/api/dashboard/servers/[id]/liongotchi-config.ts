// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: GET/PATCH LionGotchi guild settings (admin only)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin, requireAuth, isModerator } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-05-10) ---
// Purpose: Use parseBigInt for 400 instead of 500 on invalid guild IDs
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

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
    const guildId = parseBigInt(req.query.id, "guild ID")
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
    const guildId = parseBigInt(req.query.id, "guild ID")
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
        // --- AI-MODIFIED (2026-05-10) ---
        // Purpose: Graceful 400 on malformed snowflake IDs instead of uncaught BigInt crash
        if (val) {
          try { updates[field] = BigInt(val) } catch { return res.status(400).json({ error: `Invalid ID for ${field}` }) }
        } else { updates[field] = null }
        // --- END AI-MODIFIED ---
      } else {
        updates[field] = val
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    // --- AI-MODIFIED (2026-05-10) ---
    // Purpose: upsert instead of update — prevents 500 if guild_config row
    // doesn't exist yet (new guilds that haven't run any bot command yet).
    await prisma.guild_config.upsert({
      where: { guildid: guildId },
      update: updates,
      create: { guildid: guildId, ...updates },
    })
    // --- END AI-MODIFIED ---

    return res.status(200).json({ success: true, updated: Object.keys(updates) })
  },
})
