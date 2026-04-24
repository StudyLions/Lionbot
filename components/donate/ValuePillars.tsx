// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: 3-column outcome promises section that sells the
//          "why upgrade" before showing prices. Each pillar
//          has a glowing icon and a small visual flourish.
// ============================================================
import { TrendingUp, Sprout, Sparkles, Check } from "lucide-react";

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || "";

function GemIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <img
      src={`${BLOB_BASE}/pet-assets/ui/icons/gem.png`}
      alt=""
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

interface Pillar {
  id: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  accent: string;
  highlights: string[];
}

interface ValuePillarsProps {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
}

export default function ValuePillars({
  eyebrow = "Why upgrade",
  heading = "Three reasons people stay subscribed",
  subheading = "Every LionHeart tier delivers more rewards, a stronger pet, and exclusive style \u2014 month after month.",
}: ValuePillarsProps) {
  const pillars: Pillar[] = [
    {
      id: "rewards",
      title: "Get rewarded for everything",
      body: "Every study session, every vote, every drop \u2014 you earn more of all of it.",
      accent: "#fbbf24",
      icon: <TrendingUp className="h-7 w-7" style={{ color: "#fbbf24" }} />,
      highlights: [
        "Up to 3,000 LionGems / month",
        "2x LionCoins from every vote",
        "+50% drop rate on items",
      ],
    },
    {
      id: "pet",
      title: "Master the LionGotchi",
      body: "Faster growth, longer water, and on the top tier \u2014 plants that never die.",
      accent: "#34d399",
      icon: <Sprout className="h-7 w-7" style={{ color: "#34d399" }} />,
      highlights: [
        "Up to 1.5x farm growth",
        "Up to 3x water duration",
        "Plants never die on LionHeart++",
      ],
    },
    {
      id: "style",
      title: "Show off with style",
      body: "Animated glowing profile cards, premium themes, and exclusive timer skins.",
      accent: "#f472b6",
      icon: <Sparkles className="h-7 w-7" style={{ color: "#f472b6" }} />,
      highlights: [
        "Animated glowing card border",
        "Up to 10 Pomodoro themes",
        "Exclusive shop skins & gear",
      ],
    },
  ];

  return (
    <section className="relative py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <GemIcon className="h-3 w-3" />
            {eyebrow}
          </span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            {heading}
          </h2>
          <p className="mt-3 text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {pillars.map((p, i) => (
            <article
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border"
              style={{
                animation: `fade-in 0.6s ease-out ${i * 0.12}s both`,
              }}
            >
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                style={{ background: p.accent }}
              />
              <div
                className="absolute inset-x-0 -top-px h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${p.accent}80, transparent)`,
                }}
              />

              <div
                className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-5"
                style={{
                  background: `linear-gradient(135deg, ${p.accent}25, ${p.accent}0a)`,
                  border: `1px solid ${p.accent}30`,
                  boxShadow: `0 8px 24px ${p.accent}20, inset 0 0 24px ${p.accent}15`,
                }}
              >
                {p.icon}
              </div>

              <h3 className="relative text-xl font-bold text-foreground mb-2">{p.title}</h3>
              <p className="relative text-sm text-muted-foreground leading-relaxed">{p.body}</p>

              <ul className="relative mt-5 space-y-2">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2.5 text-sm text-foreground/90">
                    <span
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: `${p.accent}25`,
                        border: `1px solid ${p.accent}40`,
                      }}
                    >
                      <Check className="h-3 w-3" style={{ color: p.accent }} />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
