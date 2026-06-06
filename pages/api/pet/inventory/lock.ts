// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-23
// Purpose: Toggle the is_locked flag on a single inventory row.
//          Locked items are hidden from the sell picker and blocked
//          from gift / enhance / other destructive actions across
//          the website. Authenticated; ownership is enforced before
//          mutating the row.
//
// --- AI-MODIFIED (2026-06-04) ---
// Validation + mutation moved to lib/pet/inventoryService.setItemLock so
// the Anki bearer route (pages/api/anki/pet/inventory/lock.ts) shares one
// validated path. This route keeps its web rate-limit + NextAuth; response
// unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { checkRateLimit } from "@/utils/rateLimit"
import { setItemLock } from "@/lib/pet/inventoryService"
import { PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    if (!checkRateLimit(`lock:${auth.discordId}`, 500)) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment." })
    }

    const { inventoryId, locked } = req.body as {
      inventoryId?: number | string
      locked?: boolean
    }

    try {
      const result = await setItemLock(BigInt(auth.discordId), inventoryId, locked)
      return res.status(200).json(result)
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
