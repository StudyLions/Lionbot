// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: Self-service account deletion for the addon's EMAIL
//          accounts (GDPR). Email users have no website dashboard
//          (it's Discord-session gated), so the right-to-erasure
//          path must live in the addon itself.
//
//          Scope: email accounts ONLY. Discord-paired users delete
//          via the website's existing GDPR flow (their LionBot data
//          spans Discord servers; the addon shouldn't nuke it).
//
//          Defense in depth: bearer auth (proves device possession)
//          + the account PASSWORD in the body (proves credential
//          possession — a stolen unlocked Anki can't erase the
//          account). Then:
//            1. revoke every device + bust caches (sessions die now)
//            2. executeUserDeletion(userid) — the same GDPR pipeline
//               the website uses (user_config cascade removes
//               anki_devices + review events; lg_* etc. handled)
//            3. delete the anki_email_accounts row + outstanding
//               codes (no FK by design, so explicit)
//          Order matters: credentials are removed LAST so a crash
//          mid-way leaves a re-runnable state, never an orphaned
//          login that resurrects deleted data.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth, invalidateDeviceCache } from "@/lib/anki/requireAuth"
import { verifyPassword } from "@/lib/anki/emailAccounts"
import { executeUserDeletion } from "@/utils/gdpr-deletion"
import { ankiRateLimitByKey, clientIpKey } from "@/lib/anki/rateLimit"

interface DeleteBody {
  password?: string
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

  const rl = ankiRateLimitByKey(`anki-acct-del:${clientIpKey(req)}`, 5, 600_000)
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return sendError(res, 429, "rate_limited", "Too many attempts — slow down.")
  }

  const ctx = await requireAnkiAuth(req, res)
  if (!ctx) return

  const { password } = (req.body || {}) as DeleteBody
  if (!password || typeof password !== "string") {
    return sendError(res, 400, "missing_password", "Your password is required to delete the account")
  }

  const account = await prisma.anki_email_accounts
    .findUnique({ where: { userid: ctx.userId } })
    .catch((err) => {
      console.error("[anki/account-delete] lookup failed:", err)
      return undefined
    })
  if (account === undefined) {
    return sendError(res, 503, "db_unavailable", "Could not delete the account")
  }
  if (!account) {
    return sendError(
      res,
      400,
      "not_email_account",
      "This account uses Discord sign-in — manage it from the LionBot website"
    )
  }

  const valid = await verifyPassword(password, account.password_hash).catch(
    () => false
  )
  if (!valid) {
    return sendError(res, 401, "invalid_credentials", "Password is incorrect")
  }

  // 1. Kill every session first (the requesting device included).
  try {
    const devices = await prisma.anki_devices.findMany({
      where: { userid: ctx.userId },
      select: { device_id: true },
    })
    await prisma.anki_devices.updateMany({
      where: { userid: ctx.userId, revoked_at: null },
      data: { revoked_at: new Date(), revoked_reason: "account_deleted" },
    })
    for (const d of devices) invalidateDeviceCache(d.device_id)
  } catch (err) {
    console.error("[anki/account-delete] device revoke failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not delete the account")
  }

  // 2. The full GDPR erasure (same pipeline as the website).
  try {
    const summary = await executeUserDeletion(ctx.userId)
    console.info(
      `[anki/account-delete] erased userid=${ctx.userId} tables=${Object.keys(summary).length}`
    )
  } catch (err) {
    console.error("[anki/account-delete] executeUserDeletion failed:", err)
    return sendError(res, 503, "deletion_failed", "Could not delete the account — try again")
  }

  // 3. Remove the credentials + codes last (see header).
  try {
    await prisma.anki_email_codes.deleteMany({ where: { email: account.email } })
    await prisma.anki_email_accounts.delete({ where: { userid: ctx.userId } })
  } catch (err) {
    console.error("[anki/account-delete] credential cleanup failed:", err)
    // The game data is already erased; surface success but log loudly.
  }

  return res.status(200).json({ status: "account_deleted" })
}
