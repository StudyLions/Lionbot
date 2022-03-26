import { signIn } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`);

const createPaymentSession = async (price: number, session: any, amount: number) => {
  //Redirect user if is not logged.
  if (!session) {
    await signIn("discord");
    return;
  }

  // Create Checkout session on backend
  const { sessionId } = await fetch("/api/checkout/session", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ quantity: 1, amount: price }),
  }).then((res) => res.json());

  //When the customer clicks on the button, redirect them to Checkout.
  const stripe = await stripePromise;
  await stripe.redirectToCheckout({ sessionId });
};

export default createPaymentSession;
