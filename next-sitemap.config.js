// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Dynamic sitemap generation configuration
// ============================================================
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://lionbot.org",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/dashboard/"] },
    ],
  },
  exclude: ["/api/*", "/dashboard/*", "/dashboard/**", "/coming-soon"],
  changefreq: "weekly",
  priority: 0.7,
  transform: async (config, path) => {
    const priorities = {
      "/": 1.0,
      "/donate": 0.9,
      "/skins": 0.8,
      "/privacy-policy": 0.3,
      "/terms-and-conditions": 0.3,
    };
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priorities[path] || config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
