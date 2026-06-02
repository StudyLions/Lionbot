// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-02
// Purpose: Consolidated pet snapshot for the Anki addon — one
//          round-trip giving the full pet care/level state, mood,
//          currency balance, and active room/skin so the addon can
//          render the pet screen natively. Bearer-auth (anki.pet.read),
//          rate-limited. Extensible: equipment / inventory / room
//          layout will be added as their native UIs land (Phase 1+).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { computeMood } from "@/lib/pet/careService"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed", message: "GET only" })
  }

  const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
  if (!ctx) return

  const rl = ankiRateLimit(ctx.userId, "me/pet")
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
  }

  try {
    const cfg = await prisma.user_config.findUnique({
      where: { userid: ctx.userId },
      select: {
        gold: true,
        gems: true,
        lg_pets: {
          select: {
            pet_name: true,
            level: true,
            xp: true,
            food: true,
            bath: true,
            sleep: true,
            life: true,
            expression: true,
            active_room_id: true,
            active_gameboy_skin_id: true,
            cosmetics_enabled: true,
          },
        },
      },
    })

    const pet = cfg?.lg_pets
    return res.status(200).json({
      pet: pet
        ? {
            pet_name: pet.pet_name,
            level: pet.level,
            xp: pet.xp.toString(),
            food: pet.food,
            bath: pet.bath,
            sleep: pet.sleep,
            life: pet.life,
            expression: pet.expression,
            active_room_id: pet.active_room_id,
            active_gameboy_skin_id: pet.active_gameboy_skin_id,
            cosmetics_enabled: pet.cosmetics_enabled,
            ...computeMood(pet.food, pet.bath, pet.sleep),
          }
        : null,
      currency: {
        gold: (cfg?.gold ?? BigInt(0)).toString(),
        gems: cfg?.gems ?? 0,
      },
    })
  } catch (err) {
    console.error("[anki/me/pet] lookup failed:", err)
    return res.status(503).json({ error: "db_unavailable", message: "Could not load pet state" })
  }
}
