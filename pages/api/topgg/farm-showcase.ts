// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Server-side composited LionGotchi farm scene for top.gg.
//          Upscales the pixel-art farm background with nearest-neighbor
//          to preserve the crisp pixel look at display sizes.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import sharp from "sharp"

const BLOB_BASE =
  process.env.NEXT_PUBLIC_BLOB_URL ||
  "https://dj03j4ltfyd6tjzw.public.blob.vercel-storage.com"

function assetUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`
}

const FARM_SIZE = 200
const SCALE = 3
const OUTPUT_SIZE = FARM_SIZE * SCALE

let cachedResult: { buf: Buffer; ts: number } | null = null
const CACHE_TTL = 3600_000

async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`)
  return Buffer.from(await res.arrayBuffer())
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end()

  if (cachedResult && Date.now() - cachedResult.ts < CACHE_TTL) {
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200")
    return res.status(200).send(cachedResult.buf)
  }

  try {
    const bgBuf = await fetchImage(assetUrl("farm/backgrounds/farm_day.png"))

    const result = await sharp(bgBuf)
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, { kernel: "nearest" })
      .png()
      .toBuffer()

    cachedResult = { buf: result, ts: Date.now() }

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200")
    res.status(200).send(result)
  } catch (err) {
    console.error("farm-showcase error:", err)
    res.status(500).json({ error: "Failed to generate farm image" })
  }
}
