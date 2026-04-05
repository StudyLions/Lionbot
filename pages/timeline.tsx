// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-05
// Purpose: Public timeline/changelog page showing all LionBot updates
// ============================================================
import React, { useState, useMemo } from "react";
import Layout from "@/components/Layout/Layout";
import { motion } from "framer-motion";
import {
  Sparkles,
  Wrench,
  Bug,
  Globe,
  Heart,
  Crown,
  Filter,
  Calendar,
  Zap,
  ChevronDown,
  Bot,
  Monitor,
  ArrowUp,
} from "lucide-react";
import {
  TIMELINE_ENTRIES,
  TIMELINE_STATS,
  TimelineCategory,
  TimelineEntry,
} from "@/constants/TimelineData";

const CATEGORY_CONFIG: Record<
  TimelineCategory,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string; dot: string; badge: string }
> = {
  feature: {
    label: "New Feature",
    icon: Sparkles,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  improvement: {
    label: "Improvement",
    icon: Wrench,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  bugfix: {
    label: "Bug Fix",
    icon: Bug,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
    badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  liongotchi: {
    label: "LionGotchi",
    icon: Heart,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  premium: {
    label: "Premium",
    icon: Crown,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    dot: "bg-yellow-400",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  website: {
    label: "Website",
    icon: Globe,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    dot: "bg-violet-400",
    badge: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
};

const AREA_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  bot: { label: "Bot", icon: Bot },
  website: { label: "Website", icon: Monitor },
  both: { label: "Bot & Website", icon: Zap },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function groupByDate(entries: TimelineEntry[]): { date: string; entries: TimelineEntry[] }[] {
  const groups: { date: string; entries: TimelineEntry[] }[] = [];
  let current: { date: string; entries: TimelineEntry[] } | null = null;
  for (const entry of entries) {
    if (!current || current.date !== entry.date) {
      current = { date: entry.date, entries: [] };
      groups.push(current);
    }
    current.entries.push(entry);
  }
  return groups;
}

function TimelineCard({ entry, index }: { entry: TimelineEntry; index: number }) {
  const cat = CATEGORY_CONFIG[entry.category];
  const area = AREA_CONFIG[entry.area];
  const Icon = cat.icon;
  const AreaIcon = area.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative pl-8 sm:pl-10"
    >
      {/* Timeline dot */}
      <div
        className={`absolute left-0 top-2 w-3 h-3 rounded-full ${cat.dot} ring-4 ring-background z-10`}
      />

      <div
        className={`rounded-xl border ${cat.border} ${cat.bg} p-4 sm:p-5 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg`}
      >
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {/* Category badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cat.badge}`}
          >
            <Icon className="w-3 h-3" />
            {cat.label}
          </span>

          {/* Area badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-muted-foreground border border-white/10">
            <AreaIcon className="w-3 h-3" />
            {area.label}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug mb-1.5">
          {entry.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {entry.description}
        </p>
      </div>
    </motion.div>
  );
}

function StatCard({
  value,
  label,
  icon: Icon,
  color,
}: {
  value: number;
  label: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-1 px-6 py-4"
    >
      <Icon className={`w-5 h-5 ${color} mb-1`} />
      <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{value}</span>
      <span className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</span>
    </motion.div>
  );
}

const ALL_CATEGORIES: { key: TimelineCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "feature", label: "Features" },
  { key: "liongotchi", label: "LionGotchi" },
  { key: "premium", label: "Premium" },
  { key: "improvement", label: "Improvements" },
  { key: "website", label: "Website" },
  { key: "bugfix", label: "Bug Fixes" },
];

export default function TimelinePage() {
  const [filter, setFilter] = useState<TimelineCategory | "all">("all");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return TIMELINE_ENTRIES;
    return TIMELINE_ENTRIES.filter((e) => e.category === filter);
  }, [filter]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  React.useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Layout
      SEO={{
        title: "What's New — LionBot Updates",
        description:
          "See everything we've been working on: new features, improvements, bug fixes, and more. We're always building and improving LionBot for you.",
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute top-32 right-1/4 w-64 h-64 rounded-full bg-violet-500/5 blur-3xl" />

          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                Updated regularly
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-4">
                What&apos;s New
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Every feature we&apos;ve shipped, every bug we&apos;ve squashed, and every improvement we&apos;ve made.
                We&apos;re always working to make LionBot better for you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-2xl mx-auto px-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center divide-x divide-border rounded-2xl border border-border bg-card/50 backdrop-blur-sm"
          >
            <StatCard
              value={TIMELINE_STATS.totalFeatures}
              label="Features Shipped"
              icon={Sparkles}
              color="text-emerald-400"
            />
            <StatCard
              value={TIMELINE_STATS.totalBugFixes}
              label="Bugs Squashed"
              icon={Bug}
              color="text-rose-400"
            />
            <StatCard
              value={TIMELINE_STATS.totalUpdates}
              label="Total Updates"
              icon={Zap}
              color="text-blue-400"
            />
          </motion.div>
        </section>

        {/* Filter */}
        <section className="max-w-3xl mx-auto px-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter by</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const isActive = filter === cat.key;
              const config = cat.key !== "all" ? CATEGORY_CONFIG[cat.key] : null;
              return (
                <button
                  key={cat.key}
                  onClick={() => setFilter(cat.key)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150
                    ${
                      isActive
                        ? config
                          ? `${config.badge}`
                          : "bg-foreground/10 text-foreground border-foreground/20"
                        : "bg-transparent text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                    }
                  `}
                >
                  {cat.label}
                  {filter === cat.key && cat.key !== "all" && (
                    <span className="ml-1.5 text-xs opacity-70">
                      ({filtered.length})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Timeline */}
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[5px] sm:left-[7px] top-0 bottom-0 w-px bg-border" />

            <div className="space-y-10">
              {groups.map((group) => (
                <div key={group.date}>
                  {/* Date header */}
                  <div className="relative pl-8 sm:pl-10 mb-4">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground/20 ring-4 ring-background z-10" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-background px-2 py-1 rounded-md border border-border">
                        {formatDateFull(group.date)}
                      </span>
                      <span className="text-xs text-muted-foreground/50">
                        {group.entries.length} update{group.entries.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Entries */}
                  <div className="space-y-3">
                    {group.entries.map((entry, i) => (
                      <TimelineCard key={`${entry.date}-${i}`} entry={entry} index={i} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* End marker */}
            <div className="relative pl-8 sm:pl-10 mt-10">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10" />
              <p className="text-sm text-muted-foreground italic">
                And this is just the beginning — more updates on the way!
              </p>
            </div>
          </div>
        </section>

        {/* Scroll to top */}
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  const { serverSideTranslations } = await import("next-i18next/serverSideTranslations");
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
}
