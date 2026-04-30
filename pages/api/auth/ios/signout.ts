// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Best-effort iOS sign-out endpoint. The iOS app calls this
//          before clearing its local Keychain so that a future
//          revocation list (Phase 8 candidate) can be slotted in
//          without changing the iOS contract.
//
//          For now this is a no-op: it verifies the bearer (so we
//          don't accept unauthenticated POSTs as "signed out") and
//          returns { ok: true }. We deliberately do NOT 401 on a
//          missing/invalid token -- the iOS app must always be able
//          to walk away from a broken session, and replying 200 here
//          keeps the client logic dead simple.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { extractBearer, verifyIosBearer } from "@/utils/iosAuth"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const token = extractBearer(req)
  if (token) {
    // Verify just to log if a malformed token slipped through; the
    // verify result is intentionally ignored beyond logging because
    // sign-out must always succeed from the client's perspective.
    const verified = await verifyIosBearer(token)
    if (!verified) {
      console.warn("[ios/signout] received an invalid bearer token")
    }
    // TODO Phase 8: insert into ios_session_revocations(jti, expires_at)
    // and have verifyIosBearer reject revoked tokens.
  }

  return res.status(200).json({ ok: true })
}
