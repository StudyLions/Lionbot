// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Tutorials landing page with member/admin tracks
// ============================================================
import Layout from "@/components/Layout/Layout"
import TutorialCard from "@/components/tutorials/TutorialCard"
import { getTutorialsByAudience } from "@/data/tutorials"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Users, ShieldCheck, BookOpen } from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

const memberTutorials = getTutorialsByAudience("member")
const adminTutorials = getTutorialsByAudience("admin")

type TabType = "all" | "member" | "admin"

export default function TutorialsPage() {
  const [tab, setTab] = useState<TabType>("all")

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {memberTutorials.map((t) => (
                  <TutorialCard key={t.slug} {...t} />
                ))}
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminTutorials.map((t) => (
                  <TutorialCard key={t.slug} {...t} />
                ))}
              </div>
            </section>
          )}
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
