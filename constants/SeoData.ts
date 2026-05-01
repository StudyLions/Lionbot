// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Updated SEO data with proper titles, descriptions, and Open Graph properties
import { SITE_URL } from "next-seo.config";

export const Page404SEO = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
  canonical: `${SITE_URL}/404`,
};

export const ComingSoonSEO = {
  title: "Coming Soon",
  description: "This feature is coming soon. Stay tuned for updates!",
};

export const DonationSEO = {
  title: "Support LionBot",
  description:
    "Support the team and keep the project alive by getting LionGems! Purchase colored skins, gift LionGems to your loved ones, and unlock special perks for your server.",
  canonical: `${SITE_URL}/donate`,
  openGraph: {
    title: "Support LionBot - Get LionGems",
    description: "Purchase LionGems to unlock colored skins, cosmetics, and more.",
    url: `${SITE_URL}/donate`,
  },
};

export const HomepageSEO = {
  title: "LionBot - The Best Discord Productivity Bot",
  description:
    "Leo is the best, open-source, all-in-one solution that every Discord community needs. Activity tracking, economy, leaderboards, productivity tools and so much more.",
  canonical: SITE_URL,
  openGraph: {
    title: "LionBot - The Best Discord Productivity Bot",
    description: "Activity tracking, economy, leaderboards, and productivity tools for Discord.",
    url: SITE_URL,
  },
};

export const StudySEO = {
  title: "Study Timer",
  description:
    "Use LionBot's study timer to track your focus sessions and boost your productivity.",
  canonical: `${SITE_URL}/study`,
};

export const PrivacyPolicySEO = {
  title: "Privacy Policy",
  description:
    "Learn about how LionBot handles your personal information and protects your privacy.",
  canonical: `${SITE_URL}/privacy-policy`,
};

export const TermsAndConditionsSEO = {
  title: "Terms and Conditions",
  description:
    "Read the terms and conditions that govern your use of LionBot's website, products, and services.",
  canonical: `${SITE_URL}/terms-and-conditions`,
};

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: SEO data for the guides hub page
export const GuidesSEO = {
  title: "Guides - LionBot",
  description:
    "Step-by-step guides for setting up and using LionBot on Discord. Learn about pomodoro timers, study tracking, economy systems, leaderboards, and more.",
  canonical: `${SITE_URL}/guides`,
  openGraph: {
    title: "LionBot Guides - Discord Bot Tutorials & How-To Articles",
    description:
      "Learn how to use every LionBot feature with detailed guides.",
    url: `${SITE_URL}/guides`,
  },
};
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-05) ---
// Purpose: SEO data for the public timeline/changelog page
export const TimelineSEO = {
  title: "What's New — LionBot Updates",
  description:
    "See everything we've been working on: new features, improvements, bug fixes, and more. We're always building and improving LionBot for you.",
  canonical: `${SITE_URL}/timeline`,
  openGraph: {
    title: "What's New in LionBot — Updates & Changelog",
    description:
      "New features, improvements, and bug fixes. See what's changed in LionBot.",
    url: `${SITE_URL}/timeline`,
  },
};
// --- END AI-MODIFIED ---

export const SkinsSEO = {
  title: "Skin Collection",
  description:
    "Browse all the colored skins available for your LionBot profile. Customize your look with unique designs.",
  canonical: `${SITE_URL}/skins`,
  openGraph: {
    title: "LionBot Skin Collection",
    description: "Browse and preview all available profile skins.",
    url: `${SITE_URL}/skins`,
  },
};
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: SEO data for the new "Feature Your Server" public directory
// at /servers and the per-server profile pages at /servers/[slug].
// The directory is the single biggest SEO surface this product has --
// every approved server page contributes a unique, content-rich URL
// to our sitemap, so the description copy here is intentionally
// keyword-dense for "Discord study server", "study community", etc.
export const ServersDirectorySEO = {
  title: "Discord Study Servers — Find Your Community",
  description:
    "Discover the best Discord study servers, focus communities, and language exchanges. Browse premium-verified servers powered by LionBot, filter by topic, and join with one click.",
  canonical: `${SITE_URL}/servers`,
  openGraph: {
    title: "Find a Discord Study Server You'll Love — LionBot",
    description:
      "Browse hundreds of verified Discord study servers. Filter by category, language, and country.",
    url: `${SITE_URL}/servers`,
  },
};

export interface ServerProfileSEOInput {
  slug: string
  displayName: string
  tagline?: string | null
  description?: string | null
  category?: string | null
  country?: string | null
  language?: string | null
  coverImageUrl?: string | null
}

export function buildServerProfileSEO(input: ServerProfileSEOInput) {
  const url = `${SITE_URL}/servers/${input.slug}`
  // Compose a concise meta description that always fits in <160 chars.
  // We prefer the tagline -> first line of description -> generic fallback.
  const rawDescription =
    input.tagline ||
    (input.description ? input.description.split(/\n/).find((l) => l.trim().length > 0) : null) ||
    `Join ${input.displayName}, a Discord community on LionBot.`
  const description = rawDescription.length > 155
    ? rawDescription.slice(0, 152).trimEnd() + "..."
    : rawDescription

  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Always point social previews at our dynamic OG image route
  //   (`/api/og/server/[slug]`). It guarantees a 1200x630 PNG sized for
  //   Twitter/Facebook cards even if the admin uploaded a non-standard
  //   cover, and it bakes the server name + theme into the preview.
  //   The cover image itself is included as a secondary OG image so
  //   platforms that prefer the raw upload still get it.
  const ogUrl = `${SITE_URL}/api/og/server/${encodeURIComponent(input.slug)}`
  const images: { url: string; alt: string; width?: number; height?: number; type?: string }[] = [
    {
      url: ogUrl,
      alt: `${input.displayName} on LionBot`,
      width: 1200,
      height: 630,
      type: "image/png",
    },
  ]
  if (input.coverImageUrl) {
    images.push({ url: input.coverImageUrl, alt: input.displayName })
  }

  return {
    title: `${input.displayName} — Discord Server on LionBot`,
    description,
    canonical: url,
    openGraph: {
      title: `${input.displayName} — Join the Discord`,
      description,
      url,
      images,
    },
    twitter: {
      cardType: "summary_large_image",
    },
  }
  // --- END AI-MODIFIED ---
}
// --- END AI-MODIFIED ---
