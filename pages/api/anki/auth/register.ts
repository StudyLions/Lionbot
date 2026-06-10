// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: Create a standalone email/password LionGotchi account
//          from inside the Anki addon — no Discord, no browser.
//
//          Flow: addon POSTs {email, password, display_name} →
//          we allocate a synthetic userid (see emailAccounts.ts),
//          store the scrypt hash UNVERIFIED, create the bare
//          user_config row (so the email pipeline's prefs/logging FK
//          works), and email a 6-digit code. The addon then calls
//          /api/anki/auth/verify-email with the code to activate the
//          account + get its session in one step.
//
//          Anti-enumeration policy: the response is the SAME
//          ("code_sent") whether the email was fresh, already
//          unverified (we overwrite + re-code), or already a verified
//          account (we silently do nothing). Only cooldown produces a
//          visibly different (429) response, and a cooldown does not
//          reveal whether an account exists (codes are issued for
//          fresh emails too).
//
//          user_config.email is NOT set here — only at verify — so an
//          unverified registration can never squat an address into
//          the main tables.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import {
  hashPassword,
  normalizeEmail,
  validatePassword,
  normalizeDisplayName,
  allocateSyntheticUserid,
  issueCode,
} from "@/lib/anki/emailAccounts"
import { sendAnkiAuthCodeEmail } from "@/lib/anki/emailAuthMail"
import { ankiRateLimitByKey, clientIpKey } from "@/lib/anki/rateLimit"

interface RegisterBody {
  email?: string
  password?: string
  display_name?: string
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

  // Per-IP throttle: registering is a once-ish action; 10 per 10 min
  // caps junk-account floods + code-mail abuse from one address while
  // tolerating a shared NAT (dorm/campus). Per-email code cooldowns in
  // issueCode() bound the mail volume independently.
  const rl = ankiRateLimitByKey(
    `anki-register:${clientIpKey(req)}`,
    10,
    600_000
  )
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return sendError(res, 429, "rate_limited", "Too many sign-up attempts — try again soon.")
  }

  const body = (req.body || {}) as RegisterBody
  const email = normalizeEmail(body.email)
  const password = validatePassword(body.password)
  const displayName = normalizeDisplayName(body.display_name)

  if (!email) {
    return sendError(res, 400, "bad_email", "That doesn't look like a valid email address.")
  }
  if (!password) {
    return sendError(res, 400, "bad_password", "Password must be 8–128 characters.")
  }
  if (!displayName) {
    return sendError(res, 400, "bad_display_name", "Display name must be 2–32 characters.")
  }

  let passwordHash: string
  try {
    passwordHash = await hashPassword(password)
  } catch (err) {
    console.error("[anki/register] hash failed:", err)
    return sendError(res, 500, "internal", "Could not process the password")
  }

  let userid: bigint | null = null
  try {
    const existing = await prisma.anki_email_accounts.findUnique({
      where: { email },
      select: { userid: true, email_verified_at: true },
    })

    if (existing && existing.email_verified_at) {
      // Verified account already owns this address. Do nothing,
      // answer exactly like success (anti-enumeration). The real
      // owner is unaffected; the requester can't tell.
      return res.status(200).json({ status: "code_sent" })
    }

    if (existing) {
      // Unverified squatter row (possibly the same person retrying,
      // possibly stale): overwrite credentials in place, keep the
      // allocated userid, send a fresh code.
      userid = existing.userid
      await prisma.anki_email_accounts.update({
        where: { email },
        data: {
          password_hash: passwordHash,
          display_name: displayName,
          updated_at: new Date(),
        },
      })
    } else {
      userid = await allocateSyntheticUserid()
      await prisma.anki_email_accounts.create({
        data: {
          userid,
          email,
          password_hash: passwordHash,
          display_name: displayName,
        },
      })
      // Bare user_config row so email prefs/logging (FK) work for
      // this synthetic user. The email ADDRESS lands on user_config
      // only at verify.
      await prisma.$executeRaw`INSERT INTO user_config (userid) VALUES (${userid}) ON CONFLICT (userid) DO NOTHING`
    }
  } catch (err: unknown) {
    // A concurrent register on the same fresh email can race the
    // create (unique on email). Treat exactly like the
    // already-unverified case from the client's perspective.
    const code = (err as { code?: string }).code
    if (code === "P2002") {
      return res.status(200).json({ status: "code_sent" })
    }
    console.error("[anki/register] account upsert failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not create the account")
  }

  const issued = await issueCode(email, "verify", userid).catch((err) => {
    console.error("[anki/register] issueCode failed:", err)
    return null
  })
  if (!issued) {
    return sendError(res, 503, "db_unavailable", "Could not issue a verification code")
  }
  if (!issued.ok) {
    res.setHeader("Retry-After", String(issued.retryAfterSec))
    return sendError(
      res,
      429,
      issued.error === "cooldown" ? "code_cooldown" : "code_hourly_cap",
      issued.error === "cooldown"
        ? "A code was just sent — check your inbox, or retry in a minute."
        : "Too many codes requested for this email — try again later."
    )
  }

  // Fire the mail. Failures are logged, not surfaced (enumeration +
  // the addon's "I didn't get a code" path is the resend button).
  sendAnkiAuthCodeEmail({
    userid: userid!,
    email,
    displayName,
    code: issued.code,
    purpose: "verify",
  }).catch((err) => console.error("[anki/register] send mail failed:", err))

  return res.status(200).json({ status: "code_sent" })
}
