// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: Animated hero visual for the redesigned donate page.
//          Features a glowing LionHeart+ profile card preview,
//          an animated gem-per-month counter, and a small farm
//          plot tile showing 1.5x growth speed -- the three
//          main "feels of premium" in one glance.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { Crown, Sprout, Sparkles } from "lucide-react";

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

export default function HeroShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [gems, setGems] = useState(0);
  const [growth, setGrowth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let frame: number;
    const start = performance.now();
    const target = 1200;
    const step = (now: number) => {
      const p = Math.min((now - start) / 1400, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setGems(Math.floor(eased * target));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      let frame: number;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - start) / 1600, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setGrowth(eased);
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      return () => cancelAnimationFrame(frame);
    }, 400);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div ref={ref} className="relative h-[440px] w-full">
      <style>{`
        @keyframes hs-shimmer {
          0%, 100% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
          25% { opacity: 0.8; }
          50% { transform: translateX(120%) skewX(-12deg); opacity: 0; }
        }
        @keyframes hs-pulse {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
        @keyframes hs-float-up {
          0% { opacity: 0; transform: translateY(8px) scale(0.85); }
          15% { opacity: 1; transform: translateY(0) scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-30px) scale(0.95); }
        }
        @keyframes hs-spin-slow {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="absolute inset-0 rounded-3xl blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(244, 114, 182, 0.35) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(168, 85, 247, 0.25) 0%, transparent 60%)",
          animation: "hs-pulse 6s ease-in-out infinite",
        }}
      />

      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[320px] z-20"
        style={{
          opacity: visible ? 1 : 0,
          transform: `translate(-50%, -50%) ${visible ? "translateY(0) rotate(-3deg)" : "translateY(20px) rotate(-3deg)"}`,
          transition: "opacity 0.7s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          className="relative rounded-2xl overflow-hidden border-2"
          style={{
            borderImage: "linear-gradient(135deg, #f472b6, #a855f7, #f59e0b) 1",
            background:
              "linear-gradient(180deg, rgba(244, 114, 182, 0.18) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)",
            boxShadow:
              "0 24px 48px -12px rgba(244, 114, 182, 0.45), 0 0 0 1px rgba(244, 114, 182, 0.5), inset 0 0 60px rgba(244, 114, 182, 0.12)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.18) 50%, transparent 70%)",
              animation: "hs-shimmer 3.5s ease-in-out infinite",
            }}
          />

          <div className="relative p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="relative h-14 w-14 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: "linear-gradient(135deg, #f472b6, #a855f7)",
                  boxShadow: "0 0 20px rgba(244, 114, 182, 0.6)",
                }}
              >
                {"\u{1F981}"}
                <div
                  className="absolute -inset-1 rounded-full border border-pink-300/60"
                  style={{ animation: "hs-spin-slow 10s linear infinite" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-white truncate">studylion</span>
                  <Crown className="h-3.5 w-3.5 text-pink-300 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                    style={{
                      background: "linear-gradient(135deg, #f472b6, #a855f7)",
                      boxShadow: "0 2px 8px rgba(244, 114, 182, 0.5)",
                    }}
                  >
                    LionHeart+
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div
                className="rounded-lg p-2.5 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(244, 114, 182, 0.18), rgba(244, 114, 182, 0.05))",
                  border: "1px solid rgba(244, 114, 182, 0.3)",
                }}
              >
                <div className="text-lg font-black text-white tabular-nums">142h</div>
                <div className="text-[9px] text-pink-200/80 uppercase tracking-wider mt-0.5">
                  This month
                </div>
              </div>
              <div
                className="rounded-lg p-2.5 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(168, 85, 247, 0.05))",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                }}
              >
                <div className="text-lg font-black text-white tabular-nums">#3</div>
                <div className="text-[9px] text-purple-200/80 uppercase tracking-wider mt-0.5">
                  Server rank
                </div>
              </div>
            </div>

            <div className="flex items-end gap-1 h-10">
              {[42, 68, 55, 81, 64, 92, 78].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all duration-700"
                  style={{
                    height: visible ? `${h}%` : "4px",
                    background: "linear-gradient(180deg, #f472b6, #a855f7)",
                    transitionDelay: `${300 + i * 90}ms`,
                  }}
                />
              ))}
            </div>
            <div className="text-center mt-1.5 text-[9px] text-white/40 uppercase tracking-wider">
              Last 7 days
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute top-6 right-2 sm:top-8 sm:right-6 z-30 rounded-2xl border backdrop-blur-md"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) rotate(4deg)" : "translateY(-10px) rotate(4deg)",
          transition: "opacity 0.7s ease 0.2s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.85))",
          borderColor: "rgba(168, 85, 247, 0.4)",
          boxShadow: "0 12px 32px rgba(168, 85, 247, 0.3)",
        }}
      >
        <div className="relative px-3.5 py-2.5 flex items-center gap-2.5">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(168, 85, 247, 0.25))",
              boxShadow: "inset 0 0 12px rgba(56, 189, 248, 0.3)",
            }}
          >
            <GemIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-black text-white tabular-nums leading-none">
              +{gems.toLocaleString()}
            </div>
            <div className="text-[9px] text-purple-200/80 uppercase tracking-wider mt-1">
              gems / month
            </div>
          </div>
          {visible && (
            <div className="absolute -top-1 right-3 pointer-events-none">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute text-pink-300 text-xs font-bold"
                  style={{
                    left: `${i * 8 - 8}px`,
                    animation: `hs-float-up 2.4s ease-out ${0.6 + i * 0.4}s infinite`,
                  }}
                >
                  +
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="absolute bottom-2 left-2 sm:bottom-6 sm:left-4 z-30 rounded-2xl border backdrop-blur-md"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) rotate(-4deg)" : "translateY(10px) rotate(-4deg)",
          transition: "opacity 0.7s ease 0.4s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.4s",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.85))",
          borderColor: "rgba(34, 197, 94, 0.4)",
          boxShadow: "0 12px 32px rgba(34, 197, 94, 0.25)",
        }}
      >
        <div className="px-3 py-2.5 flex items-center gap-2.5">
          <div
            className="relative h-12 w-12 rounded-xl overflow-hidden flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #87ceeb 0%, #5bb850 60%, #4a3520 100%)",
            }}
          >
            <div
              className="absolute bottom-0 left-0 right-0 h-3"
              style={{
                background: "linear-gradient(180deg, #5bb850 0%, #4a3520 100%)",
              }}
            />
            <Sprout
              className="relative text-white drop-shadow-md transition-all duration-700"
              style={{
                width: 14 + growth * 14,
                height: 14 + growth * 14,
                filter: `drop-shadow(0 2px 4px rgba(34, 197, 94, ${0.4 + growth * 0.4}))`,
              }}
            />
            <div
              className="absolute -top-0.5 right-0.5"
              style={{
                opacity: growth > 0.5 ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
            >
              <Sparkles className="h-2.5 w-2.5 text-yellow-300" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-green-300 tabular-nums leading-none">
                1.5x
              </span>
            </div>
            <div className="text-[9px] text-green-200/80 uppercase tracking-wider mt-1">
              farm growth
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute -top-2 left-12 z-10 text-pink-300/60 text-2xl font-bold pointer-events-none"
        style={{
          opacity: visible ? 0.7 : 0,
          transform: visible ? "rotate(-15deg) translateY(0)" : "rotate(-15deg) translateY(20px)",
          transition: "opacity 1s ease 0.6s, transform 1.2s ease 0.6s",
        }}
      >
        <Sparkles className="h-6 w-6" />
      </div>
      <div
        className="absolute bottom-12 right-1 z-10 text-purple-300/50 text-2xl pointer-events-none"
        style={{
          opacity: visible ? 0.6 : 0,
          transform: visible ? "rotate(20deg) translateY(0)" : "rotate(20deg) translateY(20px)",
          transition: "opacity 1s ease 0.8s, transform 1.2s ease 0.8s",
        }}
      >
        <Sparkles className="h-5 w-5" />
      </div>
    </div>
  );
}
