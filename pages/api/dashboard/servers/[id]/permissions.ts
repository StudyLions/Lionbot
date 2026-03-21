// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Returns user's permission level for a specific server
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: switched to requireAuth for rate limiting, added try/catch
import { requireAuth, isModerator, isAdmin, isMember } from "@/utils/adminAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

  const auth = await requireAuth(req, res)
  if (!auth) return

  // --- AI-MODIFIED (2026-03-21) ---
  // Purpose: Distinguish Discord 401 (expired token → client should re-auth)
  //          from other errors (transient → client should retry)
  try {
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
  } catch (err: any) {
    console.error("Permissions error:", err)
    if (err?.discordStatus === 401) {
      return res.status(401).json({ error: "Discord session expired. Please sign in again." })
    }
    return res.status(500).json({ error: "Failed to check permissions" })
  }
  // --- END AI-MODIFIED ---
}
// --- END AI-MODIFIED ---
