// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-16
// Purpose: Exercise the real harvestAll transaction (lib/pet/farmService.ts)
//          against studylion_test only: happy path, repeat call, and two
//          concurrent calls (advisory lock + conditional updates). Uses a
//          synthetic negative user id and deletes its own rows afterwards.
// Run: node tests/farm-harvest-all.integration.cjs
// ============================================================
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const Module = require("node:module")
const ts = require("typescript")
const root = path.resolve(__dirname, "..")
const localValue = fs.readFileSync(path.join(root, ".env"), "utf8").match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/m)?.[1]
const configured = process.env.FARM_TEST_DATABASE_URL || localValue?.replace(/^(['"])(.*)\1$/, "$2")
if (!configured || new URL(configured).pathname !== "/studylion_test") {
  throw new Error("Farm harvest integration requires the studylion_test database")
}
process.env.DATABASE_URL = configured
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient({ datasources: { db: { url: configured } } })

const originalResolve = Module._resolveFilename
const originalLoad = Module._load
Module._resolveFilename = function(request, parent, ...rest) {
  return originalResolve.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, parent, ...rest)
}
Module._load = function(request, parent, isMain) {
  if (request === "@/utils/prisma") return { prisma }
  return originalLoad.call(this, request, parent, isMain)
}
require.extensions[".ts"] = (loaded, filename) => loaded._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename)

const { harvestAll, computeProgress } = require(path.join(root, "lib/pet/farmService.ts"))
const { PetServiceError } = require(path.join(root, "lib/pet/careService.ts"))

const userId = -(BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000)))

async function plantRipe(seed, plotIds) {
  const now = new Date()
  for (const plotId of plotIds) {
    const data = {
      seed_id: seed.seed_id, planted_at: now, last_watered: now, dead: false,
      growth_stage: 5, growth_points: seed.growth_points_needed, gold_invested: seed.plant_cost, rarity: "COMMON",
    }
    // Harvesting clears a plot's fields but keeps the row, so re-planting must upsert.
    await prisma.lg_user_farm.upsert({
      where: { userid_plot_id: { userid: userId, plot_id: plotId } },
      create: { userid: userId, plot_id: plotId, ...data },
      update: data,
    })
  }
}
async function gold() {
  return Number((await prisma.user_config.findUnique({ where: { userid: userId }, select: { gold: true } })).gold)
}
async function plots() {
  return prisma.lg_user_farm.findMany({ where: { userid: userId }, orderBy: { plot_id: "asc" } })
}
async function ledger() {
  return prisma.lg_gold_transactions.findMany({ where: { to_account: userId, transaction_type: "FARM_HARVEST" } })
}

async function main() {
  const seed = await prisma.lg_farm_seeds.findFirst({ where: { growth_points_needed: { gt: 0 } }, orderBy: { seed_id: "asc" } })
  assert.ok(seed, "need at least one seed in studylion_test")

  // Unit: progress is relative to the stage-5 threshold and reaches 100% when ripe.
  const g = computeProgress(seed.growth_points_needed * 0.8, seed.growth_points_needed)
  assert.equal(g.readyToHarvest, true)
  assert.equal(g.progress, 100)
  assert.equal(computeProgress(seed.growth_points_needed * 0.4, seed.growth_points_needed).progress, 50)

  await prisma.user_config.create({ data: { userid: userId, gold: 0 } })
  await prisma.lg_pets.create({ data: { userid: userId } })
  try {
    // 1) happy path: 3 ripe plots -> all cleared, paid once, one ledger row
    await plantRipe(seed, [1, 2, 3])
    const first = await harvestAll(userId)
    assert.equal(first.count, 3)
    assert.equal(first.totalGold, seed.harvest_gold * 3)
    assert.ok((await plots()).every((p) => p.seed_id === null && p.growth_points === 0), "all plots cleared")
    assert.equal(await gold(), seed.harvest_gold * 3)
    assert.equal((await ledger()).length, 1)

    // 2) nothing left -> clean 400, nothing changes
    await assert.rejects(harvestAll(userId), (err) => err instanceof PetServiceError && err.status === 400 && err.code === "nothing_ready")
    assert.equal(await gold(), seed.harvest_gold * 3)

    // 3) two concurrent harvests of the same ripe plots -> exactly one pays
    await plantRipe(seed, [1, 2, 3])
    const results = await Promise.allSettled([harvestAll(userId), harvestAll(userId)])
    const ok = results.filter((r) => r.status === "fulfilled")
    const failed = results.filter((r) => r.status === "rejected")
    assert.equal(ok.length, 1, `expected exactly one success, got ${JSON.stringify(results.map((r) => r.status))}`)
    assert.equal(failed.length, 1)
    assert.ok(failed[0].reason instanceof PetServiceError && [400, 409].includes(failed[0].reason.status), `loser must fail cleanly, got ${failed[0].reason}`)
    assert.equal(ok[0].value.count, 3)
    assert.equal(await gold(), seed.harvest_gold * 6, "gold credited exactly once for the second round")
    assert.equal((await ledger()).length, 2)
    assert.ok((await plots()).every((p) => p.seed_id === null), "plots cleared exactly once")
    console.log(`OK: harvestAll integration passed (seed "${seed.name}", ${seed.harvest_gold}G each, loser status ${failed[0].reason.status}/${failed[0].reason.code})`)
  } finally {
    await prisma.lg_user_farm.deleteMany({ where: { userid: userId } })
    await prisma.lg_gold_transactions.deleteMany({ where: { OR: [{ actorid: userId }, { to_account: userId }] } })
    await prisma.lg_user_inventory.deleteMany({ where: { userid: userId } })
    await prisma.lg_pets.deleteMany({ where: { userid: userId } })
    await prisma.user_config.deleteMany({ where: { userid: userId } })
    await prisma.$disconnect()
  }
}

main().catch((err) => { console.error("FAILED:", err); process.exitCode = 1 })
