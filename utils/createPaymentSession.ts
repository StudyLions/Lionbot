import { loadStripe } from "@stripe/stripe-js";
import { IBasket } from "@/models/donation";
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Import Currency type for dual-currency support
import type { Currency } from "@/hooks/useCurrency";
// --- END AI-MODIFIED ---

const stripePromise = loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`);

// --- AI-REPLACED (2026-03-24) ---
// Reason: Add currency parameter to pass selected currency to checkout API
// What the new code does better: supports EUR/USD currency selection
// --- Original code (commented out for rollback) ---
// const createPaymentSession = async (id: string, quantity: number) => {
// --- End original code ---
const createPaymentSession = async (id: string, quantity: number, currency: Currency = "eur") => {
// --- END AI-REPLACED ---
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
    body: JSON.stringify({ donationID: basket.id, quantity: basket.quantity, currency }),
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
