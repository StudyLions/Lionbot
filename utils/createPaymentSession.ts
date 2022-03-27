import { signIn, useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`);

const createPaymentSession = async (id: string, quantity: number) => {

  // Create Checkout session on backend
  const { sessionId } = await fetch("/api/checkout/session", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ donationID: id, quantity: quantity }),
  }).then((res) => res.json());

  //When the customer clicks on the button, redirect them to Checkout.
  const stripe = await stripePromise;
  await stripe.redirectToCheckout({ sessionId });
};

export default createPaymentSession;
