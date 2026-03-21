// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Proxy to the bot's RenderAPI on the Hetzner server.
//          Fetches bot-rendered profile/stats card PNGs for skin previews.
//          Caches responses for 24 hours.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Use env var instead of hardcoded server IP
// --- Original code (commented out for rollback) ---
// const BOT_RENDER_URL = "http://65.109.163.156:7100";
// --- End original code ---
const BOT_RENDER_URL = process.env.BOT_RENDER_URL;
// --- END AI-MODIFIED ---

const VALID_TYPES = ["profile", "stats"];
const VALID_SKINS = [
  "original", "base", "obsidian", "platinum", "blue_bayoux",
  "boston_blue", "bubble_gum", "cotton_candy", "bubblegum",
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Return 503 if BOT_RENDER_URL not configured
  if (!BOT_RENDER_URL) {
    return res.status(503).json({ error: "Render service not configured" });
  }
  // --- END AI-MODIFIED ---

  const skin = (req.query.skin as string) || "original";
  const type = (req.query.type as string) || "profile";

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }

  if (!VALID_SKINS.includes(skin)) {
    return res.status(400).json({ error: "Invalid skin" });
  }

  try {
    const url = `${BOT_RENDER_URL}/render-sample?type=${encodeURIComponent(type)}&skin=${encodeURIComponent(skin)}`;
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Add BOT_RENDER_AUTH header for authenticated render API calls
    const headers: Record<string, string> = {};
    if (process.env.BOT_RENDER_AUTH) headers["Authorization"] = process.env.BOT_RENDER_AUTH;
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Don't leak raw upstream error text to client
    if (!response.ok) {
      console.error(`Skin preview render error (${response.status}):`, await response.text().catch(() => ""))
      return res.status(502).json({ error: "Render service returned an error" });
    }
    // --- END AI-MODIFIED ---

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600");
    res.send(buffer);
  } catch (err: any) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      return res.status(504).json({ error: "Bot render server timeout" });
    }
    return res.status(502).json({ error: "Could not reach bot render server" });
  }
}
