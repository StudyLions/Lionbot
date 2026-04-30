// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Public directory at /servers -- browse all approved
//          premium server profiles. SSG with 5-minute ISR so
//          newly-approved listings appear in roughly-real-time
//          but every visitor still gets a fully pre-rendered
//          page Google can index.
//
//          Filters (category, language, study-only) are
//          client-side only -- the dataset is small enough
//          for that to be both faster and more responsive than
//          round-tripping to the API on every keystroke.
// ============================================================
import type { GetStaticProps } from "next"
import Layout from "@/components/Layout/Layout"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  Search, Sparkles, MapPin, Languages as LangIcon, Globe,
  Filter, BookOpen, Crown, X, ChevronRight,
} from "lucide-react"
import { fetchDirectoryListings, type DirectoryListing } from "@/utils/listingDirectory"
import {
  LISTING_CATEGORIES, LISTING_LANGUAGES, LISTING_COUNTRIES, LISTING_THEMES,
} from "@/constants/ServerListingData"
import { ServersDirectorySEO } from "@/constants/SeoData"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { SITE_URL } from "next-seo.config"

interface ServersIndexProps {
  listings: DirectoryListing[]
}

const ALL_CATEGORY = { id: "all", label: "All categories", emoji: "🌐" }

export default function ServersIndexPage({ listings }: ServersIndexProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [language, setLanguage] = useState<string>("all")
  const [studyOnly, setStudyOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const promoted = useMemo(
    () => listings.filter((l) => l.promoted_until !== null),
    [listings],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return listings.filter((l) => {
      if (category !== "all" && l.category !== category && !l.secondary_tags.includes(category)) {
        return false
      }
      if (language !== "all" && l.primary_language !== language) return false
      if (studyOnly && !l.is_study_server) return false
      if (q && !`${l.display_name} ${l.tagline ?? ""}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [listings, query, category, language, studyOnly])

  const hasFilters = category !== "all" || language !== "all" || studyOnly || query.length > 0
  const clearFilters = () => {
    setQuery("")
    setCategory("all")
    setLanguage("all")
    setStudyOnly(false)
  }

  const collectionJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: ServersDirectorySEO.title,
    description: ServersDirectorySEO.description,
    url: `${SITE_URL}/servers`,
    hasPart: filtered.slice(0, 30).map((l) => ({
      "@type": "Organization",
      name: l.display_name,
      description: l.tagline || undefined,
      url: `${SITE_URL}/servers/${l.slug}`,
      ...(l.guild_icon_url ? { logo: l.guild_icon_url } : {}),
    })),
  }), [filtered])

  return (
    <Layout SEO={ServersDirectorySEO}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* Hero */}
      <section className="relative pt-28 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_circle_at_50%_-10%,_rgba(59,130,246,0.15),_transparent_60%)]" />
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary uppercase tracking-wider mb-5">
            <Sparkles size={12} /> Premium server directory
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Discover Discord communities <span className="text-primary">worth joining</span>.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Hand-curated study servers, focus communities, and language exchanges &mdash; all verified premium Discords running on LionBot.
          </p>
          <div className="mt-8 max-w-2xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, tagline, or topic..."
              className="w-full pl-11 pr-4 py-3.5 bg-card border border-border rounded-xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent shadow-lg shadow-black/10"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link href="/dashboard/servers" passHref>
              <a className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-sm font-medium text-amber-300 hover:bg-amber-500/15 transition-colors">
                <Crown size={14} /> List your server
                <ChevronRight size={14} />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Promoted carousel */}
      {promoted.length > 0 && !hasFilters && (
        <section className="max-w-6xl mx-auto px-4 mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <Crown size={14} /> Promoted right now
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scroll-smooth">
            {promoted.map((l) => (
              <PromotedCard key={l.slug} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Main grid: filters + cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20 grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Filters */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="lg:hidden w-full mb-3 inline-flex items-center justify-between gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium text-foreground"
          >
            <span className="inline-flex items-center gap-2"><Filter size={14} /> Filters</span>
            <span className="text-xs text-muted-foreground">{filtered.length} of {listings.length}</span>
          </button>
          <div className={`${filtersOpen ? "block" : "hidden lg:block"} bg-card/50 border border-border rounded-xl p-4 space-y-5`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filters</h2>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
            <FilterSection title="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={ALL_CATEGORY.id}>{ALL_CATEGORY.label}</option>
                {LISTING_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </FilterSection>
            <FilterSection title="Language">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Any language</option>
                {LISTING_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </FilterSection>
            <FilterSection title="Vibe">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={studyOnly}
                  onChange={(e) => setStudyOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <BookOpen size={14} className="text-muted-foreground" />
                Study servers only
              </label>
            </FilterSection>
          </div>
        </aside>

        {/* Cards */}
        <div>
          <div className="hidden lg:flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length === listings.length
                ? `${listings.length} server${listings.length === 1 ? "" : "s"}`
                : `${filtered.length} of ${listings.length} servers`}
            </p>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-xl">
              <Globe size={36} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-foreground font-medium">No servers match those filters yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Try widening the search or clearing your filters.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((l) => (
                <ServerCard key={l.slug} listing={l} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}

// ── Sub-components ────────────────────────────────────────────

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{title}</label>
      {children}
    </div>
  )
}

function ServerCard({ listing }: { listing: DirectoryListing }) {
  const theme = LISTING_THEMES.find((t) => t.id === listing.theme_preset) ?? LISTING_THEMES[0]
  const accent = listing.accent_color || theme.defaultAccent
  const category = LISTING_CATEGORIES.find((c) => c.id === listing.category)
  const country = listing.primary_country
    ? LISTING_COUNTRIES.find((c) => c.id === listing.primary_country)
    : null
  const language = listing.primary_language
    ? LISTING_LANGUAGES.find((l) => l.id === listing.primary_language)
    : null

  return (
    <Link href={`/servers/${listing.slug}`} passHref>
      <a className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-black/20">
      <div
        className="h-28 sm:h-32 relative"
        style={
          listing.cover_image_url
            ? {
                background: `linear-gradient(180deg, transparent 0%, hsl(0 0% 0% / 0.45) 100%), url('${escapeCssUrl(listing.cover_image_url)}') center/cover no-repeat`,
              }
            : { background: theme.heroGradient + ", " + theme.bodyTint }
        }
      >
        {listing.promoted_until && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-amber-950 text-[10px] font-bold uppercase tracking-wide">
            <Crown size={10} /> Promoted
          </span>
        )}
        {listing.is_study_server && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-medium backdrop-blur-sm">
            <BookOpen size={10} /> Study
          </span>
        )}
      </div>
      <div className="p-4 -mt-8 relative">
        <div className="flex items-start gap-3">
          {listing.guild_icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.guild_icon_url}
              alt=""
              className="w-12 h-12 rounded-xl border-2 border-card flex-shrink-0 shadow-md"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-xl border-2 border-card flex-shrink-0 shadow-md flex items-center justify-center font-bold text-white"
              style={{ background: accent }}
            >
              {listing.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 pt-2">
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {listing.display_name}
            </h3>
            {category && (
              <p className="text-xs text-muted-foreground mt-0.5">
                <span aria-hidden="true">{category.emoji}</span> {category.label}
              </p>
            )}
          </div>
        </div>
        {listing.tagline && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{listing.tagline}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          {country && (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">{country.flag}</span>
              {country.label}
            </span>
          )}
          {language && (
            <span className="inline-flex items-center gap-1">
              <LangIcon size={11} /> {language.label}
            </span>
          )}
        </div>
      </div>
      </a>
    </Link>
  )
}

function PromotedCard({ listing }: { listing: DirectoryListing }) {
  const theme = LISTING_THEMES.find((t) => t.id === listing.theme_preset) ?? LISTING_THEMES[0]
  const accent = listing.accent_color || theme.defaultAccent
  return (
    <Link href={`/servers/${listing.slug}`} passHref>
      <a
        className="snap-start flex-shrink-0 w-72 sm:w-80 rounded-xl overflow-hidden border-2 group"
        style={{ borderColor: accent }}
      >
      <div
        className="h-24 relative"
        style={
          listing.cover_image_url
            ? {
                background: `linear-gradient(180deg, transparent 0%, hsl(0 0% 0% / 0.55) 100%), url('${escapeCssUrl(listing.cover_image_url)}') center/cover no-repeat`,
              }
            : { background: theme.heroGradient + ", " + theme.bodyTint }
        }
      >
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-amber-950 text-[10px] font-bold uppercase tracking-wide">
          <Crown size={10} /> Promoted
        </span>
      </div>
      <div className="p-3.5 bg-card">
        <div className="flex items-center gap-2.5">
          {listing.guild_icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.guild_icon_url} alt="" className="w-9 h-9 rounded-lg border border-border" />
          ) : (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: accent }}
            >
              {listing.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {listing.display_name}
            </p>
            {listing.tagline && (
              <p className="text-xs text-muted-foreground truncate">{listing.tagline}</p>
            )}
          </div>
        </div>
      </div>
      </a>
    </Link>
  )
}

function escapeCssUrl(url: string): string {
  return url.replace(/'/g, "%27").replace(/"/g, "%22")
}

// ── Static generation w/ ISR ──────────────────────────────────

export const getStaticProps: GetStaticProps<ServersIndexProps> = async ({ locale }) => {
  let listings: DirectoryListing[] = []
  try {
    listings = await fetchDirectoryListings()
  } catch (err) {
    // If the DB hiccups during build, render an empty state rather than 500.
    console.warn("[servers/index] fetch failed, rendering empty page:", err)
  }
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
      listings,
    },
    revalidate: 300,
  }
}
