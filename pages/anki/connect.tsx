// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Anki addon pairing page. The Anki addon opens the
//          user's system browser to this URL with PKCE params,
//          we authenticate via Discord (NextAuth), generate a
//          single-use 12-char pairing code bound to the addon's
//          (state, code_challenge, device_id), and display it.
//          The user pastes the code into the addon, which
//          completes the exchange via /api/anki/auth/exchange.
//
//          Two states:
//            (a) signed out -> "Sign in with Discord" CTA. The
//                callbackUrl preserves the addon's query so the
//                state/challenge/device_id round-trip safely.
//            (b) signed in  -> pairing code panel with copy button,
//                countdown to expiry, and a hint about the home
//                guild (changeable later in /dashboard/anki).
//
//          getServerSideProps does the heavy lifting: validates
//          the addon's params, generates a fresh code (replacing
//          any prior unconsumed code for the same device), inserts
//          into anki_pairing_codes, and renders the page.
//
//          Visual treatment matches the gift-claim page shell
//          (centered card, soft top accent line) — premium-feeling
//          per the project's UI/UX quality bar.
// ============================================================
import type { GetServerSideProps } from "next"
import { useState, useEffect, useMemo } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/router"
import Head from "next/head"
import { Copy, CheckCircle2, AlertTriangle } from "lucide-react"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/utils/prisma"
import {
  generateAnkiPairingCode,
  hashAnkiPairingCode,
} from "@/lib/anki/auth"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const SUPPORT_GUILD_ID = "780195610154237993"
const SUPPORT_GUILD_NAME = "LionBot Support Server"

type ConnectView =
  | { state: "BAD_PARAMS"; reason: string }
  | { state: "SIGNED_OUT"; deviceName: string }
  | {
      state: "CODE_READY"
      pairingCode: string
      expiresAtIso: string
      deviceName: string
      homeGuildName: string
      isDefaultHomeGuild: boolean
    }

interface PageProps {
  view: ConnectView
}

interface ConnectQuery {
  state?: string
  challenge?: string
  device_id?: string
  device_name?: string
  v?: string
}

function readQuery(q: ConnectQuery) {
  const state = typeof q.state === "string" ? q.state : null
  const challenge = typeof q.challenge === "string" ? q.challenge : null
  const deviceId = typeof q.device_id === "string" ? q.device_id : null
  const deviceNameRaw = typeof q.device_name === "string" ? q.device_name : null
  const deviceName =
    deviceNameRaw && deviceNameRaw.length > 0 && deviceNameRaw.length <= 64
      ? deviceNameRaw
      : "Unknown device"
  return { state, challenge, deviceId, deviceName }
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  ctx
) => {
  const { state, challenge, deviceId, deviceName } = readQuery(
    ctx.query as ConnectQuery
  )

  // Validate the addon's PKCE params before doing anything else.
  if (!state || !challenge || !deviceId) {
    return {
      props: {
        view: {
          state: "BAD_PARAMS",
          reason: "Missing one of: state, challenge, device_id",
        },
      },
    }
  }
  if (!UUID_RE.test(deviceId)) {
    return {
      props: {
        view: { state: "BAD_PARAMS", reason: "device_id must be a UUID" },
      },
    }
  }
  if (state.length < 16 || state.length > 256) {
    return {
      props: {
        view: { state: "BAD_PARAMS", reason: "state has invalid length" },
      },
    }
  }
  if (challenge.length < 43 || challenge.length > 128) {
    return {
      props: {
        view: { state: "BAD_PARAMS", reason: "challenge has invalid length" },
      },
    }
  }

  // NextAuth session check via raw cookie (same cookie name as
  // utils/adminAuth.ts:44).
  const token = await getToken({
    req: ctx.req,
    secret: process.env.SECRET,
    cookieName: "__Secure-next-auth.session-token.v2",
  })

  if (!token?.discordId) {
    return {
      props: { view: { state: "SIGNED_OUT", deviceName } },
    }
  }

  const userId = BigInt(token.discordId as string)

  // Determine the home guild label for the UI. Looking up the
  // guild's actual name from Discord would require a bot-token
  // API call per render — overkill for v1; we just show the ID
  // or the support guild's name.
  let homeGuildName = SUPPORT_GUILD_NAME
  let isDefaultHomeGuild = true
  try {
    const cfg = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { anki_home_guildid: true },
    })
    if (cfg?.anki_home_guildid) {
      const gid = cfg.anki_home_guildid.toString()
      if (gid !== SUPPORT_GUILD_ID) {
        // Try to pull a friendly name from guild_config (cached).
        const guild = await prisma.guild_config.findUnique({
          where: { guildid: cfg.anki_home_guildid },
          select: { guildid: true },
        })
        if (guild) {
          homeGuildName = `Server ${gid}`
          isDefaultHomeGuild = false
        }
      }
    }
  } catch (err) {
    console.warn("[anki/connect] home guild lookup failed:", err)
  }

  // Drop any prior unconsumed codes for this (userid, device_id).
  // Keeps the table small if the user refreshes the page.
  try {
    await prisma.anki_pairing_codes.deleteMany({
      where: {
        userid: userId,
        device_id: deviceId,
        consumed: false,
      },
    })
  } catch (err) {
    console.warn("[anki/connect] prior-code cleanup failed:", err)
  }

  const pairingCode = generateAnkiPairingCode()
  const codeHash = hashAnkiPairingCode(pairingCode)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  try {
    await prisma.anki_pairing_codes.create({
      data: {
        code_hash: codeHash,
        userid: userId,
        device_id: deviceId,
        device_name: deviceName,
        code_challenge: challenge,
        state,
        expires_at: expiresAt,
      },
    })
  } catch (err) {
    console.error("[anki/connect] pairing code insert failed:", err)
    return {
      props: {
        view: {
          state: "BAD_PARAMS",
          reason: "Could not issue a pairing code — try again in a moment",
        },
      },
    }
  }

  return {
    props: {
      view: {
        state: "CODE_READY",
        pairingCode,
        expiresAtIso: expiresAt.toISOString(),
        deviceName,
        homeGuildName,
        isDefaultHomeGuild,
      },
    },
  }
}

export default function AnkiConnectPage({ view }: PageProps) {
  const router = useRouter()
  const { status: sessionStatus } = useSession()
  const callbackUrl = router.asPath

  if (view.state === "BAD_PARAMS") {
    return <ConnectShell title="Couldn't open pairing">
      <BadParams reason={view.reason} />
    </ConnectShell>
  }

  if (view.state === "SIGNED_OUT") {
    return <ConnectShell title="Sign in to pair Anki">
      <SignedOut
        deviceName={view.deviceName}
        sessionStatus={sessionStatus}
        onSignIn={() => signIn("discord", { callbackUrl })}
      />
    </ConnectShell>
  }

  return <ConnectShell title="Almost done — paste this in Anki">
    <CodeReady view={view} />
  </ConnectShell>
}

// ----------------------------------------------------------------
// Shell — shared layout for all three states
// ----------------------------------------------------------------
function ConnectShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <>
      <Head>
        <title>{title} | LionGotchi for Anki</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-card border border-border overflow-hidden relative">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(132,204,22,0.55), transparent)",
              }}
            />
            <div className="p-8">{children}</div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Don&apos;t have the addon yet?{" "}
            <a href="/anki/download" className="text-foreground hover:underline">
              Download here
            </a>
            .
          </p>
        </div>
      </main>
    </>
  )
}

// ----------------------------------------------------------------
// BAD_PARAMS
// ----------------------------------------------------------------
function BadParams({ reason }: { reason: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-500">
        <AlertTriangle size={20} />
        <h2 className="text-lg font-semibold">Pairing link looks wrong</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        {reason}.
      </p>
      <p className="text-sm text-muted-foreground">
        Open the LionGotchi panel inside Anki and click <strong>Sign in</strong>{" "}
        again — the addon will open a fresh link.
      </p>
    </div>
  )
}

// ----------------------------------------------------------------
// SIGNED_OUT
// ----------------------------------------------------------------
function SignedOut({
  deviceName,
  sessionStatus,
  onSignIn,
}: {
  deviceName: string
  sessionStatus: string
  onSignIn: () => void
}) {
  const loading = sessionStatus === "loading"
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Connect Anki to LionBot
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in with Discord to pair{" "}
          <span className="text-foreground font-medium">{deviceName}</span> to
          your LionBot account.
        </p>
      </div>

      <button
        type="button"
        onClick={onSignIn}
        disabled={loading}
        className="w-full rounded-lg bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-60 px-4 py-3 text-white font-medium transition-colors"
      >
        {loading ? "Loading…" : "Sign in with Discord"}
      </button>

      <p className="text-xs text-muted-foreground">
        Use the same Discord account you use on LionBot.
      </p>
    </div>
  )
}

// ----------------------------------------------------------------
// CODE_READY
// ----------------------------------------------------------------
function CodeReady({
  view,
}: {
  view: Extract<ConnectView, { state: "CODE_READY" }>
}) {
  const expiresAt = useMemo(() => new Date(view.expiresAtIso), [view.expiresAtIso])
  const [now, setNow] = useState(() => new Date())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const msLeft = Math.max(0, expiresAt.getTime() - now.getTime())
  const expired = msLeft === 0
  const mm = Math.floor(msLeft / 60_000)
  const ss = Math.floor((msLeft % 60_000) / 1000)
  const countdown = `${mm}:${ss.toString().padStart(2, "0")}`

  const onCopy = async () => {
    try {
      const flat = view.pairingCode.replace(/-/g, "")
      await navigator.clipboard.writeText(flat)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Some browsers (no permission, http context) — silently
      // fall back to user copying manually.
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Pairing {view.deviceName}
        </p>
        <h1 className="text-2xl font-semibold text-foreground mt-1">
          Paste this code in Anki
        </h1>
      </div>

      <div className="rounded-xl bg-background border border-border p-6 text-center">
        <div
          className={`font-mono text-3xl tracking-[0.25em] select-all ${
            expired ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {view.pairingCode}
        </div>
        <button
          type="button"
          onClick={onCopy}
          disabled={expired}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm text-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 size={14} /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy code
            </>
          )}
        </button>
      </div>

      <p className="text-sm text-center text-muted-foreground">
        {expired ? (
          <span className="text-amber-500">
            This code expired. Reopen the LionGotchi panel in Anki and click
            Sign in again.
          </span>
        ) : (
          <>
            Code expires in <span className="font-mono text-foreground">{countdown}</span>
          </>
        )}
      </p>

      <div className="rounded-md bg-background/50 border border-border/50 p-3 text-xs text-muted-foreground">
        Your Anki reviews will count toward{" "}
        <span className="text-foreground font-medium">{view.homeGuildName}</span>
        {view.isDefaultHomeGuild ? (
          <>
            {" "}
            by default.{" "}
            <a href="/dashboard/anki" className="underline hover:text-foreground">
              Change later
            </a>
            .
          </>
        ) : (
          <>
            .{" "}
            <a href="/dashboard/anki" className="underline hover:text-foreground">
              Change in settings
            </a>
            .
          </>
        )}
      </div>
    </div>
  )
}
