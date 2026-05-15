// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: The signature surface of the Gift Premium feature.
//          Two-column modal: left = configurator (recipient, message,
//          anonymous toggle), right = LIVE PREVIEW of what the
//          recipient will see (server-dashboard card or claim page).
//          Updates as the sender types. Single primary CTA at the
//          bottom -- price baked into the label so the user knows
//          exactly what's about to be charged.
//
//          Two modes:
//            lionheart -- gift a personal LionHeart tier to a future
//                         recipient (claim-link flow; no recipient
//                         picker here, just message + anonymous)
//            server    -- gift Server Premium to one of the sender's
//                         own guilds; picker shows guilds with the
//                         bot installed
//
//          Matches the UI/UX Principles in the plan:
//            - one focal point per surface (the preview pane)
//            - single Gift icon mark; no emoji clusters
//            - thin gold accent line, no full-bleed gradients
//            - real server icons, real avatars (no placeholder hash)
//            - typography hierarchy: headline / supporting / metadata
//            - cancel link, no "are you sure" interstitial
// ============================================================
import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { Gift, Loader2, Check } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useCurrency } from "@/hooks/useCurrency"

export type GiftMode = "lionheart" | "server"
export type GiftableLionHeartTier = "LIONHEART" | "LIONHEART_PLUS" | "LIONHEART_PLUS_PLUS"

interface GiftFlowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: GiftMode
  // Required when mode === "lionheart"
  tier?: GiftableLionHeartTier
}

interface ServerOption {
  guildId: string
  guildName: string
  iconUrl: string | null
  trackedTimeHours: number
  role: "admin" | "moderator" | "member"
  botPresent: boolean
}

const TIER_META: Record<GiftableLionHeartTier, {
  label: string
  priceEur: number
  priceUsd: number
  perkLine: string
}> = {
  LIONHEART: {
    label: "LionHeart",
    priceEur: 4.99,
    priceUsd: 5.99,
    perkLine: "500 LionGems/month, faster pet growth, double voice coins.",
  },
  LIONHEART_PLUS: {
    label: "LionHeart+",
    priceEur: 9.99,
    priceUsd: 11.99,
    perkLine: "1,200 LionGems/month, bigger farm boosts, longer water duration.",
  },
  LIONHEART_PLUS_PLUS: {
    label: "LionHeart++",
    priceEur: 19.99,
    priceUsd: 23.99,
    perkLine: "3,000 LionGems/month and a free Server Premium slot of your choice.",
  },
}

const SERVER_PREMIUM_EUR = 9.99
const SERVER_PREMIUM_USD = 11.99

const MAX_MESSAGE_LEN = 200

export default function GiftFlowModal({
  open,
  onOpenChange,
  mode,
  tier,
}: GiftFlowModalProps) {
  const { data: session } = useSession()
  const { currency, symbol } = useCurrency()
  const [servers, setServers] = useState<ServerOption[] | null>(null)
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state when the modal opens so re-opening starts fresh.
  useEffect(() => {
    if (open) {
      setMessage("")
      setAnonymous(false)
      setError(null)
      setSelectedGuildId(null)
    }
  }, [open])

  // Server-gift mode: fetch the sender's guilds (only on open).
  useEffect(() => {
    if (!open || mode !== "server") return
    let cancelled = false
    fetch("/api/dashboard/servers")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        const list: ServerOption[] = Array.isArray(data?.servers)
          ? data.servers.filter((s: ServerOption) => s.botPresent)
          : []
        setServers(list)
        if (list.length > 0) setSelectedGuildId(list[0].guildId)
      })
      .catch(() => {
        if (!cancelled) setServers([])
      })
    return () => {
      cancelled = true
    }
  }, [open, mode])

  const selectedServer = useMemo(
    () => servers?.find((s) => s.guildId === selectedGuildId) ?? null,
    [servers, selectedGuildId],
  )

  const tierMeta = tier ? TIER_META[tier] : null

  const price = useMemo(() => {
    if (mode === "lionheart" && tierMeta) {
      return currency === "eur" ? tierMeta.priceEur : tierMeta.priceUsd
    }
    return currency === "eur" ? SERVER_PREMIUM_EUR : SERVER_PREMIUM_USD
  }, [mode, tierMeta, currency])

  const priceLabel = `${symbol}${price.toFixed(2)}/mo`

  const productLabel = mode === "lionheart"
    ? tierMeta?.label ?? "LionHeart"
    : "Server Premium"

  const senderName = (session?.user?.name ?? "You").split("#")[0]
  const senderImage = session?.user?.image ?? null

  const canSubmit = useMemo(() => {
    if (submitting) return false
    if (mode === "server") return !!selectedGuildId
    return !!tier
  }, [submitting, mode, selectedGuildId, tier])

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      if (mode === "lionheart") {
        if (!tier) {
          setError("Pick a tier first.")
          return
        }
        const res = await fetch("/api/subscription/gift-lionheart-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier,
            currency,
            message: message.trim() || undefined,
            anonymous,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data?.error ?? "Couldn't start checkout. Try again.")
          return
        }
        if (data.url) {
          window.location.href = data.url
        }
      } else {
        if (!selectedGuildId) {
          setError("Pick a server to gift to.")
          return
        }
        const res = await fetch("/api/subscription/gift-server-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guildId: selectedGuildId,
            currency,
            message: message.trim() || undefined,
            anonymous,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data?.error ?? "Couldn't start checkout. Try again.")
          return
        }
        if (data.url) {
          window.location.href = data.url
        }
      }
    } catch {
      setError("Network error. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden border-border bg-card">
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            @keyframes gfm-fade-up {
              0%   { opacity: 0; transform: translateY(4px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          }
          .gfm-fade-up { animation: gfm-fade-up 220ms ease-out both; }
          .gfm-gold-text {
            background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 40%, #fde68a 60%, #fbbf24 80%, #f59e0b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}</style>

        <div
          aria-hidden
          className="h-px w-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)" }}
        />

        <div className="grid md:grid-cols-2 max-h-[85vh] overflow-hidden">
          <div className="p-6 md:p-7 border-r border-border overflow-y-auto">
            <DialogTitle asChild>
              <h2 className="flex items-center gap-2 text-lg font-bold mb-1">
                <Gift size={18} className="text-amber-400" aria-hidden />
                Gift {productLabel}
              </h2>
            </DialogTitle>
            <p className="text-sm text-muted-foreground mb-5">
              {priceLabel} billed monthly to your card. Cancel anytime in your Stripe portal.
            </p>

            {mode === "server" && (
              <div className="mb-5">
                <label className="block text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wide">
                  Gift to
                </label>
                {servers === null && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    Loading your servers…
                  </div>
                )}
                {servers && servers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    You aren't in any servers with LionBot installed yet.
                  </p>
                )}
                {servers && servers.length > 0 && (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {servers.map((s) => (
                      <button
                        key={s.guildId}
                        type="button"
                        onClick={() => setSelectedGuildId(s.guildId)}
                        className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          selectedGuildId === s.guildId
                            ? "border-amber-500/50 bg-amber-500/5"
                            : "border-border hover:bg-muted/40"
                        }`}
                        aria-pressed={selectedGuildId === s.guildId}
                      >
                        <ServerIcon iconUrl={s.iconUrl} name={s.guildName} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-foreground truncate">
                            {s.guildName}
                          </div>
                          <div className="text-[11px] text-muted-foreground capitalize">
                            You're {s.role === "admin" ? "an admin" : `a ${s.role}`}
                          </div>
                        </div>
                        {selectedGuildId === s.guildId && (
                          <Check size={16} className="text-amber-400 shrink-0" aria-hidden />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mode === "lionheart" && (
              <div className="mb-5 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                Your recipient will sign in with Discord to claim. You'll get a share link right after checkout.
              </div>
            )}

            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                  Add a note (optional)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {message.length}/{MAX_MESSAGE_LEN}
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LEN))}
                placeholder=""
                rows={3}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:border-amber-500/40"
              />
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={() => setAnonymous((v) => !v)}
                className="flex items-center gap-3 w-full"
                aria-pressed={anonymous}
              >
                <span
                  className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
                    anonymous ? "bg-amber-500/70" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      anonymous ? "translate-x-4" : ""
                    }`}
                  />
                </span>
                <span className="text-sm text-foreground">Send anonymously</span>
                <span className="text-[11px] text-muted-foreground ml-auto">
                  {anonymous ? "Name hidden" : "Name shown"}
                </span>
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Starting checkout…
                  </>
                ) : (
                  <>Continue · {priceLabel}</>
                )}
              </button>
            </div>
          </div>

          <div className="hidden md:block bg-background overflow-y-auto">
            <div className="p-6 md:p-7">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3 font-semibold">
                What they'll see
              </p>

              {mode === "lionheart" && tierMeta && (
                <ClaimPreview
                  tierLabel={tierMeta.label}
                  perkLine={tierMeta.perkLine}
                  senderName={anonymous ? null : senderName}
                  senderImage={anonymous ? null : senderImage}
                  message={message.trim()}
                />
              )}

              {mode === "server" && (
                <ServerGiftPreview
                  serverName={selectedServer?.guildName ?? "Your server"}
                  serverIcon={selectedServer?.iconUrl ?? null}
                  senderName={anonymous ? null : senderName}
                  senderImage={anonymous ? null : senderImage}
                  message={message.trim()}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ServerIcon({ iconUrl, name }: { iconUrl: string | null; name: string }) {
  const fallback = name.charAt(0).toUpperCase()
  return iconUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt={name}
      className="w-9 h-9 rounded-full shrink-0 border border-border"
    />
  ) : (
    <div className="w-9 h-9 rounded-full shrink-0 border border-border bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
      {fallback}
    </div>
  )
}

function ClaimPreview({
  tierLabel,
  perkLine,
  senderName,
  senderImage,
  message,
}: {
  tierLabel: string
  perkLine: string
  senderName: string | null
  senderImage: string | null
  message: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div
        aria-hidden
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)" }}
      />
      <div className="p-6 text-center">
        <div className="relative mx-auto w-14 h-14 mb-4">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(245,158,11,0) 70%)",
              transform: "scale(2)",
            }}
          />
          <div className="relative w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Gift size={22} className="text-amber-400" aria-hidden />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-1">
          {senderName ? `${senderName} sent you` : "An anonymous gifter sent you"}
        </p>
        <p className="text-xl font-bold mb-1">
          <span className="gfm-gold-text">{tierLabel}</span>
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-4 px-2">
          {perkLine}
        </p>

        {message && (
          <div className="text-left border-l-2 border-amber-500/40 pl-3 py-0.5 mx-2 mb-4 gfm-fade-up">
            <p className="text-xs italic text-foreground/90">{message}</p>
          </div>
        )}

        <div className="inline-block rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold">
          Claim your premium
        </div>
      </div>
    </div>
  )
}

function ServerGiftPreview({
  serverName,
  serverIcon,
  senderName,
  senderImage,
  message,
}: {
  serverName: string
  serverIcon: string | null
  senderName: string | null
  senderImage: string | null
  message: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div
        aria-hidden
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)" }}
      />
      <div className="p-5">
        <p className="text-[11px] uppercase tracking-wide text-amber-400 font-semibold mb-3">
          Premium gift received
        </p>
        <div className="flex items-center gap-3 mb-3">
          <SenderAvatar name={senderName} image={senderImage} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">
              <span className="font-semibold">
                {senderName ?? "An anonymous gifter"}
              </span>{" "}
              <span className="text-muted-foreground">gifted Server Premium to</span>
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              {serverName}
            </p>
          </div>
        </div>

        {message && (
          <div className="border-l-2 border-amber-500/40 pl-3 py-0.5 mb-3 gfm-fade-up">
            <p className="text-xs italic text-foreground/90">{message}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mt-4">
          <span className="text-[11px] rounded-full bg-muted text-foreground/80 px-2.5 py-1">
            Anti-AFK
          </span>
          <span className="text-[11px] rounded-full bg-muted text-foreground/80 px-2.5 py-1">
            Sticky Messages
          </span>
          <span className="text-[11px] rounded-full bg-muted text-foreground/80 px-2.5 py-1">
            Leaderboard autopost
          </span>
        </div>
      </div>
    </div>
  )
}

function SenderAvatar({ name, image }: { name: string | null; image: string | null }) {
  if (!name) {
    // Anonymous: tasteful gift mark on a soft surface (no question marks)
    return (
      <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
        <Gift size={16} className="text-amber-400" aria-hidden />
      </div>
    )
  }
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt={name}
      className="w-10 h-10 rounded-full border border-border shrink-0"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-semibold text-foreground/80 shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
