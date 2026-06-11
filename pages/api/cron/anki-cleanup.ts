// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: Daily housekeeping for the Anki addon's auth tables:
//            1. anki_pairing_codes — consumed/expired rows (the
//               exchange route eagerly deletes on success; this
//               sweeps abandoned codes).
//            2. anki_email_codes — consumed or expired rows older
//               than 24h (kept a day for abuse triage).
//            3. anki_batch_idempotency — rows older than 24h (the
//               documented retention; replays only matter within a
//               sync session, and nothing else prunes this table).
//            4. anki_email_accounts — UNVERIFIED registrations older
//               than 30 days, plus their bare user_config row. By
//               construction an unverified account has no lg_pets,
//               no devices and no game data (those appear at verify),
//               but the deletes are guarded anyway so a future
//               invariant change can't make this cron destructive.
//            5-7. Account-deletion crash backstops (see each sweep):
//               credential rows without user_config, mid-deletion
//               blank-hash rows, and synthetic-band game rows whose
//               credential is gone. Together these guarantee every
//               crash window in /api/anki/account/delete converges
//               to full erasure within a day.
//
//          Auth: same CRON_SECRET bearer pattern as the other crons
//          (Vercel cron sends it automatically once configured).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { executeUserDeletion } from "@/utils/gdpr-deletion"
import { SYNTH_MIN, SYNTH_SPAN } from "@/lib/anki/emailAccounts"

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
    // Idempotency-cache retention: the schema documents 24h and the
    // created_at index exists for exactly this sweep, but nothing else
    // prunes the table — without this it grows one JSON row per review
    // batch, forever.
    const batches = await prisma.anki_batch_idempotency.deleteMany({
      where: { created_at: { lt: dayAgo } },
    })
    out.batch_idempotency = batches.count
  } catch (err) {
    console.error("[cron/anki-cleanup] batch idempotency failed:", err)
  }

  try {
    // Hourly auth-email ceiling buckets: only the current hour's row is
    // ever read, so anything older than a day is dead weight. One row
    // per hour means this is tiny regardless, but keep it swept.
    const staleBucket = BigInt(Math.floor((Date.now() - 24 * 3_600_000) / 3_600_000))
    const buckets = await prisma.anki_email_budget.deleteMany({
      where: { bucket: { lt: staleBucket } },
    })
    out.email_budget_buckets = buckets.count
  } catch (err) {
    console.error("[cron/anki-cleanup] email budget buckets failed:", err)
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

  try {
    // Sweep 5 — credential rows with NO user_config. Register creates
    // the bare user_config right after the account row, so this shape
    // is only ever a register that crashed between those two writes
    // (or a legacy half-deletion from before the delete route was
    // transactional). There is nothing to erase — just free the email
    // so the person can register again. The day-old age guard makes a
    // concurrent in-flight register untouchable.
    const orphans = await prisma.$queryRaw<Array<{ userid: bigint; email: string }>>`
      SELECT a.userid, a.email FROM anki_email_accounts a
      WHERE NOT EXISTS (SELECT 1 FROM user_config u WHERE u.userid = a.userid)
        AND a.created_at < ${dayAgo}
      LIMIT 500`
    let reclaimed = 0
    for (const row of orphans) {
      await prisma.$transaction([
        prisma.anki_email_codes.deleteMany({ where: { email: row.email } }),
        prisma.anki_email_accounts.delete({ where: { userid: row.userid } }),
      ])
      reclaimed++
    }
    out.orphan_accounts = reclaimed
  } catch (err) {
    console.error("[cron/anki-cleanup] orphan sweep failed:", err)
  }

  try {
    // Sweep 6 — mid-deletion accounts: password_hash = "" is written
    // ONLY by the delete route, inside the same transaction that
    // removes the row, so a persisted blank-hash row should be
    // impossible today. It's the matching backstop for that route's
    // defense-in-depth blank (a future de-transactioning regression
    // would strand exactly this shape: non-loginable, email squatted
    // forever, register's anti-enumeration branch silently eating
    // every re-registration). Finish the job: erase first, then free
    // the email — data always dies before the address is reusable.
    const midDeletion = await prisma.anki_email_accounts.findMany({
      where: { password_hash: "" },
      select: { userid: true, email: true },
      take: 200,
    })
    let finished = 0
    for (const row of midDeletion) {
      try {
        await executeUserDeletion(row.userid)
        await prisma.$transaction([
          prisma.anki_email_codes.deleteMany({ where: { email: row.email } }),
          prisma.anki_email_accounts.delete({ where: { userid: row.userid } }),
        ])
        finished++
      } catch (err) {
        console.error(
          `[cron/anki-cleanup] mid-deletion finish failed for userid=${row.userid} (will retry tomorrow):`,
          err
        )
      }
    }
    out.mid_deletion_accounts = finished
  } catch (err) {
    console.error("[cron/anki-cleanup] mid-deletion sweep failed:", err)
  }

  try {
    // Sweep 7 — synthetic-band game-row orphans: the delete route
    // removes the credential BEFORE running the GDPR erasure, so a
    // crash between the two leaves user_config (+ pets, inventory,
    // reviews…) for a userid that can never sign in again — and the
    // user CANNOT retry, because their sessions were revoked first.
    // Only email accounts mint ids in [SYNTH_MIN, SYNTH_MIN+SPAN), so
    // "in the band, no credential row" uniquely identifies these and
    // this sweep is what makes the route's purge_pending answer an
    // actual guarantee. executeUserDeletion is idempotent per table,
    // so a rerun after a partial failure converges.
    const synthMax = SYNTH_MIN + SYNTH_SPAN
    const strandedIds = await prisma.$queryRaw<Array<{ userid: bigint }>>`
      SELECT u.userid FROM user_config u
      WHERE u.userid >= ${SYNTH_MIN} AND u.userid < ${synthMax}
        AND NOT EXISTS (SELECT 1 FROM anki_email_accounts a WHERE a.userid = u.userid)
      LIMIT 200`
    let purged = 0
    for (const row of strandedIds) {
      try {
        await executeUserDeletion(row.userid)
        purged++
      } catch (err) {
        console.error(
          `[cron/anki-cleanup] orphan-erasure failed for userid=${row.userid} (will retry tomorrow):`,
          err
        )
      }
    }
    out.orphan_game_userids = purged
  } catch (err) {
    console.error("[cron/anki-cleanup] orphan-erasure sweep failed:", err)
  }

  console.info("[cron/anki-cleanup]", out)
  return res.status(200).json({ status: "ok", ...out })
}
