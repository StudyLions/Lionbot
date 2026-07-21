// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: Core primitives for the addon's standalone email/password
//          accounts (no Discord needed):
//            - scrypt password hashing (node:crypto — no native deps,
//              Vercel-lambda safe) with per-user salt + timing-safe
//              verify, self-describing "scrypt$N$r$p$salt$hash" format
//              so parameters can be raised later without breaking old
//              hashes.
//            - 6-digit verification / reset codes: only sha256(code)
//              at rest, 15-min TTL, max 5 guesses per code, single-use,
//              60s resend cooldown + hourly cap per (email, purpose).
//            - synthetic userid allocation in [9.0e18, 9.2e18) — a
//              BIGINT band real Discord snowflakes can't reach until
//              ~2083, so email users key into every existing table
//              (user_config, lg_pets, anki_devices...) without ever
//              colliding with a Discord account.
//            - input validation (email shape, password policy, display
//              name sanitation).
//
//          Threat notes:
//            - No user enumeration: callers return generic responses;
//              helpers here never throw "email exists" style errors to
//              the client (see the route files for response policy).
//            - Codes are 6 digits (1e6 space) but: 5 attempts/code,
//              15-min expiry, per-IP + per-email send caps, and a new
//              code invalidates prior ones → brute-force success
//              probability ≤ 5e-6 per issued code.
// ============================================================
import crypto from "crypto"
import { prisma } from "@/utils/prisma"

// ---------------------------------------------------------------
// Password hashing (scrypt)
// ---------------------------------------------------------------

// N=2^15, r=8, p=1 ≈ 30–60ms on a lambda vCPU — strong for an
// interactive login without risking function timeouts.
const SCRYPT_N = 32768
const SCRYPT_R = 8
const SCRYPT_P = 1
const SCRYPT_KEYLEN = 64
const SCRYPT_MAXMEM = 128 * 1024 * 1024 // headroom: N*r*128 ≈ 33.5MB

function scryptAsync(
  password: string,
  salt: Buffer,
  N: number,
  r: number,
  p: number,
  keylen: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      keylen,
      { N, r, p, maxmem: SCRYPT_MAXMEM },
      (err, derived) => (err ? reject(err) : resolve(derived))
    )
  })
}

/** Hash a password → "scrypt$N$r$p$salt_b64$hash_b64". */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16)
  const derived = await scryptAsync(
    password,
    salt,
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    SCRYPT_KEYLEN
  )
  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$")
}

/** Timing-safe verify against a stored "scrypt$..." string. */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  try {
    const parts = stored.split("$")
    if (parts.length !== 6 || parts[0] !== "scrypt") return false
    const N = parseInt(parts[1], 10)
    const r = parseInt(parts[2], 10)
    const p = parseInt(parts[3], 10)
    if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p))
      return false
    // Cap parameters so a tampered hash string can't DoS the lambda.
    if (N > 1 << 17 || r > 16 || p > 4) return false
    const salt = Buffer.from(parts[4], "base64")
    const expected = Buffer.from(parts[5], "base64")
    if (salt.length < 8 || expected.length < 32) return false
    const derived = await scryptAsync(password, salt, N, r, p, expected.length)
    return crypto.timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------
// Verification / reset codes
// ---------------------------------------------------------------

export const CODE_TTL_MS = 15 * 60_000
export const CODE_MAX_ATTEMPTS = 5
export const CODE_RESEND_COOLDOWN_MS = 60_000
export const CODE_MAX_SENDS_PER_HOUR = 5

export type CodePurpose = "verify" | "reset"

export function hashCode(code: string): Buffer {
  return crypto.createHash("sha256").update(code, "utf8").digest()
}

/** Crypto-random 6-digit code, zero-padded ("042913"). */
export function mintCode(): { code: string; hash: Buffer } {
  const n = crypto.randomInt(0, 1_000_000)
  const code = n.toString().padStart(6, "0")
  return { code, hash: hashCode(code) }
}

/**
 * Issue a fresh code for (email, purpose): enforces the 60s resend
 * cooldown + hourly cap, consumes (invalidates) any prior outstanding
 * codes, inserts the new hashed row. Returns the plaintext code to
 * email, or a cooldown error. NEVER returns the code to the client.
 */
export async function issueCode(
  email: string,
  purpose: CodePurpose,
  userid: bigint | null
): Promise<
  | { ok: true; code: string }
  | { ok: false; error: "cooldown" | "hourly_cap"; retryAfterSec: number }
> {
  const now = Date.now()
  const recent = await prisma.anki_email_codes.findFirst({
    where: { email, purpose },
    orderBy: { created_at: "desc" },
    select: { created_at: true },
  })
  if (recent) {
    const since = now - recent.created_at.getTime()
    if (since < CODE_RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        error: "cooldown",
        retryAfterSec: Math.ceil((CODE_RESEND_COOLDOWN_MS - since) / 1000),
      }
    }
  }
  const lastHour = await prisma.anki_email_codes.count({
    where: { email, purpose, created_at: { gte: new Date(now - 3_600_000) } },
  })
  if (lastHour >= CODE_MAX_SENDS_PER_HOUR) {
    return { ok: false, error: "hourly_cap", retryAfterSec: 3600 }
  }

  const { code, hash } = mintCode()
  await prisma.$transaction([
    // A new code invalidates all prior outstanding ones — there is
    // never more than one guessable code in flight per (email,purpose).
    prisma.anki_email_codes.updateMany({
      where: { email, purpose, consumed_at: null },
      data: { consumed_at: new Date() },
    }),
    prisma.anki_email_codes.create({
      data: {
        email,
        purpose,
        code_hash: hash,
        userid,
        expires_at: new Date(now + CODE_TTL_MS),
      },
    }),
  ])
  return { ok: true, code }
}

/**
 * Advance the SAME (email, "verify") cooldown + hourly-cap bookkeeping
 * as issueCode, but WITHOUT minting a usable code or sending mail.
 *
 * Used by the register route's already-verified-account branch so its
 * responses (200, then 429 on a fast retry) are indistinguishable from
 * a fresh email's — closing the "two register calls classify
 * verified-vs-everything-else" enumeration oracle. The decoy row's
 * code_hash is 32 random bytes, which can never equal sha256(any
 * 6-digit string), so checkAndConsumeCode can never accept it: there
 * is no auth-bypass risk from these inert rows.
 */
export async function touchCodeCooldown(
  email: string
): Promise<
  | { ok: true }
  | { ok: false; error: "cooldown" | "hourly_cap"; retryAfterSec: number }
> {
  const now = Date.now()
  const recent = await prisma.anki_email_codes.findFirst({
    where: { email, purpose: "verify" },
    orderBy: { created_at: "desc" },
    select: { created_at: true },
  })
  if (recent) {
    const since = now - recent.created_at.getTime()
    if (since < CODE_RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        error: "cooldown",
        retryAfterSec: Math.ceil((CODE_RESEND_COOLDOWN_MS - since) / 1000),
      }
    }
  }
  const lastHour = await prisma.anki_email_codes.count({
    where: { email, purpose: "verify", created_at: { gte: new Date(now - 3_600_000) } },
  })
  if (lastHour >= CODE_MAX_SENDS_PER_HOUR) {
    return { ok: false, error: "hourly_cap", retryAfterSec: 3600 }
  }
  await prisma.anki_email_codes.create({
    data: {
      email,
      purpose: "verify",
      code_hash: crypto.randomBytes(32), // never matches a 6-digit code
      userid: null,
      expires_at: new Date(now + CODE_TTL_MS),
    },
  })
  return { ok: true }
}

/**
 * Check a submitted code for (email, purpose). Atomic attempt
 * accounting: the attempt counter is bumped BEFORE comparing, so
 * parallel guesses can't exceed CODE_MAX_ATTEMPTS. On success the
 * code is consumed (single-use, compare-and-swap so two concurrent
 * submissions can't both win). Returns the row's userid on success.
 */
export async function checkAndConsumeCode(
  email: string,
  purpose: CodePurpose,
  submitted: string
): Promise<
  | { ok: true; userid: bigint | null }
  | { ok: false; error: "invalid_code" | "expired_code" | "too_many_attempts" }
> {
  const row = await prisma.anki_email_codes.findFirst({
    where: { email, purpose, consumed_at: null },
    orderBy: { created_at: "desc" },
  })
  if (!row) return { ok: false, error: "invalid_code" }
  if (row.expires_at.getTime() < Date.now()) {
    return { ok: false, error: "expired_code" }
  }

  // Bump attempts atomically and re-read the post-bump count; only
  // proceed when this attempt is within budget.
  const bumped = await prisma.anki_email_codes.updateMany({
    where: { id: row.id, attempts: { lt: CODE_MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  })
  if (bumped.count === 0) {
    return { ok: false, error: "too_many_attempts" }
  }

  const match = crypto.timingSafeEqual(
    hashCode(submitted),
    Buffer.from(row.code_hash)
  )
  if (!match) return { ok: false, error: "invalid_code" }

  // Consume: CAS on consumed_at so exactly one submission wins.
  const consumed = await prisma.anki_email_codes.updateMany({
    where: { id: row.id, consumed_at: null },
    data: { consumed_at: new Date() },
  })
  if (consumed.count === 0) return { ok: false, error: "invalid_code" }
  return { ok: true, userid: row.userid }
}

// ---------------------------------------------------------------
// Synthetic userid allocation
// ---------------------------------------------------------------

// [9.0e18, 9.2e18): below BIGINT max (9.223e18), far above any real
// Discord snowflake for the next ~60 years. 2e17 of space → random
// collisions are vanishingly rare; we re-roll on conflict anyway.
// (BigInt() constructor, not literals — tsconfig targets es5.)
// Exported: the cleanup cron uses the band to find orphaned game rows
// (a user_config in this band with NO anki_email_accounts row can only
// be a half-finished account deletion — nothing else mints these ids).
export const SYNTH_MIN = BigInt("9000000000000000000")
export const SYNTH_SPAN = BigInt("200000000000000000")

export function isSyntheticUserid(userid: bigint): boolean {
  return userid >= SYNTH_MIN && userid < SYNTH_MIN + SYNTH_SPAN
}

export function randomSyntheticUserid(): bigint {
  // 8 random bytes → uniform-enough offset into the 2e17 span.
  const rand = crypto.randomBytes(8).readBigUInt64BE()
  return SYNTH_MIN + (rand % SYNTH_SPAN)
}

/**
 * Allocate an unused synthetic userid. Checks both the accounts table
 * and user_config so we never collide with anything that exists.
 */
export async function allocateSyntheticUserid(): Promise<bigint> {
  for (let i = 0; i < 5; i++) {
    const candidate = randomSyntheticUserid()
    const [acct, cfg] = await Promise.all([
      prisma.anki_email_accounts.findUnique({
        where: { userid: candidate },
        select: { userid: true },
      }),
      prisma.user_config.findUnique({
        where: { userid: candidate },
        select: { userid: true },
      }),
    ])
    if (!acct && !cfg) return candidate
  }
  throw new Error("Could not allocate a synthetic userid after 5 attempts")
}

// ---------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Normalize + validate an email. Returns the lowercased address or null. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  const email = raw.trim().toLowerCase()
  if (email.length < 6 || email.length > 254) return null
  if (!EMAIL_RE.test(email)) return null
  return email
}

/** NIST-style policy: length is what matters. 8..128 chars. */
export function validatePassword(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  if (raw.length < 8 || raw.length > 128) return null
  return raw
}

/** Display name: 2..32 visible chars, control chars stripped. */
export function normalizeDisplayName(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  // eslint-disable-next-line no-control-regex
  const name = raw.replace(/[\x00-\x1f\x7f]/g, "").trim()
  if (name.length < 2 || name.length > 32) return null
  return name
}
