// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Updated: 2026-05-01 (dark-only palette)
// Purpose: Public directory at /servers -- browse all approved
//          premium server profiles. SSG with 5-minute ISR so
//          newly-approved listings appear in roughly-real-time
//          but every visitor still gets a fully pre-rendered
//          page Google can index.
//
//          Editorial layout: magazine masthead, single "Featured
//          this week" cover story, then a hairline-separated
//          table-of-contents listing. Filters live in a single
//          horizontal row of chip tabs above the TOC -- no left
//          sidebar. Reads like a magazine contents page, not a
//          card grid.
//
//          Tokens here are hardcoded to the Atlantic-dark palette
//          (warm near-black + cream + lifted burgundy accent) to
//          stay flush with the rest of lionbot.org's dark theme.
// ============================================================
import type { GetStaticProps } from "next"
import Head from "next/head"
import Layout from "@/components/Layout/Layout"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Search, ChevronRight } from "lucide-react"
import { fetchDirectoryListings, type DirectoryListing } from "@/utils/listingDirectory"
import {
  LISTING_CATEGORIES, LISTING_LANGUAGES, LISTING_COUNTRIES,
  resolveTheme,
} from "@/constants/ServerListingData"
import { SERVERS_DIRECTORY_ENABLED } from "@/constants/FeatureFlags"
import { ServersDirectorySEO } from "@/constants/SeoData"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { SITE_URL } from "next-seo.config"

interface ServersIndexProps {
  listings: DirectoryListing[]
}

// Macro category groupings used by the chip-tab filter row. Each chip
// matches multiple primary/secondary tag IDs so admins don't have to
// hunt through 40 categories at the top of the page. "all" + 5 chips
// keeps the row readable on mobile without horizontal scroll.
const SECTION_TABS: { id: string; label: string; matches: Set<string> }[] = [
  { id: "all", label: "All", matches: new Set() },
  {
    id: "study",
    label: "Study",
    matches: new Set([
      "study", "math", "science", "coding", "engineering",
      "medicine", "law", "business", "arts", "music", "writing",
      "philosophy", "history", "psychology", "creative-writing",
    ]),
  },
  {
    id: "tech",
    label: "Tech & AI",
    matches: new Set(["coding", "ai-ml", "engineering"]),
  },
  {
    id: "languages",
    label: "Languages",
    matches: new Set(["language-learning", "international"]),
  },
  {
    id: "test-prep",
    label: "Test prep",
    matches: new Set(["sat-act", "ib", "a-levels", "gcse", "ap", "gre-gmat", "lsat", "mcat"]),
  },
  {
    id: "community",
    label: "Community",
    matches: new Set([
      "high-school", "university", "graduate", "professional",
      "lgbtq-friendly", "neurodivergent", "international",
      "fitness", "mindfulness", "self-improvement", "reading",
      "gaming", "anime-manga", "chess",
    ]),
  },
]

function listingMatchesTab(l: DirectoryListing, tabId: string): boolean {
  if (tabId === "all") return true
  const tab = SECTION_TABS.find((t) => t.id === tabId)
  if (!tab) return true
  if (tab.matches.has(l.category)) return true
  return l.secondary_tags.some((t) => tab.matches.has(t))
}

export default function ServersIndexPage({ listings }: ServersIndexProps) {
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<string>("all")

  // Pick a single "Featured this week" story: first promoted listing
  // if any, else the most recently approved with a cover image. The
  // cover-story slot is the editorial spine of the page so we want
  // it visually strong every time -- never an iconless server.
  const featured = useMemo(() => {
    const promoted = listings.find((l) => l.promoted_until !== null && l.cover_image_url)
    if (promoted) return promoted
    const withCover = listings.find((l) => l.cover_image_url)
    if (withCover) return withCover
    return listings[0] ?? null
  }, [listings])

  // The "rest" of the listings (everything except the featured one).
  // Filtered by the active tab + freeform search. Featured one stays
  // pinned to the cover-story slot regardless of filters so the page
  // never collapses to a search-result-list aesthetic.
  const rest = useMemo(() => {
    const q = query.trim().toLowerCase()
    return listings
      .filter((l) => l.slug !== featured?.slug)
      .filter((l) => {
        if (!listingMatchesTab(l, tab)) return false
        if (q && !`${l.display_name} ${l.tagline ?? ""}`.toLowerCase().includes(q)) return false
        return true
      })
  }, [listings, featured, tab, query])

  const collectionJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: ServersDirectorySEO.title,
    description: ServersDirectorySEO.description,
    url: `${SITE_URL}/servers`,
    hasPart: listings.slice(0, 30).map((l) => ({
      "@type": "Organization",
      name: l.display_name,
      description: l.tagline || undefined,
      url: `${SITE_URL}/servers/${l.slug}`,
      ...(l.guild_icon_url ? { logo: l.guild_icon_url } : {}),
    })),
  }), [listings])

  return (
    <Layout SEO={ServersDirectorySEO}>
      <Head>
        {/* The directory is itself an Atlantic-themed magazine page,
            so we load Spectral here even though no individual listing
            is being rendered. Inter is already in our base bundle. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap"
        />
      </Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* The whole page lives inside a styled wrapper so the magazine
          aesthetic doesn't fight the rest of the site's dark theme.
          We keep our existing header/footer chrome intact -- this is
          just the article well. */}
      <div className="directory-shell">
        {/* ── Masthead ────────────────────────────────────── */}
        <header className="masthead">
          <div className="masthead-rule" aria-hidden="true" />
          <div className="masthead-eyebrow">
            <span>Vol. I</span>
            <span>·</span>
            <span>Premium Discord Communities</span>
            <span className="masthead-eyebrow-spacer" />
            <span>{listings.length} listings</span>
          </div>
          <h1 className="masthead-title">The LionBot Directory</h1>
          <p className="masthead-deck">
            A hand-picked record of the premium Discord communities running on
            LionBot — curated for serious focus, real conversation, and the
            kind of quiet study energy that pays off long-term. Updated weekly.
          </p>
          <div className="masthead-rule" aria-hidden="true" />
        </header>

        {/* ── Featured cover story ──────────────────────────── */}
        {featured && <CoverStory listing={featured} />}

        {/* ── Filter tabs + quiet search ────────────────────── */}
        <div className="filters">
          <nav className="tabs" aria-label="Filter by category">
            {SECTION_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`tab ${tab === t.id ? "tab-active" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="search">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the directory…"
              className="search-input"
            />
          </div>
        </div>

        {/* ── TOC listing ───────────────────────────────────── */}
        <section className="toc">
          {rest.length === 0 ? (
            <div className="toc-empty">
              <p className="toc-empty-title">No servers in this section yet.</p>
              <p className="toc-empty-sub">
                Try a different category, or clear the search to see everything in the directory.
              </p>
            </div>
          ) : (
            <ol className="toc-list" role="list">
              {rest.map((l, idx) => (
                <TocRow key={l.slug} listing={l} index={idx + 1} />
              ))}
            </ol>
          )}
        </section>

        {/* ── Footer strip: editorial pitch ───────────────── */}
        <aside className="pitch">
          <p className="pitch-eyebrow">For server owners</p>
          <p className="pitch-headline">
            Want your community featured?
          </p>
          <p className="pitch-body">
            Each listing is reviewed by hand. Premium servers get a custom
            profile page, an editorial layout, a single DoFollow backlink
            that helps your own SEO, and a permanent spot in this directory.
          </p>
          <Link href="/donate#feature_server" passHref>
            <a className="pitch-cta">
              Apply for editorial review <ChevronRight size={16} />
            </a>
          </Link>
        </aside>
      </div>

      <style jsx>{`
        .directory-shell {
          background: #1a1612;
          color: #ece4d3;
          font-family: Inter, system-ui, sans-serif;
          margin-top: -1px;
          min-height: 100vh;
          padding-bottom: clamp(64px, 10vh, 120px);
        }
        .masthead {
          max-width: min(1100px, 92vw);
          margin: 0 auto;
          padding: clamp(56px, 10vh, 120px) clamp(20px, 5vw, 40px) clamp(36px, 6vh, 64px);
          text-align: center;
        }
        .masthead-rule {
          height: 1px;
          background: rgba(236, 228, 211, 0.18);
          margin: 0 auto;
          max-width: 240px;
        }
        .masthead-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 1.4rem 0;
          font-size: 0.7rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #8e8273;
          font-weight: 600;
        }
        .masthead-eyebrow-spacer {
          width: 0;
        }
        .masthead-title {
          font-family: Spectral, Georgia, serif;
          font-size: clamp(2.6rem, 7vw, 5.4rem);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.02em;
          color: #ece4d3;
          margin: 0 0 0.6em;
        }
        .masthead-deck {
          font-family: Spectral, Georgia, serif;
          font-style: italic;
          font-size: clamp(1.05rem, 1.8vw, 1.35rem);
          line-height: 1.55;
          color: #c2b6a1;
          max-width: 56ch;
          margin: 0 auto 1.8rem;
        }

        .filters {
          max-width: min(1100px, 92vw);
          margin: clamp(36px, 6vh, 64px) auto 0;
          padding: 0 clamp(20px, 5vw, 40px);
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-bottom: 1px solid rgba(236, 228, 211, 0.18);
          padding-bottom: 14px;
        }
        @media (min-width: 720px) {
          .filters {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
          }
        }
        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 18px;
          align-items: center;
        }
        .tab {
          background: none;
          border: none;
          padding: 6px 0;
          font-family: Inter, sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8e8273;
          cursor: pointer;
          border-bottom: 1px solid transparent;
          transition: color 0.15s, border-color 0.15s;
        }
        .tab:hover {
          color: #ece4d3;
        }
        .tab-active {
          color: #ece4d3;
          border-bottom-color: #c64545;
        }

        .search {
          position: relative;
          width: 100%;
          max-width: 320px;
        }
        .search-icon {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          color: #8e8273;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 10px 0 10px 24px;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(236, 228, 211, 0.18);
          font-family: Inter, sans-serif;
          font-size: 0.92rem;
          color: #ece4d3;
        }
        .search-input::placeholder {
          color: #8e8273;
          font-style: italic;
        }
        .search-input:focus {
          outline: none;
          border-bottom-color: #c64545;
        }

        .toc {
          max-width: min(1100px, 92vw);
          margin: 0 auto;
          padding: 0 clamp(20px, 5vw, 40px);
        }
        .toc-empty {
          padding: clamp(48px, 10vh, 96px) 0;
          text-align: center;
        }
        .toc-empty-title {
          font-family: Spectral, Georgia, serif;
          font-style: italic;
          font-size: 1.2rem;
          color: #ece4d3;
          margin: 0 0 0.5rem;
        }
        .toc-empty-sub {
          font-size: 0.9rem;
          color: #8e8273;
          margin: 0;
        }
        .toc-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .pitch {
          max-width: min(820px, 92vw);
          margin: clamp(64px, 12vh, 120px) auto 0;
          padding: clamp(32px, 6vh, 56px) clamp(20px, 5vw, 40px);
          border-top: 3px double rgba(236, 228, 211, 0.22);
          border-bottom: 3px double rgba(236, 228, 211, 0.22);
          text-align: center;
        }
        .pitch-eyebrow {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #8e8273;
          margin: 0 0 0.8rem;
        }
        .pitch-headline {
          font-family: Spectral, Georgia, serif;
          font-size: clamp(1.6rem, 3.2vw, 2.4rem);
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #ece4d3;
          margin: 0 0 0.8rem;
        }
        .pitch-body {
          font-family: Inter, sans-serif;
          font-size: 0.98rem;
          line-height: 1.65;
          color: #c2b6a1;
          max-width: 60ch;
          margin: 0 auto 1.4rem;
        }
        .pitch-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: Inter, sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: #c64545;
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-thickness: 1px;
        }
        .pitch-cta:hover {
          opacity: 0.85;
        }
      `}</style>
    </Layout>
  )
}

// ── Cover story ────────────────────────────────────────────────

function CoverStory({ listing }: { listing: DirectoryListing }) {
  const theme = resolveTheme(listing.theme_preset)
  const accent = listing.accent_color || theme.defaultAccent
  const category = LISTING_CATEGORIES.find((c) => c.id === listing.category)
  const country = listing.primary_country
    ? LISTING_COUNTRIES.find((c) => c.id === listing.primary_country)
    : null
  const language = listing.primary_language
    ? LISTING_LANGUAGES.find((l) => l.id === listing.primary_language)
    : null

  return (
    <section
      style={{
        maxWidth: "min(1100px, 92vw)",
        margin: "0 auto",
        padding: "clamp(24px, 5vh, 56px) clamp(20px, 5vw, 40px) clamp(48px, 8vh, 96px)",
      }}
    >
      <Link href={`/servers/${listing.slug}`} passHref>
        <a className="cover-story group">
          <div className="cover-story-image-wrap">
            {listing.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.cover_image_url}
                alt=""
                className="cover-story-image"
              />
            ) : (
              <div
                className="cover-story-image cover-story-fallback"
                style={{ background: accent }}
              />
            )}
            <span className="cover-story-tag">
              {listing.promoted_until ? "Featured" : "Editor's pick"}
            </span>
          </div>

          <div className="cover-story-body">
            <div className="cover-story-eyebrow">
              {category ? category.label : "Discord community"}
              {country ? ` · ${country.label}` : ""}
              {language ? ` · ${language.label}` : ""}
            </div>
            <h2 className="cover-story-title">{listing.display_name}</h2>
            {listing.tagline && (
              <p className="cover-story-deck">
                {listing.tagline}
              </p>
            )}
            <span className="cover-story-cta" style={{ color: accent }}>
              Read the listing →
            </span>
          </div>

          <style jsx>{`
            .cover-story {
              display: grid;
              grid-template-columns: 1fr;
              gap: clamp(20px, 4vh, 36px);
              text-decoration: none;
              color: inherit;
            }
            @media (min-width: 720px) {
              .cover-story {
                grid-template-columns: 1.4fr 1fr;
                gap: clamp(28px, 5vw, 56px);
                align-items: center;
              }
            }
            .cover-story-image-wrap {
              position: relative;
              width: 100%;
              aspect-ratio: 3 / 2;
              overflow: hidden;
              background: #2a241e;
            }
            .cover-story-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
              transition: transform 0.6s ease;
            }
            .cover-story:hover .cover-story-image {
              transform: scale(1.02);
            }
            .cover-story-fallback {
              opacity: 0.85;
            }
            .cover-story-tag {
              position: absolute;
              top: 12px;
              left: 12px;
              background: rgba(26, 22, 18, 0.86);
              color: #ece4d3;
              border: 1px solid rgba(236, 228, 211, 0.22);
              font-family: Inter, sans-serif;
              font-size: 0.66rem;
              font-weight: 700;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              padding: 5px 10px;
              backdrop-filter: blur(4px);
            }
            .cover-story-eyebrow {
              font-family: Inter, sans-serif;
              font-size: 0.7rem;
              font-weight: 600;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              color: #8e8273;
              margin-bottom: 0.8rem;
            }
            .cover-story-title {
              font-family: Spectral, Georgia, serif;
              font-size: clamp(1.8rem, 4vw, 3rem);
              font-weight: 700;
              line-height: 1.05;
              letter-spacing: -0.02em;
              color: #ece4d3;
              margin: 0 0 0.8rem;
            }
            .cover-story:hover .cover-story-title {
              text-decoration: underline;
              text-decoration-thickness: 1px;
              text-underline-offset: 6px;
            }
            .cover-story-deck {
              font-family: Spectral, Georgia, serif;
              font-style: italic;
              font-size: clamp(1rem, 1.6vw, 1.2rem);
              line-height: 1.5;
              color: #c2b6a1;
              margin: 0 0 1.4rem;
              max-width: 38ch;
            }
            .cover-story-cta {
              font-family: Inter, sans-serif;
              font-size: 0.88rem;
              font-weight: 600;
              text-decoration: underline;
              text-underline-offset: 4px;
            }
          `}</style>
        </a>
      </Link>
    </section>
  )
}

// ── TOC row ───────────────────────────────────────────────────

function TocRow({ listing, index }: { listing: DirectoryListing; index: number }) {
  const category = LISTING_CATEGORIES.find((c) => c.id === listing.category)
  const country = listing.primary_country
    ? LISTING_COUNTRIES.find((c) => c.id === listing.primary_country)
    : null
  const language = listing.primary_language
    ? LISTING_LANGUAGES.find((l) => l.id === listing.primary_language)
    : null

  const meta = [
    category?.label,
    country?.label,
    language?.label,
    listing.is_study_server ? "Study" : null,
  ].filter(Boolean) as string[]

  return (
    <li className="toc-row">
      <Link href={`/servers/${listing.slug}`} passHref>
        <a className="toc-link group">
          <span className="toc-num">{String(index).padStart(2, "0")}</span>
          {listing.guild_icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.guild_icon_url} alt="" className="toc-icon" />
          ) : (
            <span className="toc-icon toc-icon-fallback" aria-hidden="true">
              {listing.display_name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="toc-text">
            <span className="toc-name">{listing.display_name}</span>
            {listing.tagline && <span className="toc-deck">{listing.tagline}</span>}
            <span className="toc-meta">{meta.join("   ·   ")}</span>
          </span>
          {listing.promoted_until && <span className="toc-badge">Featured</span>}
          <ChevronRight size={16} className="toc-arrow" />
        </a>
      </Link>
      <style jsx>{`
        .toc-row {
          border-bottom: 1px solid rgba(236, 228, 211, 0.10);
        }
        .toc-link {
          display: grid;
          grid-template-columns: auto auto 1fr auto auto;
          align-items: center;
          gap: 16px;
          padding: clamp(20px, 3vh, 32px) 0;
          color: #ece4d3;
          text-decoration: none;
          transition: padding 0.2s ease;
        }
        .toc-link:hover {
          padding-left: 8px;
        }
        .toc-num {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.78rem;
          color: #8e8273;
          letter-spacing: 0.1em;
        }
        .toc-icon {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 50%;
          flex-shrink: 0;
          background: #2a241e;
        }
        .toc-icon-fallback {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #2a241e;
          color: #ece4d3;
          font-family: Spectral, Georgia, serif;
          font-weight: 700;
          font-size: 1.15rem;
          border: 1px solid rgba(236, 228, 211, 0.14);
        }
        .toc-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .toc-name {
          font-family: Spectral, Georgia, serif;
          font-size: clamp(1.15rem, 2vw, 1.4rem);
          font-weight: 600;
          letter-spacing: -0.005em;
          color: #ece4d3;
        }
        .toc-link:hover .toc-name {
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 4px;
        }
        .toc-deck {
          font-family: Spectral, Georgia, serif;
          font-style: italic;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #c2b6a1;
          max-width: 60ch;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .toc-meta {
          font-family: Inter, sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8e8273;
          margin-top: 2px;
        }
        .toc-badge {
          font-family: Inter, sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #c64545;
          padding: 4px 10px;
          border: 1px solid #c64545;
        }
        .toc-arrow {
          color: #8e8273;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .toc-link:hover .toc-arrow {
          transform: translateX(4px);
          color: #ece4d3;
        }
        @media (max-width: 600px) {
          .toc-link {
            grid-template-columns: auto auto 1fr auto;
            gap: 12px;
          }
          .toc-arrow {
            display: none;
          }
        }
      `}</style>
    </li>
  )
}

// ── Static generation w/ ISR ──────────────────────────────────

export const getStaticProps: GetStaticProps<ServersIndexProps> = async ({ locale }) => {
  // Feature gate: when SERVERS_DIRECTORY_ENABLED is false the whole
  // public directory is hidden behind a 404. Re-enable by flipping the
  // flag in constants/FeatureFlags.ts -- no other code change needed.
  if (!SERVERS_DIRECTORY_ENABLED) {
    return { notFound: true, revalidate: 300 }
  }

  let listings: DirectoryListing[] = []
  try {
    listings = await fetchDirectoryListings()
  } catch (err) {
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
