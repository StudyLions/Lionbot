// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Dynamic Open Graph image route for server profile
//          pages. Generates a 1200x630 PNG that social platforms
//          (Twitter, LinkedIn, Discord, Facebook, etc.) can
//          embed as a rich preview when someone shares the
//          /servers/{slug} URL.
//
//          Implementation note: we deliberately avoid `@vercel/og`
//          here so we don't take on a new dependency. The project
//          already has `sharp` installed for image processing, so
//          we hand-craft an SVG with the listing's theme colours
//          and display name, then rasterize it through sharp.
//          When a cover image is set, we fetch it and composite
//          the gradient + text on top.
//
//          Caching: this is a Node API route. We set a long s-max-
//          age + stale-while-revalidate so the Vercel CDN does the
//          heavy lifting -- we only do the actual PNG synthesis
//          on a cold cache miss (and after each admin edit, when
//          the cache is purged via slug bust).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import sharp from "sharp"
import { prisma } from "@/utils/prisma"
import { LISTING_THEMES } from "@/constants/ServerListingData"

// 1200x630 is the recommended size for Twitter and Facebook
// preview cards. Most platforms downscale gracefully.
const OG_WIDTH = 1200
const OG_HEIGHT = 630

export const config = {
  api: {
    responseLimit: false,
  },
}

interface ListingForOg {
  display_name: string
  tagline: string | null
  category: string
  theme_preset: string
  accent_color: string | null
  cover_image_url: string | null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slugRaw = req.query.slug
  const slug = Array.isArray(slugRaw) ? slugRaw[0] : slugRaw
  if (!slug || typeof slug !== "string") {
    return res.status(400).end("Missing slug")
  }

  const listing = await prisma.server_listings.findFirst({
    where: { slug, status: "APPROVED" },
    select: {
      display_name: true,
      tagline: true,
      category: true,
      theme_preset: true,
      accent_color: true,
      cover_image_url: true,
    },
  })

  if (!listing) {
    return res.status(404).end("Not found")
  }

  try {
    const png = await renderOgPng(listing)
    res.setHeader("Content-Type", "image/png")
    // Cache aggressively at the CDN. The page will bust this when
    // it edits via a tag or by including ?v=updated_at -- but for
    // organic shares this stays fresh for 1 hour with a 24h SWR.
    res.setHeader(
      "Cache-Control",
      "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    )
    return res.status(200).send(png)
  } catch (err) {
    console.error("[og/server] render failed", err)
    return res.status(500).end("OG render failed")
  }
}

async function renderOgPng(listing: ListingForOg): Promise<Buffer> {
  const theme =
    LISTING_THEMES.find((t) => t.id === listing.theme_preset) ?? LISTING_THEMES[0]
  const accent = sanitiseHex(listing.accent_color) ?? theme.defaultAccent
  // The theme's bodyTint/cardSurface are HSL CSS strings -- we resolve
  // them through a tiny helper so the SVG gradient gets concrete RGB
  // hex values that sharp can rasterize.
  const fromColor = cssColorToHex(theme.bodyTint) ?? "#0f172a"
  const toColor = cssColorToHex(theme.cardSurface) ?? "#1e293b"

  const overlaySvg = buildOverlaySvg({
    title: listing.display_name,
    tagline: listing.tagline ?? `A featured ${listing.category} server on LionBot`,
    accent,
    fromColor,
    toColor,
    showCoverDarkening: !!listing.cover_image_url,
  })

  // Pipeline: start from either the cover image (resized + slightly
  // darkened) or a flat gradient SVG, then composite the text overlay
  // on top.
  let base: sharp.Sharp
  if (listing.cover_image_url) {
    try {
      const resp = await fetch(listing.cover_image_url)
      if (!resp.ok) throw new Error(`cover fetch ${resp.status}`)
      const buf = Buffer.from(await resp.arrayBuffer())
      base = sharp(buf)
        .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover", position: "center" })
        .modulate({ brightness: 0.7 })
    } catch (err) {
      console.warn("[og/server] cover fetch failed; falling back to gradient", err)
      base = gradientBase(fromColor, toColor)
    }
  } else {
    base = gradientBase(fromColor, toColor)
  }

  return base
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png()
    .toBuffer()
}

function gradientBase(fromColor: string, toColor: string): sharp.Sharp {
  const svg = `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${fromColor}" />
          <stop offset="100%" stop-color="${toColor}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
    </svg>
  `
  return sharp(Buffer.from(svg))
}

function buildOverlaySvg(args: {
  title: string
  tagline: string
  accent: string
  fromColor: string
  toColor: string
  showCoverDarkening: boolean
}): string {
  const safeTitle = clampText(escapeXml(args.title), 60)
  const safeTagline = clampText(escapeXml(args.tagline), 110)
  const accent = args.accent

  // The text block is anchored bottom-left with a soft gradient
  // overlay behind it so it's legible on any cover photo. The
  // accent ribbon at the top-left is the brand element that ties
  // each social card back to the LionBot directory.
  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scrim" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="rgba(0,0,0,0.85)" />
          <stop offset="60%" stop-color="rgba(0,0,0,0.35)" />
          <stop offset="100%" stop-color="rgba(0,0,0,0)" />
        </linearGradient>
        <filter id="textShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" flood-opacity="0.55" />
        </filter>
      </defs>

      <rect x="0" y="${OG_HEIGHT - 360}" width="100%" height="360" fill="url(#scrim)" />

      <!-- Accent corner ribbon -->
      <g transform="translate(60,60)">
        <rect width="180" height="44" rx="22" fill="${accent}" opacity="0.92" />
        <text x="90" y="29" text-anchor="middle"
          font-family="Inter, system-ui, sans-serif"
          font-size="18" font-weight="700" fill="#0b1020">
          LionBot
        </text>
      </g>

      <!-- Title + tagline anchored bottom-left -->
      <g filter="url(#textShadow)">
        <text x="60" y="${OG_HEIGHT - 130}"
          font-family="Inter, system-ui, sans-serif"
          font-size="68" font-weight="800" fill="#ffffff" letter-spacing="-1">
          ${safeTitle}
        </text>
        <text x="60" y="${OG_HEIGHT - 70}"
          font-family="Inter, system-ui, sans-serif"
          font-size="28" font-weight="500" fill="rgba(255,255,255,0.85)">
          ${safeTagline}
        </text>
      </g>

      <!-- Footer URL chip -->
      <g transform="translate(60,${OG_HEIGHT - 50})">
        <text font-family="Inter, system-ui, sans-serif"
          font-size="20" font-weight="500" fill="rgba(255,255,255,0.65)">
          lionbot.org/servers
        </text>
      </g>
    </svg>
  `
}

function clampText(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 1) + "…"
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function sanitiseHex(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return null
  return trimmed
}

/**
 * The theme constants store body / card colours as CSS strings such as
 * "hsl(222 47% 11%)". Sharp wants concrete colours in the SVG, so we
 * convert the most common two formats (hsl + hex) here. Anything we
 * can't parse falls back to null so the caller can pick a default.
 */
function cssColorToHex(css: string | null | undefined): string | null {
  if (!css) return null
  const trimmed = css.trim()
  if (trimmed.startsWith("#")) return sanitiseHex(trimmed)
  const hslMatch = trimmed.match(
    /^hsla?\(\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*(?:\/\s*(\d+(?:\.\d+)?))?\s*\)$/i,
  )
  if (!hslMatch) return null
  const h = parseFloat(hslMatch[1])
  const s = parseFloat(hslMatch[2]) / 100
  const l = parseFloat(hslMatch[3]) / 100
  return hslToHex(h, s, l)
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0,
    g = 0,
    b = 0
  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  const toHex = (v: number) => {
    const n = Math.round((v + m) * 255)
    return n.toString(16).padStart(2, "0")
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
