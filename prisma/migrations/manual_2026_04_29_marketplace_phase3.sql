-- AI-GENERATED FILE
-- Created: 2026-04-29
-- Purpose: Marketplace 2.0 Phase 3 -- two additive schema changes:
--          (1) is_featured / featured_at on lg_marketplace_listings,
--              for premium-gated featured listings (sorted to the
--              top of every browse page and rendered with a glowing
--              animated border).
--          (2) slug on lg_user_stores, for vanity store URLs
--              like /pet/marketplace/store/cool-shop.
--
--          Safe, additive migration -- IF NOT EXISTS guards every
--          DDL statement so it can be re-applied on both
--          studylion_test (staging) and studylion (production)
--          without side effects. Existing listings default to
--          is_featured=false, featured_at=NULL; existing stores
--          default to slug=NULL, so nothing changes for any user
--          until they opt in.

ALTER TABLE lg_marketplace_listings
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS featured_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_mp_listings_featured
    ON lg_marketplace_listings (is_featured, featured_at);

ALTER TABLE lg_user_stores
    ADD COLUMN IF NOT EXISTS slug VARCHAR(30);

-- Unique INDEX (rather than constraint) so we can drop and re-create
-- it without touching any other index. NULL slugs are permitted and
-- treated as "not unique" by Postgres, which is exactly what we want.
CREATE UNIQUE INDEX IF NOT EXISTS lg_user_stores_slug_key
    ON lg_user_stores (slug);
