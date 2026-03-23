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
