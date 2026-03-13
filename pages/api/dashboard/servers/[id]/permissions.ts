// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Returns user's permission level for a specific server
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { getAuthContext, isModerator, isAdmin, isMember } from "@/utils/adminAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

  const auth = await getAuthContext(req)
  if (!auth) return res.status(401).json({ error: "Not authenticated" })

  const guildId = BigInt(req.query.id as string)

  const [member, mod, admin] = await Promise.all([
    isMember(auth.userId, guildId),
    isModerator(auth, guildId),
    isAdmin(auth, guildId),
  ])

  return res.status(200).json({
    isMember: member,
    isModerator: mod,
    isAdmin: admin,
  })
}
