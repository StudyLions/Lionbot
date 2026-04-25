// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Outer wrapper used by every email template. Dark theme
//          that mirrors lionbot.org with a glowing logo halo at the
//          top, generous side padding so the inner card breathes,
//          and a footer with social row + legal info.
//
//          Templates pass a hero band (optional) and a body. The
//          hero lets each template own its first impression while
//          the wrapper keeps brand consistency.
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
  hero?: React.ReactNode
  children: React.ReactNode
}

export function EmailLayout({
  previewText,
  unsubscribeUrl,
  preferencesUrl,
  hero,
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
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={outerContainer}>
          <Section style={topBrandRow}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              width="100%"
            >
              <tbody>
                <tr>
                  <td style={topBrandLeft}>
                    <table
                      role="presentation"
                      cellPadding={0}
                      cellSpacing={0}
                    >
                      <tbody>
                        <tr>
                          <td style={{ verticalAlign: "middle" }}>
                            <div style={logoHalo}>
                              <Img
                                src={brand.logoUrl}
                                alt={brand.name}
                                width="40"
                                height="40"
                                style={logoStyle}
                              />
                            </div>
                          </td>
                          <td
                            style={{
                              verticalAlign: "middle",
                              paddingLeft: "12px",
                            }}
                          >
                            <Text style={brandWordmark}>{brand.name}</Text>
                            <Text style={brandSub}>{brand.tagline}</Text>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={topBrandRight}>
                    <Link href={brand.siteUrl} style={topNavLink}>
                      lionbot.org
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Container style={cardStyle}>
            {hero ? <div style={heroSlot}>{hero}</div> : null}
            <div style={bodySlot}>{children}</div>
          </Container>

          <Section style={socialRow}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              align="center"
            >
              <tbody>
                <tr>
                  <td style={socialCell}>
                    <Link href={brand.discordInvite} style={socialChip}>
                      Discord
                    </Link>
                  </td>
                  <td style={socialCell}>
                    <Link
                      href={`${brand.siteUrl}/dashboard`}
                      style={socialChip}
                    >
                      Dashboard
                    </Link>
                  </td>
                  <td style={socialCell}>
                    <Link href={`${brand.siteUrl}/donate`} style={socialChip}>
                      Premium
                    </Link>
                  </td>
                  <td style={socialCell}>
                    <Link href={brand.topggUrl} style={socialChip}>
                      Vote
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={footerSection}>
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
                  {"  ·  "}
                  <Link href={unsubscribeUrl} style={footerLink}>
                    Unsubscribe
                  </Link>
                </>
              ) : null}
            </Text>
            <Hr style={footerHr} />
            <Text style={addressText}>{brand.postalAddress}</Text>
            <Text style={addressText}>
              &copy; {new Date().getFullYear()} {brand.name}. Built by the
              StudyLions team for focused communities.
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
  maxWidth: "640px",
  margin: "0 auto",
  padding: "28px 16px 28px",
}

const topBrandRow: React.CSSProperties = {
  marginBottom: "16px",
}

const topBrandLeft: React.CSSProperties = {
  textAlign: "left",
  verticalAlign: "middle",
}

const topBrandRight: React.CSSProperties = {
  textAlign: "right",
  verticalAlign: "middle",
}

const logoHalo: React.CSSProperties = {
  display: "inline-block",
  padding: "4px",
  borderRadius: "14px",
  background:
    "linear-gradient(135deg, rgba(59,130,246,0.45), rgba(168,85,247,0.35))",
  boxShadow: "0 12px 36px -12px rgba(59,130,246,0.55)",
}

const logoStyle: React.CSSProperties = {
  display: "block",
  borderRadius: "10px",
  border: "2px solid #0B0F1A",
  background: "#0B0F1A",
}

const brandWordmark: React.CSSProperties = {
  margin: 0,
  fontSize: "16px",
  fontWeight: 800,
  color: brand.colors.headline,
  letterSpacing: "-0.01em",
  fontFamily: brand.fontStack,
}

const brandSub: React.CSSProperties = {
  margin: "2px 0 0",
  fontSize: "11px",
  fontWeight: 500,
  color: brand.colors.textMuted,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  fontFamily: brand.fontStack,
}

const topNavLink: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: brand.colors.textMuted,
  textDecoration: "none",
  letterSpacing: "0.02em",
  fontFamily: brand.fontStack,
}

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "640px",
  backgroundColor: brand.colors.background,
  borderRadius: "20px",
  border: `1px solid ${brand.colors.border}`,
  overflow: "hidden",
  boxShadow:
    "0 30px 60px -30px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255,255,255,0.02) inset",
}

const heroSlot: React.CSSProperties = {
  width: "100%",
}

const bodySlot: React.CSSProperties = {
  padding: "32px 32px 28px",
}

const socialRow: React.CSSProperties = {
  marginTop: "20px",
  textAlign: "center",
}

const socialCell: React.CSSProperties = {
  padding: "0 4px",
}

const socialChip: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 14px",
  fontSize: "12px",
  fontWeight: 600,
  color: brand.colors.text,
  textDecoration: "none",
  borderRadius: "999px",
  border: `1px solid ${brand.colors.border}`,
  backgroundColor: brand.colors.background,
  fontFamily: brand.fontStack,
}

const footerSection: React.CSSProperties = {
  marginTop: "16px",
  textAlign: "center",
  padding: "0 12px",
}

const footerText: React.CSSProperties = {
  margin: "4px 0",
  fontSize: "12px",
  lineHeight: "1.6",
  color: brand.colors.textMuted,
  fontFamily: brand.fontStack,
}

const footerLink: React.CSSProperties = {
  color: brand.colors.text,
  textDecoration: "underline",
  textDecorationColor: "rgba(148,163,184,0.4)",
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
