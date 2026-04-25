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
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Import currency hook and helpers for dual-currency support
import { useCurrency } from "@/hooks/useCurrency"
import { getServerPremiumPrice } from "@/constants/SubscriptionData"
// --- END AI-MODIFIED ---

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

// --- AI-REPLACED (2026-03-24) ---
// Reason: Add dual-currency support to premium gate checkout
// What the new code does better: uses useCurrency hook, shows correct prices per currency
// --- Original code (commented out for rollback) ---
// const PLANS = [
//   { id: "MONTHLY", label: "Monthly", price: "€9.99", period: "/mo" },
//   { id: "YEARLY", label: "Yearly", price: "€99.99", period: "/yr", badge: "Save 17%" },
// ]
// --- End original code ---

const PLAN_IDS = [
  { id: "MONTHLY" as const, label: "Monthly", period: "/mo" },
  { id: "YEARLY" as const, label: "Yearly", period: "/yr", badge: "Save 17%" },
]

export default function PremiumGate({ title, subtitle, children }: PremiumGateProps) {
  const router = useRouter()
  const serverId = router.query.id as string | undefined
  const [loading, setLoading] = useState<string | null>(null)
  const { currency, setCurrency, symbol } = useCurrency()

  const handleCheckout = async (plan: string) => {
    if (!serverId) return
    setLoading(plan)
    try {
      const res = await fetch("/api/subscription/server-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: serverId, plan, currency }),
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
// --- END AI-REPLACED ---

  return (
    <>
      {/* --- AI-MODIFIED (2026-04-25) --- */}
      {/* Purpose: Premium polish -- scope inline keyframes inside                    */}
      {/* prefers-reduced-motion: no-preference so the gold gradient shift, sparkle  */}
      {/* particles, button shimmer sweep, and crown glow pulse all stop running for */}
      {/* users who opted into reduced motion. The PremiumGate stays visually        */}
      {/* premium (gold gradient + crown still render statically) but no longer      */}
      {/* triggers a constant 60fps repaint loop for a11y users.                     */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
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
            animation: pg-gradient-shift 6s ease-in-out infinite;
          }
          .pg-sparkle-dot {
            animation: pg-sparkle ease-in-out infinite;
          }
          .pg-btn-shimmer::after {
            animation: pg-shimmer-sweep 3.5s ease-in-out infinite;
          }
          .pg-crown-glow {
            animation: pg-glow-pulse 3s ease-in-out infinite;
          }
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
        }
        .pg-sparkle-dot {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.9) 0%, transparent 70%);
          pointer-events: none;
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
        }
      `}</style>
      {/* --- END AI-MODIFIED --- */}

      <div className="pg-border rounded-2xl p-[1px]">
        {/* --- AI-MODIFIED (2026-04-25) --- */}
        {/* Purpose: Use semantic bg-card token instead of hardcoded bg-gray-900 */}
        <div className="relative rounded-2xl bg-card overflow-hidden">
        {/* --- END AI-MODIFIED --- */}
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
              {/* --- AI-MODIFIED (2026-04-25) --- */}
              {/* Purpose: Semantic muted-foreground token for subtitle */}
              <h2 className="text-2xl sm:text-3xl font-bold pg-gold-text mb-3">
                {title}
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                {subtitle}
              </p>
              {/* --- END AI-MODIFIED --- */}
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

            {/* --- AI-MODIFIED (2026-03-24) --- */}
            {/* Purpose: Currency toggle + dynamic pricing for dual-currency checkout */}
            {/* --- AI-MODIFIED (2026-04-25) --- */}
            {/* Purpose: Premium polish -- semantic tokens (bg-card / border-border /  */}
            {/* muted-foreground), role="group" + aria-label on currency switcher,    */}
            {/* aria-pressed on each segment, type=button + focus-visible ring on all  */}
            {/* buttons including the checkout CTAs.                                   */}
            <div className="mt-8">
              <div className="flex items-center justify-center mb-4">
                <div
                  role="group"
                  aria-label="Billing currency"
                  className="inline-flex rounded-full bg-muted/50 border border-border p-0.5"
                >
                  <button
                    type="button"
                    aria-pressed={currency === "eur"}
                    onClick={() => setCurrency("eur")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      currency === "eur"
                        ? "bg-amber-500/20 text-amber-300"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    &euro; EUR
                  </button>
                  <button
                    type="button"
                    aria-pressed={currency === "usd"}
                    onClick={() => setCurrency("usd")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      currency === "usd"
                        ? "bg-amber-500/20 text-amber-300"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    $ USD
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {PLAN_IDS.map((plan) => (
                  <button
                    type="button"
                    key={plan.id}
                    onClick={() => handleCheckout(plan.id)}
                    disabled={!serverId || loading !== null}
                    aria-busy={loading === plan.id}
                    className="pg-btn-shimmer relative inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white rounded-xl text-sm font-bold hover:from-amber-600 hover:via-yellow-600 hover:to-amber-600 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Crown size={16} />
                    {loading === plan.id ? "Redirecting..." : `${symbol}${getServerPremiumPrice(plan.id, currency)}${plan.period}`}
                    {plan.badge && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide">
                        {plan.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground/70 mt-3">
                Subscription auto-renews. Cancel anytime from your server settings.
              </p>
            </div>
            {/* --- END AI-MODIFIED (2026-04-25) --- */}
            {/* --- END AI-MODIFIED --- */}
          </div>
        </div>
      </div>
    </>
  )
}
