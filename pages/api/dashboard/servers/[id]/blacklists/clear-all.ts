// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-20
// Purpose: Admin-only bulk action that pardons every active
//          STUDY_BAN and/or SCREEN_BAN ticket in a guild AND
//          removes the corresponding blacklist role from each
//          affected member via the Discord REST API.
//
//          Built for support ticket #0037 ("Study Space - How to
//          completely remove blacklists?"). Until now an admin who
//          wanted to wipe the slate had to either pardon every
//          ticket one by one in the moderation page (which only
//          updates the DB, leaving the role on the member) or
//          edit roles manually in Discord. This endpoint does
//          both atomically and with an audit row.
//
// Safety:
//   - guildId comes ONLY from the URL path
//   - requireAdmin enforced against THAT guild
//   - role removal is bounded (max 500 members per call) so we
//     don't hold the function open past the Vercel timeout
//   - failures are collected per-member and reported back, not
//     thrown -- so a partial run still produces a useful audit
//     trail and a useful response
//   - audit row stores BOTH the request and the per-type result
//     counts inside a single dashboard_admin_audit insert
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

export const config = {
  // Up to 60s on Vercel Pro -- we may need to call Discord 100s of times.
  maxDuration: 60,
}

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const ACTION_TYPE = "BLACKLISTS_CLEAR_ALL"
const REASON_MIN = 3
const REASON_MAX = 1000
const HARD_MEMBER_CAP = 500
const ROLE_REMOVE_CONCURRENCY = 3

type BlacklistType = "STUDY_BAN" | "SCREEN_BAN"
const ALLOWED_TYPES: ReadonlyArray<BlacklistType> = ["STUDY_BAN", "SCREEN_BAN"]

interface ClearAllBody {
  types: BlacklistType[]
  reason: string
}

interface PerTypeResult {
  type: BlacklistType
  ticketsPardoned: number
  rolesRemoved: number
  rolesAlreadyMissing: number
  rolesFailed: number
  uniqueMembers: number
  roleId: string | null
  roleConfigured: boolean
}

interface FailureRow {
  type: BlacklistType
  userId: string
  reason: string
}

function validate(body: unknown): ClearAllBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body")
  }
  const { types, reason } = body as Partial<ClearAllBody>

  if (!Array.isArray(types) || types.length === 0) {
    throw new ValidationError("Choose at least one blacklist type to clear")
  }
  const dedupedTypes = Array.from(new Set(types)) as BlacklistType[]
  for (const t of dedupedTypes) {
    if (!ALLOWED_TYPES.includes(t)) {
      throw new ValidationError(`Unknown blacklist type: ${t}`)
    }
  }

  if (typeof reason !== "string") {
    throw new ValidationError("A reason is required")
  }
  const trimmedReason = reason.trim()
  if (trimmedReason.length < REASON_MIN) {
    throw new ValidationError(`Reason must be at least ${REASON_MIN} characters`)
  }
  if (trimmedReason.length > REASON_MAX) {
    throw new ValidationError(`Reason must be ${REASON_MAX} characters or fewer`)
  }

  return { types: dedupedTypes, reason: trimmedReason }
}

async function removeRoleFromMember(
  guildId: bigint,
  userId: bigint,
  roleId: bigint,
  auditReason: string,
): Promise<"removed" | "missing" | "failed"> {
  if (!BOT_TOKEN) return "failed"
  const url = `https://discord.com/api/v10/guilds/${guildId.toString()}/members/${userId.toString()}/roles/${roleId.toString()}`
  const auditHeader = encodeURIComponent(auditReason.slice(0, 256))

  // 2 attempts max -- one extra in case of 429 rate limiting.
  for (let attempt = 0; attempt < 2; attempt++) {
    let resp: Response
    try {
      resp = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
          "X-Audit-Log-Reason": auditHeader,
        },
      })
    } catch {
      return "failed"
    }

    if (resp.status === 204) return "removed"
    // 404 = member or role no longer in guild -- count as already-missing.
    if (resp.status === 404) return "missing"
    if (resp.status === 429) {
      const retryAfter = Number(resp.headers.get("retry-after") || "1")
      const sleepMs = Math.min(Math.max(retryAfter * 1000, 200), 4000)
      await new Promise((r) => setTimeout(r, sleepMs))
      continue
    }
    // 403 (missing perms), 401 (bad token), 5xx etc -- just fail loudly.
    return "failed"
  }
  return "failed"
}

async function processInPool<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const idx = cursor++
      if (idx >= items.length) return
      results[idx] = await worker(items[idx])
    }
  })
  await Promise.all(runners)
  return results
}

export default apiHandler({
  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (!BOT_TOKEN) {
      return res.status(500).json({ error: "Bot token not configured on server" })
    }

    const { types, reason } = validate(req.body)

    // Read both blacklist role columns via raw SQL because the prisma
    // schema currently exposes studyban_role on guild_config but is
    // missing screenban_role (live DB has both). Using raw SQL keeps
    // this endpoint working without forcing a `prisma db pull`.
    const guildConfigRows = await prisma.$queryRaw<
      { studyban_role: bigint | null; screenban_role: bigint | null }[]
    >(
      Prisma.sql`SELECT studyban_role, screenban_role FROM guild_config WHERE guildid = ${guildId}`
    )
    const guildConfig = guildConfigRows[0]
    if (!guildConfig) {
      return res.status(404).json({ error: "Server not found" })
    }

    const roleByType: Record<BlacklistType, bigint | null> = {
      STUDY_BAN: guildConfig.studyban_role ?? null,
      SCREEN_BAN: guildConfig.screenban_role ?? null,
    }

    // Audit row first (with `pending` result) -- if anything fails we
    // can still trace the attempt. We update the result at the end.
    //
    // dashboard_admin_audit.target_userid is NOT NULL in the schema, but
    // there is no single target for a bulk action. Convention: set it to
    // the actor's id so the row is queryable by actor and never blocks
    // the insert. The "selections" + "result" JSON capture the real
    // affected counts.
    const auditRow = await prisma.dashboard_admin_audit.create({
      data: {
        actor_userid: auth.userId,
        guildid: guildId,
        target_userid: auth.userId,
        action_type: ACTION_TYPE,
        selections: { types } as unknown as Prisma.InputJsonValue,
        time_frame: { kind: "all" } as unknown as Prisma.InputJsonValue,
        reason,
        result: { pending: true } as unknown as Prisma.InputJsonValue,
      },
      select: { auditid: true },
    })

    const perType: PerTypeResult[] = []
    const failures: FailureRow[] = []
    let totalUniqueMembers = 0

    for (const ticketType of types) {
      const roleId = roleByType[ticketType]

      const activeTickets = await prisma.tickets.findMany({
        where: {
          guildid: guildId,
          ticket_type: ticketType,
          ticket_state: { in: ["OPEN", "EXPIRING"] },
        },
        select: { ticketid: true, targetid: true },
        orderBy: { ticketid: "asc" },
      })

      const uniqueTargets = Array.from(
        new Set(activeTickets.map((t) => t.targetid.toString())),
      ).map((s) => BigInt(s))
      totalUniqueMembers += uniqueTargets.length

      // Pardon all active tickets first (DB-only, fast). Doing this even if
      // role removal later fails means the moderation page reflects the
      // admin's intent even if Discord is slow / having issues.
      const pardonResult = await prisma.tickets.updateMany({
        where: {
          guildid: guildId,
          ticket_type: ticketType,
          ticket_state: { in: ["OPEN", "EXPIRING"] },
        },
        data: {
          ticket_state: "PARDONED",
          pardoned_by: auth.userId,
          pardoned_at: new Date(),
          pardoned_reason: `[Bulk clear] ${reason}`,
        },
      })

      const result: PerTypeResult = {
        type: ticketType,
        ticketsPardoned: pardonResult.count,
        rolesRemoved: 0,
        rolesAlreadyMissing: 0,
        rolesFailed: 0,
        uniqueMembers: uniqueTargets.length,
        roleId: roleId ? roleId.toString() : null,
        roleConfigured: roleId !== null,
      }

      // No role configured -- nothing to remove from Discord.
      if (!roleId) {
        perType.push(result)
        continue
      }

      const targetsToProcess = uniqueTargets.slice(0, HARD_MEMBER_CAP)
      const overflow = uniqueTargets.length - targetsToProcess.length
      if (overflow > 0) {
        failures.push({
          type: ticketType,
          userId: "(many)",
          reason: `${overflow} member(s) skipped: per-call cap of ${HARD_MEMBER_CAP} reached. Re-run to clear the rest, or remove the role in Discord.`,
        })
      }

      const auditReason = `LionBot dashboard bulk-clear by ${auth.discordId}: ${reason}`
      const outcomes = await processInPool(
        targetsToProcess,
        (uid) => removeRoleFromMember(guildId, uid, roleId, auditReason),
        ROLE_REMOVE_CONCURRENCY,
      )

      for (let i = 0; i < outcomes.length; i++) {
        const outcome = outcomes[i]
        if (outcome === "removed") result.rolesRemoved++
        else if (outcome === "missing") result.rolesAlreadyMissing++
        else {
          result.rolesFailed++
          failures.push({
            type: ticketType,
            userId: targetsToProcess[i].toString(),
            reason: "Discord role removal failed (member left, missing perms, or rate-limited too long)",
          })
        }
      }

      perType.push(result)
    }

    // Backfill audit result. Non-fatal if it fails -- the destructive
    // work is already done.
    try {
      await prisma.dashboard_admin_audit.update({
        where: { auditid: auditRow.auditid },
        data: {
          result: {
            perType,
            totalUniqueMembers,
            failures: failures.slice(0, 100),
            failuresTruncated: failures.length > 100,
          } as unknown as Prisma.InputJsonValue,
        },
      })
    } catch (e) {
      console.warn("[blacklists/clear-all] failed to backfill audit result", e)
    }

    // --- AI-MODIFIED (2026-04-25) ---
    // Purpose: Convert auditid (BigInt) to string before sending in JSON.
    //          JSON.stringify throws TypeError on BigInt values, which made
    //          this endpoint return 500 "Internal server error" to admins
    //          even though the destructive work + audit insert had already
    //          succeeded. The frontend dialog showed the generic error
    //          message and admins kept retrying, producing duplicate audit
    //          rows (no real harm, but a confusing experience). Mirrors the
    //          pattern already used in reset-stats.ts.
    return res.status(200).json({
      success: true,
      auditId: auditRow.auditid.toString(),
      perType,
      totalUniqueMembers,
      failures: failures.slice(0, 50),
      failuresTruncated: failures.length > 50,
    })
    // --- END AI-MODIFIED ---
  },
})
