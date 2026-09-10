// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Permanent, signed, opaque recipient tokens for campaign unsubscribe.
// ============================================================
import crypto from "crypto"

function secret(): string {
  const value = process.env.EMAIL_TOKEN_SECRET
  if (!value || value.length < 32) throw new Error("Email token secret is not configured.")
  return value
}

export function createCampaignUnsubscribeToken(recipientId: string): string {
  const body = Buffer.from(JSON.stringify({ v: 1, id: recipientId })).toString("base64url")
  const signature = crypto.createHmac("sha256", secret()).update(`campaign-unsubscribe:${body}`).digest("base64url")
  return `${body}.${signature}`
}

export function verifyCampaignUnsubscribeToken(token: unknown): string | null {
  if (typeof token !== "string" || token.length > 512) return null
  const parts = token.split(".")
  if (parts.length !== 2 || !/^[\w-]+$/.test(parts[0]) || !/^[\w-]+$/.test(parts[1])) return null
  try {
    const expected = crypto.createHmac("sha256", secret()).update(`campaign-unsubscribe:${parts[0]}`).digest("base64url")
    const signature = Buffer.from(parts[1])
    if (signature.length !== expected.length || !crypto.timingSafeEqual(signature, Buffer.from(expected))) return null
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"))
    if (payload.v !== 1 || typeof payload.id !== "string" || !/^[0-9a-f-]{36}$/i.test(payload.id)) return null
    return payload.id
  } catch {
    return null
  }
}
