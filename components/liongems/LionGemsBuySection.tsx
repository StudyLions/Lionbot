import {useRouter} from "next/router";

import styles from "./Liongems.module.scss";
import {AmountModal} from "@/components/AmountModal";
import {useEffect, useState} from "react";
import {DonationsData} from "@/constants/DonationsData";
import {signIn, useSession} from "next-auth/react";
import numberWithCommas from "../../utils/numberWithCommas";
import {PurchaseFailedModal} from "@/components/PurchaseFailedModal";
import {PurchaseCompleteModal} from "@/components/PurchaseCompleteModal";


export default function LionGemsBuySection() {
  const {data: session} = useSession()
  const [isAmountModalVisible, setIsAmountModalVisible] = useState(false);
  const [isPurchaseFailedVisible, setIsPurchaseFailedVisible] = useState(false);
  const [isPurchaseCompleteVisible, setIsPurchaseCompleteVisible] = useState(false);
  const [currentDonationData, setCurrentDonationData] = useState(null)
  const router = useRouter();

  useEffect((() => {
    switch (router.query.payment) {
      case "success":
        setIsPurchaseCompleteVisible(true);
        break;
      case "failed":
        setIsPurchaseFailedVisible(true);
        break;
      default:
    }
    router.replace("/liongems", undefined, {shallow: true});
  }), [router.query.payment])

  return (
          <>
            {isAmountModalVisible && <AmountModal
                    closeModal={() => setIsAmountModalVisible(false)} {...currentDonationData}/>}
            {isPurchaseFailedVisible && <PurchaseFailedModal
                    closeModal={() => setIsPurchaseFailedVisible(false)}/>}
            {isPurchaseCompleteVisible && <PurchaseCompleteModal
                    closeModal={() => setIsPurchaseCompleteVisible(false)}/>}


            <div className={`${styles.buySection}`}>
              <h1 className={`uppercase text-center mt-28 mb-20 font-bold text-7xl ${styles.title}`}>Lion gems</h1>
              <div className={"grid grid-cols-3 xl:gap-x-32 lg:gap-x-20 gap-y-10 items-center place-items-center"}>
                {DonationsData.map((product, index) => (
                        <div className={`rounded-3xl pt-3 h-fit flex flex-col w-full ${styles.donationCard}`}
                             key={product.amount + index}
                        >
                          <img src={product.image} alt={`Tokens ${product.tokens} image`} loading={"lazy"}/>
                          <p className={`text-4xl font-bold text-center ${styles.gems}`}>{numberWithCommas(product.tokens)}</p>
                          <p className={`text-2xl font-bold text-center mb-5 ${+product.tokens_bonus ? styles.gemsBonus : "text-transparent"}`}>
                            +{numberWithCommas(product.tokens_bonus)} bonus
                          </p>
                          <a onClick={() => {
                            //Redirect user if is not logged.
                            if (!session) {
                              signIn("discord");
                              return;
                            }
                            setCurrentDonationData(product)
                            setIsAmountModalVisible(true)
                          }}
                             className={`rounded-full block text-2xl mx-5 mb-5 text-center py-1 font-bold cursor-pointer
                             bg-red20 hover:bg-red04`}
                          >
                            €{product.amount}
                          </a>
                        </div>
                ))}
              </div>
            </div>
          </>
  );
}
