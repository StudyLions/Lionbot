-- ============================================================
-- AI-GENERATED FILE
-- Created: 2026-04-25
-- Purpose: Email system migration for studylion / studylion_test.
--          Adds email preference columns to user_config and
--          creates the email_log table for delivery tracking.
--          Idempotent - safe to run multiple times.
-- ============================================================

ALTER TABLE user_config
  ADD COLUMN IF NOT EXISTS email_welcomed_at        TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS email_pref_welcome       BOOLEAN     NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_pref_weekly_digest BOOLEAN     NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_pref_lifecycle     BOOLEAN     NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_pref_announcements BOOLEAN     NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_pref_premium       BOOLEAN     NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_unsubscribed_all   BOOLEAN     NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS email_log (
  id          BIGSERIAL    PRIMARY KEY,
  userid      BIGINT       NOT NULL REFERENCES user_config(userid) ON DELETE CASCADE,
  email       TEXT         NOT NULL,
  template    TEXT         NOT NULL,
  subject     TEXT         NOT NULL,
  status      TEXT         NOT NULL,
  resend_id   TEXT         NULL,
  error       TEXT         NULL,
  sent_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_log_userid_sent_at_idx   ON email_log (userid, sent_at);
CREATE INDEX IF NOT EXISTS email_log_template_sent_at_idx ON email_log (template, sent_at);
