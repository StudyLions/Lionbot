// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet inventory API - list user items with filters.
//
// --- AI-MODIFIED (2026-06-02) ---
// Logic moved to lib/pet/inventoryService.listInventory so the Anki
// bearer route (pages/api/anki/pet/inventory.ts) shares one path.
// This route is now a thin NextAuth adapter. Response unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { listInventory } from "@/lib/pet/inventoryService"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    const filter = (req.query.filter as string) || "all"
    const result = await listInventory(BigInt(auth.discordId), filter)
    return res.status(200).json(result)
  },
})
