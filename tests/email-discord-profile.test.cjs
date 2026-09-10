// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Verify email verification survives the installed Discord provider
//          mapping while preserving existing user identities and avatar URLs.
// Run: node --test tests/email-discord-profile.test.cjs
// ============================================================
const assert = require("node:assert/strict")
const test = require("node:test")
const fs = require("node:fs")
const path = require("node:path")
const Module = require("node:module")
const ts = require("typescript")
const DiscordProvider = require("next-auth/providers/discord").default
const filename = path.resolve(__dirname, "../utils/email/discordProfile.ts")
const loaded = new Module(filename, module)
loaded._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename)
const { preserveDiscordEmailVerification } = loaded.exports

test("stock Discord identity and static, animated, and default avatars are unchanged", () => {
  for (const avatar of [null, "static_avatar_hash", "a_animated_avatar_hash"]) {
    const raw = { id: "1234567890", username: "Leo", email: "leo@example.org", avatar, discriminator: "1234", verified: true }
    const stock = DiscordProvider({}).profile({ ...raw })
    const actual = preserveDiscordEmailVerification(raw, DiscordProvider({}).profile({ ...raw }))
    assert.deepEqual(actual, { ...stock, emailVerified: true })
    assert.equal(actual.id, raw.id)
    assert.equal(actual.name, raw.username)
    assert.equal(actual.email, raw.email)
  }
})

test("only an explicit raw Discord boolean establishes verification", () => {
  for (const [verified, expected] of [[true, true], [false, false], [undefined, null], [null, null], ["true", null], [1, null]]) {
    const actual = preserveDiscordEmailVerification({ verified }, { id: "1", emailVerified: true })
    assert.equal(actual.emailVerified, expected)
  }
})
