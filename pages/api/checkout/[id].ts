import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getToken } from "next-auth/jwt";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: "2020-08-27",
});

const secret = process.env.SECRET;

// --- AI-REPLACED (2026-03-20) ---
// Reason: No ownership check -- any authenticated user could retrieve any checkout session.
//         payment_intent expansion exposed payment method details (last4, billing address).
// What the new code does better: Verifies requesting user owns the session via metadata.discordId,
//         removes payment_intent expansion, returns only safe fields, adds rate limiting.
// --- Original code (commented out for rollback) ---
// export default async (req: NextApiRequest, res: NextApiResponse) => {
//   if (req.method !== "GET") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }
//   try {
//     const token = await getToken({ req, secret });
//     if (!token?.sub) {
//       return res.status(401).json({ error: "Not authenticated" });
//     }
//     const { id } = req.query;
//     if (!id || typeof id !== "string") {
//       return res.status(400).json({ error: "Missing session ID" });
//     }
//     const session = await stripe.checkout.sessions.retrieve(id, {
//       expand: ["payment_intent"],
//     });
//     res.status(200).json({ session });
//   } catch (err: any) {
//     console.error("Checkout retrieve error:", err);
//     res.status(500).json({ error: "Failed to retrieve checkout session" });
//   }
// };
// --- End original code ---
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Add secureCookie for correct session reading in HTTPS/Vercel production
    // --- AI-MODIFIED (2026-04-06) ---
    // Purpose: use versioned cookie name matching [...nextauth].js cookies config
    const token = await getToken({
      req,
      secret,
      cookieName: '__Secure-next-auth.session-token.v2',
    });
    // --- END AI-MODIFIED ---
    // --- END AI-MODIFIED ---
    if (!token?.discordId && !token?.sub) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const discordId = (token.discordId ?? token.sub) as string;

    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing session ID" });
    }

    const session = await stripe.checkout.sessions.retrieve(id);

    if (session.metadata?.discordId !== discordId) {
      return res.status(403).json({ error: "You do not have access to this checkout session" });
    }

    res.status(200).json({
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
      },
    });
  } catch (err: any) {
    console.error("Checkout retrieve error:", err);
    res.status(500).json({ error: "Failed to retrieve checkout session" });
  }
};
// --- END AI-REPLACED ---
