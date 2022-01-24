import Layout from "@/components/layout";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Checkout() {
  const handleClick = async (event) => {
    // Call your backend to create the Checkout session
    const { sessionId } = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: {
        'content-type': "application/json",
      },
      body: JSON.stringify({ quantity: 25 })
    }).then(res => res.json());
    //When the customer clicks on the button, redirect them to Checkout.
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });
  }

  return <Layout>
    <h1>Checkout</h1>

    <button role="link" onClick={ handleClick }>
      Checkout
    </button>
  </Layout>
}
