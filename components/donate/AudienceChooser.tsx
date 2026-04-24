// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: 3-card horizontal "audience chooser" strip placed
//          right under the donate hero so visitors instantly
//          self-select between Personal premium / Server premium /
//          one-time LionGems. Each card smooth-scrolls to the
//          relevant section, removing first-scroll friction.
// ============================================================
import { Crown, Server, ArrowDown } from "lucide-react";

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || "";

function GemIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <img
      src={`${BLOB_BASE}/pet-assets/ui/icons/gem.png`}
      alt=""
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

interface AudienceChoice {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  accent: string;
  glow: string;
  cta: string;
}

interface AudienceChooserProps {
  choices?: Partial<Record<"personal" | "server" | "gems", { title?: string; description?: string; cta?: string }>>;
}

export default function AudienceChooser({ choices }: AudienceChooserProps = {}) {
  const items: AudienceChoice[] = [
    {
      id: "personal",
      title: choices?.personal?.title ?? "Personal premium",
      description:
        choices?.personal?.description ??
        "Boost your own profile, gems, and LionGotchi. From \u20ac4.99/mo.",
      cta: choices?.personal?.cta ?? "See LionHeart tiers",
      href: "#tiers",
      icon: <Crown className="h-7 w-7" style={{ color: "#f472b6" }} />,
      accent: "#f472b6",
      glow: "rgba(244, 114, 182, 0.18)",
    },
    {
      id: "server",
      title: choices?.server?.title ?? "Server premium",
      description:
        choices?.server?.description ??
        "Custom branding, leaderboards, and 10+ admin tools for your community.",
      cta: choices?.server?.cta ?? "See server features",
      href: "#server-premium",
      icon: <Server className="h-7 w-7" style={{ color: "#60a5fa" }} />,
      accent: "#60a5fa",
      glow: "rgba(96, 165, 250, 0.18)",
    },
    {
      id: "gems",
      title: choices?.gems?.title ?? "One-time LionGems",
      description:
        choices?.gems?.description ??
        "Skins, gifts, and shop items \u2014 no subscription. Pay once, keep forever.",
      cta: choices?.gems?.cta ?? "View gem packs",
      href: "#gems",
      icon: <GemIcon className="h-7 w-7" />,
      accent: "#a78bfa",
      glow: "rgba(167, 139, 250, 0.18)",
    },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative -mt-4 z-20" aria-label="Choose what fits you">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
          {items.map((item, i) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => handleClick(e, item.href)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 transition-all duration-300 hover:border-border hover:-translate-y-1"
              style={{
                animation: `fade-in 0.6s ease-out ${i * 0.1}s both`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(420px circle at top right, ${item.glow}, transparent 60%)`,
                }}
              />
              <div
                className="absolute inset-x-0 -top-px h-px transition-opacity duration-300 opacity-50 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)`,
                }}
              />

              <div className="relative flex items-start gap-4">
                <div
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${item.accent}22, ${item.accent}0a)`,
                    border: `1px solid ${item.accent}30`,
                    boxShadow: `inset 0 0 20px ${item.accent}15`,
                  }}
                >
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-snug">
                    {item.description}
                  </p>
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-300 group-hover:gap-2.5"
                    style={{ color: item.accent }}
                  >
                    {item.cta}
                    <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
