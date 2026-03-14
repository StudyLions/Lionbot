// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Complete homepage redesign - mobile-first, dashboard design system, feature grid
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
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
import { Homepage_sections_middle, Servers_list, Counters_list } from "@/constants/Homepage";

const INVITE_URL =
  "https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot";
const DISCORD_SERVER = "https://discord.com/invite/studylions";

const featureIcons = [
  BarChart3, Trophy, Mic, Timer, User, Coins, Award, ListTodo, CalendarClock,
];

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, end, duration]);

  return { count, ref };
}

function HeroSection() {
  const { t } = useTranslation("homepage");
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 lg:px-6 lg:pt-24 lg:pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <Sparkles className="h-3 w-3" />
              Trusted by 10,700+ servers
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {t("hero.title")}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 justify-center lg:justify-start">
              <a
                href={INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                {t("hero.addToDiscord")}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/dashboard">
                <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors">
                  {t("hero.viewDashboard")}
                </a>
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
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
    </section>
  );
}

function FeaturesSection() {
  const { t } = useTranslation("homepage");
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("features.title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {Homepage_sections_middle.map((feature, i) => {
            const Icon = featureIcons[i] || BarChart3;
            const keys = [
              "statistics", "leaderboards", "voiceRooms", "pomodoro",
              "profiles", "economy", "badges", "todos", "schedule",
            ];
            const key = keys[i] || "statistics";
            return (
              <div
                key={i}
                className="group rounded-lg border border-border bg-card hover:border-primary/30 transition-all duration-200 overflow-hidden"
              >
                <div className="relative h-40 sm:h-44 overflow-hidden bg-background/50">
                  <Image
                    src={feature.image.src}
                    alt={feature.image.alt}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {t(`features.${key}.title`)}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`features.${key}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  const { t } = useTranslation("homepage");
  return (
    <section className="py-16 lg:py-24 border-t border-border bg-card/30">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">
          {String(t("socialProof.title", { count: "10,700" } as any))}
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

        {/* Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Counters_list.map((counter, i) => {
            const { count, ref } = useCountUp(counter.number);
            const labels = ["sessions", "users", "tasks", "timers"];
            return (
              <div key={i} ref={ref} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary">
                  {count}
                  {counter.last_char}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {t(`socialProof.${labels[i]}`)}
                </div>
              </div>
            );
          })}
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
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
          {t("howItWorks.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
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
    <section className="py-16 lg:py-24 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 lg:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {t("finalCta.title")}
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          {t("finalCta.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {t("finalCta.addToDiscord")}
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href={DISCORD_SERVER}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors"
          >
            {t("finalCta.joinDiscord")}
          </a>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <Layout SEO={HomepageSEO}>
      <div className="bg-background min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <SocialProofSection />
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
