// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Updated: 2026-04-30 (editorial redesign)
// Purpose: Public profile page at /servers/[slug] for the
//          "Feature Your Server" premium product.
//
//          v2 (editorial redesign): the page now reads like a
//          magazine feature, not a stack of cards. Layout flows
//          full-bleed hero -> drop-cap article body -> pull-quote
//          stats -> photo essay -> colophon. The 5 sidebar cards
//          are gone; their content is woven into the article. The
//          embed snippet has moved into the dashboard editor.
//
//          Theme + accent + typography are driven by the
//          EditorialThemeProvider so this file stays focused on
//          orchestration -- it doesn't pick fonts or colours
//          directly anymore.
// ============================================================
import type { GetServerSideProps } from "next"
import Layout from "@/components/Layout/Layout"
import { NextSeo } from "next-seo"
import { useMemo } from "react"
import { Crown } from "lucide-react"
import { prisma } from "@/utils/prisma"
import { getListingPremiumStatus, verifyPreviewToken } from "@/utils/listingHelpers"
import { renderListingDescription } from "@/utils/listingMarkdown"
import {
  LISTING_CATEGORIES,
  LISTING_COUNTRIES,
  LISTING_LANGUAGES,
  LISTING_AGE_BANDS,
  DEFAULT_SECTIONS_ENABLED,
  resolveTheme,
  normalizeSections,
} from "@/constants/ServerListingData"
import { SERVERS_DIRECTORY_ENABLED } from "@/constants/FeatureFlags"
import { buildServerProfileSEO } from "@/constants/SeoData"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { SITE_URL } from "next-seo.config"

import EditorialThemeProvider from "@/components/listing/EditorialThemeProvider"
import EditorialHero from "@/components/listing/EditorialHero"
import EditorialArticle from "@/components/listing/EditorialArticle"
import PullQuoteStats from "@/components/listing/PullQuoteStats"
import PhotoEssay from "@/components/listing/PhotoEssay"
import Colophon from "@/components/listing/Colophon"

interface ServerProfileProps {
  listing: {
    slug: string
    display_name: string
    tagline: string | null
    description: string
    descriptionHtml: string
    cover_image_url: string | null
    guild_icon_url: string | null
    gallery_images: { url: string; caption?: string }[]
    category: string
    secondary_tags: string[]
    is_study_server: boolean
    primary_country: string | null
    primary_language: string | null
    audience_age: string | null
    theme_preset: string
    accent_color: string | null
    invite_code: string | null
    external_link_url: string | null
    external_link_label: string | null
    sections_enabled: Record<string, boolean>
    approved_at: string | null
  }
  isPreview: boolean
  isPremium: boolean
  inGracePeriod: boolean
  graceDaysRemaining: number
  showRenewBanner: boolean
}

// ── Lookup helpers ─────────────────────────────────────────────

function findCategory(id: string) {
  return LISTING_CATEGORIES.find((c) => c.id === id) ?? null
}
function findCountry(id: string | null) {
  if (!id) return null
  return LISTING_COUNTRIES.find((c) => c.id === id) ?? null
}
function findLanguage(id: string | null) {
  if (!id) return null
  return LISTING_LANGUAGES.find((l) => l.id === id) ?? null
}
function findAgeBand(id: string | null) {
  if (!id) return null
  return LISTING_AGE_BANDS.find((a) => a.id === id) ?? null
}

// ── Page ──────────────────────────────────────────────────────

export default function ServerProfilePage({
  listing,
  isPreview,
  showRenewBanner,
}: ServerProfileProps) {
  const theme = resolveTheme(listing.theme_preset)
  const accent = listing.accent_color || theme.defaultAccent
  const sections = normalizeSections(listing.sections_enabled)

  const category = findCategory(listing.category)
  const country = findCountry(listing.primary_country)
  const language = findLanguage(listing.primary_language)
  const ageBand = findAgeBand(listing.audience_age)

  const seo = buildServerProfileSEO({
    slug: listing.slug,
    displayName: listing.display_name,
    tagline: listing.tagline,
    description: listing.description,
    coverImageUrl: listing.cover_image_url,
  })

  // Kicker fragments shown above the headline. We deliberately keep
  // this short (3 items max) so it reads like a magazine deck and
  // doesn't degrade into a tag soup. Order is intentional: editorial
  // status first, then category, then audience signal.
  const kicker: string[] = useMemo(() => {
    const k: string[] = ["FEATURED"]
    if (category) k.push(category.label)
    if (listing.is_study_server) k.push("STUDY")
    else if (ageBand) k.push(ageBand.id)
    return k.slice(0, 3)
  }, [category, listing.is_study_server, ageBand])

  // Per-theme kicker label gets a tiny "Vol." motif on Vogue.
  const issueNumber =
    theme.id === "vogue"
      ? `Vol. I — Issue ${(listing.slug.length % 12) + 1}`
      : undefined

  // Meta-line text that appears below the article body, in place of
  // the country/language sidebar card. Compact, editorial.
  const metaLine: string[] = []
  if (category) metaLine.push(category.label)
  for (const tagId of listing.secondary_tags) {
    const c = findCategory(tagId)
    if (c) metaLine.push(c.label)
  }
  if (country) metaLine.push(`${country.flag} ${country.label}`)
  if (language) metaLine.push(language.label)
  if (ageBand) metaLine.push(ageBand.label)

  const jsonLd = useMemo(() => {
    const tags = [category?.label, ...(listing.secondary_tags
      .map((t) => findCategory(t)?.label)
      .filter(Boolean))].filter(Boolean) as string[]
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: listing.display_name,
      description: listing.tagline || listing.description.slice(0, 200),
      url: `${SITE_URL}/servers/${listing.slug}`,
      ...(listing.guild_icon_url ? { logo: listing.guild_icon_url } : {}),
      ...(listing.cover_image_url ? { image: listing.cover_image_url } : {}),
      ...(listing.invite_code ? { sameAs: [`https://discord.gg/${listing.invite_code}`] } : {}),
      ...(country ? { areaServed: country.label } : {}),
      ...(language ? { knowsLanguage: language.label } : {}),
      keywords: tags.join(", "),
    }
  }, [listing, category, country, language])

  const breadcrumbsLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Servers", item: `${SITE_URL}/servers` },
      { "@type": "ListItem", position: 2, name: listing.display_name, item: `${SITE_URL}/servers/${listing.slug}` },
    ],
  }), [listing.display_name, listing.slug])

  return (
    <Layout SEO={seo}>
      <NextSeo
        title={seo.title}
        description={seo.description}
        canonical={seo.canonical}
        openGraph={seo.openGraph}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />

      <EditorialThemeProvider
        themeId={listing.theme_preset}
        accentOverride={listing.accent_color}
        style={{
          minHeight: "100vh",
          background: "var(--listing-bg)",
          color: "var(--listing-text)",
          marginTop: "-1px",
        }}
      >
        {isPreview && (
          <div
            className="sticky top-0 z-30 text-center text-xs font-bold uppercase tracking-[0.18em] py-2 px-4 shadow-md"
            style={{
              background: "#f59e0b",
              color: "#1c1300",
              fontFamily: "var(--listing-body-font)",
            }}
          >
            Preview mode — this is what your page will look like once approved.
          </div>
        )}
        {showRenewBanner && (
          <div
            className="text-sm text-center py-2.5 px-4"
            style={{
              background: "rgba(245, 158, 11, 0.12)",
              borderBottom: "1px solid rgba(245, 158, 11, 0.32)",
              color: theme.bodyText,
              fontFamily: "var(--listing-body-font)",
            }}
          >
            <Crown size={14} className="inline-block mr-1.5 -mt-0.5" />
            This server&rsquo;s premium has expired. Owner: renew to keep this listing live.
          </div>
        )}

        {sections.hero && (
          <EditorialHero
            theme={theme}
            accent={accent}
            displayName={listing.display_name}
            tagline={listing.tagline}
            guildIconUrl={listing.guild_icon_url}
            coverImageUrl={listing.cover_image_url}
            kicker={kicker}
            inviteSlug={listing.invite_code ? listing.slug : null}
            inVoiceCount={null}
            issueNumber={issueNumber}
            approvedAt={listing.approved_at}
          />
        )}

        {sections.description && listing.descriptionHtml && (
          <EditorialArticle
            theme={theme}
            accent={accent}
            descriptionHtml={listing.descriptionHtml}
          />
        )}

        {/* The meta-line replaces the old country/language + tags sidebar
            cards. It's a single typographic line under the article body,
            visually unobtrusive but search-engine-friendly. */}
        {metaLine.length > 0 && (
          <div
            className="text-center"
            style={{
              maxWidth: "min(900px, 92vw)",
              margin: "0 auto",
              padding: "clamp(8px, 2vh, 24px) clamp(20px, 5vw, 40px) 0",
              fontFamily: "var(--listing-body-font)",
              fontSize: "0.78rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--listing-muted)",
            }}
          >
            {metaLine.join("   ·   ")}
          </div>
        )}

        {sections.stats && (
          <PullQuoteStats
            theme={theme}
            accent={accent}
            slug={listing.slug}
            showLive={true}
          />
        )}

        {sections.gallery && listing.gallery_images.length > 0 && (
          <PhotoEssay theme={theme} accent={accent} images={listing.gallery_images} />
        )}

        <Colophon
          theme={theme}
          accent={accent}
          slug={listing.slug}
          approvedAt={listing.approved_at}
          externalLinkUrl={sections.external_link ? listing.external_link_url : null}
          externalLinkLabel={listing.external_link_label}
        />
      </EditorialThemeProvider>
    </Layout>
  )
}

// ── Server-side fetch ─────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<ServerProfileProps> = async (ctx) => {
  // Feature gate -- see constants/FeatureFlags.ts. Returning notFound
  // here also blocks the ?preview=TOKEN flow on purpose (we don't want
  // any /servers/* URL to render while the feature is hidden).
  if (!SERVERS_DIRECTORY_ENABLED) {
    return { notFound: true }
  }

  const slug = String(ctx.params?.slug ?? "").toLowerCase().trim()
  if (!slug) return { notFound: true }

  const previewToken = typeof ctx.query.preview === "string" ? ctx.query.preview : null
  const isValidPreview = !!previewToken && verifyPreviewToken(slug, previewToken)

  const listing = await prisma.server_listings.findUnique({
    where: { slug },
  })
  if (!listing) return { notFound: true }

  const premium = await getListingPremiumStatus(listing.guildid)

  const isPubliclyVisible =
    listing.status === "APPROVED" &&
    (premium.isPremium || premium.inGracePeriod)
  if (!isPubliclyVisible && !isValidPreview) {
    return { notFound: true }
  }

  if (
    !isPubliclyVisible &&
    !isValidPreview &&
    listing.status === "APPROVED" &&
    premium.graceExpired
  ) {
    ctx.res.statusCode = 410
  }

  if (!isValidPreview && isPubliclyVisible) {
    void prisma.$transaction([
      prisma.server_listings.update({
        where: { guildid: listing.guildid },
        data: { view_count: { increment: 1 } },
      }),
      prisma.server_listing_analytics.create({
        data: {
          guildid: listing.guildid,
          event_type: "view",
          referrer: (ctx.req.headers.referer || "").slice(0, 500) || null,
          country: ((ctx.req.headers["x-vercel-ip-country"] as string) || "").slice(0, 8) || null,
        },
      }),
    ]).catch(() => {/* swallow */})
  }

  let viewListing: any = listing
  if (isValidPreview && listing.pending_changes) {
    viewListing = { ...listing, ...(listing.pending_changes as Record<string, any>) }
  }

  return {
    props: {
      ...(await serverSideTranslations(ctx.locale ?? "en", ["common"])),
      isPreview: isValidPreview,
      isPremium: premium.isPremium,
      inGracePeriod: premium.inGracePeriod,
      graceDaysRemaining: premium.graceDaysRemaining,
      showRenewBanner: !isValidPreview && premium.inGracePeriod && !premium.isPremium,
      listing: {
        slug: viewListing.slug,
        display_name: viewListing.display_name,
        tagline: viewListing.tagline ?? null,
        description: viewListing.description ?? "",
        descriptionHtml: renderListingDescription(viewListing.description ?? ""),
        cover_image_url: viewListing.cover_image_url ?? null,
        guild_icon_url: viewListing.guild_icon_url ?? null,
        gallery_images: (viewListing.gallery_images ?? []) as { url: string; caption?: string }[],
        category: viewListing.category,
        secondary_tags: viewListing.secondary_tags ?? [],
        is_study_server: viewListing.is_study_server,
        primary_country: viewListing.primary_country ?? null,
        primary_language: viewListing.primary_language ?? null,
        audience_age: viewListing.audience_age ?? null,
        theme_preset: viewListing.theme_preset,
        accent_color: viewListing.accent_color ?? null,
        invite_code: viewListing.invite_code ?? null,
        external_link_url: viewListing.external_link_url ?? null,
        external_link_label: viewListing.external_link_label ?? null,
        sections_enabled: (viewListing.sections_enabled ?? DEFAULT_SECTIONS_ENABLED) as Record<string, boolean>,
        approved_at: viewListing.approved_at ? viewListing.approved_at.toISOString() : null,
      },
    },
  }
}
