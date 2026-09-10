// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Import eligibility, provenance and reviewed-snapshot safety checks.
// Run: node --test tests/email-external-subscriber-import.test.cjs
// ============================================================
const test = require("node:test")
const assert = require("node:assert/strict")
const { selectImportCandidates, makeSnapshot, validateSnapshot, intersectReviewedRecipients, applySnapshot, parseArguments } = require("../scripts/import-external-campaign-subscribers.cjs")
const crypto = require("node:crypto")
const identity = { database: "fixture", serverFingerprint: crypto.createHash("sha256").update("fixture|local|local").digest("hex") }
const row = (changes = {}) => ({ email: "member@example.test", userid: "9", verified: null, unsubscribed: false, announcements: true, suppressed: false, hasSubscription: false, revoked: false, ...changes })

test("a linked account opt-out vetoes the whole address", () => {
  for (const optOut of [{ unsubscribed: true }, { announcements: false }, { announcements: null }]) {
    const result = selectImportCandidates([row({ verified: true }), row({ userid: "10", ...optOut })])
    assert.equal(result.counts.optedOut, 1)
    assert.deepEqual(result.recipients, [])
  }
})

test("suppression and either active or revoked consent are never overwritten", () => {
  for (const blocked of [{ suppressed: true }, { hasSubscription: true }, { hasSubscription: true, revoked: true }]) {
    assert.equal(selectImportCandidates([row(blocked)]).recipients.length, 0)
  }
})

test("deduplication prefers verified true, then a stable numeric user id", () => {
  const rows = [row({ email: " Member@Example.test ", userid: "1" }), row({ userid: "100", verified: true }), row({ userid: "20", verified: true })]
  assert.deepEqual(selectImportCandidates(rows).recipients, [{ email: "member@example.test", userid: "20" }])
  assert.deepEqual(selectImportCandidates(rows.reverse()).recipients, [{ email: "member@example.test", userid: "20" }])
  assert.equal(selectImportCandidates([row({ userid: "100" }), row({ userid: "20" })]).recipients[0].userid, "20")
})

test("invalid addresses and explicitly unverified accounts cannot be imported", () => {
  assert.equal(selectImportCandidates([row({ verified: false })]).counts.noPermittedAccount, 1)
  assert.equal(selectImportCandidates([row({ verified: undefined })]).recipients.length, 0)
  assert.equal(selectImportCandidates([row({ email: "name@example.test\nBcc: hidden@example.test" })]).counts.invalid, 1)
  assert.equal(selectImportCandidates([row({ verified: false }), row({ userid: "11" })]).recipients[0].userid, "11")
})

test("snapshot records current evidence while preserving unknown historic signup dates", () => {
  const snapshot = makeSnapshot(selectImportCandidates([row()]), identity, "2026-09-10T14:30:00.000Z")
  assert.equal(snapshot.recordedAt, "2026-09-10T14:30:00.000Z")
  assert.match(snapshot.attestation, /original signup dates are unknown/)
  assert.equal(snapshot.recipients[0].consented_at, undefined)
  assert.equal(validateSnapshot(snapshot, snapshot.sha256, identity), snapshot)
  assert.throws(() => validateSnapshot(snapshot, undefined, identity), /explicit/)
  assert.throws(() => validateSnapshot({ ...snapshot, recipients: [] }, snapshot.sha256, identity), /hash/)
  assert.throws(() => validateSnapshot(snapshot, snapshot.sha256, { ...identity, database: "other" }), /different database/)
})

test("apply can only retain reviewed addresses with the same eligible account", () => {
  const snapshot = makeSnapshot(selectImportCandidates([row()]), identity)
  const future = row({ email: "later@example.test", userid: "12" })
  assert.deepEqual(intersectReviewedRecipients(snapshot, selectImportCandidates([row(), future])), snapshot.recipients)
  assert.deepEqual(intersectReviewedRecipients(snapshot, selectImportCandidates([row({ userid: "10" }), future])), [])
  assert.deepEqual(intersectReviewedRecipients(snapshot, selectImportCandidates([row({ unsubscribed: true }), future])), [])
})

test("transaction import uses real import time, null historical consent and conflict no-op", async () => {
  const snapshot = makeSnapshot(selectImportCandidates([row()]), identity)
  const statements = []
  const db = {
    async $queryRawUnsafe(sql) {
      if (sql.startsWith("SELECT current_database")) return [{ database: "fixture", address: "local", port: "local" }]
      if (sql.includes("to_regclass")) return [{ subscriptions: true, suppressions: true, provenance: true }]
      if (sql.includes("AS \"hasSubscription\"")) return [row(), row({ email: "future@example.test", userid: "100" })]
      if (sql.includes("FOR UPDATE OF u")) return [{ userid: 9n }]
      throw new Error("Unexpected query")
    },
    async $executeRawUnsafe(sql, ...params) { statements.push({ sql, params }); return sql.startsWith("INSERT") ? 1 : 0 },
  }
  const prisma = { async $transaction(fn) { return fn(db) } }
  assert.deepEqual(await applySnapshot(prisma, snapshot, snapshot.sha256, "fixture"), { reviewed: 1, inserted: 1, skippedAtApply: 0 })
  const insert = statements.find((statement) => statement.sql.startsWith("INSERT"))
  assert.match(insert.sql, /NULL, NULL, 'founder_attested_external', NOW\(\)/)
  assert.match(insert.sql, /ON CONFLICT \(email\) DO NOTHING/)
  assert.deepEqual(JSON.parse(insert.params[0]), snapshot.recipients)
  assert.match(insert.params[1], /Reviewed snapshot SHA-256/)
  assert.equal(statements.some((statement) => /UPDATE user_config|DELETE FROM/.test(statement.sql)), false)
})

test("CLI is dry-run by default and private snapshots cannot be saved in the repo", () => {
  assert.equal(parseArguments(["--database", "fixture", "--snapshot", "../.tmp/email-campaigns/private.json"]).apply, false)
  assert.throws(() => parseArguments(["--database", "fixture", "--snapshot", "private.json"]), /outside/)
})
