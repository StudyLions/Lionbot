// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Recipient claim page for a LionHeart user gift.
//          SSR-resolves the gift state from the token (no auth required
//          to view the gift summary -- the token IS the auth for "you
//          have a gift to claim"), then on the client side the claim
//          button calls /api/subscription/gift-lionheart-claim which
//          requires Discord sign-in.
//
//          Visual treatment: one focal point (the tier name in gold),
//          a single Gift icon mark, a soft halo behind the sender
//          identity on first paint (one-shot via animation-iteration-
//          count:1). Matches the UI/UX Principles in the plan file:
//          no marketing gradients, no sparkles, single CTA.
//
//          Error states (NOT_FOUND, EXPIRED, ALREADY_CLAIMED,
//          SELF_CLAIM, ALREADY_SUBSCRIBED) all render through the same
//          shell so the layout never jars.
// ============================================================
import type { GetServerSideProps } from "next"
import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import Head from "next/head"
import { useRouter } from "next/router"
import { Gift } from "lucide-react"
import { prisma } from "@/utils/prisma"

type GiftView =
  | {
      state: "PENDING_CLAIM"
      token: string
      tier: "LIONHEART" | "LIONHEART_PLUS" | "LIONHEART_PLUS_PLUS"
      tierName: string
      monthlyGems: number
      isAnonymous: boolean
      senderDisplayName: string | null
      message: string | null
      expiresAtIso: string
    }
  | { state: "NOT_FOUND" }
  | { state: "EXPIRED" }
  | { state: "ALREADY_CLAIMED" }

interface PageProps {
  view: GiftView
}

const TIER_META: Record<
  "LIONHEART" | "LIONHEART_PLUS" | "LIONHEART_PLUS_PLUS",
  { displayName: string; monthlyGems: number; perkLine: string }
> = {
  LIONHEART: {
    displayName: "LionHeart",
    monthlyGems: 500,
    perkLine: "500 LionGems/month, faster pet growth, double voice coins.",
  },
  LIONHEART_PLUS: {
    displayName: "LionHeart+",
    monthlyGems: 1200,
    perkLine: "1,200 LionGems/month, bigger farm boosts, longer water duration.",
  },
  LIONHEART_PLUS_PLUS: {
    displayName: "LionHeart++",
    monthlyGems: 3000,
    perkLine: "3,000 LionGems/month and a free Server Premium slot of your choice.",
  },
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  const token = ctx.params?.token
  if (typeof token !== "string" || !token) {
    return { props: { view: { state: "NOT_FOUND" } } }
  }

  const gift = await prisma.lionheart_gifts.findUnique({
    where: { claim_token: token },
  })

  if (!gift) {
    return { props: { view: { state: "NOT_FOUND" } } }
  }

  if (gift.status === "EXPIRED" || gift.claim_expires_at < new Date()) {
    return { props: { view: { state: "EXPIRED" } } }
  }

  if (gift.status !== "PENDING_CLAIM" || gift.claimed_at) {
    return { props: { view: { state: "ALREADY_CLAIMED" } } }
  }

  let senderDisplayName: string | null = null
  if (!gift.gift_is_anonymous) {
    const member = await prisma.members.findFirst({
      where: { userid: gift.sender_userid, display_name: { not: null } },
      select: { display_name: true },
      orderBy: { first_joined: "desc" },
    })
    senderDisplayName = member?.display_name ?? null
  }

  const tierMeta = TIER_META[gift.tier as keyof typeof TIER_META]

  return {
    props: {
      view: {
        state: "PENDING_CLAIM",
        token,
        tier: gift.tier as "LIONHEART" | "LIONHEART_PLUS" | "LIONHEART_PLUS_PLUS",
        tierName: tierMeta?.displayName ?? gift.tier,
        monthlyGems: tierMeta?.monthlyGems ?? 0,
        isAnonymous: gift.gift_is_anonymous,
        senderDisplayName,
        message: gift.gift_message,
        expiresAtIso: gift.claim_expires_at.toISOString(),
      },
    },
  }
}

export default function GiftClaimPage({ view }: PageProps) {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [claimed, setClaimed] = useState<{ tier: string; gemsCredited: number } | null>(null)

  const titleByState = (() => {
    if (view.state === "NOT_FOUND") return "Gift not found"
    if (view.state === "EXPIRED") return "Gift expired"
    if (view.state === "ALREADY_CLAIMED") return "Gift already claimed"
    if (claimed) return "Premium activated"
    return view.isAnonymous ? "Someone gifted you premium" : `${view.senderDisplayName ?? "A friend"} gifted you premium`
  })()

  async function handleClaim() {
    if (view.state !== "PENDING_CLAIM") return
    setClaiming(true)
    setError(null)
    try {
      const res = await fetch("/api/subscription/gift-lionheart-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: view.token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Couldn't claim this gift.")
        return
      }
      setClaimed({ tier: data.tier, gemsCredited: data.gemsCredited ?? 0 })
    } catch {
      setError("Couldn't reach the server. Try again in a moment.")
    } finally {
      setClaiming(false)
    }
  }

  return (
    <>
      <Head>
        <title>{titleByState} | LionBot</title>
        <meta name="robots" content="noindex" />
      </Head>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes gift-halo-in {
            0%   { opacity: 0; transform: scale(0.85); }
            100% { opacity: 1; transform: scale(1); }
          }
        }
        .gift-halo {
          animation: gift-halo-in 700ms ease-out 100ms both;
        }
        .gift-gold-text {
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 40%, #fde68a 60%, #fbbf24 80%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-card border border-border overflow-hidden relative">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)",
              }}
            />

            {view.state === "PENDING_CLAIM" && !claimed && (
              <ClaimReady
                view={view}
                session={session}
                sessionStatus={sessionStatus}
                claiming={claiming}
                error={error}
                onClaim={handleClaim}
                onSignIn={() => signIn("discord", { callbackUrl: router.asPath })}
              />
            )}

            {claimed && (
              <ClaimSuccess
                tierName={TIER_META[claimed.tier as keyof typeof TIER_META]?.displayName ?? claimed.tier}
                gemsCredited={claimed.gemsCredited}
              />
            )}

            {view.state === "NOT_FOUND" && (
              <ClaimError
                title="Gift not found"
                body="The link may be wrong, or this gift was already cleaned up. Ask the gifter to send the link again."
              />
            )}

            {view.state === "EXPIRED" && (
              <ClaimError
                title="Gift expired"
                body="Gift links are valid for 30 days. The gifter has been notified and refunded for the unused period."
              />
            )}

            {view.state === "ALREADY_CLAIMED" && (
              <ClaimError
                title="Already claimed"
                body="This gift has been claimed. If that wasn't you, contact the person who shared the link."
              />
            )}
          </div>
        </div>
      </main>
    </>
  )
}

function ClaimReady({
  view,
  session,
  sessionStatus,
  claiming,
  error,
  onClaim,
  onSignIn,
}: {
  view: Extract<GiftView, { state: "PENDING_CLAIM" }>
  session: ReturnType<typeof useSession>["data"]
  sessionStatus: ReturnType<typeof useSession>["status"]
  claiming: boolean
  error: string | null
  onClaim: () => void
  onSignIn: () => void
}) {
  const senderLabel = view.isAnonymous
    ? "An anonymous gifter"
    : view.senderDisplayName ?? "A friend"

  const sessionLoading = sessionStatus === "loading"
  const signedIn = sessionStatus === "authenticated"

  return (
    <div className="relative p-8 sm:p-10">
      <div className="relative mx-auto w-16 h-16 mb-6">
        <div
          aria-hidden
          className="gift-halo absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(245,158,11,0) 70%)",
            transform: "scale(2)",
          }}
        />
        <div className="relative w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <Gift size={26} className="text-amber-400" aria-hidden />
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mb-2">{senderLabel} sent you</p>
      <h1 className="text-center text-3xl font-bold mb-1">
        <span className="gift-gold-text">{view.tierName}</span>
      </h1>
      <p className="text-center text-sm text-muted-foreground mb-6">
        {TIER_META[view.tier].perkLine}
      </p>

      {view.message && (
        <div className="mb-6 border-l-2 border-amber-500/40 pl-4 py-1">
          <p className="text-sm italic text-foreground/90">{view.message}</p>
        </div>
      )}

      <div className="mb-6 text-xs text-muted-foreground text-center">
        The gifter pays the monthly subscription. You keep the perks for as long as they choose to.
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {sessionLoading && (
        <button
          disabled
          className="w-full rounded-xl bg-muted text-muted-foreground py-3 text-sm font-medium"
        >
          Checking your session…
        </button>
      )}

      {!sessionLoading && !signedIn && (
        <button
          onClick={onSignIn}
          className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Sign in with Discord to claim
        </button>
      )}

      {!sessionLoading && signedIn && (
        <button
          onClick={onClaim}
          disabled={claiming}
          className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {claiming ? "Activating…" : "Claim your premium"}
        </button>
      )}

      <p className="mt-4 text-[11px] text-muted-foreground text-center">
        Link expires {new Date(view.expiresAtIso).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  )
}

function ClaimSuccess({ tierName, gemsCredited }: { tierName: string; gemsCredited: number }) {
  return (
    <div className="p-8 sm:p-10 text-center">
      <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
        <Gift size={26} className="text-amber-400" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold mb-2">
        <span className="gift-gold-text">{tierName}</span> is yours.
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {gemsCredited > 0
          ? `${gemsCredited.toLocaleString()} LionGems just landed in your wallet. Your perks are live across every server.`
          : "Your perks are live across every server."}
      </p>
      <a
        href="/dashboard"
        className="inline-flex justify-center w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Open dashboard
      </a>
    </div>
  )
}

function ClaimError({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-8 sm:p-10 text-center">
      <div className="mx-auto w-14 h-14 mb-5 rounded-full bg-muted flex items-center justify-center">
        <Gift size={22} className="text-muted-foreground" aria-hidden />
      </div>
      <h1 className="text-xl font-bold mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground mb-6">{body}</p>
      <a
        href="/donate"
        className="inline-flex justify-center w-full rounded-xl bg-muted hover:bg-muted/80 text-foreground py-3 text-sm font-medium transition-colors"
      >
        Visit the gift store
      </a>
    </div>
  )
}
