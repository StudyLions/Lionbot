// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: /dashboard/gifts -- the gifts hub. Two tabs:
//            Sent     -- gifts the user has sent (LionHeart + server),
//                        including pending claim links the sender can
//                        re-copy to forward to the intended recipient
//            Received -- claimed LionHeart gifts + server gifts on any
//                        guild the user is in
//
//          Visual treatment matches the gift surfaces principles: ONE
//          thin gold accent per surface, single Gift icon mark, no
//          marketing gradients, simple text tabs (no segmented control).
//          Each row is a compact rounded-xl card with p-4. Pending-claim
//          rows get a thin amber left-border accent.
//
//          Server-gift cancellation is handled by the sender via Stripe
//          Portal -- we link there rather than building a duplicate
//          billing UI.
// ============================================================
import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { Gift, Copy, Check, Loader2, ExternalLink } from "lucide-react"

import Layout from "@/components/Layout/Layout"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { DashboardShell, PageHeader, toast } from "@/components/dashboard/ui"

interface SentGift {
  kind: "server" | "lionheart"
  status: string
  giftId: number | null
  recipientLabel: string
  recipientIconUrl: string | null
  tier: string | null
  monthlyAmount: number | null
  monthlyCurrency: "eur" | "usd" | null
  currentPeriodEnd: string | null
  isAnonymous: boolean
  giftMessage: string | null
  claimUrl: string | null
  guildId: string | null
}

interface ReceivedGift {
  kind: "server" | "lionheart"
  status: string
  senderDisplayName: string | null
  isAnonymous: boolean
  giftMessage: string | null
  tier: string | null
  currentPeriodEnd: string | null
  guildName: string | null
  guildId: string | null
}

const TIER_LABEL: Record<string, string> = {
  LIONHEART: "LionHeart",
  LIONHEART_PLUS: "LionHeart+",
  LIONHEART_PLUS_PLUS: "LionHeart++",
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  CANCELLING: "Cancelling at period end",
  PAST_DUE: "Payment past due",
  CANCELLED: "Cancelled",
  PENDING_CLAIM: "Pending claim",
  EXPIRED: "Expired",
  INACTIVE: "Inactive",
}

function formatDate(iso: string | null): string {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return ""
  }
}

export default function GiftsPage() {
  const [tab, setTab] = useState<"sent" | "received">("sent")
  const [sent, setSent] = useState<SentGift[] | null>(null)
  const [received, setReceived] = useState<ReceivedGift[] | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/gifts")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setSent(data?.sent ?? [])
        setReceived(data?.received ?? [])
      })
      .catch(() => {
        setSent([])
        setReceived([])
      })
  }, [])

  return (
    <Layout
      SEO={{
        title: "Gifts - LionBot Dashboard",
        description: "Premium subscriptions you've sent and received.",
      }}
    >
      <Head>
        <title>Gifts | LionBot</title>
      </Head>
      <DashboardShell nav={<DashboardNav />}>
        <PageHeader
          title="Gifts"
          description="Premium subscriptions you've sent and received."
        />

        <div className="flex items-center gap-6 mb-6 border-b border-border">
          <TabButton active={tab === "sent"} onClick={() => setTab("sent")}>
            Sent
          </TabButton>
          <TabButton active={tab === "received"} onClick={() => setTab("received")}>
            Received
          </TabButton>
        </div>

        {tab === "sent" && (
          <SentList items={sent} />
        )}
        {tab === "received" && (
          <ReceivedList items={received} />
        )}
      </DashboardShell>
    </Layout>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-2 -mb-px text-sm font-medium transition-colors ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-amber-500/70" aria-hidden />
      )}
    </button>
  )
}

function SentList({ items }: { items: SentGift[] | null }) {
  if (items === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-12">
        <Loader2 size={14} className="animate-spin" />
        Loading your gifts…
      </div>
    )
  }
  if (items.length === 0) {
    return <EmptyState ctaLabel="Gift to a server" ctaHref="/donate#server-premium">
      You haven't gifted anyone yet.
    </EmptyState>
  }
  return (
    <ul className="space-y-3">
      {items.map((g, i) => (
        <SentRow key={`${g.kind}-${g.giftId}-${i}`} g={g} />
      ))}
    </ul>
  )
}

function ReceivedList({ items }: { items: ReceivedGift[] | null }) {
  if (items === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-12">
        <Loader2 size={14} className="animate-spin" />
        Loading…
      </div>
    )
  }
  if (items.length === 0) {
    return <EmptyState ctaLabel="Send a gift" ctaHref="/donate#server-premium">
      No gifts here yet. When someone gifts premium to you or one of your servers, it'll appear here.
    </EmptyState>
  }
  return (
    <ul className="space-y-3">
      {items.map((g, i) => (
        <ReceivedRow key={`${g.kind}-${g.guildId ?? "lh"}-${i}`} g={g} />
      ))}
    </ul>
  )
}

function EmptyState({
  children,
  ctaLabel,
  ctaHref,
}: {
  children: React.ReactNode
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-14 h-14 mb-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
        <Gift size={22} className="text-amber-400" aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">{children}</p>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <Gift size={14} />
        {ctaLabel}
      </Link>
    </div>
  )
}

function SentRow({ g }: { g: SentGift }) {
  const [copied, setCopied] = useState(false)
  const isPending = g.status === "PENDING_CLAIM"
  const isCancelled = g.status === "CANCELLED" || g.status === "EXPIRED"
  const statusLabel = STATUS_LABEL[g.status] ?? g.status

  async function copyClaimUrl() {
    if (!g.claimUrl) return
    try {
      await navigator.clipboard.writeText(g.claimUrl)
      setCopied(true)
      toast.success("Claim link copied")
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("Couldn't copy")
    }
  }

  return (
    <li
      className={`rounded-xl border bg-card p-4 ${
        isPending ? "border-l-2 border-l-amber-500/60 border-border" : "border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
          <Gift size={16} className="text-amber-400" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <p className="text-sm">
              <span className="text-muted-foreground">
                {g.kind === "server" ? "Server Premium" : TIER_LABEL[g.tier ?? ""] ?? g.tier}{" "}
                ·{" "}
              </span>
              <span className={`font-medium ${isCancelled ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {g.recipientLabel}
              </span>
            </p>
            <span
              className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                g.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : isPending
                    ? "bg-amber-500/10 text-amber-400"
                    : isCancelled
                      ? "bg-muted text-muted-foreground"
                      : "bg-muted text-foreground/80"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          {g.giftMessage && (
            <p className="mt-1.5 text-xs italic text-muted-foreground border-l-2 border-amber-500/30 pl-2">
              "{g.giftMessage}"
            </p>
          )}

          {g.currentPeriodEnd && !isCancelled && (
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">
              {isPending ? "Link expires" : "Next renewal"} on {formatDate(g.currentPeriodEnd)}
              {g.isAnonymous ? " · Sent anonymously" : ""}
            </p>
          )}

          {isPending && g.claimUrl && (
            <div className="mt-3 flex items-stretch gap-2">
              <code className="flex-1 min-w-0 truncate font-mono text-[12px] bg-muted/40 rounded-md px-3 py-2 text-foreground/80">
                {g.claimUrl}
              </code>
              <button
                type="button"
                onClick={copyClaimUrl}
                className="inline-flex items-center gap-1.5 rounded-md bg-muted hover:bg-muted/70 px-3 text-xs font-medium transition-colors"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}

          {!isCancelled && !isPending && (
            <div className="mt-3">
              <Link
                href="/donate#server-premium"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Manage billing <ExternalLink size={11} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

function ReceivedRow({ g }: { g: ReceivedGift }) {
  const senderLabel = g.isAnonymous
    ? "An anonymous gifter"
    : g.senderDisplayName ?? "A friend"
  const statusLabel = STATUS_LABEL[g.status] ?? g.status
  const isCancelled = g.status === "CANCELLED" || g.status === "EXPIRED"

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
          <Gift size={16} className="text-amber-400" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <p className="text-sm">
              <span className="font-medium text-foreground">{senderLabel}</span>{" "}
              <span className="text-muted-foreground">
                gifted{" "}
                {g.kind === "server"
                  ? `Server Premium to ${g.guildName ?? "a server"}`
                  : `${TIER_LABEL[g.tier ?? ""] ?? g.tier} to you`}
              </span>
            </p>
            <span
              className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                g.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : isCancelled
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted text-foreground/80"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          {g.giftMessage && (
            <p className="mt-1.5 text-xs italic text-muted-foreground border-l-2 border-amber-500/30 pl-2">
              "{g.giftMessage}"
            </p>
          )}

          {g.currentPeriodEnd && !isCancelled && (
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">
              Next renewal {formatDate(g.currentPeriodEnd)}
            </p>
          )}

          {g.kind === "server" && g.guildId && (
            <div className="mt-3">
              <Link
                href={`/dashboard/servers/${g.guildId}`}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Open server dashboard <ExternalLink size={11} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
