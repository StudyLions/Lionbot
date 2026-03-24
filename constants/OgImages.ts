// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Route-to-OG-image mapping for all website pages.
//   Used by Layout.tsx to auto-inject the correct openGraph image
//   based on useRouter().pathname.
// ============================================================

const BLOB_BASE = "https://dj03j4ltfyd6tjzw.public.blob.vercel-storage.com/og-images";

const ROUTE_TO_SLUG: Record<string, string> = {
  "/": "homepage",
  "/features": "features",
  "/donate": "donate",
  "/study": "study",
  "/skins": "skins",
  "/stats": "stats",
  "/privacy-policy": "privacy-policy",
  "/terms-and-conditions": "terms",
  "/tutorials": "tutorials",
  "/tutorials/[slug]": "tutorials",
  "/coming-soon": "coming-soon",
  "/404": "404",

  "/dashboard": "dashboard-overview",
  "/dashboard/tasks": "dashboard-tasks",
  "/dashboard/reminders": "dashboard-reminders",
  "/dashboard/goals": "dashboard-goals",
  "/dashboard/leaderboard": "dashboard-leaderboard",
  "/dashboard/supporter": "dashboard-supporter",
  "/dashboard/session": "dashboard-session",
  "/dashboard/session/focus": "dashboard-focus",
  "/dashboard/history": "dashboard-history",
  "/dashboard/inventory": "dashboard-inventory",
  "/dashboard/profile": "dashboard-profile",
  "/dashboard/gems": "dashboard-gems",
  "/dashboard/servers": "dashboard-overview",
  "/dashboard/servers/[id]": "server-overview",
  "/dashboard/servers/[id]/setup": "server-setup",
  "/dashboard/servers/[id]/settings": "server-settings",
  "/dashboard/servers/[id]/members": "server-members",
  "/dashboard/servers/[id]/moderation": "server-moderation",
  "/dashboard/servers/[id]/economy": "server-economy",
  "/dashboard/servers/[id]/ranks": "server-ranks",
  "/dashboard/servers/[id]/shop": "server-shop",
  "/dashboard/servers/[id]/rolemenus": "server-rolemenus",
  "/dashboard/servers/[id]/branding": "server-branding",
  "/dashboard/servers/[id]/schedule": "server-schedule",
  "/dashboard/servers/[id]/pomodoro": "server-pomodoro",
  "/dashboard/servers/[id]/pomodoro-analytics": "server-pomodoro-analytics",
  "/dashboard/servers/[id]/videochannels": "server-videochannels",
  "/dashboard/servers/[id]/liongotchi": "server-liongotchi",
  "/dashboard/servers/[id]/leaderboard-autopost": "server-leaderboard-autopost",

  "/pet": "pet-overview",
  "/pet/inventory": "pet-inventory",
  "/pet/farm": "pet-farm",
  "/pet/room": "pet-room",
  "/pet/skins": "pet-skins",
  "/pet/crafting": "pet-crafting",
  "/pet/enhancement": "pet-enhancement",
  "/pet/wiki": "pet-wiki",
  "/pet/wiki/[itemId]": "pet-wiki",
  "/pet/marketplace": "pet-marketplace",
  "/pet/marketplace/sell": "pet-sell",
  "/pet/marketplace/my-listings": "pet-my-listings",
  "/pet/marketplace/[listingId]": "pet-marketplace",

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Add guides section OG image mapping
  "/guides": "guides",
  "/guides/[slug]": "guides",
  // --- END AI-MODIFIED ---
};

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Support dynamic guide slug OG images with fallback
export function getOgImageUrl(pathname: string): string {
  const slug = ROUTE_TO_SLUG[pathname];
  if (slug) return `${BLOB_BASE}/${slug}.png`;

  if (pathname.startsWith("/guides/")) {
    const guideSlug = pathname.replace("/guides/", "");
    return `${BLOB_BASE}/guide-${guideSlug}.png`;
  }

  return `${BLOB_BASE}/homepage.png`;
}
// --- END AI-MODIFIED ---

export function getOgImageMeta(pathname: string) {
  return [
    {
      url: getOgImageUrl(pathname),
      width: 1200,
      height: 630,
      alt: "LionBot",
      type: "image/png" as const,
    },
  ];
}
