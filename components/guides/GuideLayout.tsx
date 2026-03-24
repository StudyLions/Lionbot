// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Article layout for guide pages with sticky TOC,
//          breadcrumbs, meta info, share buttons, and bottom CTA.
// ============================================================
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import {
  ChevronRight,
  BookOpen,
  Calendar,
  Clock,
  User,
  Twitter,
  Link2,
  Check,
  List,
  Bot,
  ExternalLink,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { GuideMeta } from "@/lib/guides"

const BOT_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=889078613817831495&permissions=1376674495606&scope=bot+applications.commands"

interface TOCItem {
  id: string
  text: string
  level: number
}

interface GuideLayoutProps {
  meta: GuideMeta
  related?: GuideMeta[]
  children: React.ReactNode
}

export default function GuideLayout({ meta, related, children }: GuideLayoutProps) {
  const [toc, setToc] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState("")
  const [tocOpen, setTocOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const article = document.getElementById("guide-content")
    if (!article) return

    const headings = article.querySelectorAll("h2, h3")
    const items: TOCItem[] = Array.from(headings).map((el) => ({
      id: el.id,
      text: el.textContent?.replace(/🔗$/, "").trim() || "",
      level: el.tagName === "H2" ? 2 : 3,
    }))
    setToc(items)
  }, [children])

  useEffect(() => {
    if (toc.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    )

    toc.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [toc])

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setTocOpen(false)
    }
  }

  const shareOnTwitter = () => {
    const url = `https://lionbot.org${router.asPath}`
    const text = `${meta.title} — Check out this guide on LionBot!`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    )
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`https://lionbot.org${router.asPath}`)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const formattedDate = new Date(meta.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const categoryLabel =
    meta.category.charAt(0).toUpperCase() + meta.category.slice(1)

  return (
    <div className="min-h-screen bg-background pt-8 pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 flex-wrap">
          <Link href="/">
            <span className="hover:text-foreground transition-colors cursor-pointer">Home</span>
          </Link>
          <ChevronRight size={10} className="opacity-40" />
          <Link href="/guides">
            <span className="hover:text-foreground transition-colors cursor-pointer">Guides</span>
          </Link>
          <ChevronRight size={10} className="opacity-40" />
          <span className="text-foreground/50 truncate max-w-[240px]">{meta.title}</span>
        </nav>

        <div className="flex gap-12 lg:gap-16">
          {/* Desktop sidebar TOC */}
          {toc.length > 0 && (
            <aside className="hidden xl:block w-56 flex-shrink-0">
              <div className="sticky top-24">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-3 px-2">
                  On This Page
                </h2>
                <nav className="space-y-0.5 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-md text-[13px] leading-snug transition-colors",
                        item.level === 3 && "pl-6",
                        activeId === item.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <span className="line-clamp-2">{item.text}</span>
                    </button>
                  ))}
                </nav>

                {/* Share buttons */}
                <div className="mt-8 pt-4 border-t border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-2 px-2">
                    Share
                  </p>
                  <div className="flex gap-1 px-2">
                    <button
                      onClick={shareOnTwitter}
                      className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                      title="Share on Twitter"
                    >
                      <Twitter className="h-4 w-4" />
                    </button>
                    <button
                      onClick={copyLink}
                      className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                      title="Copy link"
                    >
                      {linkCopied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Mobile TOC trigger */}
          {toc.length > 0 && (
            <div className="fixed bottom-4 right-4 z-40 xl:hidden">
              <Sheet open={tocOpen} onOpenChange={setTocOpen}>
                <SheetTrigger asChild>
                  <button className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:bg-primary/90 transition-colors">
                    <List size={20} />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <SheetHeader className="p-5 pb-3">
                    <SheetTitle className="text-sm">On This Page</SheetTitle>
                  </SheetHeader>
                  <nav className="px-3 pb-6 space-y-0.5">
                    {toc.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors",
                          item.level === 3 && "pl-6",
                          activeId === item.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        <span>{item.text}</span>
                      </button>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* Main content */}
          <article className="flex-1 min-w-0 max-w-3xl">
            {/* Article header */}
            <header className="mb-12 pb-8 border-b border-border/40">
              <div className="flex items-center gap-2.5 mb-5 flex-wrap">
                <span className="text-xs px-3 py-1 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
                  {categoryLabel}
                </span>
                <span className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {meta.readingTimeMinutes} min read
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-foreground mb-4 leading-[1.15] tracking-tight">
                {meta.title}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-6">
                {meta.description}
              </p>
              <div className="flex items-center gap-5 text-sm text-muted-foreground/70">
                <span className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  {meta.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </span>
              </div>
            </header>

            {/* MDX content */}
            <div
              id="guide-content"
              className={cn(
                "prose prose-invert max-w-none",
                // Base sizing
                "prose-base lg:prose-lg",
                // Headings
                "prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-foreground",
                "prose-h2:text-2xl prose-h2:lg:text-3xl prose-h2:mt-14 prose-h2:mb-5 prose-h2:pt-6 prose-h2:border-t prose-h2:border-border/30",
                "prose-h3:text-xl prose-h3:lg:text-2xl prose-h3:mt-10 prose-h3:mb-4",
                "prose-h4:text-lg prose-h4:mt-8 prose-h4:mb-3",
                // Paragraphs
                "prose-p:text-[hsl(var(--muted-foreground))] prose-p:leading-[1.8] prose-p:mb-5",
                // Links
                "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:decoration-primary/40 prose-a:underline-offset-2",
                // Bold
                "prose-strong:text-foreground prose-strong:font-semibold",
                // Code
                "prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.875em] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none",
                "prose-pre:bg-[#1e1e2e] prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl",
                // Images
                "prose-img:rounded-xl prose-img:border prose-img:border-border/50 prose-img:shadow-lg",
                // Lists
                "prose-li:text-[hsl(var(--muted-foreground))] prose-li:leading-[1.7]",
                "prose-ol:my-5 prose-ul:my-5",
                "prose-li:marker:text-primary/60",
                // Blockquote
                "prose-blockquote:border-l-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-muted-foreground",
                // Horizontal rule
                "prose-hr:border-border/50 prose-hr:my-10",
              )}
            >
              {children}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-background to-primary/[0.04] p-8 sm:p-10 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_0%,_rgba(59,130,246,0.06),_transparent_70%)]" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-5">
                  <Bot className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Start Using LionBot Today
                </h3>
                <p className="text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
                  Add LionBot to your Discord server for free. No credit card, no complicated
                  setup. Works with servers of any size.
                </p>
                <a
                  href={BOT_INVITE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  <Bot className="h-5 w-5" />
                  Add to Discord
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              </div>
            </div>

            {/* Related guides */}
            {related && related.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-bold text-foreground mb-5">
                  Related Guides
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((guide) => (
                    <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                      <a className="group block p-5 rounded-xl border border-border/50 hover:border-primary/30 bg-accent/10 hover:bg-accent/30 transition-all">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                          {guide.category}
                        </span>
                        <h4 className="text-sm font-semibold text-foreground mt-2.5 mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                          {guide.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {guide.description}
                        </p>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to guides */}
            <div className="mt-10 pt-6 border-t border-border/40">
              <Link href="/guides">
                <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  Back to all guides
                </a>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
