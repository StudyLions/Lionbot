import {signIn, useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {loadStripe} from "@stripe/stripe-js";

import styles from "./Liongems.module.scss";
import {AmountModal} from "@/components/AmountModal";
import {useState} from "react";
import {DonationsData} from "@/constants/DonationsData";


export default function LionGemsBuySection() {
  const [isAmountDialogVisible, setIsAmountDialogVisible] = useState(true);
  const [currentDonationData, setCurrentDonationData] = useState({amount: 0, tokens: '', tokens_bonus: '0', image: ''})
  const router = useRouter();

  if (router.query.payment) {
    switch (router.query.payment) {
      case "success":
        console.log("payment successes", router.query.session_id);
        break;
      case "failed":
        console.log("payment failed");
        break;
      default:
    }

    router.replace("/liongems", undefined, {shallow: true});
  }

  return (
          <div className={`${styles.buySection}`}>
            {isAmountDialogVisible && <AmountModal
                    onClickOutside={() => setIsAmountDialogVisible(false)} {...currentDonationData}/>}

            <h1 className={`uppercase text-center mt-28 mb-20 font-bold text-7xl ${styles.title}`}>Lion gems</h1>
            <div className={"grid grid-cols-3 xl:gap-x-32 lg:gap-x-20 gap-y-10 items-center place-items-center"}>
              {DonationsData.map((product, index) => (
                      <div
                              className={`rounded-3xl pt-3 h-fit flex flex-col w-full ${styles.donationCard}`}
                              key={product.amount + index}
                      >
                        <img src={product.image} alt={`Tokens ${product.tokens} image`} loading={"lazy"}/>
                        <p className={`text-4xl font-bold text-center ${styles.gems}`}>{product.tokens}</p>
                        <p
                                className={`text-2xl font-bold text-center mb-5 
                                ${product.tokens_bonus ? styles.gemsBonus : "text-transparent"}`}
                        >
                          +{product.tokens_bonus} bonus
                        </p>
                        <a
                                onClick={() => {
                                  setCurrentDonationData(product)
                                  setIsAmountDialogVisible(true)
                                }}
                                className={`rounded-full block text-2xl mx-5 mb-5 text-center py-1 font-bold cursor-pointer
                    ${styles.amountEuros}`}
                        >
                          €{product.amount}
                        </a>
                      </div>
              ))}
            </div>
          </div>
  );
}
