// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-11
// Purpose: LionGems checkout for the Anki addon — the purchase path
//          for users WITHOUT a website session (email accounts have
//          no Discord OAuth, so /donate and /api/checkout/session
//          are unreachable for them). Works identically for
//          Discord-paired devices.
//
//          GET  -> public pack catalog (DonationsData minus the
//                  webpack image refs): id, gems, bonus, total,
//                  price_eur, price_usd. No auth — it's the same
//                  public pricing the donate page shows.
//          POST -> bearer-authed (anki.pet.write) + rate-limited.
//                  Creates a Stripe Checkout Session with the SAME
//                  metadata contract as the website flow
//                  ({discordId, discordName, donationID, totalGems})
//                  so the existing /api/webhook/stripe
//                  handleOneTimeGemPurchase credits it with ZERO
//                  changes — it BigInts metadata.discordId, which is
//                  simply the bearer's userid (synthetic ids from the
//                  email-account band work unchanged). Returns the
//                  hosted checkout URL for the addon to open in the
//                  system browser; success/cancel land on the public
//                  /anki/payment-complete page (no login needed).
//
//          Server-authoritative: pack id -> price/gems resolved
//          here from DonationsData; the client can't influence
//          amounts beyond picking a pack and quantity (1..100,
//          mirroring the web route's bounds).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { ankiRateLimit } from "@/lib/anki/rateLimit"
import { DonationsData } from "constants/DonationsData"
import numberWithCommas from "@/utils/numberWithCommas"

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
})

interface CheckoutBody {
  donationID?: string
  quantity?: number
  currency?: string
}

function sendError(
  res: NextApiResponse,
  status: number,
  error: string,
  message: string
) {
  return res.status(status).json({ error, message })
}

function packCatalog() {
  return DonationsData.map((d) => ({
    id: d.id,
    gems: d.tokens,
    gems_bonus: d.tokens_bonus,
    gems_total: d.tokens + d.tokens_bonus,
    price_eur: d.amount,
    price_usd: d.amount_usd,
  }))
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
    return res.status(200).json({ packs: packCatalog() })
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST")
    return sendError(res, 405, "method_not_allowed", "GET or POST only")
  }

  const ctx = await requireAnkiAuth(req, res, "anki.pet.write")
  if (!ctx) return

  // Same budget as the website checkout: 10 session creations/min.
  const rl = ankiRateLimit(ctx.userId, "checkout-gems", 10, 60_000)
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return sendError(res, 429, "rate_limited", "Too many checkout attempts — slow down.")
  }

  const body = (req.body || {}) as CheckoutBody
  const currency = body.currency === "usd" ? "usd" : "eur"
  const quantity = body.quantity ?? 1
  if (!body.donationID || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return sendError(res, 400, "bad_request", "Invalid pack or quantity")
  }

  const pack = DonationsData.find((d) => d.id === body.donationID)
  if (!pack) {
    return sendError(res, 400, "bad_pack", "Unknown gem pack")
  }

  const totalGems = (pack.tokens + pack.tokens_bonus) * quantity
  const unitAmount = Math.round((currency === "usd" ? pack.amount_usd : pack.amount) * 100)

  // Display label for Stripe bookkeeping (mirrors the web flow's
  // "Donation <name> (<id>)" line items so the dashboard reads the same).
  let label = "LionGotchi player"
  try {
    const cfg = await prisma.user_config.findUnique({
      where: { userid: ctx.userId },
      select: { name: true },
    })
    if (cfg?.name) label = cfg.name
  } catch {
    /* label is cosmetic — never block checkout on it */
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://lionbot.org"

  try {
    const session = await stripe.checkout.sessions.create({
      submit_type: "auto",
      payment_method_types: ["card"],
      line_items: [
        {
          name: `Donation ${label} (${ctx.userId.toString()})`,
          amount: unitAmount,
          currency,
          quantity,
          description: `Total tokens: ${numberWithCommas(totalGems)}`,
        },
      ],
      metadata: {
        // Same keys the website flow sets — the webhook's
        // handleOneTimeGemPurchase contract. "discordId" is historic
        // naming; it is the LionBot userid (synthetic for email accounts).
        discordId: ctx.userId.toString(),
        discordName: label,
        donationID: pack.id,
        totalGems: String(totalGems),
        source: "anki_addon",
      },
      mode: "payment",
      automatic_tax: { enabled: false },
      success_url: `${baseUrl}/anki/payment-complete?status=success`,
      cancel_url: `${baseUrl}/anki/payment-complete?status=cancelled`,
    })

    if (!session.url) {
      console.error("[anki/checkout-gems] session created without url:", session.id)
      return sendError(res, 503, "checkout_unavailable", "Couldn't start the checkout — try again")
    }
    return res.status(200).json({
      status: "ok",
      url: session.url,
      session_id: session.id,
      gems_total: totalGems,
    })
  } catch (err) {
    console.error("[anki/checkout-gems] session create failed:", err)
    return sendError(res, 503, "checkout_unavailable", "Couldn't start the checkout — try again")
  }
}
