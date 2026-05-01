// --- AI-REPLACED (2026-03-23) ---
// Reason: Original config leaked dashboard/pet pages into sitemap, missed tutorial
//         and guide URLs, and included useless locale-prefixed 404/coming-soon pages.
// What the new code does better: Properly excludes auth-gated pages, adds guides
//         and tutorials with high priority, filters out locale noise, and adds
//         /pet/ to robots.txt disallow.
// --- Original code (commented out for rollback) ---
// /** @type {import('next-sitemap').IConfig} */
// module.exports = {
//   siteUrl: "https://lionbot.org",
//   generateRobotsTxt: true,
//   robotsTxtOptions: {
//     additionalSitemaps: [],
//     policies: [
//       { userAgent: "*", allow: "/" },
//       { userAgent: "*", disallow: ["/api/", "/dashboard/"] },
//     ],
//   },
//   exclude: ["/api/*", "/dashboard/*", "/dashboard/**", "/coming-soon"],
//   changefreq: "weekly",
//   priority: 0.7,
//   transform: async (config, path) => {
//     const priorities = {
//       "/": 1.0,
//       "/donate": 0.9,
//       "/skins": 0.8,
//       "/privacy-policy": 0.3,
//       "/terms-and-conditions": 0.3,
//     };
//     return {
//       loc: path,
//       changefreq: config.changefreq,
//       priority: priorities[path] || config.priority,
//       lastmod: new Date().toISOString(),
//     };
//   },
// };
// --- End original code ---

const fs = require("fs");
const path = require("path");

// --- AI-MODIFIED (2026-05-01) ---
// Purpose: Mirror of constants/FeatureFlags.ts -> SERVERS_DIRECTORY_ENABLED.
// next-sitemap is plain CommonJS, so we duplicate the boolean here. Keep
// these two in sync when re-enabling the public servers directory.
const SITEMAP_INCLUDES_SERVERS = false;
// --- END AI-MODIFIED ---

function getGuideSlugs() {
  const dir = path.join(process.cwd(), "content", "guides");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://lionbot.org",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/dashboard/", "/pet/"] },
    ],
  },
  exclude: [
    "/api/*",
    "/dashboard/*",
    "/dashboard/**",
    "/pet/*",
    "/pet/**",
    "/coming-soon",
    "/404",
    "/embed/*",
    "/embed/**",
  ],
  changefreq: "weekly",
  priority: 0.7,
  transform: async (config, urlPath) => {
    if (urlPath.match(/^\/(pt-BR|he|tr|es|fr)\/(404|coming-soon|embed)/)) return null;

    if (
      urlPath.startsWith("/dashboard") ||
      urlPath.startsWith("/pet") ||
      urlPath.startsWith("/embed") ||
      urlPath === "/404" ||
      urlPath === "/coming-soon"
    ) {
      return null;
    }

    // --- AI-MODIFIED (2026-05-01) ---
    // Purpose: Hide /servers and /servers/* from the sitemap while the
    // public directory is feature-flagged off. We can't import a TS
    // constant from this CommonJS config cleanly, so we mirror the flag
    // value here. When you flip SERVERS_DIRECTORY_ENABLED in
    // constants/FeatureFlags.ts, also flip SITEMAP_INCLUDES_SERVERS below.
    if (!SITEMAP_INCLUDES_SERVERS && urlPath.startsWith("/servers")) {
      return null;
    }
    // --- END AI-MODIFIED ---

    const priorities = {
      "/": 1.0,
      "/features": 0.9,
      "/guides": 0.95,
      "/donate": 0.9,
      // --- AI-MODIFIED (2026-04-30) ---
      // Purpose: Surface the new /servers directory in the sitemap.
      "/servers": 0.95,
      // --- END AI-MODIFIED ---
      "/skins": 0.8,
      "/tutorials": 0.8,
      "/study": 0.8,
      "/stats": 0.6,
      "/privacy-policy": 0.3,
      "/terms-and-conditions": 0.3,
    };

    let priority = priorities[urlPath];
    if (!priority && urlPath.startsWith("/guides/")) priority = 0.9;
    if (!priority && urlPath.startsWith("/tutorials/")) priority = 0.8;
    // --- AI-MODIFIED (2026-04-30) ---
    // Purpose: Per-server profile pages get strong priority so search
    // engines crawl them quickly when a new listing is approved.
    if (!priority && urlPath.startsWith("/servers/")) priority = 0.85;
    // --- END AI-MODIFIED ---
    if (!priority) priority = config.priority;

    const changefreq = urlPath.startsWith("/guides/")
      ? "monthly"
      // --- AI-MODIFIED (2026-04-30) ---
      // Purpose: server profile pages may change theme/cover often;
      // recheck weekly in line with config default.
      : urlPath.startsWith("/servers/")
        ? "weekly"
      // --- END AI-MODIFIED ---
        : config.changefreq;

    return {
      loc: urlPath,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    const paths = [];

    const guideSlugs = getGuideSlugs();
    for (const slug of guideSlugs) {
      paths.push({
        loc: `/guides/${slug}`,
        changefreq: "monthly",
        priority: 0.9,
        lastmod: new Date().toISOString(),
      });
    }

    const tutorialSlugs = [
      "getting-started", "tasks", "reminders", "profile-and-stats",
      "study-and-pomodoro", "economy", "ranks-and-achievements",
      "skins-and-shop", "dashboard-tour", "goals", "voting-and-support",
      "private-rooms", "liongotchi-basics", "liongotchi-farm-equipment",
      "liongotchi-marketplace",
      "server-setup", "configuring-ranks", "setting-up-shop", "role-menus",
      "server-settings", "pomodoro-and-schedule", "economy-and-moderation",
      "video-and-branding", "liongotchi-admin",
    ];
    for (const slug of tutorialSlugs) {
      paths.push({
        loc: `/tutorials/${slug}`,
        changefreq: "monthly",
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
    }

    // --- AI-MODIFIED (2026-04-30) ---
    // Purpose: Pull approved server-listing slugs from the database so
    //   each premium server profile gets indexed individually. We do this
    //   inside a try/catch and fall back to skipping silently when the
    //   database isn't reachable (e.g. dev machines without DATABASE_URL),
    //   so the sitemap build never blocks a deploy.
    // --- AI-MODIFIED (2026-05-01) ---
    // Purpose: Skip the slug query entirely while the directory is hidden
    // -- saves a DB round-trip on every sitemap build.
    if (SITEMAP_INCLUDES_SERVERS) {
      try {
        const serverSlugs = await getApprovedServerSlugs();
        for (const slug of serverSlugs) {
          paths.push({
            loc: `/servers/${slug.slug}`,
            changefreq: "weekly",
            priority: 0.85,
            lastmod: slug.updated_at
              ? new Date(slug.updated_at).toISOString()
              : new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("[sitemap] Skipping server-listing slugs:", err && err.message);
      }
    }
    // --- END AI-MODIFIED ---
    // --- END AI-MODIFIED ---

    return paths;
  },
};

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Lazy-load Prisma client only when DATABASE_URL is set so this
//   config keeps working in environments where the DB isn't accessible.
async function getApprovedServerSlugs() {
  if (!process.env.DATABASE_URL) return [];
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.server_listings.findMany({
      where: {
        status: "APPROVED",
        approved_at: { not: null },
      },
      select: { slug: true, updated_at: true },
      orderBy: { approved_at: "desc" },
    });
    return rows;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
// --- END AI-MODIFIED ---
// --- END AI-REPLACED ---
