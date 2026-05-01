// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Public listing of approved server profiles. Used by
//          (later) external embed widgets and JSON consumers.
//          The /servers directory page imports the underlying
//          fetcher directly via utils/listingDirectory so it can
//          render at build time with ISR.
//
//          Lightweight enough to be cached at the edge -- 5 min
//          public Cache-Control matches the SSG revalidate on the
//          directory page itself.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { fetchDirectoryListings } from "@/utils/listingDirectory"
import { SERVERS_DIRECTORY_ENABLED } from "@/constants/FeatureFlags"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Feature gate -- see constants/FeatureFlags.ts.
  if (!SERVERS_DIRECTORY_ENABLED) {
    return res.status(404).json({ error: "Not found" })
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).end()
  }
  try {
    const listings = await fetchDirectoryListings()
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return res.status(200).json({ listings })
  } catch (err: any) {
    console.error("[server-listings] directory fetch failed:", err?.message || err)
    return res.status(500).json({ error: "Failed to load directory" })
  }
}
