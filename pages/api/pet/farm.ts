// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet farm API - view plots, water, harvest, plant, clear
//
// --- AI-MODIFIED (2026-06-04) ---
// All farm mechanics (plot mapping + plant/water/harvest/uproot/clear +
// bulk variants, with the gold spend/grant + rarity roll + harvest item
// drop) moved to lib/pet/farmService.ts so the Anki bearer route
// (pages/api/anki/pet/farm.ts) shares ONE validated, economy-correct path.
// This route is now a thin NextAuth adapter: GET = getFarmView + the
// web-only extras (ownedSeeds / history / fullscreen / skin); POST routes
// each action to the service and maps PetServiceError -> HTTP. Response
// shapes unchanged.
// --- END AI-MODIFIED ---
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { PetServiceError } from "@/lib/pet/careService"
import {
  getFarmView,
  plantSeed,
  waterPlot,
  harvestPlot,
  uprootPlot,
  clearPlot,
  waterAll,
  plantAll,
  harvestAll,
  removeByRarity,
} from "@/lib/pet/farmService"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    const userId = BigInt(auth.discordId)

    const view = await getFarmView(userId)

    const [ownedSeeds, pet] = await Promise.all([
      prisma.lg_user_inventory.findMany({
        where: { userid: userId, lg_items: { category: "FARM_SEED" as any } },
        select: {
          inventoryid: true,
          quantity: true,
          lg_items: { select: { itemid: true, name: true } },
        },
      }),
      prisma.lg_pets.findUnique({
        where: { userid: userId },
        select: { fullscreen_mode: true, active_gameboy_skin_id: true },
      }),
    ])

    let history: Array<{ type: string; amount: number; description: string; createdAt: string }> = []
    if (req.query.history === "true") {
      const txns = await prisma.lg_gold_transactions.findMany({
        where: {
          OR: [{ from_account: userId }, { to_account: userId }],
          transaction_type: { in: ["FARM_PLANT", "FARM_HARVEST"] },
        },
        orderBy: { created_at: "desc" },
        take: 20,
        select: { transaction_type: true, amount: true, description: true, created_at: true },
      })
      history = txns.map((t) => ({
        type: String(t.transaction_type),
        amount: t.amount,
        description: t.description || "",
        createdAt: t.created_at?.toISOString() || "",
      }))
    }

    const skinRow = pet?.active_gameboy_skin_id
      ? await prisma.lg_gameboy_skins.findUnique({
          where: { skin_id: pet.active_gameboy_skin_id },
          select: { asset_path: true },
        })
      : null

    return res.status(200).json({
      plots: view.plots,
      history,
      fullscreenMode: pet?.fullscreen_mode ?? false,
      gameboySkinPath: skinRow?.asset_path ?? null,
      availableSeeds: view.availableSeeds,
      ownedSeeds: ownedSeeds.map((s) => ({
        inventoryId: Number(s.inventoryid),
        quantity: s.quantity,
        itemId: Number(s.lg_items.itemid),
        name: s.lg_items.name,
      })),
      gold: view.gold,
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return
    const userId = BigInt(auth.discordId)
    const { action, plotId, seedId, rarity } = req.body

    try {
      switch (action) {
        case "plant":
          return res.status(200).json(await plantSeed(userId, plotId, seedId))
        case "water":
          return res.status(200).json(await waterPlot(userId, plotId))
        case "harvest":
          return res.status(200).json(await harvestPlot(userId, plotId))
        case "remove":
          return res.status(200).json(await uprootPlot(userId, plotId))
        case "clear":
          return res.status(200).json(await clearPlot(userId, plotId))
        case "waterAll":
          return res.status(200).json(await waterAll(userId))
        case "plantAll":
          return res.status(200).json(await plantAll(userId, seedId))
        case "harvestAll":
          return res.status(200).json(await harvestAll(userId))
        case "removeByRarity":
          return res.status(200).json(await removeByRarity(userId, rarity))
        case "toggleFullscreen": {
          const pet = await prisma.lg_pets.findUnique({
            where: { userid: userId },
            select: { fullscreen_mode: true },
          })
          if (!pet) return res.status(404).json({ error: "Pet not found" })
          const newMode = !pet.fullscreen_mode
          await prisma.lg_pets.update({
            where: { userid: userId },
            data: { fullscreen_mode: newMode },
          })
          return res.status(200).json({ success: true, fullscreenMode: newMode })
        }
        default:
          if (!action) return res.status(400).json({ error: "action required" })
          return res.status(400).json({
            error: "Invalid action. Use 'water', 'harvest', 'plant', 'remove', 'clear', or 'toggleFullscreen'",
          })
      }
    } catch (err) {
      if (err instanceof PetServiceError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }
  },
})
