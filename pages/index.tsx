// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Complete homepage redesign - mobile-first, dashboard design system, feature grid
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Live stats from database via /api/public-stats (replaces hardcoded counters)
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import useSWR from "swr";
import {
  BarChart3,
  Trophy,
  Mic,
  Timer,
  User,
  Coins,
  Award,
  ListTodo,
  CalendarClock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Layout from "@/components/Layout/Layout";
import { HomepageSEO } from "@/constants/SeoData";
import { Servers_list } from "@/constants/Homepage";

const INVITE_URL =
  "https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot";
const DISCORD_SERVER = "https://discord.com/invite/studylions";

const heroFeatures = [
  { Icon: BarChart3, key: "statistics", gradient: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400", ringColor: "ring-blue-500/20", glowFrom: "from-blue-500/15", dotColor: "bg-blue-400" },
  { Icon: Trophy, key: "leaderboards", gradient: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-400", ringColor: "ring-amber-500/20", glowFrom: "from-amber-500/15", dotColor: "bg-amber-400" },
  { Icon: Timer, key: "pomodoro", gradient: "from-rose-500/20 to-rose-600/5", iconColor: "text-rose-400", ringColor: "ring-rose-500/20", glowFrom: "from-rose-500/15", dotColor: "bg-rose-400" },
  { Icon: Coins, key: "economy", gradient: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-400", ringColor: "ring-emerald-500/20", glowFrom: "from-emerald-500/15", dotColor: "bg-emerald-400" },
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

function HeroSection({ guildCount }: { guildCount?: number }) {
  const { t } = useTranslation("homepage");
  const displayGuilds = guildCount ? formatGuildCount(guildCount) : "10,700";
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 lg:px-6 lg:pt-32 lg:pb-28">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              Trusted by {displayGuilds}+ servers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-10 justify-center lg:justify-start">
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
                <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg border border-border text-foreground font-medium hover:bg-accent hover:border-primary/30 transition-all duration-200">
                  {t("hero.viewDashboard")}
                </a>
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            {/* Glow behind image */}
            <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15),_transparent_70%)] blur-xl" />
            <div className="relative">
              <Image
                src={require("@/public/images/pages/homePage/lionbot_banner.webp")}
                alt="LionBot Discord Bot"
                width={600}
                height={400}
                layout="responsive"
                priority
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useTranslation("homepage");
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("features.title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        {/* Hero feature rows -- alternating layout */}
        <div className="space-y-16 lg:space-y-24">
          {heroFeatures.map((feature, i) => {
            const isReversed = i % 2 === 1;
            return (
              <div
                key={feature.key}
                className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 lg:gap-16`}
              >
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="relative">
                    <div className={`absolute -inset-6 bg-gradient-to-br ${feature.glowFrom} to-transparent rounded-3xl blur-2xl opacity-40`} />
                    <div className={`relative w-36 h-36 lg:w-44 lg:h-44 rounded-2xl bg-gradient-to-br ${feature.gradient} ring-1 ${feature.ringColor} flex items-center justify-center`}>
                      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${feature.dotColor} opacity-30`} />
                      <div className={`absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full ${feature.dotColor} opacity-20`} />
                      <feature.Icon className={`h-14 w-14 lg:h-16 lg:w-16 ${feature.iconColor}`} strokeWidth={1.5} />
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
              </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {compactFeatures.map((feature) => (
            <div
              key={feature.key}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProofSection({ stats }: { stats?: PublicStats }) {
  const { t } = useTranslation("homepage");
  const loading = !stats;
  const displayGuilds = stats ? formatGuildCount(stats.guilds) : "10,700";

  const sessionsFmt = stats ? formatLargeNumber(stats.sessions) : { display: 0, suffix: "m", decimals: 1 };
  const usersFmt = stats ? formatLargeNumber(stats.users) : { display: 0, suffix: "k", decimals: 0 };

  return (
    <section className="py-20 lg:py-28 border-t border-border/50 bg-card/20">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">
          {String(t("socialProof.title", { count: displayGuilds } as any))}
        </h2>

        {/* Server logos */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 mb-14 overflow-x-auto scrollbar-hide py-2">
          {Servers_list.map((server, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-border bg-background hover:border-primary/40 transition-colors"
            >
              <Image
                src={server.img.src}
                alt={server.img.alt}
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
          ))}
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCounter
            value={sessionsFmt.display}
            suffix={sessionsFmt.suffix}
            label={t("socialProof.sessions")}
            decimals={sessionsFmt.decimals}
            loading={loading}
          />
          <StatCounter
            value={usersFmt.display}
            suffix={usersFmt.suffix}
            label={t("socialProof.users")}
            decimals={usersFmt.decimals}
            loading={loading}
          />
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

function HowItWorksSection() {
  const { t } = useTranslation("homepage");
  const steps = [
    { num: "1", key: "step1" },
    { num: "2", key: "step2" },
    { num: "3", key: "step3" },
  ];
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-14">
          {t("howItWorks.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-5 shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
                {step.num}
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">
                {t(`howItWorks.${step.key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`howItWorks.${step.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  const { t } = useTranslation("homepage");
  return (
    <section className="py-20 lg:py-28 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_50%,_rgba(59,130,246,0.06),_transparent_70%)]" />
      <div className="relative max-w-3xl mx-auto px-4 lg:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {t("finalCta.title")}
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          {t("finalCta.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
          >
            {t("finalCta.addToDiscord")}
            <ArrowRight className="h-4 w-4" />
          </a>
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
    </section>
  );
}

export default function HomePage() {
  const { data: stats } = useSWR<PublicStats>("/api/public-stats", statsFetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });

  return (
    <Layout SEO={HomepageSEO}>
      <div className="bg-background min-h-screen">
        <HeroSection guildCount={stats?.guilds} />
        <FeaturesSection />
        <SocialProofSection stats={stats} />
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
