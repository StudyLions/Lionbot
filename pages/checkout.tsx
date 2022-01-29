import Layout from "@/components/layout";
import { loadStripe } from "@stripe/stripe-js";
import DonationCard from "@/components/DonationCard/DonationCard";
import { DonationsData } from "constants/DonationsData";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Checkout() {

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

    <div className={ `container` }>
      <h1 className={ `mt-5 mb-5 text-center` }>Subscription</h1>
      <div className={ `row text-center` }>
        <div className={ `col-4` }>
          1
        </div>
        <div className={ `col-4` }>
          2
        </div>
        <div className={ `col-4` }>
          3
        </div>
      </div>
    </div>
  </Layout>
}
