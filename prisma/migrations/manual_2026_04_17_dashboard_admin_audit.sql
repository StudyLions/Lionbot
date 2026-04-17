-- AI-GENERATED FILE
-- Created: 2026-04-17
-- Purpose: Manual migration for the new dashboard_admin_audit table.
--          Runs as a safe, additive CREATE IF NOT EXISTS so it can be
--          re-applied on staging and production without side effects.

CREATE TABLE IF NOT EXISTS dashboard_admin_audit (
    auditid       BIGSERIAL PRIMARY KEY,
    performed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_userid  BIGINT NOT NULL,
    guildid       BIGINT NOT NULL,
    target_userid BIGINT NOT NULL,
    action_type   VARCHAR(64) NOT NULL,
    selections    JSONB NOT NULL,
    time_frame    JSONB,
    reason        TEXT NOT NULL,
    result        JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dashboard_admin_audit_guild_target
    ON dashboard_admin_audit (guildid, target_userid);

CREATE INDEX IF NOT EXISTS idx_dashboard_admin_audit_actor
    ON dashboard_admin_audit (actor_userid);

CREATE INDEX IF NOT EXISTS idx_dashboard_admin_audit_time
    ON dashboard_admin_audit (performed_at);
