// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Moved: 2026-04-30 from utils/iosAuth.ts -> lib/ios/auth.ts
// Purpose: Issue + verify signed JWT bearer tokens for the LionBot
//          iOS app. Discord access/refresh tokens are encrypted
//          with AES-256-GCM (key derived from the existing NextAuth
//          `SECRET`) so a leaked bearer cannot impersonate the user
//          against Discord directly.
//
//          Used by:
//            - pages/api/auth/ios/exchange.ts (mint)
//            - pages/api/auth/ios/me.ts       (verify)
//            - pages/api/auth/ios/signout.ts  (verify)
//            - lib/ios/adminAuthBridge.ts     (verify, bridges into
//                                              utils/adminAuth.ts)
//
//          To rotate iOS sessions en masse, bump IOS_JWT_VERSION
//          and the matching expected version in verifyIosBearer.
//
//          IMPORTANT (multi-machine coordination):
//          All iOS-only website code lives under Lionbot-Website/lib/ios/
//          so it never touches files the website team also edits. The
//          ONE exception is the 3-line bridge call inside
//          utils/adminAuth.ts -> getAuthContext, which delegates here.
// ============================================================
import crypto from "crypto"
import { SignJWT, jwtVerify } from "jose"
import type { NextApiRequest } from "next"

export const IOS_JWT_VERSION = "ios-1"
export const IOS_JWT_TTL = "30d"

const SECRET = process.env.SECRET

if (!SECRET) {
  console.warn(
    "[lib/ios/auth] SECRET env var is not set. iOS bearer tokens will fail to mint or verify."
  )
}

// HMAC key for jose (HS256)
const jwtKey = new TextEncoder().encode(SECRET || "")

// Symmetric key for the Discord access/refresh token envelope.
// Derived from SECRET so the iOS bearer can be verified without any
// extra env vars, while still being domain-separated from the JWT
// signing key by the salt below.
const ENCRYPTION_KEY: Buffer = crypto
  .createHash("sha256")
  .update((SECRET || "") + "|ios-discord-token|v1")
  .digest()

interface IosJwtClaims {
  sub: string // discord id (snowflake string)
  dat: string // encrypted Discord access token (base64url)
  drt: string // encrypted Discord refresh token (base64url, may be empty)
  ver: string // sentinel for rotation, e.g. "ios-1"
}

export interface VerifiedIosBearer {
  discordId: string
  discordAccessToken: string
  discordRefreshToken: string | null
}

function encryptToken(plaintext: string): string {
  if (!plaintext) return ""
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv)
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  // layout: iv(12) | ciphertext | tag(16) -> base64url
  return Buffer.concat([iv, ciphertext, tag]).toString("base64url")
}

function decryptToken(encoded: string): string {
  if (!encoded) return ""
  const buf = Buffer.from(encoded, "base64url")
  if (buf.length < 12 + 16) {
    throw new Error("lib/ios/auth: ciphertext is too short")
  }
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(buf.length - 16)
  const ciphertext = buf.subarray(12, buf.length - 16)
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv)
  decipher.setAuthTag(tag)
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])
  return plaintext.toString("utf8")
}

export async function mintIosBearer(params: {
  discordId: string
  discordAccessToken: string
  discordRefreshToken?: string | null
}): Promise<string> {
  if (!SECRET) {
    throw new Error("lib/ios/auth.mintIosBearer: SECRET env var is not set")
  }

  const claims: IosJwtClaims = {
    sub: params.discordId,
    dat: encryptToken(params.discordAccessToken),
    drt: encryptToken(params.discordRefreshToken || ""),
    ver: IOS_JWT_VERSION,
  }

  return new SignJWT({ dat: claims.dat, drt: claims.drt, ver: claims.ver })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(IOS_JWT_TTL)
    .sign(jwtKey)
}

export async function verifyIosBearer(token: string): Promise<VerifiedIosBearer | null> {
  if (!SECRET || !token) return null

  try {
    const { payload } = await jwtVerify(token, jwtKey, {
      algorithms: ["HS256"],
    })

    if (payload.ver !== IOS_JWT_VERSION) return null
    if (typeof payload.sub !== "string" || !payload.sub) return null
    if (typeof payload.dat !== "string") return null

    const discordAccessToken = decryptToken(payload.dat)
    if (!discordAccessToken) return null

    let discordRefreshToken: string | null = null
    if (typeof payload.drt === "string" && payload.drt) {
      try {
        const decrypted = decryptToken(payload.drt)
        discordRefreshToken = decrypted || null
      } catch {
        // refresh token is optional; don't fail the whole verify
        discordRefreshToken = null
      }
    }

    return {
      discordId: payload.sub,
      discordAccessToken,
      discordRefreshToken,
    }
  } catch {
    // Any verify error (bad signature, expired, malformed) -> treat as no auth
    return null
  }
}

export function extractBearer(req: NextApiRequest): string | null {
  const header = req.headers["authorization"] || req.headers["Authorization"]
  if (!header || typeof header !== "string") return null
  const trimmed = header.trim()
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null
  const token = trimmed.slice(7).trim()
  return token || null
}
