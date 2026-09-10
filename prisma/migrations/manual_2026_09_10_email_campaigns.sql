-- AI-GENERATED FILE
-- Created: 2026-09-10
-- Purpose: Durable announcement campaigns, recipient deduplication, suppression,
--          delivery receipts and a shared worker lease. Additive and rerunnable.
BEGIN;

CREATE TABLE IF NOT EXISTS email_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','queued','sending','paused','completed','cancelled')),
  mode TEXT NOT NULL DEFAULT 'campaign' CHECK (mode IN ('campaign','test')),
  content JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  queued_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES email_campaigns(id),
  email TEXT NOT NULL CHECK (email = lower(btrim(email))),
  userid BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed','skipped','unknown')),
  attempts INTEGER NOT NULL DEFAULT 0,
  payload JSONB,
  idempotency_key TEXT NOT NULL UNIQUE,
  first_attempt_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  provider_id TEXT UNIQUE,
  error TEXT,
  delivery_status TEXT,
  delivery_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email)
);
CREATE INDEX IF NOT EXISTS email_campaign_recipients_pending_idx
  ON email_campaign_recipients(campaign_id, next_attempt_at) WHERE status IN ('pending','sending');

CREATE TABLE IF NOT EXISTS email_campaign_suppressions (
  email TEXT PRIMARY KEY CHECK (email = lower(btrim(email))),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS email_campaign_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS email_campaign_worker_lock (
  name TEXT PRIMARY KEY,
  owner TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO email_campaign_worker_lock (name) VALUES ('global') ON CONFLICT DO NOTHING;
COMMIT;
