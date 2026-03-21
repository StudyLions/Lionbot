-- ============================================================
-- AI-GENERATED FILE
-- Created: 2026-03-21
-- Purpose: Leaderboard auto-post module tables
-- ============================================================

-- Main config table: one row per auto-post schedule
CREATE TABLE leaderboard_autopost_config (
    configid        SERIAL PRIMARY KEY,
    guildid         BIGINT NOT NULL REFERENCES guild_config(guildid) ON DELETE CASCADE,
    config_name     VARCHAR(64) NOT NULL DEFAULT 'Leaderboard',
    enabled         BOOLEAN NOT NULL DEFAULT true,

    -- What to post
    lb_type         TEXT NOT NULL DEFAULT 'study',
    messages_metric TEXT NOT NULL DEFAULT 'count',
    frequency       TEXT NOT NULL DEFAULT 'weekly',
    seasonal_mode   TEXT,
    week_starts_on  TEXT NOT NULL DEFAULT 'monday',
    top_count       INT NOT NULL DEFAULT 10,

    -- When to post (guild timezone from guild_config.timezone)
    post_channel    BIGINT NOT NULL,
    post_day        INT DEFAULT 0,
    post_hour       INT NOT NULL DEFAULT 20,
    post_minute     INT NOT NULL DEFAULT 0,

    -- Roles
    top1_role       BIGINT,
    topn_role       BIGINT,
    top1_also_gets_topn_role BOOLEAN NOT NULL DEFAULT true,
    auto_remove_roles BOOLEAN NOT NULL DEFAULT true,

    -- LionCoin rewards
    reward_tiers    JSONB DEFAULT '[]',

    -- Public message template
    announce_content    TEXT,
    embed_title         TEXT,
    embed_description   TEXT,
    embed_footer        TEXT,
    embed_color         INT DEFAULT 16766720,
    embed_url           TEXT,
    embed_author_name   TEXT,
    embed_author_url    TEXT,
    embed_fields        JSONB DEFAULT '[]',
    include_image       BOOLEAN NOT NULL DEFAULT true,
    mention_winners     BOOLEAN NOT NULL DEFAULT false,
    pin_post            BOOLEAN NOT NULL DEFAULT false,
    delete_previous     BOOLEAN NOT NULL DEFAULT false,
    min_threshold       INT DEFAULT 0,

    -- Notifications
    notify_public_post    BOOLEAN NOT NULL DEFAULT true,
    notify_dm_winners     BOOLEAN NOT NULL DEFAULT false,
    dm_scope              TEXT NOT NULL DEFAULT 'top_n',
    dm_template_title     TEXT,
    dm_template_body      TEXT,
    dm_stagger_seconds    INT NOT NULL DEFAULT 2,
    notify_mod_log        BOOLEAN NOT NULL DEFAULT false,
    mod_log_channel       BIGINT,

    -- Safety
    skip_if_empty         BOOLEAN NOT NULL DEFAULT true,
    skip_if_same_as_last  BOOLEAN NOT NULL DEFAULT false,
    continue_on_partial   BOOLEAN NOT NULL DEFAULT true,
    max_coins_per_user    INT,

    -- Tracking
    last_posted_at      TIMESTAMPTZ,
    last_message_id     BIGINT,
    last_winner_ids     JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(guildid, config_name)
);

CREATE INDEX idx_lb_autopost_config_guild ON leaderboard_autopost_config (guildid);
CREATE INDEX idx_lb_autopost_config_enabled ON leaderboard_autopost_config (enabled) WHERE enabled = true;

-- Audit log (kept forever)
CREATE TABLE leaderboard_autopost_history (
    historyid       SERIAL PRIMARY KEY,
    configid        INT NOT NULL REFERENCES leaderboard_autopost_config(configid) ON DELETE CASCADE,
    guildid         BIGINT NOT NULL,
    posted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    top_users       JSONB,
    roles_added     INT DEFAULT 0,
    roles_removed   INT DEFAULT 0,
    coins_awarded   INT DEFAULT 0,
    dms_sent        INT DEFAULT 0,
    dms_failed      INT DEFAULT 0,
    status          TEXT DEFAULT 'success',
    error_message   TEXT
);

CREATE INDEX idx_lb_autopost_history_config ON leaderboard_autopost_history (configid, posted_at DESC);

-- Rate-limit log for test/run-now actions
CREATE TABLE leaderboard_autopost_test_log (
    id          SERIAL PRIMARY KEY,
    guildid     BIGINT NOT NULL,
    action_type TEXT NOT NULL DEFAULT 'test',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lb_autopost_test_guild_time ON leaderboard_autopost_test_log (guildid, created_at DESC);

-- Action queue for dashboard-triggered bot actions
CREATE TABLE leaderboard_autopost_action_queue (
    queueid      SERIAL PRIMARY KEY,
    guildid      BIGINT NOT NULL,
    configid     INT REFERENCES leaderboard_autopost_config(configid) ON DELETE SET NULL,
    requested_by BIGINT NOT NULL,
    action_type  TEXT NOT NULL,
    payload      JSONB,
    status       TEXT NOT NULL DEFAULT 'pending',
    result       JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_lb_autopost_action_pending ON leaderboard_autopost_action_queue (status, created_at);
