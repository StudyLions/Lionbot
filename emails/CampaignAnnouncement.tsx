// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Reusable, accessible announcement email with a personal
//          letter layout, fundraiser artwork, and visible opt-out.
// ============================================================
import * as React from "react"
import {
  Body, Button, Container, Head, Heading, Hr, Html, Img,
  Link, Preview, Section, Text,
} from "@react-email/components"
import { CampaignContent } from "../utils/email/campaigns/content"

export interface CampaignAnnouncementProps {
  content: CampaignContent
  unsubscribeUrl: string
  preferencesUrl: string
  siteUrl: string
  senderName: string
  postalAddress: string
  vatNumber: string
  heroUrl?: string
}

const font = "Arial, 'Helvetica Neue', Helvetica, sans-serif"
const ink = "#293644"
const muted = "#526174"
const navy = "#0A2033"
const gold = "#F6C66C"

export default function CampaignAnnouncement({
  content, unsubscribeUrl, preferencesUrl, siteUrl,
  senderName, postalAddress, vatNumber, heroUrl,
}: CampaignAnnouncementProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>{`@media only screen and (max-width: 620px) {
          .campaign-shell { padding: 16px 8px !important; }
          .campaign-pad { padding-left: 24px !important; padding-right: 24px !important; }
          .campaign-heading { font-size: 32px !important; line-height: 38px !important; }
          .campaign-footer { padding-left: 16px !important; padding-right: 16px !important; }
        }`}</style>
      </Head>
      <Preview>{content.preheader}</Preview>
      <Body style={{ margin: 0, backgroundColor: "#EDEFEF", fontFamily: font, color: ink }}>
        <Section className="campaign-shell" style={{ padding: "32px 12px" }}>
          <Container style={{ maxWidth: "600px", width: "100%", margin: "0 auto" }}>
            <Section style={{ backgroundColor: navy, borderRadius: "16px 16px 0 0", overflow: "hidden" }}>
              <Section className="campaign-pad" style={{ padding: "24px 40px" }}>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                  <tbody><tr>
                    <td style={{ verticalAlign: "middle" }}>
                      <Link href={siteUrl} style={{ color: "#FFF6E5", fontSize: "19px", lineHeight: "24px", fontWeight: 700, textDecoration: "none", letterSpacing: "-0.4px" }}>
                        <Img src={`${siteUrl}/images/lionbot-avatar.png`} alt="" width="30" height="30" style={{ display: "inline-block", verticalAlign: "middle", borderRadius: "8px", marginRight: "10px" }} />
                        LionBot
                      </Link>
                    </td>
                    <td align="right" style={{ color: "#B8C8D5", fontFamily: font, fontSize: "11px", lineHeight: "16px", letterSpacing: "1.1px" }}>
                      GROW TOGETHER
                    </td>
                  </tr></tbody>
                </table>
              </Section>
              {heroUrl ? (
                <Img src={heroUrl} alt="Pixel-art Leo beside his new server. Help keep Leo online: a new home for LionBot." width="600" style={{ display: "block", width: "100%", maxWidth: "600px", height: "auto", border: 0 }} />
              ) : null}
            </Section>

            <Section className="campaign-pad" style={{ padding: "36px 40px 32px", backgroundColor: "#FFFEFA", borderRadius: "0 0 16px 16px", borderBottom: "3px solid #DFE3E5" }}>
              <Text style={{ margin: "0 0 12px", color: "#8A5711", fontSize: "11px", fontWeight: 700, letterSpacing: "1.7px", lineHeight: "18px", textTransform: "uppercase" }}>
                {content.eyebrow}
              </Text>
              <Heading className="campaign-heading" as="h1" style={{ margin: "0 0 28px", color: navy, fontSize: "38px", lineHeight: "44px", letterSpacing: "-1.3px", fontWeight: 700 }}>
                {content.headline}
              </Heading>
              {content.body.map((paragraph, index) => (
                <Text key={index} style={{ margin: "0 0 20px", fontSize: "16px", lineHeight: "27px", color: ink }}>
                  {paragraph}
                </Text>
              ))}
              <Section style={{ padding: "8px 0 26px" }}>
                <Button href={content.ctaUrl} style={{ display: "inline-block", padding: "17px 26px", backgroundColor: gold, border: "1px solid #EAB250", borderRadius: "8px", color: "#202D38", fontFamily: font, fontSize: "16px", lineHeight: "20px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                  {content.ctaLabel} &rarr;
                </Button>
              </Section>
              <Hr style={{ border: 0, borderTop: "1px solid #E5E6DF", margin: "0 0 24px" }} />
              <Text style={{ margin: "0 0 4px", fontSize: "17px", lineHeight: "24px", fontWeight: 700, color: navy }}>
                {senderName}
              </Text>
              <Text style={{ margin: 0, color: muted, fontSize: "13px", lineHeight: "21px" }}>
                Founder of LionBot
              </Text>
            </Section>

            <Section className="campaign-footer" style={{ padding: "24px 36px 4px", textAlign: "center" }}>
              <Text style={footerText}>
                You’re receiving this because you subscribed to LionBot community announcements. You can unsubscribe at any time.
              </Text>
              <Text style={{ ...footerText, margin: "12px 0 16px" }}>
                <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe from announcements</Link>
                <br />
                <Link href={preferencesUrl} style={footerLink}>Manage email preferences</Link>
              </Text>
              <Text style={{ ...footerText, fontSize: "11px", lineHeight: "18px" }}>
                {senderName} · LionBot<br />
                {postalAddress}<br />
                P.IVA {vatNumber}
              </Text>
              <Text style={{ ...footerText, fontSize: "11px", marginTop: "10px" }}>
                <Link href={siteUrl} style={footerLink}>lionbot.org</Link>
                {" · "}
                <Link href="mailto:support@lionbot.org" style={footerLink}>Contact us</Link>
              </Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

const footerText: React.CSSProperties = {
  margin: "0 0 6px", color: muted, fontSize: "12px", lineHeight: "20px", fontFamily: font,
}
const footerLink: React.CSSProperties = {
  color: "#304E63", textDecoration: "underline", textUnderlineOffset: "2px",
}
