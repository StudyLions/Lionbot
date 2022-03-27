import { loadStripe } from "@stripe/stripe-js";
import { IBasket } from "@/models/donationData";

const stripePromise = loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`);

const createPaymentSession = async (id: string, quantity: number) => {
  // Save item in local storage for 'retry' button.
  let basket: IBasket = {
    id: id,
    quantity: quantity
  };
  localStorage.setItem('basket', JSON.stringify(basket))

  // Create Checkout session on backend
  const { sessionId } = await fetch("/api/checkout/session", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ donationID: basket.id, quantity: basket.quantity }),
  }).then((res) => res.json());

  //When the customer clicks on the button, redirect them to Checkout.
  const stripe = await stripePromise;
  await stripe.redirectToCheckout({ sessionId });
};

export default createPaymentSession;
