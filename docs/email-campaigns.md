# Community email campaigns

AI-GENERATED FILE · 2026-09-10. Operating notes for LionBot's owner-only campaign desk.

## What Ari uses

Open `/dashboard/email-campaigns` while signed in with the founder's Discord account. The Community letters link appears in that account's dashboard navigation.

1. Edit the supplied fundraiser letter or create another campaign. Save the draft.
2. Review the desktop, mobile and plain-text previews. Refresh the preview after editing.
3. Check the audience and sending setup. Request a test email to your own verified, signed-in account.
4. Select **Review launch**, check the subject and audience count, then type the exact saved subject to launch.
5. Watch progress, pause/resume, or cancel remaining emails. An email already submitted to the provider may still finish.

The audience consists of unique addresses with explicit community/fundraising consent. Dashboard opt-ins require the current consent owner's verified address. A separately reviewed import can record the founder's attestation that an external list explicitly subscribed; that documented source supports historically unknown Discord verification, but never an explicitly false verification flag. Existing default-on announcement preferences are not backfilled as opt-in. Fresh Discord sign-ins now preserve Discord's verification flag; old unknown values remain unknown. Any linked account's opt-out or address suppression excludes the address. Exclusion counts can overlap.

### Previously collected external signups

On September 10, 2026, Ari Horesh confirmed that the intended recipients had explicitly subscribed through a mailing list or signup form outside the website. Record that as an operator attestation, not as an observed dashboard signup. External rows use `source = 'founder_attested_external'`, an `imported_at` timestamp showing when the evidence was recorded, a nonempty `evidence_note` describing the confirmation, and `consented_at = NULL` because the historical signup dates are unknown. The migration imports nobody and does not change `user_config.email_verified`.

Review a dry-run import first. Match normalized addresses to one specific current account, deduplicate addresses, and preserve all existing consent records (especially revoked rows), global/category opt-outs, and provider suppressions. Never infer external consent from the legacy preference defaults. Unknown verification is accepted only for the same account/address that owns active, documented external consent; normal dashboard consent still requires verification. Changes of address, revocation, and account deletion invalidate the corresponding eligibility. A fresh dashboard opt-in records a new dashboard consent timestamp and follows dashboard verification rules.

## Deployment prerequisites

Apply these additive migrations **to the intended database**, in order, before deploying the feature:

- `prisma/migrations/manual_2026_09_10_email_campaigns.sql`
- `prisma/email_campaign_subscriptions.sql`
- `prisma/migrations/manual_2026_09_10_email_external_consent.sql`
- `prisma/migrations/manual_2026_09_10_email_campaign_index.sql`

The index migration uses `CREATE INDEX CONCURRENTLY` and must run separately, outside a transaction, as the `user_config` table owner or a database administrator. It indexes only rows with an email. Readiness requires this index to be valid so each send does not scan millions of user records. If a concurrent index build is interrupted, inspect and repair the named invalid index before retrying; `IF NOT EXISTS` alone does not repair an invalid index.

The migrations have no automatic consent backfill and are rerunnable. A live database migration and production deployment require the founder's approval under the project rules. They are separate from approval to launch a particular email campaign.

Production configuration:

| Setting | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Existing Resend sending key. Confirm sending-domain verification and account allowance before launch. |
| `EMAIL_TOKEN_SECRET` | Existing secret of at least 32 characters, used to sign unsubscribe links. Keep stable so older links work. |
| `RESEND_WEBHOOK_SECRET` | Signing secret for the Resend webhook below. |
| `CRON_SECRET` | Existing secret used by the scheduled worker. |
| `EMAIL_CAMPAIGN_SEND_ENABLED=true` | Explicit campaign switch. Leave absent or false until ready to send. |
| `EMAIL_CAMPAIGN_ALLOWLIST` | Optional comma-separated owner Discord IDs; defaults to Ari's ID. |
| `EMAIL_FROM_MARKETING`, `EMAIL_REPLY_TO` | Optional sender overrides; defaults are `LionBot <hello@lionbot.org>` and `support@lionbot.org`. |
| `EMAIL_SENDER_NAME`, `EMAIL_POSTAL_ADDRESS`, `EMAIL_VAT_NUMBER` | Defaults: Ari Horesh; Via Francesco Orsi 27, Pavia, Italy; IT02865360180. |

The existing `EMAIL_SEND_ENABLED` switch for automated emails remains independent. Do not enable it to enable campaigns. Campaign provider calls are additionally restricted to `VERCEL_ENV=production`; previews cannot send emails.

Register `https://www.lionbot.org/api/email/webhook` in Resend for `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.failed`, and `email.suppressed`. Save the returned signing secret in `RESEND_WEBHOOK_SECRET`. Webhook signatures are verified over the raw request body; duplicate events are ignored. Hard bounces, complaints and provider suppressions block future campaigns to that address. Events from other LionBot emails also contribute address-level suppression. Signed events from other projects on the shared Resend team are acknowledged without storing their event or recipient data.

Vercel calls `/api/email/cron/campaigns` every minute with the cron secret. Confirm the project's plan supports that schedule. Each pass processes at most 20 recipients at approximately one per second under a shared database lease. Provider rate limits defer work; quota and sending configuration errors pause the affected campaign. Inspect Resend's actual account limits before launching a large audience; this tool does not upgrade plans or buy credits.

## Delivery, retries and privacy

The recipient list and content are frozen at launch. Eligibility is checked again before each send. HTML, text, headers, sender and a stable idempotency key are persisted before contacting Resend. A lost response can therefore be retried with the same request. Retries stop before Resend's 24-hour idempotency retention expires; uncertain deliveries then require manual review, never an automatic resend. Signed webhook events can reconcile a delivery after an interrupted response.

“Sent” means Resend accepted the email, not that a person received or read it. The delivery-details table shows up to 100 records with issues first. For uncertain deliveries, inspect Resend using the provider ID or campaign/recipient tags. Do not create another campaign simply to retry an uncertain delivery. There is no tracking pixel or click tracking added by this implementation; provider account settings are managed separately.

Email clients can issue an authenticated one-click unsubscribe POST without sign-in. The visible link opens a confirmation page; visiting a GET link does not unsubscribe anyone, protecting against mail scanners. Unsubscribe suppresses the normalized address, revokes campaign consent, disables announcement preferences on linked rows, and skips queued recipients. A later explicit opt-in may reverse an unsubscribe suppression, but cannot remove bounce or complaint suppression.

Privacy exports include the user's campaign consent and delivery metadata. Account deletion removes recipient addresses, rendered payloads and subscriptions, and anonymizes campaign creator IDs. Minimal address-level suppression remains to prevent future unwanted email and is described in the privacy policy.

## Validation

Run `node --test scripts/test-email-campaigns.cjs tests/*.test.cjs`, the campaign integration scripts under `tests/`, then `npm run build`. Integration tests must explicitly target `studylion_test`; they use temporary synthetic records and roll them back. No validation step sends real mail.

Saved-draft revisions and recipient counts are checked again at launch. A change from another browser tab requires reloading and reviewing the saved draft. Signed unsubscribe pages and the owner's campaign desk do not load Google Analytics; entering them also disables an already-loaded tracker for the rest of that browser navigation session.

For a visual review on a Vercel preview deployment, open `/preview/fundraiser-email`. The route is unavailable in production and cannot send email. Check the real email in a test inbox before a campaign launch; browser previews cannot reproduce every email client's rendering.

Provider references: [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [rate limits](https://resend.com/docs/api-reference/rate-limit), [webhooks](https://resend.com/docs/webhooks/introduction).
