// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Mint + verify the LionGotchi-for-Anki addon bearer JWT.
//
//          Mirrors lib/ios/auth.ts shape but with deliberate
//          differences:
//            1. NO Discord access/refresh tokens encrypted inside.
//               The Anki addon never calls Discord directly, so a
//               leaked bearer cannot impersonate the user against
//               Discord at all (compare: a leaked iOS bearer can,
//               because the iOS app does call Discord).
//            2. New claims: `did` (device_id), `scp` (scopes),
//               `jti` (random id for future per-token revocation).
//            3. Different signing key: derived from the SAME SECRET
//               but with a different domain-separation salt
//               (`|anki-bearer|v1`) so a bug in one path can't
//               affect the other.
//            4. Short TTL (1h). Refresh tokens (opaque, NOT JWTs)
//               live in the anki_devices table as sha256 hashes
//               and rotate on every use, with reuse detection that
//               revokes the whole device on tamper.
//
//          Used by:
//            - pages/api/anki/auth/exchange.ts (mint)
//            - pages/api/anki/auth/refresh.ts  (mint + rotate)
//            - pages/api/anki/auth/me.ts       (verify)
//            - pages/api/anki/auth/signout.ts  (verify)
//            - pages/api/anki/reviews.ts       (verify + scope check)
//            - pages/api/anki/pet-portrait.ts  (verify + scope check)
//            - pages/api/anki/me/stats.ts      (verify + scope check)
//            - lib/anki/requireAuth.ts         (route wrapper)
//
//          To rotate all Anki sessions en masse, bump
//          ANKI_JWT_VERSION in lib/anki/version.ts and redeploy.
// ============================================================
import crypto from "crypto"
import { SignJWT, jwtVerify } from "jose"
import type { NextApiRequest } from "next"
import { ANKI_JWT_VERSION, ANKI_JWT_TTL } from "./version"

export { ANKI_JWT_VERSION, ANKI_JWT_TTL }

const SECRET = process.env.SECRET

if (!SECRET) {
  console.warn(
    "[lib/anki/auth] SECRET env var is not set. Anki bearer tokens will fail to mint or verify."
  )
}

// HMAC key for jose (HS256). Domain-separated from
// lib/ios/auth.ts which uses `|ios-discord-token|v1` — a bug in
// one signing pipeline cannot accept tokens from the other.
const ankiJwtKey: Uint8Array = new TextEncoder().encode(
  crypto
    .createHash("sha256")
    .update((SECRET || "") + "|anki-bearer|v1")
    .digest("hex")
)

export type AnkiScope = "anki.review.write" | "anki.pet.read"

export const DEFAULT_ANKI_SCOPES: AnkiScope[] = [
  "anki.review.write",
  "anki.pet.read",
]

export interface VerifiedAnkiBearer {
  /** Discord snowflake (string, NOT bigint — JWT sub is a string). */
  discordId: string
  /** UUID v4 — primary key into anki_devices. Caller must check `revoked_at IS NULL`. */
  deviceId: string
  /** Granted scopes for this token. */
  scopes: AnkiScope[]
  /** Per-token random ID. Reserved for a future revocation list. */
  jti: string
  /** Version sentinel (matches ANKI_JWT_VERSION at mint time). */
  ver: string
  /** Issued-at unix seconds. */
  iat: number
  /** Expiration unix seconds. */
  exp: number
}

export interface MintAnkiBearerParams {
  discordId: string
  deviceId: string
  scopes?: AnkiScope[]
}

/**
 * Mint a new Anki bearer JWT. Sub-second deterministic IO.
 *
 * Stages 1+: callers should also write/refresh the corresponding
 * row in `anki_devices` so the bearer can be revoked per-device.
 */
export async function mintAnkiBearer(
  params: MintAnkiBearerParams
): Promise<string> {
  if (!SECRET) {
    throw new Error("lib/anki/auth.mintAnkiBearer: SECRET env var is not set")
  }
  const scopes = params.scopes || DEFAULT_ANKI_SCOPES
  const jti = crypto.randomBytes(16).toString("base64url")

  return new SignJWT({
    did: params.deviceId,
    scp: scopes,
    ver: ANKI_JWT_VERSION,
    jti,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(params.discordId)
    .setIssuedAt()
    .setExpirationTime(ANKI_JWT_TTL)
    .sign(ankiJwtKey)
}

/**
 * Verify an Anki bearer JWT. Returns null on any failure (bad
 * signature, expired, wrong version, missing claims).
 *
 * This does NOT check device-level revocation — the caller MUST
 * additionally look up `anki_devices` by `deviceId` and confirm
 * `revoked_at IS NULL`. That check is in lib/anki/requireAuth.ts.
 *
 * Pure crypto + claim validation; no DB / network IO here so
 * this function is safe to call from edge runtimes (though we
 * don't today).
 */
export async function verifyAnkiBearer(
  token: string
): Promise<VerifiedAnkiBearer | null> {
  if (!SECRET || !token) return null

  try {
    const { payload } = await jwtVerify(token, ankiJwtKey, {
      algorithms: ["HS256"],
    })

    if (payload.ver !== ANKI_JWT_VERSION) return null
    if (typeof payload.sub !== "string" || !payload.sub) return null
    if (typeof payload.did !== "string" || !payload.did) return null
    if (typeof payload.jti !== "string" || !payload.jti) return null
    if (!Array.isArray(payload.scp)) return null
    if (typeof payload.iat !== "number") return null
    if (typeof payload.exp !== "number") return null

    // Filter to known scopes only — defends against a future
    // scope being added in mint and accidentally trusted by an
    // older verifier deployment.
    const scopes = (payload.scp as unknown[]).filter(
      (s): s is AnkiScope =>
        s === "anki.review.write" || s === "anki.pet.read"
    )

    return {
      discordId: payload.sub,
      deviceId: payload.did,
      scopes,
      jti: payload.jti,
      ver: payload.ver,
      iat: payload.iat,
      exp: payload.exp,
    }
  } catch {
    // Any verify error (bad signature, expired, malformed) -> treat as no auth
    return null
  }
}

/**
 * Read the bearer token out of the Authorization header. Returns
 * null if the header is missing or doesn't start with "Bearer ".
 *
 * Duplicated from lib/ios/auth.ts deliberately — keeping the
 * helper self-contained in lib/anki/ means future Anki-only
 * tweaks (e.g. accepting a query-string token for the
 * pet-portrait endpoint so <img> tags can load it) live here
 * without touching iOS code.
 */
export function extractAnkiBearer(req: NextApiRequest): string | null {
  const header = req.headers["authorization"] || req.headers["Authorization"]
  if (!header || typeof header !== "string") return null
  const trimmed = header.trim()
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null
  const token = trimmed.slice(7).trim()
  return token || null
}

/**
 * Mint a new opaque refresh token. NOT a JWT — this is a plain
 * random string that the server stores as sha256(token) in
 * `anki_devices.refresh_token_hash`. The plaintext only ever
 * exists in memory long enough to be returned to the addon.
 *
 * Returns `{ token, hash }`. Store the hash, return the token.
 */
export function mintAnkiRefreshToken(): { token: string; hash: Buffer } {
  // 32 bytes -> 43 char base64url -> 256 bits of entropy.
  const raw = crypto.randomBytes(32)
  const token = raw.toString("base64url")
  const hash = crypto.createHash("sha256").update(token).digest()
  return { token, hash }
}

/**
 * Compute the sha256 of a refresh token presented by the addon
 * for comparison against `anki_devices.refresh_token_hash`.
 * Use `crypto.timingSafeEqual` for the actual comparison.
 */
export function hashAnkiRefreshToken(token: string): Buffer {
  return crypto.createHash("sha256").update(token).digest()
}

/**
 * Hash a pairing code for storage. Same domain as the refresh
 * token (sha256) — pairing codes are also single-use opaque
 * secrets that should never be stored at rest in plaintext.
 */
export function hashAnkiPairingCode(code: string): Buffer {
  // Pairing codes are case-insensitive (user-typed). Normalize.
  const normalized = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  return crypto.createHash("sha256").update(normalized).digest()
}

/**
 * Generate a new pairing code. 12 characters from the 32-symbol
 * alphabet `[A-HJ-NP-Z2-9]` (no ambiguous O/0/I/1/L). 12 * 5 = 60
 * bits of entropy — enough for a 5-minute single-use code.
 *
 * Returns the human-readable form with dashes for legibility:
 *   "ABCD-1234-EFGH"
 * The hash function normalizes by stripping non-alphanumerics
 * and uppercasing, so either form round-trips.
 */
export function generateAnkiPairingCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // 32 chars
  const bytes = crypto.randomBytes(12)
  const chars = Array.from(bytes, (b) => alphabet[b % 32]).join("")
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`
}

/**
 * Compute the server-side review_id hash that goes into
 * anki_review_events.review_id (BYTEA PRIMARY KEY).
 *
 * Composition (must match the client and the schema doc):
 *   sha256(
 *     discord_id_ascii_bytes ||
 *     "|" ||
 *     anki_user_guid_utf8_bytes ||
 *     "|" ||
 *     card_id_decimal_ascii ||
 *     "|" ||
 *     reviewed_at_unix_seconds_decimal_ascii ||
 *     "|" ||
 *     ease_decimal_ascii
 *   )
 *
 * Using ASCII rather than fixed-width binary encoding makes the
 * hash trivially reproducible in any language (Python addon,
 * curl + sha256sum, manual debugging) without endianness
 * questions.
 */
export function computeAnkiReviewId(params: {
  discordId: string
  ankiUserGuid: string
  cardId: bigint | number | string
  reviewedAtUnixSeconds: number
  ease: number
}): Buffer {
  const payload = [
    params.discordId,
    params.ankiUserGuid,
    String(params.cardId),
    String(params.reviewedAtUnixSeconds),
    String(params.ease),
  ].join("|")
  return crypto.createHash("sha256").update(payload, "utf8").digest()
}

/**
 * Constant-time string compare. Wraps Buffer.equals timingSafeEqual
 * with length normalization so callers don't accidentally leak
 * length on mismatched inputs.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8")
  const bb = Buffer.from(b, "utf8")
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

/**
 * Constant-time buffer compare with length check.
 */
export function timingSafeBufferEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
