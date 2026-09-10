// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: One-time, reviewed import of founder-attested external signups.
// Default is read-only. This script never sends email or changes preferences.
// ============================================================
// DATABASE_URL must be provided through the environment (never a CLI argument).
// Dry run: node scripts/import-external-campaign-subscribers.cjs --database studylion --snapshot ../.tmp/email-campaigns/external-signups.json
// Apply:   same command plus --apply --expect-sha256 <hash printed by dry run>
// The private snapshot contains addresses; keep it outside the website repository.
const fs = require("node:fs")
const path = require("node:path")
const crypto = require("node:crypto")
const vm = require("node:vm")
const ts = require("typescript")

const repo = path.resolve(__dirname, "..")
const ATTESTATION = "On 2026-09-10, founder Ari Horesh was asked whether all existing users explicitly subscribed to LionBot announcements through an external mailing list or signup form. He replied: Yes, all of them. This import records that founder attestation for only the reviewed existing-address snapshot; the original signup dates are unknown. Legacy default-on preferences are not the source of consent."

function audienceHelpers() {
  const filename = path.join(repo, "utils/email/campaigns/eligibility.ts")
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(source, { module, exports: module.exports }, { filename })
  return module.exports
}
const { normalizeCampaignEmail, isValidCampaignEmail } = audienceHelpers()
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex")

function selectImportCandidates(rows) {
  const grouped = new Map()
  for (const row of rows) {
    const email = normalizeCampaignEmail(row.email || "")
    if (!email) continue
    if (!grouped.has(email)) grouped.set(email, [])
    grouped.get(email).push(row)
  }
  const counts = {
    addressRows: rows.length, uniqueAddresses: grouped.size, eligible: 0,
    invalid: 0, optedOut: 0, suppressed: 0, existingActiveConsent: 0,
    existingRevokedConsent: 0, noPermittedAccount: 0, verified: 0, verificationUnknown: 0,
  }
  const recipients = []
  for (const email of [...grouped.keys()].sort()) {
    const linked = grouped.get(email)
    const invalid = !isValidCampaignEmail(email)
    const optedOut = linked.some((row) => row.unsubscribed !== false || row.announcements !== true)
    const suppressed = linked.some((row) => row.suppressed === true)
    const active = linked.some((row) => row.hasSubscription === true && row.revoked !== true)
    const revoked = linked.some((row) => row.hasSubscription === true && row.revoked === true)
    const permitted = linked.filter((row) =>
      (row.verified === true || row.verified === null) && /^\d+$/.test(row.userid)
    ).sort((a, b) => {
      if (a.verified !== b.verified) return a.verified === true ? -1 : 1
      return BigInt(a.userid) < BigInt(b.userid) ? -1 : BigInt(a.userid) > BigInt(b.userid) ? 1 : 0
    })
    if (invalid) counts.invalid++
    if (optedOut) counts.optedOut++
    if (suppressed) counts.suppressed++
    if (active) counts.existingActiveConsent++
    if (revoked) counts.existingRevokedConsent++
    if (!permitted.length) counts.noPermittedAccount++
    if (invalid || optedOut || suppressed || active || revoked || !permitted.length) continue
    const recipient = permitted[0]
    recipients.push({ email, userid: recipient.userid })
    counts.eligible++
    if (recipient.verified === true) counts.verified++
    else counts.verificationUnknown++
  }
  return { counts, recipients }
}

function makeSnapshot(selection, identity, recordedAt = new Date().toISOString()) {
  const payload = {
    version: 1, database: identity.database, serverFingerprint: identity.serverFingerprint,
    recordedAt, source: "founder_attested_external", attestation: ATTESTATION,
    counts: selection.counts, recipients: selection.recipients,
  }
  return { ...payload, sha256: sha256(JSON.stringify(payload)) }
}

function validateSnapshot(snapshot, expectedHash, identity) {
  if (!/^[a-f0-9]{64}$/.test(expectedHash || "")) throw new Error("An explicit --expect-sha256 from the reviewed dry run is required")
  const { sha256: digest, ...payload } = snapshot
  if (digest !== expectedHash || sha256(JSON.stringify(payload)) !== expectedHash) throw new Error("Snapshot hash does not match the reviewed dry run")
  if (snapshot.version !== 1 || snapshot.source !== "founder_attested_external" || snapshot.attestation !== ATTESTATION) throw new Error("Unsupported snapshot provenance")
  if (snapshot.database !== identity.database || snapshot.serverFingerprint !== identity.serverFingerprint) throw new Error("Snapshot belongs to a different database")
  if (!Number.isFinite(Date.parse(snapshot.recordedAt))) throw new Error("Snapshot has no valid attestation recording time")
  if (!Array.isArray(snapshot.recipients) || snapshot.counts.eligible !== snapshot.recipients.length) throw new Error("Snapshot count is invalid")
  const emails = new Set()
  for (const row of snapshot.recipients) {
    if (typeof row.email !== "string" || row.email !== normalizeCampaignEmail(row.email) || !isValidCampaignEmail(row.email) || !/^\d+$/.test(row.userid) || emails.has(row.email)) throw new Error("Snapshot recipient data is invalid")
    emails.add(row.email)
  }
  return snapshot
}

function intersectReviewedRecipients(snapshot, currentSelection) {
  const current = new Map(currentSelection.recipients.map((row) => [row.email, row.userid]))
  return snapshot.recipients.filter((row) => current.get(row.email) === row.userid)
}

async function databaseIdentity(db, expectedDatabase) {
  const [row] = await db.$queryRawUnsafe("SELECT current_database() AS database, COALESCE(inet_server_addr()::text, 'local') AS address, COALESCE(inet_server_port()::text, 'local') AS port")
  if (row.database !== expectedDatabase) throw new Error("Connected database differs from --database")
  return { database: row.database, serverFingerprint: sha256(`${row.database}|${row.address}|${row.port}`) }
}

async function loadRows(db, requireSchema = false) {
  const [tables] = await db.$queryRawUnsafe(`SELECT
    to_regclass('public.email_campaign_subscriptions') IS NOT NULL AS subscriptions,
    to_regclass('public.email_campaign_suppressions') IS NOT NULL AS suppressions,
    (SELECT count(*) = 3 FROM information_schema.columns WHERE table_schema = 'public'
      AND table_name = 'email_campaign_subscriptions' AND column_name IN ('source', 'imported_at', 'evidence_note')) AS provenance`)
  if (requireSchema && (!tables.subscriptions || !tables.suppressions || !tables.provenance)) throw new Error("Campaign and external-consent migrations must be applied before import")
  // Join fragments depend only on known table-presence booleans, never user input.
  const rows = await db.$queryRawUnsafe(`SELECT lower(btrim(u.email)) AS email,
    u.userid::text AS userid, u.email_verified AS verified,
    u.email_unsubscribed_all AS unsubscribed, u.email_pref_announcements AS announcements,
    ${tables.subscriptions ? "s.email IS NOT NULL" : "false"} AS "hasSubscription",
    ${tables.subscriptions ? "s.revoked_at IS NOT NULL" : "false"} AS revoked,
    ${tables.suppressions ? "x.email IS NOT NULL" : "false"} AS suppressed
    FROM user_config u
    ${tables.subscriptions ? "LEFT JOIN email_campaign_subscriptions s ON s.email = lower(btrim(u.email))" : ""}
    ${tables.suppressions ? "LEFT JOIN email_campaign_suppressions x ON x.email = lower(btrim(u.email))" : ""}
    WHERE u.email IS NOT NULL AND btrim(u.email) <> ''`)
  return { rows, schemaReady: tables.subscriptions && tables.suppressions && tables.provenance }
}

async function applySnapshot(prisma, snapshot, expectedHash, expectedDatabase) {
  return prisma.$transaction(async (db) => {
    validateSnapshot(snapshot, expectedHash, await databaseIdentity(db, expectedDatabase))
    await loadRows(db, true)
    // Serialize imports with consent and suppression changes for this short transaction.
    // Fail immediately on contention instead of blocking a user's preference save.
    // Account locks cover every currently linked account, including duplicate opt-outs.
    await db.$executeRawUnsafe("LOCK TABLE email_campaign_suppressions IN SHARE MODE NOWAIT")
    await db.$executeRawUnsafe("LOCK TABLE email_campaign_subscriptions IN SHARE ROW EXCLUSIVE MODE NOWAIT")
    await db.$queryRawUnsafe(`SELECT u.userid FROM user_config u
      JOIN jsonb_to_recordset($1::jsonb) AS reviewed(email text, userid text)
        ON lower(btrim(u.email)) = reviewed.email
      WHERE u.email IS NOT NULL AND btrim(u.email) <> ''
      ORDER BY u.userid FOR UPDATE OF u NOWAIT`, JSON.stringify(snapshot.recipients))
    const current = selectImportCandidates((await loadRows(db, true)).rows)
    const remaining = intersectReviewedRecipients(snapshot, current)
    if (!remaining.length) return { reviewed: snapshot.recipients.length, inserted: 0, skippedAtApply: snapshot.recipients.length }
    const evidence = `${snapshot.attestation} Attestation recorded for import at ${snapshot.recordedAt}. Reviewed snapshot SHA-256: ${expectedHash}.`
    const inserted = await db.$executeRawUnsafe(`INSERT INTO email_campaign_subscriptions
      (email, userid, consented_at, revoked_at, source, imported_at, evidence_note)
      SELECT r.email, r.userid::bigint, NULL, NULL, 'founder_attested_external', NOW(), $2
      FROM jsonb_to_recordset($1::jsonb) AS r(email text, userid text)
      ON CONFLICT (email) DO NOTHING`, JSON.stringify(remaining), evidence)
    return { reviewed: snapshot.recipients.length, inserted, skippedAtApply: snapshot.recipients.length - inserted }
  }, { maxWait: 10000, timeout: 60000 })
}

function parseArguments(argv) {
  const options = { apply: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--apply") options.apply = true
    else if (["--database", "--snapshot", "--expect-sha256"].includes(arg)) {
      if (!argv[i + 1] || argv[i + 1].startsWith("--")) throw new Error(`Missing value for ${arg}`)
      options[arg.slice(2)] = argv[++i]
    } else throw new Error("Unknown argument; use --database, --snapshot, and optionally --apply --expect-sha256")
  }
  if (!options.database || !options.snapshot) throw new Error("--database and --snapshot are required")
  if (!options.apply && options["expect-sha256"]) throw new Error("--expect-sha256 is only used with --apply")
  const snapshotPath = path.resolve(options.snapshot)
  const relative = path.relative(repo, snapshotPath)
  if (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative)) throw new Error("Keep the private address snapshot outside the website repository")
  return { ...options, snapshot: snapshotPath }
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv)
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in the environment; do not put credentials in command arguments")
  const { PrismaClient } = require("@prisma/client")
  const prisma = new PrismaClient({ log: [] })
  try {
    const identity = await databaseIdentity(prisma, options.database)
    if (options.apply) {
      const snapshot = JSON.parse(fs.readFileSync(options.snapshot, "utf8"))
      validateSnapshot(snapshot, options["expect-sha256"], identity)
      const result = await applySnapshot(prisma, snapshot, options["expect-sha256"], options.database)
      console.log(JSON.stringify({ mode: "applied", database: identity.database, snapshotSha256: snapshot.sha256, ...result, emailsSent: 0 }, null, 2))
    } else {
      const observed = await loadRows(prisma)
      const snapshot = makeSnapshot(selectImportCandidates(observed.rows), identity)
      fs.mkdirSync(path.dirname(options.snapshot), { recursive: true })
      fs.writeFileSync(options.snapshot, JSON.stringify(snapshot, null, 2) + "\n", { flag: "wx", mode: 0o600 })
      console.log(JSON.stringify({ mode: "dry-run", database: identity.database, schemaReady: observed.schemaReady, counts: snapshot.counts, snapshotSha256: snapshot.sha256, note: "Exclusion counts may overlap. Snapshot contains private addresses; do not commit or print it. No database writes or emails." }, null, 2))
    }
  } finally {
    await prisma.$disconnect()
  }
}

module.exports = { ATTESTATION, selectImportCandidates, makeSnapshot, validateSnapshot, intersectReviewedRecipients, applySnapshot, parseArguments }
if (require.main === module) main().catch((error) => {
  // Database errors can contain SQL parameters or connection details. Do not dump them.
  const known = ["Snapshot", "Unsupported snapshot", "An explicit", "Connected database", "Campaign and external", "Keep the private", "--", "Missing value", "Unknown argument", "Set DATABASE_URL"]
  console.error(known.some((prefix) => error.message?.startsWith(prefix)) ? error.message : "Import failed; no email was sent. Inspect privately before retrying.")
  process.exitCode = 1
})
