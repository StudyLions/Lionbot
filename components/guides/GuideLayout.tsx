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
    <div className="min-h-screen bg-background pt-6 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link href="/">
            <span className="hover:text-foreground transition-colors cursor-pointer">Home</span>
          </Link>
          <ChevronRight size={12} />
          <Link href="/guides">
            <span className="hover:text-foreground transition-colors cursor-pointer">Guides</span>
          </Link>
          <ChevronRight size={12} />
          <span className="text-muted-foreground truncate max-w-[200px]">{meta.title}</span>
        </nav>

        <div className="flex gap-10">
          {/* Desktop sidebar TOC */}
          {toc.length > 0 && (
            <aside className="hidden xl:block w-56 flex-shrink-0">
              <div className="sticky top-24">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3 px-2">
                  On This Page
                </h2>
                <nav className="space-y-0.5 max-h-[calc(100vh-160px)] overflow-y-auto">
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors",
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
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 px-2">
                    Share
                  </p>
                  <div className="flex gap-2 px-2">
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
                <SheetContent side="right" className="w-64 p-0">
                  <SheetHeader className="p-5 pb-2">
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
            <header className="mb-10">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary">
                  {categoryLabel}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {meta.readingTimeMinutes} min read
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
                {meta.title}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mb-4">
                {meta.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  {meta.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>
            </header>

            {/* MDX content */}
            <div
              id="guide-content"
              className="prose prose-invert prose-sm sm:prose-base max-w-none
                prose-headings:text-foreground prose-headings:font-bold
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-code:text-primary prose-code:bg-accent/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-accent/30 prose-pre:border prose-pre:border-border
                prose-img:rounded-xl prose-img:border prose-img:border-border
                prose-li:text-muted-foreground
                prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground
                prose-hr:border-border"
            >
              {children}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6 sm:p-8 text-center">
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Start Using LionBot Today
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-5 text-sm leading-relaxed">
                  Add LionBot to your Discord server for free. No credit card, no complicated
                  setup. Works with servers of any size.
                </p>
                <a
                  href={BOT_INVITE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                >
                  <Bot className="h-5 w-5" />
                  Add to Discord
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              </div>
            </div>

            {/* Related guides */}
            {related && related.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Related Guides
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((guide) => (
                    <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                      <a className="group block p-4 rounded-lg border border-border hover:border-primary/30 bg-accent/20 hover:bg-accent/40 transition-all">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                          {guide.category}
                        </span>
                        <h4 className="text-sm font-semibold text-foreground mt-2 mb-1 group-hover:text-primary transition-colors line-clamp-2">
                          {guide.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {guide.description}
                        </p>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to guides */}
            <div className="mt-8 pt-6 border-t border-border">
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
