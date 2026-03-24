import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getToken } from "next-auth/jwt";

import { DonationsData } from "constants/DonationsData";
import { NavigationPaths } from "constants/types";
import numberWithCommas from "@/utils/numberWithCommas";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

const secret = process.env.SECRET;

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: added auth check, method validation, input validation, rate limiting, and error handling
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Add secureCookie for correct session reading in HTTPS/Vercel production
    const userID = await getToken({
      req,
      secret,
      secureCookie: process.env.NEXTAUTH_URL?.startsWith("https://") ?? !!process.env.VERCEL_URL,
    });
    // --- END AI-MODIFIED ---
    if (!userID?.sub || !userID?.name) {
      return res.status(401).json({ error: "Not authenticated. Please sign in." });
    }

    const userId = String(userID.sub);
    const now = Date.now();
    const rl = rateLimits.get(userId);
    if (rl && now < rl.resetAt && rl.count >= 10) {
      return res.status(429).json({ error: "Too many requests. Try again later." });
    }
    if (!rl || now >= rl.resetAt) {
      rateLimits.set(userId, { count: 1, resetAt: now + 60000 });
    } else {
      rl.count++;
    }

    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Accept currency parameter for dual-currency checkout
    const { donationID, quantity, currency: rawCurrency } = req.body;
    const currency = rawCurrency === "usd" ? "usd" : "eur";
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Validate quantity is a positive integer (not decimal/NaN)
    if (!donationID || !quantity || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return res.status(400).json({ error: "Invalid donation parameters" });
    }
    // --- END AI-MODIFIED ---

    const donationInfo: any = DonationsData.find((d) => d.id == donationID);
    if (!donationInfo) {
      return res.status(400).json({ error: "Invalid donation ID" });
    }

    const totalGems = (donationInfo.tokens + donationInfo.tokens_bonus) * quantity;
    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Use correct amount for selected currency
    const unitAmount = Math.round((currency === "usd" ? donationInfo.amount_usd : donationInfo.amount) * 100);
    // --- END AI-MODIFIED ---

    const session = await stripe.checkout.sessions.create({
      submit_type: "auto",
      payment_method_types: ["card"],
      line_items: [
        {
          name: `Donation ${userID.name} (${userID.sub})`,
          amount: unitAmount,
          currency,
          quantity: quantity,
          description: `Total tokens: ${numberWithCommas(totalGems)}`,
        },
      ],
      metadata: {
        discordId: userId,
        discordName: String(userID.name),
        donationID: donationID,
        totalGems: String(totalGems),
      },
      mode: "payment",
      // --- AI-MODIFIED (2026-03-20) ---
      // Purpose: Safe fallback chain instead of raw req.headers.origin which may be undefined
      success_url: `${(req.headers.origin || process.env.NEXTAUTH_URL || "https://lionbot-website.vercel.app") + NavigationPaths.donate}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${(req.headers.origin || process.env.NEXTAUTH_URL || "https://lionbot-website.vercel.app") + NavigationPaths.donate}?payment=failed`,
      // --- END AI-MODIFIED ---
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Checkout session error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};
// --- END AI-MODIFIED ---
