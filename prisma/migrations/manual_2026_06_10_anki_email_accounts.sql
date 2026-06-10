-- AI-GENERATED FILE
-- Created: 2026-06-10
-- Purpose: Standalone email/password accounts for the Anki addon.
--
--          Lets people use LionGotchi for Anki WITHOUT a Discord
--          account: they register with email + password entirely
--          inside the addon (verification code sent by email, typed
--          back in-app — the browser is never needed). Later they can
--          optionally link a Discord account (linked_discord_id is
--          reserved for that follow-up).
--
--          Identity model:
--            - Email users get a SYNTHETIC userid in the band
--              [9000000000000000000, 9200000000000000000). Discord
--              snowflakes are timestamp-based and won't reach 9.0e18
--              until ~2083, so the band can never collide with a real
--              Discord id, while remaining a valid BIGINT key for all
--              existing tables (user_config, lg_pets, anki_devices...).
--            - anki_email_accounts.userid has NO FK to user_config on
--              purpose: the account row is created at REGISTER time
--              (unverified), while user_config/lg_pets are only
--              bootstrapped at VERIFY time — keeping junk/abandoned
--              registrations out of the main tables.
--
--          Security model:
--            - password_hash: scrypt (node:crypto), format
--              "scrypt$N$r$p$salt_b64$hash_b64".
--            - anki_email_codes stores only sha256(code) of the 6-digit
--              verification/reset codes; 15-min expiry; per-code attempt
--              counter (max 5); single-use via consumed_at.
--            - Account lockout: failed_login_count / locked_until.
--
--          Safe, additive migration — IF NOT EXISTS guards throughout.

BEGIN;

CREATE TABLE IF NOT EXISTS anki_email_accounts (
    userid              BIGINT PRIMARY KEY,
    email               TEXT NOT NULL,
    password_hash       TEXT NOT NULL,
    display_name        TEXT NOT NULL,
    email_verified_at   TIMESTAMPTZ,
    linked_discord_id   BIGINT,
    failed_login_count  INTEGER NOT NULL DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emails are stored lowercased; unique regardless of verification
-- state (an unverified row can be overwritten by re-register, but
-- never duplicated).
CREATE UNIQUE INDEX IF NOT EXISTS anki_email_accounts_email_key
    ON anki_email_accounts (email);

CREATE INDEX IF NOT EXISTS anki_email_accounts_linked_discord
    ON anki_email_accounts (linked_discord_id)
    WHERE linked_discord_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS anki_email_codes (
    id           BIGSERIAL PRIMARY KEY,
    email        TEXT NOT NULL,
    purpose      TEXT NOT NULL,            -- 'verify' | 'reset'
    code_hash    BYTEA NOT NULL,           -- sha256(6-digit code)
    userid       BIGINT,                   -- the account the code acts on
    attempts     INTEGER NOT NULL DEFAULT 0,
    expires_at   TIMESTAMPTZ NOT NULL,
    consumed_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lookup pattern: newest unconsumed code for (email, purpose).
CREATE INDEX IF NOT EXISTS anki_email_codes_lookup
    ON anki_email_codes (email, purpose, created_at DESC);

-- Cron cleanup pattern: delete expired rows.
CREATE INDEX IF NOT EXISTS anki_email_codes_expiry
    ON anki_email_codes (expires_at);

COMMIT;
