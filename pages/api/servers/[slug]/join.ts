// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Tracked invite redirect for /servers/[slug] join CTAs.
//          Logs an `invite_click` event in server_listing_analytics
//          (best-effort, non-blocking), increments the cached
//          counter on the listing row, and 302-redirects to the
//          discord.gg invite. Falls back to a 404 page when the
//          slug doesn't exist or the listing has no invite yet.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { SERVERS_DIRECTORY_ENABLED } from "@/constants/FeatureFlags"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Feature gate -- see constants/FeatureFlags.ts.
  if (!SERVERS_DIRECTORY_ENABLED) {
    return res.status(404).end()
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).end()
  }

  const slug = String(req.query.slug ?? "").toLowerCase().trim()
  if (!slug) return res.status(404).end()

  const listing = await prisma.server_listings.findUnique({
    where: { slug },
    select: { guildid: true, status: true, invite_code: true },
  })

  if (!listing || !listing.invite_code) {
    return res.redirect(302, `/servers/${slug}?missing=invite`)
  }

  // Only redirect for publicly-visible listings. Drafts/rejected/archived
  // never expose their invite via the public route.
  if (!["APPROVED", "EXPIRED"].includes(listing.status)) {
    return res.redirect(302, `/servers/${slug}?missing=invite`)
  }

  // Fire-and-forget analytics. We don't await -- the user gets
  // their redirect immediately and any DB hiccup never blocks the join.
  const referrer = req.headers.referer || null
  const country = (req.headers["x-vercel-ip-country"] as string) || null
  void prisma.$transaction([
    prisma.server_listings.update({
      where: { guildid: listing.guildid },
      data: { invite_click_count: { increment: 1 } },
    }),
    prisma.server_listing_analytics.create({
      data: {
        guildid: listing.guildid,
        event_type: "invite_click",
        referrer: referrer ? referrer.slice(0, 500) : null,
        country: country ? country.slice(0, 8) : null,
      },
    }),
  ]).catch((err) => {
    console.warn("[server-listings] join analytics failed:", err?.message || err)
  })

  return res.redirect(302, `https://discord.gg/${listing.invite_code}`)
}
