// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Regression checks for signed email URL analytics protection.
// Run: node --test tests/email-analytics-privacy.test.cjs
// ============================================================
const assert = require("node:assert/strict")
const test = require("node:test")
const fs = require("node:fs")
const path = require("node:path")
const Module = require("node:module")
const ts = require("typescript")
const filename = path.resolve(__dirname, "../utils/email/analyticsPrivacy.ts")
const loaded = new Module(filename, module)
loaded._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename)
const { isPrivateEmailRoute, advanceEmailAnalyticsGuard, EMAIL_ANALYTICS_DISABLE_KEY } = loaded.exports

test("signed unsubscribe routes, localized links, and the owner desk are private", () => {
  for (const value of [
    "/campaign-unsubscribe/opaque.signed-token", "/campaign-unsubscribe/[token]",
    "/unsubscribe/legacy.signed-token", "/he/unsubscribe/[token]",
    "/pt-BR/campaign-unsubscribe/token?source=mail", "/fr/dashboard/email-campaigns",
    "/dashboard/email-campaigns", "https://lionbot.org/es/campaign-unsubscribe/token",
    "/%63ampaign-unsubscribe/token", "/campaign-unsubscribe/%invalid",
  ]) assert.equal(isPrivateEmailRoute(value), true, value)
})

test("ordinary public and dashboard routes remain measurable", () => {
  for (const value of ["/", "/fr", "/dashboard", "/dashboard/settings#email", "/guides/email", "/donate?message=unsubscribe"]) {
    assert.equal(isPrivateEmailRoute(value), false, value)
  }
})

test("direct private visits omit analytics and immediately disable any tracker", () => {
  const guard = { blocked: false }
  const browser = {}
  assert.equal(advanceEmailAnalyticsGuard(guard, "/campaign-unsubscribe/token", browser), true)
  assert.equal(browser[EMAIL_ANALYTICS_DISABLE_KEY], true)
})

test("route-start disables before URL changes and persists after leaving or cancelling", () => {
  const guard = { blocked: false }
  const browser = { location: { pathname: "/" } }
  assert.equal(advanceEmailAnalyticsGuard(guard, "/", browser), false)
  assert.equal(browser[EMAIL_ANALYTICS_DISABLE_KEY], undefined)
  assert.equal(advanceEmailAnalyticsGuard(guard, "/pt-BR/campaign-unsubscribe/token", browser), true)
  assert.equal(browser.location.pathname, "/", "The tracker is disabled while the previous URL is still current")
  assert.equal(browser[EMAIL_ANALYTICS_DISABLE_KEY], true)
  for (const route of ["/", "/dashboard/settings", "/donate"]) {
    assert.equal(advanceEmailAnalyticsGuard(guard, route, browser), true)
    assert.equal(browser[EMAIL_ANALYTICS_DISABLE_KEY], true)
  }
})

test("server rendering can suppress analytics without a browser global", () => {
  const guard = { blocked: false }
  assert.equal(advanceEmailAnalyticsGuard(guard, "/unsubscribe/[token]"), true)
  const hydratedBrowser = {}
  assert.equal(advanceEmailAnalyticsGuard(guard, "/unsubscribe/value", hydratedBrowser), true)
  assert.equal(hydratedBrowser[EMAIL_ANALYTICS_DISABLE_KEY], true)
})
