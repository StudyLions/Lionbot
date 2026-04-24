// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Complete homepage redesign - mobile-first, dashboard design system, feature grid
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Live stats from database via /api/public-stats (replaces hardcoded counters)
// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Add LionGotchi showcase sections (Pet Room, Farm, Marketplace) + framer-motion
// --- AI-MODIFIED (2026-04-24) ---
// Purpose: Bold creative overhaul -- redesigned hero with floating live-activity card,
//          compact trust strip below hero, consolidated LionGotchi sub-tabbed section,
//          new PremiumTeaser bridge to /donate, illustrated how-it-works steps with
//          tiny mockups, bolder gradient final-CTA banner. Reorders sections to a
//          tighter narrative: Hero -> Trust -> Features -> LionGotchi -> Live counters
//          -> Trailer -> Premium teaser -> How it works -> Final CTA.
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import useSWR from "swr";
import { motion, type Variants } from "framer-motion";
import {
  Mic,
  User,
  Award,
  ListTodo,
  CalendarClock,
  ArrowRight,
  Sparkles,
  Play,
  Crown,
  Users,
  Settings,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import Layout from "@/components/Layout/Layout";
import { HomepageSEO } from "@/constants/SeoData";
import { Servers_list } from "@/constants/Homepage";
import {
  StatisticsDemo,
  LeaderboardDemo,
  PomodoroDemo,
  EconomyDemo,
} from "@/components/homepage/FeatureDemos";
import LionGotchiTabbedSection from "@/components/homepage/LionGotchiTabbedSection";
import PremiumTeaser from "@/components/homepage/PremiumTeaser";

const INVITE_URL =
  "https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot";
const DISCORD_SERVER = "https://discord.com/invite/studylions";

const heroFeatures = [
  { key: "statistics", Demo: StatisticsDemo, glowFrom: "from-blue-500/15", dotColor: "bg-blue-400" },
  { key: "leaderboards", Demo: LeaderboardDemo, glowFrom: "from-amber-500/15", dotColor: "bg-amber-400" },
  { key: "pomodoro", Demo: PomodoroDemo, glowFrom: "from-rose-500/15", dotColor: "bg-rose-400" },
  { key: "economy", Demo: EconomyDemo, glowFrom: "from-emerald-500/15", dotColor: "bg-emerald-400" },
];

const compactFeatures = [
  { Icon: Mic, key: "voiceRooms", color: "text-violet-400", bg: "bg-violet-500/10" },
  { Icon: User, key: "profiles", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { Icon: Award, key: "badges", color: "text-orange-400", bg: "bg-orange-500/10" },
  { Icon: ListTodo, key: "todos", color: "text-pink-400", bg: "bg-pink-500/10" },
  { Icon: CalendarClock, key: "schedule", color: "text-teal-400", bg: "bg-teal-500/10" },
];

interface PublicStats {
  guilds: number;
  sessions: number;
  users: number;
  tasks: number;
  studyingNow: number;
  activeTimers: number;
}

const statsFetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Stats fetch failed");
    return r.json();
  });

function formatLargeNumber(n: number): { display: number; suffix: string; decimals: number } {
  if (n >= 1_000_000) return { display: Math.round(n / 100_000) / 10, suffix: "m", decimals: 1 };
  if (n >= 100_000) return { display: Math.round(n / 1_000), suffix: "k", decimals: 0 };
  if (n >= 10_000) return { display: Math.round(n / 100) / 10, suffix: "k", decimals: 1 };
  return { display: n, suffix: "", decimals: 0 };
}

function formatGuildCount(n: number): string {
  const rounded = Math.floor(n / 100) * 100;
  return rounded.toLocaleString();
}

function StatCounter({
  value,
  suffix,
  label,
  isLive = false,
  decimals = 0,
  loading = false,
}: {
  value: number;
  suffix: string;
  label: string;
  isLive?: boolean;
  decimals?: number;
  loading?: boolean;
}) {
  const [displayCount, setDisplayCount] = useState(0);
  const hasAnimated = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(value);
  targetRef.current = value;

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || loading) return;
    if (hasAnimated.current) {
      setDisplayCount(value);
      return;
    }
    let frame: number;
    const startTime = performance.now();
    const duration = 2000;
    const factor = Math.pow(10, decimals);
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(eased * targetRef.current * factor) / factor);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        hasAnimated.current = true;
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isVisible, value, loading, decimals]);

  const formatted = decimals > 0 ? displayCount.toFixed(decimals) : displayCount.toLocaleString();

  return (
    <div ref={elRef} className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-primary">
        {loading ? (
          <span className="inline-block w-16 h-9 bg-primary/10 rounded animate-pulse" />
        ) : (
          <>
            {formatted}
            {suffix}
          </>
        )}
      </div>
      <div className="mt-1 text-sm text-muted-foreground flex items-center justify-center gap-1.5">
        {isLive && !loading && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        )}
        {label}
      </div>
    </div>
  );
}

// --- AI-MODIFIED (2026-04-24) ---
// Purpose: Compact "live activity card" overlay used in the redesigned hero.
//          Sits as a floating mock to the right of the headline. Shows three
//          live numbers (studying, voice, lifetime sessions) with a pulse dot
//          to give the hero immediate "this is real, right now" energy.
function LiveActivityCard({ stats, loading }: { stats?: PublicStats; loading: boolean }) {
  const { t } = useTranslation("homepage");

  const sessionsFmt = stats ? formatLargeNumber(stats.sessions) : { display: 0, suffix: "m", decimals: 1 };

  return (
    <div className="relative">
      <style>{`
        @keyframes hero-card-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes hero-card-glow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.55; }
        }
      `}</style>
      <div
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.25), transparent 70%)",
          animation: "hero-card-glow 4s ease-in-out infinite",
        }}
      />
      <div
        className="relative rounded-2xl border border-border bg-card/85 backdrop-blur-md shadow-2xl shadow-primary/10 overflow-hidden"
        style={{ animation: "hero-card-float 6s ease-in-out infinite" }}
      >
        <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-border/60">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-foreground">
            {t("hero.liveCardTitle")}
          </span>
        </div>

        <div className="px-5 py-4 space-y-3 min-w-[260px]">
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-3xl font-bold text-foreground tabular-nums">
              {loading ? (
                <span className="inline-block w-16 h-8 bg-muted rounded animate-pulse" />
              ) : (
                (stats?.studyingNow ?? 0).toLocaleString()
              )}
            </div>
            <div className="text-xs text-muted-foreground">{t("hero.liveCardStudying")}</div>
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {loading ? (
                <span className="inline-block w-12 h-6 bg-muted rounded animate-pulse" />
              ) : (
                (stats?.activeTimers ?? 0).toLocaleString()
              )}
            </div>
            <div className="text-xs text-muted-foreground">{t("hero.liveCardActive")}</div>
          </div>

          <div className="pt-3 border-t border-border/60">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              {t("hero.liveCardSessions")}
            </div>
            <div className="text-xl font-bold text-primary tabular-nums">
              {loading ? (
                <span className="inline-block w-16 h-6 bg-primary/10 rounded animate-pulse" />
              ) : (
                <>
                  {sessionsFmt.decimals > 0 ? sessionsFmt.display.toFixed(sessionsFmt.decimals) : sessionsFmt.display.toLocaleString()}
                  {sessionsFmt.suffix}
                </>
              )}
            </div>
          </div>

          <div className="flex -space-x-2 pt-2">
            {Servers_list.slice(0, 5).map((server, i) => (
              <div
                key={i}
                className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-card"
              >
                <Image
                  src={server.img.src}
                  alt={server.img.alt}
                  width={28}
                  height={28}
                />
              </div>
            ))}
            <div className="relative w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] font-bold text-muted-foreground">
              +10k
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- AI-MODIFIED (2026-04-24) ---
// Purpose: New hero with floating live-activity card on the right and a
//          compact trust micro-bar under the CTAs (Top.gg verified · servers
//          · Free forever). Replaces the single-column variant with a
//          two-column split that gives the page immediate visual depth.
function HeroSection({ stats, loading }: { stats?: PublicStats; loading: boolean }) {
  const { t } = useTranslation("homepage");
  const guildCount = stats?.guilds;
  const displayGuilds = guildCount ? formatGuildCount(guildCount) : "10,700";
  return (
    <section className="relative overflow-hidden min-h-[480px] lg:min-h-[640px]">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <Image
          src={require("@/public/images/pages/homePage/lionbot_banner.webp")}
          alt=""
          layout="fill"
          objectFit="cover"
          objectPosition="right center"
          priority
          className="opacity-25 lg:opacity-30"
        />
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/40 lg:to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/4 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 lg:px-6 lg:pt-32 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Trusted by {displayGuilds}+ servers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
              <a
                href={INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
              >
                {t("hero.addToDiscord")}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/dashboard">
                <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg border border-border/80 text-foreground font-medium hover:bg-accent/80 hover:border-primary/30 transition-all duration-200 backdrop-blur-sm">
                  {t("hero.viewDashboard")}
                </a>
              </Link>
            </div>

            {/* Trust micro-bar under CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Top.gg verified
              </span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {displayGuilds}+ servers
              </span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Free forever
              </span>
            </div>
          </div>

          <div className="hidden lg:flex justify-end">
            <LiveActivityCard stats={stats} loading={loading} />
          </div>
        </div>
      </div>
    </section>
  );
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-24) ---
// Purpose: Compact horizontal trust strip placed right below the hero. Single
//          row of server logos (sized down) + 3 key stats. Acts as immediate
//          social proof above the fold without rebuilding SocialProofSection.
function TrustStrip({ stats }: { stats?: PublicStats }) {
  const { t } = useTranslation("homepage");
  const loading = !stats;
  const sessionsFmt = stats ? formatLargeNumber(stats.sessions) : { display: 0, suffix: "m", decimals: 1 };
  const usersFmt = stats ? formatLargeNumber(stats.users) : { display: 0, suffix: "k", decimals: 0 };
  const guildsFmt = stats ? formatLargeNumber(stats.guilds) : { display: 0, suffix: "k", decimals: 1 };

  return (
    <section className="relative border-y border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-7">
        <div className="flex flex-col lg:flex-row items-center gap-5 lg:gap-8">
          <div className="flex-shrink-0 flex items-center gap-3">
            <span className="hidden lg:inline-block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("trustStrip.label")}
            </span>
            <div className="flex items-center gap-1.5">
              {Servers_list.slice(0, 8).map((server, i) => (
                <div
                  key={i}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-border bg-background"
                  title={server.img.alt}
                >
                  <Image
                    src={server.img.src}
                    alt={server.img.alt}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-3 lg:gap-6 w-full">
            <div className="text-center lg:text-left">
              <div className="text-lg sm:text-xl font-bold text-foreground tabular-nums">
                {loading ? (
                  <span className="inline-block w-12 h-5 bg-muted rounded animate-pulse" />
                ) : (
                  <>
                    {guildsFmt.decimals > 0 ? guildsFmt.display.toFixed(guildsFmt.decimals) : guildsFmt.display.toLocaleString()}
                    {guildsFmt.suffix}
                  </>
                )}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                {t("trustStrip.stat1Label")}
              </div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-lg sm:text-xl font-bold text-foreground tabular-nums">
                {loading ? (
                  <span className="inline-block w-12 h-5 bg-muted rounded animate-pulse" />
                ) : (
                  <>
                    {usersFmt.decimals > 0 ? usersFmt.display.toFixed(usersFmt.decimals) : usersFmt.display.toLocaleString()}
                    {usersFmt.suffix}
                  </>
                )}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                {t("trustStrip.stat2Label")}
              </div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-lg sm:text-xl font-bold text-foreground tabular-nums">
                {loading ? (
                  <span className="inline-block w-12 h-5 bg-muted rounded animate-pulse" />
                ) : (
                  <>
                    {sessionsFmt.decimals > 0 ? sessionsFmt.display.toFixed(sessionsFmt.decimals) : sessionsFmt.display.toLocaleString()}
                    {sessionsFmt.suffix}
                  </>
                )}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                {t("trustStrip.stat3Label")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-07) ---
// Purpose: Add YouTube trailer section after the hero
function TrailerSection() {
  return (
    <section className="py-16 lg:py-24 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_50%_50%,_rgba(59,130,246,0.06),_transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto px-4 lg:px-6">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Play className="h-3.5 w-3.5" />
            Watch the trailer
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            See LionBot in Action
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Discover how LionBot transforms your Discord server into a productive study community.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 via-blue-500/10 to-violet-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/80 bg-card shadow-2xl shadow-primary/5">
              <iframe
                src="https://www.youtube-nocookie.com/embed/488nXnp3kXs?rel=0&modestbranding=1"
                title="LionBot Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
// --- END AI-MODIFIED ---

const featureFadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const featureStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function FeaturesSection() {
  const { t } = useTranslation("homepage");
  return (
    <section className="py-20 lg:py-28 border-t border-border/50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <motion.div
          className="text-center mb-16 lg:mb-20"
          variants={featureFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("features.title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </motion.div>

        {/* Hero feature rows -- alternating layout */}
        <div className="space-y-16 lg:space-y-24">
          {heroFeatures.map((feature, i) => {
            const isReversed = i % 2 === 1;
            return (
              <motion.div
                key={feature.key}
                className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 lg:gap-16`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="relative">
                    <div className={`absolute -inset-6 bg-gradient-to-br ${feature.glowFrom} to-transparent rounded-3xl blur-2xl opacity-40`} />
                    <div className="relative">
                      <feature.Demo />
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-xl lg:text-2xl font-semibold text-foreground mb-3">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                    {t(`features.${feature.key}.description`)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border text-xs text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full ${feature.dotColor}`} />
                      {t(`features.${feature.key}.highlight1`)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border text-xs text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full ${feature.dotColor}`} />
                      {t(`features.${feature.key}.highlight2`)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-16 lg:my-20">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm font-medium text-muted-foreground">
            {t("features.andMore")}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Compact features grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={featureStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {compactFeatures.map((feature) => (
            <motion.div
              key={feature.key}
              variants={featureFadeUp}
              whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
              className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card/50 hover:border-primary/20 transition-colors"
            >
              <div className={`p-2 rounded-lg ${feature.bg} flex-shrink-0`}>
                <feature.Icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <div>
                <h4 className="font-medium text-foreground text-sm">
                  {t(`features.${feature.key}.title`)}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {t(`features.${feature.key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// --- AI-MODIFIED (2026-04-24) ---
// Purpose: Slimmed-down "studying right now" interlude. The previous
//          SocialProofSection's server-logo row + counters moved to the
//          TrustStrip below the hero. This now keeps only the live counters
//          as a midpage moment of social proof between content sections.
function LiveStudyingInterlude({ stats }: { stats?: PublicStats }) {
  const { t } = useTranslation("homepage");
  const loading = !stats;

  return (
    <section className="py-16 lg:py-20 border-t border-border/50 bg-card/20">
      <div className="max-w-4xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 gap-4 lg:gap-8">
          <StatCounter
            value={stats?.studyingNow ?? 0}
            suffix=""
            label={t("socialProof.studyingNow")}
            isLive
            loading={loading}
          />
          <StatCounter
            value={stats?.activeTimers ?? 0}
            suffix=""
            label={t("socialProof.timers")}
            isLive
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-24) ---
// Purpose: Replace generic numbered circles with three illustrated steps that
//          actually show what each step looks like (invite button mock,
//          dashboard tile mock, live stats tile mock). Makes the path from
//          "add to Discord" to "live community" feel concrete instead of
//          abstract.
function HowItWorksSection() {
  const { t } = useTranslation("homepage");

  return (
    <section className="py-20 lg:py-28 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_50%_30%,_rgba(59,130,246,0.05),_transparent_70%)]" />

      <div className="relative max-w-6xl mx-auto px-4 lg:px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("howItWorks.title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          variants={featureStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Step 1 -- invite button mock */}
          <motion.div variants={featureFadeUp} className="group">
            <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 h-full hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-bold">
                  1
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Step
                </span>
              </div>

              {/* Mini invite button mockup */}
              <div className="rounded-xl border border-border bg-background/60 p-4 mb-5">
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20">
                    <ArrowRight className="h-3 w-3" />
                    Add to Discord
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground justify-center">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Authorized in 1 click
                </div>
              </div>

              <h3 className="font-semibold text-foreground text-base mb-1.5">
                {t("howItWorks.step1.title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("howItWorks.step1.description")}
              </p>
            </div>
          </motion.div>

          {/* Step 2 -- dashboard tile mock */}
          <motion.div variants={featureFadeUp} className="group">
            <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 h-full hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/15 text-violet-300 text-sm font-bold">
                  2
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Step
                </span>
              </div>

              {/* Mini dashboard mockup */}
              <div className="rounded-xl border border-border bg-background/60 p-3 mb-5 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                  <Settings className="h-3 w-3 text-violet-300" />
                  <span className="text-[10px] font-semibold text-foreground">
                    Server settings
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">
                    Voice tracking
                  </span>
                  <div className="w-6 h-3 rounded-full bg-emerald-500/30 relative">
                    <div className="absolute right-0.5 top-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">
                    Pomodoro timers
                  </span>
                  <div className="w-6 h-3 rounded-full bg-emerald-500/30 relative">
                    <div className="absolute right-0.5 top-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">
                    Role rewards
                  </span>
                  <div className="w-6 h-3 rounded-full bg-emerald-500/30 relative">
                    <div className="absolute right-0.5 top-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-foreground text-base mb-1.5">
                {t("howItWorks.step2.title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("howItWorks.step2.description")}
              </p>
            </div>
          </motion.div>

          {/* Step 3 -- live stats tile mock */}
          <motion.div variants={featureFadeUp} className="group">
            <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 h-full hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 text-sm font-bold">
                  3
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Step
                </span>
              </div>

              {/* Mini live stats mockup */}
              <div className="rounded-xl border border-border bg-background/60 p-3 mb-5 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-semibold text-foreground">
                      Live activity
                    </span>
                  </div>
                  <TrendingUp className="h-3 w-3 text-emerald-300" />
                </div>
                <div>
                  <div className="text-base font-bold text-foreground tabular-nums">
                    142
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    studying right now
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-2.5 w-2.5 text-muted-foreground" />
                  <div className="flex -space-x-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 border border-card"
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-muted-foreground">
                    +138 more
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-foreground text-base mb-1.5">
                {t("howItWorks.step3.title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("howItWorks.step3.description")}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-24) ---
// Purpose: Bolder full-width gradient banner with three CTAs
//          (Add to Discord / View Premium / Join Discord) replacing the
//          previous small radial-gradient block. Final visual punctuation
//          before the footer that ties homepage and donate page together.
function FinalCTASection() {
  const { t } = useTranslation("homepage");
  return (
    <section className="relative py-20 lg:py-28 border-t border-border/50 overflow-hidden">
      <style>{`
        @keyframes final-cta-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(900px circle at 30% 50%, rgba(244, 114, 182, 0.10), transparent 60%), radial-gradient(700px circle at 80% 60%, rgba(245, 158, 11, 0.08), transparent 60%)",
        }}
      />
      <div className="relative max-w-5xl mx-auto px-4 lg:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 backdrop-blur-sm">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(244, 114, 182, 0.12), rgba(168, 85, 247, 0.08), rgba(245, 158, 11, 0.10), rgba(244, 114, 182, 0.12))",
              backgroundSize: "200% 200%",
              animation: "final-cta-shimmer 12s ease-in-out infinite",
            }}
          />
          <div className="relative px-6 py-12 lg:py-16 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight max-w-2xl mx-auto leading-[1.1]">
              {t("finalCta.title")}
            </h2>
            <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-xl mx-auto">
              {t("finalCta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
              <a
                href={INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
              >
                {t("finalCta.addToDiscord")}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/donate">
                <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-white font-medium hover:brightness-110 transition-all duration-200"
                  style={{
                    background:
                      "linear-gradient(135deg, #f472b6, #a855f7, #f59e0b)",
                    boxShadow:
                      "0 10px 30px -10px rgba(244, 114, 182, 0.5)",
                  }}>
                  <Crown className="h-4 w-4" />
                  {t("finalCta.viewPremium")}
                </a>
              </Link>
              <a
                href={DISCORD_SERVER}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg border border-border text-foreground font-medium hover:bg-accent hover:border-primary/30 transition-all duration-200"
              >
                {t("finalCta.joinDiscord")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
// --- END AI-MODIFIED ---

export default function HomePage() {
  const { data: stats } = useSWR<PublicStats>("/api/public-stats", statsFetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });
  const loading = !stats;

  return (
    <Layout SEO={HomepageSEO}>
      <div className="bg-background min-h-screen">
        <HeroSection stats={stats} loading={loading} />
        <TrustStrip stats={stats} />
        <FeaturesSection />
        <LionGotchiTabbedSection />
        <LiveStudyingInterlude stats={stats} />
        <TrailerSection />
        <PremiumTeaser />
        <HowItWorksSection />
        <FinalCTASection />
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "homepage"])),
  },
});
// --- END AI-MODIFIED ---
