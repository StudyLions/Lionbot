// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Regression checks for address deduplication and explicit consent.
// Run: node --test tests/email-campaign-consent.test.cjs
// ============================================================
const assert = require("node:assert/strict")
const test = require("node:test")
const fs = require("node:fs")
const path = require("node:path")
const Module = require("node:module")
const ts = require("typescript")
const filename = path.resolve(__dirname, "../utils/email/campaigns/eligibility.ts")
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const loaded = new Module(filename, module)
loaded._compile(compiled, filename)
const { buildCampaignAudience, isValidCampaignEmail } = loaded.exports

const ready = (changes = {}) => ({
  email: "leo@example.org", userid: "1", verified: true,
  unsubscribed: false, announcements: true, consented: true, suppressed: false,
  consentSource: "dashboard", externalConsentDocumented: false,
  ...changes,
})

test("legacy announcement defaults never create campaign consent", () => {
  const result = buildCampaignAudience([ready({ consented: false })])
  assert.equal(result.counts.eligible, 0)
  assert.equal(result.counts.unconsented, 1)
})

test("normalization deduplicates addresses without merging plus aliases", () => {
  const result = buildCampaignAudience([
    ready({ email: " Leo@Example.ORG " }),
    ready({ userid: "2", consented: false }),
    ready({ email: "leo+news@example.org", userid: "3" }),
  ])
  assert.equal(result.counts.total, 2)
  assert.deepEqual(result.recipients, [
    { email: "leo+news@example.org", userid: "3" },
    { email: "leo@example.org", userid: "1" },
  ])
})

test("any linked account's global or announcement opt-out suppresses its address", () => {
  for (const change of [{ unsubscribed: true }, { announcements: false }]) {
    const result = buildCampaignAudience([ready(), ready({ userid: "2", consented: false, ...change })])
    assert.equal(result.counts.eligible, 0)
    assert.equal(result.counts.unsubscribed, 1)
  }
})

test("verification must be true on the current consent owner's account", () => {
  for (const verified of [null, false]) {
    const result = buildCampaignAudience([
      ready({ verified }),
      ready({ userid: "2", consented: false, verified: true }),
    ])
    assert.equal(result.counts.eligible, 0)
    assert.equal(result.counts.unverified, 1)
  }
})

const external = (changes = {}) => ready({
  verified: null, consentSource: "founder_attested_external", externalConsentDocumented: true, ...changes,
})

test("documented external consent supports unknown historical verification without claiming it is verified", () => {
  const row = external()
  const result = buildCampaignAudience([row])
  assert.deepEqual(result.recipients, [{ email: "leo@example.org", userid: "1" }])
  assert.equal(result.counts.unverified, 0)
  assert.equal(row.verified, null, "Eligibility never mutates verification records")
})

test("external consent never permits an explicitly unverified owner or borrows another account's verification", () => {
  const result = buildCampaignAudience([
    external({ verified: false }), ready({ userid: "2", consented: false }),
  ])
  assert.equal(result.counts.eligible, 0)
  assert.equal(result.counts.unverified, 1)
})

test("unknown verification requires both external source and documented, active consent on the same row", () => {
  for (const change of [
    { consentSource: "dashboard" }, { consentSource: null },
    { externalConsentDocumented: false }, { externalConsentDocumented: undefined }, { consented: false },
  ]) {
    assert.equal(buildCampaignAudience([external(change)]).counts.eligible, 0)
  }
  const result = buildCampaignAudience([
    ready({ verified: null }), external({ userid: "2", consented: false }),
  ])
  assert.equal(result.counts.eligible, 0, "External provenance on another account cannot authorize the consent owner")
})

test("external consent cannot override duplicate-account opt-outs or any address suppression", () => {
  for (const change of [{ unsubscribed: true }, { announcements: false }, { suppressed: true }]) {
    const result = buildCampaignAudience([external(), ready({ userid: "2", consented: false, ...change })])
    assert.equal(result.counts.eligible, 0)
  }
})

test("revoked or old-address consent is excluded at the next eligibility check", () => {
  assert.equal(buildCampaignAudience([ready()]).counts.eligible, 1)
  assert.equal(buildCampaignAudience([ready({ consented: false })]).counts.eligible, 0)
  const changedAddress = buildCampaignAudience([ready({ email: "new@example.org", consented: false })])
  assert.deepEqual(changedAddress.recipients, [])
})

test("provider and unsubscribe suppressions override consent", () => {
  const result = buildCampaignAudience([ready({ suppressed: true })])
  assert.equal(result.counts.eligible, 0)
  assert.equal(result.counts.suppressed, 1)
})

test("rejects recipient injection and malformed addresses", () => {
  for (const email of [
    "a@example.org,b@example.org", "Leo <a@example.org>", "a@example.org\r\nBcc:b@example.org",
    "a..b@example.org", ".a@example.org", "a@-example.org", "a@example", "a@localhost",
    "a@exam_ple.org", "a".repeat(65) + "@example.org",
  ]) {
    assert.equal(isValidCampaignEmail(email), false, email)
    assert.equal(buildCampaignAudience([ready({ email })]).counts.eligible, 0, email)
  }
  assert.equal(isValidCampaignEmail("ari+leo@example.org"), true)
})

test("exclusion counts retain overlapping verification and consent problems", () => {
  const result = buildCampaignAudience([ready({ consented: false, verified: null })])
  assert.equal(result.counts.total, 1)
  assert.equal(result.counts.unverified, 1)
  assert.equal(result.counts.unconsented, 1)
})
