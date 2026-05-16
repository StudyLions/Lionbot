// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Added i18n configuration for multi-language support
const { i18n } = require("./next-i18next.config");
// --- AI-MODIFIED (2026-05-16) ---
// Purpose: Resolve @reduxjs/toolkit to its CJS entry in the SSR bundle so
// Next.js 12.1's outputFileTracing doesn't drop the ESM .mjs file. recharts
// v3 pulls @reduxjs/toolkit as a transitive ESM dep with conditional
// `exports` the Next 12 tracer follows for resolution but doesn't COPY into
// the serverless function bundle, producing
//   Cannot find module '/var/task/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs'
// at runtime on every /dashboard page. Aliasing to dist/cjs/index.js makes
// the tracer follow a .js path it handles correctly. Client bundle is
// untouched.
const path = require("path");
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Add security headers to protect against clickjacking, XSS, MIME sniffing,
//          referrer leaks, and enforce HTTPS.
//          /embed/* paths exempt from X-Frame-Options so they can be iframed on top.gg.
// --- AI-MODIFIED (2026-04-30) ---
// Purpose: /servers/* uses SAMEORIGIN instead of DENY so the dashboard editor's
//          live-preview iframe can render the public profile during editing.
//          External sites still can't embed it.
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
  // --- AI-MODIFIED (2026-05-16) ---
  // Purpose: See top-of-file note. Alias @reduxjs/toolkit to its CJS entry
  // for the server bundle only so the file tracer follows a .js path it
  // ships correctly. Client bundle stays on the ESM build.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias["@reduxjs/toolkit"] = path.resolve(
        __dirname,
        "node_modules/@reduxjs/toolkit/dist/cjs/index.js"
      );
    }
    return config;
  },
  // --- END AI-MODIFIED ---
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: baseSecurityHeaders,
      },
      {
        source: "/servers/:path*",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
      {
        source: "/:path((?!embed|api/topgg|servers).*)",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
    ];
  },
};
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---
