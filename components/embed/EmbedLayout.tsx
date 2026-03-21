// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: Minimal layout for top.gg iframe embeds -- no header,
//          footer, or navigation. Transparent background with
//          dark-themed typography, designed to blend into top.gg's UI.
// ============================================================
import Head from "next/head"

interface EmbedLayoutProps {
  children: React.ReactNode
  title?: string
  height?: string
}

export default function EmbedLayout({
  children,
  title = "LionBot",
  height,
}: EmbedLayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex, nofollow" />
        <style>{`
          html, body {
            background: transparent !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          body {
            font-family: 'Inter', 'Rubik', -apple-system, BlinkMacSystemFont,
              'Segoe UI', Roboto, sans-serif;
            color: rgba(255, 255, 255, 0.92);
          }
          ::-webkit-scrollbar { display: none; }
        `}</style>
      </Head>
      <div
        style={{
          background: "transparent",
          minHeight: height || "auto",
          padding: "0",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </>
  )
}
