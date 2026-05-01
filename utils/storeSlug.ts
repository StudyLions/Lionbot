// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 Phase 3 -- vanity store slug validation
//          and reservation. A slug is a lowercase, hyphen-and-
//          underscore-only handle (3..30 chars) that the seller
//          chooses for their personal store URL:
//
//             /pet/marketplace/store/{slug}
//
//          Validation passes:
//            1. shape regex
//            2. reserved-word blocklist (don't shadow real routes
//               like "customize", "me", or numeric IDs)
//            3. profanity blocklist (a small, conservative list --
//               we are not trying to be exhaustive, just to keep
//               the obvious stuff out of public URLs)
//            4. uniqueness in the database
//
//          Numeric strings are deliberately excluded so the slug
//          handler can never collide with the Discord-snowflake
//          handler in /pet/marketplace/store/[id].
// ============================================================
import { prisma } from "@/utils/prisma"

export const SLUG_MIN_LENGTH = 3
export const SLUG_MAX_LENGTH = 30
export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])?$/

// Names we reserve so they can never be a vanity URL. Includes:
// - existing route segments under /pet/marketplace/store/
// - generic words people would expect to "just work" as system pages
// - admin-flavored words to avoid impersonation-via-URL
const RESERVED_SLUGS = new Set<string>([
  "me", "customize", "settings", "admin", "official", "system",
  "lionbot", "liongotchi", "support", "donate", "premium", "lionheart",
  "shop", "store", "marketplace", "sell", "buy", "cancel", "search",
  "wiki", "items", "feature", "featured", "new", "create", "edit",
  "delete", "owner", "moderator", "developer", "ari",
])

// Conservative profanity list -- we are NOT trying to filter every variant
// or every language; we are trying to keep the most obvious slurs out of
// public URLs. Anything questionable can be reported through normal moderation.
const PROFANITY_PATTERNS: RegExp[] = [
  /\bn[i1]g{2,}/,
  /\bf[a@]g/,
  /\bk[i1]ke/,
  /\b(?:cunt|whore|slut)\b/,
  /\b(?:rape|nazi)/,
  // Catch substring matches of the absolute worst slurs even when joined
  // with separators (e.g. "n_i_g..."). Tightening this further is a job
  // for a real moderation service, not a regex.
]

export type SlugValidationCode =
  | "SHAPE"
  | "RESERVED"
  | "PROFANITY"
  | "TAKEN"

export interface SlugValidationError {
  code: SlugValidationCode
  message: string
}

export function validateSlugShape(slug: string): SlugValidationError | null {
  if (slug.length < SLUG_MIN_LENGTH) {
    return { code: "SHAPE", message: `Slug must be at least ${SLUG_MIN_LENGTH} characters.` }
  }
  if (slug.length > SLUG_MAX_LENGTH) {
    return { code: "SHAPE", message: `Slug must be ${SLUG_MAX_LENGTH} characters or fewer.` }
  }
  if (!SLUG_REGEX.test(slug)) {
    return {
      code: "SHAPE",
      message:
        "Slug must be lowercase letters, numbers, hyphens, or underscores. " +
        "It must start and end with a letter or number.",
    }
  }
  // Block all-numeric slugs so /pet/marketplace/store/{slug} never collides
  // with the Discord snowflake [id] route at the same URL prefix.
  if (/^[0-9]+$/.test(slug)) {
    return {
      code: "SHAPE",
      message: "Slug must contain at least one letter -- pure numbers conflict with Discord IDs.",
    }
  }
  return null
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug)
}

export function isProfaneSlug(slug: string): boolean {
  return PROFANITY_PATTERNS.some((re) => re.test(slug))
}

/**
 * Full validation pipeline. Returns null if valid, otherwise a structured
 * SlugValidationError that callers can surface in the UI without leaking
 * which exact word was matched (we don't tell users "the profanity filter
 * caught XYZ" because that's an invitation to refine workarounds).
 */
export async function validateSlug(
  slug: string,
  ownerUserId: bigint,
): Promise<SlugValidationError | null> {
  const shape = validateSlugShape(slug)
  if (shape) return shape

  if (isReservedSlug(slug)) {
    return { code: "RESERVED", message: "That slug is reserved -- pick another one." }
  }
  if (isProfaneSlug(slug)) {
    return { code: "PROFANITY", message: "That slug isn't allowed -- pick another one." }
  }

  // Uniqueness -- look up by exact slug. Lower-cased so case-only collisions
  // aren't possible. Owner can re-save the same slug they already own
  // without taking it from themselves.
  const existing = await prisma.lg_user_stores.findFirst({
    where: { slug },
    select: { userid: true },
  })
  if (existing && existing.userid !== ownerUserId) {
    return { code: "TAKEN", message: "That slug is already in use." }
  }

  return null
}

/**
 * Normalize a user-supplied slug to the canonical lower-cased form.
 * Useful for both the validator and slug-resolver path.
 */
export function normalizeSlug(raw: string | null | undefined): string {
  if (!raw) return ""
  return raw.trim().toLowerCase()
}
