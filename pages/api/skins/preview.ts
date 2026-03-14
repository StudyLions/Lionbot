// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Public API to serve bot-rendered skin preview images
//          (sample data, no auth required)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"

const BOT_RENDER_URL = process.env.BOT_RENDER_URL || "http://65.109.163.156:7100"
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""

const SKIN_ID_MAP: Record<string, string> = {
  base: "original",
}

const previewCache = new Map<string, { data: Buffer; expiresAt: number }>()
const CACHE_TTL = 3600000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const skinParam = String(req.query.skin ?? "original")
  const typeParam = String(req.query.type ?? "profile")
  const botSkinId = SKIN_ID_MAP[skinParam] ?? skinParam

  const cacheKey = `${typeParam}-${botSkinId}`
  const cached = previewCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400")
    return res.send(cached.data)
  }

  try {
    const params = new URLSearchParams({ type: typeParam, skin: botSkinId })
    const headers: Record<string, string> = {}
    if (BOT_RENDER_AUTH) headers["Authorization"] = BOT_RENDER_AUTH

    const response = await fetch(`${BOT_RENDER_URL}/render-sample?${params}`, {
      headers,
      signal: AbortSignal.timeout(20000),
    })

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: `Render failed: ${text}` })
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    previewCache.set(cacheKey, { data: buffer, expiresAt: Date.now() + CACHE_TTL })

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400")
    return res.send(buffer)
  } catch {
    return res.status(503).json({ error: "Skin preview service unavailable" })
  }
}
