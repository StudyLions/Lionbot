// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: "Forgot password" for addon email accounts. Always
//          answers 200 {status:"code_sent"} regardless of whether
//          the email has an account (no enumeration); when it does,
//          a 6-digit reset code is emailed for /api/anki/auth/reset.
//
//          Unverified accounts are skipped silently: they have
//          nothing to reset that register-overwrite doesn't already
//          handle, and mailing them a RESET code would let a
//          registration squatter "verify" via the reset path.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { normalizeEmail, issueCode } from "@/lib/anki/emailAccounts"
import { sendAnkiAuthCodeEmail } from "@/lib/anki/emailAuthMail"
import { ankiRateLimitByKey, clientIpKey } from "@/lib/anki/rateLimit"

interface ForgotBody {
  email?: string
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

  const rl = ankiRateLimitByKey(`anki-forgot:${clientIpKey(req)}`, 5, 600_000)
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return sendError(res, 429, "rate_limited", "Too many requests — try again soon.")
  }

  const body = (req.body || {}) as ForgotBody
  const email = normalizeEmail(body.email)
  if (!email) {
    return sendError(res, 400, "bad_email", "That doesn't look like a valid email address.")
  }

  try {
    const account = await prisma.anki_email_accounts.findUnique({
      where: { email },
      select: { userid: true, display_name: true, email_verified_at: true },
    })
    if (account && account.email_verified_at) {
      const issued = await issueCode(email, "reset", account.userid)
      if (issued.ok) {
        sendAnkiAuthCodeEmail({
          userid: account.userid,
          email,
          displayName: account.display_name,
          code: issued.code,
          purpose: "reset",
        }).catch((err) => console.error("[anki/forgot] send mail failed:", err))
      }
      // Cooldown/hourly-cap fall through to the generic 200 — a 429
      // here would reveal that the email HAS an account.
    }
  } catch (err) {
    console.error("[anki/forgot] failed:", err)
    // Still generic 200: an attacker shouldn't learn from our DB errors.
  }

  return res.status(200).json({ status: "code_sent" })
}
