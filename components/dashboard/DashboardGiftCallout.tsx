// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Compact prominent gift CTA banner mounted on dashboard
//          surfaces (member overview + subscriptions page) so gifting
//          isn't only discoverable from /donate. Gold-accented card
//          with a single Gift icon, a short headline, one line of
//          supporting copy, and a gradient gold CTA button.
//
//          Two variants:
//            "overview":     Member dashboard overview banner. Headline
//                            promotes discovery for members who haven't
//                            gifted yet.
//            "subscriptions": For users with an active subscription;
//                             nudges 'Send another gift' rather than
//                             treating them like a new visitor.
//
//          Visual treatment matches the gift surfaces principles in
//          the plan (single focal point per surface). The CTA pill
//          is the only equal-weight gold element; the icon mark and
//          body lean restrained.
// ============================================================
import Link from "next/link"
import { Gift } from "lucide-react"

interface Props {
  variant: "overview" | "subscriptions"
}

const COPY = {
  overview: {
    headline: "Gift premium to a server or a friend",
    body: "Pick any server you're a member of, or send a personal LionHeart subscription to anyone via a shareable link.",
    ctaLabel: "Send a gift",
    ctaHref: "/donate#server-premium",
  },
  subscriptions: {
    headline: "Send a gift to a server or a friend",
    body: "You can gift Server Premium or LionHeart on top of your own subscription. Sender pays the monthly bill, recipient gets the perks.",
    ctaLabel: "Open the gift store",
    ctaHref: "/donate#server-premium",
  },
} as const

export default function DashboardGiftCallout({ variant }: Props) {
  const copy = COPY[variant]
  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-amber-500/[0.04] p-5 sm:p-6"
      style={{ boxShadow: "0 12px 28px -16px rgba(245,158,11,0.18)" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)",
        }}
      />
      <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <Gift className="h-5 w-5 text-amber-400" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">
            {copy.headline}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {copy.body}
          </p>
        </div>
        <Link href={copy.ctaHref}>
          <a
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 px-4 py-2.5 text-sm font-bold transition-all hover:-translate-y-[1px]"
            style={{ boxShadow: "0 8px 22px -8px rgba(245,158,11,0.45)" }}
          >
            <Gift size={14} aria-hidden />
            {copy.ctaLabel}
          </a>
        </Link>
      </div>
    </div>
  )
}
