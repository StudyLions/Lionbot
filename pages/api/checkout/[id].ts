import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getToken } from "next-auth/jwt";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

const secret = process.env.SECRET;

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: added auth check, method validation, and error handling
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = await getToken({ req, secret });
    if (!token?.sub) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing session ID" });
    }

    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ["payment_intent"],
    });

    res.status(200).json({ session });
  } catch (err: any) {
    console.error("Checkout retrieve error:", err);
    res.status(500).json({ error: "Failed to retrieve checkout session" });
  }
};
// --- END AI-MODIFIED ---
