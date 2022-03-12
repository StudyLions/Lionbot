import { DonationsData } from "@/constants/DonationsData";
import { loadStripe } from "@stripe/stripe-js";
import styles from './Liongems.module.scss'
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function LionGemsBuySection() {
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

  return <div className={ `${ styles.buySection }` }>
    <h1 className={ `uppercase text-center mt-28 mb-20 font-bold text-7xl ${ styles.buySectionTitle }` }>Lion gems</h1>
    <div className={ 'grid grid-cols-3 xl:gap-x-32 lg:gap-x-20 gap-y-10 items-center place-items-center' }>
      { DonationsData.map((product, index) => (
              <div className={ `rounded-3xl pt-3 h-fit flex flex-col w-full ${ styles.donationCard }` }
                   key={ product.amount + index }>
                <Image src={ product.image }
                       alt={ `Tokens ${ product.tokens } image` }
                       width={ 240 }
                       height={ 200 }
                       objectFit={ "contain" }
                />
                <p className={ `text-4xl font-bold text-center ${ styles.gems }` }>{ product.tokens }</p>
                <p className={ `text-2xl font-bold text-center mb-5 
                                ${ product.tokens_bonus ? styles.gemsBonus : 'text-transparent' }` }>
                  +{ product.tokens_bonus } bonus
                </p>
                <a onClick={ () => createPaymentSession(product.amount) }
                   className={ `rounded-full block text-2xl mx-5 mb-5 text-center py-1 font-bold cursor-pointer
                    ${ styles.amountEuros }` }>
                  €{ product.amount }
                </a>
              </div>
      )) }
    </div>
  </div>
}
