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
    const userID = await getToken({ req, secret });
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

    const { donationID, quantity } = req.body;

    if (!donationID || !quantity || quantity < 1 || quantity > 100) {
      return res.status(400).json({ error: "Invalid donation parameters" });
    }

    const donationInfo: any = DonationsData.find((d) => d.id == donationID);
    if (!donationInfo) {
      return res.status(400).json({ error: "Invalid donation ID" });
    }

    const totalGems = (donationInfo.tokens + donationInfo.tokens_bonus) * quantity;

    const session = await stripe.checkout.sessions.create({
      submit_type: "auto",
      payment_method_types: ["card"],
      line_items: [
        {
          name: `Donation ${userID.name} (${userID.sub})`,
          amount: donationInfo.amount * 100,
          currency: "eur",
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
      success_url: `${req.headers.origin + NavigationPaths.donate}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin + NavigationPaths.donate}?payment=failed`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Checkout session error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};
// --- END AI-MODIFIED ---
