// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: Public features showcase page for bot capabilities
// ============================================================
// --- AI-MODIFIED (2026-04-05) ---
// Purpose: Major features page overhaul — added 5 new feature sections (Rooms, Tasks, Schedule,
// Sounds, Dashboard), live stats bar, sticky feature nav, compact grid, FAQ section, copy updates
import React, { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { GetStaticProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import useSWR from "swr"
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
  DoorOpen,
  Volume2,
  Monitor,
  Users,
  Award,
  MessageSquare,
  Pin,
  UserPlus,
  HelpCircle,
  Settings,
} from "lucide-react"
import Layout from "@/components/Layout/Layout"
import { FEATURE_DEMOS } from "@/components/features/FeaturePageDemos"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${
  process.env.NEXT_PUBLIC_BOT_CLIENT_ID || "889078613817831495"
}&permissions=1376674495606&scope=bot+applications.commands`

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
interface PublicStats {
  guilds: number
  sessions: number
  users: number
  tasks: number
  studyingNow: number
  activeTimers: number
}

const statsFetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Stats fetch failed")
    return r.json()
  })

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0)
  const prevTarget = useRef(0)
  useEffect(() => {
    if (target === prevTarget.current) return
    prevTarget.current = target
    const start = performance.now()
    const from = value
    let frame: number
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.floor(from + eased * (target - from)))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

// ---------------------------------------------------------------------------
// Feature categories & data
// ---------------------------------------------------------------------------
type FeatureCategory = "productivity" | "gamification" | "community" | "premium"

const CATEGORY_META: { id: FeatureCategory; label: string }[] = [
  { id: "productivity", label: "Productivity" },
  { id: "gamification", label: "Gamification" },
  { id: "community", label: "Community" },
  { id: "premium", label: "Premium" },
]

const FEATURES = [
  // ── Productivity ──
  {
    id: "study",
    category: "productivity" as FeatureCategory,
    title: "Study Tracking & Rewards",
    icon: <Mic size={28} />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "from-blue-500/10",
    description:
      "Leo automatically tracks voice and text activity across your server. Members earn coins for every hour they spend in voice channels, with bonus rewards for keeping their camera on. Detailed daily, weekly, and monthly breakdowns show exactly how your community is growing.",
    bullets: [
      { icon: <Mic size={16} />, text: "Automatic voice & text session tracking" },
      { icon: <Coins size={16} />, text: "Configurable hourly coin rewards" },
      { icon: <Video size={16} />, text: "Camera-on bonus for accountability" },
      { icon: <BarChart3 size={16} />, text: "Daily, weekly, and monthly stats" },
    ],
  },
  {
    id: "pomodoro",
    category: "productivity" as FeatureCategory,
    title: "Pomodoro Focus Sessions",
    icon: <Timer size={28} />,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "from-rose-500/10",
    description:
      "Built-in pomodoro timers help members stay focused during study sessions. Voice alerts signal focus and break periods, and streaks and milestones gamify the experience. Manage timers from Discord or the web dashboard.",
    bullets: [
      { icon: <Timer size={16} />, text: "Configurable focus/break cycles" },
      { icon: <Mic size={16} />, text: "Voice channel audio alerts" },
      { icon: <Zap size={16} />, text: "Focus Power streaks and milestones" },
      { icon: <Monitor size={16} />, text: "Web dashboard for focus mode" },
    ],
  },
  {
    id: "tasks",
    category: "productivity" as FeatureCategory,
    title: "Tasks & Shared Boards",
    icon: <CheckCircle2 size={28} />,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    glow: "from-sky-500/10",
    description:
      "Every member gets a personal task list that rewards them with coins for completing items. For group projects, shared kanban boards let teams collaborate with To Do, In Progress, and Done columns — managed from Discord or the dashboard.",
    bullets: [
      { icon: <CheckCircle2 size={16} />, text: "Personal task lists with coin rewards" },
      { icon: <ListChecks size={16} />, text: "Shared kanban boards for teams" },
      { icon: <Monitor size={16} />, text: "Full board editor on the dashboard" },
      { icon: <Zap size={16} />, text: "Tick and untick tasks from Discord" },
    ],
  },
  {
    id: "schedule",
    category: "productivity" as FeatureCategory,
    title: "Scheduled Sessions & Calendar",
    icon: <Calendar size={28} />,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    glow: "from-indigo-500/10",
    description:
      "Set up recurring or one-time study sessions that members can book and join. Sessions appear on a monthly calendar with iCal and Google Calendar sync. Attendance tracking and voice channel alerts keep everyone accountable.",
    bullets: [
      { icon: <Calendar size={16} />, text: "Bookable sessions with attendance tracking" },
      { icon: <Star size={16} />, text: "Monthly calendar with iCal/Google sync" },
      { icon: <Mic size={16} />, text: "Voice channel alerts when sessions start" },
      { icon: <BarChart3 size={16} />, text: "Server-wide calendar for admins" },
    ],
  },
  // ── Gamification ──
  {
    id: "ranks",
    category: "gamification" as FeatureCategory,
    title: "Ranks & Leaderboards",
    icon: <Trophy size={28} />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "from-amber-500/10",
    description:
      // --- AI-MODIFIED (2026-04-19) ---
      // Ticket #0020 — removed misleading "combined XP" wording; XP rank type only counts text.
      "Create a competitive environment with customizable rank tiers. Members progress through ranks based on voice time, message count, or word-weighted text XP — pick the metric that matches your community. Profile cards and leaderboards make activity visible, and seasonal resets keep things fresh.",
      // --- END AI-MODIFIED ---
    bullets: [
      { icon: <Trophy size={16} />, text: "Customizable rank tiers with role rewards" },
      { icon: <BarChart3 size={16} />, text: "Server-wide leaderboards with filters" },
      { icon: <Star size={16} />, text: "Beautiful profile cards with stats" },
      { icon: <Zap size={16} />, text: "Seasonal rank resets for fresh competition" },
    ],
  },
  {
    id: "economy",
    category: "gamification" as FeatureCategory,
    title: "Economy & Shop",
    icon: <Coins size={28} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "from-emerald-500/10",
    description:
      "A full virtual economy gives members something to work toward. They earn coins through activity and spend them on colour roles, room rentals, and custom items. Member-to-member transfers, transaction history, and admin audit logs round out the system.",
    bullets: [
      { icon: <ShoppingBag size={16} />, text: "Colour role shop with custom pricing" },
      { icon: <Coins size={16} />, text: "Member-to-member coin transfers" },
      { icon: <DoorOpen size={16} />, text: "Rentable private voice channels" },
      { icon: <BarChart3 size={16} />, text: "Full transaction history and audit logs" },
    ],
  },
  {
    id: "liongotchi",
    category: "gamification" as FeatureCategory,
    title: "LionGotchi Pets",
    icon: <Cat size={28} />,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glow: "from-orange-500/10",
    description:
      "Every member gets a virtual pet lion that grows as they study. Feed, bathe, and care for your LionGotchi. Collect equipment drops, farm resources, craft items, and trade on the player marketplace.",
    bullets: [
      { icon: <Sprout size={16} />, text: "Farm resources and craft items" },
      { icon: <Shield size={16} />, text: "Equipment with stat boosts" },
      { icon: <ShoppingBag size={16} />, text: "Player-to-player marketplace" },
      { icon: <Sparkles size={16} />, text: "Scrolls and enhancement system" },
    ],
  },
  // ── Community ──
  {
    id: "rooms",
    category: "community" as FeatureCategory,
    title: "Private Rooms",
    icon: <DoorOpen size={28} />,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    glow: "from-teal-500/10",
    description:
      "Members rent their own private voice channels using coins. They can invite friends, kick unwanted guests, deposit coins to extend the room, and even enable ambient sounds or pomodoro timers inside. Admins manage all rooms from the dashboard.",
    bullets: [
      { icon: <Coins size={16} />, text: "Rent rooms with coins, deposit to extend" },
      { icon: <Users size={16} />, text: "Invite, kick, and transfer ownership" },
      { icon: <Volume2 size={16} />, text: "Ambient sounds inside your room" },
      { icon: <Timer size={16} />, text: "Built-in room pomodoro timer" },
    ],
  },
  {
    id: "sounds",
    category: "community" as FeatureCategory,
    title: "Ambient Sounds",
    icon: <Volume2 size={28} />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "from-cyan-500/10",
    description:
      "A dedicated sound bot joins your voice channels and plays looped ambient audio — rain, campfire, ocean waves, forest, brown noise, and more. Control everything with slash commands or the dashboard. Available for premium servers.",
    bullets: [
      { icon: <Volume2 size={16} />, text: "10 ambient sounds: rain, campfire, ocean, and more" },
      { icon: <Mic size={16} />, text: "Slash commands: /sound, /volume, /nowplaying" },
      { icon: <Monitor size={16} />, text: "Dashboard config for admins" },
      { icon: <Crown size={16} />, text: "Premium feature for your community" },
    ],
  },
  {
    id: "management",
    category: "community" as FeatureCategory,
    title: "Server Management",
    icon: <Shield size={28} />,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "from-violet-500/10",
    description:
      "Powerful moderation and organization tools keep your server running smoothly. Role menus let members self-assign roles with buttons, dropdowns, or reactions. Moderation notes, warnings, pardons, and a ticket system give your staff full control.",
    bullets: [
      { icon: <ListChecks size={16} />, text: "Button, dropdown, and reaction role menus" },
      { icon: <Video size={16} />, text: "Camera and screen-share enforcement channels" },
      { icon: <Shield size={16} />, text: "Mod notes, warnings, pardons, and tickets" },
      { icon: <UserPlus size={16} />, text: "Configurable welcome messages and roles" },
    ],
  },
  {
    id: "dashboard",
    category: "community" as FeatureCategory,
    title: "Web Dashboard",
    icon: <Monitor size={28} />,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    glow: "from-primary/10",
    description:
      "Manage everything from a beautiful web dashboard. 16+ pages cover server config, member stats, moderation tools, economy, rank editor, shop editor, role menus, rooms, ambient sounds, and more. Works on desktop and mobile with 5 color themes.",
    bullets: [
      { icon: <BarChart3 size={16} />, text: "Member stats, leaderboards, and activity" },
      { icon: <Settings size={16} />, text: "Full server configuration from the browser" },
      { icon: <Palette size={16} />, text: "5 color themes: Midnight, Light, Ocean, Forest, Sunset" },
      { icon: <Monitor size={16} />, text: "Mobile-friendly with responsive design" },
    ],
  },
  // ── Premium ──
  {
    id: "premium",
    category: "premium" as FeatureCategory,
    title: "Premium & Customization",
    icon: <Palette size={28} />,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    glow: "from-pink-500/10",
    description:
      "Unlock custom profile skins, visual branding, text customization, ambient sounds, sticky messages, and premium perks with LionHeart subscriptions. LionGems power the cosmetics economy — earnable for free by voting on top.gg.",
    bullets: [
      { icon: <Palette size={16} />, text: "Custom profile card skins" },
      { icon: <MessageSquare size={16} />, text: "Edit any bot message from the dashboard" },
      { icon: <Crown size={16} />, text: "LionHeart server subscriptions" },
      { icon: <Vote size={16} />, text: "Free gems by voting on top.gg" },
    ],
  },
]

// ---------------------------------------------------------------------------
// "More Features" compact grid
// ---------------------------------------------------------------------------
const MORE_FEATURES = [
  {
    icon: <Award size={20} />,
    title: "Profiles & Achievements",
    desc: "Beautiful profile cards with study stats, rank progress, and unlockable achievements.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: <Video size={20} />,
    title: "Video & Screen Channels",
    desc: "Enforce camera-on or screen-share rules in designated study channels automatically.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: <UserPlus size={20} />,
    title: "Welcome & Onboarding",
    desc: "Configurable welcome messages, automatic role assignment, and role persistence on rejoin.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Leaderboard Auto-post",
    desc: "Automatically post leaderboards to any channel on a schedule with custom templates.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: <Pin size={20} />,
    title: "Sticky Messages",
    desc: "Keep important messages pinned to the bottom of a channel. A premium feature.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Text Customization",
    desc: "Edit any bot message from the dashboard to match your server's style and language.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
]

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
const FAQ_ITEMS = [
  {
    q: "Is LionBot free?",
    a: "Yes! LionBot is completely free with all core features included. Premium features like ambient sounds, sticky messages, and visual branding are available through LionHeart subscriptions, and LionGems (for cosmetics) can be earned for free by voting on top.gg.",
  },
  {
    q: "How do I set up LionBot?",
    a: "Just invite Leo to your server and run /dashboard. From there you can configure every feature from the web dashboard. The whole process takes under 2 minutes. We also have a step-by-step setup guide in the tutorials section.",
  },
  {
    q: "What permissions does LionBot need?",
    a: "Leo needs basic permissions like Send Messages, Manage Roles (for rank rewards and role menus), Connect and Speak (for voice tracking and pomodoro alerts), and Manage Channels (for private rooms). The invite link requests everything Leo needs.",
  },
  {
    q: "Can I customize which features are enabled?",
    a: "Absolutely. Every feature can be toggled on or off independently from the dashboard or with /config commands. You can run Leo as a minimal study tracker or enable the full economy, ranks, LionGotchi, and more.",
  },
  {
    q: "How does LionGotchi work?",
    a: "Every member gets a virtual pet lion that grows as they study. Your pet has health, hunger, and happiness stats. You can feed, bathe, and play with it. As you study more, you earn equipment drops, farm resources, craft items, and trade on the marketplace.",
  },
  {
    q: "What do LionGems do?",
    a: "LionGems are a premium currency used to unlock custom profile skins and cosmetics. You can earn them for free by voting for Leo on top.gg every 12 hours (which also gives a 1.25x economy bonus), or purchase gem packs to support development.",
  },
]

// ---------------------------------------------------------------------------
// Stats bar component
// ---------------------------------------------------------------------------
function StatsBar({ stats }: { stats?: PublicStats }) {
  const guilds = useCountUp(stats?.guilds ?? 0)
  const users = useCountUp(stats?.users ?? 0)
  const studyingNow = useCountUp(stats?.studyingNow ?? 0)
  const activeTimers = useCountUp(stats?.activeTimers ?? 0)

  const items = [
    { label: "Servers", value: guilds, suffix: "+" },
    { label: "Total Users", value: users, suffix: "+" },
    { label: "Studying Now", value: studyingNow, suffix: "" },
    { label: "Active Timers", value: activeTimers, suffix: "" },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="text-center p-3 rounded-xl bg-card/30 border border-border/50"
          >
            <div className="text-xl md:text-2xl font-bold text-foreground font-mono tabular-nums">
              {item.value > 0 ? item.value.toLocaleString() : "\u2014"}
              {item.value > 0 && item.suffix}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Feature navigation
// ---------------------------------------------------------------------------
function FeatureNav({
  activeCategory,
  onCategoryClick,
}: {
  activeCategory: FeatureCategory
  onCategoryClick: (cat: FeatureCategory) => void
}) {
  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-none">
          {CATEGORY_META.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
// --- Original code (commented out for rollback) ---
// export default function FeaturesPage() { ... } -- original 7-feature version
// --- End original code ---

export default function FeaturesPage() {
  const { data: stats } = useSWR<PublicStats>("/api/public-stats", statsFetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  })

  const [activeCategory, setActiveCategory] = useState<FeatureCategory>("productivity")
  const categoryRefs = useRef<Record<FeatureCategory, HTMLDivElement | null>>({
    productivity: null,
    gamification: null,
    community: null,
    premium: null,
  })

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const cat of CATEGORY_META) {
      const el = categoryRefs.current[cat.id]
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveCategory(cat.id)
        },
        { rootMargin: "-40% 0px -55% 0px" }
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const handleCategoryClick = useCallback((cat: FeatureCategory) => {
    const el = categoryRefs.current[cat]
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const featuresByCategory = CATEGORY_META.map((cat) => ({
    ...cat,
    features: FEATURES.filter((f) => f.category === cat.id),
  }))

  return (
    <Layout
      SEO={{
        title: "Features - LionBot",
        description:
          "Discover everything LionBot can do for your Discord server: study tracking, ranks, economy, pomodoro timers, private rooms, ambient sounds, LionGotchi pets, and 20+ more features.",
      }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-10 text-center relative">
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
            20+ features to gamify engagement, track activity, reward members, and build a
            thriving community. Leo makes your server a place people want to come back to.
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

      {/* Live Stats Bar */}
      <StatsBar stats={stats} />

      {/* Feature Navigation */}
      <FeatureNav activeCategory={activeCategory} onCategoryClick={handleCategoryClick} />

      {/* Feature Sections by Category */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        {featuresByCategory.map((group) => (
          <div
            key={group.id}
            ref={(el) => {
              categoryRefs.current[group.id] = el
            }}
            className="scroll-mt-16"
          >
            <div className="flex items-center gap-3 mb-12 mt-8 first:mt-0">
              <div className="h-px flex-1 bg-border/50" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                {group.label}
              </h3>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            <div className="space-y-24">
              {group.features.map((feature, index) => {
                const globalIndex = FEATURES.indexOf(feature)
                const isReversed = globalIndex % 2 === 1
                return (
                  <div
                    key={feature.id}
                    id={`feature-${feature.id}`}
                    className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 lg:gap-16`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-3 mb-4">
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
          </div>
        ))}
      </section>

      {/* More Features Grid */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            And There&apos;s More
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Even more tools to make your server the best it can be.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MORE_FEATURES.map((mf) => (
            <div
              key={mf.title}
              className="p-5 rounded-2xl bg-card/30 border border-border/50 hover:border-border transition-colors"
            >
              <div className={`p-2.5 rounded-xl ${mf.bg} ${mf.color} inline-flex mb-3`}>
                {mf.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">{mf.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{mf.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative mt-8 overflow-hidden">
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
                Monthly subscriptions unlock visual branding, text customization, ambient sounds, and exclusive features.
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

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <HelpCircle size={14} />
            FAQ
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-foreground">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
// --- END AI-MODIFIED ---

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
