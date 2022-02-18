import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getToken } from "next-auth/jwt";

import { DonationsData } from "constants/DonationsData";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
})

const secret = process.env.SECRET

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const userID = (await getToken({req, secret}))
  const { quantity, amount } = req.body;

  const donationInfo: any  = DonationsData.find(d => d.amount == amount)

  const session = await stripe.checkout.sessions.create({
    submit_type: 'auto',
    payment_method_types: ['card'],
    line_items: [{
      name: `Donation ${userID.name} (${userID.sub})`,
      amount: amount * 100, // we multiply by 100 because the amount must be in cents.
      currency: 'eur',
      quantity: quantity,
      description: `Tokens: ${donationInfo.tokens + donationInfo.tokens_bonus}`,
    }],
    mode: 'payment',
    success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}/checkout`,
  })
  res.status(200).json({ sessionId: session.id })
}
