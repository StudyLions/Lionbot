-- AI-GENERATED FILE
-- Created: 2026-04-23
-- Purpose: Add an `is_locked` flag to lg_user_inventory so users can mark
--          items as "favorites" / "locked" and protect them from being sold,
--          gifted, enhanced, or otherwise destroyed via the website.
--
--          Safe, additive migration — uses IF NOT EXISTS so it can be
--          re-applied on both studylion_test (staging) and studylion
--          (production) without side effects. The DEFAULT FALSE means
--          existing rows are non-locked, matching prior behavior.

ALTER TABLE lg_user_inventory
    ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;

-- Composite index for the optional /pet/inventory "Favorites" filter tab,
-- which scans by (userid, is_locked = TRUE). Existing inventoryid lookups
-- continue to use the primary key.
CREATE INDEX IF NOT EXISTS idx_lg_user_inventory_user_locked
    ON lg_user_inventory (userid, is_locked);
