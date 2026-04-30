-- AI-GENERATED FILE
-- Created: 2026-04-30
-- Purpose: "Feature Your Server" -- premium-only public profile pages
--          at /servers/[slug]. Adds two tables and one enum:
--            (1) server_listings -- one row per opted-in guild, holds
--                all profile content, theme, invite, approval status,
--                and the sections_enabled JSON that controls per-panel
--                visibility on the public page.
--            (2) server_listing_analytics -- append-only event log
--                for view / invite_click / external_click events,
--                used to power the per-server admin analytics card.
--            (3) ListingStatus enum -- DRAFT / PENDING / APPROVED /
--                REJECTED / EXPIRED / ARCHIVED. EXPIRED is the 30-day
--                grace state after premium lapses; ARCHIVED frees the
--                slug for someone else.
--
--          Approval is SQL-direct (no admin dashboard). Discord
--          notifications include copy-paste UPDATE statements; this
--          migration intentionally does NOT seed any data.
--
--          Safe, additive migration -- IF NOT EXISTS guards every
--          DDL statement so it can be re-applied on both
--          studylion_test (staging) and studylion (production)
--          without side effects.

DO $$ BEGIN
    CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS server_listings (
    guildid              BIGINT          PRIMARY KEY,
    slug                 VARCHAR(40)     NOT NULL UNIQUE,
    status               "ListingStatus" NOT NULL DEFAULT 'DRAFT',

    display_name         VARCHAR(120)    NOT NULL,
    tagline              VARCHAR(160),
    description          TEXT            NOT NULL DEFAULT '',
    cover_image_url      TEXT,
    guild_icon_url       TEXT,
    gallery_images       JSONB,

    category             VARCHAR(60)     NOT NULL,
    secondary_tags       TEXT[]          NOT NULL DEFAULT ARRAY[]::TEXT[],
    is_study_server      BOOLEAN         NOT NULL DEFAULT FALSE,
    primary_country      VARCHAR(8),
    primary_language     VARCHAR(8),
    audience_age         VARCHAR(8),

    theme_preset         VARCHAR(40)     NOT NULL DEFAULT 'midnight',
    accent_color         VARCHAR(16),
    font_family          VARCHAR(60),
    cover_blend_mode     VARCHAR(20)     DEFAULT 'fade',

    invite_code          VARCHAR(40),
    invite_managed       BOOLEAN         NOT NULL DEFAULT TRUE,
    invite_last_rotated  TIMESTAMPTZ,

    external_link_url    TEXT,
    external_link_label  VARCHAR(80),

    sections_enabled     JSONB           NOT NULL DEFAULT '{}'::JSONB,
    nsfw_confirmed       BOOLEAN         NOT NULL DEFAULT FALSE,

    submitted_at         TIMESTAMPTZ,
    approved_at          TIMESTAMPTZ,
    approved_by          BIGINT,
    rejection_reason     TEXT,
    pending_changes      JSONB,
    notification_sent_at TIMESTAMPTZ,

    view_count           INTEGER         NOT NULL DEFAULT 0,
    invite_click_count   INTEGER         NOT NULL DEFAULT 0,
    promoted_until       TIMESTAMPTZ,

    created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_server_listings_status_approved
    ON server_listings (status, approved_at);

CREATE INDEX IF NOT EXISTS idx_server_listings_category
    ON server_listings (category);

CREATE INDEX IF NOT EXISTS idx_server_listings_promoted
    ON server_listings (promoted_until);

CREATE TABLE IF NOT EXISTS server_listing_analytics (
    id          BIGSERIAL    PRIMARY KEY,
    guildid     BIGINT       NOT NULL,
    event_type  VARCHAR(32)  NOT NULL,
    referrer    TEXT,
    country     VARCHAR(8),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_analytics_guild_time
    ON server_listing_analytics (guildid, created_at);

CREATE INDEX IF NOT EXISTS idx_listing_analytics_guild_event_time
    ON server_listing_analytics (guildid, event_type, created_at);
