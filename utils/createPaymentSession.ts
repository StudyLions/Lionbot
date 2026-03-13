import { loadStripe } from "@stripe/stripe-js";
import { IBasket } from "@/models/donation";

const stripePromise = loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`);

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: added response validation and error handling before redirecting to Stripe
const createPaymentSession = async (id: string, quantity: number) => {
  let basket: IBasket = {
    id: id,
    quantity: quantity,
  };
  localStorage.setItem("basket", JSON.stringify(basket));

  const res = await fetch("/api/checkout/session", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ donationID: basket.id, quantity: basket.quantity }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to create checkout session. Please try again.");
  }

  const { sessionId } = await res.json();

  if (!sessionId) {
    throw new Error("No session ID returned. Please try again.");
  }

  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error("Payment system unavailable. Please try again later.");
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    throw new Error(error.message || "Failed to redirect to checkout.");
  }
};
// --- END AI-MODIFIED ---

export default createPaymentSession;
