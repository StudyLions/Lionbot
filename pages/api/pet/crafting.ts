// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet crafting API - disabled (crafting system removed)
// ============================================================
import { apiHandler } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Crafting system removed. Equipment/scrolls now drop from activity.
// GET returns empty results, POST returns error.

export default apiHandler({
  async GET(_req, res) {
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

  async POST(_req, res) {
    return res.status(400).json({
      error: "Crafting is no longer available. Equipment and scrolls now drop directly from activity.",
    })
  },
})
// --- END AI-MODIFIED ---
