// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Read-only template review on preview deployments only.
// ============================================================
import Head from "next/head"
import type { GetServerSideProps } from "next"
import { useState } from "react"

export default function FundraiserEmailPreview({ html, text }: { html: string; text: string }) {
  const [mode, setMode] = useState("desktop")
  return <>
    <Head><title>Leo’s community letter — preview</title><meta name="robots" content="noindex,nofollow" /></Head>
    <main style={{ minHeight: "100vh", background: "#091a2a", padding: "24px 12px", color: "white", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto 20px" }}><p style={{ color: "#f6c66c", fontSize: 12, letterSpacing: 2 }}>LIONBOT · EMAIL PREVIEW</p><h1 style={{ fontSize: 24, margin: "12px 0" }}>A personal letter from Ari.</h1><p style={{ color: "#b5c4d1", fontSize: 14 }}>A preview only. No email is sent from this page.</p><div style={{ display: "flex", gap: 8, marginTop: 16 }}>{["desktop", "mobile", "text"].map(value => <button key={value} onClick={() => setMode(value)} aria-pressed={mode === value} style={{ border: "1px solid #486077", borderRadius: 8, background: mode === value ? "#f6c66c" : "transparent", color: mode === value ? "#10263a" : "white", padding: "8px 16px", textTransform: "capitalize", cursor: "pointer" }}>{value}</button>)}</div></div>
      {mode === "text" ? <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxWidth: 680, margin: "0 auto", background: "#fff", color: "#293644", padding: 24, lineHeight: 1.7, fontFamily: "Arial, sans-serif" }}>{text}</pre> : <iframe title="Fundraiser email" sandbox="" referrerPolicy="no-referrer" srcDoc={html} style={{ display: "block", width: "100%", maxWidth: mode === "mobile" ? 375 : 720, height: 1900, margin: "0 auto", border: 0 }} />}
    </main>
  </>
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  if (process.env.VERCEL_ENV !== "preview") return { notFound: true }
  res.setHeader("Cache-Control", "private, no-store")
  const { DEFAULT_FUNDRAISER_CONTENT } = await import("@/utils/email/campaigns/content")
  const { renderCampaignEmail } = await import("@/utils/email/campaigns/render")
  // Deployment URL is supplied by Vercel, never by a visitor-controlled query.
  const assetBaseUrl = `https://${process.env.VERCEL_URL}`
  const preview = await renderCampaignEmail(DEFAULT_FUNDRAISER_CONTENT, {
    unsubscribeUrl: `${assetBaseUrl}/campaign-unsubscribe/preview`, assetBaseUrl,
  })
  return { props: preview }
}
