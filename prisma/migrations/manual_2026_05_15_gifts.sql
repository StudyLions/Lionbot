-- AI-GENERATED FILE
-- Created: 2026-05-15
-- Purpose: Gift Premium Membership feature.
--
--          Two surface areas:
--            (1) Server Premium gifts -- a non-admin user pays a recurring
--                monthly Stripe subscription to grant Server Premium to a
--                guild they're a member of. Sender owns the Stripe sub
--                (so they manage / cancel via Stripe Portal). The recipient
--                guild is identified at checkout, premium is auto-activated
--                on payment, server admins are notified via DM + email +
--                dashboard banner.
--                Implementation: 3 columns added to server_premium_subscriptions
--                (gifted_by_userid, gift_message, gift_is_anonymous) so a
--                gift sub is the same row shape as a self-purchase, just
--                with gifted_by_userid set. recalculateGuildPremium() picks
--                it up automatically.
--            (2) LionHeart user gifts -- sender pays a recurring monthly
--                Stripe subscription, gets a one-time claim URL to share.
--                Recipient signs in with Discord at /gift/claim/{token},
--                claims, premium activates on their user_subscriptions row.
--                If unclaimed within 30 days, a cron auto-cancels the Stripe
--                sub and emails the sender.
--                Implementation: new lionheart_gifts table tracking the
--                claim lifecycle (PENDING_CLAIM -> ACTIVE | CANCELLED | EXPIRED).
--                On successful claim, a normal user_subscriptions row is
--                upserted for the recipient with the sender's stripe IDs.
--
--          Safe, additive migration -- IF NOT EXISTS / duplicate_column
--          guards on every statement so it can be re-applied on
--          studylion_test (staging) and studylion (production) without
--          side effects.

-- ============================================================
-- (1) Server Premium gift columns on server_premium_subscriptions
-- ============================================================

DO $$ BEGIN
    ALTER TABLE server_premium_subscriptions
        ADD COLUMN gifted_by_userid BIGINT NULL;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE server_premium_subscriptions
        ADD COLUMN gift_message TEXT NULL;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE server_premium_subscriptions
        ADD COLUMN gift_is_anonymous BOOLEAN NOT NULL DEFAULT false;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS server_premium_subs_gifter
    ON server_premium_subscriptions(gifted_by_userid)
    WHERE gifted_by_userid IS NOT NULL;

-- ============================================================
-- (2) lionheart_gifts table -- claim-link flow
-- ============================================================

CREATE TABLE IF NOT EXISTS lionheart_gifts (
    id                     SERIAL PRIMARY KEY,
    sender_userid          BIGINT NOT NULL,
    recipient_userid       BIGINT NULL,
    tier                   TEXT NOT NULL,
    stripe_subscription_id TEXT NOT NULL,
    stripe_customer_id     TEXT NOT NULL,
    claim_token            TEXT UNIQUE NOT NULL,
    claimed_at             TIMESTAMPTZ NULL,
    claim_expires_at       TIMESTAMPTZ NOT NULL,
    gift_message           TEXT NULL,
    gift_is_anonymous      BOOLEAN NOT NULL DEFAULT false,
    status                 TEXT NOT NULL DEFAULT 'PENDING_CLAIM',
    current_period_end     TIMESTAMPTZ NULL,
    created_at             TIMESTAMPTZ DEFAULT now(),
    updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lionheart_gifts_sender
    ON lionheart_gifts(sender_userid);

CREATE INDEX IF NOT EXISTS lionheart_gifts_recipient
    ON lionheart_gifts(recipient_userid)
    WHERE recipient_userid IS NOT NULL;

CREATE INDEX IF NOT EXISTS lionheart_gifts_token
    ON lionheart_gifts(claim_token);

CREATE INDEX IF NOT EXISTS lionheart_gifts_expiry_sweep
    ON lionheart_gifts(status, claim_expires_at)
    WHERE status = 'PENDING_CLAIM';
