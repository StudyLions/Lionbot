// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Owner authorization and same-origin protection for campaign mutations.
// ============================================================
import crypto from "crypto"
import type { NextApiRequest } from "next"
import { getToken } from "next-auth/jwt"
import { getDiscordId } from "@/utils/dashboardAuth"
import { ValidationError } from "@/utils/apiHandler"

export function assertSameOrigin(req: NextApiRequest): void {
  const origin = req.headers.origin
  const host = req.headers.host
  if (!origin || !host || req.headers["sec-fetch-site"] === "cross-site") {
    throw new ValidationError("Please make this request from the LionBot dashboard.", 403)
  }
  try {
    const parsed = new URL(origin)
    if (parsed.host !== host || !["https:", "http:"].includes(parsed.protocol)) throw new Error()
  } catch {
    throw new ValidationError("Please make this request from the LionBot dashboard.", 403)
  }
}

export async function requireCampaignOwner(req: NextApiRequest): Promise<{ userid: string; email: string | null }> {
  const userid = await getDiscordId(req)
  if (!userid) throw new ValidationError("Sign in with the owner Discord account.", 401)
  const owners = (process.env.EMAIL_CAMPAIGN_ALLOWLIST || "757652191656804413").split(",").map((v) => v.trim())
  if (!owners.includes(userid)) throw new ValidationError("Only LionBot's owner can manage email campaigns.", 403)
  if (!["GET", "HEAD"].includes(req.method || "")) assertSameOrigin(req)
  const token = await getToken({ req, secret: process.env.SECRET, cookieName: "__Secure-next-auth.session-token.v2" })
  return { userid, email: typeof token?.email === "string" ? token.email.trim().toLowerCase() : null }
}

export function requireCampaignCron(req: NextApiRequest): void {
  const secret = process.env.CRON_SECRET
  const received = req.headers.authorization || ""
  const expected = secret ? `Bearer ${secret}` : ""
  const receivedBytes = Buffer.from(received)
  const expectedBytes = Buffer.from(expected)
  if (!expected || receivedBytes.length !== expectedBytes.length || !crypto.timingSafeEqual(receivedBytes, expectedBytes)) {
    throw new ValidationError("Unauthorized", 401)
  }
}
