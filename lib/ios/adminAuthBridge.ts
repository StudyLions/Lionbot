// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Single-function bridge that lets utils/adminAuth.ts accept
//          the LionBot iOS app's signed-JWT bearer in addition to
//          the NextAuth browser cookie -- WITHOUT putting any iOS
//          logic inside utils/adminAuth.ts itself.
//
//          Why it lives here:
//            adminAuth.ts is touched constantly by website work. If
//            we keep iOS logic inline there, the iOS dev branch and
//            the website dev branch keep colliding when Ari works
//            from two computers at once. By isolating the iOS path
//            into this file, the touch in adminAuth.ts is reduced
//            to a single delegating call, and all real iOS logic
//            lives under lib/ios/ where the website team never edits.
//
//          Returns a structurally-compatible AuthContext payload --
//          the local IosAuthResult type intentionally has the same
//          three fields as utils/adminAuth.ts AuthContext so we
//          don't introduce a circular import.
// ============================================================
import type { NextApiRequest } from "next"
import { extractBearer, verifyIosBearer } from "./auth"

export interface IosAuthResult {
  discordId: string
  userId: bigint
  accessToken: string
}

/**
 * Best-effort iOS bearer authentication. Returns null when:
 *   - There is no Authorization: Bearer <…> header.
 *   - The header is present but the JWT is invalid / expired / wrong-version.
 *
 * Returns a populated context (Discord id + decrypted Discord access token)
 * when the bearer verifies successfully.
 *
 * The caller (utils/adminAuth.ts) always tries the NextAuth cookie first;
 * this function is the fall-through for clients that authenticate without
 * a browser cookie (i.e. the LionBot iOS app).
 */
export async function tryIosBearerAuth(
  req: NextApiRequest
): Promise<IosAuthResult | null> {
  const bearer = extractBearer(req)
  if (!bearer) return null

  const verified = await verifyIosBearer(bearer)
  if (!verified) return null

  return {
    discordId: verified.discordId,
    userId: BigInt(verified.discordId),
    accessToken: verified.discordAccessToken,
  }
}
