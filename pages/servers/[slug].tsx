// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Public profile page at /servers/[slug] for the
//          "Feature Your Server" premium product.
//
//          Renders the admin's chosen theme + their cover image
//          blended into the page background (mirroring our
//          homepage hero pattern). Each panel is conditionally
//          rendered based on the server admin's sections_enabled
//          map -- they choose what to show. Includes JSON-LD
//          structured data for SEO and a tracked Join CTA that
//          routes through /api/servers/[slug]/join.
// ============================================================
import type { GetServerSideProps } from "next"
import Layout from "@/components/Layout/Layout"
import { NextSeo } from "next-seo"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ExternalLink, Globe, Languages, MapPin, Sparkles, Tag, Users,
  ShieldCheck, Crown, ChevronLeft, Hash, Calendar, BadgeCheck,
} from "lucide-react"
import { prisma } from "@/utils/prisma"
import { getListingPremiumStatus, verifyPreviewToken } from "@/utils/listingHelpers"
import { renderListingDescription } from "@/utils/listingMarkdown"
import {
  LISTING_THEMES, LISTING_FONTS, LISTING_CATEGORIES, LISTING_COUNTRIES,
  LISTING_LANGUAGES, LISTING_AGE_BANDS, DEFAULT_SECTIONS_ENABLED,
} from "@/constants/ServerListingData"
import { buildServerProfileSEO } from "@/constants/SeoData"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { SITE_URL } from "next-seo.config"

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
    font_family: string | null
    cover_blend_mode: string
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

function findCategory(id: string) {
  return LISTING_CATEGORIES.find((c) => c.id === id)
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
function findTheme(id: string) {
  return LISTING_THEMES.find((t) => t.id === id) ?? LISTING_THEMES[0]
}
function findFont(id: string | null) {
  if (!id) return LISTING_FONTS[0]
  return LISTING_FONTS.find((f) => f.id === id) ?? LISTING_FONTS[0]
}

export default function ServerProfilePage({
  listing,
  isPreview,
  showRenewBanner,
}: ServerProfileProps) {
  const theme = findTheme(listing.theme_preset)
  const font = findFont(listing.font_family)
  const accent = listing.accent_color || theme.defaultAccent
  const sections = { ...DEFAULT_SECTIONS_ENABLED, ...listing.sections_enabled }
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

  // Inject Google Font for the headline at runtime so we don't punish
  // every other page on the site with an unused font load.
  useEffect(() => {
    if (font.id === "inter") return // already in our base
    const id = `listing-font-${font.id}`
    if (document.getElementById(id)) return
    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`
    document.head.appendChild(link)
  }, [font])

  // Compose the cover-blend background. The base layer is the cover
  // image; the gradient layer (theme.heroGradient) sits on top to fade
  // it into the body background. "tint" mode mixes the accent colour
  // into the gradient so the cover takes on the brand colour.
  const coverBlend = useMemo(() => {
    if (!listing.cover_image_url) return ""
    const baseGradient =
      listing.cover_blend_mode === "tint"
        ? `linear-gradient(180deg, ${hexToRgba(accent, 0.35)} 0%, ${theme.bodyTint} 100%)`
        : theme.heroGradient
    return `${baseGradient}, url('${escapeCssUrl(listing.cover_image_url)}') center/cover no-repeat`
  }, [listing.cover_image_url, listing.cover_blend_mode, theme, accent])

  const themeStyleVars: React.CSSProperties = {
    // Local CSS-variable scope so we don't leak page-specific colours
    // into the rest of the website (header, footer use their own vars).
    ["--listing-bg" as any]: theme.bodyTint,
    ["--listing-card" as any]: theme.cardSurface,
    ["--listing-accent" as any]: accent,
    ["--listing-text" as any]: theme.textTone === "dark" ? "#1f2937" : "#f9fafb",
    ["--listing-muted" as any]: theme.textTone === "dark" ? "#4b5563" : "#cbd5e1",
    ["--listing-border" as any]: theme.textTone === "dark" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
    fontFamily: font.family,
  }

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

      <div
        className="listing-shell relative w-full"
        style={{
          ...themeStyleVars,
          background: "var(--listing-bg)",
          color: "var(--listing-text)",
          minHeight: "100vh",
          marginTop: "-1px",
        }}
      >
        {isPreview && (
          <div className="sticky top-0 z-30 bg-amber-500 text-amber-950 text-xs font-bold uppercase tracking-wide text-center py-1.5 shadow-md">
            Preview mode &mdash; this is what your page will look like once approved.
          </div>
        )}
        {showRenewBanner && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-sm text-center py-2 px-4">
            <Crown size={14} className="inline-block mr-1.5 -mt-0.5" />
            This server&rsquo;s premium has expired. Owner: renew to keep this listing live.
          </div>
        )}

        {/* ── HERO ──────────────────────────────────────── */}
        {sections.hero && (
          <section
            className="relative w-full"
            style={
              listing.cover_image_url
                ? { background: coverBlend, paddingTop: "clamp(140px, 24vw, 360px)" }
                : { paddingTop: "120px", background: theme.heroGradient }
            }
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16 relative z-10">
              <Link href="/servers" passHref>
                <a
                  className="inline-flex items-center gap-1.5 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity mb-6"
                  style={{ color: "var(--listing-text)" }}
                >
                  <ChevronLeft size={14} /> All servers
                </a>
              </Link>
              <div className="flex items-end gap-5 sm:gap-6">
                {listing.guild_icon_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.guild_icon_url}
                    alt=""
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 shadow-2xl flex-shrink-0"
                    style={{ borderColor: "var(--listing-card)" }}
                  />
                )}
                <div className="min-w-0">
                  <h1
                    className="font-bold leading-tight tracking-tight"
                    style={{
                      fontFamily: font.family,
                      fontSize: "clamp(2rem, 5vw, 3.25rem)",
                      color: "var(--listing-text)",
                      textShadow: listing.cover_image_url ? "0 2px 12px rgba(0,0,0,0.4)" : undefined,
                    }}
                  >
                    {listing.display_name}
                  </h1>
                  {listing.tagline && (
                    <p
                      className="mt-2 max-w-2xl"
                      style={{
                        fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
                        opacity: 0.85,
                        textShadow: listing.cover_image_url ? "0 1px 6px rgba(0,0,0,0.4)" : undefined,
                      }}
                    >
                      {listing.tagline}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                {listing.invite_code ? (
                  <a
                    href={`/api/servers/${listing.slug}/join`}
                    rel="nofollow"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
                    style={{
                      background: accent,
                      boxShadow: `0 8px 24px ${hexToRgba(accent, 0.35)}`,
                    }}
                  >
                    <Users size={16} /> Join Discord
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold opacity-60" style={{ background: theme.cardSurface }}>
                    Invite coming soon
                  </span>
                )}
                {sections.tags && category && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border"
                    style={{ background: theme.cardSurface, borderColor: "var(--listing-border)" }}
                  >
                    <span aria-hidden="true">{category.emoji}</span> {category.label}
                  </span>
                )}
                {listing.is_study_server && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border font-medium"
                    style={{
                      background: hexToRgba(accent, 0.18),
                      borderColor: hexToRgba(accent, 0.35),
                      color: "var(--listing-text)",
                    }}
                  >
                    <BadgeCheck size={14} /> Study server
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* ── MAIN COLUMN ──────────────────────────── */}
          <div className="space-y-6 sm:space-y-8 min-w-0">
            {sections.description && listing.descriptionHtml && (
              <article
                className="listing-prose rounded-2xl p-6 sm:p-8 border"
                style={{ background: "var(--listing-card)", borderColor: "var(--listing-border)" }}
              >
                <div
                  // We have a strict, allowlist-only renderer in
                  // utils/listingMarkdown.ts that escapes all input
                  // before applying any inline formatting, so this
                  // dangerouslySetInnerHTML is safe.
                  dangerouslySetInnerHTML={{ __html: listing.descriptionHtml }}
                />
              </article>
            )}

            {sections.gallery && listing.gallery_images.length > 0 && (
              <section
                className="rounded-2xl p-5 sm:p-6 border"
                style={{ background: "var(--listing-card)", borderColor: "var(--listing-border)" }}
              >
                <h2
                  className="text-sm font-semibold uppercase tracking-wide mb-4 opacity-80"
                  style={{ fontFamily: font.family }}
                >
                  Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.gallery_images.map((g, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={g.url}
                      alt={g.caption || ""}
                      className="aspect-[3/2] w-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  ))}
                </div>
              </section>
            )}

            {sections.embed_widget && (
              <section
                className="rounded-2xl p-5 sm:p-6 border"
                style={{ background: "var(--listing-card)", borderColor: "var(--listing-border)" }}
              >
                <h2
                  className="text-sm font-semibold uppercase tracking-wide mb-3 opacity-80"
                  style={{ fontFamily: font.family }}
                >
                  Embed this server card on your site
                </h2>
                <p className="text-sm opacity-70 mb-3">Copy this snippet into your blog, landing page, or wiki.</p>
                <pre
                  className="text-xs overflow-x-auto rounded-lg p-3 border font-mono"
                  style={{ background: "rgba(0,0,0,0.25)", borderColor: "var(--listing-border)" }}
                >
{`<a href="${SITE_URL}/servers/${listing.slug}" target="_blank">
  Join ${listing.display_name} on Discord
</a>`}
                </pre>
              </section>
            )}
          </div>

          {/* ── SIDEBAR ──────────────────────────────── */}
          <aside className="space-y-4">
            {sections.tags && (
              <SidebarCard title="Topics" font={font} theme={theme}>
                <div className="flex flex-wrap gap-1.5">
                  {category && (
                    <Tag2 emoji={category.emoji} label={category.label} accent={accent} />
                  )}
                  {listing.secondary_tags.map((id) => {
                    const c = findCategory(id)
                    if (!c) return null
                    return <Tag2 key={id} emoji={c.emoji} label={c.label} />
                  })}
                </div>
              </SidebarCard>
            )}

            {sections.country_language && (country || language || ageBand) && (
              <SidebarCard title="Community" font={font} theme={theme}>
                <ul className="text-sm space-y-2">
                  {country && (
                    <li className="flex items-center gap-2">
                      <MapPin size={14} className="opacity-60" />
                      <span aria-hidden="true">{country.flag}</span>
                      <span>{country.label}</span>
                    </li>
                  )}
                  {language && (
                    <li className="flex items-center gap-2">
                      <Languages size={14} className="opacity-60" />
                      <span>{language.label}</span>
                    </li>
                  )}
                  {ageBand && (
                    <li className="flex items-center gap-2">
                      <ShieldCheck size={14} className="opacity-60" />
                      <span>{ageBand.label}</span>
                    </li>
                  )}
                </ul>
              </SidebarCard>
            )}

            {sections.external_link && listing.external_link_url && (
              <SidebarCard title="Website" font={font} theme={theme}>
                {/* DoFollow link -- this is the SEO-juicy backlink. We
                    deliberately do NOT add rel="nofollow" or "ugc" here. */}
                <a
                  href={listing.external_link_url}
                  rel="dofollow noopener"
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                  style={{ color: accent }}
                >
                  <ExternalLink size={14} />
                  {listing.external_link_label || "Visit website"}
                </a>
              </SidebarCard>
            )}

            {/* --- AI-MODIFIED (2026-04-30) --- */}
            {/* Purpose: Phase 3 -- "Verified by Leo" live stats panel and */}
            {/* live voice-channel session count. Mounted only when the */}
            {/* admin opted into either section, fetches client-side so */}
            {/* the SSG payload stays cacheable. */}
            {(sections.verified_stats || sections.live_sessions) && (
              <VerifiedByLeoSidebar
                slug={listing.slug}
                accent={accent}
                font={font}
                theme={theme}
                showVerifiedStats={sections.verified_stats}
                showLiveSessions={sections.live_sessions}
              />
            )}
            {/* --- END AI-MODIFIED --- */}

            <SidebarCard title="Powered by Leo" font={font} theme={theme}>
              <p className="text-xs opacity-70 leading-relaxed">
                This is a verified premium listing on{" "}
                <Link href="/" className="underline" style={{ color: accent }}>LionBot</Link>,
                the productivity bot trusted by 70k+ Discord communities.
              </p>
              <Link href="/servers" passHref>
                <a
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                  style={{ color: accent }}
                >
                  <Globe size={12} /> Explore more servers
                </a>
              </Link>
            </SidebarCard>
          </aside>
        </div>
      </div>

      <style jsx>{`
        :global(.listing-prose) {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--listing-text);
        }
        :global(.listing-prose p) {
          margin: 0 0 1em;
        }
        :global(.listing-prose p:last-child) {
          margin-bottom: 0;
        }
        :global(.listing-prose h2) {
          font-family: ${font.family};
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.4em 0 0.6em;
          color: var(--listing-text);
        }
        :global(.listing-prose h3) {
          font-family: ${font.family};
          font-size: 1.2rem;
          font-weight: 600;
          margin: 1.2em 0 0.5em;
        }
        :global(.listing-prose ul),
        :global(.listing-prose ol) {
          margin: 0 0 1em;
          padding-left: 1.4em;
        }
        :global(.listing-prose li) {
          margin: 0.3em 0;
        }
        :global(.listing-prose blockquote) {
          margin: 1em 0;
          padding: 0.75em 1em;
          border-left: 3px solid var(--listing-accent);
          background: rgba(255,255,255,0.04);
          border-radius: 0 8px 8px 0;
          opacity: 0.9;
        }
        :global(.listing-prose code) {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.92em;
          padding: 0.15em 0.4em;
          border-radius: 4px;
          background: rgba(255,255,255,0.08);
        }
        :global(.listing-prose a) {
          color: var(--listing-accent);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        :global(.listing-prose strong) {
          color: var(--listing-text);
          font-weight: 700;
        }
      `}</style>
    </Layout>
  )
}

// ── Helpers ───────────────────────────────────────────────────

function SidebarCard({
  title,
  font,
  theme,
  children,
}: {
  title: string
  font: { family: string }
  theme: { cardSurface: string }
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl p-4 sm:p-5 border"
      style={{ background: "var(--listing-card)", borderColor: "var(--listing-border)" }}
    >
      <h2
        className="text-xs font-semibold uppercase tracking-wide mb-3 opacity-70"
        style={{ fontFamily: font.family }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Tag2({ emoji, label, accent }: { emoji?: string; label: string; accent?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border"
      style={
        accent
          ? { background: hexToRgba(accent, 0.15), borderColor: hexToRgba(accent, 0.35) }
          : { background: "rgba(255,255,255,0.05)", borderColor: "var(--listing-border)" }
      }
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {label}
    </span>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace(/^#/, "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  const r = parseInt(h.slice(0, 2), 16) || 0
  const g = parseInt(h.slice(2, 4), 16) || 0
  const b = parseInt(h.slice(4, 6), 16) || 0
  return `rgba(${r},${g},${b},${alpha})`
}

function escapeCssUrl(url: string): string {
  return url.replace(/'/g, "%27").replace(/"/g, "%22")
}

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Phase 3 -- live "Verified by Leo" stats panel. Fetches
//   /api/servers/[slug]/stats client-side so the SSG payload doesn't
//   have to revalidate every minute. Numbers come straight from
//   Leo's tracked tables (members, voice_sessions, voice_sessions_ongoing).
function VerifiedByLeoSidebar({
  slug,
  accent,
  font,
  theme,
  showVerifiedStats,
  showLiveSessions,
}: {
  slug: string
  accent: string
  font: { family: string }
  theme: { cardSurface: string }
  showVerifiedStats: boolean
  showLiveSessions: boolean
}) {
  const [stats, setStats] = useState<{
    tracked_members: number
    studied_minutes_30d: number
    active_voice_sessions: number
  } | null>(null)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/servers/${encodeURIComponent(slug)}/stats`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch(() => {
        if (!cancelled) setErrored(true)
      })
    // For live sessions we want a periodic refresh -- 60s is a good
    // tradeoff between freshness and load. We only poll while the
    // tab is visible to be a good citizen.
    let timer: number | undefined
    if (showLiveSessions) {
      timer = window.setInterval(() => {
        if (document.hidden) return
        fetch(`/api/servers/${encodeURIComponent(slug)}/stats`, { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
          .then((data) => {
            if (!cancelled) setStats(data)
          })
          .catch(() => {})
      }, 60_000)
    }
    return () => {
      cancelled = true
      if (timer) window.clearInterval(timer)
    }
  }, [slug, showLiveSessions])

  if (errored) return null

  return (
    <SidebarCard title="Verified by Leo" font={font} theme={theme}>
      <div className="space-y-3">
        {showVerifiedStats && (
          <>
            <StatRow
              label="Tracked members"
              value={stats?.tracked_members}
              accent={accent}
            />
            <StatRow
              label="Studied (30d)"
              value={stats ? formatStudyMinutes(stats.studied_minutes_30d) : undefined}
              accent={accent}
              hint="hours"
            />
          </>
        )}
        {showLiveSessions && (
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-70 inline-flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: stats && stats.active_voice_sessions > 0 ? "#22c55e" : "#6b7280",
                  boxShadow:
                    stats && stats.active_voice_sessions > 0
                      ? "0 0 0 4px rgba(34,197,94,0.18)"
                      : "none",
                }}
                aria-hidden="true"
              />
              In voice now
            </span>
            <span className="font-bold tabular-nums" style={{ color: accent }}>
              {stats ? stats.active_voice_sessions.toLocaleString() : "…"}
            </span>
          </div>
        )}
        <p className="text-[10px] opacity-50 leading-snug pt-1">
          Numbers are Leo&apos;s direct tracked data &mdash; not self-reported.
        </p>
      </div>
    </SidebarCard>
  )
}

function StatRow({
  label,
  value,
  accent,
  hint,
}: {
  label: string
  value: string | number | undefined
  accent: string
  hint?: string
}) {
  const display = value === undefined ? "…" : typeof value === "number" ? value.toLocaleString() : value
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="opacity-70">{label}</span>
      <span className="font-bold tabular-nums" style={{ color: accent }}>
        {display}
        {hint ? <span className="text-[11px] opacity-60 ml-1">{hint}</span> : null}
      </span>
    </div>
  )
}

function formatStudyMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = minutes / 60
  if (hours < 1000) return `${hours.toFixed(hours < 10 ? 1 : 0)}h`
  return `${(hours / 1000).toFixed(1)}k h`
}
// --- END AI-MODIFIED ---

// ── Server-side fetch ─────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<ServerProfileProps> = async (ctx) => {
  const slug = String(ctx.params?.slug ?? "").toLowerCase().trim()
  if (!slug) return { notFound: true }

  const previewToken = typeof ctx.query.preview === "string" ? ctx.query.preview : null
  const isValidPreview = !!previewToken && verifyPreviewToken(slug, previewToken)

  const listing = await prisma.server_listings.findUnique({
    where: { slug },
  })
  if (!listing) return { notFound: true }

  const premium = await getListingPremiumStatus(listing.guildid)

  // Visibility rules:
  //  - APPROVED + premium active   → show normally
  //  - APPROVED + grace period     → show with renew banner
  //  - APPROVED + grace expired    → 410-style: notFound
  //  - EXPIRED  + grace expired    → notFound (DB cron will mark ARCHIVED)
  //  - Anything else (DRAFT/PENDING/REJECTED/EXPIRED-in-grace/ARCHIVED) →
  //    only visible with a valid preview token
  const isPubliclyVisible =
    listing.status === "APPROVED" &&
    (premium.isPremium || premium.inGracePeriod)
  if (!isPubliclyVisible && !isValidPreview) {
    return { notFound: true }
  }

  // Set 410 Gone for grace-expired listings to nudge search engines
  // to drop the URL.
  if (
    !isPubliclyVisible &&
    !isValidPreview &&
    listing.status === "APPROVED" &&
    premium.graceExpired
  ) {
    ctx.res.statusCode = 410
  }

  // Increment view counter (only for non-preview, real visits).
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

  // When previewing, merge pending_changes on top of the live row so
  // Ari sees what the post-approval page will look like.
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
        font_family: viewListing.font_family ?? null,
        cover_blend_mode: viewListing.cover_blend_mode ?? "fade",
        invite_code: viewListing.invite_code ?? null,
        external_link_url: viewListing.external_link_url ?? null,
        external_link_label: viewListing.external_link_label ?? null,
        sections_enabled: (viewListing.sections_enabled ?? DEFAULT_SECTIONS_ENABLED) as Record<string, boolean>,
        approved_at: viewListing.approved_at ? viewListing.approved_at.toISOString() : null,
      },
    },
  }
}
