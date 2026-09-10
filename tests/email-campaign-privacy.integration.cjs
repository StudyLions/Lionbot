// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Verify campaign privacy export and erasure against real
//          SQL in studylion_test; all fixtures roll back, no emails.
// Run: node tests/email-campaign-privacy.integration.cjs
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
  throw new Error("Privacy integration requires the studylion_test database")
}
process.env.DATABASE_URL = configured
const { PrismaClient } = require("@prisma/client")
const client = new PrismaClient({ datasources: { db: { url: configured } } })
let tx
const proxy = new Proxy({}, {
  get(_target, property) {
    if (!tx) throw new Error("Test helper queries must stay inside the rollback transaction")
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
  return originalLoad.call(this, request, parent, isMain)
}
require.extensions[".ts"] = (loaded, filename) => loaded._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename)
const privacy = require(path.join(root, "utils/email/campaigns/privacy.ts"))
const rollback = new Error("ROLLBACK_PRIVACY_FIXTURES")
const seed = BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000))
const ids = [-seed, -seed - 1n]
const currentEmail = `privacy-current-${seed}@example.invalid`
const historicEmail = `privacy-historic-${seed}@example.invalid`
const otherEmail = `privacy-other-${seed}@example.invalid`
const campaignIds = [crypto.randomUUID(), crypto.randomUUID()]
const recipientIds = Array.from({ length: 4 }, () => crypto.randomUUID())
const fixtureEmails = [currentEmail, historicEmail, otherEmail]

async function main() {
  const current = await client.$queryRaw`SELECT current_database() AS name`
  assert.equal(current[0].name, "studylion_test")
  assert.equal(await client.user_config.count({ where: { userid: { in: ids } } }), 0)
  try {
    await client.$transaction(async transaction => {
      tx = transaction
      await tx.user_config.createMany({ data: [
        { userid: ids[0], email: currentEmail, email_verified: true },
        { userid: ids[1], email: otherEmail, email_verified: true },
      ] })
      for (let i = 0; i < campaignIds.length; i++) {
        const content = JSON.stringify({ subject: i === 0 ? "Own community letter" : "PRIVATE_OTHER_ACCOUNT_LETTER" })
        await tx.$executeRaw`INSERT INTO email_campaigns (id, name, content, created_by)
          VALUES (${campaignIds[i]}, 'Privacy integration fixture', ${content}::jsonb, ${ids[i].toString()})`
      }
      const recipients = [
        { id: recipientIds[0], campaign: campaignIds[0], userid: ids[0], email: currentEmail },
        { id: recipientIds[1], campaign: campaignIds[0], userid: ids[0], email: historicEmail },
        // Sharing a historical address must not expose the other account's message.
        { id: recipientIds[2], campaign: campaignIds[1], userid: ids[1], email: historicEmail },
        { id: recipientIds[3], campaign: campaignIds[1], userid: ids[1], email: otherEmail },
      ]
      for (const recipient of recipients) {
        const payload = JSON.stringify({ to: recipient.email, html: "PRIVATE_RENDERED_PAYLOAD", text: "PRIVATE_DELIVERY_TOKEN" })
        await tx.$executeRaw`INSERT INTO email_campaign_recipients
          (id, campaign_id, email, userid, payload, idempotency_key, status, delivery_status)
          VALUES (${recipient.id}, ${recipient.campaign}, ${recipient.email}, ${recipient.userid}, ${payload}::jsonb,
            ${`privacy-fixture/${recipient.id}`}, 'sent', 'delivered')`
      }
      await tx.$executeRaw`INSERT INTO email_campaign_subscriptions (email, userid, revoked_at) VALUES
        (${currentEmail}, ${ids[0]}, NULL), (${historicEmail}, ${ids[0]}, now()), (${otherEmail}, ${ids[1]}, NULL)`
      await tx.$executeRaw`UPDATE email_campaign_subscriptions SET source = 'founder_attested_external',
        consented_at = NULL, imported_at = NOW(), evidence_note = 'Synthetic founder attestation; historical signup date unknown'
        WHERE email = ${historicEmail} AND userid = ${ids[0]}`
      await tx.$executeRaw`INSERT INTO email_campaign_suppressions (email, reason) VALUES
        (${currentEmail}, 'unsubscribed'), (${historicEmail}, 'hard_bounce'), (${otherEmail}, 'complaint')`

      const exported = await privacy.getUserCampaignPrivacyData(ids[0], tx)
      assert.deepEqual(exported.subscriptions.map(row => row.email).sort(), [currentEmail, historicEmail].sort())
      const externalConsent = exported.subscriptions.find(row => row.email === historicEmail)
      assert.equal(externalConsent.source, "founder_attested_external")
      assert.equal(externalConsent.consented_at, null, "Export does not invent a historical signup timestamp")
      assert.ok(externalConsent.imported_at instanceof Date)
      assert.equal(externalConsent.evidence_note, "Synthetic founder attestation; historical signup date unknown")
      assert.ok(externalConsent.revoked_at instanceof Date, "Export preserves an external consent's revocation")
      assert.deepEqual(exported.deliveries.map(row => row.email).sort(), [currentEmail, historicEmail].sort())
      assert.equal(exported.deliveries.length, 2, "Other account's shared-address recipient is excluded")
      assert.ok(exported.deliveries.every(row => row.subject === "Own community letter"))
      assert.deepEqual(exported.suppressions.map(row => row.email).sort(), [currentEmail, historicEmail].sort())
      const serialized = JSON.stringify(exported)
      for (const excluded of ["PRIVATE_RENDERED_PAYLOAD", "PRIVATE_DELIVERY_TOKEN", "PRIVATE_OTHER_ACCOUNT_LETTER", otherEmail, "idempotency_key"]) {
        assert.ok(!serialized.includes(excluded), "Export excludes another account's data and internal credentials")
      }
      assert.deepEqual(await privacy.getUserCampaignPrivacyCounts(ids[0], tx), {
        recipients: 2, subscriptions: 2, suppressions: 2, campaigns: 1,
      })

      const deleted = await privacy.deleteUserCampaignData(ids[0], tx)
      assert.deepEqual(deleted, { recipients: 2, subscriptions: 2, campaigns: 1, suppressionsRetained: 2 })
      const remainingRecipients = await tx.$queryRaw`SELECT id, userid, payload FROM email_campaign_recipients
        WHERE id IN (${recipientIds[0]}, ${recipientIds[1]}, ${recipientIds[2]}, ${recipientIds[3]})`
      assert.equal(remainingRecipients.length, 2)
      assert.ok(remainingRecipients.every(row => row.userid === ids[1] && row.payload.html === "PRIVATE_RENDERED_PAYLOAD"), "Erasure leaves other account's records untouched")
      const remainingSubscriptions = await tx.$queryRaw`SELECT email, userid FROM email_campaign_subscriptions
        WHERE email IN (${currentEmail}, ${historicEmail}, ${otherEmail})`
      assert.deepEqual(remainingSubscriptions, [{ email: otherEmail, userid: ids[1] }])
      const authors = await tx.$queryRaw`SELECT id, created_by FROM email_campaigns WHERE id IN (${campaignIds[0]}, ${campaignIds[1]})`
      assert.equal(authors.find(row => row.id === campaignIds[0]).created_by, "0")
      assert.equal(authors.find(row => row.id === campaignIds[1]).created_by, ids[1].toString())
      const blocks = await tx.$queryRaw`SELECT email, reason FROM email_campaign_suppressions
        WHERE email IN (${currentEmail}, ${historicEmail}, ${otherEmail})`
      assert.equal(blocks.length, 3, "All address-level suppression records survive account erasure")
      assert.equal(blocks.find(row => row.email === currentEmail).reason, "unsubscribed")
      // The final existing account-delete step must remain possible after cleanup.
      await tx.user_config.delete({ where: { userid: ids[0] } })
      assert.equal(await tx.user_config.count({ where: { userid: ids[1] } }), 1)
      throw rollback
    }, { timeout: 30000 })
  } catch (error) {
    if (error !== rollback) throw error
  } finally { tx = null }
  assert.equal(await client.user_config.count({ where: { userid: { in: ids } } }), 0)
  const leftovers = await client.$queryRaw`SELECT
    (SELECT count(*) FROM email_campaigns WHERE id IN (${campaignIds[0]}, ${campaignIds[1]})) +
    (SELECT count(*) FROM email_campaign_recipients WHERE id IN (${recipientIds[0]}, ${recipientIds[1]}, ${recipientIds[2]}, ${recipientIds[3]})) +
    (SELECT count(*) FROM email_campaign_subscriptions WHERE email IN (${fixtureEmails[0]}, ${fixtureEmails[1]}, ${fixtureEmails[2]})) +
    (SELECT count(*) FROM email_campaign_suppressions WHERE email IN (${fixtureEmails[0]}, ${fixtureEmails[1]}, ${fixtureEmails[2]})) AS count`
  assert.equal(Number(leftovers[0].count), 0, "All fixture campaigns, payloads, subscriptions and suppressions rolled back")
  console.log("PASS: real privacy SQL, own/current/historical exports, shared-address isolation, payload/consent erasure, creator anonymization, suppression retention and counts; every fixture rolled back; no emails sent.")
}
main().catch(error => { console.error(error.message); process.exitCode = 1 }).finally(() => client.$disconnect())
