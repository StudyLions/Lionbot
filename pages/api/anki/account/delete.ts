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
//            2. delete the credential ATOMICALLY (blank hash + codes
//               + account row in one transaction) — once this commits
//               nothing can sign in, so the erasure below can never
//               be "resurrected" by a later login re-bootstrapping
//               user_config/lg_pets; if it rolls back, nothing
//               happened and the user can sign in again and retry
//            3. executeUserDeletion(userid) — the same GDPR pipeline
//               the website uses (user_config cascade removes
//               anki_devices + review events; lg_* etc. handled).
//               If THIS fails the user cannot retry (sessions + the
//               credential are gone), so we report success with
//               purge_pending and the daily anki-cleanup cron's
//               synthetic-band orphan sweep finishes the erasure.
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

  // 1. Kill every session (the requesting device included).
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

  // 2. Remove the CREDENTIAL, atomically. The credential-before-erasure
  //    ordering is the security-critical part: once this commits the
  //    account is non-loginable, so even if the game-data erasure below
  //    fails mid-way nothing can resurrect it (login/verify can't
  //    re-bootstrap user_config/lg_pets without a credential row). The
  //    transaction means a failure here changes NOTHING — password and
  //    codes are intact, so the user signs in again (step 1 revoked
  //    this session) and retries. Blanking the hash inside the same
  //    transaction is free defense-in-depth against a future
  //    de-transactioning regression; the cleanup cron sweeps blank-hash
  //    rows as the matching backstop.
  try {
    await prisma.$transaction([
      prisma.anki_email_accounts.update({
        where: { userid: ctx.userId },
        data: { password_hash: "" }, // verifyPassword rejects an empty/non-scrypt hash
      }),
      prisma.anki_email_codes.deleteMany({ where: { email: account.email } }),
      prisma.anki_email_accounts.delete({ where: { userid: ctx.userId } }),
    ])
  } catch (err) {
    console.error("[anki/account-delete] credential removal failed:", err)
    // Rolled back: credential fully intact, but step 1 already revoked
    // every session — the honest recovery path is sign-in-and-retry.
    return sendError(res, 503, "deletion_failed", "Couldn't delete the account — sign in again and retry")
  }

  // 3. The full GDPR erasure (same pipeline as the website). The
  //    credential is already gone, so a failure here leaves only
  //    orphaned game rows — no login, no resurrection, and ALSO no way
  //    for the user to retry (their sessions died in step 1). A 503
  //    "try again" would be a lie. The account is irreversibly dead at
  //    this point, so report success with purge_pending: the daily
  //    anki-cleanup cron's synthetic-band orphan sweep (user_config in
  //    the synthetic id band with no credential row) is guaranteed to
  //    finish the erasure. We log loudly for ops either way.
  try {
    const summary = await executeUserDeletion(ctx.userId)
    console.info(
      `[anki/account-delete] erased userid=${ctx.userId} tables=${Object.keys(summary).length}`
    )
  } catch (err) {
    console.error(
      `[anki/account-delete] game-data erasure failed AFTER credential removal for userid=${ctx.userId}; the cleanup cron's orphan sweep will finish it:`,
      err
    )
    return res.status(200).json({ status: "account_deleted", purge_pending: true })
  }

  return res.status(200).json({ status: "account_deleted" })
}
