import Layout from "@/components/layout";
import { loadStripe } from "@stripe/stripe-js";
import { DonationsData } from "constants/DonationsData";
import DonationCard from "@/components/DonationCard/DonationCard";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function SupportUS() {

  const createPaymentSession = async (price: number) => {
    // Create Checkout session on backend
    const { sessionId } = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: {
        'content-type': "application/json",
      },
      body: JSON.stringify({ quantity: 1, amount: price })
    }).then(res => res.json());

    //When the customer clicks on the button, redirect them to Checkout.
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });
  }

  return <Layout>
    <div className={ `container` }>
      <h1 className={ `mb-5 text-center` }>Support Discord.study Development</h1>
      <div style={ { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "30px", justifyItems: 'center' } }>
        { DonationsData.map((product, index) => (
                <DonationCard onSelect={ createPaymentSession } { ...product } key={ index }/>
        )) }
      </div>
    </div>
  </Layout>
}
