// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-01
// Purpose: Centralised feature flags. Flip a single boolean here
//          to hide / re-enable a not-yet-launched feature across
//          the whole site without removing its code.
//
//          Flags are plain TypeScript constants so:
//          - The bundler tree-shakes dead branches (a `false`
//            check at the top of getStaticProps/getServerSideProps
//            collapses to a `notFound: true` return; the rest of
//            the page still type-checks and stays in source).
//          - Re-enabling a feature is one line + one `git push`.
//          - No env-var gymnastics (we'd need different values per
//            preview vs prod, which we can already do via branches).
// ============================================================

/**
 * Master switch for the "Feature Your Server" public profile feature.
 *
 * When `false` (current default):
 *   - The `/servers` directory and `/servers/[slug]` profile pages
 *     return 404.
 *   - The `/embed/server/[slug]` widget and the `/api/og/server/[slug]`
 *     social card endpoints return 404.
 *   - The public `/api/servers/*` endpoints return 404.
 *   - The dashboard editor at `/dashboard/servers/[id]/listing`
 *     returns 404 so admins can't edit a feature that isn't shipped.
 *   - Navigation links (main header "Servers" tab, dashboard sidebar
 *     "Feature Your Server" link, donate-page "Feature Your Server"
 *     premium tab, setup checklist task) are all hidden.
 *   - Sitemap entries for /servers and /servers/[slug] are skipped.
 *
 * When `true`:
 *   - Everything is wired up and ready to ship — nothing else needs
 *     to change. The dark-themes work, copy rewrite, and preview-mode
 *     props on PullQuoteStats / Colophon all stay in place.
 *
 * See `docs/SERVERS_FEATURE_HANDOFF.md` for the full status and the
 * remaining editor-studio work that is paused behind this flag.
 */
export const SERVERS_DIRECTORY_ENABLED = false
