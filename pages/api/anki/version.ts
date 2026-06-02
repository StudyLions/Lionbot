// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Addon update / version-check endpoint. The Anki
//          addon hits this on startup (24h cache) to learn:
//            - latest available version
//            - minimum supported version (below this -> blocking
//              modal: update required)
//            - download URL + changelog URL
//
//          Public — no auth required. The addon may not even be
//          paired yet when it calls this.
//
//          Values are sourced from env vars so we can ratchet
//          min_supported as we deprecate old addon versions
//          without redeploying code:
//            ANKI_ADDON_LATEST_VERSION (default: "0.1.0")
//            ANKI_ADDON_MIN_VERSION    (default: "0.1.0")
//            ANKI_ADDON_DOWNLOAD_URL   (default: lionbot.org/anki/download)
//            ANKI_ADDON_CHANGELOG_URL  (default: github releases)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed", message: "GET only" })
  }

  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
  return res.status(200).json({
    latest: process.env.ANKI_ADDON_LATEST_VERSION || "0.1.0",
    min_supported: process.env.ANKI_ADDON_MIN_VERSION || "0.1.0",
    download_url:
      process.env.ANKI_ADDON_DOWNLOAD_URL ||
      "https://lionbot-website.vercel.app/anki/download",
    changelog_url:
      process.env.ANKI_ADDON_CHANGELOG_URL ||
      "https://github.com/StudyLions/lionbot-anki-addon/releases",
  })
}
