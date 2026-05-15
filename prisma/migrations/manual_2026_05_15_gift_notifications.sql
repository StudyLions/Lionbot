-- AI-GENERATED FILE
-- Created: 2026-05-15
-- Purpose: Queue table for cross-system notifications. The website
--          inserts rows (e.g. when a gift activates, is claimed, or
--          is cancelled); a Python bot module polls every few seconds
--          and sends Discord DMs. This keeps the bot token out of the
--          website Vercel env and gives the bot a single place to do
--          retries / rate-limit handling.
--
--          Two notification "kinds" for the initial gift feature:
--            - user_dm        -- direct DM to one Discord user
--            - guild_admin_dm -- DM to every administrator of a guild
--                                (bot side decides who counts as admin
--                                from its live permission cache)
--
--          dedup_key carries an event-unique string (e.g.
--          "server_gift_activated:<guildid>:<senderid>") so duplicate
--          webhook deliveries don't queue duplicate DMs. INSERT uses
--          ON CONFLICT DO NOTHING.
--
--          payload is a JSONB blob the bot formats into an embed.
--          Keeping the shape flexible lets us add gift-claim, gift-
--          cancelled, gift-expired etc. without schema churn.
--
--          Safe, additive migration -- IF NOT EXISTS on every DDL so
--          this can be applied to studylion_test (staging) and later
--          studylion (production, by Ari) without side effects.

CREATE TABLE IF NOT EXISTS pending_notifications (
    id                 SERIAL PRIMARY KEY,
    kind               TEXT NOT NULL,
    target_userid      BIGINT NULL,
    target_guildid     BIGINT NULL,
    dedup_key          TEXT UNIQUE NULL,
    payload            JSONB NOT NULL,
    status             TEXT NOT NULL DEFAULT 'PENDING',
    attempts           INT NOT NULL DEFAULT 0,
    last_attempted_at  TIMESTAMPTZ NULL,
    last_error         TEXT NULL,
    sent_at            TIMESTAMPTZ NULL,
    created_at         TIMESTAMPTZ DEFAULT now()
);

-- Bot's polling query: WHERE status='PENDING' AND attempts < N ORDER BY created_at
CREATE INDEX IF NOT EXISTS pending_notifications_status_attempts
    ON pending_notifications(status, attempts, created_at)
    WHERE status = 'PENDING';
