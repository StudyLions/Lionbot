// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19  (full render 2026-05-20, layout+anim 2026-05-20)
// Purpose: Server-composed FULL LionGotchi render for the Anki
//          addon: gameboy frame + room (wall/floor/furniture) +
//          pet (body/head/hair) + equipment + expression, faithful
//          to the user's SAVED room layout and ANIMATED (4 frames).
//
//          Ports the bot's canonical renderer
//          (StudyLion/src/modules/liongotchi/renderer.py):
//            - compose_room_scene  -> layerOrder + per-layer
//              furnitureScales / furnitureOffsets / furnitureFlips,
//              each scaled-centered-offset then clipped to 200x200
//            - compose_pet_sprite  -> renderSequence (interleaved
//              lion/equipment), tall canvas for oversized hats,
//              equipmentOffsets (clamped +/-16), oversized crop
//            - compose_full_scene  -> lionPosition / lionScale,
//              lion horizontal flip, BACK wings behind the lion,
//              paste-y top-crop for tall sprites
//            - render_fullscreen_frame -> crop below the screen
//              (FULLSCREEN_CROP_Y = 244), keep the skin bezel
//
//          Layout + render-sequence helpers are imported from
//          utils/roomConstraints.ts so the addon stays byte-for-byte
//          in sync with the website room editor.
//
//          Animation: lion body/head/hair/face cycle 4 frames
//          (frame_n = (i % 4) + 1). The room, equipment and gameboy
//          are static, so they're composed once and only the lion
//          is re-composited per frame. With ?frames=4 the endpoint
//          returns the 4 frames stacked vertically into one PNG
//          strip (header X-Anki-Frames: 4); the addon slices the
//          strip and cycles it with a QTimer (full RGBA fidelity,
//          no GIF quantization). Without ?frames it returns a
//          single static frame (used by the <img>?t= fallback).
//
//          Every asset fetch is best-effort: a missing layer is
//          skipped, never fatal, so we always return at least the
//          frame + base pet.
//
//          Auth: requires a valid Anki bearer (anki.pet.read) in
//          the Authorization header. (No ?t= query-string token —
//          tokens in URLs leak via logs/referrers; the addon always
//          uses the header.)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"
import sharp from "sharp"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { getRoomDefaults } from "@/utils/roomDefaults"
import {
  ROOM_LAYERS,
  DEFAULT_LION_POSITION,
  LION_SPRITE_SIZE,
  LION_DISPLAY_SIZE,
  buildRenderSequence,
  mergeLayout,
  type RoomLayout,
} from "@/utils/roomConstraints"

const BLOB_BASE =
  process.env.NEXT_PUBLIC_BLOB_URL ||
  "https://dj03j4ltfyd6tjzw.public.blob.vercel-storage.com"

// ---- geometry (matches pet-showcase.ts + roomConstraints.ts) ----
const GB_W = 260
const GB_H = 400
const SCREEN_T = 36
const SCREEN_L = 30
const SCREEN_S = 200 // == CANVAS_SIZE
const LION_NATIVE = LION_SPRITE_SIZE // 64
const LION_DISPLAY = LION_DISPLAY_SIZE // 80
const CROP_Y = 244 // crop below the screen (bot's FULLSCREEN_CROP_Y)
const DEFAULT_GAMEBOY = "gameboy/frames/gameboy-basic-01.png"
const ANIM_FRAMES = 4

const ROOM_LAYER_SET = new Set<string>(ROOM_LAYERS as readonly string[])

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

function trunc(n: number): number {
  // Match Python int(): truncate toward zero.
  return n < 0 ? Math.ceil(n) : Math.floor(n)
}

async function fetchPng(url: string): Promise<Buffer | null> {
  // --- AI-MODIFIED (2026-06-02) ---
  // Bound the remote asset fetch with a 6s timeout so a slow/hanging
  // asset host can't tie up the serverless function. A timeout/abort
  // returns null -> the layer is skipped, same as a 404.
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
  return sharp(buf)
    .resize(w, h, { fit: "fill", kernel: "nearest" })
    .ensureAlpha()
    .png()
    .toBuffer()
}

/** Crop `buf` (natural size imgW x imgH) to the region that fits
 *  within [0,boundW)x[0,boundH) at (left,top), and return a sharp
 *  overlay placed at the clamped destination — or null if nothing
 *  is visible. Mirrors PIL's auto-clip (sharp throws on
 *  out-of-bounds composites). */
async function clipOverlay(
  buf: Buffer,
  imgW: number,
  imgH: number,
  left: number,
  top: number,
  boundW: number,
  boundH: number
): Promise<sharp.OverlayOptions | null> {
  const srcL = Math.max(0, -left)
  const srcT = Math.max(0, -top)
  const srcR = Math.min(imgW, boundW - left)
  const srcB = Math.min(imgH, boundH - top)
  if (srcR <= srcL || srcB <= srcT) return null
  let input = buf
  if (srcL > 0 || srcT > 0 || srcR < imgW || srcB < imgH) {
    input = await sharp(buf)
      .ensureAlpha()
      .extract({ left: srcL, top: srcT, width: srcR - srcL, height: srcB - srcT })
      .png()
      .toBuffer()
  }
  return { input, left: Math.max(0, left), top: Math.max(0, top) }
}

// In-memory render cache per (userid, signature). Short TTL — the
// pet changes rarely, and the cache busts on equipment/room/layout
// change via the signature.
const renderCache: Map<string, { buf: Buffer; etag: string; frames: number; ts: number }> = new Map()
const RENDER_TTL_MS = 3 * 60 * 1000

interface PetRenderData {
  expression: string
  gameboyPath: string
  furniture: Record<string, string> // layer -> asset path
  equipment: Record<string, string> // SLOT -> equipment/...-relative path
  layout: RoomLayout
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

  const [skinRow, room, furnitureRows, equipmentRows, cosmeticRows, layoutRows] =
    await Promise.all([
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
      prisma.$queryRawUnsafe<{ layout: unknown }[]>(
        `SELECT layout FROM lg_room_layout WHERE userid = $1`,
        userId
      ),
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

  const rawLayout = (layoutRows[0]?.layout as Partial<RoomLayout>) ?? {}

  return {
    expression: expressionDir(pet.expression),
    gameboyPath: skinRow?.asset_path || DEFAULT_GAMEBOY,
    furniture,
    equipment,
    layout: mergeLayout(rawLayout),
  }
}

interface EquipBuf {
  buf: Buffer
  w: number
  h: number
}

/** Fetch every equipped item's PNG + natural size, once. Static
 *  across frames (equipment animation is out of scope for v1). */
async function loadEquipment(
  equipment: Record<string, string>
): Promise<Record<string, EquipBuf>> {
  const out: Record<string, EquipBuf> = {}
  await Promise.all(
    Object.entries(equipment).map(async ([slot, path]) => {
      const raw = await fetchPng(equipmentUrl(path))
      if (!raw) return
      try {
        const meta = await sharp(raw).metadata()
        out[slot] = { buf: raw, w: meta.width || LION_NATIVE, h: meta.height || LION_NATIVE }
      } catch {
        /* skip unreadable asset */
      }
    })
  )
  return out
}

interface LionFrame {
  body: Buffer | null
  head: Buffer | null
  hair: Buffer | null
  face: Buffer | null
}

/** Fetch the 4 animation frames of body/head/hair/face up front.
 *  Falls back to the default expression for any missing face. */
async function loadLionFrames(expression: string): Promise<LionFrame[]> {
  const jobs: Promise<LionFrame>[] = []
  for (let i = 0; i < ANIM_FRAMES; i++) {
    const n = (i % ANIM_FRAMES) + 1
    jobs.push(
      (async () => {
        const [body, head, hair, faceMaybe] = await Promise.all([
          fetchPng(assetUrl(`lion/body/body_${n}.png`)),
          fetchPng(assetUrl(`lion/head/head_${n}.png`)),
          fetchPng(assetUrl(`lion/hair/hair_${n}.png`)),
          fetchPng(assetUrl(`lion/expressions/${expression}/face_${n}.png`)),
        ])
        const face =
          faceMaybe ||
          (await fetchPng(assetUrl(`lion/expressions/default/face_${n}.png`)))
        return { body, head, hair, face }
      })()
    )
  }
  return Promise.all(jobs)
}

/** Compose the room scene (200x200) with the saved layout, then the
 *  BACK wings behind where the lion will sit. The lion itself is
 *  composited per-frame on top of this static stage. Mirrors the
 *  bot's compose_room_scene + the BACK section of compose_full_scene. */
async function composeStage(
  data: PetRenderData,
  equip: Record<string, EquipBuf>
): Promise<Buffer> {
  const L = data.layout
  const layers: sharp.OverlayOptions[] = []

  for (const layer of L.layerOrder) {
    if (!ROOM_LAYER_SET.has(layer)) continue
    const path = data.furniture[layer]
    if (!path) continue
    const raw = await fetchPng(assetUrl(path))
    if (!raw) continue

    let base = sharp(raw).resize(SCREEN_S, SCREEN_S, { fit: "fill", kernel: "nearest" })
    if (L.furnitureFlips[layer]) base = base.flop()
    const baseBuf = await base.ensureAlpha().png().toBuffer()

    // Clamp: the room layout is stored as unvalidated client JSON, so a huge
    // scale here would make sharp allocate a giant buffer (OOM/DoS). Bound it.
    const scale = Math.min(3, Math.max(0.1, Number(L.furnitureScales[layer]) || 1.0))
    const off = L.furnitureOffsets[layer]
    const ox = off ? trunc(off[0]) : 0
    const oy = off ? trunc(off[1]) : 0

    if (scale !== 1.0 && scale > 0) {
      const nw = Math.max(1, Math.floor(SCREEN_S * scale))
      const nh = Math.max(1, Math.floor(SCREEN_S * scale))
      const scaled = await sharp(baseBuf)
        .resize(nw, nh, { fit: "fill", kernel: "nearest" })
        .png()
        .toBuffer()
      const cx = Math.floor((SCREEN_S - nw) / 2) + ox
      const cy = Math.floor((SCREEN_S - nh) / 2) + oy
      const ov = await clipOverlay(scaled, nw, nh, cx, cy, SCREEN_S, SCREEN_S)
      if (ov) layers.push(ov)
    } else if (ox !== 0 || oy !== 0) {
      const ov = await clipOverlay(baseBuf, SCREEN_S, SCREEN_S, ox, oy, SCREEN_S, SCREEN_S)
      if (ov) layers.push(ov)
    } else {
      layers.push({ input: baseBuf, left: 0, top: 0 })
    }
  }

  // BACK (wings) behind the lion — depends only on lion pos/scale +
  // the (static) wings asset, so it belongs on the static stage.
  const lionScale = Math.min(3, Math.max(0.1, Number(L.lionScale) || 1.0))  // clamp unvalidated layout (OOM guard)
  const petSize = Math.max(1, trunc(LION_DISPLAY * lionScale))
  const lionX = L.lionPosition?.[0] ?? DEFAULT_LION_POSITION[0]
  const lionY = L.lionPosition?.[1] ?? DEFAULT_LION_POSITION[1]

  const back = equip["BACK"]
  if (back) {
    const targetH = petSize
    const targetW = Math.max(1, trunc(back.w * (targetH / back.h)))
    const wings = await sharp(back.buf)
      .ensureAlpha()
      .resize(targetW, targetH, { fit: "fill", kernel: "nearest" })
      .png()
      .toBuffer()
    const bOff = L.equipmentOffsets["BACK"] ?? L.equipmentOffsets["back"]
    const boffX = bOff ? trunc(bOff[0]) : 0
    const boffY = bOff ? trunc(bOff[1]) : 0
    const wx = lionX + Math.floor((petSize - targetW) / 2) + boffX
    const wy = lionY - trunc(15 * lionScale) + boffY
    const ov = await clipOverlay(wings, targetW, targetH, wx, wy, SCREEN_S, SCREEN_S)
    if (ov) layers.push(ov)
  }

  // Opaque-black base, matching the bot's compose_room_scene.
  return sharp({
    create: { width: SCREEN_S, height: SCREEN_S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 255 } },
  })
    .composite(layers)
    .png()
    .toBuffer()
}

/** Compose the lion sprite for one frame on a 64-wide canvas tall
 *  enough for oversized equipment, following the saved render
 *  sequence. Returns the canvas buffer (LION_NATIVE x canvasH).
 *  Mirrors the bot's compose_pet_sprite. */
async function composeLionSprite(
  parts: LionFrame,
  equip: Record<string, EquipBuf>,
  layout: RoomLayout,
  sequence: { type: "lion" | "equip"; key: string }[],
  canvasH: number,
  extraTop: number
): Promise<Buffer> {
  const layers: sharp.OverlayOptions[] = []

  for (const step of sequence) {
    if (step.type === "lion") {
      const buf =
        step.key === "body" ? parts.body :
        step.key === "head" ? parts.head :
        step.key === "hair" ? parts.hair :
        step.key === "expression" ? parts.face : null
      if (buf) {
        const rgba = await toRgba(buf, LION_NATIVE, LION_NATIVE)
        layers.push({ input: rgba, left: 0, top: extraTop })
      }
    } else {
      const slot = step.key // UPPER (FEET/BODY/FACE/HEAD)
      if (slot === "BACK") continue
      const e = equip[slot]
      if (!e) continue

      const off = layout.equipmentOffsets[slot] ?? layout.equipmentOffsets[slot.toLowerCase()]
      let ox = off ? trunc(off[0]) : 0
      let oy = off ? trunc(off[1]) : 0
      ox = Math.max(-16, Math.min(16, ox))
      oy = Math.max(-16, Math.min(16, oy))

      if (e.w !== LION_NATIVE || e.h !== LION_NATIVE) {
        // oversized (hats etc): center-x, bottom-align, then offset + clip
        const cx = Math.floor((LION_NATIVE - e.w) / 2)
        const cy = canvasH - e.h
        const rgba = await sharp(e.buf).ensureAlpha().png().toBuffer()
        const ov = await clipOverlay(rgba, e.w, e.h, cx + ox, cy + oy, LION_NATIVE, canvasH)
        if (ov) layers.push(ov)
      } else {
        const rgba = await sharp(e.buf).ensureAlpha().png().toBuffer()
        const ov = await clipOverlay(rgba, LION_NATIVE, LION_NATIVE, ox, extraTop + oy, LION_NATIVE, canvasH)
        if (ov) layers.push(ov)
      }
    }
  }

  return sharp({
    create: { width: LION_NATIVE, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(layers)
    .png()
    .toBuffer()
}

/** Render `frameCount` full gameboy frames (cropped at CROP_Y) and,
 *  if more than one, stack them vertically into a single PNG strip.
 *  Returns the buffer + actual frame count. */
async function composeAnimated(
  data: PetRenderData,
  scale: number,
  frameCount: number
): Promise<{ buf: Buffer; frames: number }> {
  const equip = await loadEquipment(data.equipment)

  // Canvas height for the lion sprite is fixed by the tallest
  // (non-BACK) equipment, identical across frames.
  let maxH = LION_NATIVE
  for (const slot of Object.keys(equip)) {
    if (slot !== "BACK" && equip[slot].h > maxH) maxH = equip[slot].h
  }
  const extraTop = maxH - LION_NATIVE
  const canvasH = maxH

  const sequence = buildRenderSequence(Object.keys(data.equipment), data.layout.renderSequence)

  const [stage, lionFrames, frameRaw] = await Promise.all([
    composeStage(data, equip),
    loadLionFrames(data.expression),
    fetchPng(assetUrl(data.gameboyPath)),
  ])
  const frameFinal = frameRaw || (await fetchPng(assetUrl(DEFAULT_GAMEBOY)))
  const frameRgba = frameFinal ? await toRgba(frameFinal, GB_W, GB_H) : null

  const L = data.layout
  const lionScale = Math.min(3, Math.max(0.1, Number(L.lionScale) || 1.0))  // clamp unvalidated layout (OOM guard)
  const petSize = Math.max(1, trunc(LION_DISPLAY * lionScale))
  const lionX = L.lionPosition?.[0] ?? DEFAULT_LION_POSITION[0]
  const lionY = L.lionPosition?.[1] ?? DEFAULT_LION_POSITION[1]
  const scaleFactor = petSize / LION_NATIVE
  const lionFlipped = L.furnitureFlips["lion"] === true

  const cropH = Math.min(CROP_Y, GB_H)
  const n = Math.max(1, Math.min(ANIM_FRAMES, frameCount))

  const cropped: Buffer[] = []
  for (let i = 0; i < n; i++) {
    const parts = lionFrames[i % lionFrames.length]
    const lionBuf = await composeLionSprite(parts, equip, L, sequence, canvasH, extraTop)

    const scaledW = Math.max(1, trunc(LION_NATIVE * scaleFactor))
    const scaledH = Math.max(1, trunc(canvasH * scaleFactor))
    let lionScaled = sharp(lionBuf).resize(scaledW, scaledH, { fit: "fill", kernel: "nearest" })
    if (lionFlipped) lionScaled = lionScaled.flop()
    const lionScaledBuf = await lionScaled.png().toBuffer()

    const pasteX = lionX
    const pasteY = lionY - trunc(extraTop * scaleFactor)
    const lionOv = await clipOverlay(lionScaledBuf, scaledW, scaledH, pasteX, pasteY, SCREEN_S, SCREEN_S)

    const screen = await sharp(stage)
      .composite(lionOv ? [lionOv] : [])
      .png()
      .toBuffer()

    const gbLayers: sharp.OverlayOptions[] = [{ input: screen, left: SCREEN_L, top: SCREEN_T }]
    if (frameRgba) gbLayers.push({ input: frameRgba, left: 0, top: 0 })
    const gbFull = await sharp({
      create: { width: GB_W, height: GB_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite(gbLayers)
      .png()
      .toBuffer()

    const frameCrop = await sharp(gbFull)
      .extract({ left: 0, top: 0, width: GB_W, height: cropH })
      .png()
      .toBuffer()
    cropped.push(frameCrop)
  }

  // Upscale each frame with nearest-neighbor for crisp pixel art.
  const s = Math.max(1, Math.min(3, scale))
  const upW = GB_W * s
  const upH = cropH * s
  const upFrames =
    s === 1
      ? cropped
      : await Promise.all(
          cropped.map((f) =>
            sharp(f).resize(upW, upH, { kernel: "nearest" }).png().toBuffer()
          )
        )

  if (upFrames.length === 1) return { buf: upFrames[0], frames: 1 }

  // Stack vertically into one strip.
  const strip = await sharp({
    create: { width: upW, height: upH * upFrames.length, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(upFrames.map((input, i) => ({ input, left: 0, top: upH * i })))
    .png()
    .toBuffer()
  return { buf: strip, frames: upFrames.length }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed" })
  }

  const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
  if (!ctx) return

  // --- AI-MODIFIED (2026-06-02) ---
  const rl = ankiRateLimit(ctx.userId, "pet-portrait")
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return res.status(429).json({ error: "rate_limited", message: "Too many requests — slow down." })
  }
  // --- END AI-MODIFIED ---

  const scale = Math.max(1, Math.min(3, parseInt((req.query.scale as string) || "2", 10) || 2))
  // ?frames=4 -> animated strip; otherwise a single static frame
  // (the <img>?t= fallback can't animate a PNG).
  const wantFrames = req.query.frames === "4" ? ANIM_FRAMES : 1

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
      layout: mergeLayout({}),
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
        l: data.layout,
        s: scale,
        n: wantFrames,
      })
    )
    .digest("hex")
    .slice(0, 16)
  const cacheKey = `${ctx.discordId}:${sig}`

  const cached = renderCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < RENDER_TTL_MS) {
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "private, max-age=180")
    res.setHeader("ETag", cached.etag)
    if (cached.frames > 1) res.setHeader("X-Anki-Frames", String(cached.frames))
    if (req.headers["if-none-match"] === cached.etag) return res.status(304).end()
    return res.status(200).send(cached.buf)
  }

  try {
    const { buf, frames } = await composeAnimated(data, scale, wantFrames)
    const etag = `"${crypto.createHash("sha256").update(buf).digest("base64url").slice(0, 16)}"`
    renderCache.set(cacheKey, { buf, etag, frames, ts: Date.now() })
    // --- AI-MODIFIED (2026-06-02) ---
    // Bound memory: each animated render is ~20-30 MB, so cap entries
    // lower (was 300 -> multi-GB worst case) and evict more per pass.
    if (renderCache.size > 120) {
      const drop = Array.from(renderCache.keys()).slice(0, 40)
      drop.forEach((k) => renderCache.delete(k))
    }
    // --- END AI-MODIFIED ---
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "private, max-age=180")
    res.setHeader("ETag", etag)
    if (frames > 1) res.setHeader("X-Anki-Frames", String(frames))
    if (req.headers["if-none-match"] === etag) return res.status(304).end()
    return res.status(200).send(buf)
  } catch (err) {
    console.error("[anki/pet-portrait] compose failed:", err)
    return res.status(500).json({ error: "compose_failed" })
  }
}
