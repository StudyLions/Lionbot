// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Isolated campaign safety tests; all database and provider calls are fakes.
// Run: node --test scripts/test-email-campaigns.cjs
// ============================================================
const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")
const crypto = require("node:crypto")
const root = path.resolve(__dirname, "..")
const env = {
  EMAIL_CAMPAIGN_SEND_ENABLED: "true", VERCEL_ENV: "production", RESEND_API_KEY: "fake-never-sent",
  EMAIL_TOKEN_SECRET: "test-only-signing-secret-at-least-32-characters", RESEND_WEBHOOK_SECRET: "fake-webhook",
  CRON_SECRET: "fake-cron", SECRET: "fake-auth",
}
class ValidationError extends Error { constructor(message, status = 400) { super(message); this.status = status } }
function apiHandler(handlers) {
  return async (req, res) => {
    try { return await handlers[req.method](req, res) }
    catch (error) { return res.status(error.status || 500).json({ error: error.message }) }
  }
}
function load(relative, mocks = {}, globals = {}) {
  const filename = path.join(root, relative)
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText
  const module = { exports: {} }
  const context = {
    module, exports: module.exports, Buffer, URL, AbortController, Date,
    process: { env: { ...env } }, console,
    setTimeout: (fn, ms) => setTimeout(fn, ms < 10000 ? 0 : ms), clearTimeout,
    // Unexpected requests must fail locally; this harness has no network transport.
    fetch: () => { throw new Error("Unexpected network request in isolated test") },
    require(name) {
      if (Object.prototype.hasOwnProperty.call(mocks, name)) return mocks[name]
      if (name === "crypto") return crypto
      throw new Error(`Unmocked import ${name} from ${relative}`)
    }, ...globals,
  }
  vm.runInNewContext(source, context, { filename })
  return module.exports
}
function response() {
  return { code: 200, body: null, headers: {}, setHeader(name, value) { this.headers[name] = value },
    status(code) { this.code = code; return this }, json(body) { this.body = body; return this } }
}
const readiness = load("utils/email/campaigns/readiness.ts", {
  "@/utils/prisma": { prisma: {} }, "@/utils/apiHandler": { ValidationError },
})
const tokens = load("utils/email/campaigns/tokens.ts")

function harness(options = {}) {
  const id = "c79c3280-3c72-45ac-9bd7-93c7caa2e3f9"
  const state = {
    campaign: { id: "7f2f2495-b6ce-477e-8439-7c435b9b2677", status: "queued", mode: "campaign", content: { subject: "Leo needs a home" } },
    recipient: { id, campaign_id: "7f2f2495-b6ce-477e-8439-7c435b9b2677", email: "owner@example.test", userid: 42n,
      status: "pending", attempts: 0, payload: null, first_attempt_at: null, idempotency_key: `campaign/fixture/${id}` },
    calls: [], queries: [], renders: 0, eligibilityCalls: 0, released: 0, missing: false,
  }
  const sqlDb = {
    async $executeRaw(strings, ...values) {
      const sql = strings.join("?").replace(/\s+/g, " ")
      state.queries.push(sql)
      if (sql.includes("SET payload =")) {
        if (state.missing || !["queued", "sending"].includes(state.campaign.status) || state.recipient.status !== "pending") return 0
        state.recipient.payload = JSON.parse(values[0]); state.recipient.status = "sending"
        state.recipient.first_attempt_at ||= new Date(); state.recipient.attempts++
        return 1
      }
      if (sql.includes("provider_id =")) {
        if (options.crashAfterAccepted && !state.crashed) { state.crashed = true; throw new Error("Simulated database failure after provider acceptance") }
        state.recipient.status = "sent"; state.recipient.provider_id = values[0]; return 1
      }
      if (sql.includes("UPDATE email_campaigns SET status = 'paused'")) { state.campaign.status = "paused"; return 1 }
      if (sql.includes("SET status = 'pending', error =")) { state.recipient.status = "pending"; state.recipient.error = values[0]; return 1 }
      if (sql.includes("SET status = ?, error = ?")) {
        if (state.recipient.status !== "sent") { state.recipient.status = values[0]; state.recipient.error = values[1] }
        return 1
      }
      throw new Error(`Unexpected mocked SQL: ${sql}`)
    },
  }
  const eligibility = async (_email, userid) => {
    assert.equal(userid, "42", "queued delivery remains bound to its original account")
    state.eligibilityCalls++
    if (options.eligibility) return options.eligibility(state)
    return true
  }
  const store = {
    acquireCampaignLease: async () => !options.leaseBusy,
    releaseCampaignLease: async () => { state.released++ },
    recoverInterruptedRecipients: async () => { if (state.recipient.status === "sending") state.recipient.status = "pending" },
    nextCampaignRecipient: async () => !state.missing && state.recipient.status === "pending" && ["queued", "sending"].includes(state.campaign.status)
      ? { campaign: { ...state.campaign }, recipient: { ...state.recipient, payload: state.recipient.payload ? JSON.parse(JSON.stringify(state.recipient.payload)) : null } } : null,
    completeFinishedCampaigns: async () => { if (!["pending", "sending"].includes(state.recipient.status) && state.campaign.status !== "paused") state.campaign.status = "completed" },
    isOwnerTestEligible: async () => true,
  }
  const worker = load("utils/email/campaigns/worker.ts", {
    "@/utils/prisma": { prisma: sqlDb },
    "@/utils/email/brand": { brand: { siteUrl: "https://lionbot.org", fromMarketing: "LionBot <hello@lionbot.org>", replyTo: "support@lionbot.org" } },
    "./render": { renderCampaignEmail: async () => { state.renders++; if (options.renderFails) throw new Error("Render failed"); return { html: `<p>revision ${state.renders}</p>`, text: "Leo's email" } } },
    "./consent": { isCampaignRecipientEligible: eligibility }, "./tokens": tokens,
    "./readiness": { ...readiness, requireCampaignSending: async () => { if (readiness.campaignConfigurationIssues().length) throw new Error("Not ready") } },
    "./store": store,
  }, { fetch: async (url, request) => {
    assert.equal(url, "https://api.resend.com/emails")
    state.calls.push({ body: request.body, key: request.headers["Idempotency-Key"] })
    return { status: options.providerStatus || 200, headers: { get: () => null }, json: async () => options.providerBody || { id: "provider-fixture-id" } }
  } })
  return { worker, state }
}

test("a successful worker persists payload before a provider call and records acceptance", async () => {
  const { worker, state } = harness()
  const result = await worker.runCampaignWorker()
  assert.equal(result.processed, 1); assert.equal(state.recipient.status, "sent"); assert.equal(state.calls.length, 1)
  assert.equal(state.recipient.attempts, 1); assert.equal(state.released, 1)
  const payload = JSON.parse(state.calls[0].body)
  assert.equal(payload.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click")
  assert.match(payload.headers["List-Unsubscribe"], /^<https:\/\/lionbot\.org\/api\/email\/campaign-unsubscribe\?token=/)
  assert.equal(state.eligibilityCalls, 2)
})

test("provider acceptance followed by a database crash retries exactly the saved payload and key", async () => {
  const { worker, state } = harness({ crashAfterAccepted: true })
  await assert.rejects(worker.runCampaignWorker(), /Simulated database failure/)
  assert.equal(state.recipient.status, "sending"); assert.equal(state.released, 1)
  await worker.runCampaignWorker()
  assert.equal(state.calls.length, 2); assert.deepEqual(state.calls[0], state.calls[1])
  assert.equal(state.renders, 1, "retry must not regenerate token, template, headers or content")
  assert.equal(state.recipient.status, "sent")
})

test("an uncertain delivery outside the safe idempotency window is held for manual review", async () => {
  const { worker, state } = harness()
  state.recipient.first_attempt_at = new Date(Date.now() - 24 * 60 * 60 * 1000)
  state.recipient.payload = { persisted: true }
  await worker.runCampaignWorker()
  assert.equal(state.calls.length, 0); assert.equal(state.recipient.status, "unknown")
})

test("unsubscribing between audience selection and the final send check prevents delivery", async () => {
  const { worker, state } = harness({ eligibility: (current) => current.eligibilityCalls === 1 })
  await worker.runCampaignWorker()
  assert.equal(state.calls.length, 0); assert.equal(state.recipient.status, "skipped"); assert.equal(state.recipient.attempts, 0)
})

test("a paused campaign cannot cross the persisted send boundary", async () => {
  const { worker, state } = harness({ eligibility: (current) => { if (current.eligibilityCalls === 2) current.campaign.status = "paused"; return true } })
  await worker.runCampaignWorker()
  assert.equal(state.calls.length, 0); assert.equal(state.recipient.attempts, 0)
})

test("account deletion immediately before the persisted boundary prevents delivery", async () => {
  const { worker, state } = harness({ eligibility: (current) => { if (current.eligibilityCalls === 2) current.missing = true; return true } })
  await worker.runCampaignWorker()
  assert.equal(state.calls.length, 0); assert.equal(state.recipient.attempts, 0)
})

test("a concurrent worker cannot send while the shared lease is held", async () => {
  const { worker, state } = harness({ leaseBusy: true })
  await worker.runCampaignWorker()
  assert.equal(state.calls.length, 0); assert.equal(state.queries.length, 0); assert.equal(state.released, 0)
})

test("a broken template pauses its campaign without repeatedly sending or wedging the worker", async () => {
  const { worker, state } = harness({ renderFails: true })
  await worker.runCampaignWorker()
  assert.equal(state.calls.length, 0); assert.equal(state.campaign.status, "paused"); assert.equal(state.released, 1)
})

test("Resend quota exhaustion pauses the campaign while preserving its recipient", async () => {
  const { worker, state } = harness({ providerStatus: 429, providerBody: { name: "daily_quota_exceeded" } })
  await worker.runCampaignWorker()
  assert.equal(state.campaign.status, "paused"); assert.equal(state.recipient.status, "pending"); assert.equal(state.calls.length, 1)
})

test("the independent flag and production environment are both required", () => {
  const guarded = load("utils/email/campaigns/readiness.ts", { "@/utils/prisma": { prisma: {} }, "@/utils/apiHandler": { ValidationError } },
    { process: { env: { ...env, VERCEL_ENV: "preview", EMAIL_CAMPAIGN_SEND_ENABLED: "false" } } })
  const issues = guarded.campaignConfigurationIssues()
  assert.ok(issues.some((value) => value.includes("switched off")))
  assert.ok(issues.some((value) => value.includes("production")))
})

test("unsubscribe tokens reject tampering, extra segments and cross-purpose tokens", () => {
  const id = "c79c3280-3c72-45ac-9bd7-93c7caa2e3f9"
  const token = tokens.createCampaignUnsubscribeToken(id)
  assert.equal(tokens.verifyCampaignUnsubscribeToken(token), id)
  assert.equal(tokens.verifyCampaignUnsubscribeToken(`${token}.extra`), null)
  assert.equal(tokens.verifyCampaignUnsubscribeToken(token.replace(/.$/, token.endsWith("a") ? "b" : "a")), null)
  assert.equal(tokens.verifyCampaignUnsubscribeToken("preview"), null)
})

test("non-owners and cross-origin owner requests are rejected before mutations", async () => {
  let userid = "123"
  const auth = load("utils/email/campaigns/auth.ts", {
    "@/utils/dashboardAuth": { getDiscordId: async () => userid },
    "next-auth/jwt": { getToken: async () => ({ email: "owner@example.test" }) }, "@/utils/apiHandler": { ValidationError },
  })
  const req = { method: "POST", headers: { host: "lionbot.org", origin: "https://lionbot.org" } }
  await assert.rejects(auth.requireCampaignOwner(req), (error) => error.status === 403)
  userid = "757652191656804413"
  await assert.rejects(auth.requireCampaignOwner({ ...req, headers: { host: "lionbot.org", origin: "https://attacker.example" } }), (error) => error.status === 403)
  assert.throws(() => auth.requireCampaignCron({ headers: { authorization: "Bearer incorrect" } }), (error) => error.status === 401)
  assert.throws(() => auth.requireCampaignCron({ headers: { authorization: "Bearer éééé" } }), (error) => error.status === 401)
  assert.equal((await auth.requireCampaignOwner(req)).email, "owner@example.test")
})

test("unchanged subject cannot authorize changed content, and a changed audience count requires review", async () => {
  let writes = 0
  const content = load("utils/email/campaigns/content.ts")
  const row = { id: "7f2f2495-b6ce-477e-8439-7c435b9b2677", name: "Fundraiser", status: "draft", content: content.DEFAULT_FUNDRAISER_CONTENT }
  const db = { $queryRaw: async () => [row], $executeRaw: async () => { writes++; return 1 },
    $transaction: async (callback) => callback(db) }
  const store = load("utils/email/campaigns/store.ts", {
    "@prisma/client": { Prisma: {} }, "@/utils/prisma": { prisma: db }, "@/utils/apiHandler": { ValidationError },
    "./content": content, "./consent": { getCampaignAudience: async () => ({ recipients: [{ email: "owner@example.test", userid: "42" }] }) },
  })
  const revision = store.campaignRevision(row)
  row.content = { ...row.content, body: ["An unreviewed replacement paragraph."] }
  await assert.rejects(store.queueCampaign(row.id, row.content.subject, revision, 1), (error) => error.status === 409 && error.message.includes("draft changed"))
  await assert.rejects(store.editCampaign(row.id, row.name, row.content, revision), (error) => error.status === 409)
  await assert.rejects(store.queueCampaign(row.id, row.content.subject, store.campaignRevision(row), 2), (error) => error.status === 409 && error.message.includes("audience count"))
  assert.equal(writes, 0)
})

test("unsubscribe GET is read-only and a forged token never reaches the database", async () => {
  let reads = 0, writes = 0
  const db = { $queryRaw: async () => { reads++; return [{ email: "owner@example.test", unsubscribed: false }] },
    $transaction: async () => { writes++; throw new Error("GET must not mutate") } }
  const handler = load("pages/api/email/campaign-unsubscribe.ts", {
    "@/utils/apiHandler": { apiHandler, ValidationError }, "@/utils/prisma": { prisma: db },
    "@/utils/email/campaigns/tokens": tokens, "@/utils/email/campaigns/readiness": { requireCampaignDatabase: async () => {} },
    "@/utils/email/campaigns/consent": { revokeCampaignConsentForEmail: async () => { writes++ } },
  }).default
  const result = response()
  await handler({ method: "GET", query: { token: tokens.createCampaignUnsubscribeToken("c79c3280-3c72-45ac-9bd7-93c7caa2e3f9") } }, result)
  assert.equal(result.code, 200); assert.equal(result.body.valid, true); assert.equal(reads, 1); assert.equal(writes, 0)
  const invalid = response()
  await handler({ method: "POST", query: { token: "forged" } }, invalid)
  assert.equal(invalid.code, 400); assert.equal(reads, 1); assert.equal(writes, 0)
})

test("webhook signature rejection prevents all database writes; only permanent bounces suppress", async () => {
  let writes = 0
  const webhook = load("pages/api/email/webhook.ts", {
    "@/utils/prisma": { prisma: { $transaction: async () => { writes++ } } },
    "@/utils/email/resend": { getResend: () => ({ webhooks: { verify: () => { throw new Error("Invalid signature") } } }) },
    "@/utils/email/campaigns/consent": { revokeCampaignConsentForEmail: async () => { writes++ } },
  })
  const req = { method: "POST", headers: { "svix-id": "event", "svix-timestamp": "123", "svix-signature": "bad" },
    async *[Symbol.asyncIterator]() { yield Buffer.from("{}"); } }
  const result = response(); await webhook.default(req, result)
  assert.equal(result.code, 400); assert.equal(writes, 0)
  assert.equal(webhook.campaignSuppressionReason({ type: "email.bounced", data: { bounce: { type: "Transient" } } }), null)
  assert.equal(webhook.campaignSuppressionReason({ type: "email.bounced", data: { bounce: { type: "Permanent" } } }), "hard_bounce")
  assert.equal(webhook.campaignSuppressionReason({ type: "email.complained" }), "complaint")
})

function signedWebhookHarness() {
  // Verification uses the installed Resend SDK and Svix cryptography, rather
  // than a signature stub. No SDK delivery API or network transport is used.
  const { Resend } = require("resend")
  const { Webhook } = require("svix")
  const webhookSecret = `whsec_${crypto.randomBytes(32).toString("base64")}`
  const signer = new Webhook(webhookSecret)
  const sdk = new Resend("re_test_fixture_never_sent")
  const state = {
    events: new Set(), suppressions: new Map(), revoked: new Set(), mutations: 0,
    recipients: [
      { id: "c79c3280-3c72-45ac-9bd7-93c7caa2e3f9", email: "owner@example.test", status: "unknown", attempts: 1, providerId: null, deliveryUpdatedAt: null },
      { id: "da81f8a3-dfd6-450c-86a2-7b9511c6a3d5", email: "owner@example.test", status: "pending", attempts: 0, providerId: null, deliveryUpdatedAt: null },
    ],
  }
  const db = {
    async $queryRaw(strings, ...values) {
      const recipient = state.recipients.find((row) => row.id === values[0])
      return recipient ? [{ email: recipient.email, unsubscribed: state.suppressions.has(recipient.email) }] : []
    },
    async $executeRaw(strings, ...values) {
      const sql = strings.join("?").replace(/\s+/g, " ")
      if (sql.includes("INSERT INTO email_campaign_webhook_events")) {
        if (state.events.has(values[0])) return 0
        state.events.add(values[0]); return 1
      }
      if (sql.includes("INSERT INTO email_campaign_suppressions")) {
        const reason = values[1] || "unsubscribed"
        if (!state.suppressions.has(values[0]) || sql.includes("DO UPDATE")) state.suppressions.set(values[0], reason)
        return 1
      }
      if (sql.includes("UPDATE user_config SET email_pref_announcements")) return 1
      if (sql.includes("SET status = 'skipped'")) {
        for (const row of state.recipients) if (row.email === values[0] && row.status === "pending") row.status = "skipped"
        return 1
      }
      if (sql.includes("SET provider_id =")) {
        if (state.failNextReceipt) { state.failNextReceipt = false; throw new Error("Simulated transient storage error") }
        const [providerId, , deliveryStatus, occurredAt, , recipientId] = values
        for (const row of state.recipients) {
          if ((row.providerId === providerId || (row.id === recipientId && row.providerId === null && row.attempts > 0)) &&
            (!row.deliveryUpdatedAt || row.deliveryUpdatedAt <= occurredAt)) {
            row.providerId = providerId; row.status = "sent"; row.deliveryStatus = deliveryStatus; row.deliveryUpdatedAt = occurredAt
            state.mutations++
          }
        }
        return 1
      }
      throw new Error(`Unexpected webhook SQL in isolated test: ${sql}`)
    },
    async $transaction(callback) {
      const before = { events: new Set(state.events), suppressions: new Map(state.suppressions), revoked: new Set(state.revoked),
        recipients: state.recipients.map((row) => ({ ...row })), mutations: state.mutations }
      try { return await callback(db) }
      catch (error) { Object.assign(state, before); throw error }
    },
  }
  const revoke = async (email) => { state.revoked.add(email) }
  const webhook = load("pages/api/email/webhook.ts", {
    "@/utils/prisma": { prisma: db }, "@/utils/email/resend": { getResend: () => sdk },
    "@/utils/email/campaigns/consent": { revokeCampaignConsentForEmail: revoke },
  }, { process: { env: { ...env, RESEND_WEBHOOK_SECRET: webhookSecret } }, console: { error() {} } })
  async function deliver(id, type, createdAt, extra = {}, tamper = false) {
    const payload = JSON.stringify({ type, created_at: createdAt.toISOString(), data: {
      email_id: "fixture-provider-id", to: [" OWNER@example.test ", "owner@example.test"], from: "hello@lionbot.org",
      subject: "Test fixture", tags: { recipient_id: state.recipients[0].id }, ...extra,
    } })
    const timestamp = new Date()
    const signature = signer.sign(id, timestamp, payload)
    const req = { method: "POST", headers: { "svix-id": id, "svix-timestamp": `${Math.floor(timestamp.getTime() / 1000)}`, "svix-signature": signature },
      async *[Symbol.asyncIterator]() { yield Buffer.from(tamper ? `${payload} ` : payload) } }
    const result = response(); await webhook.default(req, result); return result
  }
  return { state, db, revoke, deliver }
}

test("real signed receipts reconcile an unknown delivery, deduplicate events, and preserve newer delivery state", async () => {
  const { state, deliver } = signedWebhookHarness()
  const now = new Date()
  const older = new Date(now.getTime() - 60000)
  assert.equal((await deliver("signed-delivered", "email.delivered", now)).code, 200)
  assert.equal(state.recipients[0].status, "sent")
  assert.equal(state.recipients[0].providerId, "fixture-provider-id")
  assert.equal(state.recipients[0].deliveryStatus, "delivered")
  assert.equal(state.mutations, 1)
  assert.equal((await deliver("signed-delivered", "email.delivered", now)).code, 200)
  assert.equal(state.mutations, 1, "a replayed provider event must not apply twice")
  assert.equal((await deliver("signed-older-sent", "email.sent", older)).code, 200)
  assert.equal(state.recipients[0].deliveryStatus, "delivered", "late old events cannot overwrite newer receipts")
  assert.equal((await deliver("signed-tampered", "email.complained", now, {}, true)).code, 400)
  assert.equal(state.suppressions.size, 0)
  assert.equal(state.events.has("signed-tampered"), false)
})

test("signed permanent bounce and complaint suppress queued mail; unsubscribe cannot erase a complaint", async () => {
  const { state, db, revoke, deliver } = signedWebhookHarness()
  const now = new Date()
  assert.equal((await deliver("signed-bounce", "email.bounced", now, { bounce: { type: "Permanent", subType: "General", message: "Fixture bounce" } })).code, 200)
  assert.equal(state.suppressions.get("owner@example.test"), "hard_bounce")
  assert.equal(state.recipients[1].status, "skipped")
  assert.equal(state.revoked.has("owner@example.test"), true)
  const eligibility = load("utils/email/campaigns/eligibility.ts")
  const audience = eligibility.buildCampaignAudience([{ email: "owner@example.test", userid: "42", verified: true,
    consented: !state.revoked.has("owner@example.test"), suppressed: state.suppressions.has("owner@example.test"), unsubscribed: false, announcements: true }])
  assert.equal(audience.counts.eligible, 0)
  assert.equal((await deliver("signed-complaint", "email.complained", new Date(now.getTime() + 1000))).code, 200)
  assert.equal(state.suppressions.get("owner@example.test"), "complaint")
  const unsubscribe = load("pages/api/email/campaign-unsubscribe.ts", {
    "@/utils/apiHandler": { apiHandler, ValidationError }, "@/utils/prisma": { prisma: db },
    "@/utils/email/campaigns/tokens": tokens, "@/utils/email/campaigns/readiness": { requireCampaignDatabase: async () => {} },
    "@/utils/email/campaigns/consent": { revokeCampaignConsentForEmail: revoke },
  }).default
  const result = response()
  await unsubscribe({ method: "POST", query: { token: tokens.createCampaignUnsubscribeToken(state.recipients[0].id) } }, result)
  assert.equal(result.code, 200)
  assert.equal(state.suppressions.get("owner@example.test"), "complaint", "unsubscribe must not weaken a delivery suppression")
})

test("a transient receipt-storage failure rolls back the dedupe marker so the signed retry succeeds", async () => {
  const { state, deliver } = signedWebhookHarness()
  const now = new Date()
  state.failNextReceipt = true
  assert.equal((await deliver("signed-retry", "email.delivered", now)).code, 503)
  assert.equal(state.events.has("signed-retry"), false)
  assert.equal(state.recipients[0].status, "unknown")
  assert.equal((await deliver("signed-retry", "email.delivered", now)).code, 200)
  assert.equal(state.events.has("signed-retry"), true)
  assert.equal(state.recipients[0].deliveryStatus, "delivered")
})
