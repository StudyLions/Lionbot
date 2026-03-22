// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Server-side composited LionGotchi showcase image for top.gg.
//          Layers gameboy frame + room (wall/floor/mat/furniture) + pet lion
//          into a single PNG using sharp, matching the homepage rendering.
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

const SCALE = 2

interface RoomConfig {
  layers: string[]
}

interface SkinConfig {
  frame: string
  room: RoomConfig
}

const PRESETS: Record<string, SkinConfig> = {
  candy: {
    frame: "gameboy/frames/gameboy-candy-01.png",
    room: {
      layers: [
        "rooms/castle/wall_1.png",
        "rooms/castle/floor_1.png",
        "rooms/castle/carpet_1.png",
        "rooms/castle/bed_1.png",
        "rooms/castle/chair_1.png",
        "rooms/castle/desk_1.png",
        "rooms/castle/lamp_1.png",
      ],
    },
  },
  wave: {
    frame: "gameboy/frames/wave/purple.png",
    room: {
      layers: [
        "rooms/aquarium/wall_3.png",
        "rooms/aquarium/floor_1.png",
        "rooms/aquarium/carpet_3.png",
      ],
    },
  },
  japan: {
    frame: "gameboy/frames/japan_flowers/design.png",
    room: {
      layers: [
        "rooms/library/wall_2.png",
        "rooms/library/floor_2.png",
        "rooms/library/carpet_2.png",
      ],
    },
  },
  fire: {
    frame: "gameboy/frames/fire/red.png",
    room: {
      layers: [
        "rooms/volcano/wall_1.png",
        "rooms/volcano/floor_1.png",
        "rooms/volcano/carpet_1.png",
      ],
    },
  },
  hearts: {
    frame: "gameboy/frames/gameboy-hearts-01.png",
    room: {
      layers: [
        "rooms/beach/wall_2.png",
        "rooms/beach/floor_2.png",
        "rooms/beach/carpet_2.png",
      ],
    },
  },
  sakura: {
    frame: "gameboy/frames/japan_pattern/japan_pattern_4.png",
    room: {
      layers: [
        "rooms/savannah/wall_1.png",
        "rooms/savannah/floor_3.png",
        "rooms/savannah/carpet_1.png",
      ],
    },
  },
}

const resultCache = new Map<string, { buf: Buffer; ts: number }>()
const CACHE_TTL = 3600_000

async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function resizeNearest(buf: Buffer, w: number, h: number): Promise<Buffer> {
  return sharp(buf).resize(w, h, { fit: "fill", kernel: "nearest" }).png().toBuffer()
}

async function composePet(preset: SkinConfig): Promise<Buffer> {
  const roomFetches = preset.room.layers.map((l) => fetchImage(assetUrl(l)))

  const petParts = ["body", "head", "hair"] as const
  const petFetches = petParts.map((p) => fetchImage(assetUrl(`lion/${p}/${p}_1.png`)))
  const faceFetch = fetchImage(assetUrl("lion/expressions/happy/face_1.png"))
  const frameFetch = fetchImage(assetUrl(preset.frame))

  const [roomBufs, petBufs, faceBuf, frameBuf] = await Promise.all([
    Promise.all(roomFetches),
    Promise.all(petFetches),
    faceFetch,
    frameFetch,
  ])

  const roomResized = await Promise.all(
    roomBufs.map((b) => resizeNearest(b, SCREEN_S, SCREEN_S))
  )
  const petResized = await Promise.all(
    petBufs.map((b) => resizeNearest(b, PET_SIZE, PET_SIZE))
  )
  const faceResized = await resizeNearest(faceBuf, PET_SIZE, PET_SIZE)
  const frameResized = await resizeNearest(frameBuf, GB_W, GB_H)

  const composites: sharp.OverlayOptions[] = [
    ...roomResized.map((input) => ({ input, left: SCREEN_L, top: SCREEN_T })),
    ...petResized.map((input) => ({ input, left: PET_X, top: PET_Y })),
    { input: faceResized, left: PET_X, top: PET_Y },
    { input: frameResized, left: 0, top: 0 },
  ]

  const native = await sharp({
    create: {
      width: GB_W,
      height: GB_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer()

  return sharp(native)
    .resize(GB_W * SCALE, GB_H * SCALE, { kernel: "nearest" })
    .png()
    .toBuffer()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end()

  const skin = (req.query.skin as string) || "candy"
  const preset = PRESETS[skin] || PRESETS.candy

  const cached = resultCache.get(skin)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200")
    return res.status(200).send(cached.buf)
  }

  try {
    const result = await composePet(preset)
    resultCache.set(skin, { buf: result, ts: Date.now() })

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200")
    res.status(200).send(result)
  } catch (err) {
    console.error("pet-showcase error:", err)
    res.status(500).json({ error: "Failed to generate image" })
  }
}
