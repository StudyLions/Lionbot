// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Outer wrapper for every email. Restraint-first design:
//          a single quiet card, a small lion mark in the top-left,
//          generous padding, and a utilitarian footer. No hero band,
//          no halo, no social chip row -- the brand is the typography
//          and the lion. Inspired by how Linear/Vercel/Resend send.
// ============================================================
import * as React from "react"
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { brand } from "../../utils/email/brand"

interface EmailLayoutProps {
  previewText: string
  unsubscribeUrl?: string
  preferencesUrl?: string
  children: React.ReactNode
}

export function EmailLayout({
  previewText,
  unsubscribeUrl,
  preferencesUrl,
  children,
}: EmailLayoutProps) {
  const prefsHref = preferencesUrl || `${brand.siteUrl}/dashboard/settings#email`

  return (
    <Html lang="en">
      <Head>
        <meta name="x-apple-disable-message-reformatting" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="color-scheme" content="dark only" />
        <meta name="supported-color-schemes" content="dark only" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={outerContainer}>
          <Section style={brandRow}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              width="100%"
            >
              <tbody>
                <tr>
                  <td style={brandCell}>
                    <Img
                      src={brand.logoUrl}
                      alt={brand.name}
                      width="28"
                      height="28"
                      style={logoStyle}
                    />
                    <span style={wordmark}>{brand.name}</span>
                  </td>
                  <td style={brandLinkCell}>
                    <Link href={brand.siteUrl} style={topLink}>
                      lionbot.org
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Container style={cardStyle}>
            <div style={bodyPad}>{children}</div>
          </Container>

          <Section style={footer}>
            <Text style={footerText}>
              You are receiving this because you signed in to{" "}
              <Link href={brand.siteUrl} style={footerLink}>
                {brand.name}
              </Link>{" "}
              with Discord.
            </Text>
            <Text style={footerText}>
              <Link href={prefsHref} style={footerLink}>
                Email preferences
              </Link>
              {unsubscribeUrl ? (
                <>
                  <span style={footerSeparator}>·</span>
                  <Link href={unsubscribeUrl} style={footerLink}>
                    Unsubscribe
                  </Link>
                </>
              ) : null}
            </Text>
            <Hr style={footerHr} />
            <Text style={addressText}>{brand.postalAddress}</Text>
            <Text style={addressText}>
              &copy; {new Date().getFullYear()} {brand.name} · Built by the
              StudyLions team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  width: "100%",
  backgroundColor: brand.colors.page,
  fontFamily: brand.fontStack,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  color: brand.colors.text,
}

const outerContainer: React.CSSProperties = {
  width: "100%",
  maxWidth: "560px",
  margin: "0 auto",
  padding: "32px 16px 32px",
}

const brandRow: React.CSSProperties = {
  marginBottom: "18px",
}

const brandCell: React.CSSProperties = {
  textAlign: "left",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
}

const brandLinkCell: React.CSSProperties = {
  textAlign: "right",
  verticalAlign: "middle",
}

const logoStyle: React.CSSProperties = {
  display: "inline-block",
  verticalAlign: "middle",
  borderRadius: "8px",
  border: `1px solid ${brand.colors.border}`,
  background: brand.colors.background,
}

const wordmark: React.CSSProperties = {
  display: "inline-block",
  verticalAlign: "middle",
  marginLeft: "10px",
  fontSize: "15px",
  fontWeight: 700,
  color: brand.colors.headline,
  letterSpacing: "-0.005em",
  fontFamily: brand.fontStack,
}

const topLink: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: brand.colors.textMuted,
  textDecoration: "none",
  letterSpacing: "0.01em",
  fontFamily: brand.fontStack,
}

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "560px",
  backgroundColor: brand.colors.background,
  borderRadius: "14px",
  border: `1px solid ${brand.colors.border}`,
}

const bodyPad: React.CSSProperties = {
  padding: "32px 32px 28px",
}

const footer: React.CSSProperties = {
  marginTop: "20px",
  textAlign: "center",
  padding: "0 12px",
}

const footerText: React.CSSProperties = {
  margin: "4px 0",
  fontSize: "12.5px",
  lineHeight: "1.6",
  color: brand.colors.textMuted,
  fontFamily: brand.fontStack,
}

const footerLink: React.CSSProperties = {
  color: brand.colors.text,
  textDecoration: "underline",
  textDecorationColor: "rgba(148,163,184,0.35)",
}

const footerSeparator: React.CSSProperties = {
  margin: "0 8px",
  color: brand.colors.textMuted,
}

const footerHr: React.CSSProperties = {
  border: "none",
  borderTop: `1px solid ${brand.colors.border}`,
  margin: "16px 0 12px",
}

const addressText: React.CSSProperties = {
  margin: "2px 0",
  fontSize: "11px",
  lineHeight: "1.6",
  color: brand.colors.textMuted,
  fontFamily: brand.fontStack,
}

export default EmailLayout
