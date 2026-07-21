// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: Complete a password reset for an addon email account:
//          {email, code, new_password} → verify + consume the reset
//          code, store the new scrypt hash, clear any lockout, and
//          revoke EVERY device session (standard post-reset
//          invalidation — if the reset was triggered by a compromise,
//          the attacker's sessions die here). The addon immediately
//          calls /api/anki/auth/login with the new password, which
//          re-pairs this device cleanly (revoked devices reactivate
//          in place, preserving review history).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import {
  checkAndConsumeCode,
  hashPassword,
  normalizeEmail,
  validatePassword,
} from "@/lib/anki/emailAccounts"
import { invalidateDeviceCache } from "@/lib/anki/requireAuth"
import { ankiRateLimitByKey, clientIpKey } from "@/lib/anki/rateLimit"

interface ResetBody {
  email?: string
  code?: string
  new_password?: string
}

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

  const rl = ankiRateLimitByKey(`anki-reset:${clientIpKey(req)}`, 10, 60_000)
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return sendError(res, 429, "rate_limited", "Too many attempts — slow down.")
  }

  const body = (req.body || {}) as ResetBody
  const email = normalizeEmail(body.email)
  const code = (body.code || "").trim()
  const newPassword = validatePassword(body.new_password)

  if (!email || !CODE_RE.test(code)) {
    return sendError(res, 400, "missing_fields", "Required: email, 6-digit code")
  }
  if (!newPassword) {
    return sendError(res, 400, "bad_password", "Password must be 8–128 characters.")
  }

  const account = await prisma.anki_email_accounts
    .findUnique({
      where: { email },
      select: { userid: true, email_verified_at: true },
    })
    .catch((err) => {
      console.error("[anki/reset] account lookup failed:", err)
      return undefined
    })
  if (account === undefined) {
    return sendError(res, 503, "db_unavailable", "Could not reset the password")
  }
  if (!account || !account.email_verified_at) {
    // No verified account: identical error to a wrong code (no oracle).
    return sendError(res, 401, "invalid_code", "That code is invalid or expired")
  }

  const check = await checkAndConsumeCode(email, "reset", code).catch((err) => {
    console.error("[anki/reset] code check failed:", err)
    return null
  })
  if (!check) {
    return sendError(res, 503, "db_unavailable", "Could not reset the password")
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

  let passwordHash: string
  try {
    passwordHash = await hashPassword(newPassword)
  } catch (err) {
    console.error("[anki/reset] hash failed:", err)
    return sendError(res, 500, "internal", "Could not process the password")
  }

  try {
    await prisma.anki_email_accounts.update({
      where: { userid: account.userid },
      data: {
        password_hash: passwordHash,
        failed_login_count: 0,
        locked_until: null,
        updated_at: new Date(),
      },
    })
  } catch (err) {
    console.error("[anki/reset] password update failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not reset the password")
  }

  // Sign out everywhere (same revocation shape as signout.ts). The
  // device cache must be cleared per-device or a still-cached bearer
  // would keep working until TTL.
  try {
    const devices = await prisma.anki_devices.findMany({
      where: { userid: account.userid, revoked_at: null },
      select: { device_id: true },
    })
    if (devices.length > 0) {
      await prisma.anki_devices.updateMany({
        where: { userid: account.userid, revoked_at: null },
        data: {
          revoked_at: new Date(),
          revoked_reason: "password_reset",
        },
      })
      for (const d of devices) invalidateDeviceCache(d.device_id)
    }
  } catch (err) {
    // The password DID change; failing the revocation shouldn't
    // un-succeed the reset. Old refresh tokens still die at their
    // next rotation attempt against the new state... they don't —
    // refresh works per-device. So log loudly: this is the one
    // partial-failure worth alerting on.
    console.error("[anki/reset] CRITICAL: device revocation failed after password change:", err)
  }

  return res.status(200).json({ status: "password_reset" })
}
