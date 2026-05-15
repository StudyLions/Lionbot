// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Sits at the top of /dashboard/servers/[id] when the
//          server currently has at least one ACTIVE gift sub.
//          Shows the gifter (or "Anonymous gifter"), the optional
//          gift message, and a row of chip-links to the premium
//          features unlocked. Treats anonymous gifts with a tasteful
//          Gift-icon avatar rather than a question-mark placeholder.
//
//          Visual treatment matches the gift surfaces principles:
//          ONE thin gold accent line at top, single Gift mark, no
//          marketing gradient. Avatar gets a soft halo on first
//          paint (the C.3 delight moment from the plan) -- runs
//          once per visit via sessionStorage flag.
//
//          Auto-fetches its own data so the parent only has to pass
//          the guildId. Renders null when the API has no active
//          gift -- the parent doesn't need to guard.
// ============================================================
import { useEffect, useState } from "react"
import Link from "next/link"
import { Gift } from "lucide-react"

interface GuildGiftInfo {
  active: boolean
  senderDisplayName: string | null
  senderAvatarUrl: string | null
  isAnonymous: boolean
  giftMessage: string | null
  currentPeriodEnd: string | null
}

interface Props {
  guildId: string
}

const HALO_SHOWN_PREFIX = "gift-halo-shown:"

export default function GiftedPremiumCard({ guildId }: Props) {
  const [info, setInfo] = useState<GuildGiftInfo | null>(null)
  const [showHalo, setShowHalo] = useState(false)

  useEffect(() => {
    fetch(`/api/dashboard/servers/${guildId}/gift-status`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GuildGiftInfo | null) => {
        setInfo(data ?? null)
      })
      .catch(() => setInfo(null))
  }, [guildId])

  useEffect(() => {
    if (!info?.active) return
    if (typeof window === "undefined") return
    const key = HALO_SHOWN_PREFIX + guildId
    if (!sessionStorage.getItem(key)) {
      setShowHalo(true)
      sessionStorage.setItem(key, "1")
    }
  }, [info?.active, guildId])

  if (!info?.active) return null

  const senderLabel = info.isAnonymous
    ? "Anonymous gifter"
    : info.senderDisplayName ?? "A friend"

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes gpc-halo-in {
            0%   { opacity: 0; transform: scale(0.85); }
            100% { opacity: 0.9; transform: scale(1); }
          }
        }
        .gpc-halo { animation: gpc-halo-in 700ms ease-out 100ms both; }
      `}</style>

      <div
        aria-hidden
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)" }}
      />

      <div className="p-5 flex items-start gap-4">
        <div className="relative w-12 h-12 shrink-0">
          {showHalo && (
            <div
              aria-hidden
              className="gpc-halo absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(245,158,11,0.30) 0%, rgba(245,158,11,0) 70%)",
                transform: "scale(2)",
              }}
            />
          )}
          {info.isAnonymous || !info.senderAvatarUrl ? (
            <div className="relative w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Gift size={20} className="text-amber-400" aria-hidden />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={info.senderAvatarUrl}
              alt={info.senderDisplayName ?? "Gifter"}
              className="relative w-12 h-12 rounded-full border border-border"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-amber-400 font-semibold mb-1">
            Premium gift active
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">From </span>
            <span className="font-semibold text-foreground">{senderLabel}</span>
          </p>
          {info.giftMessage && (
            <p className="mt-2 text-sm italic text-foreground/90 border-l-2 border-amber-500/40 pl-3">
              {info.giftMessage}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-1.5">
            <Link
              href={`/dashboard/servers/${guildId}/anti-afk`}
              className="text-[11px] rounded-full bg-muted hover:bg-muted/70 text-foreground/80 px-2.5 py-1 transition-colors"
            >
              Anti-AFK
            </Link>
            <Link
              href={`/dashboard/servers/${guildId}/sticky-messages`}
              className="text-[11px] rounded-full bg-muted hover:bg-muted/70 text-foreground/80 px-2.5 py-1 transition-colors"
            >
              Sticky messages
            </Link>
            <Link
              href={`/dashboard/servers/${guildId}/leaderboard-autopost`}
              className="text-[11px] rounded-full bg-muted hover:bg-muted/70 text-foreground/80 px-2.5 py-1 transition-colors"
            >
              Leaderboard autopost
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
