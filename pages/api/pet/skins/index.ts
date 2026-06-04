// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: List all gameboy skins with ownership, eligibility,
//          and active status for the skin gallery page
//
// --- AI-MODIFIED (2026-06-04) ---
// Logic moved to lib/pet/skinService.listSkins so the Anki bearer route
// (pages/api/anki/pet/skins.ts) shares one path. Thin NextAuth adapter;
// response unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { listSkins } from "@/lib/pet/skinService"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    return res.status(200).json(await listSkins(BigInt(auth.discordId)))
  },
})
