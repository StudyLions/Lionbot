-- AI-GENERATED FILE
-- Created: 2026-06-11
-- Purpose: Global hourly ceiling on outbound Anki auth emails
--          (verification + password-reset codes).
--
--          The existing limits stop per-VICTIM and per-IP abuse:
--            - per (email, purpose): 60s cooldown + 5/hour (DB-keyed)
--            - per IP: register 10/10min, forgot 5/10min, login 20/min
--              (in-memory, best-effort, per serverless instance)
--          What they do NOT bound is a DISTRIBUTED flood — many IPs ×
--          many distinct fresh emails — which can't harm any single
--          inbox but could run up the Resend bill. This table is the
--          system-wide backstop: one atomic counter per clock-hour, so
--          total auth-email sends/hour are hard-capped no matter how the
--          load is spread.
--
--          One row per hour bucket (floor(unix_ms / 3_600_000)); the
--          daily anki-cleanup cron prunes buckets older than a day.
--          Safe, additive migration — IF NOT EXISTS throughout.

BEGIN;

CREATE TABLE IF NOT EXISTS anki_email_budget (
    bucket  BIGINT PRIMARY KEY,   -- floor(epoch_ms / 3600000): hours since epoch
    count   INTEGER NOT NULL DEFAULT 0
);

COMMIT;
