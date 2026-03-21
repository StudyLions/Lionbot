// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet crafting API - disabled (crafting system removed)
// ============================================================
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Crafting system removed. Equipment/scrolls now drop from activity.
// GET returns empty results, POST returns error.

export default apiHandler({
  async GET(req, res) {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: require signed-in user so the route is not anonymously enumerable/abusable
    const auth = await requireAuth(req, res)
    if (!auth) return
    // --- END AI-MODIFIED ---
    return res.status(200).json({
      recipes: [],
      gold: "0",
      gems: 0,
      totalCount: 0,
      page: 1,
      pageSize: 50,
      totalPages: 0,
    })
  },

  async POST(req, res) {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: require signed-in user for consistency with other pet APIs
    const auth = await requireAuth(req, res)
    if (!auth) return
    // --- END AI-MODIFIED ---
    return res.status(400).json({
      error: "Crafting is no longer available. Equipment and scrolls now drop directly from activity.",
    })
  },
})
// --- END AI-MODIFIED ---
