-- ============================================================
-- AI-GENERATED FILE
-- Created: 2026-03-23
-- Purpose: Enhancement log + achievements tables for the
--          enhancement ceremony system.
-- Run against: studylion_test (and later studylion)
-- ============================================================

CREATE TABLE IF NOT EXISTS lg_enhancement_log (
    logid        SERIAL PRIMARY KEY,
    userid       BIGINT NOT NULL REFERENCES user_config(userid) ON DELETE NO ACTION ON UPDATE NO ACTION,
    inventoryid  INTEGER NOT NULL,
    item_name    TEXT NOT NULL,
    scroll_name  TEXT NOT NULL,
    outcome      VARCHAR(16) NOT NULL,
    from_level   INTEGER NOT NULL,
    to_level     INTEGER,
    created_at   TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enhancement_log_user ON lg_enhancement_log(userid);
CREATE INDEX IF NOT EXISTS idx_enhancement_log_user_time ON lg_enhancement_log(userid, created_at);

CREATE TABLE IF NOT EXISTS lg_enhancement_achievements (
    achievementid   SERIAL PRIMARY KEY,
    userid          BIGINT NOT NULL REFERENCES user_config(userid) ON DELETE NO ACTION ON UPDATE NO ACTION,
    achievement_key VARCHAR(64) NOT NULL,
    unlocked_at     TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    UNIQUE (userid, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_enhancement_achievements_user ON lg_enhancement_achievements(userid);
