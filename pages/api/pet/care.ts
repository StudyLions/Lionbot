// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Pet care endpoint -- feed/bathe/sleep from the website.
//
// --- AI-MODIFIED (2026-06-02) ---
// The care logic (capped decay + one-click fill-to-max + mood) moved
// to lib/pet/careService.ts so the Anki addon's bearer-authed route
// (pages/api/anki/pet/care.ts) and this cookie-authed website route
// share ONE validated, economy-correct code path. This route is now a
// thin transport adapter: authenticate (NextAuth) -> applyCare() ->
// map PetServiceError to HTTP. Response shape is unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { applyCare, PetServiceError } from "@/lib/pet/careService"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { action } = req.body as { action?: string }

    try {
      const result = await applyCare(BigInt(auth.discordId), action ?? "")
      return res.status(200).json(result)
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
