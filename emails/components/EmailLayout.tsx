// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Outer wrapper used by every email template. Provides
//          the logo header, max-width container, and the legally
//          required footer (unsubscribe + preferences + postal
//          address). Every template just needs to drop its body
//          inside <EmailLayout previewText="...">.
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
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={outerContainer}>
          <Section style={headerSection}>
            <Img
              src={brand.logoUrl}
              alt={brand.name}
              width="48"
              height="48"
              style={logoStyle}
            />
            <Text style={brandName}>{brand.name}</Text>
          </Section>

          <Container style={cardStyle}>{children}</Container>

          <Section style={footerSection}>
            <Text style={footerText}>
              You are receiving this email because you signed in to{" "}
              <Link href={brand.siteUrl} style={footerLink}>
                {brand.name}
              </Link>{" "}
              with Discord.
            </Text>
            <Text style={footerText}>
              <Link href={prefsHref} style={footerLink}>
                Manage email preferences
              </Link>
              {unsubscribeUrl ? (
                <>
                  {"  ·  "}
                  <Link href={unsubscribeUrl} style={footerLink}>
                    Unsubscribe
                  </Link>
                </>
              ) : null}
              {"  ·  "}
              <Link href={brand.discordInvite} style={footerLink}>
                Discord
              </Link>
            </Text>
            <Hr style={footerHr} />
            <Text style={addressText}>{brand.postalAddress}</Text>
            <Text style={addressText}>
              &copy; {new Date().getFullYear()} {brand.name}. {brand.tagline}
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
  backgroundColor: brand.colors.background,
  fontFamily: brand.fontStack,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  color: brand.colors.text,
}

const outerContainer: React.CSSProperties = {
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "32px 16px 24px",
}

const headerSection: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "16px",
}

const logoStyle: React.CSSProperties = {
  display: "inline-block",
  borderRadius: "12px",
  border: `2px solid ${brand.colors.border}`,
}

const brandName: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: "14px",
  letterSpacing: "0.08em",
  fontWeight: 600,
  textTransform: "uppercase",
  color: brand.colors.headingAccent,
}

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "600px",
  backgroundColor: brand.colors.surface,
  borderRadius: "16px",
  border: `1px solid ${brand.colors.border}`,
  padding: "32px 28px",
  boxShadow: "0 2px 12px rgba(46, 76, 112, 0.06)",
}

const footerSection: React.CSSProperties = {
  marginTop: "20px",
  textAlign: "center",
  padding: "0 12px",
}

const footerText: React.CSSProperties = {
  margin: "4px 0",
  fontSize: "12px",
  lineHeight: "1.6",
  color: brand.colors.textMuted,
}

const footerLink: React.CSSProperties = {
  color: brand.colors.headingAccent,
  textDecoration: "underline",
}

const footerHr: React.CSSProperties = {
  border: "none",
  borderTop: `1px solid ${brand.colors.border}`,
  margin: "16px 0 12px",
}

const addressText: React.CSSProperties = {
  margin: "2px 0",
  fontSize: "11px",
  lineHeight: "1.5",
  color: brand.colors.textMuted,
}

export default EmailLayout
