// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Guides hub page with category filters and search.
//          Statically generated for SEO (getStaticProps).
// ============================================================
import { useState, useMemo } from "react"
import { GetStaticProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Layout from "@/components/Layout/Layout"
import GuideCard from "@/components/guides/GuideCard"
import { getAllGuides, getGuideCategories } from "@/lib/guides"
import type { GuideMeta } from "@/lib/guides"
import { cn } from "@/lib/utils"
import { BookOpen, Search, Bot, ExternalLink } from "lucide-react"

const BOT_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=889078613817831495&permissions=1376674495606&scope=bot+applications.commands"

interface GuidesPageProps {
  guides: GuideMeta[]
  categories: string[]
}

export default function GuidesPage({ guides, categories }: GuidesPageProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    let result = guides
    if (activeCategory !== "all") {
      result = result.filter((g) => g.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.keywords.some((k) => k.toLowerCase().includes(q))
      )
    }
    return result
  }, [guides, activeCategory, search])

  const featured = guides.filter((g) => g.featured)

  return (
    <Layout
      SEO={{
        title: "Guides - LionBot",
        description:
          "Step-by-step guides for setting up and using LionBot on Discord. Learn about pomodoro timers, study tracking, economy systems, leaderboards, and more.",
        canonical: "https://lionbot.org/guides",
        openGraph: {
          title: "LionBot Guides - Discord Bot Tutorials & How-To Articles",
          description: "Learn how to use every LionBot feature with detailed guides.",
          url: "https://lionbot.org/guides",
        },
      }}
    >
      <div className="min-h-screen bg-background pt-12 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4">
              <BookOpen size={14} />
              Guides
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              LionBot Guides
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Everything you need to know about setting up and using LionBot.
              Detailed guides for every feature, from pomodoro timers to economy systems.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search guides..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-accent/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          {/* Category filters */}
          {categories.length > 0 && (
            <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
              <button
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeCategory === "all"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                All Guides
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                    activeCategory === cat
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Featured section */}
          {activeCategory === "all" && !search && featured.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-foreground mb-4">Featured</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((guide) => (
                  <GuideCard key={guide.slug} guide={guide} />
                ))}
              </div>
            </section>
          )}

          {/* All guides */}
          {filtered.length > 0 ? (
            <section>
              {(activeCategory !== "all" || search) && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {activeCategory !== "all"
                      ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Guides`
                      : "All Guides"}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {filtered.length} guide{filtered.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {activeCategory === "all" && !search && (
                <h2 className="text-lg font-semibold text-foreground mb-4">All Guides</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((guide) => (
                  <GuideCard key={guide.slug} guide={guide} />
                ))}
              </div>
            </section>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm mb-2">No guides found</p>
              <p className="text-xs text-muted-foreground">
                {search
                  ? "Try a different search term"
                  : "Guides are being written — check back soon!"}
              </p>
            </div>
          )}

          {/* Bottom CTA */}
          <section className="mt-16">
            <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 text-center">
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Ready to get started?
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed text-sm">
                  Add LionBot to your Discord server for free. It takes seconds
                  and works with servers of any size.
                </p>
                <a
                  href={BOT_INVITE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                >
                  <Bot className="h-5 w-5" />
                  Add LionBot to Your Server
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<GuidesPageProps> = async ({ locale }) => {
  const guides = getAllGuides()
  const categories = getGuideCategories()

  return {
    props: {
      guides,
      categories,
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
    revalidate: 60,
  }
}
