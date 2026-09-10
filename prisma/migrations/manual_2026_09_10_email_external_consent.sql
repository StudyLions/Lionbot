-- ============================================================
-- AI-GENERATED FILE
-- Created: 2026-09-10
-- Purpose: Record external subscriber consent honestly without inventing a
--          historical signup timestamp or changing Discord verification.
--          This migration does not import or subscribe any address.
-- ============================================================
BEGIN;
ALTER TABLE email_campaign_subscriptions
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'dashboard',
  ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS evidence_note TEXT NULL;
ALTER TABLE email_campaign_subscriptions ALTER COLUMN consented_at DROP NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'email_campaign_subscriptions'::regclass
      AND conname = 'email_campaign_subscriptions_provenance_check'
  ) THEN
    ALTER TABLE email_campaign_subscriptions
      ADD CONSTRAINT email_campaign_subscriptions_provenance_check CHECK (
        (source = 'dashboard' AND consented_at IS NOT NULL AND imported_at IS NULL AND evidence_note IS NULL)
        OR
        (source = 'founder_attested_external' AND consented_at IS NULL
          AND imported_at IS NOT NULL AND evidence_note IS NOT NULL AND length(btrim(evidence_note)) > 0)
      );
  END IF;
END $$;

COMMENT ON COLUMN email_campaign_subscriptions.consented_at IS
  'Timestamp of an observed dashboard opt-in; NULL for externally attested signups with unknown historical signup dates.';
COMMENT ON COLUMN email_campaign_subscriptions.imported_at IS
  'Time the external consent evidence was recorded here, not the historical signup time.';
COMMENT ON COLUMN email_campaign_subscriptions.evidence_note IS
  'Source of the operator attestation authorizing this external list import; never inferred from legacy preference defaults.';
COMMIT;
