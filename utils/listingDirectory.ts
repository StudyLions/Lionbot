// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Server-side fetch helper for the public /servers
//          directory. Lives outside pages/api/ so it can be
//          imported by both the API route AND the directory
//          page's getStaticProps without Next.js complaining
//          about cross-imports.
//
//          Returns only listings whose guild is currently
//          premium. Sorted with promoted servers first, then
//          by approved_at desc.
// ============================================================
import { prisma } from "./prisma"

export interface DirectoryListing {
  slug: string
  display_name: string
  tagline: string | null
  cover_image_url: string | null
  guild_icon_url: string | null
  category: string
  secondary_tags: string[]
  is_study_server: boolean
  primary_country: string | null
  primary_language: string | null
  audience_age: string | null
  theme_preset: string
  accent_color: string | null
  approved_at: string | null
  promoted_until: string | null
  view_count: number
  member_count: number | null
}

export async function fetchDirectoryListings(): Promise<DirectoryListing[]> {
  const now = new Date()
  const rows = await prisma.server_listings.findMany({
    where: {
      status: "APPROVED",
      guild_config: {
        premium_guilds: {
          premium_until: { gt: now },
        },
      },
    },
    orderBy: [
      { promoted_until: "desc" },
      { approved_at: "desc" },
    ],
    take: 500,
    include: {
      guild_config: { select: { name: true } },
    },
  })

  return rows.map((r) => ({
    slug: r.slug,
    display_name: r.display_name,
    tagline: r.tagline,
    cover_image_url: r.cover_image_url,
    guild_icon_url: r.guild_icon_url,
    category: r.category,
    secondary_tags: r.secondary_tags ?? [],
    is_study_server: r.is_study_server,
    primary_country: r.primary_country,
    primary_language: r.primary_language,
    audience_age: r.audience_age,
    theme_preset: r.theme_preset,
    accent_color: r.accent_color,
    approved_at: r.approved_at?.toISOString() ?? null,
    promoted_until:
      r.promoted_until && r.promoted_until > now ? r.promoted_until.toISOString() : null,
    view_count: r.view_count,
    member_count: null,
  }))
}

/**
 * Lightweight slug-only fetch used by next-sitemap to enumerate every
 * approved server URL for inclusion in /sitemap.xml.
 */
export async function fetchApprovedListingSlugs(): Promise<{ slug: string; updated: Date | null }[]> {
  const now = new Date()
  const rows = await prisma.server_listings.findMany({
    where: {
      status: "APPROVED",
      guild_config: {
        premium_guilds: {
          premium_until: { gt: now },
        },
      },
    },
    select: { slug: true, updated_at: true, approved_at: true },
    take: 5000,
  })
  return rows.map((r) => ({ slug: r.slug, updated: r.updated_at ?? r.approved_at ?? null }))
}
