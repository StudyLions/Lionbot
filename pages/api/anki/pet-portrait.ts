// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19  (full render 2026-05-20)
// Purpose: Server-composed FULL LionGotchi render for the Anki
//          addon: gameboy frame + room (wall/floor/furniture) +
//          pet (body/head/hair) + equipment + expression.
//
//          Mirrors the website's canonical composition:
//            - geometry from pages/api/topgg/pet-showcase.ts
//              (GB 260x400, screen at (30,36) size 200, scale 2)
//            - room coordinate system from utils/roomConstraints.ts
//              (CANVAS_SIZE 200, ROOM_LAYERS order, lion at [60,105]
//               size 80 native 64, DEFAULT_RENDER_SEQUENCE)
//            - data resolution from pages/api/pet/overview.ts
//              (active room -> getRoomDefaults + lg_user_furniture,
//               active gameboy skin, lg_pet_equipment + cosmetics)
//
//          Faithful to defaults; v1 intentionally ignores
//          per-item saved offsets/scales/flips and glow (only
//          power users customize those). Every asset fetch is
//          best-effort: a missing layer is skipped, never fatal,
//          so we always return at least the frame + base pet.
//
//          Output is a tall gameboy PNG (aspect 260:400). The
//          addon scales it to fit, preserving aspect.
//
//          Auth: requires a valid Anki bearer (anki.pet.read).
//          Accepts ?t=<token> so an <img> tag can load it.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"
import sharp from "sharp"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { getRoomDefaults } from "@/utils/roomDefaults"

const BLOB_BASE =
  process.env.NEXT_PUBLIC_BLOB_URL ||
  "https://dj03j4ltfyd6tjzw.public.blob.vercel-storage.com"

// ---- geometry (matches pet-showcase.ts + roomConstraints.ts) ----
const GB_W = 260
const GB_H = 400
const SCREEN_T = 36
const SCREEN_L = 30
const SCREEN_S = 200 // == CANVAS_SIZE
const LION_NATIVE = 64 // LION_SPRITE_SIZE
const LION_DISPLAY = 80 // LION_DISPLAY_SIZE
const LION_POS: [number, number] = [60, 105] // DEFAULT_LION_POSITION (room-local)
const CROP_Y = 244 // crop below the screen (bot's FULLSCREEN_CROP_Y)
const DEFAULT_GAMEBOY = "gameboy/frames/gameboy-basic-01.png"

const ROOM_LAYERS = [
  "wall", "floor", "mat", "table", "chair", "bed", "lamp", "picture", "window",
]

// Lion + equipment z-order (DEFAULT_RENDER_SEQUENCE). Equipment is
// keyed by SLOT (FEET/BODY/FACE/HEAD/BACK); BACK draws behind body.
const RENDER_SEQUENCE: Array<{ type: "lion" | "equip"; key: string }> = [
  { type: "lion", key: "body" },
  { type: "equip", key: "FEET" },
  { type: "equip", key: "BODY" },
  { type: "lion", key: "head" },
  { type: "lion", key: "expression" },
  { type: "equip", key: "FACE" },
  { type: "lion", key: "hair" },
  { type: "equip", key: "HEAD" },
]

const KNOWN_EXPRESSIONS = new Set([
  "default", "happy", "excited", "content", "sad", "tired", "upset", "neutral", "dead",
])

function assetUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`
}

function expressionDir(expr: string | null | undefined): string {
  const norm = (expr || "default").toLowerCase()
  return KNOWN_EXPRESSIONS.has(norm) ? norm : "default"
}

// Equipment asset path: equipment categories live under equipment/.
function equipmentUrl(assetPath: string): string {
  return assetUrl(`equipment/${assetPath}`)
}

async function fetchPng(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

async function toRgba(buf: Buffer, w: number, h: number): Promise<Buffer> {
  return sharp(buf)
    .resize(w, h, { fit: "fill", kernel: "nearest" })
    .ensureAlpha()
    .png()
    .toBuffer()
}

// In-memory render cache per (userid, signature, scale). Short TTL —
// the pet changes rarely, and the cache busts on equipment/room change
// via the signature included in the key by the caller.
const renderCache: Map<string, { buf: Buffer; etag: string; ts: number }> = new Map()
const RENDER_TTL_MS = 3 * 60 * 1000

interface PetRenderData {
  expression: string
  gameboyPath: string
  furniture: Record<string, string> // layer -> asset path
  equipment: Record<string, string> // slot -> equipment asset path (already equipment/...-relative)
}

async function loadRenderData(userId: bigint): Promise<PetRenderData | null> {
  const pet = await prisma.lg_pets.findUnique({
    where: { userid: userId },
    select: {
      expression: true,
      active_room_id: true,
      active_gameboy_skin_id: true,
      cosmetics_enabled: true,
    },
  })
  if (!pet) return null

  const [skinRow, room, furnitureRows, equipmentRows, cosmeticRows] = await Promise.all([
    pet.active_gameboy_skin_id
      ? prisma.lg_gameboy_skins.findUnique({
          where: { skin_id: pet.active_gameboy_skin_id },
          select: { asset_path: true },
        })
      : Promise.resolve(null),
    pet.active_room_id
      ? prisma.lg_rooms.findUnique({
          where: { room_id: pet.active_room_id },
          select: { asset_prefix: true },
        })
      : Promise.resolve(null),
    prisma.$queryRawUnsafe<{ slot: string; asset_path: string }[]>(
      `SELECT slot, asset_path FROM lg_user_furniture WHERE userid = $1`,
      userId
    ),
    prisma.lg_pet_equipment.findMany({
      where: { userid: userId },
      select: { slot: true, lg_items: { select: { asset_path: true } } },
    }),
    prisma.lg_pet_cosmetics.findMany({
      where: { userid: userId },
      select: { slot: true, lg_items: { select: { asset_path: true } } },
    }),
  ])

  // Room furniture map: defaults for the active room theme, then
  // per-slot user overrides (normalized to rooms/furniture/ when raw).
  const roomPrefix = room?.asset_prefix ?? "rooms/default"
  const furniture: Record<string, string> = getRoomDefaults(roomPrefix)
  for (const f of furnitureRows) {
    let p = f.asset_path
    if (!p.startsWith("rooms/")) p = `rooms/furniture/${p}`
    furniture[f.slot] = p
  }

  // Equipment by slot, cosmetics merged over equipment when enabled.
  const equipment: Record<string, string> = {}
  for (const e of equipmentRows) {
    if (e.lg_items?.asset_path) equipment[e.slot] = e.lg_items.asset_path
  }
  if (pet.cosmetics_enabled !== false) {
    for (const c of cosmeticRows) {
      if (c.lg_items?.asset_path) equipment[c.slot] = c.lg_items.asset_path
    }
  }

  return {
    expression: expressionDir(pet.expression),
    gameboyPath: skinRow?.asset_path || DEFAULT_GAMEBOY,
    furniture,
    equipment,
  }
}

/** Crop `buf` (natural size imgW x imgH) to the region that fits
 *  within [0,boundW)x[0,boundH) at (left,top), then push the
 *  cropped piece into `layers` at the clamped destination. This
 *  mirrors the bot's PIL auto-clip behavior — sharp throws on
 *  out-of-bounds composites, so we crop first. No-op if nothing
 *  is visible. */
async function placeClipped(
  layers: sharp.OverlayOptions[],
  buf: Buffer,
  imgW: number,
  imgH: number,
  left: number,
  top: number,
  boundW: number,
  boundH: number
): Promise<void> {
  const srcL = Math.max(0, -left)
  const srcT = Math.max(0, -top)
  const srcR = Math.min(imgW, boundW - left)
  const srcB = Math.min(imgH, boundH - top)
  if (srcR <= srcL || srcB <= srcT) return
  let input = buf
  if (srcL > 0 || srcT > 0 || srcR < imgW || srcB < imgH) {
    input = await sharp(buf)
      .ensureAlpha()
      .extract({ left: srcL, top: srcT, width: srcR - srcL, height: srcB - srcT })
      .png()
      .toBuffer()
  }
  layers.push({ input, left: Math.max(0, left), top: Math.max(0, top) })
}

/** Compose the lion sprite (parts + equipment + expression) on a
 *  64-wide canvas tall enough for oversized equipment, mirroring
 *  the bot's compose_pet_sprite (renderer.py). Oversized equipment
 *  is center-x / bottom-aligned and CROPPED to the canvas (sharp
 *  rejects larger-than-canvas composites; PIL auto-clips). BACK is
 *  handled separately in composeFullPet. Returns {buf, height, extraTop}. */
async function composeLion(
  data: PetRenderData
): Promise<{ buf: Buffer; width: number; height: number; extraTop: number } | null> {
  const [body, head, hair, faceMaybe] = await Promise.all([
    fetchPng(assetUrl("lion/body/body_1.png")),
    fetchPng(assetUrl("lion/head/head_1.png")),
    fetchPng(assetUrl("lion/hair/hair_1.png")),
    fetchPng(assetUrl(`lion/expressions/${data.expression}/face_1.png`)),
  ])
  const face =
    faceMaybe || (await fetchPng(assetUrl("lion/expressions/default/face_1.png")))
  if (!body && !head && !hair) return null

  // Equipment (raw buffers + natural size), excluding BACK.
  const equip: Record<string, { buf: Buffer; w: number; h: number }> = {}
  await Promise.all(
    Object.entries(data.equipment).map(async ([slot, path]) => {
      if (slot === "BACK") return
      const raw = await fetchPng(equipmentUrl(path))
      if (!raw) return
      try {
        const meta = await sharp(raw).metadata()
        equip[slot] = { buf: raw, w: meta.width || LION_NATIVE, h: meta.height || LION_NATIVE }
      } catch {
        /* skip unreadable asset */
      }
    })
  )

  // Canvas height fits the tallest equipment (hats extend upward).
  let maxH = LION_NATIVE
  for (const slot of Object.keys(equip)) {
    if (equip[slot].h > maxH) maxH = equip[slot].h
  }
  const extraTop = maxH - LION_NATIVE
  const canvasH = maxH

  const layers: sharp.OverlayOptions[] = []
  for (const step of RENDER_SEQUENCE) {
    if (step.type === "lion") {
      const buf =
        step.key === "body" ? body :
        step.key === "head" ? head :
        step.key === "hair" ? hair :
        step.key === "expression" ? face : null
      if (buf) {
        const rgba = await toRgba(buf, LION_NATIVE, LION_NATIVE)
        layers.push({ input: rgba, left: 0, top: extraTop })
      }
    } else {
      const slot = step.key
      if (slot === "BACK") continue
      const e = equip[slot]
      if (!e) continue
      if (e.w !== LION_NATIVE || e.h !== LION_NATIVE) {
        // oversized: center-x, bottom-align, crop to the 64-wide canvas
        const cx = Math.floor((LION_NATIVE - e.w) / 2)
        const cy = canvasH - e.h
        await placeClipped(layers, e.buf, e.w, e.h, cx, cy, LION_NATIVE, canvasH)
      } else {
        const rgba = await sharp(e.buf).ensureAlpha().png().toBuffer()
        layers.push({ input: rgba, left: 0, top: extraTop })
      }
    }
  }

  const buf = await sharp({
    create: { width: LION_NATIVE, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(layers)
    .png()
    .toBuffer()

  return { buf, width: LION_NATIVE, height: canvasH, extraTop }
}

async function composeFullPet(data: PetRenderData, scale: number): Promise<Buffer> {
  // 1. Room scene (200x200): room layers in order, then BACK wings,
  //    then the lion. Mirrors the bot's compose_full_scene.
  const roomLayers: sharp.OverlayOptions[] = []
  for (const layer of ROOM_LAYERS) {
    const path = data.furniture[layer]
    if (!path) continue
    const raw = await fetchPng(assetUrl(path))
    if (!raw) continue
    const rgba = await toRgba(raw, SCREEN_S, SCREEN_S)
    roomLayers.push({ input: rgba, left: 0, top: 0 })
  }

  const petSize = LION_DISPLAY // 80
  const lionX = LION_POS[0]
  const lionY = LION_POS[1]

  // BACK (wings) behind the lion: scale to pet height, place behind.
  const backPath = data.equipment["BACK"]
  if (backPath) {
    const raw = await fetchPng(equipmentUrl(backPath))
    if (raw) {
      try {
        const meta = await sharp(raw).metadata()
        const bw = meta.width || LION_NATIVE
        const bh = meta.height || LION_NATIVE
        const targetH = petSize
        const targetW = Math.max(1, Math.round(bw * (targetH / bh)))
        const wings = await sharp(raw)
          .ensureAlpha()
          .resize(targetW, targetH, { kernel: "nearest" })
          .png()
          .toBuffer()
        const wx = lionX + Math.floor((petSize - targetW) / 2)
        const wy = lionY - 15
        await placeClipped(roomLayers, wings, targetW, targetH, wx, wy, SCREEN_S, SCREEN_S)
      } catch {
        /* skip */
      }
    }
  }

  const lion = await composeLion(data)
  if (lion) {
    const scaleFactor = petSize / LION_NATIVE // 1.25
    const scaledW = Math.max(1, Math.round(lion.width * scaleFactor))
    const scaledH = Math.max(1, Math.round(lion.height * scaleFactor))
    const lionScaled = await sharp(lion.buf)
      .resize(scaledW, scaledH, { fit: "fill", kernel: "nearest" })
      .png()
      .toBuffer()
    const pasteX = lionX
    const pasteY = lionY - Math.round(lion.extraTop * scaleFactor)
    await placeClipped(roomLayers, lionScaled, scaledW, scaledH, pasteX, pasteY, SCREEN_S, SCREEN_S)
  }

  const roomScene = await sharp({
    create: { width: SCREEN_S, height: SCREEN_S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(roomLayers)
    .png()
    .toBuffer()

  // 2. Gameboy: room scene into the screen, then the frame on top.
  const gbLayers: sharp.OverlayOptions[] = [
    { input: roomScene, left: SCREEN_L, top: SCREEN_T },
  ]
  const frameRaw = await fetchPng(assetUrl(data.gameboyPath))
  const frameFinal = frameRaw || (await fetchPng(assetUrl(DEFAULT_GAMEBOY)))
  if (frameFinal) {
    const frameRgba = await toRgba(frameFinal, GB_W, GB_H)
    gbLayers.push({ input: frameRgba, left: 0, top: 0 })
  }

  const gameboyFull = await sharp({
    create: { width: GB_W, height: GB_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(gbLayers)
    .png()
    .toBuffer()

  // Crop below the screen (bot's FULLSCREEN_CROP_Y) — keeps the
  // skin-specific bezel but drops the empty lower body for a
  // cleaner, screen-focused view.
  const cropH = Math.min(CROP_Y, GB_H)
  const gameboy = await sharp(gameboyFull)
    .extract({ left: 0, top: 0, width: GB_W, height: cropH })
    .png()
    .toBuffer()

  // 3. Upscale with nearest-neighbor for crisp pixel art.
  const s = Math.max(1, Math.min(3, scale))
  if (s === 1) return gameboy
  return sharp(gameboy)
    .resize(GB_W * s, cropH * s, { kernel: "nearest" })
    .png()
    .toBuffer()
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed" })
  }

  // Token fallback for <img> usage.
  if (!req.headers.authorization && typeof req.query.t === "string") {
    req.headers.authorization = `Bearer ${req.query.t}`
  }

  const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
  if (!ctx) return

  const scale = Math.max(1, Math.min(3, parseInt((req.query.scale as string) || "2", 10) || 2))

  let data: PetRenderData | null
  try {
    data = await loadRenderData(ctx.userId)
  } catch (err) {
    console.error("[anki/pet-portrait] data load failed:", err)
    return res.status(503).json({ error: "db_unavailable" })
  }
  if (!data) {
    // No pet yet — render an empty default gameboy + room.
    data = {
      expression: "default",
      gameboyPath: DEFAULT_GAMEBOY,
      furniture: getRoomDefaults("rooms/default"),
      equipment: {},
    }
  }

  // Cache key from the render-affecting fields.
  const sig = crypto
    .createHash("sha1")
    .update(
      JSON.stringify({
        e: data.expression,
        g: data.gameboyPath,
        f: data.furniture,
        q: data.equipment,
        s: scale,
      })
    )
    .digest("hex")
    .slice(0, 16)
  const cacheKey = `${ctx.discordId}:${sig}`

  const cached = renderCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < RENDER_TTL_MS) {
    if (req.headers["if-none-match"] === cached.etag) return res.status(304).end()
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "private, max-age=180")
    res.setHeader("ETag", cached.etag)
    return res.status(200).send(cached.buf)
  }

  try {
    const buf = await composeFullPet(data, scale)
    const etag = `"${crypto.createHash("sha256").update(buf).digest("base64url").slice(0, 16)}"`
    renderCache.set(cacheKey, { buf, etag, ts: Date.now() })
    if (renderCache.size > 300) {
      const drop = Array.from(renderCache.keys()).slice(0, 30)
      drop.forEach((k) => renderCache.delete(k))
    }
    if (req.headers["if-none-match"] === etag) return res.status(304).end()
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "private, max-age=180")
    res.setHeader("ETag", etag)
    return res.status(200).send(buf)
  } catch (err) {
    console.error("[anki/pet-portrait] compose failed:", err)
    return res.status(500).json({ error: "compose_failed" })
  }
}
