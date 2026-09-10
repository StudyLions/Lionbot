// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Exercise real consent SQL and preference handlers in a rolled-back
//          transaction against studylion_test only. Never sends email.
// Run: node tests/email-campaign-consent.integration.cjs
// ============================================================
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const Module = require("node:module")
const ts = require("typescript")
const root = path.resolve(__dirname, "..")
const localValue = fs.readFileSync(path.join(root, ".env"), "utf8").match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/m)?.[1]
const configured = process.env.EMAIL_CAMPAIGN_TEST_DATABASE_URL || localValue?.replace(/^(['"])(.*)\1$/, "$2")
if (!configured || new URL(configured).pathname !== "/studylion_test") {
  throw new Error("Consent integration requires the studylion_test database")
}
process.env.DATABASE_URL = configured
const { PrismaClient, Prisma } = require("@prisma/client")
const client = new PrismaClient({ datasources: { db: { url: configured } } })
let tx
let actor
const proxy = new Proxy({}, {
  get(_target, property) {
    if (!tx) throw new Error("Test queries must stay inside the rollback transaction")
    if (property === "$transaction") return async (callback) => callback(tx)
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
  if (request === "@/utils/dashboardAuth") return {
    getDiscordId: async () => actor.toString(), unauthorized: (res) => res.status(401).json({ error: "Unauthorized" }),
  }
  if (request === "@/utils/email/send") return { isEmailSendingEnabled: () => false }
  return originalLoad.call(this, request, parent, isMain)
}
require.extensions[".ts"] = (loaded, filename) => loaded._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename)
const consent = require(path.join(root, "utils/email/campaigns/consent.ts"))
const preferences = require(path.join(root, "pages/api/email/preferences.ts")).default
const legacyUnsubscribe = require(path.join(root, "pages/api/email/unsubscribe.ts")).default
const { createUnsubscribeToken } = require(path.join(root, "utils/email/tokens.ts"))
process.env.EMAIL_TOKEN_SECRET = "integration-only-secret-do-not-use-for-delivery-20260910"

function response() {
  return {
    statusCode: 200, body: null, headersSent: false,
    status(code) { this.statusCode = code; return this },
    setHeader() {},
    json(body) { this.body = body; this.headersSent = true; return this },
    send(body) { this.body = body; this.headersSent = true; return this },
  }
}
async function patch(body, expectedStatus = 200) {
  const res = response()
  await preferences({ method: "PATCH", body, headers: { host: "test.lionbot.org", origin: "https://test.lionbot.org" } }, res)
  assert.equal(res.statusCode, expectedStatus, "Preference handler response")
  return res.body
}
const rolledBack = new Error("ROLLBACK_CONSENT_FIXTURES")
const seed = BigInt(Date.now()) * BigInt(1000) + BigInt(Math.floor(Math.random() * 1000))
const ids = [-seed, -seed - BigInt(1)]
const email = `consent-${seed}@example.invalid`
const newEmail = `changed-${seed}@example.invalid`

async function main() {
  const current = await client.$queryRaw`SELECT current_database() AS name`
  assert.equal(current[0].name, "studylion_test")
  assert.equal(await client.user_config.count({ where: { userid: { in: ids } } }), 0)
  try {
    await client.$transaction(async (transaction) => {
      tx = transaction
      actor = ids[0]
      await tx.user_config.create({ data: { userid: ids[0], email, email_verified: true } })
      assert.equal(await consent.isCampaignRecipientEligible(email, actor.toString(), tx), false)
      await patch({ email_pref_announcements: true })
      assert.equal(await consent.isCampaignRecipientEligible(email, actor.toString(), tx), false, "Legacy default is not consent")
      assert.equal((await patch({ campaignOptIn: true })).campaignOptIn, true)
      assert.equal(await consent.isCampaignRecipientEligible(email, actor.toString(), tx), true)
      assert.equal(await consent.isCampaignRecipientEligible(email, ids[1].toString(), tx), false, "Frozen recipient identity is checked")

      await patch({ email_pref_announcements: false })
      await patch({ email_pref_announcements: true })
      assert.equal(await consent.isCampaignRecipientEligible(email, actor.toString(), tx), false, "Legacy category reenabling cannot restore consent")
      await patch({ campaignOptIn: true })
      await patch({ unsubscribedAll: true })
      await patch({ unsubscribedAll: false, email_pref_announcements: true })
      assert.equal(await consent.isCampaignRecipientEligible(email, actor.toString(), tx), false, "Legacy global reenabling cannot restore consent")
      await patch({ campaignOptIn: true })

      const token = createUnsubscribeToken(actor, "email_pref_announcements")
      const unsubscribed = response()
      await legacyUnsubscribe({ method: "POST", query: {}, body: { token } }, unsubscribed)
      assert.equal(unsubscribed.statusCode, 200)
      await patch({ email_pref_announcements: true })
      assert.equal(await consent.isCampaignRecipientEligible(email, actor.toString(), tx), false, "Old unsubscribe links revoke campaign consent")
      await patch({ campaignOptIn: true })

      await tx.user_config.update({ where: { userid: actor }, data: { email: newEmail } })
      assert.equal(await consent.isCampaignRecipientEligible(email, actor.toString(), tx), false)
      assert.equal(await consent.isCampaignRecipientEligible(newEmail, actor.toString(), tx), false, "Consent does not follow an address change")
      await patch({ campaignOptIn: true })
      assert.equal(await consent.isCampaignRecipientEligible(newEmail, actor.toString(), tx), true)
      await tx.user_config.update({ where: { userid: actor }, data: { email_verified: null } })
      assert.equal(await consent.isCampaignRecipientEligible(newEmail, actor.toString(), tx), false)
      await tx.user_config.update({ where: { userid: actor }, data: { email_verified: true } })

      await tx.user_config.create({ data: { userid: ids[1], email: ` ${newEmail.toUpperCase()} `, email_verified: true, email_pref_announcements: false } })
      assert.equal(await consent.isCampaignRecipientEligible(newEmail, actor.toString(), tx), false, "Any duplicate account opt-out is honored")
      await tx.user_config.update({ where: { userid: ids[1] }, data: { email_pref_announcements: true } })
      const audience = await consent.getCampaignAudience(tx)
      assert.equal(audience.recipients.filter((recipient) => recipient.email === newEmail).length, 1)

      for (const reason of ["unsubscribed", "hard_bounce", "complaint", "provider_suppressed"]) {
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO email_campaign_suppressions (email, reason) VALUES (${newEmail}, ${reason})
          ON CONFLICT (email) DO UPDATE SET reason = EXCLUDED.reason
        `)
        assert.equal(await consent.isCampaignRecipientEligible(newEmail, actor.toString(), tx), false)
        await patch({ campaignOptIn: true })
        assert.equal(await consent.isCampaignRecipientEligible(newEmail, actor.toString(), tx), reason === "unsubscribed", "Only an unsubscribe suppression can be explicitly reversed")
      }

      const blocked = response()
      await preferences({ method: "PATCH", body: { campaignOptIn: true }, headers: { host: "test.lionbot.org", origin: "https://attacker.invalid" } }, blocked)
      assert.equal(blocked.statusCode, 403, "Cross-origin consent writes are rejected")
      throw rolledBack
    }, { timeout: 30000 })
  } catch (error) {
    if (error !== rolledBack) throw error
  } finally {
    tx = null
  }
  assert.equal(await client.user_config.count({ where: { userid: { in: ids } } }), 0, "All synthetic fixtures rolled back")
  console.log("PASS: real consent SQL, preference/legacy unsubscribe handlers, address changes, duplicate opt-outs, identity binding, suppression handling, and CSRF; all fixtures rolled back; no emails sent.")
}
main().catch((error) => { console.error(error.message); process.exitCode = 1 }).finally(() => client.$disconnect())
