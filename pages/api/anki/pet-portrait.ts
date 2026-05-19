// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Server-composed pet portrait PNG for the Anki addon.
//          Returns one image so the addon stays light (no
//          local image library).
//
//          v1 scope: base lion body + expression face. Equipment
//          (hat/glasses/costume/shirt/wings/boots), cosmetics,
//          and room background are deliberately out of scope for
//          v1 to keep the latency budget tight. Phase 2 layers
//          those in by querying lg_pet_equipment / lg_pet_cosmetics
//          and adding more composite entries — the composition
//          loop is already laid out for it.
//
//          Modeled on pages/api/topgg/pet-showcase.ts (same
//          sharp-based composition, same blob URL convention).
//
//          Auth: requires a valid Anki bearer (anki.pet.read scope).
//          We accept a query-string `?t=<token>` fallback so the
//          addon's <img> tag can load the URL directly without
//          fiddling with headers (HTTP <img> can't set Authorization).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"
import sharp from "sharp"
import { prisma } from "@/utils/prisma"
import { extractAnkiBearer, verifyAnkiBearer } from "@/lib/anki/auth"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"

const BLOB_BASE =
  process.env.NEXT_PUBLIC_BLOB_URL ||
  "https://dj03j4ltfyd6tjzw.public.blob.vercel-storage.com"

const PET_BASE = 96 // native pet pixel size
const SCALE_MAX = 4 // up to 384px output
const DEFAULT_SIZE = 288

function assetUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`
}

// In-memory portrait cache (per Vercel instance). Keyed by
// (userid|expression|size), 5-min TTL.
const portraitCache: Map<string, { buf: Buffer; etag: string; ts: number }> = new Map()
const PORTRAIT_TTL_MS = 5 * 60 * 1000

async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function resizeNearest(
  buf: Buffer,
  w: number,
  h: number
): Promise<Buffer> {
  return sharp(buf)
    .resize(w, h, { fit: "fill", kernel: "nearest" })
    .png()
    .toBuffer()
}

/**
 * Map lg_pets.expression -> /pet-assets/lion/expressions/<dir>/face_1.png
 * Falls back to "default" if the expression isn't known.
 */
function expressionDir(expr: string | null | undefined): string {
  const norm = (expr || "DEFAULT").toLowerCase()
  // Known directories on the blob — keep this list explicit so a
  // typo on either side falls back cleanly rather than 500'ing.
  const known = new Set([
    "default",
    "happy",
    "excited",
    "content",
    "sad",
    "tired",
    "upset",
    "neutral",
    "dead",
  ])
  return known.has(norm) ? norm : "default"
}

async function composePortrait(
  expression: string,
  outSize: number
): Promise<Buffer> {
  const parts = ["body", "head", "hair"]
  const partFetches = parts.map((p) =>
    fetchImage(assetUrl(`lion/${p}/${p}_1.png`))
  )
  const faceFetch = fetchImage(
    assetUrl(`lion/expressions/${expression}/face_1.png`)
  ).catch(() =>
    // Fall back to default face if the expression-specific one
    // is missing from the blob.
    fetchImage(assetUrl("lion/expressions/default/face_1.png"))
  )

  const [partBufs, faceBuf] = await Promise.all([
    Promise.all(partFetches),
    faceFetch,
  ])

  const partResized = await Promise.all(
    partBufs.map((b) => resizeNearest(b, PET_BASE, PET_BASE))
  )
  const faceResized = await resizeNearest(faceBuf, PET_BASE, PET_BASE)

  const composites: sharp.OverlayOptions[] = [
    ...partResized.map((input) => ({ input, left: 0, top: 0 })),
    { input: faceResized, left: 0, top: 0 },
  ]

  const native = await sharp({
    create: {
      width: PET_BASE,
      height: PET_BASE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer()

  // Upscale with nearest-neighbor to preserve pixel-art look.
  return sharp(native)
    .resize(outSize, outSize, { kernel: "nearest" })
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

  // Token fallback for <img> tag usage.
  if (!req.headers.authorization && typeof req.query.t === "string") {
    req.headers.authorization = `Bearer ${req.query.t}`
  }

  const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
  if (!ctx) return

  // Size: 64..384, default 288.
  const sizeRaw = typeof req.query.size === "string" ? parseInt(req.query.size, 10) : DEFAULT_SIZE
  const size = Math.max(64, Math.min(PET_BASE * SCALE_MAX, isFinite(sizeRaw) ? sizeRaw : DEFAULT_SIZE))

  let expression = "default"
  try {
    const pet = await prisma.lg_pets.findUnique({
      where: { userid: ctx.userId },
      select: { expression: true },
    })
    expression = expressionDir(pet?.expression)
  } catch (err) {
    console.warn("[anki/pet-portrait] pet lookup failed:", err)
  }

  const cacheKey = `${ctx.discordId}:${expression}:${size}`
  const cached = portraitCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < PORTRAIT_TTL_MS) {
    if (req.headers["if-none-match"] === cached.etag) {
      return res.status(304).end()
    }
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "private, max-age=300")
    res.setHeader("ETag", cached.etag)
    return res.status(200).send(cached.buf)
  }

  try {
    const buf = await composePortrait(expression, size)
    const etag = `"${crypto.createHash("sha256").update(buf).digest("base64url").slice(0, 16)}"`
    portraitCache.set(cacheKey, { buf, etag, ts: Date.now() })

    // Bound cache size — drop oldest 10% if we exceed 500 entries.
    if (portraitCache.size > 500) {
      const drop = Array.from(portraitCache.keys()).slice(0, 50)
      drop.forEach((k) => portraitCache.delete(k))
    }

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end()
    }
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "private, max-age=300")
    res.setHeader("ETag", etag)
    return res.status(200).send(buf)
  } catch (err) {
    console.error("[anki/pet-portrait] compose failed:", err)
    return res
      .status(500)
      .json({ error: "compose_failed", message: "Could not render portrait" })
  }
}

// Silence the unused-export warning that arises from the
// extractAnkiBearer + verifyAnkiBearer imports — we keep them
// here as a comment to document the bearer extraction path,
// in case future versions extract directly rather than via
// requireAnkiAuth.
void extractAnkiBearer
void verifyAnkiBearer
