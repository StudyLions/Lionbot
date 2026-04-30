-- ============================================================
-- Manual SQL migration for the editorial redesign of
-- "Feature Your Server".
--
-- Run order:
--   1. studylion_test  (Vercel staging deploy)
--   2. studylion       (production, after Ari approves)
--
-- This migration is IDEMPOTENT and runtime-tolerant: the renderer
-- (resolveTheme + normalizeSections) already handles unmigrated
-- rows, so we can ship the code first and run this on the database
-- whenever convenient.
--
-- What it does
--   1. Coalesces sections_enabled into the 5-key shape.
--      v1 keys verified_stats + live_sessions -> stats (OR).
--      v1 keys embed_widget, tags, country_language are dropped
--      (the embed snippet moved to the dashboard; tags + country/
--      language always show in the meta-line now).
--
--   2. Remaps the v1 palette themes onto v2 editorial themes:
--        midnight  -> wired
--        ocean     -> frieze
--        forest    -> kinfolk
--        sunset    -> vogue
--        rose      -> vogue
--        parchment -> atlantic
--      Anything else is left untouched (already an editorial id, or
--      a brand-new theme we add in the future).
--
--   3. Bumps updated_at so the staging Next.js page caches re-fetch.
-- ============================================================

BEGIN;

-- 1. Sections coalesce
UPDATE server_listings
SET sections_enabled = jsonb_strip_nulls(
  jsonb_build_object(
    'hero',          COALESCE((sections_enabled->>'hero')::boolean, true),
    'description',   COALESCE((sections_enabled->>'description')::boolean, true),
    'gallery',       COALESCE((sections_enabled->>'gallery')::boolean, false),
    'external_link', COALESCE((sections_enabled->>'external_link')::boolean, true),
    -- The new "stats" key inherits true if EITHER of the two v1 toggles
    -- was true, OR if the row was already migrated and carries `stats`
    -- explicitly. Defaults to false otherwise.
    'stats',
      COALESCE((sections_enabled->>'stats')::boolean, false)
      OR COALESCE((sections_enabled->>'verified_stats')::boolean, false)
      OR COALESCE((sections_enabled->>'live_sessions')::boolean, false)
  )
)
WHERE sections_enabled IS NULL
   OR sections_enabled ? 'verified_stats'
   OR sections_enabled ? 'live_sessions'
   OR sections_enabled ? 'embed_widget'
   OR sections_enabled ? 'tags'
   OR sections_enabled ? 'country_language'
   OR NOT (sections_enabled ? 'stats');

-- 2. Theme remap
UPDATE server_listings
SET theme_preset = CASE theme_preset
  WHEN 'midnight'   THEN 'wired'
  WHEN 'ocean'      THEN 'frieze'
  WHEN 'forest'     THEN 'kinfolk'
  WHEN 'sunset'     THEN 'vogue'
  WHEN 'rose'       THEN 'vogue'
  WHEN 'parchment'  THEN 'atlantic'
  ELSE theme_preset
END
WHERE theme_preset IN ('midnight','ocean','forest','sunset','rose','parchment');

-- 3. Touch updated_at so ISR + sitemap pick the change up
UPDATE server_listings
SET updated_at = NOW()
WHERE updated_at < NOW() - INTERVAL '1 second';

COMMIT;

-- ── Verification queries (run separately, do NOT include in COMMIT) ──
--
-- SELECT slug, theme_preset, sections_enabled
-- FROM server_listings
-- ORDER BY updated_at DESC
-- LIMIT 20;
--
-- SELECT theme_preset, COUNT(*) FROM server_listings GROUP BY 1 ORDER BY 2 DESC;
