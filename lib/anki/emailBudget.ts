// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-11
// Purpose: System-wide hourly ceiling on outbound Anki auth emails
//          (verification + password-reset codes).
//
//          The existing limits cover per-victim and per-IP abuse:
//            - per (email, purpose): 60s cooldown + 5/hour, DB-keyed
//              (issueCode) — bounds how much mail ONE address can
//              receive, even across rotating IPs.
//            - per IP: in-memory, best-effort, per serverless instance.
//          Neither bounds a DISTRIBUTED flood (many IPs × many distinct
//          fresh emails). That can't harm any single inbox, but it could
//          run up the Resend bill. This is the global backstop: a single
//          atomic counter per clock-hour, hard-capping total auth-email
//          sends/hour no matter how the load is spread.
//
//          Design:
//            - consumeAuthEmailBudget() is an ATOMIC conditional consume:
//              one statement increments the current hour's counter ONLY
//              while it is below the ceiling, and reports whether a slot
//              was granted. Race-free across concurrent lambdas (the
//              WHERE guard runs inside the single UPDATE), so the ceiling
//              is exact — no read-then-write TOCTOU.
//            - Counts actual SEND DECISIONS: callers invoke it after
//              issueCode() has already returned ok (i.e. the per-email
//              cooldown/cap passed and a fresh code exists), immediately
//              before emailing it. So the counter tracks real Resend
//              calls, not mere attempts.
//            - FAIL-OPEN: any DB error (or a non-positive ceiling) grants
//              the send. A transient DB blip must never take down email
//              sign-up; the per-email + per-IP limits still apply, so
//              failing open here doesn't remove all protection.
//            - Ceiling via ANKI_EMAIL_HOURLY_CEILING (default 500). Set
//              it to 0 to disable the global ceiling entirely.
// ============================================================
import { prisma } from "@/utils/prisma"

const DEFAULT_CEILING = 500

/** Resolved per call so an env change takes effect without a rebuild. */
export function authEmailHourlyCeiling(): number {
  const raw = process.env.ANKI_EMAIL_HOURLY_CEILING
  if (raw === undefined || raw === "") return DEFAULT_CEILING
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? n : DEFAULT_CEILING
}

/** Current clock-hour bucket: whole hours since the Unix epoch. */
export function currentEmailBucket(): bigint {
  return BigInt(Math.floor(Date.now() / 3_600_000))
}

/**
 * Atomically claim one global auth-email slot for the current hour.
 * Returns true if a slot was granted (caller should send), false if the
 * hourly ceiling is already reached (caller should skip the send but
 * otherwise behave identically — no oracle, no user-visible error).
 *
 * The INSERT … ON CONFLICT DO UPDATE … WHERE count < ceiling is a single
 * atomic statement: if the row is at/over the ceiling the UPDATE is
 * skipped and RETURNING yields no row, so concurrent callers can never
 * push the counter past the ceiling.
 */
export async function consumeAuthEmailBudget(): Promise<boolean> {
  const ceiling = authEmailHourlyCeiling()
  if (!Number.isFinite(ceiling) || ceiling <= 0) return true // disabled

  const bucket = currentEmailBucket()
  try {
    const rows = await prisma.$queryRaw<Array<{ count: number }>>`
      INSERT INTO anki_email_budget (bucket, count) VALUES (${bucket}, 1)
      ON CONFLICT (bucket) DO UPDATE SET count = anki_email_budget.count + 1
        WHERE anki_email_budget.count < ${ceiling}
      RETURNING count`
    // A fresh bucket (INSERT) or a granted increment returns one row.
    // An at-ceiling conflict skips the UPDATE and returns zero rows.
    return rows.length > 0
  } catch (err) {
    // Fail open — never let a DB hiccup block legitimate sign-ups.
    console.error("[anki/emailBudget] consume failed (failing open):", err)
    return true
  }
}
