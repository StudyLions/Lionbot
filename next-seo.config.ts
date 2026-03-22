// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Default SEO configuration for next-seo
// ============================================================
import { DefaultSeoProps } from "next-seo";

const SITE_URL = "https://lionbot.org";

const defaultSEO: DefaultSeoProps = {
  titleTemplate: "%s | LionBot",
  defaultTitle: "LionBot - The Best Discord Productivity Bot",
  description:
    "Leo is the best, open-source, all-in-one solution that every Discord community needs. Activity tracking, economy, leaderboards, productivity tools and more.",
  canonical: SITE_URL,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "LionBot",
    title: "LionBot - The Best Discord Productivity Bot",
    description:
      "Leo is the best, open-source, all-in-one solution that every Discord community needs.",
    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Point default OG image to Vercel Blob instead of non-existent local file
    images: [
      {
        url: "https://dj03j4ltfyd6tjzw.public.blob.vercel-storage.com/og-images/homepage.png",
        width: 1200,
        height: 630,
        alt: "LionBot - Discord Productivity Bot",
        type: "image/png",
      },
    ],
    // --- END AI-MODIFIED ---
  },
  twitter: {
    cardType: "summary_large_image",
  },
  additionalMetaTags: [
    { name: "application-name", content: "LionBot" },
    { name: "theme-color", content: "#1B2137" },
  ],
  additionalLinkTags: [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    { rel: "icon", href: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { rel: "icon", href: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
  ],
};

export default defaultSEO;
export { SITE_URL };
