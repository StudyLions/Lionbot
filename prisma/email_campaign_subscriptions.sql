-- ============================================================
-- AI-GENERATED FILE
-- Created: 2026-09-10
-- Purpose: Explicit address-bound community/fundraising email consent.
--          No legacy preference values are backfilled as consent.
-- ============================================================
BEGIN;
CREATE TABLE IF NOT EXISTS email_campaign_subscriptions (
  email TEXT PRIMARY KEY CHECK (email = lower(btrim(email)) AND email <> ''),
  userid BIGINT NOT NULL REFERENCES user_config(userid) ON DELETE CASCADE,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS email_campaign_subscriptions_userid_idx
  ON email_campaign_subscriptions (userid);
COMMENT ON TABLE email_campaign_subscriptions IS
  'Explicit dashboard opt-in to community updates including fundraising; consent stays bound to this address and user.';
COMMIT;
