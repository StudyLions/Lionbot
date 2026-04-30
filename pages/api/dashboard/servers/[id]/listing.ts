// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: GET / PUT for a single guild's "Feature Your Server"
//          listing.
//
//          GET: Returns the current listing (or a synthesised
//               DRAFT shell with sensible defaults if none exists
//               yet) plus premium status, slug suggestion,
//               and the public preview URL.
//
//          PUT: Upsert + validation. Behaviour depends on whether
//               the listing is already approved:
//                 - First save / not yet APPROVED: writes the new
//                   payload directly into the listing, sets
//                   status=PENDING if the admin clicked "Submit".
//                 - Already APPROVED: stores the diff in
//                   pending_changes and re-flips status=PENDING
//                   (keeping the live page intact). Toggle-only
//                   edits (sections_enabled, accent colour,
//                   theme preset) skip re-approval and apply
//                   straight to the live row.
//
//          Both methods are admin-only AND premium-only. Non-
//          admins get 403 from requireAdmin; non-premium guilds
//          get 403 from the premium check below.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma, ListingStatus } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"
import {
  getListingPremiumStatus,
  signPreviewToken,
} from "@/utils/listingHelpers"
import {
  validateListingSlug,
  normalizeListingSlug,
  suggestSlugFromName,
} from "@/utils/listingSlug"
import {
  LISTING_CATEGORY_IDS,
  LISTING_THEME_IDS,
  LISTING_FONT_IDS,
  LISTING_COUNTRIES,
  LISTING_LANGUAGES,
  LISTING_AGE_BANDS,
  LISTING_SECTION_KEYS,
  DEFAULT_SECTIONS_ENABLED,
  MAX_GALLERY_IMAGES,
  MAX_SECONDARY_TAGS,
  MAX_DESCRIPTION_LENGTH,
  MAX_TAGLINE_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  LISTING_BLEND_MODES,
} from "@/constants/ServerListingData"

const COUNTRY_IDS = new Set<string>(LISTING_COUNTRIES.map((c) => c.id))
const LANGUAGE_IDS = new Set<string>(LISTING_LANGUAGES.map((l) => l.id))
const AGE_BAND_IDS = new Set<string>(LISTING_AGE_BANDS.map((a) => a.id))
const BLEND_MODE_IDS = new Set<string>(LISTING_BLEND_MODES.map((b) => b.id))

// Fields that, if changed, should NOT trigger re-approval after a
// listing has been APPROVED -- they're either purely visual
// (theme/accent/font/sections_enabled) or operational (invite_code).
// Anything else flips the listing back to PENDING.
const NON_REAPPROVAL_FIELDS = new Set([
  "theme_preset",
  "accent_color",
  "font_family",
  "cover_blend_mode",
  "sections_enabled",
  "invite_code",
  "invite_managed",
  "invite_last_rotated",
])

interface ListingPayload {
  display_name: string
  tagline: string | null
  description: string
  category: string
  secondary_tags: string[]
  is_study_server: boolean
  primary_country: string | null
  primary_language: string | null
  audience_age: string | null
  theme_preset: string
  accent_color: string | null
  font_family: string | null
  cover_blend_mode: string
  cover_image_url: string | null
  guild_icon_url: string | null
  gallery_images: { url: string; caption?: string }[]
  external_link_url: string | null
  external_link_label: string | null
  sections_enabled: Record<string, boolean>
  nsfw_confirmed: boolean
  slug: string
}

interface ParsedPayload {
  payload: ListingPayload
  /** True if the admin clicked "Submit for review" (vs just "Save draft"). */
  submit: boolean
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(value)
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

function parsePayload(body: any): ParsedPayload {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Missing request body")
  }
  const submit = body.submit === true

  const display_name = String(body.display_name ?? "").trim()
  if (display_name.length === 0 || display_name.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new ValidationError(`Display name must be 1-${MAX_DISPLAY_NAME_LENGTH} characters`)
  }
  const tagline = body.tagline ? String(body.tagline).trim() : null
  if (tagline && tagline.length > MAX_TAGLINE_LENGTH) {
    throw new ValidationError(`Tagline must be ${MAX_TAGLINE_LENGTH} characters or fewer`)
  }
  const description = String(body.description ?? "").trim()
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new ValidationError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`)
  }

  const category = String(body.category ?? "").trim()
  if (!LISTING_CATEGORY_IDS.has(category)) {
    throw new ValidationError("Invalid category")
  }

  const secondary_tags: string[] = Array.isArray(body.secondary_tags)
    ? Array.from(new Set<string>(body.secondary_tags.map((t: unknown) => String(t).trim())))
        .filter((t) => LISTING_CATEGORY_IDS.has(t) && t !== category)
        .slice(0, MAX_SECONDARY_TAGS)
    : []

  const is_study_server = Boolean(body.is_study_server)

  const primary_country = body.primary_country ? String(body.primary_country) : null
  if (primary_country && !COUNTRY_IDS.has(primary_country)) {
    throw new ValidationError("Invalid primary country")
  }
  const primary_language = body.primary_language ? String(body.primary_language) : null
  if (primary_language && !LANGUAGE_IDS.has(primary_language)) {
    throw new ValidationError("Invalid primary language")
  }
  const audience_age = body.audience_age ? String(body.audience_age) : null
  if (audience_age && !AGE_BAND_IDS.has(audience_age)) {
    throw new ValidationError("Invalid audience age band")
  }

  const theme_preset = String(body.theme_preset ?? "midnight")
  if (!LISTING_THEME_IDS.has(theme_preset)) {
    throw new ValidationError("Invalid theme preset")
  }
  const accent_color = body.accent_color ? String(body.accent_color).toLowerCase() : null
  if (accent_color && !isHexColor(accent_color)) {
    throw new ValidationError("Accent colour must be a valid hex code")
  }
  const font_family = body.font_family ? String(body.font_family) : null
  if (font_family && !LISTING_FONT_IDS.has(font_family)) {
    throw new ValidationError("Invalid font choice")
  }
  const cover_blend_mode = String(body.cover_blend_mode ?? "fade")
  if (!BLEND_MODE_IDS.has(cover_blend_mode)) {
    throw new ValidationError("Invalid blend mode")
  }

  const cover_image_url = body.cover_image_url ? String(body.cover_image_url) : null
  if (cover_image_url && !isHttpUrl(cover_image_url)) {
    throw new ValidationError("Cover image URL is invalid")
  }
  const guild_icon_url = body.guild_icon_url ? String(body.guild_icon_url) : null

  const galleryRaw = Array.isArray(body.gallery_images) ? body.gallery_images : []
  const gallery_images: { url: string; caption?: string }[] = []
  for (const g of galleryRaw.slice(0, MAX_GALLERY_IMAGES)) {
    if (!g || typeof g !== "object") continue
    const url = typeof g.url === "string" ? g.url : ""
    if (!isHttpUrl(url)) continue
    const caption = typeof g.caption === "string" ? g.caption.slice(0, 200) : undefined
    gallery_images.push(caption ? { url, caption } : { url })
  }

  let external_link_url: string | null = null
  let external_link_label: string | null = null
  if (body.external_link_url) {
    const url = String(body.external_link_url).trim()
    if (!isHttpUrl(url)) {
      throw new ValidationError("External link URL must start with http(s)://")
    }
    external_link_url = url
    external_link_label = body.external_link_label
      ? String(body.external_link_label).trim().slice(0, 80)
      : null
  }

  const sectionsRaw = body.sections_enabled
  const sections_enabled: Record<string, boolean> = { ...DEFAULT_SECTIONS_ENABLED }
  if (sectionsRaw && typeof sectionsRaw === "object") {
    for (const key of Object.keys(sectionsRaw)) {
      if (LISTING_SECTION_KEYS.has(key)) {
        sections_enabled[key] = Boolean(sectionsRaw[key])
      }
    }
  }

  const nsfw_confirmed = Boolean(body.nsfw_confirmed)
  if (submit && !nsfw_confirmed) {
    throw new ValidationError(
      "You must confirm your server has no NSFW content before submitting for review.",
    )
  }

  const slug = normalizeListingSlug(body.slug)
  if (!slug) {
    throw new ValidationError("URL slug is required")
  }

  return {
    submit,
    payload: {
      display_name,
      tagline,
      description,
      category,
      secondary_tags,
      is_study_server,
      primary_country,
      primary_language,
      audience_age,
      theme_preset,
      accent_color,
      font_family,
      cover_blend_mode,
      cover_image_url,
      guild_icon_url,
      gallery_images,
      external_link_url,
      external_link_label,
      sections_enabled,
      nsfw_confirmed,
      slug,
    },
  }
}

function serializeListing(row: any) {
  if (!row) return null
  return {
    guildid: row.guildid.toString(),
    slug: row.slug,
    status: row.status,
    display_name: row.display_name,
    tagline: row.tagline,
    description: row.description,
    cover_image_url: row.cover_image_url,
    guild_icon_url: row.guild_icon_url,
    gallery_images: row.gallery_images ?? [],
    category: row.category,
    secondary_tags: row.secondary_tags ?? [],
    is_study_server: row.is_study_server,
    primary_country: row.primary_country,
    primary_language: row.primary_language,
    audience_age: row.audience_age,
    theme_preset: row.theme_preset,
    accent_color: row.accent_color,
    font_family: row.font_family,
    cover_blend_mode: row.cover_blend_mode,
    invite_code: row.invite_code,
    invite_managed: row.invite_managed,
    invite_last_rotated: row.invite_last_rotated?.toISOString() ?? null,
    external_link_url: row.external_link_url,
    external_link_label: row.external_link_label,
    sections_enabled: row.sections_enabled ?? DEFAULT_SECTIONS_ENABLED,
    nsfw_confirmed: row.nsfw_confirmed,
    submitted_at: row.submitted_at?.toISOString() ?? null,
    approved_at: row.approved_at?.toISOString() ?? null,
    rejection_reason: row.rejection_reason,
    pending_changes: row.pending_changes ?? null,
    view_count: row.view_count,
    invite_click_count: row.invite_click_count,
    promoted_until: row.promoted_until?.toISOString() ?? null,
    created_at: row.created_at?.toISOString() ?? null,
    updated_at: row.updated_at?.toISOString() ?? null,
  }
}

/** Compute a shallow diff of fields the admin wants to change vs what's
 *  currently APPROVED. Only the keys that actually differ are returned. */
function computeDiff(current: any, payload: ListingPayload): Record<string, any> {
  const diff: Record<string, any> = {}
  for (const [key, value] of Object.entries(payload)) {
    if (key === "slug") continue
    const currentVal = current[key]
    const a = JSON.stringify(currentVal ?? null)
    const b = JSON.stringify(value ?? null)
    if (a !== b) diff[key] = value
  }
  return diff
}

/** True if every changed key is in the "skip re-approval" allowlist. */
function isCosmeticOnlyDiff(diff: Record<string, any>): boolean {
  return Object.keys(diff).every((k) => NON_REAPPROVAL_FIELDS.has(k))
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "id")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const [premium, existing, guild] = await Promise.all([
      getListingPremiumStatus(guildId),
      prisma.server_listings.findUnique({ where: { guildid: guildId } }),
      prisma.guild_config.findUnique({
        where: { guildid: guildId },
        select: { name: true },
      }),
    ])

    const listing = serializeListing(existing)
    const previewToken = listing
      ? signPreviewToken(listing.slug)
      : null

    return res.status(200).json({
      isPremium: premium.isPremium,
      premiumUntil: premium.premiumUntil?.toISOString() ?? null,
      inGracePeriod: premium.inGracePeriod,
      graceDaysRemaining: premium.graceDaysRemaining,
      guild: { name: guild?.name ?? null },
      listing,
      suggestedSlug: !listing && guild?.name ? suggestSlugFromName(guild.name) : null,
      previewToken,
    })
  },

  async PUT(req, res) {
    const guildId = parseBigInt(req.query.id, "id")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const premium = await getListingPremiumStatus(guildId)
    if (!premium.isPremium) {
      return res
        .status(403)
        .json({ error: "Server premium subscription is required to edit your listing." })
    }

    const { payload, submit } = parsePayload(req.body)

    const slugError = await validateListingSlug(payload.slug, guildId)
    if (slugError) {
      return res.status(400).json({ error: slugError.message, code: slugError.code })
    }

    const existing = await prisma.server_listings.findUnique({
      where: { guildid: guildId },
    })

    // CASE A: No listing yet -- create a fresh one. status=PENDING if
    // the admin pressed "Submit", DRAFT otherwise.
    if (!existing) {
      const status: ListingStatus = submit ? "PENDING" : "DRAFT"
      const created = await prisma.server_listings.create({
        data: {
          guildid: guildId,
          slug: payload.slug,
          status,
          display_name: payload.display_name,
          tagline: payload.tagline,
          description: payload.description,
          cover_image_url: payload.cover_image_url,
          guild_icon_url: payload.guild_icon_url,
          gallery_images: payload.gallery_images as unknown as Prisma.InputJsonValue,
          category: payload.category,
          secondary_tags: payload.secondary_tags,
          is_study_server: payload.is_study_server,
          primary_country: payload.primary_country,
          primary_language: payload.primary_language,
          audience_age: payload.audience_age,
          theme_preset: payload.theme_preset,
          accent_color: payload.accent_color,
          font_family: payload.font_family,
          cover_blend_mode: payload.cover_blend_mode,
          external_link_url: payload.external_link_url,
          external_link_label: payload.external_link_label,
          sections_enabled: payload.sections_enabled as unknown as Prisma.InputJsonValue,
          nsfw_confirmed: payload.nsfw_confirmed,
          submitted_at: submit ? new Date() : null,
          notification_sent_at: null,
        },
      })
      // Fire-and-forget: tell the bot to post the review embed.
      if (submit) void notifyBot(guildId, "new").catch(() => {})
      return res.status(200).json({
        listing: serializeListing(created),
        message: submit
          ? "Submitted for review. We typically approve within 24 hours."
          : "Saved as draft.",
      })
    }

    // CASE B: Listing exists and is NOT yet APPROVED. Apply edits in
    // place and optionally bump status to PENDING.
    if (existing.status !== "APPROVED") {
      const newStatus: ListingStatus = submit ? "PENDING" : existing.status
      const updated = await prisma.server_listings.update({
        where: { guildid: guildId },
        data: {
          slug: payload.slug,
          display_name: payload.display_name,
          tagline: payload.tagline,
          description: payload.description,
          cover_image_url: payload.cover_image_url,
          guild_icon_url: payload.guild_icon_url,
          gallery_images: payload.gallery_images as unknown as Prisma.InputJsonValue,
          category: payload.category,
          secondary_tags: payload.secondary_tags,
          is_study_server: payload.is_study_server,
          primary_country: payload.primary_country,
          primary_language: payload.primary_language,
          audience_age: payload.audience_age,
          theme_preset: payload.theme_preset,
          accent_color: payload.accent_color,
          font_family: payload.font_family,
          cover_blend_mode: payload.cover_blend_mode,
          external_link_url: payload.external_link_url,
          external_link_label: payload.external_link_label,
          sections_enabled: payload.sections_enabled as unknown as Prisma.InputJsonValue,
          nsfw_confirmed: payload.nsfw_confirmed,
          status: newStatus,
          submitted_at: submit ? new Date() : existing.submitted_at,
          notification_sent_at: submit ? null : existing.notification_sent_at,
          rejection_reason: submit ? null : existing.rejection_reason,
          updated_at: new Date(),
        },
      })
      if (submit) void notifyBot(guildId, "new").catch(() => {})
      return res.status(200).json({
        listing: serializeListing(updated),
        message: submit
          ? "Re-submitted for review."
          : "Saved as draft.",
      })
    }

    // CASE C: Listing is APPROVED. Compute the diff -- if it's all
    // cosmetic, apply directly. Otherwise stash in pending_changes.
    const diff = computeDiff(existing, payload)
    if (Object.keys(diff).length === 0) {
      return res.status(200).json({
        listing: serializeListing(existing),
        message: "No changes to save.",
      })
    }

    if (isCosmeticOnlyDiff(diff)) {
      const updated = await prisma.server_listings.update({
        where: { guildid: guildId },
        data: {
          ...diff,
          updated_at: new Date(),
        },
      })
      return res.status(200).json({
        listing: serializeListing(updated),
        message: "Visual tweaks saved -- no re-approval needed.",
      })
    }

    // Substantive edit -- pending_changes stash + re-approval.
    const updated = await prisma.server_listings.update({
      where: { guildid: guildId },
      data: {
        pending_changes: diff as unknown as Prisma.InputJsonValue,
        submitted_at: submit ? new Date() : existing.submitted_at,
        notification_sent_at: submit ? null : existing.notification_sent_at,
        updated_at: new Date(),
      },
    })
    if (submit) void notifyBot(guildId, "edit").catch(() => {})
    return res.status(200).json({
      listing: serializeListing(updated),
      message: submit
        ? "Edits submitted for re-approval. Your live page stays unchanged in the meantime."
        : "Edits saved as a pending diff. Submit when you're ready for review.",
    })
  },
})

// Fire-and-forget POST to the bot's HTTP endpoint. Wrapped in a try so
// website availability is never coupled to bot availability -- the worst
// case is that a notification is missed and Ari has to look at the
// pending queue manually with `SELECT * FROM server_listings WHERE
// status='PENDING';`.
async function notifyBot(guildId: bigint, kind: "new" | "edit"): Promise<void> {
  const baseUrl = process.env.BOT_HTTP_URL
  const secret = process.env.BOT_HTTP_SHARED_SECRET
  if (!baseUrl || !secret) {
    console.warn("[server-listing] BOT_HTTP_URL or BOT_HTTP_SHARED_SECRET not set; skipping notify")
    return
  }
  try {
    await fetch(`${baseUrl.replace(/\/$/, "")}/listing/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ guildid: guildId.toString(), kind }),
    })
  } catch (err: any) {
    console.warn("[server-listing] notifyBot failed:", err?.message || err)
  }
}
