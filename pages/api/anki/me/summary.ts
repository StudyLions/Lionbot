// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-06
// Purpose: Session-authed Anki summary for the /dashboard/anki page — the
//          user's Anki review impact (reviews today/week/all-time, streak,
//          global rank, today's gold) + their LionGotchi (name/level/needs).
//
//          Auth is the NextAuth SESSION cookie (NOT an Anki bearer), like
//          /api/anki/devices — the user is browsing the dashboard, not the
//          addon. Stats come from the SAME getReviewStats() the bearer
//          /api/anki/me/stats uses, so the website + addon never disagree.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/utils/prisma"
import { getReviewStats } from "@/lib/anki/reviewStats"

async function getDiscordIdFromSession(req: NextApiRequest): Promise<string | null> {
  const token = await getToken({
    req,
    secret: process.env.SECRET,
    cookieName: "__Secure-next-auth.session-token.v2",
  })
  if (!token?.discordId) return null
  return token.discordId as string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed", message: "GET only" })
  }

  const discordId = await getDiscordIdFromSession(req)
  if (!discordId) {
    return res.status(401).json({ error: "not_authenticated", message: "Sign in with Discord first" })
  }
  const userId = BigInt(discordId)

  try {
    const [stats, pet] = await Promise.all([
      getReviewStats(userId),
      prisma.lg_pets.findUnique({
        where: { userid: userId },
        select: { pet_name: true, level: true, xp: true, food: true, bath: true, sleep: true, expression: true },
      }),
    ])
    return res.status(200).json({
      stats,
      pet: pet
        ? {
            name: pet.pet_name,
            level: pet.level,
            xp: pet.xp,
            food: pet.food,
            bath: pet.bath,
            sleep: pet.sleep,
            expression: pet.expression,
          }
        : null,
    })
  } catch (err) {
    console.error("[anki/me/summary] failed:", err)
    return res.status(503).json({ error: "db_unavailable", message: "Could not load summary" })
  }
}
