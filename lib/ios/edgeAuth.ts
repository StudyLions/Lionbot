// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Edge-runtime-compatible iOS bearer JWT verification.
//          Used by `middleware.js` to gate /api/dashboard/* and
//          /api/pet/* without blocking the LionBot iOS app.
//
//          Why a separate file: the regular `lib/ios/auth.ts`
//          imports Node's `crypto` module (for AES-GCM encryption
//          of the Discord access/refresh tokens). That import is
//          NOT available in the Edge runtime where Next.js
//          middleware runs. This file uses only `jose` (Web Crypto
//          backed) so it is safe to import from middleware.
//
//          What this file DOES verify:
//            - The bearer is a syntactically valid JWT.
//            - The signature is valid against `process.env.SECRET`.
//            - The `ver` claim equals `IOS_JWT_VERSION` ("ios-1").
//            - The `sub` claim is a non-empty string (Discord id).
//
//          What this file does NOT do:
//            - Decrypt the embedded Discord access/refresh tokens
//              (those need Node `crypto` -- decrypted later by
//              `verifyIosBearer` in `lib/ios/auth.ts`, called by
//              the route handler via `tryIosBearerAuth`).
//
//          Defense-in-depth: middleware lets the request through
//          on signature pass, then the API route still calls
//          `requireAuth` / `requireModerator` / `requireAdmin`
//          which run the FULL verification (signature + decrypt)
//          via the `lib/ios/adminAuthBridge.ts` bridge inside
//          `utils/adminAuth.ts.getAuthContext`. Same SECRET, same
//          version, so both checks agree.
// ============================================================
import { jwtVerify } from "jose"
import type { NextRequest } from "next/server"

// Mirrors lib/ios/auth.ts IOS_JWT_VERSION. Kept inline so this
// file has zero imports from the Node-only sibling module.
const IOS_JWT_VERSION = "ios-1"

const SECRET = process.env.SECRET

const jwtKey = new TextEncoder().encode(SECRET || "")

export interface EdgeIosBearerResult {
  discordId: string
}

/**
 * Pull a `Bearer <token>` value out of the Authorization header.
 * Returns null if the header is missing, malformed, or empty.
 */
export function extractBearerEdge(req: NextRequest): string | null {
  const header = req.headers.get("authorization")
  if (!header) return null

  const trimmed = header.trim()
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null

  const token = trimmed.slice(7).trim()
  return token || null
}

/**
 * Best-effort iOS bearer JWT signature + version + sub verification
 * suitable for Edge runtime. Returns the Discord id on success or
 * null on any failure (bad signature, wrong version, expired, etc).
 *
 * The middleware uses this as a green light to let the request
 * proceed to the API route handler. The route handler then runs the
 * FULL verification via `tryIosBearerAuth` (which decrypts the
 * embedded Discord access token) before any database access.
 */
export async function verifyIosBearerEdge(
  token: string
): Promise<EdgeIosBearerResult | null> {
  if (!SECRET || !token) return null

  try {
    const { payload } = await jwtVerify(token, jwtKey, {
      algorithms: ["HS256"],
    })

    if (payload.ver !== IOS_JWT_VERSION) return null
    if (typeof payload.sub !== "string" || !payload.sub) return null

    return { discordId: payload.sub }
  } catch {
    return null
  }
}
