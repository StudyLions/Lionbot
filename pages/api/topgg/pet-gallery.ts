// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Renders 3 LionGotchi pets side by side in different skins
//          and rooms, composited into a single wide PNG for top.gg.
//          Shows off the variety of customization options.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import sharp from "sharp"

const BLOB_BASE =
  process.env.NEXT_PUBLIC_BLOB_URL ||
  "https://dj03j4ltfyd6tjzw.public.blob.vercel-storage.com"

function assetUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`
}

const GB_W = 260
const GB_H = 400
const SCREEN_T = 36
const SCREEN_L = 30
const SCREEN_S = 200
const PET_SIZE = 80
const PET_X = SCREEN_L + Math.round((SCREEN_S - PET_SIZE) / 2)
const PET_Y = SCREEN_T + SCREEN_S - PET_SIZE - 15

const GAP = 24
const COUNT = 3
const CANVAS_W = GB_W * COUNT + GAP * (COUNT - 1)
const CANVAS_H = GB_H
const SCALE = 2

interface PetConfig {
  frame: string
  roomLayers: string[]
  expression: string
}

const GALLERY: PetConfig[] = [
  {
    frame: "gameboy/frames/wave/purple.png",
    roomLayers: [
      "rooms/aquarium/wall_3.png",
      "rooms/aquarium/floor_1.png",
      "rooms/aquarium/carpet_3.png",
    ],
    expression: "happy",
  },
  {
    frame: "gameboy/frames/gameboy-candy-01.png",
    roomLayers: [
      "rooms/castle/wall_1.png",
      "rooms/castle/floor_1.png",
      "rooms/castle/carpet_1.png",
      "rooms/castle/bed_1.png",
      "rooms/castle/chair_1.png",
      "rooms/castle/desk_1.png",
      "rooms/castle/lamp_1.png",
    ],
    expression: "happy",
  },
  {
    frame: "gameboy/frames/fire/red.png",
    roomLayers: [
      "rooms/volcano/wall_1.png",
      "rooms/volcano/floor_1.png",
      "rooms/volcano/carpet_1.png",
    ],
    expression: "happy",
  },
]

let cachedResult: { buf: Buffer; ts: number } | null = null
const CACHE_TTL = 3600_000

async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`)
  return Buffer.from(await res.arrayBuffer())
}

async function resizeNearest(buf: Buffer, w: number, h: number): Promise<Buffer> {
  return sharp(buf).resize(w, h, { fit: "fill", kernel: "nearest" }).png().toBuffer()
}

async function composeSingle(config: PetConfig): Promise<Buffer> {
  const roomFetches = config.roomLayers.map((l) => fetchImage(assetUrl(l)))
  const petParts = ["body", "head", "hair"] as const
  const petFetches = petParts.map((p) => fetchImage(assetUrl(`lion/${p}/${p}_1.png`)))
  const faceFetch = fetchImage(assetUrl(`lion/expressions/${config.expression}/face_1.png`))
  const frameFetch = fetchImage(assetUrl(config.frame))

  const [roomBufs, petBufs, faceBuf, frameBuf] = await Promise.all([
    Promise.all(roomFetches),
    Promise.all(petFetches),
    faceFetch,
    frameFetch,
  ])

  const roomResized = await Promise.all(roomBufs.map((b) => resizeNearest(b, SCREEN_S, SCREEN_S)))
  const petResized = await Promise.all(petBufs.map((b) => resizeNearest(b, PET_SIZE, PET_SIZE)))
  const faceResized = await resizeNearest(faceBuf, PET_SIZE, PET_SIZE)
  const frameResized = await resizeNearest(frameBuf, GB_W, GB_H)

  const composites: sharp.OverlayOptions[] = [
    ...roomResized.map((input) => ({ input, left: SCREEN_L, top: SCREEN_T })),
    ...petResized.map((input) => ({ input, left: PET_X, top: PET_Y })),
    { input: faceResized, left: PET_X, top: PET_Y },
    { input: frameResized, left: 0, top: 0 },
  ]

  return sharp({
    create: { width: GB_W, height: GB_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png()
    .toBuffer()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end()

  if (cachedResult && Date.now() - cachedResult.ts < CACHE_TTL) {
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200")
    return res.status(200).send(cachedResult.buf)
  }

  try {
    const singles = await Promise.all(GALLERY.map(composeSingle))

    const composites: sharp.OverlayOptions[] = singles.map((input, i) => ({
      input,
      left: i * (GB_W + GAP),
      top: 0,
    }))

    const native = await sharp({
      create: {
        width: CANVAS_W,
        height: CANVAS_H,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(composites)
      .png()
      .toBuffer()

    const result = await sharp(native)
      .resize(CANVAS_W * SCALE, CANVAS_H * SCALE, { kernel: "nearest" })
      .png()
      .toBuffer()

    cachedResult = { buf: result, ts: Date.now() }

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200")
    res.status(200).send(result)
  } catch (err) {
    console.error("pet-gallery error:", err)
    res.status(500).json({ error: "Failed to generate gallery" })
  }
}
