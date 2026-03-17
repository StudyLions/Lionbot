// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: List all gameboy skins with ownership, eligibility,
//          and active status for the skin gallery page
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const [allSkins, pet, userConfig, ownedRows] = await Promise.all([
      prisma.lg_gameboy_skins.findMany({ orderBy: [{ theme: "asc" }, { color: "asc" }] }),
      prisma.lg_pets.findUnique({
        where: { userid: userId },
        select: { level: true, active_gameboy_skin_id: true },
      }),
      prisma.user_config.findUnique({
        where: { userid: userId },
        select: { gold: true, gems: true },
      }),
      prisma.lg_user_gameboy_skins.findMany({
        where: { userid: userId },
        select: { skin_id: true },
      }),
    ])

    if (!pet) {
      return res.status(200).json({ hasPet: false, skins: [], themes: [] })
    }

    const ownedSet = new Set(ownedRows.map((r) => r.skin_id))
    const petLevel = pet.level
    const gold = Number(userConfig?.gold ?? BigInt(0))
    const gems = userConfig?.gems ?? 0
    const activeSkinId = pet.active_gameboy_skin_id

    const skins = allSkins.map((s) => {
      const unlockType = String(s.unlock_type)
      const isActive = s.skin_id === activeSkinId

      let owned = false
      let eligible = false

      if (unlockType === "FREE") {
        owned = true
        eligible = true
      } else if (unlockType === "LEVEL") {
        eligible = petLevel >= (s.unlock_level ?? 999)
        owned = eligible
      } else if (unlockType === "GOLD") {
        owned = ownedSet.has(s.skin_id)
        eligible = owned || gold >= (s.gold_price ?? 0)
      } else if (unlockType === "GEMS") {
        owned = ownedSet.has(s.skin_id)
        eligible = owned || gems >= (s.gem_price ?? 0)
      }

      return {
        skinId: s.skin_id,
        theme: s.theme,
        color: s.color,
        assetPath: s.asset_path,
        unlockType,
        unlockLevel: s.unlock_level,
        goldPrice: s.gold_price,
        gemPrice: s.gem_price,
        owned,
        eligible,
        active: isActive,
      }
    })

    const themes = Array.from(new Set(allSkins.map((s) => s.theme)))

    return res.status(200).json({
      hasPet: true,
      skins,
      themes,
      activeSkinId,
      petLevel,
      gold: gold.toString(),
      gems,
    })
  },
})
