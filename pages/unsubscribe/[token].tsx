// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Public unsubscribe page (no auth needed). Verifies the
//          signed token server-side, applies the unsubscribe
//          immediately, then renders a confirmation card with the
//          option to manage other preferences (sign-in required).
// ============================================================
import type { GetServerSideProps } from "next"
import Link from "next/link"
import Head from "next/head"
import { prisma } from "@/utils/prisma"
import { verifyUnsubscribeToken } from "@/utils/email/tokens"
import {
  PREF_DESCRIPTIONS,
  brand,
  type EmailPrefKey,
} from "@/utils/email/brand"

const PREF_KEYS: EmailPrefKey[] = [
  "email_pref_welcome",
  "email_pref_weekly_digest",
  "email_pref_lifecycle",
  "email_pref_announcements",
  "email_pref_premium",
]

interface Props {
  ok: boolean
  scope: "all" | EmailPrefKey | null
  scopeLabel: string | null
  email: string | null
  error?: string
}

export default function UnsubscribePage(props: Props) {
  return (
    <>
      <Head>
        <title>{props.ok ? "Unsubscribed" : "Unsubscribe"} · {brand.name}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div
        style={{
          minHeight: "100vh",
          padding: "48px 16px",
          background: brand.colors.background,
          color: brand.colors.text,
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Segoe UI',Rubik,sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            background: brand.colors.surface,
            border: `1px solid ${brand.colors.border}`,
            borderRadius: "16px",
            padding: "36px 32px",
            boxShadow: "0 4px 18px rgba(46,76,112,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <img
              src={brand.logoUrl}
              alt={brand.name}
              width={40}
              height={40}
              style={{ borderRadius: "10px", border: `1px solid ${brand.colors.border}` }}
            />
            <div style={{ fontWeight: 700, color: brand.colors.headingAccent, letterSpacing: "0.05em" }}>
              {brand.name.toUpperCase()}
            </div>
          </div>

          {props.ok ? (
            <>
              <h1 style={{ fontSize: "24px", margin: "0 0 12px", color: brand.colors.headline }}>
                You are unsubscribed
              </h1>
              <p style={{ fontSize: "15px", lineHeight: 1.6, margin: "0 0 16px" }}>
                You will no longer receive{" "}
                <strong>{props.scopeLabel}</strong>
                {props.email ? (
                  <>
                    {" "}at <strong>{props.email}</strong>
                  </>
                ) : null}
                .
              </p>
              <p style={{ fontSize: "14px", lineHeight: 1.6, margin: "0 0 24px", color: brand.colors.textMuted }}>
                Want to stay in the loop on a few things instead? Sign in with
                Discord and pick exactly which categories you want.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <Link
                  href="/dashboard/settings#email"
                  style={{
                    display: "inline-block",
                    padding: "11px 20px",
                    borderRadius: "10px",
                    background: brand.colors.primary,
                    color: "#fff",
                    fontWeight: 600,
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Manage email preferences
                </Link>
                <Link
                  href="/"
                  style={{
                    display: "inline-block",
                    padding: "11px 20px",
                    borderRadius: "10px",
                    background: "transparent",
                    color: brand.colors.headingAccent,
                    fontWeight: 600,
                    textDecoration: "none",
                    fontSize: "14px",
                    border: `1px solid ${brand.colors.border}`,
                  }}
                >
                  Back to {brand.name}
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: "24px", margin: "0 0 12px", color: brand.colors.danger }}>
                This link could not be verified
              </h1>
              <p style={{ fontSize: "15px", lineHeight: 1.6, margin: "0 0 16px" }}>
                {props.error ||
                  "The unsubscribe link in your email is invalid or has expired."}
              </p>
              <p style={{ fontSize: "14px", lineHeight: 1.6, margin: "0 0 24px", color: brand.colors.textMuted }}>
                You can manage your email preferences directly from your
                dashboard while signed in with Discord.
              </p>
              <Link
                href="/dashboard/settings#email"
                style={{
                  display: "inline-block",
                  padding: "11px 20px",
                  borderRadius: "10px",
                  background: brand.colors.primary,
                  color: "#fff",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                Open dashboard settings
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const tokenParam = ctx.params?.token
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam

  if (!token) {
    return {
      props: {
        ok: false,
        scope: null,
        scopeLabel: null,
        email: null,
        error: "Missing unsubscribe token.",
      },
    }
  }

  const verified = verifyUnsubscribeToken(token)
  if (!verified) {
    return {
      props: {
        ok: false,
        scope: null,
        scopeLabel: null,
        email: null,
        error: "This link is invalid or has expired.",
      },
    }
  }

  try {
    const update: Partial<
      Record<EmailPrefKey | "email_unsubscribed_all", boolean>
    > = {}
    let scopeLabel: string

    if (verified.scope === "all") {
      update.email_unsubscribed_all = true
      for (const key of PREF_KEYS) update[key] = false
      scopeLabel = "any LionBot emails"
    } else {
      update[verified.scope] = false
      scopeLabel =
        PREF_DESCRIPTIONS[verified.scope]?.label.toLowerCase() ?? "these emails"
    }

    const updated = await prisma.user_config.upsert({
      where: { userid: verified.userid },
      update,
      create: { userid: verified.userid, ...update },
      select: { email: true },
    })

    return {
      props: {
        ok: true,
        scope: verified.scope,
        scopeLabel,
        email: updated.email ?? null,
      },
    }
  } catch (e) {
    console.error("[unsubscribe page] failed:", e)
    return {
      props: {
        ok: false,
        scope: null,
        scopeLabel: null,
        email: null,
        error: "Something went wrong on our end. Please try again later.",
      },
    }
  }
}
