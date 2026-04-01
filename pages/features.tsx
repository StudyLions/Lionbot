// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: Public features showcase page for bot capabilities
// ============================================================
import React from "react"
import Link from "next/link"
import { GetStaticProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import {
  Mic,
  Trophy,
  Coins,
  Timer,
  Cat,
  Shield,
  Sparkles,
  ArrowRight,
  BookOpen,
  BarChart3,
  ShoppingBag,
  Zap,
  Sprout,
  Palette,
  ListChecks,
  Video,
  Calendar,
  CheckCircle2,
  Heart,
  Vote,
  Crown,
  Bot,
  Star,
} from "lucide-react"
import Layout from "@/components/Layout/Layout"
import { FEATURE_DEMOS } from "@/components/features/FeaturePageDemos"

const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${
  process.env.NEXT_PUBLIC_BOT_CLIENT_ID || "889078613817831495"
}&permissions=1376674495606&scope=bot+applications.commands`

const FEATURES = [
  {
    id: "study",
    title: "Study Tracking & Rewards",
    icon: <Mic size={28} />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "from-blue-500/10",
    description:
      "Leo automatically tracks voice and text activity across your server. Members earn coins for every hour they spend in voice channels, with bonus rewards for keeping their camera on.",
    bullets: [
      { icon: <Mic size={16} />, text: "Automatic voice & text session tracking" },
      { icon: <Coins size={16} />, text: "Configurable hourly coin rewards" },
      { icon: <Video size={16} />, text: "Camera-on bonus for accountability" },
      { icon: <BarChart3 size={16} />, text: "Daily, weekly, and monthly stats" },
    ],
    imagePlaceholder: "Study tracking demo",
  },
  {
    id: "ranks",
    title: "Ranks & Leaderboards",
    icon: <Trophy size={28} />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "from-amber-500/10",
    description:
      "Create a competitive environment with customizable rank tiers. Members progress through ranks based on voice time, messages, or combined XP. Profile cards and leaderboards make activity visible.",
    bullets: [
      { icon: <Trophy size={16} />, text: "Customizable rank tiers with role rewards" },
      { icon: <BarChart3 size={16} />, text: "Server-wide leaderboards with filters" },
      { icon: <Star size={16} />, text: "Beautiful profile cards with stats" },
      { icon: <Zap size={16} />, text: "Seasonal rank resets for fresh competition" },
    ],
    imagePlaceholder: "Ranks & leaderboards demo",
  },
  {
    id: "economy",
    title: "Economy & Shop",
    icon: <Coins size={28} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "from-emerald-500/10",
    description:
      "A full virtual economy gives members something to work toward. They earn coins through activity and spend them on colour roles, room rentals, and custom items. Admins control every aspect.",
    bullets: [
      { icon: <ShoppingBag size={16} />, text: "Colour role shop with custom pricing" },
      { icon: <Coins size={16} />, text: "Member-to-member coin transfers" },
      { icon: <Mic size={16} />, text: "Rentable private voice channels" },
      { icon: <BarChart3 size={16} />, text: "Full transaction history and audit logs" },
    ],
    imagePlaceholder: "Economy & shop demo",
  },
  {
    id: "pomodoro",
    title: "Pomodoro Focus Sessions",
    icon: <Timer size={28} />,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "from-rose-500/10",
    description:
      "Built-in pomodoro timers help members stay focused during study sessions. Voice alerts signal focus and break periods. Streaks and milestones gamify the experience.",
    bullets: [
      { icon: <Timer size={16} />, text: "Configurable focus/break cycles" },
      { icon: <Mic size={16} />, text: "Voice channel audio alerts" },
      { icon: <Zap size={16} />, text: "Focus Power streaks and milestones" },
      { icon: <BookOpen size={16} />, text: "Web dashboard for focus mode" },
    ],
    imagePlaceholder: "Pomodoro timer demo",
  },
  {
    id: "liongotchi",
    title: "LionGotchi Pets",
    icon: <Cat size={28} />,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glow: "from-orange-500/10",
    description:
      "Every member gets a virtual pet lion that grows as they study. Feed, bathe, and care for your LionGotchi. Collect equipment drops, farm resources, craft items, and trade on the marketplace.",
    bullets: [
      { icon: <Sprout size={16} />, text: "Farm resources and craft items" },
      { icon: <Shield size={16} />, text: "Equipment with stat boosts" },
      { icon: <ShoppingBag size={16} />, text: "Player-to-player marketplace" },
      { icon: <Sparkles size={16} />, text: "Scrolls and enhancement system" },
    ],
    imagePlaceholder: "LionGotchi pet demo",
  },
  {
    id: "management",
    title: "Server Management",
    icon: <Shield size={28} />,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "from-violet-500/10",
    description:
      "Powerful moderation and organization tools keep your server running smoothly. Role menus let members self-assign roles, video channels enforce camera-on rules, and schedules keep everyone accountable.",
    bullets: [
      { icon: <ListChecks size={16} />, text: "Button, dropdown, and reaction role menus" },
      { icon: <Video size={16} />, text: "Camera-required study channels" },
      { icon: <Calendar size={16} />, text: "Scheduled study sessions" },
      { icon: <Shield size={16} />, text: "Moderation notes, warns, and tickets" },
    ],
    imagePlaceholder: "Server management demo",
  },
  {
    id: "premium",
    title: "Premium & Customization",
    icon: <Palette size={28} />,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    glow: "from-pink-500/10",
    description:
      // --- AI-MODIFIED (2026-04-01) ---
      // Purpose: Rename "Branding" to "Visual Branding" for text branding feature
      "Unlock custom profile skins, visual branding, and premium perks with LionHeart subscriptions. LionGems power the premium economy, earnable for free by voting on top.gg.",
      // --- END AI-MODIFIED ---
    bullets: [
      { icon: <Palette size={16} />, text: "Custom profile card skins" },
      { icon: <Crown size={16} />, text: "LionHeart server subscriptions" },
      { icon: <Sparkles size={16} />, text: "LionGems for profile skins and cosmetics" },
      { icon: <Vote size={16} />, text: "Free gems by voting on top.gg" },
    ],
    imagePlaceholder: "Premium features demo",
  },
]

export default function FeaturesPage() {
  return (
    <Layout
      SEO={{
        title: "Features - LionBot",
        description:
          "Discover everything LionBot can do for your Discord server: study tracking, ranks, economy, pomodoro timers, LionGotchi pets, and more.",
      }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles size={14} />
            70,000+ servers trust Leo
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Everything LionBot Can Do
            <br />
            <span className="text-primary">For Your Server</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Gamify engagement, track activity, reward members, and build a thriving community.
            Leo makes your server a place people want to come back to.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg transition-colors shadow-lg shadow-primary/20"
            >
              <Bot size={20} />
              Add to Your Server
            </a>
            <Link href="/dashboard">
              <a className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border hover:bg-accent text-foreground font-medium transition-colors">
                Open Dashboard
                <ArrowRight size={18} />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-24">
          {FEATURES.map((feature, index) => {
            const isReversed = index % 2 === 1
            return (
              <div
                key={feature.id}
                className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 lg:gap-16`}
              >
                {/* Text side */}
                <div className="flex-1 min-w-0">
                  <div className={`inline-flex items-center gap-3 mb-4`}>
                    <span className={`p-2.5 rounded-xl ${feature.bg} ${feature.color}`}>
                      {feature.icon}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      {feature.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`${feature.color} flex-shrink-0 mt-0.5`}>
                          {bullet.icon}
                        </span>
                        <span className="text-foreground/80 text-sm">{bullet.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Demo side */}
                <div className="flex-1 w-full min-w-0">
                  <div
                    className={`relative aspect-[4/3] rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.glow} to-transparent overflow-hidden`}
                  >
                    {(() => {
                      const DemoComponent = FEATURE_DEMOS[feature.id]
                      return DemoComponent ? <DemoComponent /> : null
                    })()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
            <Heart size={14} />
            Our Mission
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Making Every Server a Place
            <br />
            People Want to Come Back To
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            LionBot exists to help server owners engage their communities.
            Whether you run a study group, gaming clan, or professional team,
            Leo gamifies the experience so members stay active, earn rewards, and grow together.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card/50 border border-border rounded-2xl p-6 text-left">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 inline-flex mb-4">
                <Vote size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Vote on top.gg</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Free for everyone! Vote every 12 hours to earn LionGems and a 1.25x economy bonus.
              </p>
            </div>
            <div className="bg-card/50 border border-border rounded-2xl p-6 text-left">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 inline-flex mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">LionGems</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Purchase gem packs to unlock custom skins, cosmetics, and support continued development.
              </p>
            </div>
            <div className="bg-card/50 border border-border rounded-2xl p-6 text-left">
              <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 inline-flex mb-4">
                <Crown size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">LionHeart</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {/* --- AI-MODIFIED (2026-04-01) --- */}
                {/* Purpose: Rename "Branding" to "Visual Branding" for text branding feature */}
                Monthly subscriptions unlock visual branding, extra perks, and exclusive features for your community.
                {/* --- END AI-MODIFIED --- */}
              </p>
            </div>
          </div>

          <Link href="/donate">
            <a className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium border border-amber-500/30 transition-colors">
              <Heart size={18} />
              Support Leo
              <ArrowRight size={16} />
            </a>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Add Leo to your server and set up in under 2 minutes.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href={BOT_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg transition-colors shadow-lg shadow-primary/20"
          >
            <Bot size={20} />
            Add to Your Server
          </a>
          <Link href="/tutorials/server-setup">
            <a className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border hover:bg-accent text-foreground font-medium transition-colors">
              <BookOpen size={18} />
              Setup Guide
            </a>
          </Link>
        </div>
      </section>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
