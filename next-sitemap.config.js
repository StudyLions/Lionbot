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

    const priorities = {
      "/": 1.0,
      "/features": 0.9,
      "/guides": 0.95,
      "/donate": 0.9,
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
    if (!priority) priority = config.priority;

    const changefreq = urlPath.startsWith("/guides/") ? "monthly" : config.changefreq;

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

    return paths;
  },
};
// --- END AI-REPLACED ---
