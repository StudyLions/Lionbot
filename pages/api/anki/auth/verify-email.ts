// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: Activate an email account with its 6-digit code AND sign
//          the device in — one POST, so a brand-new user goes from
//          "typed a code" to "playing with their pet" with zero
//          extra steps (and never opens a browser).
//
//          Flow: {email, code, device_id, device_name, ...} →
//          checkAndConsumeCode (atomic attempts + single-use) →
//          mark account verified → finish the user_config row
//          (email + display name now that it's proven) → bootstrap
//          lg_pets → createDeviceSession → the exact same payload
//          the Discord pairing exchange returns.
//
//          Also serves RE-verification: if the account is already
//          verified and presents a fresh 'verify' code... that can't
//          happen (codes are only issued while unverified) — a stale
//          code just 401s. Login is the path for verified accounts.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import {
  checkAndConsumeCode,
  normalizeEmail,
} from "@/lib/anki/emailAccounts"
import {
  bootstrapGameAccount,
  createDeviceSession,
  extractIpPrefix,
} from "@/lib/anki/deviceSession"
import { ankiRateLimitByKey, clientIpKey } from "@/lib/anki/rateLimit"

interface VerifyBody {
  email?: string
  code?: string
  device_id?: string
  device_name?: string
  addon_version?: string
  os_platform?: string
  anki_version?: string
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CODE_RE = /^\d{6}$/

function sendError(
  res: NextApiResponse,
  status: number,
  error: string,
  message: string
) {
  return res.status(status).json({ error, message })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return sendError(res, 405, "method_not_allowed", "POST only")
  }

  // Code guessing is already bounded per-code (5 attempts, 15-min
  // TTL); this per-IP cap just blunts spray across many emails.
  const rl = ankiRateLimitByKey(`anki-verify:${clientIpKey(req)}`, 15, 60_000)
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return sendError(res, 429, "rate_limited", "Too many attempts — slow down.")
  }

  const body = (req.body || {}) as VerifyBody
  const email = normalizeEmail(body.email)
  const code = (body.code || "").trim()
  const { device_id, device_name } = body

  if (!email || !CODE_RE.test(code)) {
    return sendError(res, 400, "missing_fields", "Required: email, 6-digit code")
  }
  if (!device_id || !UUID_RE.test(device_id)) {
    return sendError(res, 400, "bad_device_id", "device_id must be a UUID")
  }
  if (!device_name || typeof device_name !== "string" || device_name.length > 64) {
    return sendError(res, 400, "bad_device_name", "device_name required (≤64 chars)")
  }

  const account = await prisma.anki_email_accounts
    .findUnique({
      where: { email },
      select: { userid: true, display_name: true, email_verified_at: true },
    })
    .catch((err) => {
      console.error("[anki/verify-email] account lookup failed:", err)
      return undefined
    })
  if (account === undefined) {
    return sendError(res, 503, "db_unavailable", "Could not verify the code")
  }
  if (account === null) {
    // No such account: identical error to a wrong code (no oracle).
    return sendError(res, 401, "invalid_code", "That code is invalid or expired")
  }

  const check = await checkAndConsumeCode(email, "verify", code).catch((err) => {
    console.error("[anki/verify-email] code check failed:", err)
    return null
  })
  if (!check) {
    return sendError(res, 503, "db_unavailable", "Could not verify the code")
  }
  if (!check.ok) {
    const msg =
      check.error === "too_many_attempts"
        ? "Too many wrong guesses — request a new code"
        : check.error === "expired_code"
          ? "That code expired — request a new one"
          : "That code is invalid or expired"
    return sendError(res, 401, check.error, msg)
  }

  // Activate atomically: mark verified + bootstrap user_config/lg_pets
  // + finish the user_config identity fields, all in ONE transaction.
  // If any step throws the whole thing rolls back, so we never strand
  // a consumed code against a half-provisioned account whose
  // email_verified_at is set but user_config.email is NULL (which
  // would also make register refuse to re-issue a code — a permanently
  // stuck account). On rollback the account stays unverified and the
  // user can simply register again to get a fresh code.
  try {
    await prisma.$transaction([
      prisma.anki_email_accounts.update({
        where: { userid: account.userid },
        data: {
          email_verified_at: account.email_verified_at ?? new Date(),
          failed_login_count: 0,
          locked_until: null,
          updated_at: new Date(),
        },
      }),
      // FK order: user_config before lg_pets (lg_pets references it).
      prisma.$executeRaw`INSERT INTO user_config (userid) VALUES (${account.userid}) ON CONFLICT (userid) DO NOTHING`,
      prisma.$executeRaw`INSERT INTO lg_pets (userid) VALUES (${account.userid}) ON CONFLICT (userid) DO NOTHING`,
      // Set identity fields; never clobber an existing name (re-verify safety).
      prisma.$executeRaw`
        UPDATE user_config
        SET email = ${email},
            email_verified = true,
            name = COALESCE(name, ${account.display_name})
        WHERE userid = ${account.userid}`,
    ])
  } catch (err) {
    console.error("[anki/verify-email] activation failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not activate the account")
  }

  const session = await createDeviceSession({
    userid: account.userid,
    deviceId: device_id,
    deviceName: device_name,
    addonVersion: body.addon_version,
    osPlatform: body.os_platform,
    ankiVersion: body.anki_version,
    ipPrefix: extractIpPrefix(req),
    accountType: "email",
    email,
  })
  if (!session.ok) {
    return sendError(
      res,
      session.status || 500,
      session.error || "internal",
      session.message || "Could not sign in"
    )
  }
  return res.status(200).json(session.payload)
}
