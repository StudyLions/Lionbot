import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getToken } from "next-auth/jwt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
})

const secret = process.env.SECRET

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const userID = (await getToken({req, secret}))
  const { quantity } = req.body;

  const session = await stripe.checkout.sessions.create({
    submit_type: 'donate',
    payment_method_types: ['card'],
    line_items: [{
      name: `Donation ${userID.name} (${userID.sub})`,
      amount: 3350,
      currency: 'eur',
      quantity: quantity,
      description: 'Total - 33$ for 3000 tokens',
    }],
    mode: 'payment',
    success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}/checkout`,
  })
  res.status(200).json({ sessionId: session.id })
}
