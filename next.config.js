// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Added i18n configuration for multi-language support
const { i18n } = require("./next-i18next.config");

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Add security headers to protect against clickjacking, XSS, MIME sniffing,
//          referrer leaks, and enforce HTTPS.
//          /embed/* paths exempt from X-Frame-Options so they can be iframed on top.gg.
const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

module.exports = {
  reactStrictMode: true,
  i18n,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: baseSecurityHeaders,
      },
      {
        source: "/:path((?!embed|api/topgg).*)",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
    ];
  },
};
// --- END AI-MODIFIED ---
