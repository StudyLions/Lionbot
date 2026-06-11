// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: Daily housekeeping for the Anki addon's auth tables:
//            1. anki_pairing_codes — consumed/expired rows (the
//               exchange route eagerly deletes on success; this
//               sweeps abandoned codes).
//            2. anki_email_codes — consumed or expired rows older
//               than 24h (kept a day for abuse triage).
//            3. anki_email_accounts — UNVERIFIED registrations older
//               than 30 days, plus their bare user_config row. By
//               construction an unverified account has no lg_pets,
//               no devices and no game data (those appear at verify),
//               but the deletes are guarded anyway so a future
//               invariant change can't make this cron destructive.
//
//          Auth: same CRON_SECRET bearer pattern as the other crons
//          (Vercel cron sends it automatically once configured).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"

function authorized(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.authorization
  return Boolean(header && header === `Bearer ${secret}`)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!authorized(req)) {
    return res.status(401).json({ error: "unauthorized" })
  }

  const dayAgo = new Date(Date.now() - 24 * 3_600_000)
  const monthAgo = new Date(Date.now() - 30 * 24 * 3_600_000)
  const out: Record<string, number> = {}

  try {
    const pairing = await prisma.$executeRaw`
      DELETE FROM anki_pairing_codes
      WHERE consumed = true OR expires_at < now()`
    out.pairing_codes = Number(pairing)
  } catch (err) {
    console.error("[cron/anki-cleanup] pairing codes failed:", err)
  }

  try {
    const codes = await prisma.anki_email_codes.deleteMany({
      where: {
        OR: [
          { consumed_at: { not: null, lt: dayAgo } },
          { expires_at: { lt: dayAgo } },
        ],
      },
    })
    out.email_codes = codes.count
  } catch (err) {
    console.error("[cron/anki-cleanup] email codes failed:", err)
  }

  try {
    // Stale unverified registrations: free the email + drop the bare
    // user_config row. Guards: never touch verified accounts; never
    // touch a userid that somehow grew devices or a pet.
    const stale = await prisma.$queryRaw<Array<{ userid: bigint }>>`
      SELECT a.userid FROM anki_email_accounts a
      WHERE a.email_verified_at IS NULL
        AND a.created_at < ${monthAgo}
        AND NOT EXISTS (SELECT 1 FROM anki_devices d WHERE d.userid = a.userid)
        AND NOT EXISTS (SELECT 1 FROM lg_pets p WHERE p.userid = a.userid)
      LIMIT 500`
    let pruned = 0
    for (const row of stale) {
      await prisma.$transaction([
        prisma.anki_email_codes.deleteMany({
          where: { userid: row.userid },
        }),
        prisma.anki_email_accounts.delete({ where: { userid: row.userid } }),
        prisma.$executeRaw`DELETE FROM user_config WHERE userid = ${row.userid}
          AND NOT EXISTS (SELECT 1 FROM members m WHERE m.userid = ${row.userid})`,
      ])
      pruned++
    }
    out.stale_unverified_accounts = pruned
  } catch (err) {
    console.error("[cron/anki-cleanup] stale accounts failed:", err)
  }

  console.info("[cron/anki-cleanup]", out)
  return res.status(200).json({ status: "ok", ...out })
}
