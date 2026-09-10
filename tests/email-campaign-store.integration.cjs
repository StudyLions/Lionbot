// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Exercise real draft/queue/state/lease/unsubscribe SQL
//          only in studylion_test, with rollback and no email worker.
// Run: node tests/email-campaign-store.integration.cjs
// ============================================================
const assert = require("node:assert/strict")
const crypto = require("node:crypto")
const fs = require("node:fs")
const path = require("node:path")
const Module = require("node:module")
const ts = require("typescript")
const root = path.resolve(__dirname, "..")
const localValue = fs.readFileSync(path.join(root, ".env"), "utf8").match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/m)?.[1]
const configured = process.env.EMAIL_CAMPAIGN_TEST_DATABASE_URL || localValue?.replace(/^(['"])(.*)\1$/, "$2")
if (!configured || new URL(configured).pathname !== "/studylion_test") {
  throw new Error("Campaign store integration requires the studylion_test database")
}
process.env.DATABASE_URL = configured
process.env.EMAIL_TOKEN_SECRET = "integration-only-token-key-never-use-for-delivery-20260910"
const { PrismaClient } = require("@prisma/client")
const client = new PrismaClient({ datasources: { db: { url: configured } } })
let tx
let fixtureAudience = []
const proxy = new Proxy({}, {
  get(_target, property) {
    if (!tx) throw new Error("Application SQL must stay inside the rollback transaction")
    if (property === "$transaction") return async callback => callback(tx)
    const value = tx[property]
    return typeof value === "function" ? value.bind(tx) : value
  },
})
const originalResolve = Module._resolveFilename
const originalLoad = Module._load
Module._resolveFilename = function(request, parent, ...rest) {
  return originalResolve.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, parent, ...rest)
}
Module._load = function(request, parent, isMain) {
  if (request === "@/utils/prisma") return { prisma: proxy }
  if (request === "./consent" && parent?.filename.endsWith(`${path.sep}store.ts`)) {
    // Never enumerate or enqueue existing test users. Only these synthetic rows
    // can enter the store's queue operation; real consent SQL is tested separately.
    return { getCampaignAudience: async () => ({ recipients: fixtureAudience }) }
  }
  if (request === "resend" || /campaigns[\\/]worker/.test(request)) {
    throw new Error("Email transport and worker imports are forbidden in this test")
  }
  return originalLoad.call(this, request, parent, isMain)
}
require.extensions[".ts"] = (loaded, filename) => loaded._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename)
const store = require(path.join(root, "utils/email/campaigns/store.ts"))
const unsubscribe = require(path.join(root, "pages/api/email/campaign-unsubscribe.ts")).default
const { createCampaignUnsubscribeToken } = require(path.join(root, "utils/email/campaigns/tokens.ts"))
const { DEFAULT_FUNDRAISER_CONTENT } = require(path.join(root, "utils/email/campaigns/content.ts"))
const rollback = new Error("ROLLBACK_CAMPAIGN_STORE_FIXTURES")
const seed = BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000))
const ids = [-seed, -seed - 1n, -seed - 2n]
const email = `campaign-store-${seed}@example.invalid`
const otherEmail = `campaign-store-other-${seed}@example.invalid`
const campaignIds = []
const leaseOwner = `integration-${crypto.randomUUID()}`

function response() {
  return {
    statusCode: 200, body: null, headersSent: false, headers: {},
    status(code) { this.statusCode = code; return this },
    setHeader(name, value) { this.headers[name] = value },
    json(body) { this.body = body; this.headersSent = true; return this },
  }
}
async function unsubscribeRequest(method, token, body) {
  const res = response()
  await unsubscribe({ method, query: { token }, body: body || {}, headers: {} }, res)
  return res
}
async function recipientsFor(id) {
  return tx.$queryRaw`SELECT id, email, userid, status FROM email_campaign_recipients WHERE campaign_id = ${id} ORDER BY email`
}
async function draft() {
  const result = await store.createCampaign("Store integration fixture", DEFAULT_FUNDRAISER_CONTENT, ids[0].toString())
  campaignIds.push(result.id)
  return result
}
async function queue(campaign) {
  return store.queueCampaign(campaign.id, campaign.content.subject, campaign.revision, fixtureAudience.length)
}

async function main() {
  assert.equal((await client.$queryRaw`SELECT current_database() AS name`)[0].name, "studylion_test")
  assert.equal(await client.user_config.count({ where: { userid: { in: ids } } }), 0)
  try {
    await client.$transaction(async transaction => {
      tx = transaction
      await tx.user_config.createMany({ data: [
        { userid: ids[0], email, email_verified: true, email_pref_announcements: true },
        { userid: ids[1], email: ` ${email.toUpperCase()} `, email_verified: true, email_pref_announcements: true },
        { userid: ids[2], email: otherEmail, email_verified: true, email_pref_announcements: true },
      ] })
      await tx.$executeRaw`INSERT INTO email_campaign_subscriptions (email, userid) VALUES
        (${email}, ${ids[0]}), (${otherEmail}, ${ids[2]})`
      fixtureAudience = [
        { email, userid: ids[0].toString() },
        { email: ` ${email.toUpperCase()} `, userid: ids[1].toString() },
        { email: otherEmail, userid: ids[2].toString() },
      ]

      const initial = await draft()
      assert.equal(initial.status, "draft")
      assert.match(initial.revision, /^[0-9a-f]{64}$/)
      const changed = await store.editCampaign(initial.id, " Edited fixture ", { ...DEFAULT_FUNDRAISER_CONTENT, subject: " Revised subject " }, initial.revision)
      assert.equal(changed.name, "Edited fixture")
      assert.equal(changed.content.subject, "Revised subject")
      assert.notEqual(changed.revision, initial.revision)
      await assert.rejects(store.editCampaign(initial.id, "Stale overwrite", DEFAULT_FUNDRAISER_CONTENT, initial.revision), /changed since/)
      await assert.rejects(store.queueCampaign(changed.id, changed.content.subject, initial.revision, fixtureAudience.length), /changed since/)
      await assert.rejects(store.queueCampaign(changed.id, changed.content.subject, changed.revision, 999), /audience count changed/)
      await assert.rejects(store.queueCampaign(changed.id, "Wrong subject", changed.revision, fixtureAudience.length), /exact email subject/)
      assert.equal((await recipientsFor(changed.id)).length, 0, "Rejected launch attempts create no recipients")

      const queued = await queue(changed)
      assert.equal(queued.status, "queued")
      assert.equal(queued.counts.total, 2, "Queue deduplicates normalized addresses")
      const queuedRecipients = await recipientsFor(changed.id)
      assert.equal(queuedRecipients.find(row => row.email === email).userid, ids[0])
      await assert.rejects(store.editCampaign(queued.id, "Frozen edit", DEFAULT_FUNDRAISER_CONTENT, queued.revision), /Only a draft/)
      await assert.rejects(queue(queued), /Only a draft/)
      assert.equal((await store.changeCampaignState(queued.id, "pause")).status, "paused")
      assert.equal((await store.changeCampaignState(queued.id, "resume")).status, "queued")
      assert.equal((await store.changeCampaignState(queued.id, "cancel")).status, "cancelled")
      assert.ok((await recipientsFor(queued.id)).every(row => row.status === "skipped"))
      await assert.rejects(store.changeCampaignState(queued.id, "resume"), /not available/)

      assert.equal(await store.acquireCampaignLease(leaseOwner), true, "Acquire the idle shared lease")
      assert.equal(await store.acquireCampaignLease(leaseOwner), false, "An active lease cannot be acquired twice")
      assert.equal(await store.acquireCampaignLease(`${leaseOwner}-other`), false)
      await store.releaseCampaignLease(`${leaseOwner}-other`)
      assert.equal(await store.acquireCampaignLease(`${leaseOwner}-other`), false, "Another owner cannot release the lease")
      await store.releaseCampaignLease(leaseOwner)
      assert.equal(await store.acquireCampaignLease(`${leaseOwner}-other`), true)
      await store.releaseCampaignLease(`${leaseOwner}-other`)

      const firstMail = await queue(await draft())
      const secondMail = await queue(await draft())
      const signedRecipient = (await recipientsFor(firstMail.id)).find(row => row.email === email)
      const token = createCampaignUnsubscribeToken(signedRecipient.id)
      const before = await tx.$queryRaw`SELECT count(*) AS count FROM email_campaign_suppressions WHERE email = ${email}`
      assert.equal(Number(before[0].count), 0)
      const get = await unsubscribeRequest("GET", token)
      assert.equal(get.statusCode, 200)
      assert.deepEqual(get.body, { valid: true, unsubscribed: false })
      assert.equal(get.headers["Referrer-Policy"], "no-referrer")
      assert.equal((await tx.user_config.findUnique({ where: { userid: ids[0] }, select: { email_pref_announcements: true } })).email_pref_announcements, true)
      assert.equal(Number((await tx.$queryRaw`SELECT count(*) AS count FROM email_campaign_suppressions WHERE email = ${email}`)[0].count), 0, "GET creates no suppression")
      assert.ok((await recipientsFor(firstMail.id)).every(row => row.status === "pending"), "Scanner GET does not affect queue")

      assert.equal((await unsubscribeRequest("POST", `${token}tampered`)).statusCode, 400)
      assert.equal((await unsubscribeRequest("POST", token, { "List-Unsubscribe": "One-Click" })).statusCode, 200)
      assert.equal((await unsubscribeRequest("POST", token, { "List-Unsubscribe": "One-Click" })).statusCode, 200, "Repeated one-click POST is idempotent")
      assert.equal((await unsubscribeRequest("GET", token)).body.unsubscribed, true)
      const optedOut = await tx.user_config.findMany({ where: { userid: { in: ids } }, select: { userid: true, email_pref_announcements: true } })
      assert.ok(optedOut.filter(row => row.userid !== ids[2]).every(row => row.email_pref_announcements === false), "Both duplicate accounts are opted out")
      assert.equal(optedOut.find(row => row.userid === ids[2]).email_pref_announcements, true)
      const consent = await tx.$queryRaw`SELECT revoked_at FROM email_campaign_subscriptions WHERE email = ${email}`
      assert.ok(consent[0].revoked_at instanceof Date)
      assert.equal(Number((await tx.$queryRaw`SELECT count(*) AS count FROM email_campaign_suppressions WHERE email = ${email}`)[0].count), 1)
      for (const campaign of [firstMail, secondMail]) {
        const recipients = await recipientsFor(campaign.id)
        assert.equal(recipients.find(row => row.email === email).status, "skipped", "Opt-out skips this address across queued campaigns")
        assert.equal(recipients.find(row => row.email === otherEmail).status, "pending", "Other subscriber remains queued")
      }
      throw rollback
    }, { timeout: 60000 })
  } catch (error) {
    if (error !== rollback) throw error
  } finally { tx = null }
  assert.equal(await client.user_config.count({ where: { userid: { in: ids } } }), 0)
  const leftovers = await client.$queryRaw`SELECT
    (SELECT count(*) FROM email_campaigns WHERE created_by = ${ids[0].toString()}) +
    (SELECT count(*) FROM email_campaign_recipients WHERE userid IN (${ids[0]}, ${ids[1]}, ${ids[2]})) +
    (SELECT count(*) FROM email_campaign_subscriptions WHERE email IN (${email}, ${otherEmail})) +
    (SELECT count(*) FROM email_campaign_suppressions WHERE email IN (${email}, ${otherEmail})) AS count`
  assert.equal(Number(leftovers[0].count), 0, "All SQL fixtures rolled back")
  console.log("PASS: real draft revision/stale review, frozen deduplicated queue, pause/resume/cancel, exclusive lease, scanner-safe GET, signed and idempotent unsubscribe POST across queues; all fixtures rolled back; no worker or email transport used.")
}
main().catch(error => { console.error(error.message); process.exitCode = 1 }).finally(() => client.$disconnect())
