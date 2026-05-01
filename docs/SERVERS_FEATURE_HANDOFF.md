# "Feature Your Server" — Handoff & Resumption Guide

**Status:** Paused. Hidden behind a feature flag. Code shipped to `staging` only — `main` (lionbot.org) was never touched.
**Last updated:** 2026-05-01
**Owner when resumed:** Whoever is implementing the editor studio next (see "Resuming the Editor Studio" below).

---

## 1. TL;DR

We built the public-facing half of "Feature Your Server" (premium server profile pages at `/servers/[slug]`, the `/servers` directory, the embed widget, OG images, and a working dashboard editor). It's all on the `staging` branch.

We then redesigned the whole feature into an **editorial / magazine** visual language with five themes (Atlantic / Wired / Kinfolk / Vogue / Frieze), and re-themed everything to a **dark-only palette** so it fits the rest of the site.

The dashboard editor still works but its UX is rough — non-live preview, cluttered controls, doesn't feel premium. The plan to fix that is a **studio-style editor with inline live preview** (architectural choices already locked in — see §6). That work is **paused** before any of those new components were built.

To keep half-built code out of users' way while we step back, the entire feature is now hidden behind a single boolean: `SERVERS_DIRECTORY_ENABLED` in [`constants/FeatureFlags.ts`](../constants/FeatureFlags.ts). Flip it to `true` to re-enable everything in one go (plus mirror the value in `next-sitemap.config.js` — see §4).

**Production impact:** Zero. The feature was never merged into `main`. lionbot.org users have never seen any of this.

---

## 2. What's Already Shipped to `staging`

### Public surfaces (all editorial / dark-themed)

- `/servers` — directory page (Atlantic-dark masthead, hairline-rule TOC, chip-tab filters, single "Featured this week" cover story).
- `/servers/[slug]` — public profile page. Composes:
  - `EditorialThemeProvider` (loads Google fonts, exposes CSS custom props per theme).
  - `EditorialHero` (full-bleed cover, kicker, headline, deck, CTA).
  - `EditorialArticle` (markdown-rendered description with drop caps where the theme calls for them).
  - `PullQuoteStats` (live "Verified by Leo" numbers — members, study minutes, in-voice now).
  - `PhotoEssay` (gallery as a full-width photo essay).
  - `Colophon` (masthead-style footer).
- `/embed/server/[slug]` — embeddable widget that mirrors the editorial language.
- `/api/og/server/[slug]` — dynamic OG card per theme. Five different SVG layouts (Atlantic, Wired, Kinfolk, Vogue, Frieze), generated with `sharp`.
- `/api/servers` and `/api/servers/[slug]/{join,stats}` — public JSON / redirect / live-stats endpoints.

### Dashboard surfaces

- `/dashboard/servers/[id]/listing` — the editor (still works, but UX needs the studio rebuild — see §5).
- `/api/dashboard/servers/[id]/listing[/{promote,analytics,regenerate-invite,upload-token}]` — fully wired CRUD + admin operations.
- Setup checklist task `listing` (drawer with onboarding copy, status pill).
- `Feature Your Server` link in `ServerNav` sidebar.

### Bot side

- `StudyLion/src/modules/serverlisting/cog.py` — HTTP listener on shard 0 with two routes:
  - `POST /listing/invite/create` — picks a channel, calls Discord's `create_invite`, persists in `server_listings.invite_code`.
  - `POST /listing/notify` — posts a rich embed with copy-paste SQL approve/reject snippets to Ari's review channel (`1499358894466662410`).
- Both gated by a shared secret in `[SERVERLISTING] auth` and a `[SERVERLISTING] enabled` boolean. **Not currently enabled in live config — leave it that way until we ship.**

### Database

- Migration: [`prisma/migrations/manual_2026_04_30_serverlistings_editorial.sql`](../prisma/migrations/manual_2026_04_30_serverlistings_editorial.sql) — coalesces `sections_enabled` to the new five-key shape and remaps legacy theme IDs (`paper`, `wired`, etc.) to the editorial IDs (`atlantic`, `wired`, `kinfolk`, `vogue`, `frieze`).
- Prisma models: `server_listings`, `server_listing_analytics`. Both already in `prisma/schema.prisma`.
- Demo data on `studylion_test`: a couple of sample listings exist for QA. They survive the hide because the public route is what's gated, not the data.

### Recent fixes that are part of this work

- React hydration mismatches (#418, #423, #425) caused by `toLocaleDateString(undefined, ...)` and `toLocaleString()` — fixed by explicitly passing `"en-US"` everywhere (`Colophon.tsx`, `EditorialHero.tsx`, `PullQuoteStats.tsx`).
- Gallery images data-format mismatch — components expect `{ url, caption? }[]`, not bare URL strings. Demo SQL was updated.
- Donate-page "Feature Your Server" tab copy — rewrote in plain declarative style to match sibling premium tabs (no more Spectral serif headings, amber em-dash bullets, or "AI marketing fluff").

---

## 3. Why We Paused

The editor (`pages/dashboard/servers/[id]/listing.tsx`) doesn't feel premium yet:

- The "preview" pane shows a snapshot, not a live render — admins type in the Description box and have to save before they see what it looks like.
- Form controls are a long single-column scroll with no visual hierarchy.
- Section toggles are checkbox lists; theme picker is a row of swatches; image uploads are file pickers — all utilitarian, none of it "wow this is mine to design."
- For a feature meant to be the headline server-premium perk, the editing experience undersells it.

We agreed on a rebuild **before** shipping (it's a one-shot first impression for paying customers). See §5 for the rebuild plan.

---

## 4. What's Hidden (and How to Re-Enable)

### The flag

[`constants/FeatureFlags.ts`](../constants/FeatureFlags.ts) — single export:

```ts
export const SERVERS_DIRECTORY_ENABLED = false
```

### Surfaces gated by the flag

| Surface | File | Behaviour when `false` |
| --- | --- | --- |
| Public directory page | `pages/servers/index.tsx` | `getStaticProps` returns `notFound: true` |
| Public profile page | `pages/servers/[slug].tsx` | `getServerSideProps` returns `notFound: true` (also blocks `?preview=TOKEN`) |
| Embed widget | `pages/embed/server/[slug].tsx` | `getStaticProps` returns `notFound: true` |
| OG image API | `pages/api/og/server/[slug].ts` | 404 |
| Public listings API | `pages/api/servers/index.ts` | 404 |
| Public join redirect | `pages/api/servers/[slug]/join.ts` | 404 |
| Public stats API | `pages/api/servers/[slug]/stats.ts` | 404 |
| Dashboard editor page | `pages/dashboard/servers/[id]/listing.tsx` | `getServerSideProps` returns `notFound: true` |
| Dashboard listing CRUD API | `pages/api/dashboard/servers/[id]/listing.ts` (GET + PUT) | 404 |
| Dashboard listing sub-APIs | `…/listing/{promote,analytics,regenerate-invite,upload-token}.ts` | 404 |
| Main header "Servers" nav link | `components/Layout/Header/Header.tsx` | Filtered out of `NAV_LINKS` |
| Dashboard sidebar "Feature Your Server" link | `components/dashboard/ServerNav.tsx` | Filtered out of section links |
| Donate page "Feature Your Server" tab | `pages/donate.tsx` | Filtered out of `VISIBLE_PREMIUM_TABS` (and the auto-rotator) |
| Setup checklist `listing` task | `components/dashboard/setupChecklist/SetupChecklist.tsx` | Filtered out of `PREMIUM_TASKS`; `<ListingTask />` drawer also gated to defend against stale `openTask` state |
| Sitemap `/servers` + `/servers/*` entries | `next-sitemap.config.js` | Skipped via `SITEMAP_INCLUDES_SERVERS = false` (mirrored constant — see below) |

### To re-enable

1. Flip `SERVERS_DIRECTORY_ENABLED = true` in `constants/FeatureFlags.ts`.
2. Flip `SITEMAP_INCLUDES_SERVERS = true` in `next-sitemap.config.js` (CommonJS file, can't import from TS — must be mirrored manually).
3. Push to `staging` to verify the Vercel preview boots cleanly.
4. (Bot side) Add `[SERVERLISTING]` config section to `secrets.conf` on the live server with `enabled = true`, a real `auth` secret, and a free `port` (default 7001). Restart `leo-32-00` so the listener binds. Add a matching `BOT_HTTP_SHARED_SECRET` env var to the Vercel project so `/api/dashboard/servers/[id]/listing/regenerate-invite.ts` can authenticate.
5. Merge `staging` → `main` to ship to lionbot.org.

### What stays in source no matter what

- All editorial components (`components/listing/*`).
- All public/dashboard/api routes (just gated, not deleted).
- The dark-only theme tokens in `constants/ServerListingData.ts`.
- The migration SQL.
- Demo listings on `studylion_test`.

---

## 5. Resuming the Editor Studio

This is where we stopped. The plan is locked in; nothing has been built yet beyond preview-mode props on `PullQuoteStats` (new `previewStats` prop) and `Colophon` (new `isPreview` prop).

### 5.1 Architecture (locked)

| Decision | Choice | Why |
| --- | --- | --- |
| Live preview | **Render components directly** in the page (no iframe). Wrap in a `transform: scale()` container at fixed inner widths (Desktop 1280, Tablet 768, Mobile 390). | Iframes choke on font/CSS-variable propagation and cause flicker on every keystroke. Same React tree = instant updates with zero re-mount cost. |
| Editor structure | **Studio with tabs** — Design / Settings / Embed / Performance / Boost. | Lets us separate the high-frequency "what does it look like" loop (Design) from low-frequency admin tasks (Embed snippet, Analytics, Promotion). Matches the mental model of design tools admins already use (Webflow, Framer, Figma). |
| Themes | **Dark-only**, five editorial presets (Atlantic, Wired, Kinfolk, Vogue, Frieze). No light themes — they don't fit the site palette. | Already implemented and shipped to staging. |
| Dashboard accent | Six suggested accent colours per theme + free hex picker. | Removes the "what colour goes with this theme?" decision while still allowing custom brands. |

### 5.2 What needs to be built

All of the below were in-progress tasks that were cancelled when we paused. Resume in this order:

| # | Component | Path | Notes |
| --- | --- | --- | --- |
| 1 | `LivePreview` | `components/listing/LivePreview.tsx` | Wraps the same `EditorialThemeProvider` tree the public page uses. Takes form state as props, renders at fixed inner widths inside a `transform: scale(N)` shell. Picker buttons: 1280 / 768 / 390. |
| 2 | `StudioTopBar` | `components/listing/editor/StudioTopBar.tsx` | Status badge (Draft / Pending / Live), real-time completion meter ("3 / 4 required fields"), "View public link" button (disabled when not approved), "Save draft" + "Submit for review" buttons. |
| 3 | Studio shell | `pages/dashboard/servers/[id]/listing.tsx` (refactor, don't replace) | Tab nav: Design / Settings / Embed / Performance / Boost. Active tab via URL query (`?tab=design`) so admins can deep-link. |
| 4 | `DesignTab` | `components/listing/editor/DesignTab.tsx` | Two-column: left rail of six accordions (Hero / Article / Stats / Photos / Theme / Sections), right column = `LivePreview` + device-width picker. |
| 5 | `SettingsTab` | `components/listing/editor/SettingsTab.tsx` | Slug, display name, category, secondary tags, country, language, age band, study toggle, invite, external link (DoFollow), NSFW confirmation modal. |
| 6 | `OperationsTabs` | `components/listing/editor/OperationsTabs.tsx` | Move existing `EmbedSnippetCard`, `ListingAnalyticsCard`, `PromotionCard` into three sibling tab panels. |
| 7 | Inline article preview | inside `DesignTab` | Article control gets Write / Preview tabs; Preview renders `EditorialArticle` against the current description in real time. The renderer (`utils/listingMarkdown.ts`) is already pure JS and safe to call client-side. |
| 8 | Accent presets | inside `DesignTab` Theme control | Row of six suggested accents per chosen theme alongside the hex picker. Suggestions can come from a small lookup table in `constants/ServerListingData.ts`. |
| 9 | Cover dropzone | replaces existing `CoverUploadField` | Drag-and-drop with a 4:1 ratio guide in the empty state. |
| 10 | Gallery reorder + captions | replaces existing `GalleryUploadField` | Drag-to-reorder thumbnail grid with a caption input under each image. Already storing the right shape (`{ url, caption? }[]`). |
| 11 | Section preview cards | replaces section toggle checkboxes | Five segmented preview cards with tiny visual thumbnails of each section (Hero, Article, Stats, Photos, Colophon). |
| 12 | Donate-page demo | `pages/donate.tsx` `feature_server` tab | Replace the rotated ivory-paper SVG mock with a real `LivePreview` cycling through all five dark themes every 4 s, wrapped in a minimal browser-chrome frame. Mirrors the branding tab's auto-cycle pattern. |
| 13 | Visual QA + promote | — | Walk every demo listing on `studylion_test`, confirm the canvas updates instantly on every keystroke, all five themes look right. On approval, merge `staging` → `main`. |

### 5.3 Already done in service of this plan

- `PullQuoteStats` accepts `previewStats?: StatsResponse | null`. When provided, it skips the `/api/servers/[slug]/stats` call so the editor canvas doesn't 404 against an unpublished slug.
- `Colophon` accepts `isPreview?: boolean`. When true and `approvedAt` is null, it renders "today (preview)" instead of crashing.

Both changes are committed and live on `staging`.

### 5.4 Files / utilities you'll lean on

- [`constants/ServerListingData.ts`](../constants/ServerListingData.ts) — theme presets (`LISTING_THEMES`), legacy theme map, `resolveTheme()`, sections, helpers.
- [`components/listing/EditorialThemeProvider.tsx`](../components/listing/EditorialThemeProvider.tsx) — the wrapper that `LivePreview` should use.
- [`utils/listingMarkdown.ts`](../utils/listingMarkdown.ts) — pure-JS markdown renderer; safe to call client-side from the inline article preview.
- [`utils/listingHelpers.ts`](../utils/listingHelpers.ts) — premium gating, preview token signing.

---

## 6. File Map (Cheat Sheet)

```
constants/
  FeatureFlags.ts                ← THE flag
  ServerListingData.ts           ← themes, categories, sections, helpers
components/
  listing/
    EditorialThemeProvider.tsx   ← font + CSS-var loader
    EditorialHero.tsx            ← full-bleed hero
    EditorialArticle.tsx         ← markdown body
    PullQuoteStats.tsx           ← live numbers (NEW: previewStats prop)
    PhotoEssay.tsx               ← gallery
    Colophon.tsx                 ← masthead footer (NEW: isPreview prop)
    editor/                      ← TO-BUILD: studio shell + tabs
      StudioTopBar.tsx           (#2)
      DesignTab.tsx              (#4)
      SettingsTab.tsx            (#5)
      OperationsTabs.tsx         (#6)
    LivePreview.tsx              ← TO-BUILD (#1)
  Layout/Header/Header.tsx       ← gated nav link
  dashboard/
    ServerNav.tsx                ← gated sidebar link
    setupChecklist/
      SetupChecklist.tsx         ← gated task + drawer
      tasks/premium/ListingTask.tsx
pages/
  servers/
    index.tsx                    ← gated directory
    [slug].tsx                   ← gated public profile
  embed/server/[slug].tsx        ← gated embed widget
  donate.tsx                     ← gated premium tab
  dashboard/servers/[id]/listing.tsx  ← gated editor (refactor target)
  api/
    servers/{index,[slug]/join,[slug]/stats}.ts  ← gated public APIs
    og/server/[slug].ts          ← gated OG card generator
    dashboard/servers/[id]/listing.ts            ← gated CRUD
    dashboard/servers/[id]/listing/*             ← gated sub-APIs
prisma/
  schema.prisma                  ← server_listings + server_listing_analytics models
  migrations/manual_2026_04_30_serverlistings_editorial.sql
next-sitemap.config.js           ← mirrored SITEMAP_INCLUDES_SERVERS = false
docs/
  SERVERS_FEATURE_HANDOFF.md     ← this file
```

Bot side:

```
StudyLion/src/modules/serverlisting/
  cog.py                         ← HTTP listener (shard 0, gated by [SERVERLISTING] enabled)
  data.py                        ← DB helpers
```

---

## 7. Database / Demo Data

- Tables: `server_listings`, `server_listing_analytics`. Schema lives in `prisma/schema.prisma`.
- Migration `manual_2026_04_30_serverlistings_editorial.sql` was applied to `studylion_test`. Re-run it on `studylion` (live) before flipping the flag in production.
- Demo listings exist on `studylion_test` for QA. They use Discord-snowflake-format guild IDs (`bigint`-safe) and gallery images in the correct `{ url, caption? }[]` shape.
- Vercel Blob is wired (the `@vercel/blob` package is installed and `pages/api/dashboard/servers/[id]/listing/upload-token.ts` mints scoped client tokens). The blob store should already exist on the Vercel project — verify with `vercel blob list` if anything looks off when re-enabling.

---

## 8. Open Questions / Things to Re-Decide When We Resume

- **Auto-cycle interval on the donate-page demo.** Plan says 4 s per theme; might feel rushed for a more deliberate "look at the typography" pace. A/B in your head once it's built.
- **Where the studio's tabs live in the URL.** `?tab=design` is simplest. Consider deep-link friendliness vs. browser back-button noise (each tab change stacks a history entry).
- **Bot HTTP secret rotation.** When we re-enable, generate a fresh `BOT_HTTP_SHARED_SECRET` and store it in both Vercel env vars and the bot's `secrets.conf`. The placeholder value used during initial development should not be reused.
- **NSFW confirmation copy.** Currently a generic "Yes I confirm this server is 18+" modal. Re-read it before going live; adjust to whatever Discord ToS phrasing makes us most defensible.

---

## 9. Last Words

If you're picking this up cold:

1. Read this file top to bottom (you just did).
2. `git checkout staging`, then flip `SERVERS_DIRECTORY_ENABLED = true` locally, run `npm run dev`, hit `http://localhost:3000/servers/study-haven` (or whatever demo slug exists in `studylion_test`). You should see a working dark editorial profile.
3. Hit `http://localhost:3000/dashboard/servers/{guildId}/listing` (with admin perms on a premium server) to see the rough editor as it stands today.
4. Start with `LivePreview` (§5.2 #1). Once that exists, the studio shell (#3) plus `DesignTab` (#4) is mostly arranging existing pieces around it.
5. Don't flip the flag back to `true` on `staging` until at least the Design + Settings tabs work end-to-end.
6. Ari needs to manually approve any merge `staging` → `main`. Do not push to `main` without explicit greenlight.

Good luck.
