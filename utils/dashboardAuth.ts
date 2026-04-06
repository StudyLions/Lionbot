// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Auth helper for dashboard API routes
// ============================================================
import { getToken } from "next-auth/jwt"
import type { NextApiRequest, NextApiResponse } from "next"

const secret = process.env.SECRET

export async function getDiscordId(req: NextApiRequest): Promise<string | null> {
  // --- AI-MODIFIED (2026-04-06) ---
  // Purpose: use versioned cookie name matching [...nextauth].js cookies config
  const token = await getToken({ req, secret, cookieName: '__Secure-next-auth.session-token.v2' })
  // --- END AI-MODIFIED ---
  return (token?.discordId as string) || null
}

export function unauthorized(res: NextApiResponse) {
  return res.status(401).json({ error: "Not authenticated. Please sign in with Discord." })
}
