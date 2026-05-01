-- AI-GENERATED FILE
-- Created: 2026-04-29
-- Purpose: Marketplace 2.0 Phase 1 -- add per-user store front configuration table.
--          Holds the customizable fields for a seller's "personal shop" page:
--          display name, speech bubble shown next to their lion shopkeeper,
--          lion pose, theme, accent color, background animation.
--
--          Most premium fields are no-ops in Phase 1 (theme_id / accent_color /
--          background_animation all default to safe values) and become live in
--          Phase 2's theme/customization studio. The slug column is added in
--          Phase 3 for vanity store URLs.
--
--          Safe, additive migration -- uses IF NOT EXISTS so it can be
--          re-applied on both studylion_test (staging) and studylion
--          (production) without side effects. Existing sellers without a
--          row get default behavior (Discord username + default theme +
--          default speech bubble). NEVER touches lg_marketplace_listings.

CREATE TABLE IF NOT EXISTS lg_user_stores (
    userid               BIGINT       PRIMARY KEY,
    display_name         VARCHAR(40),
    speech_bubble        VARCHAR(500),
    lion_pose            VARCHAR(32)  NOT NULL DEFAULT 'idle',
    theme_id             VARCHAR(32)  NOT NULL DEFAULT 'default',
    accent_color         VARCHAR(9),
    background_animation VARCHAR(32)  NOT NULL DEFAULT 'none',
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    FOREIGN KEY (userid) REFERENCES user_config(userid) ON DELETE CASCADE
);
