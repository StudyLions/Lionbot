// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: Premium teaser bridge block on the homepage. Glowing
//          animated card preview, three perks (gems / boosts /
//          animated cards), price-from line, and dual CTAs that
//          send the user to /donate. This is the bridge that
//          converts homepage browsers into pricing-page visitors.
// ============================================================
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Sparkles, Sprout, TrendingUp } from "lucide-react";

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

const PERKS = [
  {
    Icon: GemIcon,
    title: "Up to 1,500 gems / month",
    body: "Drops automatically — no quests required.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    Icon: Sprout,
    title: "2× LionGotchi growth",
    body: "Plants that never die, faster harvests, higher gold.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    Icon: Sparkles,
    title: "Animated profile cards",
    body: "Live shimmer, exclusive skins, and a LionHeart badge.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
];

export default function PremiumTeaser() {
  return (
    <section className="relative py-20 lg:py-28 border-t border-border/50 overflow-hidden">
      <style>{`
        @keyframes premium-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes premium-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes premium-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>

      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(900px circle at 30% 50%, rgba(244, 114, 182, 0.07), transparent 60%), radial-gradient(700px circle at 80% 70%, rgba(245, 158, 11, 0.06), transparent 60%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden relative"
        >
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(244, 114, 182, 0.06), rgba(168, 85, 247, 0.04), rgba(245, 158, 11, 0.06), rgba(244, 114, 182, 0.06))",
              backgroundSize: "200% 200%",
              animation: "premium-shimmer 12s ease-in-out infinite",
            }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 p-8 lg:p-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Crown className="h-3 w-3 text-amber-400" />
                LionHeart Premium
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.05]">
                Take it further with{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #f472b6, #a855f7, #f59e0b)",
                  }}
                >
                  LionHeart
                </span>
              </h2>
              <p className="mt-4 text-base lg:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Unlock monthly LionGems, faster pet growth, exclusive animated
                cards, and the perks your community already loves —{" "}
                <span className="text-foreground font-semibold">
                  from €4.99/mo
                </span>
                .
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PERKS.map((perk, i) => {
                  const Icon = perk.Icon;
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-background/40 backdrop-blur-sm p-4"
                    >
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${perk.bg} ${perk.color} mb-2`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="text-sm font-bold text-foreground leading-tight">
                        {perk.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 leading-snug">
                        {perk.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
                <Link href="/donate">
                  <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all duration-200 hover:brightness-110 hover:translate-y-[-1px]"
                    style={{
                      background:
                        "linear-gradient(135deg, #f472b6, #a855f7, #f59e0b)",
                      boxShadow: "0 10px 30px -10px rgba(244, 114, 182, 0.5)",
                    }}>
                    View LionHeart plans
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Link>
                <Link href="/donate#comparison">
                  <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-card hover:border-pink-500/40 transition-colors">
                    Compare tiers
                  </a>
                </Link>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Cancel anytime · Secure with Stripe · 30-second checkout
              </p>
            </div>

            {/* Animated card preview */}
            <div className="hidden lg:flex relative justify-center">
              <div
                className="relative w-72 h-[420px] rounded-3xl overflow-hidden"
                style={{ animation: "premium-float 6s ease-in-out infinite" }}
              >
                <div
                  className="absolute -inset-3 rounded-3xl pointer-events-none opacity-50"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(244, 114, 182, 0.4), transparent 70%)",
                    animation: "premium-pulse 4s ease-in-out infinite",
                  }}
                />
                <div
                  className="absolute -inset-px rounded-3xl pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, #f472b6, #a855f7, #f59e0b, #f472b6)",
                    backgroundSize: "300% 300%",
                    animation: "premium-shimmer 6s ease-in-out infinite",
                    padding: "2px",
                    WebkitMask:
                      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />
                <div className="relative h-full w-full bg-gradient-to-b from-card via-background to-pink-950/30 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_30%,_rgba(244,114,182,0.6),_transparent_60%)]" />

                  <div className="relative h-full p-6 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                          L
                        </div>
                        <div>
                          <div className="text-xs text-foreground font-semibold leading-tight">
                            ari.h
                          </div>
                          <div className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">
                            LionHeart+
                          </div>
                        </div>
                      </div>
                      <Crown className="h-5 w-5 text-amber-400" />
                    </div>

                    <div className="mt-8 text-center">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Level
                      </div>
                      <div className="text-6xl font-black text-foreground tracking-tight mt-1 tabular-nums">
                        47
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>XP</span>
                          <span>3,840 / 5,200</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-amber-500"
                            style={{ width: "73%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Streak</span>
                          <span>12 days</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                            style={{ width: "60%" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-3 gap-2 pt-4 border-t border-border/40">
                      <div className="text-center">
                        <div className="text-sm font-bold text-foreground">
                          47h
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          this week
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          #4
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          rank
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-blue-400 inline-flex items-center justify-center gap-1">
                          <GemIcon className="h-3 w-3" />
                          1.2k
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          gems
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
