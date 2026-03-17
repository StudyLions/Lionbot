// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Rich unauthenticated landing page shown when a logged-out
//          user visits /dashboard or /pet. Variant-aware hero, feature
//          grid, social proof strip, and bottom CTA.
// ============================================================
import { signIn } from "next-auth/react"
import { motion, type Variants } from "framer-motion"
import useSWR from "swr"
import {
  BarChart3,
  Timer,
  Server,
  History,
  Heart,
  Sprout,
  Hammer,
  Store,
  ArrowRight,
  Sparkles,
  Users,
  Clock,
  Activity,
} from "lucide-react"
import type { ReactNode } from "react"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

interface FeatureCard {
  icon: ReactNode
  title: string
  description: string
  accent: string
  glow: string
}

const dashboardFeatures: FeatureCard[] = [
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Study Statistics",
    description:
      "See your daily, weekly, and monthly study hours with streaks and detailed breakdowns.",
    accent: "text-blue-400",
    glow: "bg-blue-500/10",
  },
  {
    icon: <Timer className="h-6 w-6" />,
    title: "Focus Mode",
    description:
      "Immersive pomodoro timer with ambient sounds, break tips, and picture-in-picture \u2014 on any device.",
    accent: "text-rose-400",
    glow: "bg-rose-500/10",
  },
  {
    icon: <Server className="h-6 w-6" />,
    title: "Server Management",
    description:
      "Configure ranks, economy, role menus, and moderation for your Discord servers.",
    accent: "text-emerald-400",
    glow: "bg-emerald-500/10",
  },
  {
    icon: <History className="h-6 w-6" />,
    title: "Study History",
    description:
      "Full timeline of your sessions with duration, tags, and progress charts.",
    accent: "text-violet-400",
    glow: "bg-violet-500/10",
  },
]

const petFeatures: FeatureCard[] = [
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Your Pet",
    description:
      "A virtual companion that grows as you study. Feed, play, and watch it evolve.",
    accent: "text-pink-400",
    glow: "bg-pink-500/10",
  },
  {
    icon: <Sprout className="h-6 w-6" />,
    title: "Farm",
    description:
      "Plant seeds, harvest crops, and discover rare produce to use in crafting.",
    accent: "text-emerald-400",
    glow: "bg-emerald-500/10",
  },
  {
    icon: <Hammer className="h-6 w-6" />,
    title: "Crafting",
    description:
      "Combine ingredients to create items, food, and gear for your pet.",
    accent: "text-amber-400",
    glow: "bg-amber-500/10",
  },
  {
    icon: <Store className="h-6 w-6" />,
    title: "Marketplace",
    description:
      "Trade items with other students in a live player-driven economy.",
    accent: "text-cyan-400",
    glow: "bg-cyan-500/10",
  },
]

const variantConfig = {
  dashboard: {
    badge: "Your Study Hub",
    heading: "Your Study Command Center",
    subtitle:
      "Track your study sessions, use Focus Mode with ambient sounds, manage your servers, and climb the leaderboard \u2014 all from one place.",
    features: dashboardFeatures,
    accentFrom: "from-blue-500/15",
    accentTo: "to-violet-500/10",
    gradientText: "from-blue-400 to-violet-400",
  },
  pet: {
    badge: "LionGotchi",
    heading: "Meet Your LionGotchi",
    subtitle:
      "Raise your own pet, grow a farm, craft items, and trade on the marketplace \u2014 powered by your study sessions.",
    features: petFeatures,
    accentFrom: "from-amber-500/15",
    accentTo: "to-pink-500/10",
    gradientText: "from-amber-400 to-pink-400",
  },
} as const

interface PublicStats {
  guilds: number
  sessions: number
  users: number
  studyingNow: number
}

const statsFetcher = (url: string) =>
  fetch(url)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (Math.round(n / 100_000) / 10).toFixed(1) + "m"
  if (n >= 1_000) return (Math.round(n / 100) / 10).toFixed(1) + "k"
  return n.toLocaleString()
}

export default function UnauthLanding({
  variant = "dashboard",
}: {
  variant?: "dashboard" | "pet"
}) {
  const config = variantConfig[variant]
  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: SWR v1.x doesn't have isLoading; derive from !data && !error
  const { data: stats, error: statsError } = useSWR<PublicStats>(
    "/api/public-stats",
    statsFetcher,
    { revalidateOnFocus: false }
  )
  const statsLoading = !stats && !statsError
  // --- END AI-MODIFIED ---

  return (
    <div className="min-h-[80vh]">
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Background glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.accentFrom} via-transparent ${config.accentTo} opacity-60 pointer-events-none`}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                {config.badge}
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
            >
              <span
                className={`text-transparent bg-clip-text bg-gradient-to-r ${config.gradientText}`}
              >
                {config.heading}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              {config.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                onClick={() => signIn("discord")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 active:scale-[0.98]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
                Sign in with Discord
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg border border-border/80 text-foreground font-medium hover:bg-accent/80 hover:border-primary/30 transition-all duration-200"
              >
                Learn more
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---- Feature Grid ---- */}
      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {config.features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i}
                className="group relative rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className={`absolute inset-0 rounded-xl ${feature.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div
                    className={`inline-flex items-center justify-center w-11 h-11 rounded-lg ${feature.glow} ${feature.accent} mb-4`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- Social Proof Strip ---- */}
      {stats && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          custom={0}
          className="py-12 border-y border-border/50"
        >
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <StatItem
                icon={<Users className="h-4 w-4" />}
                value={formatNumber(stats.guilds)}
                label="Servers"
                loading={statsLoading}
              />
              <StatItem
                icon={<Clock className="h-4 w-4" />}
                value={formatNumber(stats.sessions)}
                label="Study sessions"
                loading={statsLoading}
              />
              <StatItem
                icon={<Activity className="h-4 w-4" />}
                value={formatNumber(stats.studyingNow)}
                label="Studying now"
                live
                loading={statsLoading}
              />
              <StatItem
                icon={<BarChart3 className="h-4 w-4" />}
                value={formatNumber(stats.users)}
                label="Students"
                loading={statsLoading}
              />
            </div>
          </div>
        </motion.section>
      )}

      {/* ---- Bottom CTA ---- */}
      <section className="relative py-20 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="relative max-w-2xl mx-auto px-4 lg:px-6 text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-2xl sm:text-3xl font-bold text-foreground"
          >
            Ready to get started?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="mt-4 text-muted-foreground"
          >
            Connect your Discord account in one click. It&apos;s free, instant, and only takes read-only access to your servers.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="mt-8">
            <button
              onClick={() => signIn("discord")}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 active:scale-[0.98]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Sign in with Discord
            </button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

function StatItem({
  icon,
  value,
  label,
  live = false,
  loading = false,
}: {
  icon: ReactNode
  value: string
  label: string
  live?: boolean
  loading?: boolean
}) {
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold text-foreground">
        {loading ? (
          <span className="inline-block w-12 h-7 bg-muted rounded animate-pulse" />
        ) : (
          value
        )}
      </div>
      <div className="mt-1 text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1.5">
        {live && !loading && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        )}
        {icon}
        {label}
      </div>
    </div>
  )
}
