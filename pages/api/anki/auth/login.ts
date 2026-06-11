// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: Email/password sign-in for the Anki addon. Verifies the
//          scrypt hash, then mints a device session via the same
//          shared core as Discord pairing — identical payload.
//
//          Security:
//            - Generic 401 invalid_credentials for unknown email AND
//              wrong password (no enumeration); unknown-email requests
//              still burn a scrypt verify on a dummy hash so timing
//              doesn't distinguish them.
//            - Account lockout: 10 consecutive failures → 15 minutes
//              (per-account, persisted), on top of the per-IP limiter.
//            - ONE deliberate exception to the generic-401 rule:
//              correct password + unverified email → 403
//              email_unverified + auto-resend of the code. Only
//              someone holding the correct password sees this, and
//              the addon uses it to jump straight to the code screen
//              instead of gaslighting the user with "wrong password".
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import {
  verifyPassword,
  hashPassword,
  normalizeEmail,
  issueCode,
} from "@/lib/anki/emailAccounts"
import { sendAnkiAuthCodeEmail } from "@/lib/anki/emailAuthMail"
import {
  bootstrapGameAccount,
  createDeviceSession,
  extractIpPrefix,
} from "@/lib/anki/deviceSession"
import { ankiRateLimitByKey, clientIpKey } from "@/lib/anki/rateLimit"

interface LoginBody {
  email?: string
  password?: string
  device_id?: string
  device_name?: string
  addon_version?: string
  os_platform?: string
  anki_version?: string
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const MAX_FAILED_LOGINS = 10
const LOCKOUT_MS = 15 * 60_000

// Burned for unknown emails so "no account" and "wrong password"
// cost the same wall-clock. Hash of a random unguessable string,
// computed once per lambda.
let dummyHashPromise: Promise<string> | null = null
function dummyHash(): Promise<string> {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword(
      "timing-equalizer-" + Math.random().toString(36).slice(2)
    )
  }
  return dummyHashPromise
}

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

  // 20/min/IP: high enough that a shared NAT (dorm, campus) doesn't
  // false-positive, low enough to blunt spraying. Per-ACCOUNT lockout
  // below is the real brute-force defense.
  const rl = ankiRateLimitByKey(`anki-login:${clientIpKey(req)}`, 20, 60_000)
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return sendError(res, 429, "rate_limited", "Too many sign-in attempts — slow down.")
  }

  const body = (req.body || {}) as LoginBody
  const email = normalizeEmail(body.email)
  const password = typeof body.password === "string" ? body.password : ""
  const { device_id, device_name } = body

  if (!email || !password) {
    return sendError(res, 400, "missing_fields", "Required: email, password")
  }
  if (!device_id || !UUID_RE.test(device_id)) {
    return sendError(res, 400, "bad_device_id", "device_id must be a UUID")
  }
  if (!device_name || typeof device_name !== "string" || device_name.length > 64) {
    return sendError(res, 400, "bad_device_name", "device_name required (≤64 chars)")
  }

  const account = await prisma.anki_email_accounts
    .findUnique({ where: { email } })
    .catch((err) => {
      console.error("[anki/login] account lookup failed:", err)
      return undefined
    })
  if (account === undefined) {
    return sendError(res, 503, "db_unavailable", "Could not sign in")
  }

  if (!account) {
    // Equalize timing with the real-verify path, then generic 401.
    await verifyPassword(password, await dummyHash()).catch(() => false)
    return sendError(res, 401, "invalid_credentials", "Email or password is incorrect")
  }

  if (account.locked_until && account.locked_until.getTime() > Date.now()) {
    // Account is locked. Respond IDENTICALLY to a wrong password (no
    // distinct code, no Retry-After header) so this can't be used to
    // (a) confirm an email has an account or (b) tell an attacker they
    // successfully locked a victim. We still equalize timing with the
    // verify path and we do NOT process the password while locked
    // (that's the CPU-DoS protection the lock buys). A legitimate
    // locked-out user sees "incorrect" and retries after the window.
    await verifyPassword(password, await dummyHash()).catch(() => false)
    return sendError(res, 401, "invalid_credentials", "Email or password is incorrect")
  }

  const valid = await verifyPassword(password, account.password_hash).catch(
    (err) => {
      console.error("[anki/login] verify failed:", err)
      return false
    }
  )

  if (!valid) {
    // Persisted failure counter → lockout. Best-effort (a DB hiccup
    // here shouldn't turn a 401 into a 503).
    try {
      const fails = account.failed_login_count + 1
      await prisma.anki_email_accounts.update({
        where: { userid: account.userid },
        data: {
          failed_login_count: fails,
          locked_until:
            fails >= MAX_FAILED_LOGINS
              ? new Date(Date.now() + LOCKOUT_MS)
              : null,
          updated_at: new Date(),
        },
      })
    } catch (err) {
      console.error("[anki/login] fail-count update failed:", err)
    }
    return sendError(res, 401, "invalid_credentials", "Email or password is incorrect")
  }

  // Correct password: clear the failure counter whatever happens next.
  if (account.failed_login_count > 0 || account.locked_until) {
    prisma.anki_email_accounts
      .update({
        where: { userid: account.userid },
        data: { failed_login_count: 0, locked_until: null },
      })
      .catch((err) => console.error("[anki/login] fail-count reset failed:", err))
  }

  if (!account.email_verified_at) {
    // The one deliberate non-generic response (see header). Re-issue
    // a code so the addon can jump straight to the code screen.
    const issued = await issueCode(email, "verify", account.userid).catch(() => null)
    if (issued?.ok) {
      sendAnkiAuthCodeEmail({
        userid: account.userid,
        email,
        displayName: account.display_name,
        code: issued.code,
        purpose: "verify",
      }).catch((err) => console.error("[anki/login] resend mail failed:", err))
    }
    return sendError(
      res,
      403,
      "email_unverified",
      "Almost there — we just emailed you a new verification code."
    )
  }

  // Bootstrap is idempotent; covers any legacy/edge account state.
  try {
    await bootstrapGameAccount(account.userid)
  } catch (err) {
    console.error("[anki/login] bootstrap failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not sign in")
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
