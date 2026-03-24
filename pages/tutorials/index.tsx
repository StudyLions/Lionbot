// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Tutorials landing page with member/admin tracks
// ============================================================
import Layout from "@/components/Layout/Layout"
import TutorialCard from "@/components/tutorials/TutorialCard"
import { getTutorialsByAudience } from "@/data/tutorials"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Added search functionality and Search icon import
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Users, ShieldCheck, BookOpen, MessageCircle, ExternalLink, Search } from "lucide-react"
// --- END AI-MODIFIED ---
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

const memberTutorials = getTutorialsByAudience("member")
const adminTutorials = getTutorialsByAudience("admin")

type TabType = "all" | "member" | "admin"

export default function TutorialsPage() {
  const [tab, setTab] = useState<TabType>("all")
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Client-side search filtering for tutorials
  const [search, setSearch] = useState("")

  const filteredMember = useMemo(() => {
    if (!search.trim()) return memberTutorials
    const q = search.toLowerCase()
    return memberTutorials.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    )
  }, [search])

  const filteredAdmin = useMemo(() => {
    if (!search.trim()) return adminTutorials
    const q = search.toLowerCase()
    return adminTutorials.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    )
  }, [search])
  // --- END AI-MODIFIED ---

  const showMember = tab === "all" || tab === "member"
  const showAdmin = tab === "all" || tab === "admin"

  return (
    <Layout
      SEO={{
        title: "Tutorials - LionBot",
        description: "Learn how to use LionBot with step-by-step tutorials for members and server admins.",
      }}
    >
      <div className="min-h-screen bg-background pt-12 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4">
              <BookOpen size={14} />
              Tutorials
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Learn LionBot
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Step-by-step guides to help you get the most out of LionBot.
              Pick your track below and start learning.
            </p>
          </div>

          {/* --- AI-MODIFIED (2026-03-24) --- */}
          {/* Purpose: Search input for filtering tutorials */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tutorials..."
                className="w-full bg-muted/50 border border-border text-foreground rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
          {/* --- END AI-MODIFIED --- */}

          {/* Tab filter */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {(
              [
                { value: "all", label: "All Tutorials", icon: <BookOpen size={14} /> },
                { value: "member", label: "For Members", icon: <Users size={14} /> },
                { value: "admin", label: "For Admins", icon: <ShieldCheck size={14} /> },
              ] as { value: TabType; label: string; icon: React.ReactNode }[]
            ).map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  tab === t.value
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Member section */}
          {showMember && (
            <section className="mb-12" id="member">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Users size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">For Members</h2>
                  <p className="text-xs text-muted-foreground">
                    Learn how to use LionBot as a server member
                  </p>
                </div>
              </div>
              {/* --- AI-MODIFIED (2026-03-24) --- */}
              {/* Purpose: Use filtered tutorials for search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMember.map((t) => (
                  <TutorialCard key={t.slug} {...t} />
                ))}
                {filteredMember.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-6">No matching member tutorials</p>
                )}
              </div>
              {/* --- END AI-MODIFIED --- */}
            </section>
          )}

          {/* Admin section */}
          {showAdmin && (
            <section id="admin">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <ShieldCheck size={16} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">For Admins</h2>
                  <p className="text-xs text-muted-foreground">
                    Set up and configure LionBot for your server
                  </p>
                </div>
              </div>
              {/* --- AI-MODIFIED (2026-03-24) --- */}
              {/* Purpose: Use filtered tutorials for search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAdmin.map((t) => (
                  <TutorialCard key={t.slug} {...t} />
                ))}
                {filteredAdmin.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-6">No matching admin tutorials</p>
                )}
              </div>
              {/* --- END AI-MODIFIED --- */}
            </section>
          )}

          {/* --- AI-MODIFIED (2026-03-15) --- */}
          {/* Purpose: support server CTA banner */}
          <section className="mt-16 mb-4">
            <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 text-center">
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Still have questions?
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
                  Join our Discord support server and we&apos;ll help you out.
                  Our team and community are ready to answer any question you have about LionBot.
                </p>
                <a
                  href="https://discord.gg/the-study-lions-780195610154237993"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Join Support Server
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              </div>
            </div>
          </section>
          {/* --- END AI-MODIFIED --- */}
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
