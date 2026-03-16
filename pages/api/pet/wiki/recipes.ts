// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki recipes API - disabled (crafting system removed)
// ============================================================
import { apiHandler } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Crafting removed -- always return empty recipes list
export default apiHandler({
  async GET(_req, res) {
    return res.status(200).json({ recipes: [] })
  },
})
// --- END AI-MODIFIED ---
