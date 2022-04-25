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

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const userID = await getToken({ req, secret });
  const { donationID, quantity } = req.body;

  const donationInfo: any = DonationsData.find((d) => d.id == donationID);

  const session = await stripe.checkout.sessions.create({
    submit_type: "auto",
    payment_method_types: ["card"],
    line_items: [
      {
        name: `Donation ${userID.name} (${userID.sub})`,
        amount: donationInfo.amount * 100, // we multiply by 100 because the amount must be in cents.
        currency: "eur",
        quantity: quantity,
        description: `Total tokens: ${numberWithCommas((donationInfo.tokens + donationInfo.tokens_bonus) * quantity)}`,
      },
    ],
    mode: "payment",
    success_url: `${req.headers.origin + NavigationPaths.donate}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin + NavigationPaths.donate}?payment=failed`,
  });
  res.status(200).json({ sessionId: session.id });
};
