// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Returns 401 JSON response for unauthenticated API
//          requests. Used as a rewrite target from middleware.js
//          because Next.js 12 middleware cannot return response bodies.
// ============================================================
// --- AI-MODIFIED (2026-05-01) ---
// Purpose: Add `code: "SESSION_EXPIRED"` so the client-side dashboard
// fetcher can transparently redirect the user to /api/auth/signin
// instead of rendering a confusing "Internal Server Error" toast.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(401).json({
    error: "Your sign-in has expired. Please sign in with Discord again.",
    code: "SESSION_EXPIRED",
  });
}
// --- END AI-MODIFIED ---
