// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: "Feature Your Server" -- public profile slug validation.
//          Mirrors the storeSlug.ts pattern (shape regex + reserved
//          words + profanity blocklist + uniqueness) for the new
//          /servers/[slug] vanity URL.
//
//          The slug shape is intentionally identical to the
//          marketplace store slug so users have one mental model
//          for "vanity URLs" across the product:
//            - lowercase letters, numbers, hyphens, underscores
//            - 3..40 characters (longer than store slugs because
//              real Discord servers often have longer names like
//              "the-society-of-medical-students-uk")
//            - must start and end with letter or number
//            - no pure-numeric slugs (so we never collide with
//              Discord snowflakes if we ever change the route shape)
//
//          Uniqueness is checked against server_listings.slug.
//          The owner of an existing slug can re-save the same one
//          (no-op) without it counting as taken.
// ============================================================
import { prisma } from "@/utils/prisma"

export const LISTING_SLUG_MIN_LENGTH = 3
export const LISTING_SLUG_MAX_LENGTH = 40
export const LISTING_SLUG_REGEX = /^[a-z0-9](?:[a-z0-9_-]{1,38}[a-z0-9])?$/

const RESERVED_LISTING_SLUGS = new Set<string>([
  "me", "new", "create", "edit", "delete", "settings", "search",
  "admin", "official", "system", "lionbot", "liongotchi", "support",
  "donate", "premium", "lionheart", "shop", "store", "marketplace",
  "feature", "featured", "owner", "moderator", "developer", "ari",
  "discord", "invite", "preview", "draft", "pending", "approved",
  "rejected", "expired", "archived", "browse", "all", "popular",
  "new-servers", "recent", "trending", "directory", "list", "index",
  "api", "auth", "login", "logout", "signin", "signout", "embed",
  "robots", "sitemap", "favicon", "manifest", "static", "public",
])

const PROFANITY_PATTERNS: RegExp[] = [
  /\bn[i1]g{2,}/,
  /\bf[a@]g/,
  /\bk[i1]ke/,
  /\b(?:cunt|whore|slut)\b/,
  /\b(?:rape|nazi)/,
]

export type ListingSlugValidationCode =
  | "SHAPE"
  | "RESERVED"
  | "PROFANITY"
  | "TAKEN"

export interface ListingSlugValidationError {
  code: ListingSlugValidationCode
  message: string
}

export function validateListingSlugShape(
  slug: string,
): ListingSlugValidationError | null {
  if (slug.length < LISTING_SLUG_MIN_LENGTH) {
    return {
      code: "SHAPE",
      message: `URL must be at least ${LISTING_SLUG_MIN_LENGTH} characters.`,
    }
  }
  if (slug.length > LISTING_SLUG_MAX_LENGTH) {
    return {
      code: "SHAPE",
      message: `URL must be ${LISTING_SLUG_MAX_LENGTH} characters or fewer.`,
    }
  }
  if (!LISTING_SLUG_REGEX.test(slug)) {
    return {
      code: "SHAPE",
      message:
        "URL must be lowercase letters, numbers, hyphens, or underscores. " +
        "It must start and end with a letter or number.",
    }
  }
  if (/^[0-9]+$/.test(slug)) {
    return {
      code: "SHAPE",
      message: "URL must contain at least one letter.",
    }
  }
  return null
}

export function isReservedListingSlug(slug: string): boolean {
  return RESERVED_LISTING_SLUGS.has(slug)
}

export function isProfaneListingSlug(slug: string): boolean {
  return PROFANITY_PATTERNS.some((re) => re.test(slug))
}

/**
 * Full validation pipeline. Returns null if valid, otherwise a
 * structured error suitable for rendering inline in the dashboard
 * editor. The owner of an existing slug can re-save the same one
 * without taking it from themselves -- pass their guildid as
 * ownerGuildId for that exemption.
 */
export async function validateListingSlug(
  slug: string,
  ownerGuildId: bigint,
): Promise<ListingSlugValidationError | null> {
  const shape = validateListingSlugShape(slug)
  if (shape) return shape

  if (isReservedListingSlug(slug)) {
    return { code: "RESERVED", message: "That URL is reserved -- pick another one." }
  }
  if (isProfaneListingSlug(slug)) {
    return { code: "PROFANITY", message: "That URL isn't allowed -- pick another one." }
  }

  const existing = await prisma.server_listings.findFirst({
    where: { slug },
    select: { guildid: true },
  })
  if (existing && existing.guildid !== ownerGuildId) {
    return { code: "TAKEN", message: "That URL is already taken." }
  }

  return null
}

/**
 * Normalise a user-supplied slug to the canonical lower-cased form.
 */
export function normalizeListingSlug(raw: string | null | undefined): string {
  if (!raw) return ""
  return raw.trim().toLowerCase()
}

/**
 * Suggest a slug from a Discord guild name -- strips emoji, lowercases,
 * collapses non-alphanumeric runs into single hyphens, and trims to fit.
 * Used to pre-fill the slug field when a server admin first opens the editor.
 */
export function suggestSlugFromName(guildName: string): string {
  const stripped = guildName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, LISTING_SLUG_MAX_LENGTH)
  if (stripped.length < LISTING_SLUG_MIN_LENGTH) return ""
  return stripped
}
