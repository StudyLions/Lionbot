// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Pure, address-bound campaign audience eligibility rules.
// ============================================================

export interface CampaignAudienceRow {
  email: string
  userid: string
  verified: boolean | null
  unsubscribed: boolean
  announcements: boolean
  consented: boolean
  suppressed: boolean
}

export interface CampaignAudience {
  // Exclusion checks overlap; these are not additive segments.
  counts: {
    total: number
    eligible: number
    unverified: number
    unconsented: number
    unsubscribed: number
    invalid: number
    suppressed: number
  }
  recipients: { email: string; userid: string }[]
}

export function normalizeCampaignEmail(value: string): string {
  return value.trim().toLowerCase()
}

// Deliberately accepts a conservative, deliverable subset. No display names,
// quoted local parts, control characters, multiple addresses, or domain literals.
export function isValidCampaignEmail(value: string): boolean {
  if (value.length > 254 || /[\s\x00-\x1f\x7f]/.test(value)) return false
  const parts = value.split("@")
  if (parts.length !== 2) return false
  const [local, domain] = parts
  if (!local || local.length > 64 || !/^[a-z0-9!#$%&'*+\-/=?^_`{|}~.]+$/i.test(local)) return false
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false
  const labels = domain.split(".")
  return labels.length >= 2 && labels.every((label) =>
    label.length > 0 && label.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
  ) && /^[a-z]{2,63}$/i.test(labels[labels.length - 1])
}

export function buildCampaignAudience(rows: CampaignAudienceRow[]): CampaignAudience {
  const byEmail: Record<string, CampaignAudienceRow[]> = Object.create(null)
  for (const row of rows) {
    const email = normalizeCampaignEmail(row.email)
    if (email) (byEmail[email] ||= []).push(row)
  }
  const result: CampaignAudience = {
    counts: { total: 0, eligible: 0, unverified: 0, unconsented: 0, unsubscribed: 0, invalid: 0, suppressed: 0 },
    recipients: [],
  }
  for (const email of Object.keys(byEmail).sort()) {
    const linked = byEmail[email]
    const invalid = !isValidCampaignEmail(email)
    const suppressed = linked.some((row) => row.suppressed)
    const unsubscribed = linked.some((row) => row.unsubscribed || !row.announcements)
    const consented = linked.filter((row) => row.consented)
    const verified = linked.some((row) => row.verified === true)
    // Verification from another account must never authorize this consent owner.
    const recipient = consented.find((row) => row.verified === true)
    result.counts.total++
    if (invalid) result.counts.invalid++
    if (suppressed) result.counts.suppressed++
    if (unsubscribed) result.counts.unsubscribed++
    if (!consented.length) result.counts.unconsented++
    if (!verified || (consented.length > 0 && !recipient)) result.counts.unverified++
    if (!invalid && !suppressed && !unsubscribed && recipient) {
      result.recipients.push({ email, userid: recipient.userid })
      result.counts.eligible++
    }
  }
  return result
}
