-- AI-GENERATED FILE
-- Created: 2026-09-10
-- Purpose: Keep audience and send-time opt-out lookups off the multi-million-row
--          user table. CONCURRENTLY avoids blocking normal user writes.
-- Run separately with psql, outside a transaction. If an interrupted concurrent
-- build leaves an invalid index, review/drop that named index and rerun.
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_config_campaign_email_idx
  ON user_config (lower(btrim(email))) WHERE email IS NOT NULL;
