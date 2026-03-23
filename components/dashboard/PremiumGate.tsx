// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Reusable premium feature gate with shiny/luxurious aesthetic
// ============================================================
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Add server premium Stripe checkout buttons (replaces gem-based CTA)
import { useRouter } from "next/router"
import { useState } from "react"
import { Crown, MessageSquarePlus } from "lucide-react"

interface PremiumGateProps {
  title: string
  subtitle: string
  children: React.ReactNode
}
// --- END AI-MODIFIED ---

const SPARKLES = [
  { top: "10%", left: "6%",  delay: "0s",   dur: "3s"   },
  { top: "18%", right: "12%", delay: "1.4s", dur: "2.6s" },
  { top: "42%", left: "4%",  delay: "0.7s", dur: "3.4s" },
  { top: "68%", right: "8%", delay: "2.1s", dur: "2.8s" },
  { top: "82%", left: "18%", delay: "0.9s", dur: "3.2s" },
  { top: "28%", right: "4%", delay: "2.6s", dur: "2.5s" },
  { top: "55%", left: "12%", delay: "0.2s", dur: "3.6s" },
  { top: "75%", right: "20%", delay: "1.8s", dur: "2.9s" },
]

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Replace /donate link with direct Stripe checkout for server premium
const PLANS = [
  { id: "MONTHLY", label: "Monthly", price: "€9.99", period: "/mo" },
  { id: "YEARLY", label: "Yearly", price: "€99.99", period: "/yr", badge: "Save 17%" },
]

export default function PremiumGate({ title, subtitle, children }: PremiumGateProps) {
  const router = useRouter()
  const serverId = router.query.id as string | undefined
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (plan: string) => {
    if (!serverId) return
    setLoading(plan)
    try {
      const res = await fetch("/api/subscription/server-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: serverId, plan }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Failed to start checkout")
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(null)
    }
  }
// --- END AI-MODIFIED ---

  return (
    <>
      <style>{`
        @keyframes pg-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pg-sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes pg-shimmer-sweep {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(100%) rotate(25deg); }
        }
        @keyframes pg-glow-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .pg-border {
          background: linear-gradient(
            135deg,
            rgba(245,158,11,0.35),
            rgba(234,179,8,0.08),
            rgba(251,191,36,0.25),
            rgba(234,179,8,0.08),
            rgba(245,158,11,0.35)
          );
          background-size: 300% 300%;
          animation: pg-gradient-shift 6s ease-in-out infinite;
        }
        .pg-sparkle-dot {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.9) 0%, transparent 70%);
          pointer-events: none;
          animation: pg-sparkle ease-in-out infinite;
        }
        .pg-gold-text {
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 40%, #fde68a 60%, #fbbf24 80%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pg-btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .pg-btn-shimmer::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -150%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255,255,255,0.08) 40%,
            rgba(255,255,255,0.18) 50%,
            rgba(255,255,255,0.08) 60%,
            transparent 100%
          );
          animation: pg-shimmer-sweep 3.5s ease-in-out infinite;
        }
        .pg-crown-glow {
          animation: pg-glow-pulse 3s ease-in-out infinite;
        }
      `}</style>

      <div className="pg-border rounded-2xl p-[1px]">
        <div className="relative rounded-2xl bg-gray-900 overflow-hidden">
          {/* Ambient radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top right, rgba(245,158,11,0.07), transparent 55%), " +
                "radial-gradient(ellipse at bottom left, rgba(234,179,8,0.04), transparent 45%)",
            }}
          />

          {/* Sparkle particles */}
          {SPARKLES.map((s, i) => (
            <div
              key={i}
              className="pg-sparkle-dot"
              style={{
                top: s.top,
                left: "left" in s ? (s as { left: string }).left : undefined,
                right: "right" in s ? (s as { right: string }).right : undefined,
                animationDelay: s.delay,
                animationDuration: s.dur,
              }}
            />
          ))}

          <div className="relative z-10 p-6 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-5">
                <Crown size={13} className="text-amber-400 pg-crown-glow" />
                <span className="text-xs font-semibold text-amber-400 tracking-wide uppercase">
                  Premium Feature
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold pg-gold-text mb-3">
                {title}
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Page-specific demo content */}
            <div className="mb-8">{children}</div>

            {/* Community Requested callout */}
            <div className="p-4 sm:p-5 rounded-xl bg-amber-500/[0.04] border border-amber-500/15">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquarePlus size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-300">
                    Built by Community Request
                  </p>
                  <p className="text-[13px] text-gray-400 mt-1 leading-relaxed">
                    This feature was added because a premium server requested it.
                    Premium servers get to propose and vote on new features they
                    want built into the bot &mdash; your ideas shape what comes next.
                  </p>
                </div>
              </div>
            </div>

            {/* --- AI-MODIFIED (2026-03-22) --- */}
            {/* Purpose: Stripe subscription checkout buttons replacing gem/donate CTA */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleCheckout(plan.id)}
                    disabled={!serverId || loading !== null}
                    className="pg-btn-shimmer relative inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white rounded-xl text-sm font-bold hover:from-amber-600 hover:via-yellow-600 hover:to-amber-600 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Crown size={16} />
                    {loading === plan.id ? "Redirecting..." : `${plan.price}${plan.period}`}
                    {plan.badge && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide">
                        {plan.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-gray-500 mt-3">
                Subscription auto-renews. Cancel anytime from your server settings.
              </p>
            </div>
            {/* --- END AI-MODIFIED --- */}
          </div>
        </div>
      </div>
    </>
  )
}
