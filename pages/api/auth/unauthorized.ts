// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Returns 401 JSON response for unauthenticated API
//          requests. Used as a rewrite target from middleware.js
//          because Next.js 12 middleware cannot return response bodies.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(401).json({ error: "Not authenticated. Please sign in with Discord." });
}
