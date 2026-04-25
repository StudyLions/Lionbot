// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Singleton Resend client. Reads RESEND_API_KEY at first
//          access. Throws a friendly error if the key is missing
//          so build-time imports do not blow up the whole bundle.
// ============================================================
import { Resend } from "resend"

let cached: Resend | null = null

export function getResend(): Resend {
  if (cached) return cached

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error(
      "[email] RESEND_API_KEY is not set. Add it to your environment variables before sending emails."
    )
  }
  cached = new Resend(apiKey)
  return cached
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}
