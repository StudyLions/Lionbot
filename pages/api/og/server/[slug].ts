// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Updated: 2026-05-01 (dark-only palette)
// Purpose: Dynamic Open Graph image route for server profile
//          pages. Generates a 1200x630 PNG that social platforms
//          (Twitter, LinkedIn, Discord, Facebook, etc.) can
//          embed as a rich preview when someone shares the
//          /servers/{slug} URL.
//
//          Each of the 5 editorial themes renders its own distinct
//          layout so social cards feel like a continuation of the
//          article, not a generic "name + tagline + cover" stamp.
//          All colour tokens come from the theme objects in
//          constants/ServerListingData.ts so the OG cards auto-
//          follow palette changes (e.g. the dark-only switch).
//
//          We keep using sharp + a hand-crafted SVG (no @vercel/og
//          dependency). Display fonts are specified by font-family
//          stack -- librsvg picks the closest available system
//          font, so Atlantic falls back to Georgia / Liberation
//          Serif, Wired to Inter / DejaVu Sans, etc. The visual
//          distinctness comes from layout + colour + rule style,
//          not from pixel-perfect font matching.
//
//          Caching: long s-maxage + stale-while-revalidate so the
//          Vercel CDN takes the load. Per-listing edits bust the
//          cache via the slug path.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import sharp from "sharp"
import { prisma } from "@/utils/prisma"
import { resolveTheme, ListingTheme } from "@/constants/ServerListingData"
import { SERVERS_DIRECTORY_ENABLED } from "@/constants/FeatureFlags"

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
  // Feature gate -- see constants/FeatureFlags.ts. Hide the OG image
  // endpoint while the public directory is disabled so any cached
  // social cards stop resolving too.
  if (!SERVERS_DIRECTORY_ENABLED) {
    return res.status(404).end("Not found")
  }

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

// ── Per-theme renderer ────────────────────────────────────────

async function renderOgPng(listing: ListingForOg): Promise<Buffer> {
  const theme = resolveTheme(listing.theme_preset)
  const accent = sanitiseHex(listing.accent_color) ?? theme.defaultAccent

  // Build a base canvas of the theme's body colour (so unloaded
  // covers still look like the article). When a cover is present,
  // we composite it underneath the overlay with a theme-specific
  // treatment.
  const themeBaseColor = theme.bodyBg

  let base: sharp.Sharp
  if (listing.cover_image_url) {
    try {
      const resp = await fetch(listing.cover_image_url)
      if (!resp.ok) throw new Error(`cover fetch ${resp.status}`)
      const buf = Buffer.from(await resp.arrayBuffer())
      base = await applyCoverTreatment(theme, buf)
    } catch (err) {
      console.warn("[og/server] cover fetch failed; falling back to theme base", err)
      base = themeFlatBase(themeBaseColor)
    }
  } else {
    base = themeFlatBase(themeBaseColor)
  }

  const overlaySvg = buildOverlaySvgForTheme(theme, accent, {
    title: listing.display_name,
    tagline: listing.tagline ?? "",
    category: listing.category,
    hasCover: !!listing.cover_image_url,
  })

  return base
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png()
    .toBuffer()
}

function themeFlatBase(hex: string): sharp.Sharp {
  // Solid theme-colour PNG sized to 1200x630. We round through SVG so
  // sharp reuses its rasteriser without a separate image pipeline.
  const svg = `<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${hex}" />
  </svg>`
  return sharp(Buffer.from(svg))
}

/**
 * Apply the theme's cover treatment to the uploaded cover photo.
 * All themes are dark-surfaced now, so brightness multipliers stay
 * low to keep light-on-photo headlines legible.
 *
 * Atlantic (paper): warm darken, slight desat -- the photo eases
 *   into the warm-dark page below.
 * Wired (duotone): greyscale + heavy darken; the SVG accentTint
 *   layer adds the magenta fake-duotone on top.
 * Kinfolk (monochrome): full greyscale, slightly darker.
 * Vogue (wash): wine-toned tint + saturation pull, so colour
 *   covers feel printed in oxblood ink.
 * Frieze (spare): greyscale, gentle darken (no aggressive treatment
 *   — Frieze trusts the image and lets the typography do the work).
 */
async function applyCoverTreatment(theme: ListingTheme, buf: Buffer): Promise<sharp.Sharp> {
  let pipeline = sharp(buf).resize(OG_WIDTH, OG_HEIGHT, {
    fit: "cover",
    position: "center",
  })

  switch (theme.coverBlend) {
    case "duotone":
      pipeline = pipeline.greyscale().modulate({ brightness: 0.55 })
      break
    case "monochrome":
      pipeline = pipeline.greyscale().modulate({ brightness: 0.62 })
      break
    case "wash":
      // Wine tint instead of the old warm-cream tint, so the cover
      // matches the deep-oxblood Vogue surface below.
      pipeline = pipeline
        .modulate({ saturation: 0.5, brightness: 0.7 })
        .tint({ r: 130, g: 65, b: 80 })
      break
    case "spare":
      pipeline = pipeline.greyscale().modulate({ brightness: 0.72 })
      break
    case "paper":
    default:
      pipeline = pipeline.modulate({ brightness: 0.65, saturation: 0.85 })
      break
  }

  return pipeline
}

interface OverlayInput {
  title: string
  tagline: string
  category: string
  hasCover: boolean
}

function buildOverlaySvgForTheme(
  theme: ListingTheme,
  accent: string,
  input: OverlayInput,
): string {
  switch (theme.id) {
    case "wired":
      return buildWiredOverlay(theme, accent, input)
    case "kinfolk":
      return buildKinfolkOverlay(theme, accent, input)
    case "vogue":
      return buildVogueOverlay(theme, accent, input)
    case "frieze":
      return buildFriezeOverlay(theme, accent, input)
    case "atlantic":
    default:
      return buildAtlanticOverlay(theme, accent, input)
  }
}

// ── Theme overlays ────────────────────────────────────────────

function buildAtlanticOverlay(theme: ListingTheme, accent: string, input: OverlayInput): string {
  const title = clampText(escapeXml(input.title), 50)
  const tagline = clampText(escapeXml(input.tagline || `A featured ${input.category} community on LionBot`), 90)
  // Atlantic: warm-dark wash from the bottom, serif title, italic
  // deck, hairline rule, lifted-burgundy kicker. Cover sits behind
  // a paper-fade that resolves into the dark journalism surface.
  const fadeY = OG_HEIGHT - 360
  return `
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="atlanticFade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${theme.bodyBg}" stop-opacity="1" />
      <stop offset="55%" stop-color="${theme.bodyBg}" stop-opacity="0.55" />
      <stop offset="100%" stop-color="${theme.bodyBg}" stop-opacity="0" />
    </linearGradient>
  </defs>
  ${input.hasCover ? `<rect x="0" y="${fadeY}" width="100%" height="${OG_HEIGHT - fadeY}" fill="url(#atlanticFade)" />` : ""}

  <!-- Top kicker -->
  <g transform="translate(72,76)">
    <rect width="44" height="2" y="14" fill="${accent}" />
    <text x="60" y="22" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="6" fill="${theme.bodyText}">
      FEATURED · ${escapeXml(input.category.toUpperCase())}
    </text>
  </g>

  <!-- Title + deck -->
  <g transform="translate(72,${OG_HEIGHT - 220})">
    <text font-family="Spectral, Georgia, 'Liberation Serif', serif" font-size="86" font-weight="700" fill="${theme.bodyText}" letter-spacing="-2">
      ${title}
    </text>
    <text y="64" font-family="Spectral, Georgia, 'Liberation Serif', serif" font-style="italic" font-size="32" fill="${theme.mutedText}">
      ${tagline}
    </text>
  </g>

  <!-- Footer rule + colophon -->
  <line x1="72" y1="${OG_HEIGHT - 76}" x2="${OG_WIDTH - 72}" y2="${OG_HEIGHT - 76}" stroke="${theme.ruleColor}" stroke-width="1" />
  <text x="72" y="${OG_HEIGHT - 36}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="4" fill="${theme.mutedText}">
    THE LIONBOT DIRECTORY
  </text>
  <text x="${OG_WIDTH - 72}" y="${OG_HEIGHT - 36}" text-anchor="end" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" fill="${theme.mutedText}">
    lionbot.org/servers
  </text>
</svg>`
}

function buildWiredOverlay(theme: ListingTheme, accent: string, input: OverlayInput): string {
  const title = clampText(escapeXml(input.title.toUpperCase()), 40)
  const tagline = clampText(escapeXml(input.tagline || `${input.category} community`), 100)
  // Wired: matte black, accent magenta, all-caps Inter Tight, thick
  // accent rule under the kicker. Cover sits as a faux duotone.
  return `
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="darkScrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(10,10,12,0.30)" />
      <stop offset="60%" stop-color="rgba(10,10,12,0.85)" />
      <stop offset="100%" stop-color="rgba(10,10,12,1)" />
    </linearGradient>
    <linearGradient id="accentTint" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.40" />
      <stop offset="60%" stop-color="${accent}" stop-opacity="0" />
    </linearGradient>
  </defs>
  ${input.hasCover ? `<rect width="100%" height="100%" fill="url(#accentTint)" />` : ""}
  <rect width="100%" height="100%" fill="url(#darkScrim)" />

  <!-- Top kicker -->
  <g transform="translate(72,76)">
    <rect width="56" height="4" fill="${accent}" />
    <text y="42" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" font-weight="800" letter-spacing="6" fill="${accent}">
      FEATURED · ${escapeXml(input.category.toUpperCase())}
    </text>
  </g>

  <!-- Title + deck -->
  <g transform="translate(72,${OG_HEIGHT - 240})">
    <text font-family="Inter, Helvetica, Arial, sans-serif" font-size="104" font-weight="900" fill="#ffffff" letter-spacing="-3" textLength="${Math.min(OG_WIDTH - 144, title.length * 50)}" lengthAdjust="spacingAndGlyphs">
      ${title}
    </text>
    <text y="64" font-family="Inter, Helvetica, Arial, sans-serif" font-size="28" font-weight="500" fill="rgba(245,245,247,0.80)">
      ${tagline}
    </text>
  </g>

  <!-- Footer accent rule + URL -->
  <rect x="72" y="${OG_HEIGHT - 84}" width="${OG_WIDTH - 144}" height="3" fill="${accent}" />
  <text x="72" y="${OG_HEIGHT - 38}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="5" fill="#ffffff">
    LIONBOT.ORG/SERVERS
  </text>
</svg>`
}

function buildKinfolkOverlay(theme: ListingTheme, accent: string, input: OverlayInput): string {
  const title = clampText(escapeXml(input.title), 38)
  const tagline = clampText(escapeXml(input.tagline || `A ${input.category} community`), 90)
  // Kinfolk: cool dark slate + EB Garamond. Wide horizontal margins.
  // Italic deck. Title centred. No drop cap, just generous spacing.
  return `
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="kinfolkFade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${theme.bodyBg}" stop-opacity="1" />
      <stop offset="60%" stop-color="${theme.bodyBg}" stop-opacity="0.7" />
      <stop offset="100%" stop-color="${theme.bodyBg}" stop-opacity="0" />
    </linearGradient>
  </defs>
  ${input.hasCover ? `<rect x="0" y="${OG_HEIGHT - 480}" width="100%" height="480" fill="url(#kinfolkFade)" />` : ""}

  <!-- Tiny single-word kicker, italic -->
  <text x="50%" y="120" text-anchor="middle" font-family="EB Garamond, Garamond, Georgia, serif" font-style="italic" font-size="28" fill="${theme.mutedText}">
    Featured · ${escapeXml(input.category)}
  </text>

  <!-- Centered title -->
  <text x="50%" y="${OG_HEIGHT / 2 + 30}" text-anchor="middle" font-family="EB Garamond, Garamond, Georgia, serif" font-size="92" font-weight="500" fill="${theme.bodyText}" letter-spacing="-1">
    ${title}
  </text>

  <!-- Italic centered deck -->
  <text x="50%" y="${OG_HEIGHT / 2 + 90}" text-anchor="middle" font-family="EB Garamond, Garamond, Georgia, serif" font-style="italic" font-size="30" fill="${theme.mutedText}">
    ${tagline}
  </text>

  <!-- Hairline + colophon, centred -->
  <line x1="${OG_WIDTH / 2 - 80}" y1="${OG_HEIGHT - 90}" x2="${OG_WIDTH / 2 + 80}" y2="${OG_HEIGHT - 90}" stroke="${theme.ruleColor}" stroke-width="1" />
  <text x="50%" y="${OG_HEIGHT - 50}" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="20" letter-spacing="6" fill="${theme.mutedText}">
    LIONBOT.ORG/SERVERS
  </text>
</svg>`
}

function buildVogueOverlay(theme: ListingTheme, accent: string, input: OverlayInput): string {
  const title = clampText(escapeXml(input.title.toUpperCase()), 38)
  const tagline = clampText(escapeXml(input.tagline || `A ${input.category} community`), 100)
  // Vogue: oversized Playfair on the deep oxblood surface, double
  // rule, "VOL. I" eyebrow in lifted rose, italic deck under title.
  return `
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vogueFade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${theme.bodyBg}" stop-opacity="1" />
      <stop offset="55%" stop-color="${theme.bodyBg}" stop-opacity="0.55" />
      <stop offset="100%" stop-color="${theme.bodyBg}" stop-opacity="0" />
    </linearGradient>
  </defs>
  ${input.hasCover ? `<rect x="0" y="${OG_HEIGHT - 380}" width="100%" height="380" fill="url(#vogueFade)" />` : ""}

  <!-- Top "Vol. I — Issue NN" eyebrow -->
  <text x="72" y="100" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="6" fill="${accent}">
    VOL. I — ${escapeXml(input.category.toUpperCase())}
  </text>

  <!-- Massive title -->
  <text x="72" y="${OG_HEIGHT - 200}" font-family="Playfair Display, Georgia, 'Liberation Serif', serif" font-size="120" font-weight="700" fill="${theme.bodyText}" letter-spacing="-3">
    ${title}
  </text>

  <!-- Italic deck -->
  <text x="72" y="${OG_HEIGHT - 130}" font-family="Playfair Display, Georgia, serif" font-style="italic" font-size="34" fill="${theme.mutedText}">
    ${tagline}
  </text>

  <!-- Double rule + colophon -->
  <line x1="72" y1="${OG_HEIGHT - 80}" x2="${OG_WIDTH - 72}" y2="${OG_HEIGHT - 80}" stroke="${theme.ruleColor}" stroke-width="1" />
  <line x1="72" y1="${OG_HEIGHT - 76}" x2="${OG_WIDTH - 72}" y2="${OG_HEIGHT - 76}" stroke="${theme.ruleColor}" stroke-width="1" />
  <text x="72" y="${OG_HEIGHT - 36}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="6" fill="${theme.mutedText}">
    LIONBOT.ORG / SERVERS
  </text>
</svg>`
}

function buildFriezeOverlay(theme: ListingTheme, accent: string, input: OverlayInput): string {
  const title = clampText(escapeXml(input.title), 32)
  const tagline = clampText(escapeXml(input.tagline || `${input.category}`), 80)
  // Frieze: very large title in near-white, very small deck, mono
  // kicker, no rule. Cover (if any) eases into the pure dark surface.
  return `
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="friezeFade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${theme.bodyBg}" stop-opacity="1" />
      <stop offset="70%" stop-color="${theme.bodyBg}" stop-opacity="0.7" />
      <stop offset="100%" stop-color="${theme.bodyBg}" stop-opacity="0" />
    </linearGradient>
  </defs>
  ${input.hasCover ? `<rect x="0" y="${OG_HEIGHT - 420}" width="100%" height="420" fill="url(#friezeFade)" />` : ""}

  <!-- Mono kicker -->
  <text x="72" y="100" font-family="Menlo, Consolas, 'Courier New', monospace" font-size="20" letter-spacing="8" fill="${theme.mutedText}">
    /  FEATURED  /  ${escapeXml(input.category.toUpperCase())}
  </text>

  <!-- Massive title bottom-left -->
  <text x="72" y="${OG_HEIGHT - 170}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="148" font-weight="900" fill="${theme.bodyText}" letter-spacing="-5">
    ${title}
  </text>

  <!-- Tiny deck -->
  <text x="72" y="${OG_HEIGHT - 120}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" fill="${theme.mutedText}">
    ${tagline}
  </text>

  <!-- Mono colophon -->
  <text x="72" y="${OG_HEIGHT - 50}" font-family="Menlo, Consolas, 'Courier New', monospace" font-size="20" letter-spacing="6" fill="${theme.mutedText}">
    LIONBOT.ORG/SERVERS
  </text>
</svg>`
}

// ── Helpers ───────────────────────────────────────────────────

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
