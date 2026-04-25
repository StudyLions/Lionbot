// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: HMAC-signed unsubscribe tokens. The token encodes
//          {userid, scope, expiresAt} and a SHA-256 signature so
//          we can validate one-click unsubscribe links without a
//          database lookup. Scope is either an EmailPrefKey or
//          the literal "all".
// ============================================================
import crypto from "crypto"
import type { EmailPrefKey } from "./brand"

export type UnsubscribeScope = EmailPrefKey | "all"

interface UnsubscribePayload {
  userid: string
  scope: UnsubscribeScope
  expiresAt: number
}

const DEFAULT_TTL_DAYS = 60

function getSecret(): string {
  const secret = process.env.EMAIL_TOKEN_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      "[email] EMAIL_TOKEN_SECRET must be set to a 32+ character random string."
    )
  }
  return secret
}

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function base64UrlDecode(str: string): Buffer {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4))
  const normalized = str.replace(/-/g, "+").replace(/_/g, "/") + pad
  return Buffer.from(normalized, "base64")
}

function sign(payload: string): string {
  return base64UrlEncode(
    crypto.createHmac("sha256", getSecret()).update(payload).digest()
  )
}

export function createUnsubscribeToken(
  userid: bigint | string,
  scope: UnsubscribeScope,
  ttlDays = DEFAULT_TTL_DAYS
): string {
  const payload: UnsubscribePayload = {
    userid: userid.toString(),
    scope,
    expiresAt: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  }
  const body = base64UrlEncode(Buffer.from(JSON.stringify(payload), "utf8"))
  const signature = sign(body)
  return `${body}.${signature}`
}

export function verifyUnsubscribeToken(
  token: string
): { userid: bigint; scope: UnsubscribeScope } | null {
  if (!token || typeof token !== "string" || !token.includes(".")) return null
  const [body, signature] = token.split(".")
  if (!body || !signature) return null

  let expected: string
  try {
    expected = sign(body)
  } catch {
    return null
  }
  // Constant-time compare avoids timing oracles on the signature.
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

  let payload: UnsubscribePayload
  try {
    payload = JSON.parse(base64UrlDecode(body).toString("utf8"))
  } catch {
    return null
  }

  if (typeof payload.expiresAt !== "number" || Date.now() > payload.expiresAt) {
    return null
  }
  if (!payload.userid || !payload.scope) return null

  try {
    return { userid: BigInt(payload.userid), scope: payload.scope }
  } catch {
    return null
  }
}

export function buildUnsubscribeUrl(
  siteUrl: string,
  userid: bigint | string,
  scope: UnsubscribeScope
): string {
  const token = createUnsubscribeToken(userid, scope)
  return `${siteUrl.replace(/\/$/, "")}/unsubscribe/${token}`
}
