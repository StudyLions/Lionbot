// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-20
// Purpose: Server-composed LionGotchi FARM render for the Anki
//          addon: gameboy frame + farm background + per-plot soil
//          (watered/dry) + plant sprites at their growth stage,
//          inside the same Gameboy bezel as the pet render.
//
//          Ports the essentials of the bot's farm_renderer.py
//          (compose_farm_scene): background -> soil overlays ->
//          plant sprites placed at PLOT_CENTERS, scaled to
//          STAGE_HEIGHTS, tree/pollen sprite lookup by
//          asset_prefix ("tree:5" -> plant_type=tree, type_id=5)
//          and rarity color index. v1 is STATIC (no sway / water /
//          sparkle / skull / timer effects) — the goal is to make
//          the farm + the user's actual crops VISIBLE in the addon.
//
//          Geometry + gameboy framing match pet-portrait.ts. Every
//          asset fetch is best-effort: a missing sprite is skipped,
//          never fatal, so we always return at least the frame + bg.
//
//          Auth: requires a valid Anki bearer (anki.pet.read) in
//          the Authorization header (no ?t= query token — avoids
//          leaking the bearer via logs/referrers).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"
import sharp from "sharp"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"

const BLOB_BASE =
  process.env.NEXT_PUBLIC_BLOB_URL ||
  "https://dj03j4ltfyd6tjzw.public.blob.vercel-storage.com"

// ---- geometry (matches pet-portrait.ts) ----
const GB_W = 260
const GB_H = 400
const SCREEN_T = 36
const SCREEN_L = 30
const SCREEN_S = 200
const CROP_Y = 244
const DEFAULT_GAMEBOY = "gameboy/frames/gameboy-basic-01.png"

// ---- farm constants (from farm_renderer.py) ----
const PLOT_CENTERS: Record<number, [number, number]> = {
  1: [40, 138], 2: [32, 154], 3: [22, 174],
  4: [71, 138], 5: [66, 154], 6: [60, 174],
  7: [100, 138], 8: [100, 154], 9: [100, 174],
  10: [128, 138], 11: [132, 154], 12: [139, 174],
  13: [158, 138], 14: [166, 154], 15: [176, 174],
}
const STAGE_HEIGHTS: Record<number, number> = { 0: 0, 1: 18, 2: 24, 3: 30, 4: 36, 5: 44 }
const RARITY_COLOR_INDEX: Record<string, number> = {
  COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5,
}

function assetUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function treeAsset(typeId: number, stage: number, rarity: string): string {
  const color = RARITY_COLOR_INDEX[rarity] ?? 1
  const idx = (typeId - 1) * 25 + (color - 1) * 5 + Math.min(stage, 5)
  return `farm/trees/trees_${pad2(idx)}.png`
}

function pollenAsset(typeId: number, stage: number): string {
  const idx = (typeId - 1) * 5 + Math.min(stage, 5)
  return `farm/pollen/pollen_plant_${pad2(idx)}.png`
}

function plantAssetPath(plantType: string, typeId: number, stage: number, rarity: string): string {
  if (plantType === "tree" && typeId >= 1 && typeId <= 20) {
    return treeAsset(typeId, stage, rarity)
  }
  if (plantType === "pollen") return pollenAsset(typeId, stage)
  return treeAsset(typeId, stage, rarity)
}

async function fetchPng(url: string): Promise<Buffer | null> {
  // --- AI-MODIFIED (2026-06-02) ---
  // 6s timeout so a slow asset host can't hang the function (abort -> null -> layer skipped).
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 6000)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
  // --- END AI-MODIFIED ---
}

async function toRgba(buf: Buffer, w: number, h: number): Promise<Buffer> {
  return sharp(buf).resize(w, h, { fit: "fill", kernel: "nearest" }).ensureAlpha().png().toBuffer()
}

async function clipOverlay(
  buf: Buffer, imgW: number, imgH: number,
  left: number, top: number, boundW: number, boundH: number
): Promise<sharp.OverlayOptions | null> {
  const srcL = Math.max(0, -left)
  const srcT = Math.max(0, -top)
  const srcR = Math.min(imgW, boundW - left)
  const srcB = Math.min(imgH, boundH - top)
  if (srcR <= srcL || srcB <= srcT) return null
  let input = buf
  if (srcL > 0 || srcT > 0 || srcR < imgW || srcB < imgH) {
    input = await sharp(buf).ensureAlpha()
      .extract({ left: srcL, top: srcT, width: srcR - srcL, height: srcB - srcT })
      .png().toBuffer()
  }
  return { input, left: Math.max(0, left), top: Math.max(0, top) }
}

interface FarmPlot {
  plotNum: number // 1..15
  seedId: number | null
  stage: number
  dead: boolean
  rarity: string
  plantType: string
  typeId: number
  isWatered: boolean
  gameboyPath: string
}

interface FarmData {
  plots: FarmPlot[]
  isNight: boolean
  gameboyPath: string
}

async function loadFarmData(userId: bigint): Promise<FarmData> {
  const [pet, rows] = await Promise.all([
    prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: { active_gameboy_skin_id: true },
    }),
    prisma.lg_user_farm.findMany({
      where: { userid: userId },
      orderBy: { plot_id: "asc" },
      select: {
        plot_id: true,
        seed_id: true,
        growth_stage: true,
        dead: true,
        rarity: true,
        last_watered: true,
        lg_farm_seeds: {
          select: { plant_type: true, asset_prefix: true, water_interval_hours: true },
        },
      },
    }),
  ])

  const skinRow = pet?.active_gameboy_skin_id
    ? await prisma.lg_gameboy_skins.findUnique({
        where: { skin_id: pet.active_gameboy_skin_id },
        select: { asset_path: true },
      })
    : null
  const gameboyPath = skinRow?.asset_path || DEFAULT_GAMEBOY

  const now = Date.now()
  const plots: FarmPlot[] = rows.map((r) => {
    const prefix = r.lg_farm_seeds?.asset_prefix || ""
    let plantType = r.lg_farm_seeds?.plant_type || "tree"
    let typeId = 1
    if (prefix) {
      const parts = prefix.split(":")
      plantType = parts[0] || plantType
      typeId = parts.length > 1 ? parseInt(parts[1], 10) || 1 : 1
    }
    let isWatered = false
    if (r.last_watered) {
      const interval = (r.lg_farm_seeds?.water_interval_hours ?? 4) * 3600 * 1000
      isWatered = now - new Date(r.last_watered).getTime() < interval
    }
    return {
      plotNum: r.plot_id + 1, // bot uses plot_id+1 as 1..15
      seedId: r.seed_id,
      stage: r.growth_stage || 0,
      dead: r.dead,
      rarity: r.rarity || "COMMON",
      plantType,
      typeId,
      isWatered,
      gameboyPath,
    }
  })

  const h = new Date().getUTCHours()
  return { plots, isNight: h < 6 || h >= 20, gameboyPath }
}

async function composeFarm(data: FarmData, scale: number): Promise<Buffer> {
  // 1. Farm scene (200x200): background -> soil -> plants.
  const layers: sharp.OverlayOptions[] = []

  // Soil overlays (full-canvas PNGs positioned per plot).
  for (const plot of data.plots) {
    if (plot.plotNum < 1 || plot.plotNum > 15) continue
    const hasSeed = !!plot.seedId
    const soilPath = hasSeed && plot.isWatered
      ? `farm/soil/watered/wateredsoil${plot.plotNum}.png`
      : `farm/soil/dry/drysoil${plot.plotNum}.png`
    const raw = await fetchPng(assetUrl(soilPath))
    if (raw) layers.push({ input: await toRgba(raw, SCREEN_S, SCREEN_S), left: 0, top: 0 })
  }

  // Plant sprites.
  for (const plot of data.plots) {
    if (plot.plotNum < 1 || plot.plotNum > 15) continue
    if (!plot.seedId || plot.dead || plot.stage < 1) continue
    const targetH = STAGE_HEIGHTS[plot.stage] || 0
    if (targetH <= 0) continue
    const raw = await fetchPng(assetUrl(plantAssetPath(plot.plantType, plot.typeId, plot.stage, plot.rarity)))
    if (!raw) continue
    let meta
    try {
      meta = await sharp(raw).metadata()
    } catch {
      continue
    }
    const natH = meta.height || targetH
    const natW = meta.width || targetH
    const newW = Math.max(1, Math.round(natW * (targetH / natH)))
    const scaled = await sharp(raw).ensureAlpha()
      .resize(newW, targetH, { fit: "fill", kernel: "nearest" }).png().toBuffer()
    const [cx, cy] = PLOT_CENTERS[plot.plotNum] || [100, 150]
    let px = cx - Math.floor(newW / 2)
    px = Math.max(0, Math.min(px, SCREEN_S - newW))
    const py = Math.max(0, cy - targetH + 2)
    const ov = await clipOverlay(scaled, newW, targetH, px, py, SCREEN_S, SCREEN_S)
    if (ov) layers.push(ov)
  }

  const bgPath = data.isNight ? "farm/backgrounds/farm_night.png" : "farm/backgrounds/farm_day.png"
  const bgRaw = (await fetchPng(assetUrl(bgPath))) || (await fetchPng(assetUrl("farm/backgrounds/farm_day.png")))
  const sceneBase = bgRaw
    ? sharp(await toRgba(bgRaw, SCREEN_S, SCREEN_S))
    : sharp({ create: { width: SCREEN_S, height: SCREEN_S, channels: 4, background: { r: 80, g: 140, b: 60, alpha: 255 } } })
  const scene = await sceneBase.composite(layers).png().toBuffer()

  // 2. Gameboy: scene into the screen, then the frame on top, crop below screen.
  const frameRaw = (await fetchPng(assetUrl(data.gameboyPath))) || (await fetchPng(assetUrl(DEFAULT_GAMEBOY)))
  const gbLayers: sharp.OverlayOptions[] = [{ input: scene, left: SCREEN_L, top: SCREEN_T }]
  if (frameRaw) gbLayers.push({ input: await toRgba(frameRaw, GB_W, GB_H), left: 0, top: 0 })
  const gbFull = await sharp({
    create: { width: GB_W, height: GB_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite(gbLayers).png().toBuffer()

  const cropH = Math.min(CROP_Y, GB_H)
  const cropped = await sharp(gbFull).extract({ left: 0, top: 0, width: GB_W, height: cropH }).png().toBuffer()

  const s = Math.max(1, Math.min(3, scale))
  if (s === 1) return cropped
  return sharp(cropped).resize(GB_W * s, cropH * s, { kernel: "nearest" }).png().toBuffer()
}

const renderCache: Map<string, { buf: Buffer; etag: string; ts: number }> = new Map()
const RENDER_TTL_MS = 60 * 1000 // shorter than pet: farm changes as crops grow/water

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed" })
  }
  const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
  if (!ctx) return

  // --- AI-MODIFIED (2026-06-02) ---
  const rl = ankiRateLimit(ctx.userId, "farm-portrait")
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
  }
  // --- END AI-MODIFIED ---

  const scale = Math.max(1, Math.min(3, parseInt((req.query.scale as string) || "2", 10) || 2))

  let data: FarmData
  try {
    data = await loadFarmData(ctx.userId)
  } catch (err) {
    console.error("[anki/farm-portrait] data load failed:", err)
    return res.status(503).json({ error: "db_unavailable" })
  }

  const sig = crypto.createHash("sha1")
    .update(JSON.stringify({ p: data.plots, n: data.isNight, g: data.gameboyPath, s: scale }))
    .digest("hex").slice(0, 16)
  const cacheKey = `${ctx.discordId}:${sig}`
  const cached = renderCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < RENDER_TTL_MS) {
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "private, max-age=60")
    res.setHeader("ETag", cached.etag)
    if (req.headers["if-none-match"] === cached.etag) return res.status(304).end()
    return res.status(200).send(cached.buf)
  }

  try {
    const buf = await composeFarm(data, scale)
    const etag = `"${crypto.createHash("sha256").update(buf).digest("base64url").slice(0, 16)}"`
    renderCache.set(cacheKey, { buf, etag, ts: Date.now() })
    // --- AI-MODIFIED (2026-06-02) --- bound memory (was 300)
    if (renderCache.size > 120) {
      Array.from(renderCache.keys()).slice(0, 40).forEach((k) => renderCache.delete(k))
    }
    // --- END AI-MODIFIED ---
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "private, max-age=60")
    res.setHeader("ETag", etag)
    if (req.headers["if-none-match"] === etag) return res.status(304).end()
    return res.status(200).send(buf)
  } catch (err) {
    console.error("[anki/farm-portrait] compose failed:", err)
    return res.status(500).json({ error: "compose_failed" })
  }
}
